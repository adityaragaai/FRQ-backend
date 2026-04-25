import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rfq',
    required: true
  },
  supplierName: {
    type: String,
    required: true
  },
  freightCharges: {
    type: Number,
    required: true,
    min: 0
  },
  originCharges: {
    type: Number,
    required: true,
    min: 0
  },
  destinationCharges: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true
  },
  transitTime: {
    type: Number, // days
    required: true
  },
  validity: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Pre-validate hook to calculate totalPrice
bidSchema.pre('validate', function (next) {
  this.totalPrice = (this.freightCharges || 0) + (this.originCharges || 0) + (this.destinationCharges || 0);
  next();
});

const Bid = mongoose.model('Bid', bidSchema);
export default Bid;
