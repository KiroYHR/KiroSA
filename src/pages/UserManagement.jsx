import { useState, useEffect } from 'react';
import {
  MdPeople, MdSearch, MdAdd, MdDownload, MdEdit, MdBlock, 
  MdCheckCircle, MdDirectionsCar, MdAdminPanelSettings, MdStar
} from 'react-icons/md';
import './UserManagement.css';

const STATUS_MAP = {
  active:   { label: 'Hoạt động',  cls: 'badge-success' },
  blocked:  { label: 'Bị chặn',    cls: 'badge-danger' },
};

export default function UserManagement() {
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('all');
  const [memberType, setMemberType] = useState('all'); 
  
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  // 👇 ĐÃ THÊM THẺ NHỚ LOCALSTORAGE ĐỂ F5 KHÔNG BỊ MẤT TAB 👇
  const [roleTab, setRoleTab] = useState(() => {
    return localStorage.getItem('userRoleTab') || 'Customer';
  });

  const handleTabSwitch = (tabName) => {
    setRoleTab(tabName);
    localStorage.setItem('userRoleTab', tabName); // Lưu vào bộ nhớ trình duyệt
  };
  // 👆 ---------------------------------------------------- 👆

  useEffect(() => {
    fetch('http://localhost:5000/api/users/all')
      .then(res => res.json())
      .then(result => {
        if (result.data) {
          const formattedUsers = result.data.map(u => ({
            id: u.user_id,
            name: u.full_name,
            phone: u.phone_number,
            plate: u.license_plate || 'Chưa cập nhật',
            type: u.vehicle_type || 'Chưa rõ',
            role: u.role || 'Guest', 
            registered: new Date(u.created_at).toLocaleDateString('vi-VN'),
            status: 'active'
          }));
          setUsers(formattedUsers);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách:", err);
        setLoading(false);
      });
  }, []);

  const filtered = users.filter(u => {
    // 1. Phân loại chuẩn theo Tab
    const isCustomerTab = roleTab === 'Customer' && (u.role === 'Guest' || u.role === 'VIP');
    const isAdminTab = roleTab === 'Admin' && u.role === 'Admin';
    
    // Nếu không thuộc Tab đang mở thì loại luôn
    if (!isCustomerTab && !isAdminTab) return false;

    // 2. Các logic search và filter khác
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase())
      || u.plate.toLowerCase().includes(search.toLowerCase())
      || u.phone.includes(search);
    
    const matchStatus = status === 'all' || u.status === status;
    const matchMember = memberType === 'all' || u.role === memberType;
    
    // Ở Tab Admin không có filter MemberType nên bỏ qua
    if (roleTab === 'Customer') return matchSearch && matchStatus && matchMember;
    return matchSearch && matchStatus;
  });

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'blocked' ? 'active' : 'blocked' } : u));
  };

  return (
    <div className="page-container">
      {/* KHU VỰC HEADER (Bạn đã lỡ tay xóa mất phần này ở code cũ) */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý tài khoản</h1>
          <p className="page-subtitle">Phân quyền, cấp thẻ VIP và quản lý cư dân</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline"><MdDownload /> Xuất Excel</button>
          <button className="btn btn-primary"><MdAdd /> Thêm mới</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom: '2px solid #1e293b' }}>
        <button 
          onClick={() => handleTabSwitch('Customer')}
          style={{ 
            background: 'none', border: 'none', color: roleTab === 'Customer' ? '#3b82f6' : '#94a3b8', 
            padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
            borderBottom: roleTab === 'Customer' ? '3px solid #3b82f6' : '3px solid transparent'
          }}>
          <MdPeople style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Khách Hàng & VIP
        </button>
        <button 
          onClick={() => handleTabSwitch('Admin')}
          style={{ 
            background: 'none', border: 'none', color: roleTab === 'Admin' ? '#3b82f6' : '#94a3b8', 
            padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
            borderBottom: roleTab === 'Admin' ? '3px solid #3b82f6' : '3px solid transparent'
          }}>
          <MdAdminPanelSettings style={{ verticalAlign: 'middle', marginRight: '5px' }} /> Ban Quản Trị
        </button>
      </div>

      <div className="card um-filter-bar" style={{ marginBottom: 20 }}>
        <div className="um-search-wrap">
          <MdSearch className="search-icon" />
          <input className="form-input um-search" placeholder="Tìm tên, biển số, SĐT..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="um-filter-selects">
          <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="blocked">Bị chặn</option>
          </select>
          
          {roleTab === 'Customer' && (
            <select className="form-select" value={memberType} onChange={e => setMemberType(e.target.value)}>
              <option value="all">Tất cả hạng</option>
              <option value="VIP">⭐ Khách VIP (Vé tháng)</option>
              <option value="Guest">Khách thường</option>
            </select>
          )}
        </div>
        <div className="um-count"><MdPeople /> {filtered.length} tài khoản</div>
      </div>

      {/* KHU VỰC BẢNG DỮ LIỆU ĐÃ ĐƯỢC FIX LỖI XÔ LỆCH CỘT */}
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{roleTab === 'Admin' ? 'Tên Quản trị viên' : 'Tên khách hàng'}</th>
                <th>Số điện thoại</th>
                {roleTab === 'Customer' && <th>Biển số xe</th>}
                {roleTab === 'Customer' && <th>Hạng thành viên</th>}
                <th>Ngày tham gia</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>Đang tải dữ liệu...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Chưa có dữ liệu.</td></tr>
              ) : (
                filtered.map(u => {
                  const s = STATUS_MAP[u.status] || STATUS_MAP.active;
                  return (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{u.id}</td>
                      <td>
                        <div className="user-name-cell">
                          <div className="user-avatar-sm" style={{ backgroundColor: roleTab === 'Admin' ? '#dc3545' : (u.role === 'VIP' ? '#f59e0b' : '#3b82f6') }}>
                            {u.name.charAt(0)}
                          </div>
                          <div style={{ fontWeight: 600, color: roleTab === 'Admin' ? '#fca5a5' : 'inherit' }}>{u.name}</div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{u.phone}</td>
                      
                      {/* Đã tách riêng 2 cột ra để không bị xô lệch */}
                      {roleTab === 'Customer' && (
                        <td><strong style={{ color: 'var(--accent-blue-light)' }}>{u.plate}</strong></td>
                      )}
                      
                      {roleTab === 'Customer' && (
                        <td>
                          {u.role === 'VIP' 
                            ? <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid #f59e0b' }}><MdStar style={{ marginBottom: '-2px', marginRight: '3px' }}/> VIP (Tháng)</span> 
                            : <span className="badge badge-muted">Khách thường</span>}
                        </td>
                      )}

                      <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{u.registered}</td>
                      <td>
                        {roleTab === 'Admin' 
                          ? <span className="badge badge-danger" style={{ background: '#dc3545', color: '#fff' }}>Quản trị viên</span>
                          : <span className={`badge ${s.cls}`}>{s.label}</span>
                        }
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="action-btn edit" title="Chỉnh sửa"><MdEdit /></button>
                          {u.id !== 1 && (
                            <button className={`action-btn ${u.status === 'blocked' ? 'unblock' : 'block'}`} onClick={() => toggleStatus(u.id)}>
                              {u.status === 'blocked' ? <MdCheckCircle /> : <MdBlock />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}