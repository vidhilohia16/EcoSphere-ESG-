const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api', apiRoutes);

// Serve Static Assets from Client in production
const clientDistPath = path.join(__dirname, '../dist');
app.use(express.static(clientDistPath));

// Fallback all routes to index.html for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` EcoSphere ESG Platform Backend running! `);
    console.log(` Port: ${PORT}                                 `);
    console.log(` API base: http://localhost:${PORT}/api        `);
    console.log(`===============================================`);
});
