import React from 'react';
import './LoadingPage.css';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import appLogo from "../../../assets/coaux-logo.svg";

type LoadingPageProps = {
  loadingCompleteFunc: () => void
};

type LoadingPageState = {
};

export default class LoadingPage extends React.Component<LoadingPageProps, LoadingPageState> {
  constructor(props: LoadingPageProps) {
      super(props);
  }

  render() {
    return (
      <div className="loading">
        <CountdownCircleTimer
          isPlaying
          duration={1.2}
          size={900}
          strokeWidth={6}
          colors={[
            ['#264653', 1]
          ]}
          onComplete={() => {
            this.props.loadingCompleteFunc();
            return [false, 0]
          }}
          trailColor={'#FFFEF2'}
        >
          <img alt="aux chord" id="logo" src={appLogo}></img>
        </CountdownCircleTimer>
      </div>
    );
  }
}