const db = require('../db');

// 1. API CHO MOBILE KIỂM TRA: TÔI ĐANG CÓ VÉ THÁNG (VIP) KHÔNG?
exports.getMyTicket = async (req, res) => {
  try {
    const ticket = await db('Monthly_Tickets')
      .where({ user_id: req.user.userId })
      .andWhere('expiry_date', '>=', db.fn.now()) // Chỉ lấy vé còn hạn
      .orderBy('expiry_date', 'desc') //
      .first();

    if (ticket) {
      res.status(200).json({ has_ticket: true, data: ticket }); //
    } else {
      res.status(200).json({ has_ticket: false, message: 'Bạn chưa có vé tháng hoặc vé đã hết hạn.' }); //
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi kiểm tra vé tháng', error }); //
  }
};

// 2. API MUA VÉ THÁNG & NÂNG CẤP VIP
exports.subscribeTicket = async (req, res) => {
  const { license_plate, months } = req.body; //
  const user_id = req.user.userId;
  
  const pricePerMonth = 150000; // Giả sử 150k/tháng cho Ô tô
  const totalCost = months * pricePerMonth; //

  try {
    // 🌟 SỬ DỤNG TRANSACTION ĐỂ ĐẢM BẢO KHÔNG BỊ LỖI NỬA CHỪNG (Trừ tiền mà không lên VIP)
    await db.transaction(async (trx) => {
      // BƯỚC 1: Kiểm tra số dư ví
      const user = await trx('Users').where({ user_id: user_id }).first();
      if (user.wallet_balance < totalCost) {
        throw new Error('InsufficientBalance');
      }

      // BƯỚC 2: Trừ tiền trong ví
      await trx('Users')
        .where({ user_id: user_id })
        .decrement('wallet_balance', totalCost);

      // BƯỚC 3: PHONG TƯỚC VIP! (Đây là dòng quan trọng nhất ghép nối với Camera)
      await trx('Users')
        .where({ user_id: user_id })
        .update({ role: 'VIP' });

      // BƯỚC 4: Ghi sổ giao dịch lịch sử
      await trx('Transactions').insert({
        user_id: user_id,
        amount: totalCost, 
        type: 'PAYMENT',
        description: `Thanh toán vé ${months} tháng cho xe ${license_plate}` //
      });

      // BƯỚC 5: Tính ngày hết hạn và lưu vé vào Monthly_Tickets
      const expiryDate = new Date(); //
      expiryDate.setMonth(expiryDate.getMonth() + parseInt(months)); //

      await trx('Monthly_Tickets').insert({
        user_id: user_id,
        license_plate: license_plate,  //
        start_date: new Date(),
        expiry_date: expiryDate, //
        status: 'Active' //
      });
    });

    res.status(200).json({ 
        message: `Đăng ký vé ${months} tháng cho xe ${license_plate} thành công! Bạn đã là KHÁCH VIP.`, 
    });
  } catch (error) {
    if (error.message === 'InsufficientBalance') {
        return res.status(400).json({ message: 'Số dư ví không đủ, vui lòng nạp thêm!' });
    }
    console.error(error);
    res.status(500).json({ message: 'Lỗi đăng ký vé tháng', error }); //
  }
};