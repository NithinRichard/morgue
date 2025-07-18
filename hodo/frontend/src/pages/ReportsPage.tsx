import React from 'react';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import DepartmentDeathLog from '../components/reports/DepartmentDeathLog'; // Import the new component
import BodyMovementReport from '../components/reports/BodyMovementReport'; // Import the new component
import OccupancyTrends from '../components/reports/OccupancyTrends'; // Import the new component
import AverageStayDuration from '../components/reports/AverageStayDuration'; // Import the new component
import PendingVerifications from '../components/reports/PendingVerifications'; // Import the new component
import '../styles/reports.css';

const ReportsPage: React.FC = () => {
  return (
    <PageContainer>
      <SectionHeading title="Reports & Analytics" />
      <div className="reports-grid">
        <div className="report-card">
          <DepartmentDeathLog />
        </div>
        <div className="report-card">
          <BodyMovementReport />
        </div>
        <div className="report-card">
          <OccupancyTrends />
        </div>
        <div className="report-card">
          <AverageStayDuration />
        </div>
        <div className="report-card">
          <PendingVerifications />
        </div>
      </div>
    </PageContainer>
  );
};

export default ReportsPage; 