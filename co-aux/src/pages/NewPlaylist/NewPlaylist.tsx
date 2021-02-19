import React from 'react';
import './NewPlaylist.css';

type NewPlaylistProps = {
};

type NewPlaylistState = {
};

export default class App extends React.Component<NewPlaylistProps, NewPlaylistState> {
  constructor(props: NewPlaylistProps) {
      super(props);
  }

  render() {
      return (
        <p> create new playlist </p>
      );
  }
}