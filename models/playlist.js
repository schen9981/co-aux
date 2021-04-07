import getDB from '../database/connection.js';
import axios from 'axios';

/**
 * Get a playlist's information from spotify server
 * @param {string} id
 * @param {string} accessToken
 * @return {object}
 */
async function getSpotifyPlaylist(id, accessToken) {
  const url = `https://api.spotify.com/v1/playlists/${id}`;
  const config = {headers: {'Authorization': `Bearer ${accessToken}`}};
  const response = await axios.get(url, config);
  return response.data;
}

/**
 * Create a playlist on spotify server
 * @param {string} userID
 * @param {string} accessToken
 * @param {string} name
 * @param {string} collaborative
 * @param {string} description
 * @return {object}
 */
async function createSpotifyPlaylist(userID, accessToken,
    name, collaborative, description) {
  const url = `https://api.spotify.com/v1/users/${userID}/playlists`;
  const body = {
    'name': name,
    'collaborative': collaborative,
    'description': description,
  };
  const config = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  const response = await axios.post(url, body, config);
  return response.data;
}

/**
 *
 * @param {string} id
 * @param {string} accessToken
 * @param {string} name
 * @param {string} collaborative
 * @param {string} description
 * @return {object}
 */
async function updateSpotifyPlaylist(id, accessToken,
    name, collaborative, description) {
  const url = `https://api.spotify.com/v1/playlists/${id}`;
  const body = {
    'name': name,
    'collaborative': collaborative,
    'description': description,
  };
  const config = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  const response = await axios.put(url, body, config);
  return response.data;
}

/**
 * @param {string} id
 * @param {string} userID
 * @return {string}
 */
async function getAccessToken(id, userID) {
  const db = await getDB();
  const query = {id, participants: {$elemMatch: {userID}}};
  const record = await db.collection('playlists').findOne(query);
  return record.tokens.access_token;
}


/**
 *
 * @param {string} userID
 * @return {object}
 */
async function listDBPlaylists(userID) {
  const db = await getDB();
  const query = {participants: {$elemMatch: {userID}}};
  const records = await db.collection('playlists').find().toArray(query);
  return records;
}

/**
 *
 * @param {string} id
 * @param {string} userID
 * @param {string} accessToken
 * @param {string} refreshToken
 */
async function createDBPlaylist(id, userID, accessToken, refreshToken) {
  const db = await getDB();
  const query = {
    id,
    tokens: {accessToken: accessToken, refreshToken: refreshToken},
    participants: [{userID, role: 'owner'}],
  };
  await db.collection('playlists').insertOne(query);
}

/**
 *
 * @param {string} id
 * @param {string} userID
 */
async function removeDBPlaylist(id, userID) {
  const db = await getDB();
  const query = {
    id,
    participants: {$elemMatch: {userId: userID, role: 'owner'}},
  };
  await db.collection('playlist').deleteOne(query);
}

/**
 * Queries the database for all playlists that a user participates in
 * @param {string} userID
 * @return {object}
 */
async function listPlaylists(userID) {
  // Query the database to get all playli
  const records = listDBPlaylists(userID);

  // Query the spotify database to get details of all the lists.
  return Promise.all(records.map(
      (rec) => getSpotifyPlaylist(rec.id, rec.tokens.accessToken)));
}

/**
 *
 * @param {string} id
 * @param {string} userID
 * @return {object}
 */
async function getPlaylist(id, userID) {
  // Query the database to get the playlist record
  // with the given id and the user participates in
  const accessToken = getAccessToken(id, userID);
  return await getSpotifyPlaylist(id, accessToken);
}

/**
 * Create a playlist in the database and spotify server.
 * @param {string} userID
 * @param {string} accessToken
 * @param {string} refreshToken
 * @param {string} name
 * @param {boolean} collaborative
 * @param {string} description
 * @return {object}
 */
async function createPlaylist(userID, accessToken, refreshToken,
    name, collaborative, description) {
  // Create a playlist on the spotify account
  const result = await createSpotifyPlaylist(userID, accessToken,
      name, collaborative, description);

  // Insert a document into the playlists collection.
  await createDBPlaylist(result.id, userID, accessToken, refreshToken);

  return result;
}

/**
 *
 * @param {string} id
 * @param {string} userID
 * @param {string} name
 * @param {string} collaborative
 * @param {string} description
 * @return {object}
 */
async function updatePlaylist(id, userID, name, collaborative, description) {
  const accessToken = await getAccessToken(id, userID);
  const result = await updateSpotifyPlaylist(id, accessToken,
      name, collaborative, description);
  return result;
}

/**
 *
 * @param {string} id
 * @param {string} userID
 * @return {object}
 */
async function removePlaylist(id, userID) {
  await removeDBPlaylist(id, userID);
  return 'sucessfully removed playlist';
}

export default {
  listPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  removePlaylist,
  getAccessToken,
};
