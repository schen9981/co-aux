import express from 'express';
import participantsModel from '../../../models/participant.js';

const {
  listParticipants,
  createParticipant,
  removeParticipant,
} = participantsModel;

// eslint-disable-next-line new-cap
const router = express.Router({mergeParams: true});

router.get('/', function(req, res) {
  listParticipants(req.params.id, req.session.userID)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

router.post('/', function(req, res) {
  createParticipant(req.params.id, req.session.userID,
      req.body.id, req.body.role)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

router.delete('/:participant_id', function(req, res) {
  removeParticipant(req.params.id,
      req.session.userID, req.params.participant_id)
      .then((data) => res.json(data))
      .catch((err) => res.json(err));
});

export default router;

