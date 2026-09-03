require("dotenv").config();
const express = require("express");
const app = express();
const authRoutes = require("./src/presenter/routes/authRoutes");
const port = process.env.PORT || 3000;

app.use(express.json());

app.use("/auth", authRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
