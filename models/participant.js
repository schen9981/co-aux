import getDB from '../database/connection.js';

/**
 *
 * @param {string} playlistID
 * @param {string} userID
 * @return {object}
 */
async function listParticipants(playlistID, userID) {
  const db = await getDB();
  const query = {id: playlistID, [`participants.${userID}`]: {$exists: true}};
  const record = await db.collection('playlists').findOne(query);
  return record.participants;
}

/**
 *
 * @param {string} playlistID
 * @param {string} userID
 * @param {string} participantID
 * @param {string} participantRole
 * @return {object}
 */
async function createParticipant(playlistID, userID,
    participantID, participantRole) {
  if (!participantRole || !participantID) {
    throw new Error('id or role of a participant unspecified');
  }

  const db = await getDB();
  const query = {
    id: playlistID,
    [`participants.${userID}`]: 'owner',
  };
  const updateDocument = {
    $set: {[`participants.${participantID}`]: participantRole},
  };
  const result = await db.collection('playlists')
      .updateOne(query, updateDocument);
  return result.participants;
}

/**
 *
 * @param {string} playlistID
 * @param {string} userID
 * @param {string} participantID
 * @return {object}
 */
async function removeParticipant(playlistID, userID, participantID) {
  const db = await getDB();
  const query = {
    id: playlistID,
    [`participants.${userID}`]: 'owner',
  };
  const updateDocument = {
    $unset: {[`participants.${participantID}`]: ''},
  };
  const result = await db.collection('playlists')
      .updateOne(query, updateDocument);
  return result.participants;
}

export default {
  listParticipants,
  createParticipant,
  removeParticipant,
};
