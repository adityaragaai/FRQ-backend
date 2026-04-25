import mongoose from 'mongoose';

const rfqSchema = new mongoose.Schema({
  rfqId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  bidCloseTime: {
    type: Date,
    required: true
  },
  forcedCloseTime: {
    type: Date,
    required: true
  },
  pickupDate: {
    type: Date,
    required: true
  },
  triggerWindow: {
    type: Number, // in minutes
    required: true,
    default: 2
  },
  extensionDuration: {
    type: Number, // in minutes
    required: true,
    default: 5
  },
  extensionType: {
    type: String,
    enum: ['ANY_BID', 'RANK_CHANGE', 'L1_CHANGE'],
    required: true,
    default: 'ANY_BID'
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'CLOSED', 'FORCE_CLOSED'],
    default: 'ACTIVE'
  }
}, { timestamps: true });

// Pre-save validation: forcedCloseTime must be > bidCloseTime
rfqSchema.pre('save', function (next) {
  if (this.forcedCloseTime <= this.bidCloseTime) {
    return next(new Error('forcedCloseTime must be greater than bidCloseTime'));
  }
  next();
});

const Rfq = mongoose.model('Rfq', rfqSchema);
export default Rfq;
