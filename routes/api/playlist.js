import express from 'express';
import playlistModel from '../../models/playlist.js';
import tracksRouter from './playlist/tracks.js';
import participantRouter from './playlist/participant.js';

const {
  listPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  removePlaylist,
} = playlistModel;


// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', function(req, res) {
  listPlaylists(req.session.userID, req.query.role)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

router.get('/:id', function(req, res) {
  getPlaylist(req.params.id, req.session.userID)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

router.post('/', function(req, res) {
  createPlaylist(req.session.userID,
      req.session.tokens.accessToken, req.session.tokens.refreshToken,
      req.body.name, req.body.collaborative, req.body.description)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

router.put('/:id', function(req, res) {
  updatePlaylist(req.params.id, req.session.userID,
      req.body.name, req.body.collaborative, req.body.description)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

router.delete('/:id', function(req, res) {
  removePlaylist(req.params.id, req.session.userID)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

router.use('/:id/tracks', tracksRouter);
router.use('/:id/participant', participantRouter);

export default router;
