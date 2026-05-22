require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 👇 1. IMPORT THÊM 2 THƯ VIỆN NÀY ĐỂ CHẠY CRON JOB 👇
const cron = require('node-cron');
const db = require('./db'); // (Lưu ý: Check lại đường dẫn file db.js nếu bạn để nó trong thư mục khác nhé)
// 👆 ----------------------------------------------- 👆

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middlewares: Cho phép nhận dữ liệu từ Mobile, Desktop (Sắp xếp đúng thứ tự)
app.use(cors());
app.use(express.json());

// 2. Trang chủ báo hiệu Server đang chạy ở cửa chính (/)
app.get('/', (req, res) => {
  res.send('<h1>✅ SmartPark API Server đang hoạt động tốt!</h1>');
});

// Một API test thử xem server có sống không (/api/health)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success', 
    message: '🚀 Backend Smart Parking đang hoạt động cực kỳ mượt mà!' 
  });
});

// 3. Khai báo các Routes chính của hệ thống
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const parkingRoutes = require('./routes/parkingRoutes');
app.use('/api/parking', parkingRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const settingsRoutes = require('./routes/settingsRoutes');
app.use('/api/settings', settingsRoutes);

const paymentRoutes = require('./routes/paymentRoutes');
app.use('/api/payments', paymentRoutes);

const vehicleRoutes = require('./routes/vehicleRoutes');
app.use('/api/vehicles', vehicleRoutes);

const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);

// ==========================================================
// 👇 4. CRON JOB: NGƯỜI GÁC CỔNG TỰ ĐỘNG DỌN DẸP Ô ĐỖ (Chạy mỗi phút) 👇
// ==========================================================
cron.schedule('* * * * *', async () => {
  try {
    // Sửa tạm thành 1 phút (1 * 60 * 1000) để test cho lẹ. Test xong bạn sửa lại thành 30 nhé!
    const EXPIRE_TIME = new Date(Date.now() - 1 * 60 * 1000); 

    // Tìm các đơn 'Booked' (Đã đặt) mà booking_time quá hạn
    const expiredBookings = await db('Parking_Sessions')
      .where('status', 'Booked')
      .andWhere('booking_time', '<', EXPIRE_TIME);

    if (expiredBookings.length > 0) {
      const sessionIds = expiredBookings.map(b => b.session_id);
      const slotIds = expiredBookings.map(b => b.slot_id);

      // Bắt đầu Transaction để đảm bảo an toàn dữ liệu
      await db.transaction(async (trx) => {
        // Hủy đơn Đặt chỗ
        await trx('Parking_Sessions')
          .whereIn('session_id', sessionIds)
          .update({ status: 'Cancelled' });

        // Giải phóng Ô đỗ
        await trx('Parking_Slots')
          .whereIn('slot_id', slotIds)
          .update({ status: 'Available' });
      });

      console.log(`[CRON JOB 🤖] Vừa dọn dẹp ${expiredBookings.length} ô đỗ bị "ngâm" quá giờ. Khách đã mất cọc!`);
    }
  } catch (error) {
    console.error('[CRON JOB ❌] Lỗi khi tự động dọn dẹp:', error);
  }
});
// 👆 ================= KẾT THÚC CRON JOB ================== 👆

// 5. Khởi động Server
app.listen(PORT, () => {
  console.log(`✅ Server Backend đã khởi chạy tại: http://localhost:${PORT}`);
  console.log(`🤖 Cron Job (Gác cổng) đã được kích hoạt!`);
});