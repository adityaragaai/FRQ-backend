import Rfq from '../models/Rfq.js';

export const updateRfqStatuses = async () => {
  const currentTime = new Date();
  
  // Find all ACTIVE RFQs that have passed their close times
  const activeRfqs = await Rfq.find({ status: 'ACTIVE' });

  for (const rfq of activeRfqs) {
    if (currentTime > rfq.forcedCloseTime) {
      rfq.status = 'FORCE_CLOSED';
      await rfq.save();
    } else if (currentTime > rfq.bidCloseTime) {
      rfq.status = 'CLOSED';
      await rfq.save();
    }
  }
};
