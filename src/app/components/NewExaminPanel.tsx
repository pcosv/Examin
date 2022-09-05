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
  InputLabel,
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
            onChange={() => void 0}
            variant="outlined"
          >
            <MenuItem value="Component 1">Component 1</MenuItem>
            <MenuItem value="Component 2">Component 2</MenuItem>
            <MenuItem value="Component 3">Component 3</MenuItem>
          </Select>

          <Typography className={classes.section}>Give a name to your test</Typography>
          <TextField id="input-test-name" variant="outlined" />

          <Button variant="outlined" className={classes.section}>Start recording</Button>

          <Typography className={classes.section}>Here is your test suite</Typography>
          <Editor language="javascript" value='// No tests yet, select a component to start'></Editor>
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
