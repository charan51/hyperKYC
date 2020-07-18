import React from 'react';
import './App.css';
import axios from 'axios';
import { useMediaQuery, CssBaseline } from '@material-ui/core';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Home from './home';
import Login from './login';
import RegisterKYC from './registerKYC';
import ViewAll from './viewAll';
import Register from './registerUser';
import SearchKYC from './searchKYC';
import View from './view';
import Header from './header';
function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Header />
        <Switch>
          <Route path="/login" component={Login}></Route>
          <Route path='/registerKYC' component={RegisterKYC}></Route>
          <Route path="/viewAll" component={ViewAll}></Route>
          <Route path="/register" component={Register}></Route>
          <Route path="/searchKYC" component={SearchKYC}></Route>
          <Route path="/query/:kycID" component={View}></Route>
          <Route exact path="/" component={Home}></Route>
        </Switch>
      </BrowserRouter>
    </ThemeProvider>
  );
}
export default App;
