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
  userModalStatusSearching: boolean
  songSelection: Track,
  searchResults: Track[],
  userSearchResults: Participant[],
  userSelection: Participant,
  votingSession: Track[],
  participants: Participant[],
  allUsers: Participant[],
};

export default class QueuePage extends React.Component<QueuePageProps & RouteComponentProps<QueueRouteParams>, QueuePageState> {
  private _socket: Socket;
  private userVotes : Map<string,boolean>;
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
        userModalStatusSearching: true,
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
      this._socket = io('/api/playlist', {
        query: {
          id: this.props.match.params.id,
        }
      })

      this.userVotes = new Map();

      this.setupSocket();
  }

  async componentDidMount() {
    this.fetchPlaylistInfo();
    this.fetchTracks();
    await this.fetchAllUsers();
    await this.fetchParticipants();
    await this.determineRole();

    this.setupSocket(); 
  }

  setupSocket() {
    // Set up socket
    this._socket.on('connect', () => {
      console.log('connection established');
    });

    this._socket.on('verified', () => {
      this._socket.emit('getVotelist');
    })

    // This will register an event handler for update events 
    // which can be triggered by other clients
    this._socket.on('votelistUpdate', (data) => {
      // data is an object, it contains all voted tracks and its votes
      // data = {track_id1: votes1, track_id2: votes2}
      // Update page with new votelist data
      this.updateVotingSession(data);
    });

    this._socket.on('tracksUpdate', (data) => {
       let tracks : [Track] = data.map((trackData : any) => { return this.extractTrackJson(trackData)})
       this.setState({
        tracks: tracks
      })
    })
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
      addSongModal: false,
      modalStatusSearching: true
    });
  }

  addUserModalClose() {
    this.setState({
      addUserModal: false,
      userModalStatusSearching: true
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
      let tracks : [Track] = json.map((trackData : any) => { return this.extractTrackJson(trackData)})
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
    const trackName = trackJson.name;
    const albumName = trackJson.album.name;
    const uri = trackJson.uri;
    const artistArr = trackJson.album.artists.map((artistJson : any) => artistJson.name);
    const artistName = artistArr.join(', ');
    const votes = trackJson.votes;
    const duration = trackJson.duration_ms; 
    const albumCover = trackJson.album.images[2].url;

    let trackObj : Track = {
      trackName: trackName,
      artistName: artistName,
      albumName: albumName,
      uri: uri,
      votes: votes,
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
      let tracks : Track[] = json.map((trackData : any) => { return this.extractTrackJson(trackData)})
      tracks = tracks.filter(track => !this.state.votingSession.some(song => song.albumName == track.albumName && song.artistName == track.artistName && song.trackName == track.trackName && song.uri == track.uri))
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
      let users : [Participant] = json.filter((user: Participant) => (user.id.includes(this.state.userSearchTerm) || user.name.includes(this.state.userSearchTerm)) && !this.state.participants.some(participant => participant.id == user.id));
      this.setState({
        userSearchResults: users,
        userModalStatusSearching: false
      })
    })
    .catch((err) => {
      console.log("Error: " + err)
    });
  }

  updateVotingSession(data: any) {
    let ids : string[]= [];
    const updatedTracks:Track[] = data
      .map((trackJSON: any) => {
        let extracted = this.extractTrackJson(trackJSON);
        if(!this.userVotes.has(extracted.uri)) { // adds new songs, sets vote ability = true
          this.userVotes.set(extracted.uri, true); // otherwise song already in map, keep vote status
        }
        ids.push(extracted.uri);
        return extracted;
      })
      .sort((a: Track, b: Track) => b.votes - a.votes)
      this.userVotes.forEach((canVote, id) => { // case where voting track was deleted
        if(!ids.includes(id)) { // an id in the voting map isn't in the updated voting session
          this.userVotes.delete(id);
        }
      });
    this.setState({
      votingSession: updatedTracks
    },() => {
      // console.log("updated voting session from socket: ", this.state.votingSession);
    })
  }

  addToVoteSession() {
    this._socket.emit('updateVotelist', this.state.songSelection.uri, 1);
    this._socket.emit('getVotelist');
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
      // console.log(this.state.participants);
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
          <button className="add-song-modal-btn" type="submit">
            search for song
          </button>
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
          <button className="add-song-modal-btn" type="submit">
            search for song
          </button>
          <Form.Group>
            <Form.Label>results from search</Form.Label>
            <Form.Control as="select" custom onChange={this.onChangeSongSelection.bind(this)}>
              <option value="song">chose your song</option>
              {this.state.searchResults.map((result) => (
                <option value={result.trackName + '+' + result.artistName + '+' + result.albumName + '+' + result.uri}>{result.trackName + ' by ' + result.artistName}</option>
              ))}
            </Form.Control>
          </Form.Group>
          <button className="add-song-modal-btn" onClick={this.addToVoteSession.bind(this)}>
            add song to voting session
          </button>
        </Form>
      )

    }

    return modalContent;
  }

  renderUserModalContent() {
    let userModalContent = [];
    userModalContent.push(
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th> username </th>
            <th> id </th>
            <th> role </th>
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

    if (this.state.userModalStatusSearching) {
      userModalContent.push(
        <Form onSubmit={this.searchForUser.bind(this)}>
          <Form.Label>Search for users:</Form.Label>
          <Form.Control 
            onChange={e => this.setState({ userSearchTerm: e.target.value })}
            value={this.state.userSearchTerm}
            type="text" id="user-search" name="user-search" />
          <button className="add-song-modal-btn" type="submit">
            search for users
          </button>
        </Form>
      );
    } else {
      userModalContent.push(
        <Form onSubmit={this.searchForUser.bind(this)}>
          <Form.Label>search for users:</Form.Label>
          <Form.Control 
            onChange={e => this.setState({ userSearchTerm: e.target.value })}
            value={this.state.userSearchTerm}
            type="text" id="user-search" name="user-search" />
          <button className="add-song-modal-btn" type="submit">
            search for users
          </button>
          <Form.Group>
            <Form.Label>results from search</Form.Label>
            <Form.Control as="select" custom onChange={this.onChangeUserSelection.bind(this)}>
              <option value="user">chose your user</option>
              {this.state.userSearchResults.map((result) => (
                <option value={result.id}>{result.name}</option>
              ))}
            </Form.Control>
            <Form.Control as="select" custom onChange={this.onChangeRoleSelection.bind(this)}>
              <option value="role">chose their role</option>
              <option value="editor">editor</option>
              <option value="viewer">viewer</option>
            </Form.Control>
          </Form.Group>
          <button className="add-song-modal-btn" onClick={this.addToMemberList.bind(this)}>
            add user to member list
          </button>
        </Form>
      )
    }

    return userModalContent;
  }

  incrementVote(track: Track) {
    var updatedTracks = this.state.votingSession;
    let trackIndex = updatedTracks.findIndex(t => t.albumName == track.albumName && t.artistName == track.artistName && t.trackName == track.trackName && t.uri == track.uri);
    
    // Toggles vote count
    if(this.userVotes.get(track.uri)) { // canVote = true
      updatedTracks[trackIndex].votes++;
    } else { // they've already liked it, now unliking
      updatedTracks[trackIndex].votes--;
    }

    // Flip vote status so if true -> false and vice versa
    this.userVotes.set(track.uri, !this.userVotes.get(track.uri));
    
    this._socket.emit('updateVotelist', updatedTracks[trackIndex].uri, updatedTracks[trackIndex].votes);
    
    updatedTracks.sort((a,b) => b.votes - a.votes);
    this.setState({ 
      votingSession: updatedTracks
    });
  }

  addToQueue(track: Track) {
    var votingTracks = [...this.state.votingSession];
    var trackIndex = votingTracks.findIndex(t => t.albumName == track.albumName && t.artistName == track.artistName && t.trackName == track.trackName && t.uri == track.uri);
    votingTracks.splice(trackIndex,1);
    this.insertTracks(this.state.votingSession[trackIndex].uri);
    this._socket.emit('updateVotelist', track.uri, 0);
    this._socket.emit('getVotelist');
    this.setState({ 
      tracks: [...this.state.tracks, track],
      votingSession: votingTracks
    }, () => {
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
    let modalContent = this.renderModalContent();
    let userModalContent = this.renderUserModalContent();

    return (
      <div className="App">
        <div className="curr-queue">
          <Link className="back-btn" to="/"> return to home</Link>
          <div className="queue-header">
            <div className="queue-name">
              <h1>{this.state.queueName}</h1>
            </div>
            {!this.state.isViewer && (
              <button className="invite-btn" onClick={this.addUserModalOpen.bind(this)}>
                view/add members
              </button>
            )}
          </div>

          <div className="queue-container">
            <Table className="queue-live-playlist">
              <thead>
                <tr>
                  <th>#</th>
                  <th>song name</th>
                  <th>album</th>
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

            <div className="suggestion-container">
              <Table className="queue-suggestions">
                <thead>
                  <tr>
                    <th>song title</th>
                    <th>album</th>
                    <th># of votes</th>
                    {!this.state.isViewer && (
                      <th>add to queue</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {this.state.votingSession.map((track : Track) => (
                    <tr>
                      <td className="songContainer">
                        <img src={track.albumCover}></img>
                        <div className="songInfoContainer">
                          <div style={{fontWeight: "bold"}}>{track.trackName}</div>
                          <div>{track.artistName}</div>
                        </div>
                      </td>
                      <td style={{fontWeight: "bold"}}>{track.albumName}</td>
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

              <button className="add-song-btn" onClick={this.addSongModalOpen.bind(this)}>
                add song to queue
              </button>
            </div>
          </div>

          <Modal show={this.state.addSongModal} onHide={this.addSongModalClose.bind(this)}>
            <Modal.Header closeButton>
              <Modal.Title>search for songs</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {modalContent}
            </Modal.Body>
          </Modal>

          <Modal show={this.state.addUserModal} onHide={this.addUserModalClose.bind(this)}>
            <Modal.Header closeButton>
              <Modal.Title>add members</Modal.Title>
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