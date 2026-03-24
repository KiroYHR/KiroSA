const express = require('express');
const router = express.Router();
const parkingController = require('../controllers/parkingController');
const authMiddleware = require('../middlewares/authMiddleware');

// Các API không cần đăng nhập (AI gọi)
router.post('/check-in', parkingController.checkIn);
router.post('/check-out', parkingController.checkOut);
router.get('/slots', parkingController.getSlots);

// API Đặt chỗ (BẮT BUỘC ĐĂNG NHẬP)
router.post('/book', authMiddleware, parkingController.bookSlot);

// API Lấy lịch sử hoạt động cá nhân
router.get('/history', authMiddleware, parkingController.getMyHistory);

// API Lấy toàn bộ lịch sử giao dịch để tính doanh thu (Dành cho Admin) 
router.get('/revenue', parkingController.getRevenue);

// API Hủy đặt chỗ
router.delete('/book/:id', authMiddleware, parkingController.cancelBooking);

router.get('/all-sessions', parkingController.getAllSessions);

router.post('/clear-slot', parkingController.clearSlot);

router.post('/manual-checkout', parkingController.manualCheckout);

// API cho Camera Cổng Ra
router.post('/check-out', parkingController.checkOut);

module.exports = router;
