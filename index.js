require("dotenv").config();
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 3000;
const morgan = require("morgan");

// Parse JSON bodies
app.use(express.json());
// Parse cookies
app.use(cookieParser());

// Mount auth routes under /auth
const authRoutes = require('./src/presenter/routes/authRoutes');
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.use(morgan("dev"));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});