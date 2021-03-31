import React from 'react';
import {Link} from 'react-router-dom';
import './PlaylistListComponent.css';

type PlaylistObject = {
  name: string,
  href: string,
  tracks: string,
  id: string
}

type PlaylistListComponentProps = {
  playlists: [PlaylistObject];
};

type PlaylistListComponentState = {
};

export default class PlaylistListComponent extends React.Component<PlaylistListComponentProps, PlaylistListComponentState> {
  constructor(props: PlaylistListComponentProps) {
      super(props);
      this.state = {
      };
  }

  render() {
    return (<div className="playlist-list">
      {this.props.playlists.map((playlist) => (
        <Link to={`/playlist/${playlist.id}`}>{playlist.name}</Link>
      ))}
    </div>);
  }
}