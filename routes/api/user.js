import express from 'express';
import userModel from '../../models/user.js';
import playlistRouter from './user/playlist.js';

const {listUsers, getUserInfo} = userModel;

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', function(req, res) {
  getUserInfo(req.session.tokens.accessToken)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

router.get('/all', function(req, res) {
  listUsers()
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

router.use('/playlist', playlistRouter);

export default router;
