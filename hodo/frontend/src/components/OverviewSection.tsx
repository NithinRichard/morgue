import React, { useState, useEffect } from 'react';
import '../styles/overview.css';
import Cards from './Cards';
import Table from './Table';

interface Body {
  id: string;
  name: string;
  timeOfDeath: string;
  status: string;
  riskLevel: string;
  storageUnit: string;
  incidentType: string;
  verifiedBy?: string | null;
}

const OverviewSection: React.FC = () => {
  const [bodies, setBodies] = useState<Body[]>([]);
  const [releasedBodies, setReleasedBodies] = useState<any[]>([]);

  useEffect(() => {
    const fetchBodies = async () => {
      try {
        const response = await fetch('http://192.168.50.124:3001/api/bodies');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBodies(data);
      } catch (error) {
        console.error("Failed to fetch bodies:", error);
      }
    };
    const fetchReleasedBodies = async () => {
      try {
        const response = await fetch('http://192.168.50.124:3001/api/exits');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setReleasedBodies(data);
      } catch (error) {
        console.error("Failed to fetch released bodies:", error);
      }
    };
    fetchBodies();
    fetchReleasedBodies();
  }, []);

  const totalBodies = bodies.length;
  const verifiedBodies = bodies.filter(b => b.status === 'verified').length;
  const pendingBodies = bodies.filter(b => b.status === 'pending').length;
  const highRiskBodies = bodies.filter(b => b.riskLevel === 'high').length;
  const occupiedUnits = new Set(bodies.map(b => b.storageUnit)).size;
  const totalUnits = 30; // Assuming 30 total units
  const occupancyPercentage = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  const stats = [
    { title: "Total Bodies", value: String(totalBodies) },
    { title: "Verified", value: String(verifiedBodies) },
    { title: "Pending", value: String(pendingBodies) },
    { title: "High Risk", value: String(highRiskBodies) },
  ];

  const recentActivities = bodies
    .sort((a, b) => new Date(b.timeOfDeath).getTime() - new Date(a.timeOfDeath).getTime())
    .slice(0, 4)
    .map(body => ({
      id: body.id,
      action: `Body ${body.status}`,
      name: body.name,
      time: new Date(body.timeOfDeath).toLocaleTimeString(),
      status: body.status,
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'status-verified';
      case 'pending': return 'status-pending';
      case 'stored': return 'status-stored';
      case 'released': return 'status-released';
      default: return 'status-default';
    }
  };

  return (
    <div className="overview-container">
      
      
      <div className="overview-stats-grid">
        {stats.map((stat, index) => (
          <Cards key={index} title={stat.title} subtitle={stat.value} />
        ))}
      </div>

        
      

      <div className="overview-content-grid">
        <div className="overview-card">
          <div className="card-header">
            <h3 className="card-title">Recent Activities</h3>
          </div>
          <div className="card-content">
            <div className="activities-list">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-info">
                    <p className="activity-action">{activity.action}</p>
                    <p className="activity-name">{activity.name}</p>
                  </div>
                  <div className="activity-meta">
                    <span className={`status-badge ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    <p className="activity-time">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        

        <div className="overview-card">
          <div className="card-header">
            <h3 className="card-title">Storage Status</h3>
          </div>
          <div className="card-content">
            <div className="storage-info">
              <div className="storage-item">
                <span className="storage-label">Total Units</span>
                <span className="storage-value">{totalUnits}</span>
              </div>
              <div className="storage-item">
                <span className="storage-label">Occupied</span>
                <span className="storage-value">{occupiedUnits}</span>
              </div>
              <div className="storage-item">
                <span className="storage-label">Available</span>
                <span className="storage-value available">{totalUnits - occupiedUnits}</span>
              </div>
              <div className="storage-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${occupancyPercentage}%` }}></div>
                </div>
                <p className="progress-text">{occupancyPercentage.toFixed(0)}% Occupancy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add all tables overview below stats and activities */}
      {/*
      <div className="overview-content-grid" style={{ marginTop: '2rem', gridTemplateColumns: '1fr' }}>
        <Table
          columns={[
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Name' },
            { key: 'status', header: 'Status' },
            { key: 'riskLevel', header: 'Risk Level' },
            { key: 'storageUnit', header: 'Storage Unit' },
            { key: 'incidentType', header: 'Incident Type' },
          ]}
          data={bodies}
        />
      </div>
      */}
    </div>
  );
};

export default OverviewSection; 