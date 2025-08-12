import React, { useState, useEffect } from 'react';

const AverageStayDuration: React.FC = () => {
  const [averageDays, setAverageDays] = useState<number | null>(null);

  useEffect(() => {
    const fetchAverageStayDuration = async () => {
      try {
        const response = await fetch('http://192.168.50.126:3001/api/reports/average-stay-duration');
        const data = await response.json();
        setAverageDays(data.averageDays);
      } catch (error) {
        console.error('Failed to fetch average stay duration:', error);
      }
    };

    fetchAverageStayDuration();
  }, []);

  return (
    <div>
      <h4>Average Stay Duration</h4>
      {averageDays !== null ? (
        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{averageDays.toFixed(1)} days</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default AverageStayDuration; 