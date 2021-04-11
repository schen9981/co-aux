import React from 'react';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import './QueuePage.css';
import { Table, Modal, Form, Button } from 'react-bootstrap';
// get our fontawesome imports
import { faHeart } from "@fortawesome/free-regular-svg-icons";
import { faPlusSquare } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {io, Socket} from 'socket.io-client';

interface QueueRouteParams {id: string};

type Participant = {
  id: string,
  role: string,
  name: string
}

type Track = {
  trackName: string,
  artistName: string,
  albumName: string,
  uri: string,
  votes: number,
  duration: 0,
  albumCover: ""
}

type QueuePageProps  = {
};

type QueuePageState = {
  queueName: string,
  tracks: Track[],
  isViewer: boolean,
  addSongModal: boolean,
  addUserModal: boolean,
  songSearchTerm: string,
  userSearchTerm: string,
  modalStatusSearching: boolean,
  songSelection: Track,
  searchResults: Track[],
  userSearchResults: Participant[],
  userSelection: Participant,
  votingSession: Track[],
  participants: Participant[],
  allUsers: Participant[],
};

var socket: Socket;
export default class QueuePage extends React.Component<QueuePageProps & RouteComponentProps<QueueRouteParams>, QueuePageState> {
  constructor(props: QueuePageProps & RouteComponentProps<QueueRouteParams>) {
      super(props);
      this.state = {
        queueName: "",
        tracks: [],
        isViewer: false,
        addSongModal: false,
        addUserModal: false,
        songSearchTerm: "",
        userSearchTerm: "",
        modalStatusSearching: true,
        songSelection: {
          trackName: "",
          artistName: "",
          albumName: "",
          uri: "",
          votes: 0,
          duration: 0,
          albumCover: ""
        },
        searchResults: [],
        userSearchResults: [],
        userSelection: {
          id: "",
          role: "",
          name: ""
        },
        votingSession: [],
        participants: [],
        allUsers: [] 
      };
  }

  async componentDidMount() {
    this.fetchPlaylistInfo();
    this.fetchTracks();
    await this.fetchAllUsers();
    await this.fetchParticipants();
    console.log("done fetching participants: ", this.state.participants);
    await this.determineRole();

    // This will register an event handler for update events 
    // which can be triggered by other clients
    socket.on('update', (data) => {
      // data is an object, it contains all voted tracks and its votes
      // data = {track_id1: votes1, track_id2: votes2}
      // Update page with new votelist data
      this.updateVotingSession(data);
    });
  }

  async determineRole() {
    await fetch('/api/user')
    .then((resp) => {
      return resp.json();
    })
    .then((json) => {
      let id = json.id;
      let userIndex = this.state.participants.findIndex(participant => participant.id == id);
      let isViewer = (this.state.participants[userIndex].role == "viewer");
      this.setState({
        isViewer: isViewer
      });
    })
    .catch((err) => {
      console.log("Error: " + err);
    });
  }

  addSongModalOpen() {
    this.setState({
      addSongModal: true
    });
  }

  addUserModalOpen() {
    this.setState({
      addUserModal: true
    });
  }

  addSongModalClose() {
    this.setState({
      addSongModal: false
    });
  }

  addUserModalClose() {
    this.setState({
      addUserModal: false
    });
  }

  async fetchAllUsers() {
    await fetch('/api/user/all')
    .then((resp) => {
      return resp.json();
    })
    .then((json) => {
      let all : Participant[] = json.map((user : any) => {
        let participant : Participant = {
          id: user.id,
          role: "",
          name: user.name
        };
        return participant;
      });
      this.setState({
        allUsers: all
      });
    })
    .catch((err) => {
      console.log("Error: " + err)
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

  async fetchParticipants() {
    await fetch('/api/playlist/' + this.props.match.params.id + '/participant')
    .then((resp) => {
      return resp.json();
    })
    .then((json) => {
      let participants : Participant[] = [];
      let allUsers = this.state.allUsers;
      Object.keys(json).map(function(key, index) {
        let userIndex = allUsers.findIndex((user : Participant) => user.id == key);
        let participant : Participant = {
          id: key,
          role: json[key],
          name: allUsers[userIndex].name
        };
        participants.push(participant);
      });
      
      this.setState({
        participants: participants
      });
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
    let duration = trackJson.track.duration_ms; 
    let albumCover = trackJson.track.album.images[2].url;

    let trackObj : Track = {
      trackName: trackName,
      artistName: artistName,
      albumName: albumName,
      uri: uri,
      votes: 0,
      duration: duration,
      albumCover: albumCover
    }; 
    return trackObj;
  }

  extractResultJson(searchJson : any) {
    let trackName = searchJson.name;
    let albumName = searchJson.album.name;
    let uri = searchJson.uri;
    let artistArr = searchJson.album.artists.map((artistJson : any) => artistJson.name);
    let artistName = artistArr.join(', ');
    let duration = searchJson.duration_ms; 
    let albumCover = searchJson.album.images[2];

    let trackObj : Track = {
      trackName: trackName,
      artistName: artistName,
      albumName: albumName,
      uri: uri,
      votes: 0,
      duration: duration,
      albumCover: albumCover
    }; 
    return trackObj;
  }

  onChangeSongSelection(event : any) {
    let value = event.target.value.split('+');
    let selectedTrack : Track = {
      trackName: value[0],
      artistName: value[1],
      albumName: value[2],
      uri: value[3],
      votes: 0,
      duration: 0,
      albumCover: ""
    };
    this.setState({
      songSelection: selectedTrack
    });
  }

  onChangeUserSelection(event : any) {
    let value = event.target.value;
    let user : Participant = {
      id: value,
      role: this.state.userSelection.role,
      name: this.state.userSelection.name
    };
    this.setState({
      userSelection: user
    });
  }

  onChangeRoleSelection(event : any) {
    let value = event.target.value;
    let user : Participant = {
      id: this.state.userSelection.id,
      role: value,
      name: this.state.userSelection.name
    };
    this.setState({
      userSelection: user
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

  searchForUser(event : any) {
    event.preventDefault();
    fetch('/api/user/all')
    .then((resp) => {
      return resp.json();
    })
    .then((json) => {
      console.log("users; ", json);
      let users : [Participant] = json;
      this.setState({
        userSearchResults: users,
        modalStatusSearching: false
      })
    })
    .catch((err) => {
      console.log("Error: " + err)
    });
  }

  updateVotingSession(data: any) {
    var updatedTracks = this.state.votingSession;
    Object.keys(data).map(function(key, index) {
      let trackIndex = updatedTracks.findIndex(t => t.uri == key);
      updatedTracks[trackIndex].votes = data[key];
    });
    updatedTracks.sort((a,b) => b.votes - a.votes);
    this.setState({ 
      votingSession: updatedTracks
    }, () => {
      console.log("updated voting session from socket: ", this.state.votingSession);
    });
  }

  addToVoteSession() {
    socket.emit('update', this.state.songSelection.uri, 1);
    this.setState({ 
      votingSession: [...this.state.votingSession, this.state.songSelection],
      addSongModal: false
    }, () => {
      // console.log(this.state.votingSession);
    });
  }

  addParticipants() {
    fetch('/api/playlist/' + this.props.match.params.id + '/participant', 
    {
      method: 'POST', 
      headers: {'content-type':'application/json'}, 
      body: JSON.stringify({
          id: this.state.userSelection.id,
          role: this.state.userSelection.role
        })
    })
    .catch(err => console.log(err));
  }

  addToMemberList() {
    this.addParticipants();
    this.setState({ 
      participants: [...this.state.participants, this.state.userSelection],
      addUserModal: false
    }, () => {
      console.log(this.state.participants);
    });
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
                <option value={result.trackName + '+' + result.artistName + '+' + result.albumName + '+' + result.uri}>{result.trackName + ' by ' + result.artistName}</option>
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

  renderUserModalContent() {
    let userModalContent = [];
    console.log("current participants: ", this.state.participants);
    userModalContent.push(
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th> Username </th>
            <th> ID </th>
            <th> Role </th>
          </tr>
        </thead>
        <tbody>
          {this.state.participants.map((user : Participant) => (
            <tr>
              <td>{user.name}</td>
              <td>{user.id}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );

    if (this.state.modalStatusSearching) {
      userModalContent.push(
        <Form onSubmit={this.searchForUser.bind(this)}>
          <Form.Label>Search for users:</Form.Label>
          <Form.Control 
            onChange={e => this.setState({ userSearchTerm: e.target.value })}
            value={this.state.userSearchTerm}
            type="text" id="user-search" name="user-search" />
          <Button type="submit">
            Search for users
          </Button>
        </Form>
      );
    } else {
      userModalContent.push(
        <Form onSubmit={this.searchForUser.bind(this)}>
          <Form.Label>Search for users:</Form.Label>
          <Form.Control 
            onChange={e => this.setState({ userSearchTerm: e.target.value })}
            value={this.state.userSearchTerm}
            type="text" id="user-search" name="user-search" />
          <Button type="submit">
            Search for users
          </Button>
          <Form.Group>
            <Form.Label>Results from search</Form.Label>
            <Form.Control as="select" custom onChange={this.onChangeUserSelection.bind(this)}>
              <option value="user">chose your user</option>
              {this.state.userSearchResults.map((result) => (
                <option value={result.id}>{result.name}</option>
              ))}
            </Form.Control>
            <Form.Control as="select" custom onChange={this.onChangeRoleSelection.bind(this)}>
              <option value="role">chose their role</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </Form.Control>
          </Form.Group>
          <Button onClick={this.addToMemberList.bind(this)}>
            Add user to member list
          </Button>
        </Form>
      )
    }

    return userModalContent;
  }

  incrementVote(track: Track) {
    var updatedTracks = this.state.votingSession;
    let trackIndex = updatedTracks.findIndex(t => t.albumName == track.albumName && t.artistName == track.artistName && t.trackName == track.trackName && t.uri == track.uri);
    updatedTracks[trackIndex].votes++;
    socket.emit('update', updatedTracks[trackIndex].uri, updatedTracks[trackIndex].votes);
    socket.emit('get');
    updatedTracks.sort((a,b) => b.votes - a.votes);
    this.setState({ votingSession: updatedTracks });
  }

  addToQueue(track: Track) {
    var votingTracks = [...this.state.votingSession];
    var trackIndex = votingTracks.findIndex(t => t.albumName == track.albumName && t.artistName == track.artistName && t.trackName == track.trackName && t.uri == track.uri);
    votingTracks.splice(trackIndex,1);
    this.insertTracks(this.state.votingSession[trackIndex].uri);
    this.setState({ 
      tracks: [...this.state.tracks, this.state.votingSession[trackIndex]],
      votingSession: votingTracks
    }, () => {
      // console.log(this.state.tracks);
      // console.log(this.state.votingSession);
    });
  }

  insertTracks(trackURI: String) {
    fetch('/api/playlist/' + this.props.match.params.id + '/tracks', 
    {
      method: 'POST', 
      headers: {'content-type':'application/json'}, 
      body: JSON.stringify({
          uris: [ trackURI ]
        })
    })
    .then(resp => resp.json())
    .then(resp => console.log(resp))
    .catch(err => console.log(err));
  }

  render() {
    // The playlist_id variable should contain the id of a playlist
    socket = io('/api/playlist/votelist', {
      query: {
        "id":this.props.match.params.id
      }
    }); 
    
    socket.on('connect', () => {
      console.log('connection established');
    });
    
    // This will register an event handler for update events 
    // which can be triggered by other clients
    socket.on('update', (data) => {
      // data is an object, it contains all voted tracks and its votes
      // data = {track_id1: votes1, track_id2: votes2}
      // Update page with new votelist data
      this.updateVotingSession(data);
    });
    
    let modalContent = this.renderModalContent();
    let userModalContent = this.renderUserModalContent();

    return (
      <div className="App">
        <Link to="/">Return to Home Page</Link>
        <div className="curr-queue">
          <div className="queue-name">
            <h1>{this.state.queueName}</h1>
          </div>

          <button onClick={this.addSongModalOpen.bind(this)}>
            Search for songs
          </button>

          {!this.state.isViewer && (
            <button onClick={this.addUserModalOpen.bind(this)}>
              Search for members
            </button>
          )}

          <div className="queue-container">
            <Table bordered hover>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Song Title</th>
                  <th>Album</th>
                </tr>
              </thead>
              <tbody>
                {this.state.tracks.map((track : Track, index) => (
                  <tr>
                    <td style={{fontWeight: "bold"}}>{index+1}</td>
                    <td className="songContainer">
                      <img src={track.albumCover}></img>
                      <div className="songInfoContainer">
                        <div style={{fontWeight: "bold"}}>{track.trackName}</div>
                        <div>{track.artistName}</div>
                      </div>
                    </td>
                    <td style={{fontWeight: "bold"}}>{track.albumName}</td>
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
                  <th>votes</th>
                  <th>add to queue</th>
                </tr>
              </thead>
              <tbody>
                {this.state.votingSession.map((track : Track) => (
                  <tr>
                    <td>{track.trackName}</td>
                    <td>{track.artistName}</td>
                    <td>{track.albumName}</td>
                    <td>
                      <button className="rowBtn" onClick={() => this.incrementVote(track)}>
                        <FontAwesomeIcon icon={faHeart} style={{color: "grey", paddingRight: "5px"}}/>
                        {track.votes}
                      </button>
                    </td>
                    {!this.state.isViewer && (
                      <td>
                      <button className="rowBtn" onClick={() => this.addToQueue(track)}>
                        <FontAwesomeIcon icon={faPlusSquare} style={{color: "grey"}}/>
                      </button>
                    </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <Modal show={this.state.addSongModal} onHide={this.addSongModalClose.bind(this)}>
            <Modal.Header closeButton>
              <Modal.Title>Search for Songs</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {modalContent}
            </Modal.Body>
          </Modal>

          <Modal show={this.state.addUserModal} onHide={this.addUserModalClose.bind(this)}>
            <Modal.Header closeButton>
              <Modal.Title>Add Members</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {userModalContent}
            </Modal.Body>
          </Modal>

        </div>
      </div>
    );
  }
}