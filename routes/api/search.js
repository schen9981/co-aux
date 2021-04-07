import express from 'express';
import searchModel from '../../models/search.js';

const {searchTracks} = searchModel;

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', function(req, res) {
  searchTracks(req.query.name, req.session.tokens.accessToken)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

export default router;
