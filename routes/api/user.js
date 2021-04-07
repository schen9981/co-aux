import express from 'express';
import userModel from '../../models/user.js';

const {getUserInfo} = userModel;
// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', function(req, res) {
  getUserInfo(req.session.tokens.accessToken)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

export default router;
