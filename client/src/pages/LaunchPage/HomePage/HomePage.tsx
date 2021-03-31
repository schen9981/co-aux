import React from 'react';
import './HomePage.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import NewPlaylistComponent from '../../../components/NewPlaylistComponent/NewPlaylistComponent';
import PlaylistComponent from '../../../components/PlaylistComponent/PlaylistComponent';
import PlaylistListComponent from '../../../components/PlaylistListComponent/PlaylistListComponent';

type PlaylistObject = {
  name: string,
  href: string,
  tracks: string
  id: string
}

type HomePageProps = {
  userData: {
    display_name: string,
    href: string
  }
};

type HomePageState = {
  newPlaylistModal: boolean,
  modalSelection: string,
  playlists: [PlaylistObject]
};

function makeId (length : number) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default class HomePage extends React.Component<HomePageProps, HomePageState> {
  constructor(props: HomePageProps) {
      super(props);
      this.state = {
        newPlaylistModal: false,
        modalSelection: "initial",
        playlists: [{
          name: '',
          href: '',
          tracks: '',
          id: ''
        }]
      };
      this.newPlaylistOpen = this.newPlaylistOpen.bind(this);
      this.newPlaylistClose = this.newPlaylistClose.bind(this);
      this.setModalContentSelector = this.setModalContentSelector.bind(this);
  }

  componentDidMount() {
    fetch('/api/playlist')
      .then((resp) => {
        return resp.json();
      })
      .then((json) => {
        let playlists = json.items;
        this.setState({
          playlists: playlists
        });
      });
  }

  newPlaylistOpen() {
    this.setState({
      newPlaylistModal: true
    })
  }

  newPlaylistClose() {
    this.setState({
      modalSelection: 'initial',
      newPlaylistModal: false
    })
  }

  setModalContentSelector(selection : string) {
    this.setState({
      modalSelection: selection
    });
  }

  renderModalContent() {
    let modalContent;
    if (this.state.modalSelection === 'initial') {
      modalContent = (
        <div className="new-playlist-options">
          <PlaylistComponent onClickHandler={() => this.setModalContentSelector("empty")} title="empty playlist" color="#2A9D8F"/>
          <PlaylistComponent onClickHandler={() => this.setModalContentSelector("preloaded")} title="pre-loaded playlist" color="#F4A261"/>
        </div>
      );
      return modalContent;
    } else if (this.state.modalSelection === 'preloaded') {
      modalContent = (
        <div className="new-playlist-options">
          <p>chose one of your playlists to populate your new queue!</p>
          <PlaylistListComponent playlists={this.state.playlists}/>
        </div>
      );
      return modalContent;
    } else if (this.state.modalSelection === "empty") {
      modalContent = (
        <div className="new-playlist-options">
          <form>
            <label>playlist title</label><br></br>
            <input type="text" id="playlist-title" name="playlist-title"></input><br></br>
          </form>
        </div>
      );
    }
  }


  routeToPlaylist(playlistName : string) {
    window.location.href = playlistName;
  }

  render() {
    let modalContent = this.renderModalContent();

    return (
      <div className="home">
        <div className="welcome-header">
          <h1> welcome, sophia chen</h1>
          {/* <h1> welcome, {this.props.userData.display_name}</h1> */}
        </div>

        <div className="section-header">
            <h1> playlists you host </h1>
        </div>
        <div className="host-playlists">
          <div className="existing-host-playlists">
            <PlaylistComponent onClickHandler={() => this.routeToPlaylist("temp")} title="playlist 1" color="#E9C46A"/>
          </div>
          <div className="new-host-playlist">
            <NewPlaylistComponent onClickModal={this.newPlaylistOpen} color="#E9C46A"/>
          </div>
        </div>

        <div className="section-header">
            <h1>playlists you contribute to</h1>
        </div>
        <div className="contribute-playlists">
          <div className="existing-contribute-playlists">
            <PlaylistComponent onClickHandler={() => this.routeToPlaylist("temp")} title="playlist 1" color="#F4A261"/>
          </div>
          <div className="new-contribute-playlist">
          </div>
        </div>

        <Modal show={this.state.newPlaylistModal} onHide={this.newPlaylistClose}>
          <Modal.Header closeButton>
            <Modal.Title>create new playlist</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalContent}
          </Modal.Body>
        </Modal>

      </div>
    );
  }
}