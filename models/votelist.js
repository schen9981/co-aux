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
        const t = getSpotifyTrack(k, accessToken);
        t.vote = v;
        return t;
      }));
  return tracks;
}

/**
 *
 * @param {string} playlistID
 * @param {string} trackID
 * @param {number} vote
 * @param {string} accessToken
 * @return {object}
 */
async function updateVotelist(playlistID, trackID, vote, accessToken) {
  const db = await getDB();
  const query = {id: playlistID};
  let updateDocument;
  if (vote >= 1) {
    updateDocument = {
      $set: {[`votelist.${trackID}`]: vote},
    };
  } else if (vote === 0) {
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
