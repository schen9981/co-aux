import React from 'react';
import './HomePage.css';

const {
  REACT_APP_CLIENT_ID,
  REACT_APP_AUTHORIZE_URL,
  REACT_APP_REDIRECT_URL
} = process.env;

type HomePageProps = {
};

type HomePageState = {
};

export default class App extends React.Component<HomePageProps, HomePageState> {
  constructor(props: HomePageProps) {
      super(props);
  }

  handleLogin() {
    window.location.href = `${REACT_APP_AUTHORIZE_URL}?client_id=${REACT_APP_CLIENT_ID}&redirect_uri=${REACT_APP_REDIRECT_URL}&response_type=token&show_dialog=true`;
  }

  render() {
      return (
        <button type="submit" onClick={this.handleLogin}> Connect to Spotify </button>
      );
  }
}