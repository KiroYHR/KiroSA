import { useState } from 'react';
import { MdLocalParking, MdPhone, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import './Login.css';

export default function Login({ onLogin }) {
  // Thay email thành số điện thoại để khớp với Backend
  const [phone, setPhone] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!phone || !password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    
    setLoading(true);

    try {
      // Gọi API Đăng nhập thật từ Backend
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: phone,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // KIỂM TRA PHÂN QUYỀN TẠI ĐÂY (Chú ý: data.user.role)
        if (data.user.role !== 'Admin') {
          setError('⛔ Truy cập bị từ chối: Bạn không phải là Quản trị viên!');
          setLoading(false);
          return; // Chặn đứng, không lưu Token, không cho vào Dashboard!
        }

        // Đăng nhập thành công và đúng là Admin -> Lưu Token vào trình duyệt
        localStorage.setItem('adminToken', data.token);
        
        // Mở khóa cho vào Dashboard
        onLogin();
      } else {
        // Trả về lỗi từ Backend (Sai pass, không tồn tại user...)
        setError(data.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error(err);
      setError('Không thể kết nối đến máy chủ Backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Branding Panel */}
      <div className="login-left">
        <div className="login-brand">
          <div className="brand-logo-icon"><MdLocalParking /></div>
          <div>
            <h1 className="brand-name">SmartPark</h1>
            <p className="brand-tagline">Hệ Thống Quản lý Bãi đỗ xe</p>
          </div>
        </div>
        <div className="brand-description">
          <p>Giải pháp quản lý bãi đỗ xe thông minh, hiệu quả và tự động hóa hoàn toàn cho doanh nghiệp hiện đại.</p>
        </div>
        <div className="brand-stats">
          <div className="brand-stat">
            <span className="brand-stat-value">99.9%</span>
            <span className="brand-stat-label">Uptime</span>
          </div>
          <div className="brand-stat">
            <span className="brand-stat-value">24/7</span>
            <span className="brand-stat-label">Giám sát</span>
          </div>
          <div className="brand-stat">
            <span className="brand-stat-value">AI</span>
            <span className="brand-stat-label">Nhận diện</span>
          </div>
        </div>
        <div className="brand-glow" />
        <div className="brand-circle-1" />
        <div className="brand-circle-2" />
      </div>

      {/* Right Login Form */}
      <div className="login-right">
        <div className="login-form-card">
          <div className="login-form-header">
            <h2>Đăng nhập Hệ thống</h2>
            <p>Vui lòng đăng nhập bằng tài khoản Quản trị viên.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Số điện thoại</label>
              <div className="input-wrapper">
                <MdPhone className="input-icon" />
                <input
                  type="text"
                  className="form-input has-icon"
                  placeholder="0987654321"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div className="input-wrapper">
                <MdLock className="input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input has-icon has-icon-right"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass(!showPass)}
                  tabIndex={-1}
                >
                  {showPass ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            {error && <div className="login-error" style={{ color: '#ff4d4f', marginBottom: '15px', fontSize: '14px', fontWeight: '500' }}>{error}</div>}

            <button
              type="submit"
              className={`btn btn-primary btn-lg login-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner" /> Đang kiểm tra...</>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <div className="login-hint" style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#666' }}>
            <span>Dùng số điện thoại và mật khẩu đã tạo trong Database</span>
          </div>
        </div>
      </div>
    </div>
  );
}