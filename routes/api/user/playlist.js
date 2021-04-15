import express from 'express';
import userModel from '../../../models/user.js';
import tracksModel from '../../../models/tracks.js';

const {listSpotifyPlaylists} = userModel;
const {getSpotifyPlaylistTracks} = tracksModel;

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', function(req, res) {
  listSpotifyPlaylists(req.session.tokens.accessToken)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

router.get('/:id/tracks', function(req, res) {
  getSpotifyPlaylistTracks(req.params.id, req.session.tokens.accessToken)
      .then((data) => res.json(data))
      .catch((err) => req.json(err));
});


export default router;
