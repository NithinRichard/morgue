import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/bodies.css';
import Table from './Table';
import Searchbar from './Searchbar';
import ButtonWithGradient from './ButtonWithGradient';
import deleteIcon from "../assets/delete.png";
import DeleteButton from './DeleteButton';
import EditButton from './EditButton';
import EditModal from './EditModal';
import PatientProfileDetails from './PatientProfileDetails';
import * as Yup from 'yup';
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { QRCodeCanvas } from 'qrcode.react';

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
  tagNumber?: string; // Added tagNumber to the interface
  fromDischarge?: boolean; // Track if body was created from discharge record
  dischargeId?: string; // ID of the discharge record if applicable
}

const BodyManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [bodies, setBodies] = useState<Body[]>([]);
  const [viewBody, setViewBody] = useState<Body | null>(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBody, setEditBody] = useState<Body | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const navigate = useNavigate();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    name: '',
    relation: '',
    idProof: '',
    contact: ''
  });

  const fetchBodies = async () => {
    try {
      const response = await fetch('http://192.168.50.140:3001/api/bodies');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setBodies(data);
    } catch (error) {
      console.error("Failed to fetch bodies:", error);
    }
  };

  useEffect(() => {
    fetchBodies();
  }, []);

  const handleVerify = async (bodyId: string) => {
    try {
      const response = await fetch(`http://192.168.50.140:3001/api/bodies/${bodyId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedBy: 'Staff' }) 
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }
      
      fetchBodies();
    } catch (error) {
      console.error('Failed to verify body:', error);
      alert('Failed to verify body.');
    }
  };

  // Get all possible storage units (e.g., F-01 to F-30)
  const totalUnits = 30;
  const allUnits = Array.from({ length: totalUnits }, (_, i) => `F-${String(i + 1).padStart(2, '0')}`);
  // Get units currently assigned to other bodies (excluding the one being edited)
  const assignedUnits = bodies
    .filter(b => !editBody || b.id !== editBody.id)
    .map(b => b.storageUnit)
    .filter(Boolean);
  // Only allow unassigned units and the current unit of the body being edited
  const storageUnitOptions = allUnits
    .filter(unit => !assignedUnits.includes(unit) || (editBody && editBody.storageUnit === unit))
    .map(unit => ({ value: unit, label: unit }));

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
      storageUnit: Yup.string().required('Storage Unit is required'),
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
    setEditBody(body || null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editBody) return;
    setEditLoading(true);
    try {
      const response = await fetch(`http://192.168.50.140:3001/api/bodies/${editBody.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Failed to update body');
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
    if (!window.confirm('Are you sure you want to delete this body?')) return;
    try {
      const response = await fetch(`http://192.168.50.140:3001/api/bodies/${bodyId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete body');
      fetchBodies();
      toast.success('Body deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete body.');
    }
  };

  // Update the filteredBodies logic
  const filteredBodies = bodies.filter(body => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = body.name ? body.name.toLowerCase().includes(searchLower) : false;
    const idMatch = body.id ? body.id.toLowerCase().includes(searchLower) : false;
    const patientIdMatch = body.patientId ? body.patientId.toLowerCase().includes(searchLower) : false;
    const dateOfDeathMatch = body.dateOfDeath ? body.dateOfDeath.toLowerCase().includes(searchLower) : false;
    const matchesSearch = nameMatch || idMatch || patientIdMatch || dateOfDeathMatch;
    const matchesStatus = statusFilter === 'all' || body.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { key: 'id', header: 'ID', render: (row: Record<string, any>) => (
      <a
        href="#"
        style={{ color: '#428bca', textDecoration: 'none', cursor: 'pointer' }}
        onClick={e => {
          e.preventDefault();
          handleViewDetails(row.id);
        }}
      >
        {row.id}
      </a>
    ) },
    { key: 'name', header: 'Name' },
    { key: 'timeOfDeath', header: 'Time of Death' },
    { key: 'status', header: 'Status' },
    { key: 'riskLevel', header: 'Risk Level' },
    { key: 'storageUnit', header: 'Storage Unit' },
    { key: 'incidentType', header: 'Incident Type' },
  ];

  const renderTableActions = (row: Record<string, any>) => {
    const body = row as Body;
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
        {/* DeleteButton removed for mortuary management best practices */}
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
      {/* Remove bodies-container, move children up */}
      {/* <div className="bodies-container"> */}
      {/* <ToastContainer position="top-right" autoClose={2000} /> */}
      
      {/* Header section
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#333' }}>Body Management</h3>
        <ButtonWithGradient
          className=""
          text="Register New Body"
          onClick={() => navigate('/inward')}
          type="button"
        />
      </div> */}

      {/* Table */}
      <Table columns={columns} data={filteredBodies} renderActions={renderTableActions} />
      <EditModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        data={editBody}
        formConfig={bodyFormConfig}
        onSubmit={handleEditSubmit}
        loading={editLoading}
        title="Edit Body"
      />
      {/* Patient Profile Details View */}
      {/* Modal for body details removed, now handled by page navigation */}
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
                  const response = await fetch(`http://192.168.50.140:3001/api/bodies/${viewBody.id}/verify-log`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(verificationForm)
                  });
                  if (!response.ok) throw new Error('Verification failed');
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
                  {/* For file upload, you can add an <input type="file" /> here if needed */}
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Number</label>
                  <input
                    className="form-input"
                    type="tel"
                    value={verificationForm.contact}
                    onChange={e => setVerificationForm(f => ({ ...f, contact: e.target.value }))}
                    required
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