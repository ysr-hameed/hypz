import express from 'express';
import { googleOAuth, githubOAuth, getOAuthUrls } from '../controllers/oauthController.js';

const router = express.Router();

// Get OAuth URLs
router.get('/urls', getOAuthUrls);

// OAuth callbacks
router.post('/google', googleOAuth);
router.post('/github', githubOAuth);

export default router;
