import React from 'react';
import './App.css';
import { createBrowserHistory } from "history";
import { Router, Switch, Route } from "react-router-dom";
import HomePage from './pages/HomePage/HomePage';
// import RedirectPage from './pages/RedirectPage/RedirectPage';

const history = createBrowserHistory();

type AppProps = {
};

type AppState = {
};

export default class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
      super(props);
  }

  render() {
      return (
        <Router history={history}>
          <Switch>
            <Route path="/">
              <div className="App">
                <HomePage />
              </div>
            </Route>
          </Switch>
        </Router>
      );
  }
}