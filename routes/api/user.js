import express from 'express';
import userModel from '../../models/user.js';

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

export default router;
