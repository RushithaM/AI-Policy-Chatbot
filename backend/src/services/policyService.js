const axios = require('axios');
const fs = require('fs');
const path = require('path');
const jsonFilePath = path.join(__dirname, '../data/policylinks.json');
const fetchPolicyData  = () => {
    try{
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        const policies = JSON.parse(jsonData);
        return policies;
    } catch (error) {
        console.error('Service Error' , error);
        throw error;
    }
}
module.exports = {
    fetchPolicyData
};