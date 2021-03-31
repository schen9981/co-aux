import express from 'express';
import axios from 'axios';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', function(req, res) {
  axios
      .get('https://api.spotify.com/v1/me/playlists', {
        headers: {
          'Authorization': `Bearer ${req.session.tokens.access_token}`,
        },
      })
      .then((response) => res.json(response.data))
      .catch((err) => res.json(err));
});

router.get('/:id', function(req, res) {
  axios
      .get(`https://api.spotify.com/v1/playlists/${req.params.id}`, {
        headers: {
          'Authorization': `Bearer ${req.session.tokens.access_token}`,
        },
      })
      .then((response) => res.json(response.data))
      .catch((err) => res.json(err));
});

router.post('/', function(req, res) {
  axios
      .post(`https://api.spotify.com/v1/users/${req.session.user_id}/playlists`,
          {
            'name': req.body.name,
            'collaborative': req.body.collaborative,
            'description': req.body.description,
          },
          {
            headers: {
              'Authorization': `Bearer ${req.session.tokens.access_token}`,
              'Content-Type': 'application/json',
            },
          })
      .then((response) => res.json(response.data))
      .catch((err) => res.json(err));
});

router.put('/:id', function(req, res) {
  axios
      .put(`https://api.spotify.com/v1/playlists/${req.params.id}`,
          {
            'name': req.body.name,
            'collaborative': req.body.collaborative,
            'description': req.body.description,
          },
          {
            headers: {
              'Authorization': `Bearer ${req.session.tokens.access_token}`,
              'Content-Type': 'application/json',
            },
          })
      .then((response) => res.json(response.data))
      .catch((err) => res.json(err));
});

router.get('/:playlist_id/tracks', function(req, res) {
  axios
      .get(`https://api.spotify.com/v1/playlists/${req.params.playlist_id}/tracks`, {
        headers: {
          'Authorization': `Bearer ${req.session.tokens.access_token}`,
        },
        params: {
          'market': 'US',
        },
      })
      .then((response) => res.json(response.data))
      .catch((err) => res.json(err));
});

router.post('/:playlist_id/tracks', function(req, res) {
  axios
      .post(`https://api.spotify.com/v1/playlists/${req.params.playlist_id}/tracks`,
          {
            'position': req.body.position,
            'uris': req.body.uris,
          },
          {
            headers: {
              'Authorization': `Bearer ${req.session.tokens.access_token}`,
              'Content-Type': 'application/json',
            },
          })
      .then((response) => res.json(response.data))
      .catch((err) => res.json(err));
});

router.delete('/:playlist_id/tracks', function(req, res) {
  axios
      .delete(`https://api.spotify.com/v1/playlists/${req.params.playlist_id}/tracks`,
          {
            headers: {
              'Authorization': `Bearer ${req.session.tokens.access_token}`,
              'Content-Type': 'application/json',
            },
            data: {
              'tracks': req.body.tracks,
            },
          })
      .then((response) => res.json(response.data))
      .catch((err) => res.json(err));
});

export default router;
