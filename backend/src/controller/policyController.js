const axios = require('axios');
const mammoth = require('mammoth');
const fs= require('fs');

const policyService= require('../services/policyService');
exports.getPolicies = (req, res) => {
  try {
    const policies = policyService.fetchPolicyData();
    res.json(policies);
  } catch (error) {
    console.error('Error in controller:', error);
    res.status(500).json({ error: 'Failed to fetch policy data', details: error.message });
  }
};
exports.extractTextFromPolicy = async (req,res) => {
  const fileUrl = req.body.fileUrl;
  try{
    const response= await axios.get(fileUrl, {responseType: 'arraybuffer' });
    const docxData= response.data;
    mammoth.extractRawText({ buffer: docxData}).then((result) => {
      res.json({text: result.value});
    }).catch((error) => {
      console.error('Error extract text  from DOCX:', error);
      res.status(500).json({ error: 'Failed to extract text from DOCX',details: error.message });
    })
  } catch(error){
    console.error('Error downloading DOCX file: ', error);
    res.status(500).json({ error: 'Failed to download DOCX file', details: error.message});
  }
};