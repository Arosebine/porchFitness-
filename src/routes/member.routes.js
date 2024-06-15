const express = require('express');
const router = express.Router();
const membershipController = require('../controller/member.controller');

router.post('/memberships', membershipController.createMembership);
router.post('/memberships/:id/add-ons', membershipController.addAddonToMember);
router.get('/memberships', membershipController.getMemberships); // Get all memberships
router.get('/memberships/:id', membershipController.getMembershipById); // Get single membership
router.put('/memberships/:id', membershipController.updateMembership); // Update membership
router.delete('/memberships/:id', membershipController.deleteMembership); // Delete membership
router.put('/memberships/:id/add-ons/:addonId', membershipController.updateAddon); // Add this line for updating add-ons
router.put('/memberships/:id/first-payment/:addonId', membershipController.paidMonthlyService); // Add this line for paid monthly service
router.get('/memberships/:id/add-ons', membershipController.getAllAddons); // Get all add-ons
router.get('/memberships/:id/add-ons/:addonId', membershipController.getAddon); // Get single add-on
router.delete('/memberships/:id/add-ons/:addonId', membershipController.deleteAddon); // Delete add-on
router.put('/memberships/:id/renew', membershipController.renewMonthlyMembership); // Paid monthly service
router.put('/memberships/:id/add-ons/:addonId/addon-renew', membershipController.addonMonthlyPayment); // addon monthly service
router.get('/memberships/:id/payments', membershipController.getPaymentHistoryById ); // Get all payments of a membership
router.get('/memberships/:fullName/paymentHistory', membershipController.searchMembershipPaymentByName); // search for single or more payment of a membership


module.exports = router;
