import React from 'react';
import '../styles/page.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import StorageAllocation from '../components/StorageAllocation';

interface StoragePageProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const StoragePage: React.FC<StoragePageProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime />
      <PageContainer>
        <SectionHeading title='Storage Allocation' subtitle='Manage freezer units and body allocation'/>
        <StorageAllocation />
      </PageContainer>
      <Footer/>
    </>
  );
};

export default StoragePage; 