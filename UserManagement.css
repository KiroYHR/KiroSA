import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  MdAttachMoney, MdDirectionsCar, MdDownload, MdFilterList,
  MdTrendingUp, MdCalendarToday
} from 'react-icons/md';
import './Revenue.css';

const formatCurrency = (val) =>
  val >= 1000000
    ? (val / 1000000).toFixed(1) + 'M'
    : (val / 1000).toFixed(0) + 'K';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{label}</div>
      <div className="tooltip-value">
        {payload[0].value.toLocaleString('vi-VN')}₫
      </div>
      <div className="tooltip-sub">{payload[1]?.value} lượt xe</div>
    </div>
  );
};

export default function Revenue() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [lot, setLot]           = useState('all');

  // STATES CHỨA DỮ LIỆU THẬT
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalRev: 0, todayRev: 0, todayVehicles: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/parking/revenue')
      .then(res => res.json())
      .then(result => {
        if (result.data) {
          const sessions = result.data;
          
          let totalRev = 0;
          let todayRev = 0;
          let todayVehicles = 0;
          
          const todayString = new Date().toLocaleDateString('vi-VN');
          const chartMap = {};

          // 1. Tính toán logic và map dữ liệu cho bảng
          const formattedTxs = sessions.map(s => {
            const checkIn = new Date(s.check_in_time);
            const isToday = checkIn.toLocaleDateString('vi-VN') === todayString;
            
            if (isToday) todayVehicles++;

            // Tính tiền
            const fee = parseFloat(s.total_fee) || 0;
            totalRev += fee;
            if (isToday) todayRev += fee;

            // Gom dữ liệu cho biểu đồ (Theo ngày)
            const dayLabel = checkIn.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
            if (!chartMap[dayLabel]) chartMap[dayLabel] = { day: dayLabel, revenue: 0, vehicles: 0 };
            chartMap[dayLabel].revenue += fee;
            chartMap[dayLabel].vehicles += 1;

            // Tính thời gian đỗ (Duration)
            let durationStr = '—';
            let timeOutStr = '--:--';
            if (s.check_out_time) {
              const checkOut = new Date(s.check_out_time);
              timeOutStr = checkOut.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
              const diffMs = checkOut - checkIn;
              const diffHrs = Math.floor(diffMs / 3600000);
              const diffMins = Math.round(((diffMs % 3600000) / 60000));
              durationStr = `${diffHrs}h ${diffMins}m`;
            }

            return {
              id: `TX${s.session_id.toString().padStart(3, '0')}`,
              plate: s.license_plate,
              type: s.vehicle_type || 'Chưa rõ',
              timeIn: checkIn.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              timeOut: timeOutStr,
              duration: durationStr,
              fee: fee > 0 ? `${fee.toLocaleString('vi-VN')}₫` : '—',
              method: fee > 0 ? 'Ví SmartPay' : '—',
              status: s.status === 'Completed' ? 'paid' : (s.status === 'Active' ? 'pending' : s.status)
            };
          });

          // 2. Chuyển object biểu đồ thành mảng và lấy 7 ngày gần nhất
          const finalChartData = Object.values(chartMap).slice(0, 7);

          setTransactions(formattedTxs);
          setSummary({ totalRev, todayRev, todayVehicles });
          setChartData(finalChartData);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi lấy dữ liệu doanh thu:", err);
        setLoading(false);
      });
  }, []);

  const SUMMARY_CARDS = [
    { label: 'Tổng doanh thu',     value: summary.totalRev.toLocaleString('vi-VN'), unit: '₫', color: 'blue',   icon: <MdAttachMoney />,   sub: 'Toàn thời gian' },
    { label: 'Doanh thu tháng này',value: summary.totalRev.toLocaleString('vi-VN'), unit: '₫', color: 'green',  icon: <MdTrendingUp />,    sub: 'Đang cập nhật...' },
    { label: 'Doanh thu hôm nay',  value: summary.todayRev.toLocaleString('vi-VN'), unit: '₫', color: 'yellow', icon: <MdCalendarToday />, sub: `Cập nhật: ${new Date().toLocaleTimeString('vi-VN')}` },
    { label: 'Lượt xe hôm nay',    value: summary.todayVehicles,                    unit: '',  color: 'purple', icon: <MdDirectionsCar />, sub: 'Ra vào trong ngày' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Bãi đậu Doanh Thu</h1>
          <p className="page-subtitle">Dữ liệu tài chính được tính toán trực tiếp từ Backend</p>
        </div>
        <button className="btn btn-success">
          <MdDownload /> Xuất báo cáo Excel
        </button>
      </div>

      {/* Filters (Giao diện) */}
      <div className="revenue-filters card" style={{ marginBottom: 20 }}>
        <div className="filter-row">
          <div className="filter-group">
            <label className="form-label">Bãi xe</label>
            <select className="form-select filter-select" value={lot} onChange={e => setLot(e.target.value)}>
              <option value="all">Tất cả bãi</option>
              <option value="a">Tầng hầm B1</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="form-label">Từ ngày</label>
            <input type="date" className="form-input filter-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          </div>
          <div className="filter-group">
            <label className="form-label">Đến ngày</label>
            <input type="date" className="form-input filter-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
          </div>
          <button className="btn btn-primary filter-btn">
            <MdFilterList /> Lọc
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {SUMMARY_CARDS.map((c, i) => (
          <div key={i} className={`revenue-card rev-${c.color}`}>
            <div className="rev-icon">{c.icon}</div>
            <div className="rev-body">
              <div className="rev-value">{c.value}<span className="rev-unit">{c.unit}</span></div>
              <div className="rev-label">{c.label}</div>
              <div className="rev-sub">{c.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="chart-header">
          <div>
            <div className="chart-title">Biểu đồ doanh thu theo ngày</div>
            <div className="chart-subtitle">Dữ liệu thực tế từ Database</div>
          </div>
        </div>
        <div style={{ height: 260 }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={formatCurrency} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={50} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59,130,246,0.05)' }} />
                <Bar dataKey="revenue" radius={[6,6,0,0]} maxBarSize={40}>
                  {chartData.map((d, i) => (
                    <Cell key={i} fill={i === chartData.length - 1 ? '#3b82f6' : 'rgba(59,130,246,0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: '100px', color: '#64748b' }}>Chưa có dữ liệu biểu đồ</div>
          )}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="section-label-rev">
        <MdAttachMoney /> Chi tiết giao dịch (Database)
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã GD</th>
                <th>Biển số</th>
                <th>Loại xe</th>
                <th>Giờ vào</th>
                <th>Giờ ra</th>
                <th>Thời gian đỗ</th>
                <th>Phí</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>Đang tải dữ liệu...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '20px' }}>Chưa có giao dịch nào.</td></tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id}>
                    <td><code style={{ color: 'var(--text-muted)', fontSize: 12 }}>{tx.id}</code></td>
                    <td><strong style={{ color: 'var(--accent-blue-light)' }}>{tx.plate}</strong></td>
                    <td>{tx.type}</td>
                    <td>{tx.timeIn}</td>
                    <td style={{ color: tx.timeOut === '--:--' ? 'var(--text-muted)' : 'inherit' }}>{tx.timeOut}</td>
                    <td>{tx.duration}</td>
                    <td style={{ fontWeight: 600, color: tx.fee === '—' ? 'var(--text-muted)' : 'var(--accent-green)' }}>{tx.fee}</td>
                    <td><span className="badge badge-muted">{tx.method === '—' ? '—' : tx.method}</span></td>
                    <td>
                      {tx.status === 'paid' ? <span className="badge badge-success">Đã thu tiền</span>
                        : tx.status === 'pending' ? <span className="badge badge-warning">Đang đỗ</span>
                        : <span className="badge badge-info">{tx.status}</span>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}