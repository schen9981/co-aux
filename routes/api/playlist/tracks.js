import express from 'express';
import tracksModel from '../../../models/tracks.js';

const {
  getTracks,
  createTracks,
  removeTracks,
} = tracksModel;

// eslint-disable-next-line new-cap
const router = express.Router({mergeParams: true});

router.get('/', function(req, res) {
  getTracks(req.params.id, req.session.userID)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

router.post('/', function(req, res) {
  createTracks(req.params.id, req.session.userID,
      req.body.position, req.body.uris)
      .then(async (data) => {
        const roomID = `/api/playlist/${req.params.id}`;
        const tracks = await getTracks(req.params.id, req.session.userID);
        req.app.get('socketio').of('/api/playlist').to(roomID)
            .emit('tracksUpdate', tracks);
        res.json(data);
      })
      .catch((err) => res.json(err));
});

router.delete('/', function(req, res) {
  removeTracks(req.params.id, req.session.userID, req.body.tracks)
      .then(async (data) => {
        const roomID = `/api/playlist/${req.params.id}`;
        const tracks = await getTracks(req.params.id, req.session.userID);
        req.app.get('socketio').of('/api/playlist').to(roomID)
            .emit('tracksUpdate', tracks);
        res.json(data);
      })
      .catch((err) => res.json(err));
});

export default router;
