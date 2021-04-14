import playlistModel from '../../models/playlist.js';
import votelistModel from '../../models/votelist.js';
import trackModel from '../../models/tracks.js';
import app from '../../app.js';

const {getPlaylistAccessToken} = playlistModel;
const {getVotelist, updateVotelist} = votelistModel;
const {} = trackModel;

/**
 *
 * @param {socket} socket
 */
const connectionHandler = async (socket) => {
  const id = socket.handshake.query.id;
  const roomID = `/api/playlist/${id}`;
  const accessToken = await getPlaylistAccessToken(id,
      socket.request.session.userID);

  // If the user doesn't have access, disconnect
  if (!accessToken) {
    socket.disconnect();
  }

  socket.join(roomID);

  socket.on('getVotelist', async () => {
    const result = await getVotelist(id, accessToken);
    socket.emit('votelistUpdate', result);
  });

  socket.on('updateVotelist', async (trackURI, votes) => {
    const uriTokens = trackURI.split(':');
    const trackID = uriTokens[uriTokens.length - 1];
    const result = await updateVotelist(id, trackID, votes, accessToken);
    app.get('socketio').of('/api/playlist').to(roomID)
        .emit('votelistUpdate', result);
  });

  socket.emit('verified');
};

export default connectionHandler;
