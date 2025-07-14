import React from 'react';
import '../styles/page.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import ExitManagement from '../components/ExitManagement';

interface ExitPageProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const ExitPage: React.FC<ExitPageProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime />
      <PageContainer>
        <SectionHeading title='Exit Management' subtitle='Process body releases and manage exit records'/>
        <ExitManagement />
      </PageContainer>
      <Footer/>
    </>
  );
};

export default ExitPage; 