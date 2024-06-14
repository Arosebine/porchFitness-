const mongoose = require('mongoose');

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
