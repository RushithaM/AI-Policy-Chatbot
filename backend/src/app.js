const express = require('express');
const cors = require('cors');

const app = express();
const policyRoutes = require('./routes/policyRoutes');

app.use(cors());
app.use(express.json());
app.use('/api/policies', policyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});