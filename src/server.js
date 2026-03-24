require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

// 4. Khởi động Server
app.listen(PORT, () => {
  console.log(`✅ Server Backend đã khởi chạy tại: http://localhost:${PORT}`);
});