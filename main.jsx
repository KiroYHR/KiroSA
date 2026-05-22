.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* ===== SIDEBAR ===== */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 0;
  position: relative;
  z-index: 10;
}

.sidebar::after {
  content: '';
  position: absolute;
  top: 0; right: -1px;
  width: 1px; height: 100%;
  background: linear-gradient(180deg, transparent, var(--accent-blue) 40%, transparent);
  opacity: 0.3;
}

/* Logo */
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 22px 18px;
  border-bottom: 1px solid var(--border-color);
}

.logo-icon {
  width: 38px; height: 38px;
  background: var(--gradient-blue);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
  box-shadow: 0 2px 12px rgba(59,130,246,0.4);
  flex-shrink: 0;
}

.logo-name {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.3px;
}

.logo-tagline {
  display: block;
  font-size: 10px;
  color: var(--text-muted);
  line-height: 1.3;
  margin-top: 1px;
}

/* Nav */
.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 14px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 13.5px;
  font-weight: 500;
  transition: var(--transition);
  position: relative;
}

.sidebar-link:hover {
  background: rgba(59,130,246,0.08);
  color: var(--text-primary);
}

.sidebar-link.active {
  background: rgba(59,130,246,0.15);
  color: var(--accent-blue-light);
}

.sidebar-link.active::before {
  content: '';
  position: absolute;
  left: 0; top: 50%;
  transform: translateY(-50%);
  width: 3px; height: 60%;
  background: var(--accent-blue);
  border-radius: 0 3px 3px 0;
}

.sidebar-icon {
  font-size: 18px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* Footer */
.sidebar-footer {
  padding: 14px 14px;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.user-avatar {
  width: 34px; height: 34px;
  background: var(--gradient-blue);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  truncate: ellipsis;
}

.user-role {
  font-size: 11px;
  color: var(--text-muted);
  truncate: ellipsis;
}

.sidebar-logout {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  font-size: 18px;
  display: flex;
  align-items: center;
  transition: var(--transition);
  flex-shrink: 0;
}

.sidebar-logout:hover {
  background: rgba(239,68,68,0.1);
  color: var(--accent-red);
}

/* Main content */
.main-content {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
}
