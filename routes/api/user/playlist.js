import express from 'express';
import userModel from '../../../models/user.js';

const {listSpotifyPlaylists} = userModel;

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', function(req, res) {
  listSpotifyPlaylists(req.session.tokens.accessToken)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});


export default router;
