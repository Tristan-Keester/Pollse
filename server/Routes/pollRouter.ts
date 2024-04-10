import express from 'express';

import pollController from '../Controllers/pollController';

const router = express.Router();

router.post(
  '/create', 
  pollController.createPoll,
  // !!! create a new poll with questions and answers
  // !!! send redirect to new poll for creator
  (_req, res) => {
    res.status(200).json('Made a poll');
  }
);

export default router;
