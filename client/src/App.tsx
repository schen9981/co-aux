import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from "react-router-dom";
import LaunchPage from './pages/LaunchPage/LaunchPage';
import QueuePage from './pages/QueuePage/QueuePage';
import 'font-awesome/css/font-awesome.min.css';

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

          <Route exact path="/playlist/:id/" component={QueuePage}>
          </Route>
        </Router>
      );
  }
}