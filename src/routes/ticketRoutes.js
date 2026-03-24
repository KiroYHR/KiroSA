const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/monthly', authMiddleware, ticketController.getMyTicket);
router.post('/monthly/subscribe', authMiddleware, ticketController.subscribeTicket);

module.exports = router;