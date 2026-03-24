import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MdDashboard, MdAttachMoney, MdPeople, MdSettings, MdLogout, MdLocalParking } from 'react-icons/md';
import './Sidebar.css';

const navItems = [
  { to: '/dashboard', icon: <MdDashboard />, label: 'Dashboard' },
  { to: '/revenue',   icon: <MdAttachMoney />, label: 'Doanh Thu' },
  { to: '/users',     icon: <MdPeople />, label: 'Quản Lý' },
  { to: '/settings',  icon: <MdSettings />, label: 'Cài Đặt' },
];

export default function Layout({ onLogout }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon"><MdLocalParking /></div>
          <div className="logo-text">
            <span className="logo-name">SmartPark</span>
            <span className="logo-tagline">Hệ Thống Quản lý Bãi đỗ xe</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">AD</div>
            <div className="user-info">
              <div className="user-name">Admin</div>
              <div className="user-role">Quản trị viên</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Đăng xuất">
            <MdLogout />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
