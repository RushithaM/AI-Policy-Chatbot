const express = require('express');
const router = express.Router();

const policyController = require('../controller/policyController'); // Import the controller

router.get('/', policyController.getPolicies);  // Delegate to controller
router.post('/extract', policyController.extractTextFromPolicy);
module.exports = router;