import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/bodies.css';
import '../styles/form.css';
import Table from './Table';
import Searchbar from './Searchbar';
import ButtonWithGradient from './ButtonWithGradient';
import deleteIcon from "../assets/delete.png";
import DeleteButton from './DeleteButton';
import EditButton from './EditButton';
import EditModal from './EditModal';
import PatientProfileDetails from './PatientProfileDetails';
import PhoneInput from './PhoneInput';
import * as Yup from 'yup';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QRCodeCanvas } from 'qrcode.react';

import { bodiesAPI, exitBodiesAPI, storageAPI } from '../services/api';
import { validatePhoneNumber } from '../utils/validation';

interface Body {
  id: string;
  name: string;
  timeOfDeath: string;
  status: string;
  riskLevel: string;
  storageUnit: string;
  incidentType: string;
  verifiedBy?: string | null;
  patientId?: string;
  dateOfDeath?: string;
  gender?: string;
  age?: string;
  mlcCase?: boolean;
  photo?: string;
  belongings?: string[];
  notes?: string;
  tagNumber?: string;
  fromDischarge?: boolean;
  dischargeId?: string;
  registrationDate?: string;
  // Release information
  isReleased?: boolean;
  releaseDate?: string;
  releaseStatus?: string;
  exitId?: string;
}

interface ExitRecord {
  // Primary fields
  EB_Id_pk?: string | number;
  id?: string | number;
  
  // Body reference fields (try multiple possible field names)
  EB_Body_Details_FK?: number;
  bodyId?: number;
  
  // Date fields
  EB_Exit_Date?: string;
  exitDate?: string;
  
  // Time fields
  EB_Exit_Time?: string;
  exitTime?: string;
  
  // Status fields
  ExitStatusName?: string;
  exitStatusName?: string;
  
  // Type fields
  ExitTypeName?: string;
  exitTypeName?: string;
  
  // Name fields
  BodyName?: string;
  bodyName?: string;
  
  // Processed by fields
  EB_Exit_Processed_By?: string;
  exitProcessedBy?: string;
  
  // Notes fields
  EB_Exit_Notes?: string;
  exitNotes?: string;
}

const BodyManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rawBodies, setRawBodies] = useState<Body[]>([]);
  const [exitRecords, setExitRecords] = useState<ExitRecord[]>([]);
  const [activeBodiesCount, setActiveBodiesCount] = useState<number>(0);
  const [viewBody, setViewBody] = useState<Body | null>(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBody, setEditBody] = useState<Body | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Helper function to format date for input
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const navigate = useNavigate();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    name: '',
    relation: '',
    idProof: '',
    contact: ''
  });

  // Create all bodies including released ones from exit records
  const bodies = useMemo(() => {
    // Mark current bodies as not released
    const currentBodiesWithStatus = rawBodies.map(body => ({
      ...body,
      isReleased: false,
      releaseDate: undefined,
      releaseStatus: undefined,
      exitId: undefined
    }));
    
    // Create synthetic body records for released bodies from exit records
    const releasedBodies = exitRecords.map(exit => {
      const bodyId = exit.bodyId || exit.EB_Body_Details_FK;
      const bodyName = exit.bodyName || exit.BodyName || 'Unknown';
      const exitDate = exit.EB_Exit_Date || exit.exitDate;
      const exitStatus = exit.ExitStatusName || exit.exitStatusName || 'Released';
      const exitId = exit.EB_Id_pk || exit.id;
      const exitNotes = exit.EB_Exit_Notes || exit.exitNotes || '';
      const processedBy = exit.EB_Exit_Processed_By || exit.exitProcessedBy || '';
      
      return {
        id: String(bodyId),
        name: bodyName,
        timeOfDeath: exitDate || new Date().toISOString(),
        status: 'released',
        riskLevel: 'medium',
        storageUnit: 'Released',
        incidentType: 'unknown',
        verifiedBy: processedBy,
        patientId: '',
        dateOfDeath: exitDate,
        gender: 'Unknown',
        age: 'Unknown',
        mlcCase: false,
        photo: '',
        belongings: [],
        notes: exitNotes,
        tagNumber: `TAG-${bodyId}`,
        fromDischarge: false,
        dischargeId: '',
        registrationDate: exitDate || new Date().toISOString(),
        // Release information
        isReleased: true,
        releaseDate: exitDate,
        releaseStatus: exitStatus,
        exitId: String(exitId)
      };
    }).filter(body => body.id && body.id !== 'undefined'); // Filter out any without valid IDs
    
    // Combine current and released bodies
    const allBodies = [...currentBodiesWithStatus, ...releasedBodies];
    
    // Sort by ID (newest first)
    allBodies.sort((a, b) => {
      const aId = parseInt(String(a.id), 10);
      const bId = parseInt(String(b.id), 10);
      return bId - aId;
    });
    
    return allBodies;
  }, [rawBodies, exitRecords]);

  // Define columns at the component level
  const columns = [
    { 
      key: 'id', 
      header: 'ID',
      render: (row: Body) => (
        <a
          href="#"
          style={{ color: '#428bca', textDecoration: 'none', cursor: 'pointer' }}
          onClick={e => {
            e.preventDefault();
            handleViewDetails(row.id);
          }}
        >
          {safeRender(row.id, 'N/A')}
        </a>
      ) 
    },
    { 
      key: 'name', 
      header: 'Name',
      render: (row: Body) => safeRender(row.name, 'Unknown')
    },
    { 
      key: 'timeOfDeath', 
      header: 'Time of Death',
      render: (row: Body) => {
        if (!row.timeOfDeath) return 'N/A';
        try {
          const date = new Date(row.timeOfDeath);
          if (isNaN(date.getTime())) return row.timeOfDeath;
          return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          });
        } catch (error) {
          return row.timeOfDeath;
        }
      }
    },
    { 
      key: 'status', 
      header: 'Status',
      render: (row: Body) => safeRender(row.status, 'Unknown')
    },
    { 
      key: 'riskLevel', 
      header: 'Risk Level',
      render: (row: Body) => safeRender(row.riskLevel, 'N/A')
    },
    { 
      key: 'storageUnit', 
      header: 'Storage Unit',
      render: (row: Body) => safeRender(row.storageUnit, 'N/A')
    },
    { 
      key: 'incidentType', 
      header: 'Incident Type',
      render: (row: Body) => safeRender(row.incidentType, 'N/A')
    },
    {
      key: 'releaseStatus',
      header: 'Release Status',
      render: (row: Body) => {
        if (row.isReleased) {
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span 
                style={{ 
                  color: '#16a34a', 
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}
              >
                Released
              </span>
              {row.releaseDate && (
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280' 
                }}>
                  {new Date(row.releaseDate).toLocaleDateString('en-GB')}
                </span>
              )}
              {row.releaseStatus && (
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  {row.releaseStatus}
                </span>
              )}
            </div>
          );
        }
        return (
          <span style={{ 
            color: '#dc2626', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            In Storage
          </span>
        );
      }
    },
  ];

  // Safe render function for table cells
  const safeRender = (value: any, defaultValue: string = '-'): string | number | React.ReactNode => {
    try {
      if (value === undefined || value === null || value === '') return defaultValue;
      if (typeof value === 'string' || typeof value === 'number') return value;
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : defaultValue;
      if (typeof value === 'object') {
        try {
          return JSON.stringify(value);
        } catch (jsonError) {
          return defaultValue;
        }
      }
      return String(value);
    } catch (error) {
      return 'Error';
    }
  };

  const fetchBodies = async () => {
    try {
      const data = await bodiesAPI.getAll();
      
      // Ensure data is an array and contains valid objects
      const validBodies = Array.isArray(data) ? data.filter(body => {
        if (!body || typeof body !== 'object') {
          return false;
        }
        return true;
      }) : [];
      
      setRawBodies(validBodies);
    } catch (error) {
      setRawBodies([]);
      toast.error('Failed to load body data. Please refresh the page.');
    }
  };

  const fetchExitRecords = async () => {
    try {
      const exitData = await exitBodiesAPI.getAll();
      
      const validExitRecords = Array.isArray(exitData) ? exitData.filter(exit => {
        if (!exit || typeof exit !== 'object') {
          return false;
        }
        return true;
      }) : [];
      
      setExitRecords(validExitRecords);
    } catch (error) {
      setExitRecords([]);
      toast.error('Failed to load exit records.');
    }
  };

  const fetchActiveBodiesCount = async () => {
    try {
      console.log('Fetching active bodies count from storage API...');
      const activeBodies = await storageAPI.getActiveBodies();
      console.log('Active bodies response:', activeBodies);
      
      const count = Array.isArray(activeBodies) ? activeBodies.length : 0;
      console.log('Setting active bodies count to:', count);
      setActiveBodiesCount(count);
    } catch (error) {
      console.error('Failed to fetch active bodies count from storage API:', error);
      // Fallback to counting from rawBodies with proper filtering
      const fallbackCount = rawBodies.filter(b => {
        // Only count bodies that have a valid storage unit and are not released
        return b.storageUnit && 
               b.storageUnit !== '' && 
               b.storageUnit !== 'Released' && 
               b.storageUnit !== 'N/A' &&
               (!b.status || b.status.toLowerCase() !== 'released');
      }).length;
      console.log('Using fallback count:', fallbackCount);
      setActiveBodiesCount(fallbackCount);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        fetchBodies(),
        fetchExitRecords(),
        fetchActiveBodiesCount()
      ]);
    };
    
    fetchAllData();
  }, []);

  // Update active bodies count when rawBodies changes
  useEffect(() => {
    fetchActiveBodiesCount();
  }, [rawBodies]);

  const handleVerify = async (bodyId: string) => {
    try {
      await bodiesAPI.verify(bodyId, 'Staff');
      toast.success('Body verified successfully!');
      fetchBodies();
    } catch (error) {
      toast.error('Failed to verify body.');
    }
  };

  // Get all possible storage units (e.g., F-01 to F-30)
  const totalUnits = 30;
  const allUnits = Array.from({ length: totalUnits }, (_, i) => `F-${String(i + 1).padStart(2, '0')}`);
  // Get units currently assigned to other bodies (excluding the one being edited)
  const assignedUnits = bodies
    .filter(b => !editBody || b.id !== editBody.id)
    .filter(b => !b.isReleased) // Only consider units from non-released bodies
    .map(b => b.storageUnit)
    .filter(Boolean);
  // Only allow unassigned units and the current unit of the body being edited
  const availableUnits = allUnits
    .filter(unit => !assignedUnits.includes(unit) || (editBody && editBody.storageUnit === unit))
    .map(unit => ({ value: unit, label: unit }));
    
  // Add 'Select unit' as the first option
  const storageUnitOptions = [
    { value: '', label: 'Select unit', disabled: true },
    ...availableUnits
  ];

  const bodyFormConfig = {
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'age', label: 'Age', type: 'text', required: true },
      { name: 'gender', label: 'Gender', type: 'select', required: true, options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
      ] },
      { name: 'status', label: 'Status', type: 'select', required: true, options: [
        { value: 'verified', label: 'Verified' },
        { value: 'pending', label: 'Pending' },
        { value: 'unverified', label: 'Unverified' },
      ] },
      { name: 'riskLevel', label: 'Risk Level', type: 'select', required: true, options: [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
      ] },
      { name: 'storageUnit', label: 'Storage Unit', type: 'select', required: true, options: storageUnitOptions },
      { name: 'incidentType', label: 'Incident Type', type: 'select', required: true, options: [
        { value: 'natural', label: 'Natural' },
        { value: 'accident', label: 'Accident' },
        { value: 'homicide', label: 'Homicide' },
        { value: 'suicide', label: 'Suicide' },
      ] },
    ],
    initialValues: (data: any) => ({
      name: data?.name || '',
      age: data?.age || '',
      gender: data?.gender || '',
      status: data?.status || '',
      riskLevel: data?.riskLevel || '',
      storageUnit: data?.storageUnit || '',
      incidentType: data?.incidentType || '',
    }),
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      age: Yup.string().required('Age is required'),
      gender: Yup.string().required('Gender is required'),
      status: Yup.string().required('Status is required'),
      riskLevel: Yup.string().required('Risk Level is required'),
      storageUnit: Yup.string().required('Please select a storage unit'),
      incidentType: Yup.string().required('Incident Type is required'),
    }),
  };

  const handleEdit = (bodyId: string) => {
    const body = bodies.find(b => b.id === bodyId);
    if (body && body.status !== 'verified') {
      toast.error('Please verify the body before editing or deleting.');
      return;
    }
    if (body && body.fromDischarge) {
      toast.error('Cannot edit patient details for bodies created from discharge records.');
      return;
    }
    if (body && body.isReleased) {
      toast.error('Cannot edit released bodies.');
      return;
    }
    setEditBody(body || null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editBody) return;
    setEditLoading(true);
    try {
      await bodiesAPI.update(editBody.id, values);
      fetchBodies();
      setShowEditModal(false);
      setEditBody(null);
      toast.success('Body updated successfully!');
    } catch (error) {
      toast.error('Failed to update body.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleViewDetails = (bodyId: string) => {
    navigate(`/bodies/${bodyId}`);
  };

  const handleDelete = async (bodyId: string) => {
    const body = bodies.find(b => b.id === bodyId);
    if (body && body.status !== 'verified') {
      toast.error('Please verify the body before editing or deleting.');
      return;
    }
    if (body && body.isReleased) {
      toast.error('Cannot delete released bodies.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this body?')) return;
    try {
      await bodiesAPI.delete(bodyId);
      fetchBodies();
      toast.success('Body deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete body.');
    }
  };

  // Filter bodies based on search, status, and date range
  const filteredBodies = (Array.isArray(bodies) ? bodies : []).filter(body => {
    // Ensure body is a valid object
    if (!body || typeof body !== 'object') {
      return false;
    }
    
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = body.name ? String(body.name).toLowerCase().includes(searchLower) : false;
    const idMatch = body.id ? String(body.id).toLowerCase().includes(searchLower) : false;
    const patientIdMatch = body.patientId ? String(body.patientId).toLowerCase().includes(searchLower) : false;
    const dateOfDeathMatch = body.dateOfDeath ? String(body.dateOfDeath).toLowerCase().includes(searchLower) : false;
    const matchesSearch = searchTerm === '' || nameMatch || idMatch || patientIdMatch || dateOfDeathMatch;
    
    // Status filter - now includes release status
    let matchesStatus = true;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'released') {
      matchesStatus = body.isReleased === true;
    } else if (statusFilter === 'in-storage') {
      matchesStatus = body.isReleased !== true;
    } else {
      // Regular status filtering
      matchesStatus = body.status === statusFilter;
    }
    
    // Date filter (using registrationDate with improved logic)
    let dateMatch = true;
    
    if (body.registrationDate) {
      const registrationDate = new Date(body.registrationDate);
      // Reset time to start of day for proper date comparison
      registrationDate.setHours(0, 0, 0, 0);
      
      if (startDate && endDate) {
        // Both dates selected - check if registration date is within range (inclusive)
        const fromDate = new Date(startDate);
        const toDate = new Date(endDate);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999); // End of day for "to date"
        
        dateMatch = registrationDate >= fromDate && registrationDate <= toDate;
      } else if (startDate) {
        // Only from date selected - show records from this date onwards
        const fromDate = new Date(startDate);
        fromDate.setHours(0, 0, 0, 0);
        dateMatch = registrationDate >= fromDate;
      } else if (endDate) {
        // Only to date selected - show records up to this date
        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = registrationDate <= toDate;
      }
      // If no dates selected, show all records (dateMatch remains true)
    } else if (startDate || endDate) {
      // If date filters are set but record has no registration date, exclude it
      dateMatch = false;
    }
    
    const result = matchesSearch && matchesStatus && dateMatch;
    return result;
  });

  const renderTableActions = (row: Record<string, any>) => {
    const body = row as Body;
    
    // Safety check to ensure we have a valid body with an ID
    if (!body || !body.id) {
      return <div className="table-actions">-</div>;
    }
    
    return (
      <div className="table-actions">
        <button
          className="action-btn view-btn"
          title="View Details"
          onClick={() => handleViewDetails(body.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginRight: 8 }}
        >
          <i className="fa fa-eye" style={{ fontSize: 16, color: '#222' }}></i>
        </button>
        {body.isReleased && (
          <span 
            style={{ 
              fontSize: '0.75rem', 
              color: '#16a34a', 
              fontWeight: '500',
              marginLeft: '8px'
            }}
            title={`Released on ${body.releaseDate ? new Date(body.releaseDate).toLocaleDateString() : 'Unknown date'}`}
          >
            ✓ Released
          </span>
        )}
      </div>
    );
  };

  const labelStyle = { fontWeight: 600, textTransform: 'capitalize' as const, padding: '6px 8px', color: '#374151' };
  const valueStyle = { padding: '6px 8px', color: '#222' };

  return (
    <>
      {/* Search section */}
      <div style={{ marginBottom: 20 }}>
        <Searchbar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Patient ID, Body ID, Name, or Date of Death"
        />
      </div>

      {/* Filter section with same UI design as exit table */}
      <div className="filter-container">
        <div className="left-filters">
          <div className="filter-group">
            <label className="filter-label">From Date</label>
            <input
              type="date"
              value={startDate ? formatDateForInput(startDate) : ""}
              onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">To Date</label>
            <input
              type="date"
              value={endDate ? formatDateForInput(endDate) : ""}
              onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
              className="filter-input"
              min={startDate ? formatDateForInput(startDate) : undefined}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select
              className="filter-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="In Storage">In Storage</option>
              <option value="in-storage">Currently In Storage</option>
              <option value="released">Released</option>
            </select>
          </div>
          <div className="filter-group">
            <ButtonWithGradient
              text="Clear Filters"
              onClick={() => {
                setStartDate(null);
                setEndDate(null);
                setStatusFilter('all');
              }}
              className="clear-filters-btn"
              style={{
                fontSize: '14px',
                padding: '8px 16px',
                minHeight: 'auto'
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '1rem',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>
            Total Bodies
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1e293b' }}>
            {bodies.length}
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.5rem',
          padding: '1rem',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.25rem' }}>
            In Storage
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#dc2626' }}>
            {activeBodiesCount}
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '0.5rem',
          padding: '1rem',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#16a34a', marginBottom: '0.25rem' }}>
            Released
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#16a34a' }}>
            {bodies.filter(b => b.isReleased).length}
          </div>
        </div>
        
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fed7aa',
          borderRadius: '0.5rem',
          padding: '1rem',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#d97706', marginBottom: '0.25rem' }}>
            Pending Verification
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#d97706' }}>
            {bodies.filter(b => b.status === 'pending' || b.status === 'unverified').length}
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<Body>
        columns={columns}
        data={filteredBodies}
        renderActions={renderTableActions}
        disableInternalPagination={false}
      />
      <EditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        data={editBody}
        formConfig={bodyFormConfig}
        onSubmit={handleEditSubmit}
        loading={editLoading}
        title="Edit Body"
      />
      {/* Verification Modal */}
      {showVerificationModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100,
          padding: '20px'
        }}>
          <div className="bodies-card" style={{ 
            maxWidth: '500px', 
            width: '100%', 
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            margin: 'auto'
          }}>
            <div className="card-header">
              <div className="card-header-content">
                <h3 className="card-title">Body Verification</h3>
                <button
                  style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}
                  onClick={() => setShowVerificationModal(false)}
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="card-content">
              <form onSubmit={async e => {
                e.preventDefault();
                if (!viewBody) return;
                try {
                  await bodiesAPI.logVerification(viewBody.id, verificationForm);
                  setShowVerificationModal(false);
                  setViewBody(null);
                  setVerificationForm({ name: '', relation: '', idProof: '', contact: '' });
                  fetchBodies();
                  toast.success('Body verified and log updated!');
                } catch (error) {
                  toast.error('Failed to verify body.');
                }
              }}>
                <div className="form-group">
                  <label className="form-label">Name of Verifying Person</label>
                  <input
                    className="form-input"
                    type="text"
                    value={verificationForm.name}
                    onChange={e => setVerificationForm(f => ({ ...f, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Relation to Deceased</label>
                  <input
                    className="form-input"
                    type="text"
                    value={verificationForm.relation}
                    onChange={e => setVerificationForm(f => ({ ...f, relation: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ID Proof (enter details or upload)</label>
                  <input
                    className="form-input"
                    type="text"
                    value={verificationForm.idProof}
                    onChange={e => setVerificationForm(f => ({ ...f, idProof: e.target.value }))}
                    placeholder="ID Number / Type"
                  />
                </div>
                <div className="form-group">
                  <PhoneInput
                    label="Contact Number"
                    value={verificationForm.contact}
                    onChange={(value) => setVerificationForm(f => ({ ...f, contact: value }))}
                    placeholder="Enter 10-digit contact number"
                    required
                    className="form-input"
                  />
                </div>
                <div style={{ marginTop: 24, textAlign: 'right' }}>
                  <ButtonWithGradient
                    text="Submit Verification"
                    type="submit"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BodyManagement;