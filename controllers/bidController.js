import { processNewBid, getBidsWithRanking } from '../services/auctionService.js';

export const placeBid = async (req, res) => {
  try {
    const { rfqId, ...bidData } = req.body;
    
    if (!rfqId) {
      return res.status(400).json({ error: 'rfqId is required' });
    }

    const newBid = await processNewBid(rfqId, bidData);
    res.status(201).json({ message: 'Bid placed successfully', bid: newBid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getBidsForRfq = async (req, res) => {
  try {
    const { rfqId } = req.params;
    const bidsWithRanking = await getBidsWithRanking(rfqId);
    
    res.status(200).json(bidsWithRanking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
