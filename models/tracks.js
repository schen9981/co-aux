import axios from 'axios';
import {getAccessToken} from './playlist.js';

/**
 *
 * @param {string} playlistID
 * @param {string} accessToken
 * @return {object}
 */
async function getSpotifyTracks(playlistID, accessToken) {
  const url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
  const config = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    params: {
      'market': 'US',
    },
  };
  const response = await axios.get(url, config);
  return response.data;
}

/**
 *
 * @param {string} playlistID
 * @param {string} accesToken
 * @param {string} position
 * @param {Array} uris
 * @return {object}
 */
async function createSpotifyTracks(playlistID, accesToken, position, uris) {
  const url = `https://api.spotify.com/v1/playlists/${playlistID}/tracks`;
  const data = {
    'position': position,
    'uris': uris,
  };
  const config = {
    headers: {
      'Authorization': `Bearer ${accesToken}`,
      'Content-Type': 'application/json',
    },
  };
  const response = await axios.post(url, data, config);
  return response.data;
}

/**
 *
 * @param {string} playlistID
 * @param {string} accessToken
 * @param {Array} tracks
 * @return {object}
 */
async function removeSpotifyTracks(playlistID, accessToken, tracks) {
  const url = `https://api.spotify.com/v1/playlists/${req.params.playlist_id}/tracks`;
  const config = {
    headers: {
      'Authorization': `Bearer ${req.session.tokens.access_token}`,
      'Content-Type': 'application/json',
    },
    data: {
      'tracks': req.body.tracks,
    },
  };
  const response = await axios.delete(url, config);
  return response.data;
}

/**
 *
 * @param {string} playlistID
 * @param {string} userID
 * @return {object}
 */
async function getTracks(playlistID, userID) {
  const accessToken = await getAccessToken(playlistID, userID);
  const result = await getSpotifyTracks(playlistID, accessToken);
  return result;
}

/**
 *
 * @param {string} playlistID
 * @param {string} userID
 * @param {string} position
 * @param {Array} uris
 * @return {object}
 */
async function createTracks(playlistID, userID, position, uris) {
  const accessToken = await getAccessToken(playlistID, userID);
  const result = await createSpotifyTracks(playlistID, accessToken,
      position, uris);
  return result;
}

/**
 *
 * @param {string} playlistID
 * @param {string} userID
 * @param {Array} tracks
 * @return {object}
 */
async function removeTracks(playlistID, userID, tracks) {
  const accessToken = await getAccessToken(playlistID, userID);
  const result = await removeSpotifyTracks(playlistID, accessToken, tracks);
  return result;
}

export default {
  getTracks,
  createTracks,
  removeTracks,
};
