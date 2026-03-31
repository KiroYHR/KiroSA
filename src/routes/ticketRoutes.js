const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');

// 1. API: Kiểm tra xem tôi có vé tháng chưa? (Mobile gọi GET /api/tickets/my-ticket)
router.get('/my-ticket', authMiddleware, ticketController.getMyTicket);

// 2. API: Thanh toán mua vé tháng (Mobile gọi POST /api/tickets/monthly-ticket)
router.post('/monthly-ticket', authMiddleware, ticketController.subscribeTicket);

module.exports = router;