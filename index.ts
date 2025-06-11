require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes').default;
const urlRoutes = require('./routes/urlRoutes').default;
const auditLogRoutes = require('./routes/auditLogRoutes').default;

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use('/', userRoutes);
app.use('/', urlRoutes);
app.use('/', auditLogRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
