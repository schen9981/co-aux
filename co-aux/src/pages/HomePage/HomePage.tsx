import React from 'react';
import './HomePage.css';

type HomePageProps = {
};

type HomePageState = {
};

export default class HomePage extends React.Component<HomePageProps, HomePageState> {
  constructor(props: HomePageProps) {
      super(props);
  }

  render() {
      return (
        <p> home </p>
      );
  }
}