import React, { useState, useEffect } from 'react';
import Table from '../Table';

interface PendingBody {
  id: string;
  name: string;
  registrationDate: string;
}

const PendingVerifications: React.FC = () => {
  const [pendingBodies, setPendingBodies] = useState<PendingBody[]>([]);

  useEffect(() => {
    const fetchPendingVerifications = async () => {
      try {
        const response = await fetch('http://192.168.50.126:3001/api/reports/pending-verifications');
        const data: PendingBody[] = await response.json();
        setPendingBodies(data);
      } catch (error) {
        console.error('Failed to fetch pending verifications:', error);
      }
    };

    fetchPendingVerifications();
  }, []);

  const columns = [
    { key: 'id', header: 'Body ID' },
    { key: 'name', header: 'Name' },
    { key: 'registrationDate', header: 'Registration Date' },
  ];

  return (
    <div>
      <h4>Pending Verifications</h4>
      <Table columns={columns} data={pendingBodies} />
    </div>
  );
};

export default PendingVerifications; 