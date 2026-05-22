.revenue-filters { padding: 16px 20px; }
.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}
.filter-group { display: flex; flex-direction: column; gap: 6px; }
.filter-select, .filter-input { min-width: 160px; }
.filter-btn { align-self: flex-end; height: 42px; }

/* Revenue summary cards */
.revenue-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 18px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}
.revenue-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card); }
.revenue-card::after {
  content: '';
  position: absolute;
  bottom: -30px; right: -30px;
  width: 100px; height: 100px;
  border-radius: 50%;
  opacity: 0.05;
}
.rev-blue::after   { background: var(--accent-blue); }
.rev-green::after  { background: var(--accent-green); }
.rev-yellow::after { background: var(--accent-yellow); }
.rev-purple::after { background: var(--accent-purple); }

.rev-icon {
  width: 44px; height: 44px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.rev-blue   .rev-icon { background: rgba(59,130,246,0.15); color: var(--accent-blue); }
.rev-green  .rev-icon { background: rgba(16,185,129,0.15); color: var(--accent-green); }
.rev-yellow .rev-icon { background: rgba(245,158,11,0.15); color: var(--accent-yellow); }
.rev-purple .rev-icon { background: rgba(139,92,246,0.15); color: var(--accent-purple); }

.rev-value {
  font-size: 22px; font-weight: 800;
  color: var(--text-primary); letter-spacing: -0.5px; line-height: 1;
}
.rev-unit { font-size: 15px; font-weight: 600; margin-left: 2px; }
.rev-label {
  font-size: 12px; color: var(--text-secondary); font-weight: 500;
  margin-top: 4px; text-transform: uppercase; letter-spacing: 0.4px;
}
.rev-sub { font-size: 11px; color: var(--text-muted); margin-top: 3px; }

/* Chart */
.chart-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 20px;
}
.chart-title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.chart-subtitle { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
.chart-tooltip {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  box-shadow: var(--shadow-card);
}
.tooltip-label { font-size: 11px; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; }
.tooltip-value { font-size: 16px; font-weight: 700; color: var(--accent-blue-light); }
.tooltip-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

.section-label-rev {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: var(--text-secondary);
  text-transform: uppercase; letter-spacing: 0.5px;
  margin-bottom: 12px; padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}
