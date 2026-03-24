const db = require('../db'); // Nhớ check lại đường dẫn file db

exports.getSettings = async (req, res) => {
  try {
    const settings = await db('Settings').first() || { car_hour_price: 10000 };
    
    // Bơm dữ liệu giá tiền từ DB lên Frontend Desktop
    res.status(200).json({
      data: {
        pricing: { 
            carHour: settings.car_hour_price, // <- Dữ liệu lấy từ DB đây!
            carDay: 60000, carNight: 20000, motoHour: 4000, motoDay: 30000, motoNight: 8000, truckHour: 15000, truckDay: 120000, freeMinutes: 15 
        },
        systems: { autoBarrier: true, liveCamera: true, nightMode: false, emailAlert: true, smsAlert: false, autoReport: true }
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tải cài đặt' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { pricing } = req.body;
    
    // Lấy cái giá mới mà người dùng vừa gõ trên Web Admin
    const newPrice = pricing.carHour; 
    
    // Lưu đè thẳng vào Database
    await db('Settings').update({ car_hour_price: newPrice });

    res.status(200).json({ message: 'Lưu cài đặt thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi lưu cài đặt' });
  }
};