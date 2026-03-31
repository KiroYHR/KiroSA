const db = require('../db');

exports.getProfile = async (req, res) => {
  try {
    // Lấy userId từ chính cái Token đã được giải mã bởi "Ông bảo vệ"
    const userId = req.user.userId;

    // Tìm user trong database
    const user = await db('Users')
      .where({ user_id: userId })
      .select('user_id', 'full_name', 'phone_number', 'wallet_balance', 'role')
      .first();

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
    }

    res.status(200).json({
      message: 'Lấy thông tin thành công',
      data: {
        id: user.user_id,
        name: user.full_name,
        phone: user.phone_number,
        role: user.role,
        balance: user.wallet_balance
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy profile.' });
  }
};

exports.topUpWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const user_id = req.user.userId; // Vẫn lấy ID từ Token để biết ai đang nạp

    // Kiểm tra xem số tiền gửi lên có hợp lệ không (phải lớn hơn 0)
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Số tiền nạp không hợp lệ!' });
    }

    // Cộng tiền thẳng vào Database
    const [updatedUser] = await db('Users')
      .where({ user_id: user_id })
      .increment('wallet_balance', amount) // Lệnh increment giúp cộng thêm vào số dư cũ
      .returning(['user_id', 'full_name', 'wallet_balance']);

    res.status(200).json({
      message: `Ting ting! Nạp thành công ${amount} VNĐ vào ví.`,
      new_balance: updatedUser.wallet_balance
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi nạp tiền.' });
  }
};

// Lấy danh sách tất cả người dùng kèm phương tiện
exports.getAllUsers = async (req, res) => {
  try {
    const users = await db('Users')
      .leftJoin('Vehicles', 'Users.user_id', 'Vehicles.user_id') // Nối bảng Users và Vehicles
      .select(
        'Users.user_id',
        'Users.full_name',
        'Users.phone_number',
        'Users.created_at',
        'Users.role',
        'Vehicles.license_plate',
        'Vehicles.vehicle_type'
      )
      .orderBy('Users.created_at', 'desc'); // Sắp xếp người mới đăng ký lên đầu

    res.status(200).json({ data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách người dùng.' });
  }
};

// Khách hàng tự cập nhật thông tin cá nhân (PUT)
exports.updateProfile = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { name, phone } = req.body; // Hứng 'name' từ Mobile

    const [updatedUser] = await db('Users')
      .where({ user_id: user_id })
      .update({
        full_name: name || db.raw('full_name'), // Map 'name' vào 'full_name'
        phone_number: phone || db.raw('phone_number')
      })
      .returning(['user_id', 'full_name', 'phone_number']);

    res.status(200).json({
      message: 'Cập nhật thông tin thành công!',
      data: updatedUser
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin.' });
  }
};

const bcrypt = require('bcrypt');

exports.changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  try {
    const user = await db('Users').where({ user_id: req.user.userId }).first();
    
    // So sánh pass cũ 
    const isMatch = await bcrypt.compare(old_password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu cũ không đúng!' });

    // Mã hóa pass mới và lưu
    const salt = await bcrypt.genSalt(10);
    const new_password_hash = await bcrypt.hash(new_password, salt);

    await db('Users').where({ user_id: req.user.userId }).update({ password_hash: new_password_hash });
    res.status(200).json({ message: 'Đổi mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi đổi mật khẩu', error });
  }
};

// API Lấy lịch sử đỗ xe của User
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // 1. Tìm tất cả các biển số xe mà ông này đang sở hữu
    const userVehicles = await db('Vehicles').where({ user_id: userId }).pluck('license_plate');
    
    if (userVehicles.length === 0) {
      return res.status(200).json({ message: 'Lấy lịch sử thành công', data: [] });
    }

    // 2. Lấy lịch sử các chuyến xe khớp với các biển số trên
    const history = await db('Parking_Sessions')
      .whereIn('license_plate', userVehicles)
      .orderBy('check_in_time', 'desc');

    res.status(200).json({
      message: 'Lấy lịch sử thành công',
      data: history
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử.' });
  }
};

// Lấy lịch sử giao dịch ví tiền của User
exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Lấy toàn bộ giao dịch của user này, sắp xếp mới nhất lên đầu
    const transactions = await db('Transactions')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');

    res.status(200).json({
      message: 'Lấy lịch sử giao dịch thành công',
      data: transactions
    });
  } catch (error) {
    console.error("Lỗi lấy lịch sử giao dịch:", error);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử giao dịch.' });
  }
};

// ĐỔI MẬT KHẨU NGƯỜI DÙNG
exports.changePassword = async (req, res) => {
  // Lấy ID từ Token (do khách đã đăng nhập)
  const user_id = req.user.userId; 
  // Bắt Mobile phải gửi lên mật khẩu cũ và mới
  const { old_password, new_password } = req.body;

  if (!old_password || !new_password) {
    return res.status(400).json({ message: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới!' });
  }

  try {
    // 1. Tìm thông tin khách hàng trong Database
    const user = await db('Users').where({ user_id }).first();
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    }

    // 2. Kiểm tra xem mật khẩu cũ có gõ đúng không
    // (Lưu ý: Đang dùng so sánh thô khớp với authController của bạn lúc Demo)
    if (old_password !== user.password_hash) {
      return res.status(400).json({ message: 'Mật khẩu cũ không chính xác!' });
    }

    // 3. Tiến hành cập nhật mật khẩu mới vào Database
    await db('Users')
      .where({ user_id })
      .update({ 
        password_hash: new_password 
      });

    res.status(200).json({ message: 'Cập nhật mật khẩu thành công!' });
    
  } catch (error) {
    console.error("Lỗi khi đổi mật khẩu:", error);
    res.status(500).json({ message: 'Lỗi server khi đổi mật khẩu.' });
  }
};