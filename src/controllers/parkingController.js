const db = require('../db');

// API CHECK-IN DÀNH CHO AI CAMERA (Tự động phân ô đỗ)
exports.checkIn = async (req, res) => {
  const { license_plate, vehicle_type } = req.body;

  try {
    // 1. Kiểm tra xem xe này có đang ở trong bãi rồi không (chống quét đúp)
    const existing = await db('Parking_Sessions')
      .where({ license_plate, status: 'Active' })
      .first();
    
    if (existing) {
      return res.status(400).json({ message: 'Xe này đang ở trong bãi rồi!', open_barrier: false });
    }

    // 2. TÌM MỘT Ô TRỐNG BẤT KỲ ĐỂ PHÂN BỔ (Tự động lấy 1 ô Available)
    const availableSlot = await db('Parking_Slots')
      .where({ status: 'Available' })
      .orderBy('slot_id', 'asc') // Ưu tiên xếp từ A1 trở đi
      .first();

    // Nếu bãi xe hết chỗ
    if (!availableSlot) {
      return res.status(400).json({ message: 'BÃI XE ĐÃ ĐẦY!', open_barrier: false });
    }

    // 3. Xí chỗ: Chuyển trạng thái ô đó thành Đang sử dụng (Occupied)
    await db('Parking_Slots')
      .where({ slot_id: availableSlot.slot_id })
      .update({ status: 'Occupied' });

    // 4. Mở cửa cho xe vào và gắn thẳng vào ô đỗ vừa tìm được
    await db('Parking_Sessions').insert({
      license_plate,
      slot_id: availableSlot.slot_id,
      status: 'Active'
    });

    res.status(200).json({ 
      message: `Nhận diện Vãng lai thành công. Đã xếp vào ô ${availableSlot.slot_id}`, 
      open_barrier: true,
      slot_assigned: availableSlot.slot_id
    });

  } catch (error) {
    console.error("Lỗi khi AI Check-in:", error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
};

exports.getSlots = async (req, res) => {
  try {
    // Truy xuất tất cả ô đỗ và sắp xếp theo tên (A1, A2...)
    const slots = await db('Parking_Slots').select('*').orderBy('slot_id');
    
    res.status(200).json({
      message: 'Lấy danh sách sơ đồ bãi đỗ thành công!',
      total_slots: slots.length,
      data: slots
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách ô đỗ.' });
  }
};

exports.bookSlot = async (req, res) => {
  try {
    const { slot_id, license_plate } = req.body;
    const user_id = req.user.userId; // Lấy ID người dùng từ Token bảo vệ

    // 1. Kiểm tra xem ô đỗ có tồn tại và đang "Trống" (Available) không
    const slot = await db('Parking_Slots').where({ slot_id }).first();
    if (!slot || slot.status !== 'Available') {
      return res.status(400).json({ message: 'Rất tiếc! Ô đỗ này không hợp lệ hoặc đã có người đặt.' });
    }

    // 2. Kiểm tra số dư ví xem có đủ 10.000 VNĐ để cọc không
    const user = await db('Users').where({ user_id }).first();
    if (user.wallet_balance < 10000) {
      return res.status(400).json({ 
        message: 'Số dư ví không đủ 10.000 VNĐ để đặt cọc. Vui lòng nạp thêm tiền!' 
      });
    }

    // 3. Bắt đầu Transaction (Đảm bảo 3 hành động dưới đây phải thành công cùng lúc)
    await db.transaction(async (trx) => {
      // 3.1 Trừ 10.000 VNĐ trong ví
      await trx('Users').where({ user_id }).decrement('wallet_balance', 10000);

      // 3.2 Đổi trạng thái ô đỗ thành "Đang đặt" (Reserved)
      await trx('Parking_Slots').where({ slot_id }).update({ status: 'Reserved' });

      // 3.3 Tạo vé đỗ xe mới với trạng thái "Booked"
      await trx('Parking_Sessions').insert({
        license_plate: license_plate,
        slot_id: slot_id,
        user_id: user_id,
        booking_time: new Date(),
        status: 'Booked'
      });
    });

    // 4. Trả kết quả thành công
    res.status(200).json({
      message: 'Đặt chỗ thành công! Đã tạm trừ 10.000 VNĐ tiền cọc.',
      booked_slot: slot_id
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi đặt chỗ.' });
  }
};

exports.getMyHistory = async (req, res) => {
  try {
    // Lấy ID của người dùng đang đăng nhập từ Token
    const user_id = req.user.userId;

    // Truy vấn lịch sử đỗ xe của riêng người này, sắp xếp mới nhất lên đầu
    const history = await db('Parking_Sessions')
      .where({ user_id: user_id })
      .orderBy('created_at', 'desc');

    res.status(200).json({
      message: 'Lấy lịch sử hoạt động thành công!',
      total_records: history.length,
      data: history
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử đỗ xe.' });
  }
};

// ==========================================
// API LẤY DOANH THU CHO WEB ADMIN (Bản Hoàn Hảo)
// ==========================================
exports.getRevenue = async (req, res) => {
  try {
    // 1. Chỉ lấy các xe ĐÃ RA KHỎI BÃI (Completed) và Join để lấy Loại xe thật
    const sessions = await db('Parking_Sessions')
      .leftJoin('Vehicles', 'Parking_Sessions.license_plate', 'Vehicles.license_plate')
      .select(
        'Parking_Sessions.session_id',
        'Parking_Sessions.license_plate',
        'Vehicles.vehicle_type',
        'Parking_Sessions.check_in_time',
        'Parking_Sessions.check_out_time',
        'Parking_Sessions.total_fee'
      )
      .where('Parking_Sessions.status', 'Completed') // <- CHỐT CHẶN: Chỉ tính xe đã trả tiền!
      .orderBy('Parking_Sessions.check_out_time', 'desc');

    // 2. Biến đổi dữ liệu cho đẹp để Frontend Desktop hiển thị ăn ngay
    const transactions = sessions.map(session => ({
      id: session.session_id,
      plate: session.license_plate,
      type: session.vehicle_type || 'Ô tô', // Lấy loại xe thật, nếu không có mặc định là Ô tô
      timeIn: new Date(session.check_in_time).toLocaleString('vi-VN'),
      timeOut: new Date(session.check_out_time).toLocaleString('vi-VN'),
      duration: 'Hoàn thành',
      fee: (session.total_fee || 0).toLocaleString('vi-VN') + ' đ',
      method: 'Tiền mặt',
      status: 'paid'
    }));

    res.status(200).json({ data: transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu doanh thu.' });
  }
};

// Khách hàng hủy đặt chỗ (DELETE)
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params; // Lấy mã vé (session_id) từ trên đường dẫn URL
    const user_id = req.user.userId; // Lấy ID người dùng từ Token

    // 1. Tìm xem vé này có tồn tại, có đúng là của người này không, và phải đang ở trạng thái 'Booked'
    const booking = await db('Parking_Sessions')
      .where({ session_id: id, user_id: user_id, status: 'Booked' })
      .first();

    if (!booking) {
      return res.status(404).json({ 
        message: 'Không tìm thấy vé đặt trước hợp lệ, hoặc xe đã vào bãi nên không thể hủy!' 
      });
    }

    // 2. Tiến hành xóa vé khỏi Database
    await db('Parking_Sessions').where({ session_id: id }).del();

    // 3. Hoàn lại 10.000 VNĐ tiền cọc vào ví cho khách hàng
    await db('Users')
      .where({ user_id: user_id })
      .increment('wallet_balance', 10000);

    // 4. Cập nhật lại trạng thái ô đỗ thành 'Available' (Trống)
    await db('Parking_Slots')
      .where({ slot_id: booking.slot_id })
      .update({ status: 'Available' });

    res.status(200).json({ 
      message: 'Hủy đặt chỗ thành công! Đã hoàn lại 10.000 VNĐ tiền cọc vào ví SmartPay.' 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi hủy đặt chỗ.' });
  }
};

// LẤY DANH SÁCH NHẬT KÝ RA VÀO (Dành cho Web Admin)
exports.getAllSessions = async (req, res) => {
  try {
    // Lấy 20 lượt ra vào mới nhất từ Database
    const sessions = await db('Parking_Sessions')
      .orderBy('check_in_time', 'desc')
      .limit(20);
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lấy nhật ký' });
  }
};

// API DÀNH CHO ADMIN: GIẢI PHÓNG Ô ĐỖ BẰNG TAY
exports.clearSlot = async (req, res) => {
  const { slot_id } = req.body;

  try {
    // 1. Chuyển ô đỗ về màu xanh (Trống)
    await db('Parking_Slots').where({ slot_id }).update({ status: 'Available' });

    // 2. Tìm xe nào đang đậu/đặt chỗ ở ô này và đánh dấu là đã hoàn thành (Ra khỏi bãi)
    await db('Parking_Sessions')
      .where({ slot_id, status: 'Active' })
      .update({ 
        status: 'Completed', 
        check_out_time: db.fn.now() // Ghi nhận giờ ra
      });

    res.status(200).json({ message: `Đã giải phóng thành công ô ${slot_id}` });
  } catch (error) {
    console.error("Lỗi giải phóng ô:", error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
};

// API DÀNH CHO ADMIN: ÉP XE RA KHỎI BÃI TỪ BẢNG NHẬT KÝ
exports.manualCheckout = async (req, res) => {
  const { session_id } = req.body;
  try {
    // 1. Tìm xem chiếc xe này đang nằm ở ô nào
    const session = await db('Parking_Sessions').where({ session_id }).first();
    
    if (!session) {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu xe' });
    }

    // 2. Chốt sổ nhật ký (Cập nhật giờ ra và trạng thái)
    await db('Parking_Sessions')
      .where({ session_id })
      .update({ 
        status: 'Completed', 
        check_out_time: db.fn.now() 
      });

    // 3. ĐIỂM QUAN TRỌNG NHẤT: Trả lại màu xanh cho ô đỗ của xe đó
    if (session.slot_id) {
      await db('Parking_Slots')
        .where({ slot_id: session.slot_id })
        .update({ status: 'Available' });
    }

    res.status(200).json({ message: 'Đã cho xe ra khỏi bãi và giải phóng ô đỗ!' });
  } catch (error) {
    console.error("Lỗi xuất bãi:", error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
};

// ==========================================
// API CHECK-OUT (TÍNH TIỀN THỰC TẾ TỪ DATABASE)
// ==========================================
exports.checkOut = async (req, res) => {
  const { license_plate } = req.body;

  try {
    // 1. Tìm xe đang ở trong bãi
    const session = await db('Parking_Sessions')
      .where({ license_plate, status: 'Active' })
      .first();

    if (!session) {
      return res.status(404).json({ message: 'Không tìm thấy xe trong bãi!', open_barrier: false });
    }

    // 2. TÍNH TIỀN "REAL" 100% TỪ DATABASE CÀI ĐẶT
    const systemSettings = await db('Settings').first(); 
    const pricePerHour = systemSettings ? systemSettings.car_hour_price : 10000; 

    const checkInTime = new Date(session.check_in_time);
    const checkOutTime = new Date();
    const diffMs = checkOutTime - checkInTime; 
    
    // Hàm Math.ceil sẽ tự động làm tròn lên (lố 1 phút cũng tính là 1 giờ)
    let diffHours = Math.ceil(diffMs / (1000 * 60 * 60)); 
    if (diffHours === 0) diffHours = 1; 

    const fee = diffHours * pricePerHour; // Nhân với giá tiền lấy từ Cài đặt

    // 3. Cập nhật Nhật ký: Ghi giờ ra và Tiền
    await db('Parking_Sessions')
      .where({ session_id: session.session_id })
      .update({ 
        status: 'Completed', 
        check_out_time: checkOutTime,
        total_fee: fee
      });

    // 4. Trả lại màu Xanh cho Ô đỗ
    if (session.slot_id) {
      await db('Parking_Slots')
        .where({ slot_id: session.slot_id })
        .update({ status: 'Available' });
    }

    res.status(200).json({ 
      message: `Xe ra thành công! Thu phí: ${fee} VNĐ`, 
      open_barrier: true,
      fee: fee,
      hours: diffHours
    });

  } catch (error) {
    console.error("Lỗi khi AI Check-out:", error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
};