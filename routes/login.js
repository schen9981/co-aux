import express from 'express';
import querystring from 'querystring';
import config from '../config.json';
import axios from 'axios';

// eslint-disable-next-line new-cap
const router = express.Router();

const context = process.env.NODE_ENV === 'prod' ?
config.prod.spotify : config.dev.spotify;

// Redirect to login page of spotify.
router.get('/', function(req, res) {
  res.redirect(`https://accounts.spotify.com/authorize?${
    querystring.stringify({
      response_type: 'code',
      client_id: context.client_id,
      scope: context.scope,
      redirect_uri: context.redirect_uri,
    })
  }`);
});

// Redirected path to get access and refresh tokens.
router.get('/token', function(req, res) {
  const params = new URLSearchParams({
    code: req.query.code,
    redirect_uri: context.redirect_uri,
    grant_type: 'authorization_code',
    client_id: context.client_id,
    client_secret: context.client_secret,
  });
  axios
      .post('https://accounts.spotify.com/api/token', params)
      .then((response) => {
        req.session.tokens = {
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
        };
        res.redirect('/');
      })
      .catch((err) => {
        console.log(err);
        res.json(err);
      });
});

export default router;
