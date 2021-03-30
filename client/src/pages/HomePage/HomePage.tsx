import React from 'react';
import './HomePage.css';
import LoginPage from "./LoginPage/LoginPage";
import LoadingPage from "./LoadingPage/LoadingPage";

type HomePageProps = {
};

type HomePageState = {
  animationComplete: boolean
};

export default class HomePage extends React.Component<HomePageProps, HomePageState> {
  constructor(props: HomePageProps) {
      super(props);
      this.state = {
        animationComplete: false
      };
      this.loadingHandler = this.loadingHandler.bind(this);
  }

  loadingHandler() {
    this.setState({animationComplete: true});
  }

  render() {
    let currPage;
    if (this.state.animationComplete) {
      currPage = <LoginPage />;
    } else {
      currPage = <LoadingPage loadingCompleteFunc={this.loadingHandler} />
    }
    return (
      <div className="home">
         {currPage}
      </div>
    );
  }
}