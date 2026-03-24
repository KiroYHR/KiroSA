const db = require('../db'); // File kết nối Database của bạn

// 1. API NẠP TIỀN VÀO VÍ
exports.topUp = async (req, res) => {
  const { user_id, amount } = req.body;

  if (!user_id || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Số tiền hoặc thông tin không hợp lệ!' });
  }

  try {
    // Dùng db.transaction để đảm bảo Cộng tiền và Ghi sổ phải thành công cùng lúc
    await db.transaction(async trx => {
      // 1. Cộng tiền vào ví của User
      const [updatedUser] = await trx('Users')
        .where({ user_id })
        .increment('wallet_balance', amount)
        .returning('wallet_balance');

      if (!updatedUser) throw new Error('UserNotFound');

      // 2. Ghi một dòng vào sổ lịch sử
      await trx('Transactions').insert({
        user_id,
        amount: amount, // Số dương là Nạp tiền
        type: 'TopUp',
        description: `Nạp ${amount.toLocaleString('vi-VN')}đ vào ví SmartPay`
      });

      // 3. Trả kết quả về cho Mobile
      res.status(200).json({
        message: 'Nạp tiền thành công!',
        new_balance: updatedUser.wallet_balance
      });
    });
  } catch (error) {
    if (error.message === 'UserNotFound') return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    console.error(error);
    res.status(500).json({ message: 'Lỗi hệ thống khi nạp tiền.' });
  }
};

// 2. API THANH TOÁN (TRỪ TIỀN)
exports.pay = async (req, res) => {
  const { user_id, amount, description } = req.body;

  if (!user_id || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Số tiền hoặc thông tin không hợp lệ!' });
  }

  try {
    await db.transaction(async trx => {
      // 1. Kiểm tra xem khách có đủ tiền không
      const user = await trx('Users').where({ user_id }).first();
      if (!user) throw new Error('UserNotFound');
      if (user.wallet_balance < amount) throw new Error('InsufficientBalance');

      // 2. Trừ tiền trong ví
      const [updatedUser] = await trx('Users')
        .where({ user_id })
        .decrement('wallet_balance', amount)
        .returning('wallet_balance');

      // 3. Ghi sổ lịch sử (Số âm)
      await trx('Transactions').insert({
        user_id,
        amount: -amount, // Số âm là Bị trừ tiền
        type: 'Payment',
        description: description || `Thanh toán phí dịch vụ ${amount.toLocaleString('vi-VN')}đ`
      });

      res.status(200).json({
        message: 'Thanh toán thành công!',
        new_balance: updatedUser.wallet_balance
      });
    });
  } catch (error) {
    if (error.message === 'UserNotFound') return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    if (error.message === 'InsufficientBalance') return res.status(400).json({ message: 'Số dư trong ví không đủ để thanh toán!' });
    console.error(error);
    res.status(500).json({ message: 'Lỗi hệ thống khi thanh toán.' });
  }
};

// 3. API TẠO MÃ QR NẠP TIỀN (Sử dụng chuẩn VietQR Quốc gia)
exports.generateQR = async (req, res) => {
  const { user_id, amount } = req.body;

  if (!user_id || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Số tiền hoặc thông tin không hợp lệ!' });
  }

  try {
    // --- THÔNG TIN TÀI KHOẢN NGÂN HÀNG CỦA BẠN (BAN QUẢN LÝ BÃI XE) ---
    // Tra cứu mã BIN ngân hàng tại: https://api.vietqr.io/v2/banks
    const BANK_ID = '970422'; // Mã BIN của MBBank (Ví dụ)
    const ACCOUNT_NO = '0123456789'; // Thay bằng Số tài khoản thật của bạn
    const ACCOUNT_NAME = 'BAN QUAN LY SMARTPARK'; // Tên chủ tài khoản (Viết hoa không dấu)

    // Tạo cú pháp chuyển khoản định danh để Backend dễ nhận diện
    // Ví dụ: "SMARTPARK NAP 1" (1 là user_id)
    const description = `SMARTPARK NAP ${user_id}`;

    // Gọi API của VietQR để tạo ảnh QR Động (Có sẵn số tiền và nội dung)
    const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;

    // Trả link ảnh về cho Mobile App hiển thị
    res.status(200).json({
      message: 'Tạo mã QR thành công!',
      qr_url: qrUrl,
      instruction: 'Vui lòng dùng App Ngân hàng quét mã QR trên để nạp tiền.'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi hệ thống khi tạo QR.' });
  }
};