import React from 'react';
import './PlaylistComponent.css';
import playlistIcon from '../../assets/playlist-icon.svg';
import { Link } from 'react-router-dom';

type PlaylistComponentProps = {
  color: string,
  title: string,
  id: string
};

type PlaylistComponentState = {
};

export default class PlaylistComponent extends React.Component<PlaylistComponentProps, PlaylistComponentState> {
  constructor(props: PlaylistComponentProps) {
      super(props);
  }

  render() {
    return (
      <div className="playlist" style={{backgroundColor: this.props.color}}>
        <img className="playlist-icon" alt="3 aux chords" src={playlistIcon}/>
        <div className="playlist-name-container">
          <Link to={`/playlist/${this.props.id}`}>{this.props.title}</Link>
        </div>
      </div>
    );
  }
}