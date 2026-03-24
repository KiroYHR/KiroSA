const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, vehicleController.getMyVehicles);
router.post('/', authMiddleware, vehicleController.addVehicle);
router.delete('/:license_plate', authMiddleware, vehicleController.deleteVehicle);

module.exports = router;