import express from 'express';
import { createRfq, getAllRfqs, getRfqById } from '../controllers/rfqController.js';
import { placeBid, getBidsForRfq } from '../controllers/bidController.js';
import { getActivityLogs } from '../controllers/activityController.js';

const router = express.Router();

// RFQ Routes
router.post('/rfq', createRfq);
router.get('/rfq', getAllRfqs);
router.get('/rfq/:id', getRfqById);

// Bid Routes
router.post('/bid', placeBid);
router.get('/bid/:rfqId', getBidsForRfq);

// Activity Routes
router.get('/activity/:rfqId', getActivityLogs);

export default router;
