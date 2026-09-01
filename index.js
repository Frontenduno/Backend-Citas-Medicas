require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const morgan = require("morgan");

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.use(morgan("dev"));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});