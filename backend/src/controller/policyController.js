const axios = require('axios');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');
const jsonFilePath = path.join(__dirname, '../data/policyLinks.json');

const policyService= require('../services/policyService');
exports.getPolicies = (req, res) => {
  try {
    const policies = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    res.json(policies);
  } catch (error) {
    console.error('Error in controller:', error);
    res.status(500).json({ error: 'Failed to fetch policy data' });
  }
};
exports.extractTextFromPolicy = async (req, res) => {
  const { url } = req.body;
  
  try {
    // Download the file
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const docxData = response.data;

    // Extract text from DOCX
    const result = await mammoth.extractRawText({ buffer: docxData });
    const extractedText = result.value;

    // Read current policies
    const policies = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
    
    // Update the context for the matching policy
    const updatedPolicies = policies.map(policy => {
      if (policy.url === url) {
        return { ...policy, context: extractedText };
      }
      return policy;
    });

    // Save updated policies back to JSON file
    fs.writeFileSync(jsonFilePath, JSON.stringify(updatedPolicies, null, 2));

    res.json({ 
      success: true, 
      text: extractedText 
    });

  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ 
      error: 'Failed to process document', 
      details: error.message 
    });
  }
};