import React, { useEffect, useState } from 'react';
import '../styles/page.css';
import Cards from '../components/Cards';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import OverviewSection from '../components/OverviewSection';
import ErrorBoundary from '../components/ErrorBoundary';
// import Searchbar from '../components/Searchbar';
// import Table from '../components/Table';
import vehicleData from '../../db.json';


interface Claim {
  claimDate: string;
  claimAmount: string | number;
  reason: string;
  status: string;
}

interface Insurance {
  policyNumber: string;
  insurer: string;
  policytype: string;
  startDate: string;
  endDate: string;
  payment: string;
  issueDate: string;
  premiumAmount: string;
  hasInsurance?: boolean;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  purchaseDate: string;
  registrationNumber: string;
  purchasePrice: string;
  fuelType: string;
  engineNumber: string;
  chassisNumber: string;
  kilometers: string;
  color: string;
  owner: string;
  phone: string;
  address: string;
  insurance?: Insurance;
  claims?: Claim[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    address: string;
  };
  lastUpdated?: string;
}

interface Stats {
  totalVehicles: number;
  totalInsurances: number;
  totalClaims: number;
  totalClaimAmount: number;
  insuranceCoverage: string;
}

interface PageProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const Page: React.FC<PageProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [stats, setStats] = useState<Stats>({
    totalVehicles: 0,
    totalInsurances: 0,
    totalClaims: 0,
    totalClaimAmount: 0,
    insuranceCoverage: '0%',
  });

  // const [searchValue, setSearchValue] = useState('');
  const [filteredData, setFilteredData] = useState<Vehicle[]>([]);

  useEffect(() => {
    const vehicles: Vehicle[] = vehicleData.vehicles || [];

    const totalVehicles = vehicles.length;
    const totalInsurances = vehicles.filter((v) => v.insurance).length;
    const allClaims = vehicles.flatMap((v) => v.claims || []);
    const totalClaims = allClaims.length;
    const totalClaimAmount = allClaims.reduce(
      (sum, claim) => sum + parseFloat(claim.claimAmount?.toString() || '0'),
      0
    );
    const insuranceCoverage = totalVehicles
      ? `${Math.round((totalInsurances / totalVehicles) * 100)}%`
      : '0%';

    setStats({
      totalVehicles,
      totalInsurances,
      totalClaims,
      totalClaimAmount,
      insuranceCoverage,
    });

    // Set initial data for table
    setFilteredData(vehicles);
  }, []);

  // Filter data based on search
  // useEffect(() => {
  //   const vehicles: Vehicle[] = vehicleData.vehicles || [];
  //   if (searchValue.trim() === '') {
  //     setFilteredData(vehicles);
  //   } else {
  //     const filtered = vehicles.filter(vehicle =>
  //       Object.values(vehicle).some(value =>
  //         value?.toString().toLowerCase().includes(searchValue.toLowerCase())
  //       )
  //     );
  //     setFilteredData(filtered);
  //   }
  // }, [searchValue]);

  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime />

    <PageContainer>
      <SectionHeading title='Dashboard Overview' subtitle='Mortuary Management System'/>
      
      <ErrorBoundary>
        <OverviewSection />
      </ErrorBoundary>

      {/* <Searchbar value={searchValue} onChange={(e) => setSearchValue(e.target.value)} */}
      
      {/* <Table columns={tableColumns} data={filteredData} /> */}
    </PageContainer>

    <Footer/>
    </>
  );
};

export default Page;
