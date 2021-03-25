import express from 'express';
import querystring from 'querystring';
import config from '../config.json';

// eslint-disable-next-line new-cap
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.redirect(`https://accounts.spotify.com/authorize?${querystring.stringify({
    response_type: 'code',
    client_id: config.dev.spotify.client_id,
    scope: config.dev.spotify.scope,
    redirect_uri: config.dev.spotify.redirect_uri,
  })}`);
});

export default router;
