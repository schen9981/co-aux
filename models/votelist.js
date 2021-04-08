import getDB from '../database/connection.js';

/**
 *
 * @param {string} playlistID
 * @return {object}
 */
async function getVotelist(playlistID) {
  const db = await getDB();
  const query = {id: playlistID};
  const result = db.collection('playlists').findOne(query);
  return await result.votelist;
}

/**
 *
 * @param {string} playlistID
 * @param {string} trackID
 * @param {number} vote
 * @return {object}
 */
async function updateVotelist(playlistID, trackID, vote) {
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
  const result = await db.collection('playlists')
      .updateOne(query, updateDocument);
  return result.votelist;
}

export default {
  getVotelist,
  updateVotelist,
};
