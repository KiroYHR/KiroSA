const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Lấy token từ Header do Mobile gửi lên
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Từ chối truy cập: Không có Token!' });
  }

  try {
    // 2. Tách bỏ chữ "Bearer " để lấy đúng cái chuỗi "eyJ..."
    const splitToken = token.startsWith('Bearer ') ? token.slice(7, token.length).trimLeft() : token;

    // 3. ĐÂY LÀ CHỖ QUYẾT ĐỊNH: Dùng đúng chìa khóa '123456' để mở!
    const verified = jwt.verify(splitToken, '123456'); 

    // 4. Mở thành công thì nhét thẻ vào túi (req.user) rồi cho đi tiếp
    req.user = verified;
    next();
  } catch (error) {
    // Bắt lỗi nếu thẻ sai hoặc hết hạn
    res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
  }
};

module.exports = authMiddleware;