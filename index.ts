require('dotenv').config();
const express = require('express');
const userRoutes = require('./routes/userRoutes').default;

const app = express();
const port = 3000;

app.use(express.json());
app.use('/', userRoutes);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
