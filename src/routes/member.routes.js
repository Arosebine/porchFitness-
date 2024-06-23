const express = require('express');
const { auth } = require("../middleware/auth");
const router = express.Router();
const membershipController = require('../controller/member.controller');

router.use(auth);
router.post('/memberships', membershipController.createMembership);
router.post('/memberships/:membershipId/add-ons', membershipController.addAddonToMember); // add addons to a members
router.get('/memberships', membershipController.getMemberships); // Get all memberships
router.get('/memberships/:membershipId', membershipController.getMembershipById); // Get single membership
router.put('/memberships/:membershipId', membershipController.updateMembership); // Update membership
router.delete('/memberships/:membershipId', membershipController.deleteMembership); // Delete membership
router.put('/memberships/:membershipId/add-ons/:addonId', membershipController.updateAddon); // Add this line for updating add-ons
router.put('/memberships/:membershipId/first-payment/:addonId', membershipController.paidMonthlyService); // Add this line for paid monthly service
router.get('/memberships/:membershipId/add-ons', membershipController.getAllAddons); // Get all add-ons
router.get('/memberships/:membershipId/add-ons/:addonId', membershipController.getAddon); // Get single add-on
router.delete('/memberships/:membershipId/add-ons/:addonId', membershipController.deleteAddon); // Delete add-on
router.put('/memberships/:membershipId/renew', membershipController.renewMonthlyMembership); // Paid monthly service
router.put('/memberships/:membershipId/add-ons/:addonId/addon-renew', membershipController.addonMonthlyPayment); // addon monthly service
router.get('/memberships/:membershipId/payments', membershipController.getPaymentHistoryById ); // Get all payments of a membership
router.get('/memberships/:fullName/paymentHistory', membershipController.searchMembershipPaymentByName); // search for single or more payment of a membership
router.put('/memberships/:membershipId/yearly-renew', membershipController.renewAnnualMembership); // addon monthly service

module.exports = router;
