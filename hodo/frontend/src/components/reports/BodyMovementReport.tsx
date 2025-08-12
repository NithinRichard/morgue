import React, { useState, useEffect } from 'react';
import Table from '../Table';

interface MovementLog {
  id: string;
  bodyId: string;
  name: string;
  fromStorage: string;
  toStorage: string;
  movedBy: string;
  timestamp: string;
}

const BodyMovementReport: React.FC = () => {
  const [movementLogs, setMovementLogs] = useState<MovementLog[]>([]);

  useEffect(() => {
    const fetchMovementLogs = async () => {
      try {
        const response = await fetch('http://192.168.50.126:3001/api/reports/body-movements');
        const data: MovementLog[] = await response.json();
        setMovementLogs(data);
      } catch (error) {
        console.error('Failed to fetch movement logs:', error);
      }
    };

    fetchMovementLogs();
  }, []);

  const columns = [
    { key: 'bodyId', header: 'Body ID' },
    { key: 'name', header: 'Name' },
    { key: 'fromStorage', header: 'From' },
    { key: 'toStorage', header: 'To' },
    { key: 'movedBy', header: 'Moved By' },
    { key: 'timestamp', header: 'Timestamp' },
  ];

  return (
    <div>
      <h4>Body Movement Report</h4>
      <Table columns={columns} data={movementLogs} />
    </div>
  );
};

export default BodyMovementReport; 