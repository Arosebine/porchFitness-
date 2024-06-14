const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');

router.post('/memberships', membershipController.createMembership);
router.post('/memberships/:id/add-ons', membershipController.addAddon);

module.exports = router;
