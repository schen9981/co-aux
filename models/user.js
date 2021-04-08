import getDB from '../database/connection.js';
import axios from 'axios';
import querystring from 'querystring';
import config from '../config.json';

const context = process.env.NODE_ENV === 'prod' ?
config.prod.spotify : config.dev.spotify;

/**
 *
 * @param {string} accessToken
 * @return {Array}
 */
async function listSpotifyPlaylists(accessToken) {
  const url = 'https://api.spotify.com/v1/me/playlists';
  const config = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  };
  const response = await axios.get(url, config);
  return response.data.items;
}


/**
 *
 * @param {string} id
 * @param {string} name
 */
async function registerDBUser(id, name) {
  const db = await getDB();
  const query = {
    id,
    name,
  };
  const user = await db.collection('users').findOne(query);
  if (!user) {
    await db.collection('users').insertOne(query);
  }
}

/**
 * @return {object}
 */
async function listDBUsers() {
  const db = await getDB();
  const query = {};
  const users = await db.collection('users').find(query).toArray();
  return users;
}

/**
 *
 * @return {object}
 */
async function listUsers() {
  const users = await listDBUsers();
  return users;
}

/**
 *
 * @param {string} accessToken
 * @return {object}
 */
async function getUserInfo(accessToken) {
  const url = 'https://api.spotify.com/v1/me';
  const config = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  };
  const response = await axios.get(url, config);
  const user = response.data;
  await registerDBUser(user.id, user.display_name);
  return user;
}

/**
 *
 * @param {string} code
 * @return {object}
 */
async function getAccessTokens(code) {
  const url = 'https://accounts.spotify.com/api/token';
  const data = new URLSearchParams({
    'code': code,
    'redirect_uri': context.redirectUri,
    'grant_type': 'authorization_code',
    'client_id': context.clientId,
    'client_secret': context.clientSecret,
  });
  const response = await axios.post(url, data);
  const tokens = {
    'accessToken': response.data.access_token,
    'refreshToken': response.data.refresh_token,
  };
  return tokens;
}

/**
 *
 * @param {string} accessToken
 * @return {boolean}
 */
async function validAccessToken(accessToken) {
  const url = 'https://api.spotify.com/v1/me';
  const config = {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  };
  try {
    const response = await axios.get(url, config);
    return response.status === 200;
  } catch (e) {
    return false;
  }
}

/**
 *
 * @param {string} refreshToken
 */
async function refreshAccessToken(refreshToken) {
  const url = 'https://accounts.spotify.com/api/token';
  const data = new URLSearchParams({
    'grant_type': 'refresh_token',
    'refresh_token': refreshToken,
    'client_id': context.clientId,
    'client_secret': context.clientSecret,
  });
  const response = await axios.post(url, data);
  return response.data.access_token;
}


/**
 *
 * @return {string}
 */
function getSpotifyLoginPage() {
  return `https://accounts.spotify.com/authorize?${
    querystring.stringify({
      response_type: 'code',
      client_id: context.clientId,
      scope: context.scope,
      redirect_uri: context.redirectUri,
    })
  }`;
}

export default {
  listUsers,
  listSpotifyPlaylists,
  getUserInfo,
  getSpotifyLoginPage,
  getAccessTokens,
  validAccessToken,
  refreshAccessToken,
};
