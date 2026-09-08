require("dotenv").config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require("morgan");

const app = express();
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

app.get('/', (req, res) => {
  res.json({ message: 'Hello World!' });
});

app.use('/api/auth', authRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});