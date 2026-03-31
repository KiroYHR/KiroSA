const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    // Mobile gửi 4 trường, đón đủ:
    const { name, email, phone, password, role } = req.body; 

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin!' });
    }

    // 1. Tìm theo số điện thoại
    const existingUser = await db('Users').where({ phone_number: phone }).first();
    if (existingUser) {
      return res.status(400).json({ message: 'Số điện thoại này đã được đăng ký!' });
    }

    // 2. Insert dữ liệu (BỎ biến email đi vì DB không có cột này)
    const [newUser] = await db('Users').insert({
      full_name: name,
      phone_number: phone,      
      password_hash: password,
      role: role || 'Guest' 
    }).returning(['user_id', 'full_name', 'phone_number', 'wallet_balance', 'role']);

    res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      user: newUser
    });

  } catch (error) {
    console.error("Lỗi Đăng Ký:", error); 
    res.status(500).json({ message: 'Lỗi server khi đăng ký.' });
  }
};

exports.login = async (req, res) => {
  // Đón lõng tất cả các kiểu biến mà Frontend (Mobile/Desktop) có thể gửi lên
  const { email, phone, phone_number, password } = req.body; 

  // Gom lại: Lấy bất kỳ biến nào có chứa SĐT người dùng nhập
  const loginId = email || phone || phone_number;

  // Nếu không có tài khoản hoặc không có password thì mới báo lỗi
  if (!loginId || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu!' });
  }

  try {
    // Mang SĐT đó đi tìm trong cột phone_number của Database
    const user = await db('Users').where({ phone_number: loginId }).first();

    if (!user) return res.status(404).json({ message: 'Tài khoản không tồn tại!' });

    // Kiểm tra mật khẩu (Hiện tại BE đang lưu thô, chưa mã hóa bcrypt)
    if (password !== user.password_hash) { 
        return res.status(400).json({ message: 'Sai mật khẩu!' });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role || 'customer' }, 
      '123456', 
      { expiresIn: '7d' }
    );

    // Trả data về, khéo léo nhét sđt vào biến email để App Mobile không bị crash
    res.status(200).json({ 
        message: 'Đăng nhập thành công!', 
        token: token,
        user: {
            id: user.user_id,
            full_name: user.full_name,
            email: user.phone_number, 
            phone_number: user.phone_number,
            role: user.role
        }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập.' });
  }
};