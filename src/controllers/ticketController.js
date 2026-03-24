const db = require('../db');

// Kiểm tra vé tháng hiện tại
exports.getMyTicket = async (req, res) => {
  try {
    const ticket = await db('Monthly_Tickets')
      .where({ user_id: req.user.userId })
      .andWhere('expiry_date', '>=', db.fn.now()) // Chỉ lấy vé còn hạn
      .orderBy('expiry_date', 'desc')
      .first();

    if (ticket) {
      res.status(200).json({ has_ticket: true, data: ticket });
    } else {
      res.status(200).json({ has_ticket: false, message: 'Bạn chưa có vé tháng hoặc vé đã hết hạn.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi kiểm tra vé tháng', error });
  }
};

// Mua/Gia hạn vé tháng (Trừ tiền ví)
exports.subscribeTicket = async (req, res) => {
  const { months } = req.body; // Mua 1, 3 hay 6 tháng
  const pricePerMonth = 150000; // Giả sử 150k/tháng cho Ô tô
  const totalCost = months * pricePerMonth;

  try {
    // 1. Kiểm tra số dư ví
    const user = await db('Users').where({ user_id: req.user.userId }).first();
    if (user.wallet_balance < totalCost) {
      return res.status(400).json({ message: 'Số dư ví không đủ, vui lòng nạp thêm!' });
    }

    // 2. Trừ tiền
    await db('Users')
      .where({ user_id: req.user.userId })
      .decrement('wallet_balance', totalCost);

    // 3. Tính ngày hết hạn (Cộng thêm số tháng vào ngày hiện tại)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + parseInt(months));

    // 4. Lưu vé
    await db('Monthly_Tickets').insert({
      user_id: req.user.userId,
      start_date: db.fn.now(),
      expiry_date: expiryDate,
      status: 'Active'
    });

    res.status(200).json({ message: `Đăng ký vé ${months} tháng thành công!`, remaining_balance: user.wallet_balance - totalCost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi đăng ký vé tháng', error });
  }
};