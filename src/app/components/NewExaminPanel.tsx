import React, { useState, useEffect } from "react";
import clsx from "clsx";
import { useTheme } from "@material-ui/core/styles";
import {
  AppBar,
  Box,
  Grid,
  Tabs,
  Tab,
  Typography,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Button,
} from "@material-ui/core";
import Howto from "./Howto";

import { useStyles } from "./ExaminPanel-Style";
import Editor from "./Editor";

function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const ExaminPanel = () => {
  // MaterialUI Styling Hook ---------------------------------------
  const classes = useStyles();
  const theme = useTheme();
  // ---------------------------------------------------------------

  // Stateful functions for handling Tab Logic ---------------------
  const [tab, setTab] = useState(0);

  const handleChange = (event: React.ChangeEvent<{}>, newTab: number) => {
    setTab(newTab);
  };
  // ---------------------------------------------------------------

  // Get component names and tests ---------------------------------
  const [code, setCode] = useState("// No tests yet, select a component to start");
  const [componentNames, setComponentNames] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState("");
  const [testName, setTestName] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [events, setEvents] = useState([] as string[]);
  const [beforeDOM, setBeforeDOM] = useState([] as string[]);
  const [afterDOM, setAfterDOM] = useState([] as string[]);
  // console.log(`\nselected component: `, selectedComponent, `\ntest name: `, testName, `\nis recording: `, isPlaying, `\ncomponents: `, componentNames, `\nevents so far: `, events);

  const port = chrome.runtime.connect({ name: "examin-demo" });

  useEffect(() => {
    port.postMessage({
      name: "connect",
      tabId: chrome.devtools.inspectedWindow.tabId,
    });

    port.onMessage.addListener((message) => {
      if (message.type === "components") {
        setComponentNames(message.message);
      } else if (message.type === "newTestStep") {
        setEvents(prevState => [...prevState, message.message]);
      } else if (message.type === "beforeDOM") {
        setBeforeDOM(message.message);
      } else if (message.type === "afterDOM") {
        setAfterDOM(message.message);
      }
    });
  }, []);
  // ---------------------------------------------------------------  

  // Handle update name of the test --------------------------------
  const handleTestNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTestName(event.target.value);
  };
  // ---------------------------------------------------------------

  // Handle update test selected -----------------------------------
  const handleSelectedTestChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedComponent(componentNames[event.target.value]);
    port.postMessage({
      name: "selectedComponent",
      tabId: chrome.devtools.inspectedWindow.tabId,
      message: event.target.value
    });
  };
  // ---------------------------------------------------------------

  // Play / Stop recording button ----------------------------------

  const onToggleRecording = () => {
    if (!isPlaying) {
      // Before everything, save the current state of the DOM

      // Send message to add listeners
      port.postMessage({
        name: "recordClicked",
        tabId: chrome.devtools.inspectedWindow.tabId,
      });
    } else {
      // After everything, save the current state of the DOM

      // Send message to remove listeners
      port.postMessage({
        name: "pauseClicked",
        tabId: chrome.devtools.inspectedWindow.tabId,
      });
      const { given, then } = createGivenThenSteps(beforeDOM, afterDOM);
      createTestString(selectedComponent, testName, events, given, then);
    }
    setIsPlaying(!isPlaying);
  };
  // ---------------------------------------------------------------

  // Create test string --------------------------------------------
  const createTestString = (componentName: string, testName: string, steps: string[], given: string[], then: string[]) => {
    // TODO: handle imports and component rendering
    const indentedSteps = indent(steps.join("\n"), 1, 2);
    const givenSteps = indent(given.join("\n"), 1, 2);
    const thenSteps = indent(then.join("\n"), 1, 2);
    const finalText = `
describe('${componentName} Component', () => {
  it('${testName}', () => {
  ${givenSteps}
  ${indentedSteps}
  ${thenSteps}
  });
});`;
    setCode(finalText);
  }

  function indent(str, numOfIndents, opt_spacesPerIndent) {
    str = str.replace(/^(?=.)/gm, new Array(numOfIndents + 1).join('\t'));
    numOfIndents = new Array(opt_spacesPerIndent + 1 || 0).join(' '); // re-use
    return opt_spacesPerIndent
      ? str.replace(/^\t+/g, function(tabs) {
          return tabs.replace(/./g, numOfIndents);
      })
      : str;
  }

  // ---------------------------------------------------------------

  // Create given/then test steps ----------------------------------
  const createGivenThenSteps = (beforeDOM: string[], afterDOM: string[]) => {
    const given = beforeDOM;
    const then = afterDOM;
    for (let i = 0; i < afterDOM.length; i++) {
      if (beforeDOM.includes(afterDOM[i])) {
        const indexA = given.indexOf(afterDOM[i]);
        given.splice(indexA, 1);
        const indexB = then.indexOf(afterDOM[i]);
        then.splice(indexB, 1);
      }
    }
    console.log(given, then);
    return { given, then };
  }

  // ---------------------------------------------------------------



  return (
    <div className={classes.root}>
      <AppBar
        position='fixed'
        className={clsx(classes.appBar)}
      >
        <Grid container justify='space-between' alignItems='center'>
          <Grid item>
            <Box style={{ marginLeft: theme.spacing(2) }}>
              <img
                className={classes.logo}
                src='../assets/examin-small.svg'
                alt='Examin Logo'
              />
            </Box>
          </Grid>
          <Grid item>
            <Tabs
              value={tab}
              onChange={handleChange}
              aria-label='simple tabs example'
            >
              <Tab label='Create' />
              <Tab label='How to use' />
            </Tabs>
          </Grid>
        </Grid>
      </AppBar>

      <TabPanel
        value={tab}
        index={0}
        className={clsx(classes.content)}
      >
        <FormControl component="form" fullWidth>
          <Typography className={classes.section}>Choose the component you want to test</Typography>
          <Select
            labelId="select-label"
            id="select-component"
            onChange={handleSelectedTestChange}
            variant="outlined"
          >
            {componentNames.map((name, index) => (
              <MenuItem key={`${name}${index}`} value={index}>{name}</MenuItem>
          ))}
          </Select>

          <Typography className={classes.section}>Give a name to your test</Typography>
          <TextField id="input-test-name" variant="outlined" onChange={handleTestNameChange} value={testName} />

          <Button
            variant="outlined"
            className={classes.section}
            onClick={onToggleRecording}
          >
            {!isPlaying ? "Start recording" : "Stop recording"}
          </Button>

          <Typography className={classes.section}>Here is your test suite</Typography>
          <Editor language="javascript" value={code}></Editor>
        </FormControl>
      </TabPanel>
      
      {/* How to use */}
      <TabPanel
        value={tab}
        index={1}
        className={clsx(classes.content)}
      >
        <Howto />
      </TabPanel>
    </div>
  );
};

export default ExaminPanel;
