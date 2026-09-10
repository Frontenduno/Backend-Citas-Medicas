require("dotenv").config();
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const authRoutes = require("./src/presenter/routes/authRoutes");
const port = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000', // Reemplaza con la URL de tu frontend
  credentials: true
}));

// Rutas
const authRoutes = require('./src/presenter/routes/authRoutes');

// Parse JSON bodies
app.use(express.json());
// Parse cookies
app.use(cookieParser());

// Mount auth routes under /auth
const authRoutes = require('./src/presenter/routes/authRoutes');
app.use('/auth', authRoutes);

app.use(express.json());

app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

module.exports = {
  app,
};
