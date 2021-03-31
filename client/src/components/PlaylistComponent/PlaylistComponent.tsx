import React from 'react';
import './PlaylistComponent.css';
import playlistIcon from '../../assets/playlist-icon.svg';

type PlaylistComponentProps = {
  color: string,
  title: string,
  onClickHandler: () => void
};

type PlaylistComponentState = {
};

export default class PlaylistComponent extends React.Component<PlaylistComponentProps, PlaylistComponentState> {
  constructor(props: PlaylistComponentProps) {
      super(props);
  }

  render() {
    return (
      <button onClick={this.props.onClickHandler} className="playlist" style={{backgroundColor: this.props.color}}>
        <img className="playlist-icon" alt="3 aux chords" src={playlistIcon}/>
        <div className="playlist-name-container">
          <p>{this.props.title}</p>
        </div>
      </button>
    );
  }
}