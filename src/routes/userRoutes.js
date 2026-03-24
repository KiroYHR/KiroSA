const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Kẹp authMiddleware vào trước khi gọi getProfile
router.get('/profile', authMiddleware, userController.getProfile);
// Nạp tiền vào ví
router.post('/topup', authMiddleware, userController.topUpWallet);

// Lấy danh sách tất cả User (Dành cho Admin)
router.get('/all', userController.getAllUsers);

// Cập nhật thông tin cá nhân
router.put('/profile/update', authMiddleware, userController.updateProfile);

// Đổi mật khẩu
router.put('/change-password', authMiddleware, userController.changePassword);

module.exports = router;