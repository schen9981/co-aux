import React from 'react';
import './LoginPage.css';
import appLogo from "../../../assets/coaux-logo.svg";

type LoginPageProps = {
};

type LoginPageState = {
};

export default class LoginPage extends React.Component<LoginPageProps, LoginPageProps> {
  constructor(props: LoginPageProps) {
      super(props);
  }

  handleLogin() {
    window.location.href = `/login`;
  }

  render() {
    return (
      <div className="login">
        <img alt="aux chord" src={appLogo}/>
        <div className="welcome-message">
          <h1> welcome to <span style={{color: '#264653'}}> co-aux </span></h1>
        </div>
        <div className="login-options">
          <button className="login-button" onClick={this.handleLogin}>go to your playlists</button>
        </div>
      </div>
    );
  }
}