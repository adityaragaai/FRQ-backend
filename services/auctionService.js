import Rfq from '../models/Rfq.js';
import Bid from '../models/Bid.js';
import ActivityLog from '../models/ActivityLog.js';

export const processNewBid = async (rfqId, bidData) => {
  const rfq = await Rfq.findById(rfqId);
  if (!rfq) throw new Error('RFQ not found');

  const currentTime = new Date();

  // Step 1: Check if auction is active
  if (currentTime < rfq.startTime) {
    throw new Error('Auction has not started yet');
  }
  if (currentTime > rfq.forcedCloseTime || rfq.status === 'FORCE_CLOSED' || currentTime > rfq.bidCloseTime || rfq.status === 'CLOSED') {
    throw new Error('Auction is closed');
  }

  // Get current bids to determine L1 and ranking
  const currentBids = await Bid.find({ rfqId }).sort({ totalPrice: 1, createdAt: 1 });
  const currentL1 = currentBids.length > 0 ? currentBids[0] : null;

  // Calculate new bid total price
  const newBidTotalPrice = (bidData.freightCharges || 0) + (bidData.originCharges || 0) + (bidData.destinationCharges || 0);

  // Validate new bid must be strictly lower than current lowest
  if (currentL1 && newBidTotalPrice >= currentL1.totalPrice) {
    throw new Error(`Bid must be lower than the current lowest bid (₹${currentL1.totalPrice})`);
  }

  // Save the new bid
  const newBid = new Bid({
    ...bidData,
    rfqId,
    totalPrice: newBidTotalPrice
  });
  await newBid.save();

  // Log Bid Placed
  await ActivityLog.create({
    rfqId,
    eventType: 'BID_PLACED',
    description: `New bid of ₹${newBidTotalPrice} placed by ${bidData.supplierName}`
  });

  // Re-fetch bids for new ranking
  const newBids = await Bid.find({ rfqId }).sort({ totalPrice: 1, createdAt: 1 });
  const newL1 = newBids[0];

  // Determine ranking changes
  // In our simplified rule: Since the new bid MUST be lower than current L1, the new bid WILL ALWAYS be the new L1.
  // Thus, L1 ALWAYS changes when a valid bid is placed in this implementation.
  // However, we will still code it generically for correctness.
  const isL1Changed = !currentL1 || currentL1._id.toString() !== newL1._id.toString();
  const isRankChanged = true; // Any new bid in a strict descending rule shifts rankings

  if (isL1Changed && currentL1) {
    await ActivityLog.create({
      rfqId,
      eventType: 'L1_CHANGED',
      description: `L1 changed from ${currentL1.supplierName} to ${newL1.supplierName}`
    });
  }

  // Step 3: Check if bid is within trigger window
  const triggerWindowMs = rfq.triggerWindow * 60 * 1000;
  const inTriggerWindow = (rfq.bidCloseTime.getTime() - currentTime.getTime()) <= triggerWindowMs;

  if (inTriggerWindow) {
    // Step 4: Apply extension logic
    let shouldExtend = false;

    switch (rfq.extensionType) {
      case 'ANY_BID':
        shouldExtend = true;
        break;
      case 'RANK_CHANGE':
        shouldExtend = isRankChanged;
        break;
      case 'L1_CHANGE':
        shouldExtend = isL1Changed;
        break;
    }

    if (shouldExtend) {
      // Step 5: Extend bidCloseTime
      const extensionMs = rfq.extensionDuration * 60 * 1000;
      let newCloseTime = new Date(rfq.bidCloseTime.getTime() + extensionMs);

      // If newTime > forcedCloseTime → set bidCloseTime = forcedCloseTime
      if (newCloseTime.getTime() > rfq.forcedCloseTime.getTime()) {
        newCloseTime = rfq.forcedCloseTime;
      }

      // Check if it's actually extending (might already be at forcedCloseTime)
      if (newCloseTime.getTime() > rfq.bidCloseTime.getTime()) {
        const timeDiffMins = Math.round((newCloseTime.getTime() - rfq.bidCloseTime.getTime()) / 60000);
        
        rfq.bidCloseTime = newCloseTime;
        await rfq.save();

        await ActivityLog.create({
          rfqId,
          eventType: 'AUCTION_EXTENDED',
          description: `Auction extended by ${timeDiffMins} minutes due to ${rfq.extensionType} rule`
        });
      }
    }
  }

  return newBid;
};

export const getBidsWithRanking = async (rfqId) => {
  const bids = await Bid.find({ rfqId }).sort({ totalPrice: 1, createdAt: 1 }).lean();
  
  // Attach ranking
  return bids.map((bid, index) => ({
    ...bid,
    rank: `L${index + 1}`
  }));
};
