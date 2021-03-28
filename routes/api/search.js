import express from 'express';
import axios from 'axios';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', function(req, res) {
  axios
      .get('https://api.spotify.com/v1/search', {
        headers: {
          Authorization: `Bearer ${req.session.tokens.access_token}`,
        },
        params: {
          q: req.query.name,
          type: 'album,track,artist',
        },
      })
      .then((response) => res.json(response.data))
      .catch((err) => res.json(err));
});

export default router;
