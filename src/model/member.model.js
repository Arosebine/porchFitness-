const mongoose = require('mongoose');

const addOnSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  addonName: {
    type: String,
    required: true,
  },
  monthlyAmount: {
    type: Number,
    required: true,
  },
  isPaid: {
    type: Boolean,
    default: false,
  }
},
{
  timestamps: true,
});

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  membershipId: {
    type: String,
    required: true,
  },
  paymentType: {
    type: String,
    required: true,
  },
  paidFor: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
},
{
  timestamps: true,
})



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
  addOns: [addOnSchema],
},
{
  timestamps: true,
});

const Membership = mongoose.model('Membership', membershipSchema);
const AddOn = mongoose.model('AddOn', addOnSchema);
const Payment = mongoose.model('Payment', paymentSchema);


module.exports = {
  Membership,
  AddOn,
  Payment,
};
