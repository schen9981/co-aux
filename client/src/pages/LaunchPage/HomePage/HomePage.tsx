import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import playlistIcon from '../../../assets/playlist-icon.svg';
import { Modal, Form, Button } from 'react-bootstrap';
import NewPlaylistComponent from '../../../components/NewPlaylistComponent/NewPlaylistComponent';
import PlaylistComponent from '../../../components/PlaylistComponent/PlaylistComponent';

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
  allPlaylists: PlaylistObject[],
  hostPlaylists: PlaylistObject[],
  contributorPlaylists: PlaylistObject[],
  preloadedPlaylistId: string,
  newQueueName: string,
  newQueueId: string,
  queueCreated: boolean
};

export default class HomePage extends React.Component<HomePageProps, HomePageState> {
  constructor(props: HomePageProps) {
      super(props);
      this.state = {
        newPlaylistModal: false,
        modalSelection: "initial",
        allPlaylists: [],
        hostPlaylists: [],
        contributorPlaylists: [],
        newQueueName: '',
        newQueueId: '',
        preloadedPlaylistId: '',
        queueCreated: false
      };
      this.newPlaylistOpen = this.newPlaylistOpen.bind(this);
      this.newPlaylistClose = this.newPlaylistClose.bind(this);
      this.setModalContentSelector = this.setModalContentSelector.bind(this);
  }

  async componentDidMount() {
    // Get all spotify playlists for pre-loading
    fetch('/api/user/playlist')
      .then((resp) => {
        return resp.json();
      })
      .then((json) => {
        this.setState({
          allPlaylists: json
        });
      });

      // Get owned playlists
      fetch('/api/playlist?role=owner')
      .then((resp) => {
        return resp.json();
      })
      .then((json) => {
        this.setState({
          hostPlaylists: json
        });
      });

      // Get editor playlists
      await fetch('/api/playlist?role=editor')
      .then((resp) => {
        return resp.json();
      })
      .then((json) => {
        this.setState({
          contributorPlaylists: json
        });
      });

      // Get viewer playlists
      await fetch('/api/playlist?role=viewer')
      .then((resp) => {
        return resp.json();
      })
      .then((json) => {
        this.setState({
          contributorPlaylists: this.state.contributorPlaylists.concat(json)
        }, () => {
          // console.log("check contributorPlaylists: ", this.state.contributorPlaylists)
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
      newPlaylistModal: false,
      queueCreated: false,
      newQueueId: "",
      newQueueName: ""
    })
  }

  setModalContentSelector(selection : string) {
    this.setState({
      modalSelection: selection
    });
  }

  onChangePlaylistSelection(event : any) {
    // console.log("target value: ", event.target.value);
    this.setState({
      preloadedPlaylistId: event.target.value
    });
  }

  fetchPreloadedTracks() {
    // get the tracks of the preloaded playlist
    fetch('/api/user/playlist/' + this.state.preloadedPlaylistId + '/tracks')
    .then((resp) => {
      // console.log("response: ", resp);
      return resp.json();
    })
    .then((json) => {
      // console.log("json tracks?: ", json);
      let uris = json.map((trackData : any) => { return trackData.uri})
      // console.log("uris: ", uris);
      this.addPreloadedToPlaylist(uris);
    })
    .catch((err) => {
      console.log("Error: " + err);
    })

  }

  addPreloadedToPlaylist(uris : [string]) {
    fetch('/api/playlist/' + this.state.newQueueId + '/tracks', 
      {
          method: 'POST', 
          headers: {'content-type':'application/json'}, 
          body: JSON.stringify(
            {
              uris: uris
            })
      }
    )
    .then(resp => resp.json())
    .then(resp => console.log(resp))
    .catch(err => console.log(err));
  }

  createPreloadedPlaylist(event : any) {
    event.preventDefault();
    // post request to spotify api to create new playlist
    fetch('/api/playlist/', 
      {
        method: 'POST', 
        headers: {'content-type':'application/json'}, 
        body: JSON.stringify(
          {
            name: this.state.newQueueName,
            collaborative: 'false',
            description: ''
          })
      }
    )
    .then((resp) => resp.json())
    .then((json) => {
      this.fetchPreloadedTracks();
      // set state so that modal is open
      this.setState({
        newQueueId: json.id,
        queueCreated: true,
        modalSelection: 'preloaded',
        newPlaylistModal: true
      });
    })
    .catch((err) => console.log(err));
  }

  createEmptyPlaylist(event : any) {
    event.preventDefault();
    // post request to spotify api to create new playlist
    fetch('/api/playlist/', 
      {
        method: 'POST', 
        headers: {'content-type':'application/json'}, 
        body: JSON.stringify(
          {
            name: this.state.newQueueName,
            collaborative: 'false',
            description: ''
          })
      }
    )
    .then((resp) => resp.json())
    .then((json) => {
      // set state so that modal is open
      this.setState({
        newQueueId: json.id,
        queueCreated: true,
        modalSelection: 'empty',
        newPlaylistModal: true
      });
    })
    .catch((err) => console.log(err));
  }

  renderModalContent() {
    let modalContent;
    if (this.state.modalSelection === 'initial') {
      modalContent = (
        <div className="new-playlist-options">
          <button className="empty-playlist-button" onClick={() => this.setModalContentSelector("empty")}>
            <img className="playlist-icon" alt="3 aux chords" src={playlistIcon}/>
            <div className="new-playlist-name-container">
              <p>empty playlist</p>
            </div>
          </button>
          <button className="preloaded-button" onClick={() => this.setModalContentSelector("preloaded")}>
            <img className="playlist-icon" alt="3 aux chords" src={playlistIcon}/>
            <div className="new-playlist-name-container">
              <p>pre-loaded playlist</p>
            </div>
          </button>
        </div>
      );
      return modalContent;
    } else if (this.state.modalSelection === 'preloaded') {
      if (this.state.queueCreated) {
        // case where queue was created (user inputted selection and clicked 'create')
        modalContent = (
          <div className="new-playlist-options">
            <div className="queue-create-message">
              <h2>your queue <span style={{fontWeight: 700}}> {this.state.newQueueName} </span> has been created!</h2>
              <button>
                <Link to={`/playlist/${this.state.newQueueId}`}>check out your queue</Link>
              </button>
            </div>
          </div>
        );
      } else {
        modalContent = (
          <div className="new-playlist-options">
            <Form onSubmit={this.createPreloadedPlaylist.bind(this)}>
              <Form.Label>queue name: </Form.Label>
              <Form.Control 
                onChange={e => this.setState({ newQueueName: e.target.value })}
                value={this.state.newQueueName}
                type="text" id="preloaded-queue-title" name="preloaded-queue-title" />
  
              <Form.Group>
                <Form.Label>chose one of your playlists to populate your new queue:</Form.Label>
                <Form.Control as="select" custom onChange={this.onChangePlaylistSelection.bind(this)}>
                  <option value="playlist">chose your playlist</option>
                  {this.state.allPlaylists.map((playlist : PlaylistObject) => (
                    <option value={playlist.id}>{playlist.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
              <button className="create-queue-button" type="submit">
                create queue
              </button>
            </Form>
          </div>
        );
      }
      return modalContent;
    } else if (this.state.modalSelection === "empty") {
      if (this.state.queueCreated) {
        // case where queue was created (user inputted selection and clicked 'create')
        modalContent = (
          <div className="new-playlist-options">
            <div className="queue-create-message">
              <h2>your queue <span style={{fontWeight: 700}}> {this.state.newQueueName} </span> has been created!</h2>
              <button>
                <Link to={`/playlist/${this.state.newQueueId}`}>check out your queue</Link>
              </button>
            </div>
          </div>
        );
      } else {
        modalContent = (
          <div className="new-playlist-options">
            <Form onSubmit={this.createEmptyPlaylist.bind(this)}>
              <Form.Label>queue name: </Form.Label>
              <Form.Control 
                onChange={e => this.setState({ newQueueName: e.target.value })}
                value={this.state.newQueueName}
                type="text" id="empty-queue-title" name="empty-queue-title" />
              <button className="create-queue-button" type="submit">
                create queue
              </button>
            </Form>
          </div>
        );
      }
      return modalContent;
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
          <h1> welcome, {this.props.userData.display_name}</h1>
        </div>
        <div className="section-header">
            <h1> your co-auxed playlists </h1>
        </div>
        <div className="host-playlists" >
          {this.state.hostPlaylists.map((playlist : PlaylistObject, index) => (
            <div className="existing-host-playlists">
              <PlaylistComponent title={playlist.name} id={playlist.id} color="#E9C46A"/>
            </div>
            ))}
          <div className="new-host-playlist">
            <NewPlaylistComponent onClickModal={this.newPlaylistOpen} color="#E9C46A"/>
          </div>
        </div>
        <div className="section-header">
            <h1> playlist sessions you've joined</h1>
        </div>
        <div className="contribute-playlists">
          {this.state.contributorPlaylists.map((playlist : PlaylistObject, index) => (
            <div className="existing-contribute-playlists">
              <PlaylistComponent title={playlist.name} id={playlist.id} color="#F4A261"/>
            </div>
          ))}
          <div className="new-contribute-playlist">
          </div>
        </div>

        <Modal size="lg" show={this.state.newPlaylistModal} onHide={this.newPlaylistClose}>
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