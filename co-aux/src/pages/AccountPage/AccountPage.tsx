import React from 'react';
import './AccountPage.css';

type AccountPageProps = {
};

type AccountPageState = {
};

export default class App extends React.Component<AccountPageProps, AccountPageState> {
  constructor(props: AccountPageProps) {
      super(props);
  }

  render() {
      return (
        <p> welcome user </p>
      );
  }
}