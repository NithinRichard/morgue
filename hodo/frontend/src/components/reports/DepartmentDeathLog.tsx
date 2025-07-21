import React, { useState, useEffect } from 'react';
import Table from '../Table'; // Assuming a generic Table component exists

interface Log {
  id: string;
  name: string;
  department: string;
  exitTime: string;
}

const DepartmentDeathLog: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    // Fetch all exit logs to dynamically populate the department filter
    const fetchInitialData = async () => {
      try {
        const response = await fetch('http://192.168.50.140:3001/api/exits');
        const allLogs: Log[] = await response.json();
        const uniqueDepartments = [...new Set(allLogs.map(log => log.department).filter(Boolean))];
        setDepartments(uniqueDepartments);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      let url = 'http://192.168.50.140:3001/api/reports/department-death-logs';
      if (department) {
        url += `?department=${encodeURIComponent(department)}`;
      }
      try {
        const response = await fetch(url);
        const data: Log[] = await response.json();
        setLogs(data);
      } catch (error) {
        console.error('Failed to fetch logs:', error);
      }
    };

    fetchLogs();
  }, [department]);

  const columns = [
    { key: 'id', header: 'Body ID' },
    { key: 'name', header: 'Name' },
    { key: 'department', header: 'Department' },
    { key: 'exitTime', header: 'Exit Time' },
  ];

  return (
    <div>
      <h4>Department-wise Death Logs</h4>
      <select onChange={e => setDepartment(e.target.value)} value={department} style={{ marginBottom: '1rem', padding: '0.5rem' }}>
        <option value="">All Departments</option>
        {departments.map(dept => (
          <option key={dept} value={dept}>{dept}</option>
        ))}
      </select>
      <Table columns={columns} data={logs} />
    </div>
  );
};

export default DepartmentDeathLog; 