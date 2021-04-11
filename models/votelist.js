import getDB from '../database/connection.js';
import tracksModel from './tracks.js';

const {getSpotifyTrack} = tracksModel;

/**
 *
 * @param {string} playlistID
 * @param {string} accessToken
 * @return {object}
 */
async function getVotelist(playlistID, accessToken) {
  const db = await getDB();
  const query = {id: playlistID};
  const votelist = (await db.collection('playlists').findOne(query)).votelist;
  const tracks = await Promise.all(Object.entries(votelist)
      .map(async ([k, v]) => {
        const t = await getSpotifyTrack(k, accessToken);
        t.votes = v;
        return t;
      }));
  return tracks;
}

/**
 *
 * @param {string} playlistID
 * @param {string} trackID
 * @param {number} votes
 * @param {string} accessToken
 * @return {object}
 */
async function updateVotelist(playlistID, trackID, votes, accessToken) {
  const db = await getDB();
  const query = {id: playlistID};
  let updateDocument;
  if (votes >= 1) {
    updateDocument = {
      $set: {[`votelist.${trackID}`]: votes},
    };
  } else if (votes === 0) {
    updateDocument = {
      $unset: {[`votelist.${trackID}`]: ''},
    };
  }
  await db.collection('playlists')
      .updateOne(query, updateDocument);
  const result = await getVotelist(playlistID, accessToken);
  return result;
}

export default {
  getVotelist,
  updateVotelist,
};
