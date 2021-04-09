import getDB from '../database/connection.js';
import axios from 'axios';
import userModel from './user.js';

const {validAccessToken, refreshAccessToken} = userModel;

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
 * @throws
 */
async function getPlaylistAccessToken(id, userID) {
  const db = await getDB();
  const query = {id, [`participants.${userID}`]: {$exists: true}};
  const record = await db.collection('playlists').findOne(query);
  // No matching record, return empty string
  if (!record) {
    throw new Error('unauthorized user');
  }

  let accessToken = record.tokens.accessToken;
  const refreshToken = record.tokens.refreshToken;
  if (!(await validAccessToken(accessToken))) {
    accessToken = await refreshAccessToken(refreshToken);
    await updatePlaylistAccessToken(id, accessToken);
  }

  return accessToken;
}

/**
 *
 * @param {string} id
 * @param {string} accessToken
 */
async function updatePlaylistAccessToken(id, accessToken) {
  const db = await getDB();
  const query = {id};
  const updateDocument = {$set: {[`tokens.accessToken`]: accessToken}};
  await db.collection('playlists').updateOne(query, updateDocument);
}


/**
 *
 * @param {string} userID
 * @param {string} role
 * @return {object}
 */
async function listDBPlaylists(userID, role) {
  const db = await getDB();
  let query = {[`participants.${userID}`]: {$exists: true}};
  // If specified role, select only documents with the specified role
  if (role) {
    query = {[`participants.${userID}`]: role};
  }
  const records = await db.collection('playlists').find(query).toArray(query);
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
    participants: {[userID]: 'owner'},
    votelist: {},
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
    [`participants.${userID}`]: 'owner',
  };
  await db.collection('playlist').deleteOne(query);
}

/**
 * Queries the database for all playlists that a user participates in
 * @param {string} userID
 * @param {string} role
 * @return {object}
 */
async function listPlaylists(userID, role) {
  // Query the database to get all playli
  const records = await listDBPlaylists(userID, role);

  // Query the spotify database to get details of all the lists.
  const result = await Promise.all(records.map(
      async (rec) => {
        const accessToken = await getPlaylistAccessToken(rec.id, userID);
        const result = await getSpotifyPlaylist(rec.id, accessToken);
        return result;
      }));

  return result;
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
  const accessToken = await getPlaylistAccessToken(id, userID);
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
  const accessToken = await getPlaylistAccessToken(id, userID);
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
  getAccessToken: getPlaylistAccessToken,
};
