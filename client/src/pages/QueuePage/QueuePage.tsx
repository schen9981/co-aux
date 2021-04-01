import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import './QueuePage.css';
import { Table, Modal, Form, Button } from 'react-bootstrap';

interface QueueRouteParams {id: string};

type Track = {
  trackName: string,
  artistName: string,
  albumName: string,
  uri: string
}

type QueuePageProps  = {
};

type QueuePageState = {
  queueName: string,
  tracks: Track[],
  addSongModal: boolean,
  songSearchTerm: string,
  modalStatusSearching: boolean,
  songSelection: Track,
  searchResults: Track[],
  votingSession: Track[] 
};

export default class QueuePage extends React.Component<QueuePageProps & RouteComponentProps<QueueRouteParams>, QueuePageState> {
  constructor(props: QueuePageProps & RouteComponentProps<QueueRouteParams>) {
      super(props);
      this.state = {
        queueName: "",
        tracks: [],
        addSongModal: false,
        songSearchTerm: "",
        modalStatusSearching: true,
        songSelection: {
          trackName: "",
          artistName: "",
          albumName: "",
          uri: ""
        },
        searchResults: [],
        votingSession: []
      };
  }

  componentDidMount() {
    this.fetchPlaylistInfo();
    this.fetchTracks();
  }

  addSongModalOpen() {
    this.setState({
      addSongModal: true
    });
  }

  addSongModalClose() {
    this.setState({
      addSongModal: false
    });
  }

  fetchPlaylistInfo() {
    fetch('/api/playlist/' + this.props.match.params.id)
    .then((resp) => {
      return resp.json();
    })
    .then((json) => {
      this.setState({
        queueName: json.name
      });
    })
    .catch((err) => {
      console.log("Error: " + err);
    });
  }

  fetchTracks() {
    fetch('/api/playlist/' + this.props.match.params.id + '/tracks')
    .then((resp) => {
      return resp.json();
    })
    .then((json) => {
      let tracks : [Track] = json.items.map((trackData : any) => { return this.extractTrackJson(trackData)})
      this.setState({
        tracks: tracks
      })
    })
    .catch((err) => {
      console.log("Error: " + err);
    })
  }

  extractTrackJson(trackJson : any) {
    let trackName = trackJson.track.name;
    let albumName = trackJson.track.album.name;
    let uri = trackJson.track.uri;
    let artistArr = trackJson.track.album.artists.map((artistJson : any) => artistJson.name);
    let artistName = artistArr.join(', ');

    let trackObj : Track = {
      trackName: trackName,
      artistName: artistName,
      albumName: albumName,
      uri: uri
    }; 
    return trackObj;
  }

  extractResultJson(searchJson : any) {
    let trackName = searchJson.name;
    let albumName = searchJson.album.name;
    let uri = searchJson.uri;
    let artistArr = searchJson.album.artists.map((artistJson : any) => artistJson.name);
    let artistName = artistArr.join(', ');

    let trackObj : Track = {
      trackName: trackName,
      artistName: artistName,
      albumName: albumName,
      uri: uri
    }; 
    return trackObj;
  }


  onChangeSongSelection(event : any) {
    let value = event.target.value.split('+');
    let selectedTrack : Track = {
      trackName: value[0],
      artistName: value[1],
      albumName: '',
      uri: value[2]
    };
    this.setState({
      songSelection: selectedTrack
    });
  }

  searchForSong(event : any) {
    event.preventDefault();
    fetch('/api/search?name=' + this.state.songSearchTerm)
    .then((resp) => {
      return resp.json();
    })
    .then((json) => {
      let tracks : [Track] = json.tracks.items.map((trackData : any) => { return this.extractResultJson(trackData)})
      this.setState({
        searchResults: tracks,
        modalStatusSearching: false
      })
    })
    .catch((err) => {
      console.log("Error: " + err)
    });
  }

  addToVoteSession() {
    this.setState({ 
      votingSession: [...this.state.votingSession, this.state.songSelection],
      addSongModal: false
    });
    console.log(this.state.votingSession);
  }

  renderModalContent() {
    let modalContent;
    if (this.state.modalStatusSearching) {
      modalContent = (
        <Form onSubmit={this.searchForSong.bind(this)}>
          <Form.Label>search for song:</Form.Label>
          <Form.Control 
            onChange={e => this.setState({ songSearchTerm: e.target.value })}
            value={this.state.songSearchTerm}
            type="text" id="song-search" name="song-search" />
          <Button type="submit">
            search for song
          </Button>
        </Form>
      );
    } else {
      modalContent = (
        <Form onSubmit={this.searchForSong.bind(this)}>
          <Form.Label>search for song:</Form.Label>
          <Form.Control 
            onChange={e => this.setState({ songSearchTerm: e.target.value })}
            value={this.state.songSearchTerm}
            type="text" id="song-search" name="song-search" />
          <Button type="submit">
            search for song
          </Button>
          <Form.Group>
            <Form.Label>results from search</Form.Label>
            <Form.Control as="select" custom onChange={this.onChangeSongSelection.bind(this)}>
              <option value="song">chose your song</option>
              {this.state.searchResults.map((result) => (
                <option value={result.trackName + '+' + result.artistName + '+' + result.uri}>{result.trackName + ' by ' + result.artistName}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <Button onClick={this.addToVoteSession.bind(this)}>
            add song to voting session
          </Button>
        </Form>
      )

    }

    return modalContent;
  }


  render() {
    let modalContent = this.renderModalContent();

    return (
      <div className="App">
        <Link to="/">go back</Link>
        <div className="curr-queue">
          <div className="queue-name">
            <h1>{this.state.queueName}</h1>
          </div>

          <button onClick={this.addSongModalOpen.bind(this)}>
            add a song
          </button>

          <div className="queue-container">
            <Table bordered hover>
              <thead>
                <tr>
                  <th>song name</th>
                  <th>artists</th>
                  <th>album name</th>
                </tr>
              </thead>
              <tbody>
                {this.state.tracks.map((track : Track) => (
                  <tr>
                    <td>{track.trackName}</td>
                    <td>{track.artistName}</td>
                    <td>{track.albumName}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Table bordered hover>
              <thead>
                <tr>
                  <th>song name</th>
                  <th>artists</th>
                  <th>album name</th>
                </tr>
              </thead>
              <tbody>
                {this.state.votingSession.map((track : Track) => (
                  <tr>
                    <td>{track.trackName}</td>
                    <td>{track.artistName}</td>
                    <td>{track.albumName}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <Modal show={this.state.addSongModal} onHide={this.addSongModalClose.bind(this)}>
            <Modal.Header closeButton>
              <Modal.Title>add a song to the queue!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {modalContent}
            </Modal.Body>
          </Modal>

        </div>
      </div>
    );
  }
}