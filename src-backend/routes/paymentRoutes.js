const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/topup', paymentController.topUp);
router.post('/pay', paymentController.pay);
router.post('/generate-qr', paymentController.generateQR);

module.exports = router;
