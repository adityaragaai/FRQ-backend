import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rfq',
    required: true
  },
  eventType: {
    type: String,
    enum: ['BID_PLACED', 'AUCTION_EXTENDED', 'L1_CHANGED'],
    required: true
  },
  description: {
    type: String,
    required: true
  }
}, { timestamps: true });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
