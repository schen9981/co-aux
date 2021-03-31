import React from 'react';
import './LaunchPage.css';
import LoginPage from "./LoginPage/LoginPage";
import LoadingPage from "./LoadingPage/LoadingPage";
import HomePage from "./HomePage/HomePage";

type LaunchPageProps = {
};

type LaunchPageState = {
  animationComplete: boolean,
  loggedIn: boolean
  userData: {
    display_name: string,
    href: string
  }
};

export default class LaunchPage extends React.Component<LaunchPageProps, LaunchPageState> {
  constructor(props: LaunchPageProps) {
      super(props);
      this.state = {
        animationComplete: false,
        // TODO: CHANGE TO FALSE
        loggedIn: false,
        userData: {
          display_name: "",
          href: ""
        }
      };
      this.loadingHandler = this.loadingHandler.bind(this);
  }

  componentDidMount() {
    fetch('/api/user')
    .then((resp) => {
      if (resp.ok) {
        this.setState({
          loggedIn: true,
        });
        return resp.json();
      } else {
        this.setState({loggedIn: false});
      }
    })
    .then((json) => {
      let data = {
        display_name: json.display_name.toLowerCase(),
        href: json.href
      }
      this.setState({
        userData: data
      });
    })
    .catch((err) => {
      console.log(err);
    });
  }

  loadingHandler() {
    this.setState({animationComplete: true});
  }

  render() {
    let currPage;
    if (this.state.animationComplete) {
      if (this.state.loggedIn) {
        currPage = <HomePage userData={this.state.userData}/>;
      } else {
        currPage = <LoginPage />
      }
    } else {
      currPage = <LoadingPage loadingCompleteFunc={this.loadingHandler} />;
    }
    return (
      <div className="launch">
         {currPage}
      </div>
    );
  }
}