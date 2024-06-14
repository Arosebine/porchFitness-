const express = require('express');
const router = express.Router();
const membershipController = require('../controller/member.controller');

router.post('/memberships', membershipController.createMembership);
router.post('/memberships/:id/add-ons', membershipController.addAddon);
router.get('/memberships', membershipController.getMemberships); // Get all memberships
router.get('/memberships/:id', membershipController.getMembershipById); // Get single membership
router.put('/memberships/:id', membershipController.updateMembership); // Update membership
router.delete('/memberships/:id', membershipController.deleteMembership); // Delete membership
router.put('/memberships/:id/add-ons', membershipController.updateAddon); // Add this line for updating add-ons

router.get('/memberships/:id/add-ons', membershipController.getAllAddons); // Get all add-ons
router.get('/memberships/:id/add-ons/:addonId', membershipController.getAddon); // Get single add-on
router.delete('/memberships/:id/add-ons/:addonId', membershipController.deleteAddon); // Delete add-on

module.exports = router;
