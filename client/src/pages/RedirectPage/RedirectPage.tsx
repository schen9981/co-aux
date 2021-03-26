import React from 'react';
import './RedirectPage.css';

type RedirectPageProps = {
};

type RedirectPageState = {
};

export default class App extends React.Component<RedirectPageProps, RedirectPageState> {
  constructor(props: RedirectPageProps) {
      super(props);
  }

  render() {
      return (
        <div>
            Redirect Page
        </div>
      );
  }
}