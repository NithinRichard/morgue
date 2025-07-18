import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import SideBar from './components/SideBar.tsx';
// import TopNavBar from './components/TopNavBar.tsx';
// import Dashboard from './pages/Dashboard.tsx';
// import VehicleRegistration from './pages/VehicleRegistration.tsx';
// import VehicleList from './pages/VehicleList.tsx';
// import InsuranceManagement from './pages/InsuranceManagement.tsx';
// import DocumentRepository from './pages/DocumentRepository.tsx';
// import VehicleClaims from './pages/VehicleClaims.tsx';
// import VehicleLocation from './pages/VehicleLocation.tsx';
// import ApiExample from './components/ApiExample.tsx';
// import Driver from './pages/Driver.tsx';
import TopNavBar from './components/TopNavBar';
import SideBar from './components/SideBar';
import Page from './pages/Page.tsx';
import Table from './pages/Table.tsx';
import InwardPage from './pages/InwardPage.tsx';
import BodiesPage from './pages/BodiesPage.tsx';
import StoragePage from './pages/StoragePage.tsx';
import ExitPage from './pages/ExitPage.tsx';
import BillingPage from './pages/BillingPage.tsx';
import AnalyticsPage from './pages/AnalyticsPage';
import BodyDetailsPage from './pages/BodyDetailsPage.tsx';
import { ToastContainer } from 'react-toastify';
// Define the props interface for components that receive sidebar props
// interface SidebarProps {
//   sidebarCollapsed: boolean;
//   toggleSidebar: () => void;
// }

const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const toggleSidebar = (): void => {
    setSidebarCollapsed((prev) => !prev);
  };

  // Keyboard shortcut for sidebar toggle (f key)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key && e.key.toLowerCase() === 'f' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' ,background:'#d9e0e7'}}>
        {/* Horizontal Top Nav Bar */}
        <TopNavBar />

        {/* Main content with Sidebar + Page content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <SideBar collapsed={sidebarCollapsed} />
          <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Page sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/a" element={<Table />} />
              <Route path="/inward" element={<InwardPage sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/bodies" element={<BodiesPage sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/bodies/:id" element={<BodyDetailsPage sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/storage" element={<StoragePage sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/exit" element={<ExitPage sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/billing" element={<BillingPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              {/* <Route path="/reports" element={<ReportsPage />} /> */}
              {/* <Route path="/" element={<page />} /> */}
              {/* <Route path="/dashboard" element={<Dashboard sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/register-vehicle" element={<VehicleRegistration sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/vehicle-list" element={<VehicleList sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/insurance" element={<InsuranceManagement sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/documents" element={<DocumentRepository sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/claims" element={<VehicleClaims sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/location" element={<VehicleLocation sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/api" element={<ApiExample sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
              <Route path="/driver" element={<Driver sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} /> */}
            </Routes>
          </div>
        </div>

        {/* Toast Container for notifications */}
        {/* <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        /> */}
      </div>
      <ToastContainer position="top-right" autoClose={1500} />
    </Router> 
  );
};

export default App; 