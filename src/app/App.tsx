import React from 'react'
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';

import NewExaminPanel from './components/NewExaminPanel';

const App = () => {

  const theme = createMuiTheme({
    palette: {
      primary: {
        main: '#272839',
      },
      secondary: {
        light: '#0C4B40',
        main: '#50fa7b',
      }
    }
  });

  return (
    <div>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NewExaminPanel />      
      </ThemeProvider>
    </div>
  )
}

export default App;
