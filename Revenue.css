import { useState, useEffect } from 'react';
import {
  MdDirectionsCar, MdLocalParking, MdCheckCircle, MdAttachMoney,
  MdVideocam, MdLock, MdLockOpen, MdRefresh, MdTrendingUp, MdAccessTime, MdLink, MdLogout
} from 'react-icons/md';
import './Dashboard.css';

const CAMERAS = [
  { id: 1, name: 'Camera Cổng Vào', location: 'Lối vào chính', plate: 'AI ĐANG QUÉT...' },
  { id: 2, name: 'Camera Cổng Ra', location: 'Lối ra chính', plate: 'AI ĐANG QUÉT...' },
];

function StatCard({ label, value, unit, icon, color, trend }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <div className="stat-value">{value}<span className="stat-unit">{unit}</span></div>
        <div className="stat-label">{label}</div>
      </div>
      {trend && (
        <div className={`stat-trend ${trend.startsWith('-') ? 'down' : 'up'}`}>
          <MdTrendingUp /> {trend}
        </div>
      )}
    </div>
  );
}

function CameraFeed({ camera, barrierOpen, onToggleBarrier }) {
  const [time, setTime] = useState(new Date());
  const [streamUrl, setStreamUrl] = useState('');

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const savedUrl = localStorage.getItem(`camUrl_${camera.id}`);
    if (savedUrl) setStreamUrl(savedUrl);
    return () => clearInterval(timer);
  }, [camera.id]);

  const handleConnectCamera = () => {
    const ip = prompt('Nhập địa chỉ IP Webcam (VD: http://192.168.1.45:8080):');
    if (ip) {
      const finalUrl = `${ip.replace(/\/$/, '')}/video`;
      setStreamUrl(finalUrl);
      localStorage.setItem(`camUrl_${camera.id}`, finalUrl);
    }
  };

  const handleDisconnectCamera = () => {
    if (window.confirm('Bạn có chắc chắn muốn ngắt kết nối Camera này?')) {
      setStreamUrl('');
      localStorage.removeItem(`camUrl_${camera.id}`);
    }
  };

  return (
    <div className="cam-card">
      <div className="cam-header">
        <div className="cam-title">
          <MdVideocam /> {camera.name}
          <span className="cam-badge">{camera.location}</span>
        </div>
        <div className="cam-time"><MdAccessTime /> {time.toLocaleTimeString('vi-VN')}</div>
      </div>
      
      <div className="cam-body">
        <div className="camera-feed" style={{ position: 'relative', overflow: 'hidden' }}>
          {streamUrl ? (
            <>
              <img 
                src={streamUrl} 
                alt="Live Stream" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} 
              />
              <button 
                onClick={handleDisconnectCamera}
                style={{ 
                  position: 'absolute', top: '10px', right: '10px', zIndex: 20, 
                  padding: '6px 12px', background: 'rgba(220, 53, 69, 0.9)', 
                  color: 'white', border: 'none', borderRadius: '4px', 
                  cursor: 'pointer', fontWeight: 'bold', fontSize: '12px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                }}>
                Ngắt kết nối
              </button>
            </>
          ) : (
            <div className="cam-overlay-grid" />
          )}
          
          <div className="cam-scan-line" />
        </div>

        <div className="cam-footer">
          <div className="plate-result">
            <span className="plate-label">Biển số nhận diện:</span>
            <span className="plate-number">{camera.plate}</span>
          </div>
          
          <div className="cam-controls">
            <button 
              className={`btn ${barrierOpen ? 'btn-danger' : 'btn-success'}`}
              onClick={() => onToggleBarrier(camera.id)}
            >
              {barrierOpen ? <MdLockOpen /> : <MdLock />}
              {barrierOpen ? ' Đóng Barie' : ' Mở Barie'}
            </button>
            
            {!streamUrl && (
              <button className="btn btn-outline" onClick={handleConnectCamera}>
                <MdLink /> Kết nối Phone Camera
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [barriers, setBarriers] = useState(() => {
    const savedBarriers = localStorage.getItem('barriersState');
    return savedBarriers ? JSON.parse(savedBarriers) : { 1: false, 2: false };
  });
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const [slotsData, setSlotsData] = useState([]);
  const [dynamicStats, setDynamicStats] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [pendingScan, setPendingScan] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [slotsRes, revenueRes, logsRes] = await Promise.all([
        fetch('http://localhost:5000/api/parking/slots'),
        fetch('http://localhost:5000/api/parking/revenue'),
        fetch('http://localhost:5000/api/parking/all-sessions')
      ]);

      const slotsResult = await slotsRes.json();
      const revenueResult = await revenueRes.json();
      
      let logsData = []; 
      if (logsRes.ok) {
        logsData = await logsRes.json(); 
        setLogs(logsData);
        if (logsData.length > 0) {
            const latestLog = logsData[0];
            const checkInTime = new Date(latestLog.check_in_time).getTime();
            const now = new Date().getTime();
            if (now - checkInTime < 5000 && latestLog.status === 'Active') {
                setBarriers(prev => ({ ...prev, 1: true }));
                setTimeout(() => setBarriers(prev => ({ ...prev, 1: false })), 4000);
            }
        }
      }

      if (slotsResult.data) {
        const slots = slotsResult.data;
        setSlotsData(slots);
        
        const totalSlots = slotsResult.total_slots || 10;
        const availableSlots = slots.filter(s => s.status === 'Available').length;
        const occupiedSlots = totalSlots - availableSlots;

        let todayRevenue = 0;
        if (logsData && logsData.length > 0) {
          const todayString = new Date().toLocaleDateString('vi-VN');
          logsData.forEach(session => {
            if (session.status === 'Completed' && session.check_out_time) {
              const checkOutDate = new Date(session.check_out_time);
              if (checkOutDate.toLocaleDateString('vi-VN') === todayString) {
                todayRevenue += parseFloat(session.total_fee) || 0;
              }
            }
          });
        }

        try {
          const pendingRes = await fetch('http://localhost:5000/api/parking/pending-scans');
          if (pendingRes.ok) {
            const pendingData = await pendingRes.json();
            setPendingScan(current => {
              if (current) return current; 
              if (pendingData['VÀO']) return { ...pendingData['VÀO'], plate: pendingData['VÀO'].license_plate };
              if (pendingData['RA']) return { ...pendingData['RA'], plate: pendingData['RA'].license_plate };
              return null;
            });
          }
        } catch (e) {
          console.error("Lỗi lấy dữ liệu pending:", e);
        }

        setDynamicStats([
          { label: 'Tổng chỗ đỗ', value: totalSlots, unit: '', icon: <MdLocalParking />, color: 'blue', trend: null },
          { label: 'Còn trống', value: availableSlots, unit: '', icon: <MdCheckCircle />, color: 'green', trend: null },
          { label: 'Đang sử dụng', value: occupiedSlots, unit: '', icon: <MdDirectionsCar />, color: 'yellow', trend: null },
          { label: 'Doanh thu hôm nay', value: todayRevenue.toLocaleString('vi-VN'), unit: '₫', icon: <MdAttachMoney />, color: 'purple', trend: 'Live' }
        ]);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Lỗi kết nối Backend:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleBarrier = (cameraId) => {
    setBarriers(prev => {
      const newState = { ...prev, [cameraId]: !prev[cameraId] };
      localStorage.setItem('barriersState', JSON.stringify(newState));
      return newState;
    });
  };

  const handleSlotClick = (slot) => {
    if (slot.status === 'Available') {
      alert(`Ô ${slot.slot_id} đang trống, sẵn sàng đón khách!`);
      return;
    }
    const occupant = logs.find(log => log.slot_id === slot.slot_id && (log.status === 'Active' || log.status === 'Booked'));
    setSelectedSlot({ slot, occupant });
  };

  const handleClearSlot = async (slot_id) => {
    if (window.confirm(`Bạn có chắc chắn muốn ép giải phóng ô ${slot_id} không?`)) {
      try {
        await fetch('http://localhost:5000/api/parking/clear-slot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slot_id })
        });
        setSelectedSlot(null); 
        fetchDashboardData(); 
      } catch (err) {
        alert("Lỗi khi giải phóng ô đỗ!");
      }
    }
  };

  const handleManualCheckout = async (session_id) => {
    if (window.confirm('Xác nhận cho xe này ra khỏi bãi?')) {
      try {
        await fetch('http://localhost:5000/api/parking/manual-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id })
        });
        fetchDashboardData(); 
      } catch (err) {
        alert("Lỗi khi cập nhật giờ ra!");
      }
    }
  };

  const handleCancelBooking = async (session_id, slot_id) => {
    if (window.confirm('Khách không đến? Bạn có chắc chắn muốn HỦY lịch đặt chỗ này (Khách sẽ mất cọc)?')) {
      try {
        await fetch('http://localhost:5000/api/parking/admin-cancel-booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id, slot_id })
        });
        fetchDashboardData(); 
      } catch (err) {
        alert("Lỗi khi hủy đặt chỗ!");
      }
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Giám sát & Điều hành</h1>
          <p className="page-subtitle">Cập nhật: {lastUpdate.toLocaleTimeString('vi-VN')} — Dữ liệu lấy trực tiếp từ Backend</p>
        </div>
        <button className="btn btn-outline" onClick={fetchDashboardData}>
          <MdRefresh /> Làm mới Dữ liệu
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {dynamicStats.length > 0 ? (
          dynamicStats.map((s, i) => <StatCard key={i} {...s} />)
        ) : (
          <p>Đang tải dữ liệu...</p>
        )}
      </div>

      <div className="section-label"><MdLocalParking /> Sơ đồ Tầng hầm B1</div>
      <div className="card" style={{ marginBottom: 24, padding: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {slotsData.map(slot => (
            <div 
              key={slot.slot_id} 
              onClick={() => handleSlotClick(slot)}
              style={{ 
                width: '100px', height: '80px', border: '1px solid #444', 
                borderRadius: '8px', display: 'flex', flexDirection: 'column', 
                justifyContent: 'center', alignItems: 'center', 
                cursor: 'pointer', transition: 'transform 0.2s',
                backgroundColor: slot.status === 'Available' ? 'rgba(40, 167, 69, 0.2)' : slot.status === 'Occupied' ? 'rgba(220, 53, 69, 0.2)' : 'rgba(255, 193, 7, 0.2)', 
                color: slot.status === 'Available' ? '#28a745' : slot.status === 'Occupied' ? '#dc3545' : '#ffc107' 
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#fff' }}>{slot.slot_id}</h3>
              <span style={{ fontSize: '11px', fontWeight: 'bold', marginTop: '5px' }}>
                {slot.status === 'Available' ? 'TRỐNG' : slot.status === 'Occupied' ? 'ĐANG ĐỖ' : 'ĐÃ ĐẶT'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-label"><MdVideocam /> Luồng Camera Giám Sát Trực Tiếp</div>
      <div className="grid-2" style={{ marginBottom: 24 }}>
        {CAMERAS.map(cam => (
          <CameraFeed 
            key={cam.id} 
            camera={cam} 
            barrierOpen={barriers[cam.id]} 
            onToggleBarrier={handleToggleBarrier} 
          />
        ))}
      </div>
      
      <div className="section-label"><MdDirectionsCar /> Nhật ký xe ra/vào gần đây</div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Biển số xe</th><th>Loại xe</th><th>Vị trí</th><th>Giờ vào</th><th>Giờ ra</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((session, index) => (
                  <tr key={session.session_id}>
                    <td style={{ color: 'var(--text-muted)' }}>{index + 1}</td>
                    <td><strong style={{ color: 'var(--accent-blue-light)' }}>{session.license_plate}</strong></td>
                    <td>Ô tô</td>
                    <td><span className="badge badge-info">{session.slot_id || 'Vãng lai'}</span></td>
                    <td style={{ color: session.check_in_time ? 'inherit' : 'var(--text-muted)' }}>
                      {session.check_in_time ? new Date(session.check_in_time).toLocaleTimeString('vi-VN') : '--:--'}
                    </td>
                    <td style={{ color: session.check_out_time ? 'inherit' : 'var(--text-muted)' }}>
                      {session.check_out_time ? new Date(session.check_out_time).toLocaleTimeString('vi-VN') : '--:--'}
                    </td>
                    
                    <td>
                      {session.status === 'Active' 
                        ? <span className="badge badge-success">Đang đỗ</span> 
                        : session.status === 'Booked' 
                          ? <span className="badge badge-warning" style={{ background: '#f59e0b', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Đã đặt chỗ</span>
                          : session.status === 'Cancelled'
                            ? <span className="badge badge-danger" style={{ background: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Đã hủy</span>
                            : <span className="badge badge-muted">Đã rời</span>}
                    </td>

                    <td>
                      {session.status === 'Active' && (
                        <button 
                          onClick={() => handleManualCheckout(session.session_id)}
                          style={{ padding: '4px 8px', background: 'transparent', color: '#f87171', border: '1px solid #f87171', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '12px' }}
                        >
                          <MdLogout style={{ marginRight: '4px' }}/> Bấm cho ra
                        </button>
                      )}
                      
                      {session.status === 'Booked' && (
                        <button 
                          onClick={() => handleCancelBooking(session.session_id, session.slot_id)}
                          style={{ padding: '4px 8px', background: 'transparent', color: '#a8a29e', border: '1px solid #a8a29e', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '12px' }}
                        >
                           Hủy Booking
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu xe ra vào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP SƠ ĐỒ ĐỖ XE */}
      {selectedSlot && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: '#1e1e2d', padding: '24px', borderRadius: '12px', width: '350px', border: '1px solid #444', color: 'white', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
            <h2 style={{ marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>
              Chi tiết ô {selectedSlot.slot.slot_id}
            </h2>
            
            <div style={{ margin: '20px 0', fontSize: '16px', lineHeight: '1.6' }}>
              <p>Trạng thái: <strong>{selectedSlot.slot.status === 'Occupied' ? '🔴 Đang có xe đỗ' : '🟡 Đã được đặt trước'}</strong></p>
              
              {selectedSlot.occupant ? (
                <>
                  <p>Biển số xe: <strong style={{ color: '#3b82f6', fontSize: '18px' }}>{selectedSlot.occupant.license_plate}</strong></p>
                  
                  {/* Phân biệt hiển thị Giờ Đặt và Giờ Vào ĐÃ ĐƯỢC ĐẶT CHUẨN XÁC VÀO ĐÂY */}
                  {selectedSlot.occupant.status === 'Booked' ? (
                     <p>Giờ đặt chỗ: <span style={{color: '#f59e0b'}}>{new Date(selectedSlot.occupant.booking_time || selectedSlot.occupant.check_in_time).toLocaleString('vi-VN')}</span></p>
                  ) : (
                     <p>Giờ vào: <span style={{color: '#10b981'}}>{new Date(selectedSlot.occupant.check_in_time).toLocaleTimeString('vi-VN')}</span></p>
                  )}
                </>
              ) : (
                <p style={{ color: '#aaa' }}><i>(Đang đợi hệ thống cập nhật hoặc xe đặt chỗ từ App)</i></p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setSelectedSlot(null)}>Đóng</button>
              <button className="btn btn-danger" onClick={() => handleClearSlot(selectedSlot.slot.slot_id)}>
                <MdLockOpen style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Giải phóng ô
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP CAMERA AI CHỜ XÁC NHẬN */}
      {pendingScan && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', 
          justifyContent: 'center', alignItems: 'center', zIndex: 99999
        }}>
          <div style={{
            background: '#1e1e2d', width: '450px', padding: '24px', 
            borderRadius: '12px', border: '2px solid #3b82f6', color: 'white',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)'
          }}>
            <h2 style={{ marginTop: 0, color: '#60a5fa', textAlign: 'center' }}>
              ⚠️ XÁC NHẬN XE {pendingScan.gate} BÃI
            </h2>
            
            <div style={{ height: '150px', background: '#000', borderRadius: '8px', margin: '20px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '1px solid #444' }}>
               {pendingScan.image ? (
                 <img src={pendingScan.image} alt="Biển số" style={{ height: '100%', objectFit: 'contain' }}/>
               ) : (
                 <span style={{ color: '#666' }}>[Hình ảnh biển số cắt từ Camera]</span>
               )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#aaa' }}>Biển số AI đọc (Bảo vệ có thể sửa):</label>
              <input 
                type="text" 
                value={pendingScan.plate || ''} 
                onChange={(e) => setPendingScan({...pendingScan, plate: e.target.value.toUpperCase()})}
                style={{ 
                  width: '100%', padding: '12px', fontSize: '24px', 
                  fontWeight: 'bold', textAlign: 'center', borderRadius: '8px',
                  border: '2px solid #444', background: '#2a2a3c', color: '#fff',
                  textTransform: 'uppercase'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, padding: '12px' }}
                onClick={async () => {
                  await fetch('http://localhost:5000/api/parking/clear-pending', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gate: pendingScan.gate })
                  });
                  setPendingScan(null);
                }}
              >
                Hủy bỏ (Sai xe)
              </button>
              
              <button 
                className="btn btn-success" 
                style={{ flex: 2, padding: '12px', fontSize: '18px', fontWeight: 'bold' }}
                onClick={async () => {
                  try {
                    await fetch('http://localhost:5000/api/parking/clear-pending', {
                      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gate: pendingScan.gate })
                    });

                    const apiEndpoint = pendingScan.gate === 'VÀO' ? '/check-in' : '/check-out';
                    const res = await fetch(`http://localhost:5000/api/parking${apiEndpoint}`, {
                      method: 'POST', headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ license_plate: pendingScan.plate })
                    });
                    
                    const result = await res.json();
                    alert(result.message); 
                    
                    setPendingScan(null);
                    fetchDashboardData(); 
                  } catch (err) {
                    alert("Lỗi kết nối khi xác nhận!");
                  }
                }}
              >
                XÁC NHẬN MỞ CỔNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}