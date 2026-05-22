import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Revenue from './pages/Revenue';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import './index.css';

export default function App() {
  // 1. SỬA LỖI F5: Kiểm tra Token ngay khi khởi tạo State để không bị chớp màn hình
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('adminToken');
    return !!token; // Nếu có token -> true (Cho vào), nếu không -> false (Bắt login)
  });

  // 2. SỬA LỖI LOGOUT: Phải xóa Token khỏi bộ nhớ thì mới không bị kẹt lại
  const handleLogout = () => {
    localStorage.removeItem('adminToken'); // Xé vé
    setIsLoggedIn(false); // Khóa cửa, đẩy ra ngoài
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn
              ? <Navigate to="/dashboard" replace />
              : <Login onLogin={() => setIsLoggedIn(true)} />
          }
        />
        <Route
          path="/"
          element={
            isLoggedIn
              ? <Layout onLogout={handleLogout} /> /* Gọi hàm handleLogout chuẩn */
              : <Navigate to="/login" replace />
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}