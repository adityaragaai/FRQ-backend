import Rfq from '../models/Rfq.js';
import { getBidsWithRanking } from '../services/auctionService.js';

export const createRfq = async (req, res) => {
  try {
    const rfq = new Rfq(req.body);
    await rfq.save();
    res.status(201).json(rfq);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllRfqs = async (req, res) => {
  try {
    const rfqs = await Rfq.find().sort({ createdAt: -1 });
    res.status(200).json(rfqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRfqById = async (req, res) => {
  try {
    const rfq = await Rfq.findById(req.params.id).lean();
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' });

    // Also get the current lowest bid (L1)
    const bids = await getBidsWithRanking(rfq._id);
    const currentLowestBid = bids.length > 0 ? bids[0] : null;

    res.status(200).json({
      ...rfq,
      currentLowestBid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
