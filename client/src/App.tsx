import React from 'react';
import './App.css';
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import LaunchPage from './pages/LaunchPage/LaunchPage';
import PlaylistPage from './pages/PlaylistPage/PlaylistPage';


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
        <Router>
          <Route exact path="/" component={LaunchPage}>
          </Route>

          <Route exact path="/playlist/:id" component={PlaylistPage}>
          </Route>
        </Router>
      );
  }
}