import { useState, useEffect } from 'react';
import {
  MdSettings, MdSave, MdVideocam, MdLock, MdNotifications,
  MdMonetizationOn, MdInfo
} from 'react-icons/md';
import './Settings.css';

function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle-label">
      <button
        className={`toggle-btn ${checked ? 'on' : 'off'}`}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span className="toggle-thumb" />
      </button>
      <span className="toggle-text">{label}</span>
    </label>
  );
}

export default function Settings() {
  const [pricing, setPricing] = useState({
    carHour: 0, carDay: 0, carNight: 0, motoHour: 0, motoDay: 0, motoNight: 0, truckHour: 0, truckDay: 0, freeMinutes: 0,
  });

  const [systems, setSystems] = useState({
    autoBarrier: false, liveCamera: false, emailAlert: false, smsAlert: false, nightMode: false, autoReport: false,
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. KÉO DỮ LIỆU CÀI ĐẶT TỪ BACKEND
  useEffect(() => {
    fetch('http://localhost:5000/api/settings')
      .then(res => res.json())
      .then(result => {
        if (result.data) {
          setPricing(result.data.pricing);
          setSystems(result.data.systems);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi tải cài đặt:", err);
        setLoading(false);
      });
  }, []);

  // 2. GỬI DỮ LIỆU LÊN BACKEND KHI BẤM LƯU
  const handleSave = () => {
    fetch('http://localhost:5000/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pricing, systems })
    })
      .then(res => res.json())
      .then(result => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      })
      .catch(err => console.error("Lỗi khi lưu:", err));
  };

  const updateP = (k, v) => setPricing(p => ({ ...p, [k]: Number(v) }));

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Đang tải cấu hình hệ thống...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cài đặt hệ thống</h1>
          <p className="page-subtitle">Dữ liệu được lưu trữ trực tiếp trên Server</p>
        </div>
        <button className={`btn ${saved ? 'btn-success' : 'btn-primary'}`} onClick={handleSave}>
          <MdSave /> {saved ? 'Đã lưu trên Server!' : 'Lưu cài đặt'}
        </button>
      </div>

      {saved && (
        <div className="save-toast">
          <MdInfo /> Cài đặt đã được đồng bộ với Backend thành công!
        </div>
      )}

      <div className="settings-grid">
        {/* Pricing */}
        <div className="card settings-section">
          <div className="settings-section-header">
            <MdMonetizationOn className="section-icon" />
            <div>
              <div className="settings-section-title">Bảng giá vé</div>
              <div className="settings-section-sub">Thiết lập phí đỗ xe theo từng loại phương tiện</div>
            </div>
          </div>

          <div className="pricing-block">
            <div className="pricing-type-label">🚗 Ô tô</div>
            <div className="pricing-row">
              <div className="form-group">
                <label className="form-label">Giá theo giờ (₫)</label>
                <input type="number" className="form-input" value={pricing.carHour} onChange={e => updateP('carHour', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Giá cả ngày (₫)</label>
                <input type="number" className="form-input" value={pricing.carDay} onChange={e => updateP('carDay', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Giá qua đêm (₫)</label>
                <input type="number" className="form-input" value={pricing.carNight} onChange={e => updateP('carNight', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="pricing-block">
            <div className="pricing-type-label">🏍️ Xe máy</div>
            <div className="pricing-row">
              <div className="form-group">
                <label className="form-label">Giá theo giờ (₫)</label>
                <input type="number" className="form-input" value={pricing.motoHour} onChange={e => updateP('motoHour', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Giá cả ngày (₫)</label>
                <input type="number" className="form-input" value={pricing.motoDay} onChange={e => updateP('motoDay', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Giá qua đêm (₫)</label>
                <input type="number" className="form-input" value={pricing.motoNight} onChange={e => updateP('motoNight', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="pricing-block">
            <div className="pricing-type-label">🚚 Xe tải</div>
            <div className="pricing-row">
              <div className="form-group">
                <label className="form-label">Giá theo giờ (₫)</label>
                <input type="number" className="form-input" value={pricing.truckHour} onChange={e => updateP('truckHour', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Giá cả ngày (₫)</label>
                <input type="number" className="form-input" value={pricing.truckDay} onChange={e => updateP('truckDay', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="pricing-block" style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <div className="pricing-type-label">⏱️ Thời gian miễn phí</div>
            <div className="pricing-row">
              <div className="form-group" style={{ maxWidth: 200 }}>
                <label className="form-label">Số phút miễn phí (phút)</label>
                <input type="number" className="form-input" value={pricing.freeMinutes} onChange={e => updateP('freeMinutes', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="settings-right">
          <div className="card settings-section" style={{ marginBottom: 20 }}>
            <div className="settings-section-header">
              <MdVideocam className="section-icon" />
              <div>
                <div className="settings-section-title">Camera & Barie</div>
                <div className="settings-section-sub">Điều khiển thiết bị phần cứng</div>
              </div>
            </div>
            <div className="toggle-list">
              <div className="toggle-item">
                <div className="toggle-info">
                  <div className="toggle-name">Tự động mở barie khi nhận diện xe</div>
                  <div className="toggle-desc">Barie sẽ tự động mở khi camera nhận diện biển số</div>
                </div>
                <Toggle checked={systems.autoBarrier} onChange={v => setSystems(s => ({...s, autoBarrier: v}))} />
              </div>
              <div className="toggle-item">
                <div className="toggle-info">
                  <div className="toggle-name">Luồng camera trực tiếp</div>
                  <div className="toggle-desc">Hiển thị live feed trên dashboard</div>
                </div>
                <Toggle checked={systems.liveCamera} onChange={v => setSystems(s => ({...s, liveCamera: v}))} />
              </div>
              <div className="toggle-item">
                <div className="toggle-info">
                  <div className="toggle-name">Chế độ ban đêm</div>
                  <div className="toggle-desc">Tăng độ nhạy camera trong điều kiện thiếu sáng</div>
                </div>
                <Toggle checked={systems.nightMode} onChange={v => setSystems(s => ({...s, nightMode: v}))} />
              </div>
            </div>
          </div>

          <div className="card settings-section">
            <div className="settings-section-header">
              <MdNotifications className="section-icon" />
              <div>
                <div className="settings-section-title">Thông báo</div>
                <div className="settings-section-sub">Cấu hình cảnh báo và báo cáo tự động</div>
              </div>
            </div>
            <div className="toggle-list">
              <div className="toggle-item">
                <div className="toggle-info">
                  <div className="toggle-name">Cảnh báo qua Email</div>
                  <div className="toggle-desc">Gửi cảnh báo sự kiện bất thường qua email</div>
                </div>
                <Toggle checked={systems.emailAlert} onChange={v => setSystems(s => ({...s, emailAlert: v}))} />
              </div>
              <div className="toggle-item">
                <div className="toggle-info">
                  <div className="toggle-name">Cảnh báo qua SMS</div>
                  <div className="toggle-desc">Nhắn tin SMS khi có sự cố</div>
                </div>
                <Toggle checked={systems.smsAlert} onChange={v => setSystems(s => ({...s, smsAlert: v}))} />
              </div>
              <div className="toggle-item">
                <div className="toggle-info">
                  <div className="toggle-name">Báo cáo tự động hàng ngày</div>
                  <div className="toggle-desc">Gửi báo cáo doanh thu lúc 23:59 mỗi ngày</div>
                </div>
                <Toggle checked={systems.autoReport} onChange={v => setSystems(s => ({...s, autoReport: v}))} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}