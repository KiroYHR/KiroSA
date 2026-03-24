const db = require('../db'); // Đường dẫn tới file config database của bạn

// Lấy danh sách xe của User
exports.getMyVehicles = async (req, res) => {
  try {
    const vehicles = await db('Vehicles').where({ user_id: req.user.userId });
    res.status(200).json({ data: vehicles });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy danh sách xe', error });
  }
};

// Thêm xe mới
exports.addVehicle = async (req, res) => {
  const { license_plate, vehicle_type } = req.body;
  try {
    // Kiểm tra xe đã tồn tại chưa
    const exist = await db('Vehicles').where({ license_plate }).first();
    if (exist) return res.status(400).json({ message: 'Biển số này đã được đăng ký!' });

    await db('Vehicles').insert({
      user_id: req.user.userId,
      license_plate,
      vehicle_type: vehicle_type || 'Car'
    });
    res.status(201).json({ message: 'Thêm phương tiện thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi thêm phương tiện', error });
  }
};

// Xóa xe
exports.deleteVehicle = async (req, res) => {
  const { license_plate } = req.params;
  try {
    await db('Vehicles').where({ user_id: req.user.userId, license_plate }).del();
    res.status(200).json({ message: 'Đã xóa phương tiện!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa phương tiện', error });
  }
};