const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    // 1. Lấy thêm thuộc tính 'role' từ dữ liệu gửi lên
    const { full_name, phone_number, password, role } = req.body; 

    const existingUser = await db('Users').where({ phone_number }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'Số điện thoại này đã được đăng ký!' });
    }

    const [newUser] = await db('Users').insert({
      full_name: full_name,
      phone_number: phone_number,
      password_hash: password,
      // 2. Nếu có gửi role thì lấy, không thì mặc định là 'Guest'
      role: role || 'Guest' 
    }).returning(['user_id', 'full_name', 'phone_number', 'wallet_balance', 'role']);

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      user: newUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi đăng ký.' });
  }
};

exports.login = async (req, res) => {
  // Mobile gửi lên biến 'email' hoặc 'phone', ta gộp chung lại
  const { email, phone, password } = req.body; 
  const loginId = email || phone; // Lấy cái nào cũng được

  try {
    // CHỈ TÌM BẰNG SỐ ĐIỆN THOẠI (Vì DB không có cột email)
    const user = await db('Users').where({ phone_number: loginId }).first();

    if (!user) return res.status(404).json({ message: 'Tài khoản không tồn tại!' });

    //const isMatch = await bcrypt.compare(password, user.password_hash);
    //if (!isMatch) return res.status(400).json({ message: 'Sai mật khẩu!' });

    const token = jwt.sign(
      { userId: user.user_id, role: user.role || 'customer' }, 
      '123456', 
      { expiresIn: '7d' }
    );

    res.status(200).json({ message: 'Đăng nhập thành công!', token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
  }
};
