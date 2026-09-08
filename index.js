require("dotenv").config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const morgan = require("morgan");

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Rutas
const citaRoutes = require("./src/infrastructure/routes/citaRoutes");
const historialRoutes = require("./src/infrastructure/routes/historialRoutes");

app.get('/', (req, res) => {
  res.json({ message: 'API Citas Médicas - JYP v1.1.0' });
});

app.use('/api/citas', citaRoutes);
app.use('/api/historiales', historialRoutes);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});