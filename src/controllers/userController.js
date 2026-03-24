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
      data: user
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
    const user_id = req.user.userId; // Lấy ID từ Token (chỉ sửa được của chính mình)
    const { full_name, phone_number } = req.body;

    const [updatedUser] = await db('Users')
      .where({ user_id: user_id })
      .update({
        full_name: full_name,
        phone_number: phone_number
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