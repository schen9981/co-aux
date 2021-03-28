import express from 'express';
import userRouter from './api/user.js';
import playlistRouter from './api/playlist.js';
import searchRouter from './api/search.js';

// eslint-disable-next-line new-cap
const router = express.Router();

router.use('/user', userRouter);
router.use('/playlist', playlistRouter);
router.use('/search', searchRouter);

export default router;
