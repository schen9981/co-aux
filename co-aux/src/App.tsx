import React from 'react';
import './App.css';

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
        <p> hello world </p>
      );
  }
}