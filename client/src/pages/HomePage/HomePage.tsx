import React from 'react';
import './HomePage.css';

type HomePageProps = {
};

type HomePageState = {
};

export default class App extends React.Component<HomePageProps, HomePageState> {
  constructor(props: HomePageProps) {
      super(props);
  }

  handleLogin() {
    window.location.href = `/login`;
  }

  render() {
      return (
        <button type="submit" onClick={this.handleLogin}> Connect to Spotify </button>
      );
  }
}