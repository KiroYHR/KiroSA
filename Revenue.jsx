.login-page {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

/* ===== LEFT PANEL ===== */
.login-left {
  flex: 1;
  background: linear-gradient(145deg, #060d1f 0%, #0d1a35 50%, #0a1628 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 48px;
  position: relative;
  overflow: hidden;
}

.brand-glow {
  position: absolute;
  bottom: -100px; left: -100px;
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%);
  pointer-events: none;
}

.brand-circle-1 {
  position: absolute;
  top: -60px; right: -60px;
  width: 250px; height: 250px;
  border: 1px solid rgba(59,130,246,0.1);
  border-radius: 50%;
}

.brand-circle-2 {
  position: absolute;
  top: -40px; right: -40px;
  width: 180px; height: 180px;
  border: 1px solid rgba(59,130,246,0.15);
  border-radius: 50%;
}

.login-brand {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
}

.brand-logo-icon {
  width: 56px; height: 56px;
  background: var(--gradient-blue);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
  box-shadow: 0 4px 24px rgba(59,130,246,0.4);
  flex-shrink: 0;
}

.brand-name {
  font-size: 32px;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.brand-tagline {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.brand-description {
  margin-bottom: 48px;
  max-width: 380px;
}

.brand-description p {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.7;
}

.brand-stats {
  display: flex;
  gap: 40px;
}

.brand-stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--accent-blue-light);
  line-height: 1;
}

.brand-stat-label {
  font-size: 12px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* ===== RIGHT PANEL ===== */
.login-right {
  width: 460px;
  min-width: 400px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  border-left: 1px solid var(--border-color);
}

.login-form-card {
  width: 100%;
  max-width: 380px;
}

.login-form-header {
  margin-bottom: 32px;
}

.login-form-header h2 {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.login-form-header p {
  font-size: 14px;
  color: var(--text-secondary);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--text-muted);
  pointer-events: none;
}

.input-icon-right {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  padding: 4px;
  transition: var(--transition);
}

.input-icon-right:hover { color: var(--text-secondary); }

.form-input.has-icon { padding-left: 44px; }
.form-input.has-icon-right { padding-right: 44px; }

.login-error {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.3);
  color: var(--accent-red);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.login-btn {
  width: 100%;
  justify-content: center;
  padding: 14px;
  font-size: 15px;
}

.login-btn.loading {
  opacity: 0.8;
  cursor: not-allowed;
}

.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-hint {
  margin-top: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .login-left { display: none; }
  .login-right { width: 100%; min-width: unset; border-left: none; }
}
