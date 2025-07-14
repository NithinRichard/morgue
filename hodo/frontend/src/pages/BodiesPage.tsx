import React from 'react';
import '../styles/page.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import BodyManagement from '../components/BodyManagement';

interface BodiesPageProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const BodiesPage: React.FC<BodiesPageProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime />
      <PageContainer>
        <SectionHeading title='Body Management' subtitle='Track and manage all bodies in the mortuary'/>
        <BodyManagement />
      </PageContainer>
      <Footer/>
    </>
  );
};

export default BodiesPage; 