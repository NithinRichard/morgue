import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendData {
  date: string;
  occupied: number;
}

const OccupancyTrends: React.FC = () => {
  const [data, setData] = useState<TrendData[]>([]);

  useEffect(() => {
    const fetchOccupancyTrends = async () => {
      try {
        const response = await fetch('http://192.168.50.126:3001/api/reports/occupancy-trends');
        const trendData: TrendData[] = await response.json();
        setData(trendData);
      } catch (error) {
        console.error('Failed to fetch occupancy trends:', error);
      }
    };

    fetchOccupancyTrends();
  }, []);

  return (
    <div>
      <h4>Occupancy Trends</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="occupied" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OccupancyTrends; 