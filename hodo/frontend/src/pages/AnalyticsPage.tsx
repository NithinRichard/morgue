import React, { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function getDefaultRange() {
  const today = new Date();
  const prior = new Date();
  prior.setDate(today.getDate() - 6);
  return {
    from: prior.toISOString().split('T')[0],
    to: today.toISOString().split('T')[0],
  };
}

const AnalyticsPage: React.FC = () => {
  const [admitted, setAdmitted] = useState(0);
  const [released, setReleased] = useState(0);
  const [avgDuration, setAvgDuration] = useState('0');
  const [capacity, setCapacity] = useState({ used: 0, total: 0, percent: '0' });
  const [trendData, setTrendData] = useState([]);
  const [range, setRange] = useState(getDefaultRange());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const { from, to } = range;
    const API_BASE = 'http://192.168.50.124:3001';
    Promise.all([
      fetch(`${API_BASE}/api/analytics/admissions?from=${from}&to=${to}`).then(res => res.json()),
      fetch(`${API_BASE}/api/analytics/releases?from=${from}&to=${to}`).then(res => res.json()),
      fetch(`${API_BASE}/api/analytics/average-duration?from=${from}&to=${to}`).then(res => res.json()),
      fetch(`${API_BASE}/api/analytics/capacity-usage?date=${to}`).then(res => res.json()),
      fetch(`${API_BASE}/api/analytics/trends?from=${from}&to=${to}`).then(res => res.json()),
    ]).then(([admit, release, avg, cap, trend]) => {
      setAdmitted(admit.count);
      setReleased(release.count);
      setAvgDuration(avg.averageDays);
      setCapacity(cap);
      setTrendData(trend);
    }).finally(() => setLoading(false));
  }, [range]);

  return (
    <PageContainer>
      <SectionHeading title="Operational Analytics" subtitle="Daily, weekly, and monthly mortuary statistics" />
      {/* Date Picker Row */}
      <div className="row" style={{ marginBottom: 24 }}>
        <div className="col-lg-12" style={{
          border: '1px dashed #CCC',
          minHeight: 120,
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '24px 15px',
          background: '#fff',
          fontFamily: '',
          fontSize: 14,
          fontWeight: 300,
          lineHeight: 1.42857143,
          color: '#5a5a5a',
        }}>
          <label style={{ fontFamily: 'Poppins', fontSize: 14, fontWeight: 300, lineHeight: 1.42857143, color: '#5a5a5a', marginBottom: 0 }}>From Date:</label>
          <input
            type="date"
            value={range.from}
            max={range.to}
            onChange={e => setRange(r => ({ ...r, from: e.target.value }))}
            className="form-control"
            style={{
              padding: '6px 12px',
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14,
              color: '#333',
              backgroundColor: '#fff',
              width: 160,
              height: 34,
              fontFamily: 'Poppins, sans-serif',
              marginBottom: 0,
            }}
          />
          <label style={{ fontFamily: 'Poppins', fontSize: 14, fontWeight: 300, lineHeight: 1.42857143, color: '#5a5a5a', marginBottom: 0 }}>To Date:</label>
          <input
            type="date"
            value={range.to}
            min={range.from}
            max={new Date().toISOString().split('T')[0]}
            onChange={e => setRange(r => ({ ...r, to: e.target.value }))}
            className="form-control"
            style={{
              padding: '6px 12px',
              border: '1px solid #ccc',
              borderRadius: 4,
              fontSize: 14,
              color: '#333',
              backgroundColor: '#fff',
              width: 160,
              height: 34,
              fontFamily: 'Poppins, sans-serif',
              marginBottom: 0,
            }}
          />
          {loading && <span style={{ marginLeft: 16, color: '#1975d3', fontFamily: 'Poppins, sans-serif' }}>Loading...</span>}
        </div>
      </div>
      <div className="analytics-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
        <div className="patient-profile-details-card" style={{textAlign: 'center', background: '#f8fafc'}}>
          <div style={{fontFamily: 'Poppins, sans-serif', color: '#1975d3', fontWeight: 600, fontSize: 16, marginBottom: 8}}>Bodies Admitted</div>
          <div className="detail-value" style={{ fontSize: 32, color: '#263238' }}>{admitted}</div>
        </div>
        <div className="patient-profile-details-card" style={{textAlign: 'center', background: '#f8fafc'}}>
          <div style={{fontFamily: 'Poppins, sans-serif', color: '#1975d3', fontWeight: 600, fontSize: 16, marginBottom: 8}}>Bodies Released</div>
          <div className="detail-value" style={{ fontSize: 32, color: '#263238' }}>{released}</div>
        </div>
        <div className="patient-profile-details-card" style={{textAlign: 'center', background: '#f8fafc'}}>
          <div style={{fontFamily: 'Poppins, sans-serif', color: '#1975d3', fontWeight: 600, fontSize: 16, marginBottom: 8}}>Avg. Storage Duration</div>
          <div className="detail-value" style={{ fontSize: 32, color: '#263238' }}>{avgDuration} days</div>
        </div>
        <div className="patient-profile-details-card" style={{textAlign: 'center', background: '#f8fafc'}}>
          <div style={{fontFamily: 'Poppins, sans-serif', color: '#1975d3', fontWeight: 600, fontSize: 16, marginBottom: 8}}>Capacity Usage</div>
          <div className="detail-value" style={{ fontSize: 32, color: '#263238' }}>{capacity.percent}%</div>
        </div>
      </div>
      <div className="analytics-charts-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        <div className="patient-profile-details-card" style={{background: '#fff'}}>
          <SectionHeading title="Admissions & Releases Trend" subtitle="" />
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12 }} />
              <YAxis style={{ fontFamily: 'Poppins, sans-serif', fontSize: 12 }} />
              <Tooltip contentStyle={{ fontFamily: 'Poppins, sans-serif', fontSize: 13 }} />
              <Legend wrapperStyle={{ fontFamily: 'Poppins, sans-serif', fontSize: 13 }} />
              <Line type="monotone" dataKey="admitted" stroke="#1975d3" strokeWidth={3} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="released" stroke="#00C49F" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="patient-profile-details-card" style={{background: '#fff'}}>
          <SectionHeading title="Storage Unit Usage" subtitle="" />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={[
                { name: 'Used', value: capacity.used },
                { name: 'Available', value: capacity.total - capacity.used }
              ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                <Cell key="used" fill="#1975d3" />
                <Cell key="available" fill="#00C49F" />
              </Pie>
              <Tooltip contentStyle={{ fontFamily: 'Poppins, sans-serif', fontSize: 13 }} />
              <Legend wrapperStyle={{ fontFamily: 'Poppins, sans-serif', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </PageContainer>
  );
};

export default AnalyticsPage; 