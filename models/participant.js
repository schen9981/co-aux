import getDB from '../database/connection.js';

/**
 *
 * @param {string} playlistID
 * @param {string} userID
 * @return {object}
 */
async function listParticipants(playlistID, userID) {
  const db = await getDB();
  const query = {id: playlistID, participants: {$elemMatch: {userID}}};
  const record = db.collection('playlists').findOne(query);
  return await record.tokens.participants;
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
  const db = await getDB();
  const query = {
    id: playlistID,
    participants: {$elemMatch: {userID, role: 'owner'}},
  };
  const updateDocument = {
    $push: {participants: {userID: participantID, role: participantRole}},
  };
  const result = await db.collection('playlists')
      .updateOne(query, updateDocument);
  return result;
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
    participants: {$elemMatch: {userID, role: 'owner'}},
  };
  const updateDocument = {
    $pull: {participants: {userID: participantID}},
  };
  const result = await db.collection('playlists')
      .updateOne(query, updateDocument);
  return result;
}

export default {
  listParticipants,
  createParticipant,
  removeParticipant,
};
