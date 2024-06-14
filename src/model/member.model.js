const mongoose = require('mongoose');
const referralCodeGenerator = require('referral-code-generator');

const addOnSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  monthlyAmount: {
    type: Number,
    required: true,
  },
});

const membershipSchema = new mongoose.Schema({
  membershipId: {
    type: String,
    unique: true,
    default: referralCodeGenerator.custom('lowercase', 5, 5, 'PorchPlus')
 },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  membershipType: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
  },
  dueDate: {
    type: Date,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  isFirstMonth: {
    type: Boolean,
    default: true
},
  invoiceLink: {
    type: String,
  },
  addOns: [addOnSchema],
});

const Membership = mongoose.model('Membership', membershipSchema);

module.exports = Membership;
