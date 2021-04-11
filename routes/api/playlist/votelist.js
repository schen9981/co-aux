import playlistModel from '../../../models/playlist.js';
import votelistModel from '../../../models/votelist.js';
import app from '../../../app.js';

const {getPlaylistAccessToken} = playlistModel;
const {getVotelist, updateVotelist} = votelistModel;

/**
 *
 * @param {socket} socket
 */
const connectionHandler = async (socket) => {
  const id = socket.handshake.query.id;
  const roomID = `/api/playlist/${id}/votelist`;
  const accessToken = await getPlaylistAccessToken(id,
      socket.request.session.userID);

  // If the user doesn't have access, disconnect
  if (!accessToken) {
    socket.disconnect();
  }

  socket.join(roomID);

  socket.on('get', async () => {
    const result = await getVotelist(id, accessToken);
    socket.emit('update', result);
  });

  socket.on('update', async (trackURI, votes) => {
    const uriTokens = trackURI.split(':');
    const trackID = uriTokens[uriTokens.length - 1];
    const result = await updateVotelist(id, trackID, votes, accessToken);
    app.get('socketio').of('/api/playlist/votelist').to(roomID)
        .emit('update', result);
  });


  socket.emit('verified');
};

export default connectionHandler;
