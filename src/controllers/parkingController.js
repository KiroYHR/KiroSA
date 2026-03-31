const db = require('../db');

// API CHECK-IN DÀNH CHO AI CAMERA (Tự động phân ô đỗ)
exports.checkIn = async (req, res) => {
  const { license_plate } = req.body;

  try {
    // 1. Kiểm tra chống quét đúp (Xe đang ở trong bãi rồi)
    const activeSession = await db('Parking_Sessions')
      .where({ license_plate, status: 'Active' })
      .first();
    
    if (activeSession) {
      return res.status(400).json({ message: 'Xe này đang ở trong bãi rồi!', open_barrier: false });
    }

    // ==========================================
    // 🌟 LUỒNG 1: DÀNH CHO KHÁCH ĐÃ ĐẶT CHỖ QUA APP
    // ==========================================
    const bookedSession = await db('Parking_Sessions')
      .where({ license_plate, status: 'Booked' })
      .first();

    if (bookedSession) {
      // Nếu có đặt chỗ -> CẬP NHẬT GIỜ VÀO VÀ ĐỔI TRẠNG THÁI
      await db('Parking_Sessions')
        .where({ session_id: bookedSession.session_id })
        .update({
          check_in_time: db.fn.now(), // Dập thẻ thời gian ngay lúc này!
          status: 'Active'
        });

      // Đổi trạng thái ô đỗ thành Đang sử dụng
      await db('Parking_Slots')
        .where({ slot_id: bookedSession.slot_id })
        .update({ status: 'Occupied' });

      return res.status(200).json({ 
        message: `Khách VIP Đặt chỗ! Mời vào ô ${bookedSession.slot_id}`, 
        open_barrier: true,
        slot_assigned: bookedSession.slot_id
      });
    }

    // ==========================================
    // 🌟 LUỒNG 2: DÀNH CHO KHÁCH VÃNG LAI (KHÔNG ĐẶT CHỖ)
    // ==========================================
    const availableSlot = await db('Parking_Slots')
      .where({ status: 'Available' })
      .orderBy('slot_id', 'asc') // Ưu tiên xếp từ A1 trở đi
      .first();

    if (!availableSlot) {
      return res.status(400).json({ message: 'BÃI XE ĐÃ ĐẦY!', open_barrier: false });
    }

    // Xí chỗ ô đỗ
    await db('Parking_Slots')
      .where({ slot_id: availableSlot.slot_id })
      .update({ status: 'Occupied' });

    // Tạo phiên đỗ xe mới tinh
    await db('Parking_Sessions').insert({
      license_plate: license_plate,
      slot_id: availableSlot.slot_id,
      check_in_time: db.fn.now(), // Dập thẻ thời gian cho xe vãng lai
      status: 'Active'
    });

    res.status(200).json({ 
      message: `Khách Vãng lai. Đã phân vào ô ${availableSlot.slot_id}`, 
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
    // 1. Nhận thêm expected_arrival_time từ Mobile (nếu có)
    const { slot_id, license_plate, expected_arrival_time } = req.body;
    const user_id = req.user.userId; 

    // 2. TÍNH TOÁN GIỜ KHÁCH ĐẾN
    const arrivalTime = expected_arrival_time ? new Date(expected_arrival_time) : new Date();
    const now = new Date();

    // 3. BẢO VỆ NGHIỆP VỤ: Không đặt giờ quá khứ và Không đặt trước quá 2 tiếng
    if (arrivalTime < now) {
      return res.status(400).json({ message: 'Thời gian đặt chỗ không hợp lệ (nhỏ hơn giờ hiện tại)!' });
    }
    const maxAdvanceTime = 24 * 60 * 60 * 1000; // 24 tiếng
    if (arrivalTime.getTime() - now.getTime() > maxAdvanceTime) {
      return res.status(400).json({ message: 'Hệ thống chỉ hỗ trợ giữ chỗ trước tối đa 24 tiếng để tránh lãng phí ô đỗ!' });
    }

    // 4. CHỐT CHẶN CHỐNG GIAN LẬN (Đã được dời về đúng vị trí)
    const activeOrBooked = await db('Parking_Sessions')
      .where({ license_plate })
      .whereIn('status', ['Active', 'Booked'])
      .first();
      
    if (activeOrBooked) {
      return res.status(400).json({ message: 'Biển số này hiện đang đỗ trong bãi hoặc đã được đặt chỗ trước đó!' });
    }

    // 5. KIỂM TRA Ô ĐỖ
    const slot = await db('Parking_Slots').where({ slot_id }).first();
    if (!slot || slot.status !== 'Available') {
      return res.status(400).json({ message: 'Rất tiếc! Ô đỗ này không hợp lệ hoặc đã có người đặt.' });
    }

    // 6. KIỂM TRA VÍ TIỀN & XÁC ĐỊNH PHÍ ĐẶT CHỖ
    const user = await db('Users').where({ user_id }).first();
    
    // Tự động quyết định giá: VIP thì 0đ, Thường thì 10.000đ
    const bookingFee = (user.role === 'VIP') ? 0 : 10000;

    // Chỉ chặn lỗi nếu phí lớn hơn 0 mà ví lại không đủ tiền
    if (bookingFee > 0 && user.wallet_balance < bookingFee) {
      return res.status(400).json({ message: `Số dư ví không đủ ${bookingFee.toLocaleString('vi-VN')} VNĐ để đặt cọc. Vui lòng nạp thêm tiền!` });
    }

    // 7. LƯU VÀO DATABASE (Có Transaction)
    await db.transaction(async (trx) => {
      // Trừ tiền theo biến bookingFee (0đ hoặc 10.000đ)
      await trx('Users').where({ user_id }).decrement('wallet_balance', bookingFee);
      
      await trx('Parking_Slots').where({ slot_id }).update({ status: 'Reserved' });

      await trx('Parking_Sessions').insert({
        license_plate: license_plate,
        slot_id: slot_id,
        user_id: user_id,
        booking_time: arrivalTime, 
        status: 'Booked'
      });

      // Lưu lịch sử giao dịch chính xác số tiền vừa trừ
      await trx('Transactions').insert({
        user_id: user_id,
        amount: bookingFee,
        type: 'Deduction',
        description: `Trừ tiền cọc đặt trước ô đỗ ${slot_id}`,
        created_at: new Date()
      });
    });

    res.status(200).json({
      message: `Đặt chỗ thành công! Vui lòng có mặt tại bãi trước ${new Date(arrivalTime.getTime() + 30*60000).toLocaleTimeString('vi-VN')}.`,
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
// API DÀNH CHO ADMIN: GIẢI PHÓNG Ô ĐỖ BẰNG TAY
exports.clearSlot = async (req, res) => {
  const { slot_id } = req.body;

  try {
    // 1. Chuyển ô đỗ về màu xanh (Trống)
    await db('Parking_Slots').where({ slot_id }).update({ status: 'Available' });

    // 2. Ép xe Đang đỗ (Active) ra khỏi bãi
    await db('Parking_Sessions')
      .where({ slot_id, status: 'Active' })
      .update({ status: 'Completed', check_out_time: db.fn.now() });

    // 3. Ép xe Đang đặt (Booked) thành trạng thái Hủy
    await db('Parking_Sessions')
      .where({ slot_id, status: 'Booked' })
      .update({ status: 'Cancelled' });

    res.status(200).json({ message: `Đã giải phóng thành công ô ${slot_id}` });
  } catch (error) {
    console.error("Lỗi khi giải phóng ô đỗ:", error);
    res.status(500).json({ message: 'Lỗi server khi giải phóng ô đỗ' });
  }
};

// ==========================================
// API DÀNH CHO ADMIN: ÉP XE RA KHỎI BÃI TỪ BẢNG NHẬT KÝ
// ==========================================
exports.manualCheckout = async (req, res) => {
  const { session_id } = req.body;
  try {
    const session = await db('Parking_Sessions').where({ session_id }).first();
    if (!session) {
      return res.status(404).json({ message: 'Không tìm thấy dữ liệu xe' });
    }

    // 🌟 BƯỚC 1: KIỂM TRA ĐẶC QUYỀN VIP BẰNG BIỂN SỐ 🌟
    const userWithPlate = await db('Users').where({ license_plate: session.license_plate }).first();
    const isVIP = userWithPlate && userWithPlate.role === 'VIP';

    // 🌟 BƯỚC 2: TÍNH GIỜ ĐỖ THỰC TẾ 🌟
    const checkInTime = new Date(session.check_in_time);
    const checkOutTime = new Date();
    let diffHours = Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60));
    if (diffHours === 0) diffHours = 1;

    // 🌟 BƯỚC 3: TÍNH TIỀN (VIP = 0đ) 🌟
    let finalFee = 0;
    if (!isVIP) {
      const systemSettings = await db('Settings').first(); 
      const pricePerHour = (systemSettings && systemSettings.car_hour_price > 0) ? systemSettings.car_hour_price : 10000;
      finalFee = diffHours * pricePerHour;
    }

    // Chốt sổ nhật ký (Cập nhật giờ ra, trạng thái VÀ LƯU DOANH THU THỰC)
    await db('Parking_Sessions')
      .where({ session_id })
      .update({ 
        status: 'Completed', 
        check_out_time: checkOutTime,
        total_fee: finalFee 
      });

    if (session.slot_id) {
      await db('Parking_Slots').where({ slot_id: session.slot_id }).update({ status: 'Available' });
    }

    res.status(200).json({ message: isVIP ? 'Khách VIP xuất bãi miễn phí!' : `Đã cho xe ra! Thu: ${finalFee.toLocaleString()} VNĐ` });
  } catch (error) {
    console.error("Lỗi xuất bãi:", error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
};

// ==========================================
// API CHECK-OUT (AI CAMERA QUÉT CỔNG RA)
// ==========================================
exports.checkOut = async (req, res) => {
  const { license_plate } = req.body;

  try {
    const session = await db('Parking_Sessions').where({ license_plate, status: 'Active' }).first();
    if (!session) {
      return res.status(404).json({ message: 'Không tìm thấy xe trong bãi!', open_barrier: false });
    }

    // 🌟 BƯỚC 1: KIỂM TRA ĐẶC QUYỀN VIP 🌟
    const userWithPlate = await db('Users').where({ license_plate }).first();
    const isVIP = userWithPlate && userWithPlate.role === 'VIP';

    // 🌟 BƯỚC 2: TÍNH GIỜ ĐỖ 🌟
    const checkInTime = new Date(session.check_in_time);
    const checkOutTime = new Date();
    let diffHours = Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60));
    if (diffHours === 0) diffHours = 1; 

    // 🌟 BƯỚC 3: TÍNH TIỀN (VIP = 0đ) 🌟
    let finalFee = 0;
    if (!isVIP) {
      const systemSettings = await db('Settings').first(); 
      const pricePerHour = (systemSettings && systemSettings.car_hour_price > 0) ? systemSettings.car_hour_price : 10000; 
      finalFee = diffHours * pricePerHour;
    }

    // Cập nhật Nhật ký
    await db('Parking_Sessions')
      .where({ session_id: session.session_id })
      .update({ 
        status: 'Completed', 
        check_out_time: checkOutTime,
        total_fee: finalFee
      });

    if (session.slot_id) {
      await db('Parking_Slots').where({ slot_id: session.slot_id }).update({ status: 'Available' });
    }

    res.status(200).json({ 
      message: isVIP ? `Xin chào KHÁCH VIP! Chúc thượng lộ bình an!` : `Xe ra thành công! Thu phí: ${finalFee.toLocaleString()} VNĐ`, 
      open_barrier: true,
      fee: finalFee,
      hours: diffHours,
      is_vip: isVIP
    });

  } catch (error) {
    console.error("Lỗi khi AI Check-out:", error);
    res.status(500).json({ message: 'Lỗi hệ thống' });
  }
};

// Ép hủy đặt chỗ (Dành cho Admin/Web khi khách không đến - KHÔNG HOÀN TIỀN)
exports.adminCancelBooking = async (req, res) => {
  const { session_id, slot_id } = req.body;

  try {
    // 1. Chuyển trạng thái xe thành "Cancelled" (Giữ lại lịch sử)
    await db('Parking_Sessions')
      .where({ session_id: session_id })
      .update({ status: 'Cancelled' });

    // 2. Trả lại ô đỗ đó về trạng thái Trống
    if (slot_id) {
      await db('Parking_Slots')
        .where({ slot_id: slot_id })
        .update({ status: 'Available' });
    }

    res.status(200).json({ message: 'Đã hủy booking (Khách mất cọc) và giải phóng ô đỗ!' });
  } catch (error) {
    console.error("Lỗi khi hủy đặt chỗ:", error);
    res.status(500).json({ message: 'Lỗi hệ thống khi hủy đặt chỗ.' });
  }
};

// Bộ nhớ tạm để lưu dữ liệu Camera gửi lên (Chưa lưu vào Database)
let pendingScans = { 'VÀO': null, 'RA': null };

// 1. AI GỌI HÀM NÀY ĐỂ GỬI ẢNH LÊN
exports.receivePendingScan = (req, res) => {
  const { license_plate, gate, image } = req.body;
  
  if (!gate) return res.status(400).json({ message: "Thiếu cổng VÀO/RA" });

  // Lưu đè hình ảnh mới nhất vào bộ nhớ tạm
  pendingScans[gate] = {
    license_plate,
    gate,
    image,
    timestamp: Date.now()
  };

  res.status(200).json({ message: "Đã nhận dữ liệu chờ duyệt!" });
};

// 2. WEB DASHBOARD SẼ LIÊN TỤC GỌI HÀM NÀY ĐỂ HỎI XEM CÓ XE NÀO TỚI KHÔNG
exports.getPendingScans = (req, res) => {
  res.status(200).json(pendingScans);
};

// 3. SAU KHI BẢO VỆ DUYỆT XONG, GỌI HÀM NÀY ĐỂ XÓA POPUP
exports.clearPendingScan = (req, res) => {
  const { gate } = req.body;
  if (gate) pendingScans[gate] = null;
  res.status(200).json({ message: "Đã xóa trạng thái chờ" });
};

// ==========================================
// API TRẢ VỀ THẺ "ĐANG GIỮ CHỖ / ĐANG ĐỖ" CHO MOBILE
// ==========================================
exports.getActiveBooking = async (req, res) => {
  try {
    const user_id = req.user.userId; // Lấy ID từ Token đăng nhập

    // 1. Tìm phiên đỗ xe gần nhất đang ở trạng thái Booked (Giữ chỗ) hoặc Active (Đang đỗ)
    const activeSession = await db('Parking_Sessions')
      .where({ user_id: user_id })
      .whereIn('status', ['Booked', 'Active'])
      .orderBy('check_in_time', 'desc') // Sắp xếp mới nhất
      .first();

    // 2. NẾU KHÔNG TÌM THẤY (Bãi trống, không đặt chỗ)
    if (!activeSession) {
      return res.status(200).json({ has_active: false });
    }

    // 3. NẾU TÌM THẤY -> Chuẩn bị dữ liệu JSON đúng format Mobile yêu cầu
    
    // Hàm format giờ giấc thành HH:MM (VD: 15:00)
    const formatTime = (dateString) => {
      if (!dateString) return '--:--';
      const d = new Date(dateString);
      return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    // Xác định giờ bắt đầu: Nếu đặt chỗ thì lấy booking_time, nếu vãng lai thì lấy check_in_time
    const startTimeDate = activeSession.booking_time || activeSession.check_in_time;
    
    // Tính toán giờ kết thúc (Dự kiến cộng thêm 2 tiếng thời gian giữ chỗ tối đa)
    const endTimeDate = new Date(new Date(startTimeDate).getTime() + 2 * 60 * 60 * 1000);

    // Trả về JSON cho Mobile
    res.status(200).json({
      has_active: true,
      data: {
        session_id: activeSession.session_id, // Gửi thêm cái này lỡ Mobile cần dùng gọi API Hủy đặt chỗ
        slot_id: activeSession.slot_id,
        license_plate: activeSession.license_plate,
        start_time: formatTime(startTimeDate),
        end_time: formatTime(endTimeDate),
        real_status: activeSession.status // 'Booked' hoặc 'Active' để Mobile đổi màu thẻ nếu muốn
      }
    });

  } catch (error) {
    console.error("Lỗi lấy Active Booking:", error);
    res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu thẻ giữ chỗ.' });
  }
};