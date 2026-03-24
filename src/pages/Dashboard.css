.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  right: 0; height: 2px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.stat-blue::before   { background: var(--accent-blue); }
.stat-green::before  { background: var(--accent-green); }
.stat-yellow::before { background: var(--accent-yellow); }
.stat-purple::before { background: var(--accent-purple); }

.stat-card:hover {
  border-color: var(--border-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

.stat-icon {
  width: 48px; height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-blue   .stat-icon { background: rgba(59,130,246,0.15);  color: var(--accent-blue); }
.stat-green  .stat-icon { background: rgba(16,185,129,0.15);  color: var(--accent-green); }
.stat-yellow .stat-icon { background: rgba(245,158,11,0.15);  color: var(--accent-yellow); }
.stat-purple .stat-icon { background: rgba(139,92,246,0.15);  color: var(--accent-purple); }

.stat-body { flex: 1; }

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}

.stat-unit { font-size: 16px; font-weight: 600; margin-left: 2px; }

.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.stat-trend {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 4px 8px;
  border-radius: 20px;
}

.stat-trend.up  { color: var(--accent-green); background: rgba(16,185,129,0.1); }
.stat-trend.down { color: var(--accent-red); background: rgba(239,68,68,0.1); }
.stat-trend.up svg   { transform: rotate(0deg); }
.stat-trend.down svg { transform: rotate(180deg); }

/* Section labels */
.section-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

/* Camera cards */
.camera-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: var(--transition);
}

.camera-card:hover { border-color: var(--border-light); }

.camera-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  background: rgba(0,0,0,0.2);
}

.camera-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.cam-icon { font-size: 18px; color: var(--accent-blue); }

.live-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.3);
  color: var(--accent-red);
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* Camera feed area */
.camera-feed {
  height: 180px;
  background: #050b15;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cam-overlay-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px);
  background-size: 30px 30px;
}

@keyframes scan {
  0%   { top: -4px; opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

.cam-scan-line {
  position: absolute;
  left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent);
  animation: scan 3s linear infinite;
}

.cam-info {
  position: absolute;
  top: 12px; left: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cam-time {
  font-size: 12px;
  color: var(--accent-green);
  font-family: 'Courier New', monospace;
  font-weight: 700;
}

.cam-loc {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
}

.cam-plate-detect {
  position: absolute;
  bottom: 36px;
  left: 50%; transform: translateX(-50%);
  background: rgba(0,0,0,0.7);
  border: 1px solid rgba(59,130,246,0.4);
  border-radius: 4px;
  padding: 4px 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  white-space: nowrap;
}

.cam-plate-label {
  font-size: 10px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.cam-plate-value {
  font-size: 14px;
  font-weight: 800;
  color: var(--accent-blue-light);
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
}

.cam-status-bar {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  padding: 5px;
  text-align: center;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
}

.cam-status-bar.open   { background: rgba(16,185,129,0.25); color: var(--accent-green); }
.cam-status-bar.closed { background: rgba(239,68,68,0.2);   color: var(--accent-red); }

.camera-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}

.cam-loc-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.barrier-btns {
  display: flex;
  gap: 8px;
}
