const express = require('express');
const { createAuthController } = require('../controllers/AuthController');

function createAuthRoutes(authController) {
  const router = express.Router();
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  return router;
}

module.exports = {
  createAuthRoutes,
};
