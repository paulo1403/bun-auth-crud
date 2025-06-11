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
app.use('/api', userRoutes);
app.use('/api', auditLogRoutes);
app.use('/api', urlRoutes);
app.use('/s', urlRoutes); // Solo para la redirección pública

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
