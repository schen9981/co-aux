import React from 'react';
import './NewPlaylistComponent.css';
import playlistIcon from '../../assets/playlist-icon.svg';
import addIcon from '../../assets/add-icon.svg';

type NewPlaylistComponentProps = {
  color: string,
  onClickModal: () => void
};

type NewPlaylistComponentState = {
};

export default class NewPlaylistComponent extends React.Component<NewPlaylistComponentProps, NewPlaylistComponentState> {
  constructor(props: NewPlaylistComponentProps) {
      super(props);
  }

  render() {
    return (
      <button className="new-playlist" onClick={this.props.onClickModal} style={{backgroundColor: this.props.color}}>
        <div className="icon-wrapper">
          <div className="playlist-icon">
            <img alt="3 aux chords" src={playlistIcon}/>
          </div>
          <div className="add-icon">
            <img alt="plus sign" src={addIcon}/>
          </div>
        </div>
        <p className="new-playlist-title">new playlist</p>
      </button>
    );
  }
}