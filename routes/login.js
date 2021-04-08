import express from 'express';
import userModel from '../models/user.js';

const {getSpotifyLoginPage, getUserInfo, getAccessTokens} = userModel;

// eslint-disable-next-line new-cap
const router = express.Router();

// Redirect to login page of spotify.
router.get('/', function(req, res) {
  res.redirect(getSpotifyLoginPage());
});

// Redirected path to get access and refresh tokens.
router.get('/token', function(req, res) {
  getAccessTokens(req.query.code)
      .then((tokens) => {
        req.session.tokens = tokens;
        return getUserInfo(tokens.accessToken);
      })
      .then((userInfo) => {
        req.session.userID = userInfo.id;
        res.redirect('/');
      })
      .catch((err) => console.log(err));
});

export default router;
