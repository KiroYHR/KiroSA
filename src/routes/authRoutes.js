const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Mở cổng POST cho endpoint /api/auth/register
router.post('/register', authController.register);
//đăng nhập
router.post('/login', authController.login);

module.exports = router;