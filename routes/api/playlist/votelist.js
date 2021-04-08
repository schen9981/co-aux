import playlistModel from '../../../models/playlist.js';
import votelistModel from '../../../models/votelist.js';
import app from '../../../app.js';

const {getAccessToken} = playlistModel;
const {getVotelist, updateVotelist} = votelistModel;

/**
 *
 * @param {socket} socket
 */
function connectionHandler(socket) {
  const id = socket.handshake.query.id;
  const accessToken = getAccessToken(id, socket.request.session.userID);
  const roomID = `/api/playlist/${id}/votelist`;

  // If the user doesn't have access, disconnect
  if (!accessToken) {
    socket.disconnect();
  }

  socket.join(roomID);


  socket.on('get', async () => {
    const result = await getVotelist(id);
    app.get('socketio').to(roomID)
        .emit('update', result);
  });

  socket.on('update', async (trackID, vote) => {
    const result = await updateVotelist(id, trackID, vote);
    app.get('socketio').to(roomID)
        .emit('update', result);
  });
};

export default connectionHandler;
