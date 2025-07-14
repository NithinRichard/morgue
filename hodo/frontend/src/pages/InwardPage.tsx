import React from 'react';
import '../styles/page.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import InwardRegistration from '../components/InwardRegistration';

interface InwardPageProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const InwardPage: React.FC<InwardPageProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime />
      <PageContainer>
        <SectionHeading title='Inward Registration' subtitle='Register a new body entering the mortuary'/>
        <InwardRegistration />
      </PageContainer>
      <Footer/>
    </>
  );
};

export default InwardPage; 