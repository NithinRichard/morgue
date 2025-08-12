import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/overview.css';
import Cards from './Cards';
import Table from './Table';
import Searchbar from './Searchbar';

interface Body {
  id: string;
  name: string;
  timeOfDeath: string;
  status: string;
  riskLevel: string;
  storageUnit: string;
  incidentType: string;
  verifiedBy?: string | null;
  registrationDate?: string;
}

const OverviewSection: React.FC = () => {
  const [bodies, setBodies] = useState<Body[]>([]);
  const [releasedBodies, setReleasedBodies] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState('all'); // Add status filter state
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBodies = async () => {
      try {
        console.log('Fetching bodies from API...');
        const response = await fetch('http://192.168.50.126:3001/api/bodies');
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Bodies API Response:', data);
        
        // Ensure data is an array and contains valid objects
        const validBodies = Array.isArray(data) ? data.filter(body => {
          if (!body || typeof body !== 'object') {
            console.warn('Invalid body object filtered out:', body);
            return false;
          }
          return true;
        }) : [];
        
        setBodies(validBodies);
        console.log('Bodies state set to:', validBodies);
      } catch (error) {
        console.error("Failed to fetch bodies:", error);
        setBodies([]); // Set empty array on error
      }
    };
    
    const fetchReleasedBodies = async () => {
      try {
        console.log('Fetching released bodies from API...');
        const response = await fetch('http://192.168.50.126:3001/api/exits');
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('Released bodies API Response:', data);
        
        // Ensure data is an array
        const validReleasedBodies = Array.isArray(data) ? data : [];
        setReleasedBodies(validReleasedBodies);
        console.log('Released bodies state set to:', validReleasedBodies);
      } catch (error) {
        console.error("Failed to fetch released bodies:", error);
        setReleasedBodies([]); // Set empty array on error
      }
    };
    
    fetchBodies();
    fetchReleasedBodies();
  }, []);

  // Safe data processing with null checks
  const safeBodies = Array.isArray(bodies) ? bodies : [];
  const totalBodies = safeBodies.length;
  const verifiedBodies = safeBodies.filter(b => b && b.status === 'verified').length;
  const pendingBodies = safeBodies.filter(b => b && b.status === 'pending').length;
  const highRiskBodies = safeBodies.filter(b => b && b.riskLevel === 'high').length;
  const occupiedUnits = new Set(safeBodies.map(b => b && b.storageUnit).filter(Boolean)).size;
  const totalUnits = 30; // Assuming 30 total units
  const occupancyPercentage = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  const stats = [
    { title: "Total Bodies", value: String(totalBodies) },
    { title: "Verified", value: String(verifiedBodies) },
    { title: "Pending", value: String(pendingBodies) },
    { title: "High Risk", value: String(highRiskBodies) },
  ];

  const recentActivities = safeBodies
    .filter(body => body && body.timeOfDeath && body.id) // Filter out invalid entries
    .sort((a, b) => {
      try {
        const timeA = new Date(a.timeOfDeath).getTime();
        const timeB = new Date(b.timeOfDeath).getTime();
        return timeB - timeA;
      } catch (error) {
        console.warn('Error sorting recent activities:', error);
        return 0;
      }
    })
    .slice(0, 4)
    .map(body => {
      try {
        return {
          id: body.id || 'N/A',
          action: `Body ${body.status || 'Unknown'}`,
          name: body.name || 'Unknown',
          time: body.timeOfDeath ? (() => {
            try {
              const date = new Date(body.timeOfDeath);
              if (isNaN(date.getTime())) return 'N/A';
              return date.toLocaleString('en-GB', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              });
            } catch (error) {
              return 'N/A';
            }
          })() : 'N/A',
          status: body.status || 'unknown',
        };
      } catch (error) {
        console.warn('Error processing activity:', error, body);
        return {
          id: 'Error',
          action: 'Error processing',
          name: 'Error',
          time: 'N/A',
          status: 'error',
        };
      }
    });

  // Sort bodies so the most recently registered come first
  const sortedBodies = [...safeBodies].sort((a, b) => {
    if (a.registrationDate && b.registrationDate) {
      return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
    }
    return String(b.id || '').localeCompare(String(a.id || ''));
  });

  // Helper function to normalize dates for comparison (removes time component)
  const normalizeDate = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  const filteredBodies = sortedBodies.filter(body => {
    // Ensure body is valid
    if (!body || typeof body !== 'object') {
      return false;
    }
    
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = body.name ? String(body.name).toLowerCase().includes(searchLower) : false;
    const idMatch = body.id ? String(body.id).toLowerCase().includes(searchLower) : false;
    const matchesSearch = searchTerm === '' || nameMatch || idMatch;
    
    // Date filter
    let dateMatch = true;
    try {
      if (startDate && endDate && body.registrationDate) {
        const registrationDate = normalizeDate(new Date(body.registrationDate));
        const normalizedStartDate = normalizeDate(startDate);
        const normalizedEndDate = normalizeDate(endDate);
        dateMatch = registrationDate >= normalizedStartDate && registrationDate <= normalizedEndDate;
      } else if (startDate && body.registrationDate) {
        const registrationDate = normalizeDate(new Date(body.registrationDate));
        const normalizedStartDate = normalizeDate(startDate);
        dateMatch = registrationDate >= normalizedStartDate;
      } else if (endDate && body.registrationDate) {
        const registrationDate = normalizeDate(new Date(body.registrationDate));
        const normalizedEndDate = normalizeDate(endDate);
        dateMatch = registrationDate <= normalizedEndDate;
      }
    } catch (dateError) {
      console.warn('Date filtering error:', dateError);
      dateMatch = true; // Default to include if date parsing fails
    }
    
    // Status filter
    const statusMatch = statusFilter === 'all' || (body.status && String(body.status).toLowerCase() === statusFilter);
    
    return matchesSearch && dateMatch && statusMatch;
  });

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

      <div className="header">
            Body Details
      </div>

      {/* Add all tables overview below stats and activities */}
      <div style={{ marginBottom: 20 }}>
        <Searchbar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Body ID or Name"
        />
      </div>
      <div className="filter-container" style={{ marginTop: '2rem' }}>
        <div className="left-filters">
          <div className="filter-group">
            <label className="filter-label">From Date</label>
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="dd-mm-yyyy"
              className="filter-input"
              dateFormat="dd-MM-yyyy"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">To Date</label>
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate || undefined}
              placeholderText="dd-mm-yyyy"
              className="filter-input"
              dateFormat="dd-MM-yyyy"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              className="filter-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="released">Released</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overview-content-grid" style={{ marginTop: '0', gridTemplateColumns: '1fr' }}>
        <Table
          columns={[
            { key: 'id', header: 'ID' },
            { key: 'name', header: 'Name' },
            { key: 'status', header: 'Status' },
            { key: 'riskLevel', header: 'Risk Level' },
            { key: 'storageUnit', header: 'Storage Unit' },
            { key: 'incidentType', header: 'Incident Type' },
          ]}
          data={filteredBodies}
          disableInternalPagination={false}
        />
      </div>
    </div>
  );
};

export default OverviewSection;