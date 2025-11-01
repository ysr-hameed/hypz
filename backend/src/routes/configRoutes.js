import express from 'express';
import { getPublicConfig } from '../controllers/configController.js';

const router = express.Router();

// Public config endpoint (no auth required)
router.get('/public', getPublicConfig);

export default router;
