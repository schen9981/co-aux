import express from 'express';

// eslint-disable-next-line new-cap
const router = express.Router();

router.get('/', function(req, res) {
  if (!req.session.tokens) {
    res.redirect('/login');
  }
  res.json('successfully get token');
});

export default router;
