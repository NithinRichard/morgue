import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/storage.css';
import '../styles/form.css';
import '../styles/table.css';
import '../styles/pagination.css';
import ButtonWithGradient from './ButtonWithGradient';
import Table from './Table';
import PhoneInput from './PhoneInput';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
}

interface StorageAllocation {
  id: string;
  bodyId: string;
  storageUnitId: string;
  storageUnitCode: string;
  allocatedBy: string;
  status: string;
  temperatureRequired: number;
  priorityLevel: string;
  allocatedDate: string;
}

const StorageAllocation: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [bodies, setBodies] = useState<Body[]>([]);
  const [viewBody, setViewBody] = useState<Body | null>(null);
  const [releasedBodies, setReleasedBodies] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUnitForAssignment, setSelectedUnitForAssignment] = useState<string | null>(null);
  const [unassignedBodies, setUnassignedBodies] = useState<Body[]>([]);
  const [selectedBodyToAssign, setSelectedBodyToAssign] = useState<string>('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    name: '',
    relation: '',
    contact: '',
    idProof: '',
    remarks: '',
    verifierType: '',
    medicalRegNo: '',
    badgeNumber: ''
  });
  const [verifying, setVerifying] = useState(false);
  const [verifyingBodyId, setVerifyingBodyId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState('all'); // Add status filter state
  const [riskLevelFilter, setRiskLevelFilter] = useState('all'); // Add risk level filter state
  const [allocations, setAllocations] = useState<StorageAllocation[]>([]);

  useEffect(() => {
    const fetchBodies = async () => {
      try {
        const response = await fetch('http://192.168.50.126:3001/api/bodies');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setBodies(data);
        // Filter unassigned bodies (bodies without storage unit)
        const unassigned = data.filter((body: Body) => !body.storageUnit || body.storageUnit === '');
        setUnassignedBodies(unassigned);
      } catch (error) {
        console.error("Failed to fetch bodies:", error);
      }
    };
    const fetchReleasedBodies = async () => {
      try {
        const response = await fetch('http://192.168.50.126:3001/api/exit-bodies');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setReleasedBodies(data);
      } catch (error) {
        console.error("Failed to fetch released bodies:", error);
      }
    };
    const fetchAllocations = async () => {
      try {
        const response = await fetch('http://192.168.50.126:3001/api/storage-allocations/');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAllocations(data);
      } catch (error) {
        console.error("Failed to fetch allocations:", error);
      }
    };
    
    fetchBodies();
    fetchReleasedBodies();
    fetchAllocations();
  }, []);

const totalUnits = 30;
  // Only consider bodies that are not released as occupying storage units
  const occupiedUnits = new Set(
    allocations
      .filter(allocation => {
        // Exclude allocations for released bodies
        const isReleased = releasedBodies.some(rb => rb.id === allocation.bodyId || rb.bodyId === allocation.bodyId);
        return allocation.status && allocation.status.toLowerCase() !== 'released' && !isReleased;
      })
      .map(allocation => allocation.storageUnitId)
  );

  const storageUnits = Array.from({ length: totalUnits }, (_, i) => {
    const unitNumber = `F-${String(i + 1).padStart(2, '0')}`;
    // Look for allocation by both storageUnitId (numeric) and storageUnitCode (string)
    const allocation = allocations.find(a =>
      (a.storageUnitCode === unitNumber ||
        a.storageUnitId === unitNumber ||
        String(a.storageUnitId) === unitNumber) &&
      // Exclude released bodies
      !releasedBodies.some(rb => rb.id === a.bodyId || rb.bodyId === a.bodyId)
    );
    const isOccupied = allocation && allocation.status && allocation.status.toLowerCase() !== 'released';

    return {
      id: unitNumber,
      occupied: isOccupied,
      bodyId: allocation ? allocation.bodyId : null,
      allocatedBy: allocation ? allocation.allocatedBy : null,
      temperatureRequired: allocation ? allocation.temperatureRequired : null,
      priorityLevel: allocation ? allocation.priorityLevel : null,
      duration: allocation && allocation.allocatedDate ? Math.floor((new Date().getTime() - new Date(allocation.allocatedDate).getTime()) / (1000 * 60 * 60)) : 0
    };
  });

  const getUnitColor = (unit: any) => {
    if (!unit.occupied) return 'unit-available';
    if (unit.duration > 48) return 'unit-long';
    if (unit.duration > 24) return 'unit-extended';
    return 'unit-occupied';
  };

  const getStatusText = (unit: any) => {
    if (!unit.occupied) return 'Available';
    if (unit.duration > 48) return 'Long Stay';
    if (unit.duration > 24) return 'Extended';
    return 'Occupied';
  };

  // Helper function to refresh all data
  const refreshAllData = async () => {
    try {
      // Fetch bodies
      const bodiesResponse = await fetch('http://192.168.50.126:3001/api/bodies');
      if (bodiesResponse.ok) {
        const bodiesData = await bodiesResponse.json();
        setBodies(bodiesData);
        // Filter unassigned bodies (bodies without storage unit)
        const unassigned = bodiesData.filter((body: Body) => !body.storageUnit || body.storageUnit === '');
        setUnassignedBodies(unassigned);
      }
      
      // Fetch allocations
      const allocationsResponse = await fetch('http://192.168.50.126:3001/api/storage-allocations/');
      if (allocationsResponse.ok) {
        const allocationsData = await allocationsResponse.json();
        setAllocations(allocationsData);
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // Assign body handler
const handleAssignBody = async (unitId: string | null, bodyId: string) => {
    if (!unitId || !bodyId) {
      alert('Please select a body to assign.');
      return;
    }

    // Check if unit is still available
    const unit = storageUnits.find(u => u.id === unitId);
    if (!unit || unit.occupied) {
      alert('This storage unit is no longer available. Please refresh and try again.');
      setShowAssignModal(false);
      return;
    }

    // Confirm assignment
    const bodyToAssign = unassignedBodies.find(b => b.id === bodyId);
    if (!bodyToAssign) {
      alert('Selected body is no longer available.');
      return;
    }

    if (!window.confirm(`Are you sure you want to assign ${bodyToAssign.name} to storage unit ${unitId}?`)) {
      return;
    }

    try {
      const response = await fetch('http://192.168.50.126:3001/api/storage-allocations/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          bodyId: bodyId, 
          storageUnitId: unitId,
          allocatedBy: 'User', // Update with actual user 
          temperatureRequired: -18, // Update as needed
          priorityLevel: 'Normal',
          status: 'Active',
          providerId: 1, // Add required fields
          outletId: 1
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to assign body: ${errorText}`);
      }

      // Refresh all data to ensure UI is updated
      await refreshAllData();

      // Close modal and reset states
      setShowAssignModal(false);
      setSelectedBodyToAssign('');
      setSelectedUnitForAssignment(null);

      alert(`Body ${bodyToAssign.name} has been successfully assigned to storage unit ${unitId}!`);
    } catch (error) {
      alert(`Failed to assign body: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Assignment error:', error);
    }
  };

  // Release unit handler
  const handleReleaseUnit = async (unitId: string) => {
    const unitBody = bodies.find(b => b.storageUnit === unitId);
    if (!unitBody) return;
    // Confirmation dialog
    if (!window.confirm(`Are you sure you want to release the body from unit ${unitId}?`)) return;
    try {
              const response = await fetch(`http://192.168.50.126:3001/api/exits/${unitBody.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!response.ok) throw new Error('Failed to release body');
      // Remove the body from the UI
      setBodies(prev => prev.filter(b => b.id !== unitBody.id));
      alert('Body released successfully!');
    } catch (error) {
      alert('Failed to release body.');
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingBodyId) return;
    
    try {
      setVerifying(true);
      
      // Update the local state
      setBodies(bodies.map(body => 
        body.id === verifyingBodyId 
          ? { ...body, verifiedBy: 'Current User', status: 'Verified' } 
          : body
      ));
      
      // Update the verification status in the database
      try {
        const response = await fetch(`http://192.168.50.126:3001/api/bodies/${verifyingBodyId}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            verifiedBy: 'Current User',
            ...verificationForm
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update verification status');
        }

        // Emit an event to notify other components (like ExitManagement) that a body was verified
        const event = new CustomEvent('bodyVerified', { detail: { bodyId: verifyingBodyId } });
        window.dispatchEvent(event);
        
        // Also store in localStorage as a fallback
        localStorage.setItem(`bodyVerified_${verifyingBodyId}`, new Date().toISOString());
        
      } catch (error) {
        console.error('Error updating verification status:', error);
        toast.error('Body marked as verified locally, but server update failed');
      }
      
      // Refresh the bodies list
      try {
        const responseBodies = await fetch('http://192.168.50.126:3001/api/bodies');
        if (responseBodies.ok) {
          setBodies(await responseBodies.json());
        }
      } catch (error) {
        console.error('Failed to refresh bodies list:', error);
      }
      
      setShowVerificationModal(false);
      setVerificationForm({
        name: '',
        relation: '',
        contact: '',
        idProof: '',
        remarks: '',
        verifierType: '',
        medicalRegNo: '',
        badgeNumber: ''
      });
      
      toast.success('Body verified successfully');
    } catch (error) {
      console.error('Error verifying body:', error);
      toast.error('Failed to verify body');
    } finally {
      setVerifying(false);
      setVerifyingBodyId(null);
    }
  };

  const navigate = useNavigate();

  // Sort releasedBodies so the most recently exited come first
  const sortedReleasedBodies = [...releasedBodies].sort((a, b) => {
    if (a.exitDate && b.exitDate) {
      return new Date(b.exitDate).getTime() - new Date(a.exitDate).getTime();
    }
    return (b.id || '').localeCompare(a.id || '');
  });

  // Improved date filtering logic for released bodies
  const filteredReleasedBodies = sortedReleasedBodies.filter(body => {
    let dateMatch = true;
    
    if (body.exitDate) {
      const exitDate = new Date(body.exitDate);
      // Reset time to start of day for proper date comparison
      exitDate.setHours(0, 0, 0, 0);
      
      if (startDate && endDate) {
        // Both dates selected - check if exit date is within range (inclusive)
        const fromDate = new Date(startDate);
        const toDate = new Date(endDate);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999); // End of day for "to date"
        
        dateMatch = exitDate >= fromDate && exitDate <= toDate;
      } else if (startDate) {
        // Only from date selected - show records from this date onwards
        const fromDate = new Date(startDate);
        fromDate.setHours(0, 0, 0, 0);
        dateMatch = exitDate >= fromDate;
      } else if (endDate) {
        // Only to date selected - show records up to this date
        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = exitDate <= toDate;
      }
      // If no dates selected, show all records (dateMatch remains true)
    } else if (startDate || endDate) {
      // If date filters are set but record has no exit date, exclude it
      dateMatch = false;
    }
    
    const statusMatch = statusFilter === 'all' || (body.status && body.status.toLowerCase() === statusFilter);
    
    return dateMatch && statusMatch;
  });

  // Combine allocations and bodies for currently allocated (not released) bodies
  const activeAllocations = allocations
    .filter(a => a.status && a.status.toLowerCase() !== 'released')
    .map(a => {
      const body = bodies.find(b => b.id === a.bodyId);
      return {
        ...a,
        bodyName: body?.name || '',
        riskLevel: body?.riskLevel || '',
        timeOfDeath: body?.timeOfDeath || '',
        incidentType: body?.incidentType || '',
        // add more body fields as needed
      };
    });

  // Apply date and risk level filtering to active allocations
  const filteredActiveAllocations = activeAllocations.filter(allocation => {
    let dateMatch = true;
    
    if (allocation.allocatedDate) {
      const allocatedDate = new Date(allocation.allocatedDate);
      // Reset time to start of day for proper date comparison
      allocatedDate.setHours(0, 0, 0, 0);
      
      if (startDate && endDate) {
        // Both dates selected - check if allocated date is within range (inclusive)
        const fromDate = new Date(startDate);
        const toDate = new Date(endDate);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999); // End of day for "to date"
        
        dateMatch = allocatedDate >= fromDate && allocatedDate <= toDate;
      } else if (startDate) {
        // Only from date selected - show records from this date onwards
        const fromDate = new Date(startDate);
        fromDate.setHours(0, 0, 0, 0);
        dateMatch = allocatedDate >= fromDate;
      } else if (endDate) {
        // Only to date selected - show records up to this date
        const toDate = new Date(endDate);
        toDate.setHours(23, 59, 59, 999);
        dateMatch = allocatedDate <= toDate;
      }
      // If no dates selected, show all records (dateMatch remains true)
    } else if (startDate || endDate) {
      // If date filters are set but record has no allocated date, exclude it
      dateMatch = false;
    }
    
    const statusMatch = statusFilter === 'all' || (allocation.status && allocation.status.toLowerCase() === statusFilter);
    
    // Risk level filter
    const riskLevelMatch = riskLevelFilter === 'all' || (allocation.riskLevel && allocation.riskLevel.toLowerCase() === riskLevelFilter.toLowerCase());
    
    return dateMatch && statusMatch && riskLevelMatch;
  });

  // Define columns for the table
  const allocationColumns = [
    { key: 'bodyName', header: 'Body Name' },
    { key: 'riskLevel', header: 'Risk Level' },
    { 
      key: 'timeOfDeath', 
      header: 'Time of Death',
      render: (row: any) => {
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
    { key: 'incidentType', header: 'Incident Type' },
    { key: 'storageUnitCode', header: 'Storage Unit' },
    { 
      key: 'allocatedDate', 
      header: 'Allocated Date',
      render: (row: any) => {
        if (!row.allocatedDate) return 'N/A';
        try {
          const date = new Date(row.allocatedDate);
          if (isNaN(date.getTime())) return row.allocatedDate;
          return date.toLocaleDateString('en-GB');
        } catch (error) {
          return row.allocatedDate;
        }
      }
    },
    { key: 'temperatureRequired', header: 'Temperature (°C)' },
    { key: 'priorityLevel', header: 'Priority' },
    // add more as needed
  ];

  return (
    <div className="storage-container">
      <div className="storage-grid">
        <div className="storage-layout">
          <div className="card-header">
            <h3 className="card-title">Storage Units Layout</h3>
          </div>
          <div className="card-content">
            <div className="units-grid">
              {storageUnits.map((unit) => (
                <div
                  key={unit.id}
                  onClick={() => setSelectedUnit(unit.id)}
                  className={`unit-box ${getUnitColor(unit)}${selectedUnit === unit.id ? ' selected' : ''}`}
                >
                  <div className="unit-center">
                    <p className="unit-id">{unit.id}</p>
                    <div className="unit-icon">
                      {unit.occupied ? (
                        <span role="img" aria-label="user">👤</span>
                      ) : (
                        <span className="unit-dot"></span>
                      )}
                    </div>
                    <p className="unit-status">{getStatusText(unit)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="unit-legend">
              <div className="legend-item"><span className="legend-dot unit-available"></span>Available</div>
              <div className="legend-item"><span className="legend-dot unit-occupied"></span>Occupied</div>
              <div className="legend-item"><span className="legend-dot unit-extended"></span>Extended Stay</div>
              <div className="legend-item"><span className="legend-dot unit-long"></span>Long Stay</div>
            </div>
          </div>
        </div>
        <div className="storage-details">
          <div className="card-header">
            <h3 className="card-title">Unit Details</h3>
          </div>
          <div className="card-content">
            {selectedUnit ? (
              <div className="unit-details">
                {(() => {
                  const unit = storageUnits.find(u => u.id === selectedUnit);
                  if (!unit) return null;
                  return (
                    <>
                      <div className="unit-details-header">
                        <h3 className="unuhkkhit-details-title">{unit.id}</h3>
                        <span className={`unit-badge ${getUnitColor(unit)}`}>{getStatusText(unit)}</span>
                      </div>
                      <div className="unit-details-info">
                        <div className="unit-info-row">Temperature: <span>{unit.temperatureRequired ? unit.temperatureRequired.toFixed(1) : '-18.0'}°C</span></div>
                        {unit.occupied ? (
                          <>
                            <div className="unit-info-row">Body ID: <span>{unit.bodyId}</span></div>
                            {/* Add Body Name display here */}
                            <div className="unit-info-row">Body Name: <span>{
                              (() => {
                                // Try to get body name from allocation if available
                                if (unit.bodyName) return unit.bodyName;
                                // Fallback: try to get from bodies list
                                const body = bodies.find(b => b.id === unit.bodyId);
                                return body ? body.name : '-';
                              })()
                            }</span></div>
                            <div className="unit-info-row">Allocated By: <span>{unit.allocatedBy}</span></div>
                            <div className="unit-info-row">Priority: <span>{unit.priorityLevel}</span></div>
                            <div className="unit-info-row">Duration: <span>{unit.duration} hours</span></div>
                            <div className="unit-details-actions">
                              {(() => {
                                const unitBody = bodies.find(b => b.storageUnit === unit.id);
                                if (unitBody && unitBody.status !== 'verified') {
                                  return (
                                    <ButtonWithGradient
                                      className=''
                                      text="Initiate Verification"
                                      onClick={() => {
                                        setVerifyingBodyId(unitBody.id);
                                        setShowVerificationModal(true);
                                      }}
                                      type="button"
                                    />
                                  );
                                } else if (unitBody && unitBody.status === 'verified') {
                                  return <span className="verified-badge" style={{ marginLeft: 8, color: '#16a34a', fontWeight: 600 }}>Verified</span>;
                                }
                                return null;
                              })()}
                            </div>
                          </>
                        ) : (
                          <div className="unit-details-actions">
                            <ButtonWithGradient
                              className={unassignedBodies.length === 0 ? 'disabled' : ''}
                              text={unassignedBodies.length === 0 ? 'No Bodies Available' : 'Assign Body'}
                              onClick={() => {
                                if (unassignedBodies.length === 0) {
                                  alert('No unassigned bodies available for assignment.');
                                  return;
                                }
                                setSelectedUnitForAssignment(unit.id);
                                setShowAssignModal(true);
                              }}
                              type="button"
                            />
                          </div>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <p className="unit-details-placeholder">Select a storage unit to view details</p>
            )}
          </div>
        </div>
      </div>
      {/* Assign Body Modal */}
      {showAssignModal && (
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
          zIndex: 1000
        }}>
          <div className="bodies-card" style={{ maxWidth: 500, width: '90%', position: 'relative' }}>
            <div className="card-header">
              <div className="card-header-content">
                <h3 className="card-title">Assign Body</h3>
                <button
                  style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer' }}
                  onClick={() => setShowAssignModal(false)}
                  title="Close"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="card-content">
              <div style={{ marginBottom: '20px' }}>
                <p style={{ marginBottom: '10px', fontWeight: '600' }}>Assigning to Unit: {selectedUnitForAssignment}</p>
                <p style={{ marginBottom: '15px', color: '#666' }}>Select a body to assign to this storage unit:</p>
                <select 
                  value={selectedBodyToAssign} 
                  onChange={(e) => setSelectedBodyToAssign(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    marginBottom: '15px',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select body to assign</option>
                  {unassignedBodies.map(body =>
                    <option key={body.id} value={body.id}>
                      {body.name} - ID: {body.id} ({body.riskLevel} risk)
                    </option>
                  )}
                </select>
                {unassignedBodies.length === 0 && (
                  <p style={{ color: '#999', fontStyle: 'italic' }}>No unassigned bodies available</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    background: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <ButtonWithGradient
                  className=''
                  text="Assign Body"
                  onClick={() => handleAssignBody(selectedUnitForAssignment, selectedBodyToAssign)}
                  type="button"
                />
              </div>
            </div>
          </div>
        </div>
      )}
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
          zIndex: 2000
        }}
          onClick={() => setShowVerificationModal(false)}
        >
          <div
            className="modal-content"
            style={{
              background: '#fff',
              borderRadius: 0,
              border: '1px solid rgba(0,0,0,.2)',
              outline: 0,
              WebkitBackgroundClip: 'padding-box',
              backgroundClip: 'padding-box',
              WebkitBoxShadow: '0 3px 9px rgba(0,0,0,.5)',
              boxShadow: '0 3px 9px rgba(0,0,0,.5)',
              padding: 24,
              minWidth: 320,
              maxWidth: 400,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header" style={{padding: 15, minHeight: 16.43, position: 'relative'}}>
              <button
                style={{ position: 'absolute', top: 8, right: 12, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
                onClick={() => setShowVerificationModal(false)}
                aria-label="Close"
              >×</button>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Initiate Verification</div>
            </div>
            <div className="popup-border" style={{width: '100%'}}></div>
            {/* Always show the form if not verified, with verifier type select always visible */}
            {(() => {
              const body = bodies.find(b => b.id === verifyingBodyId);
              if (body && body.status?.toLowerCase() !== 'verified') {
                return (
                  <form className="modal-body" onSubmit={handleVerificationSubmit}>
                    <div className="form-group">
                      <label className="labelPatientDetails">Name of Verifying Person</label>
                      <input
                        className="form-input"
                        type="text"
                        value={verificationForm.name}
                        onChange={e => setVerificationForm(f => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="labelPatientDetails">Verifier Type</label>
                      <select
                        className="form-select"
                        value={verificationForm.verifierType}
                        onChange={e => setVerificationForm(f => ({ ...f, verifierType: e.target.value }))}
                        required
                      >
                        <option value="">Select Verifier Type</option>
                        <option value="Staff">Staff</option>
                        <option value="Doctor">Doctor</option>
                        <option value="Police">Police</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {/* Dynamic fields for each verifier type */}
                    {(verificationForm.verifierType === 'Staff' || verificationForm.verifierType === 'Other') && (
                      <div className="form-group">
                        <label className="labelPatientDetails">Relation to Deceased</label>
                        <input
                          className="form-input"
                          type="text"
                          value={verificationForm.relation}
                          onChange={e => setVerificationForm(f => ({ ...f, relation: e.target.value }))}
                          required
                        />
                      </div>
                    )}
                    {verificationForm.verifierType === 'Doctor' && (
                      <div className="form-group">
                        <label className="labelPatientDetails">Medical Registration Number</label>
                        <input
                          className="form-input"
                          type="text"
                          value={verificationForm.medicalRegNo}
                          onChange={e => setVerificationForm(f => ({ ...f, medicalRegNo: e.target.value }))}
                          required
                        />
                      </div>
                    )}
                    {verificationForm.verifierType === 'Police' && (
                      <div className="form-group">
                        <label className="labelPatientDetails">Badge Number</label>
                        <input
                          className="form-input"
                          type="text"
                          value={verificationForm.badgeNumber}
                          onChange={e => setVerificationForm(f => ({ ...f, badgeNumber: e.target.value }))}
                          required
                        />
                      </div>
                    )}
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
                    <div className="form-group">
                      <label className="labelPatientDetails">ID Proof (enter details or upload)</label>
                      <input
                        className="form-input"
                        type="text"
                        value={verificationForm.idProof}
                        onChange={e => setVerificationForm(f => ({ ...f, idProof: e.target.value }))}
                        placeholder="ID Number / Type"
                      />
                    </div>
                    <div className="form-group">
                      <label className="labelPatientDetails">Remarks</label>
                      <input
                        className="form-input"
                        type="text"
                        value={verificationForm.remarks}
                        onChange={e => setVerificationForm(f => ({ ...f, remarks: e.target.value }))}
                      />
                    </div>
                    <div style={{ marginTop: 24, textAlign: 'right' }}>
                      <ButtonWithGradient
                        text={verifying ? 'Submitting...' : 'Submit Verification'}
                        type="submit"
                        disabled={verifying}
                      />
                    </div>
                  </form>
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}
      
      {/* Bodies in Storage Table with Filters */}
      <div style={{ marginTop: '2rem' }}>
        <div className="header">Bodies Currently in Storage</div>

        {/* Filter section with same UI design as exit and body management tables */}
        <div className="filter-container">
          <div className="left-filters">
            <div className="filter-group">
              <label className="filter-label">From Date</label>
              <DatePicker
                selected={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="dd-mm-yyyy"
                className="filter-input"
                dateFormat="dd-MM-yyyy"
              />
            </div>
            <div className="filter-group">
              <label className="filter-label">To Date</label>
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate || undefined}
                placeholderText="dd-mm-yyyy"
                className="filter-input"
                dateFormat="dd-MM-yyyy"
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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
              </select>
            </div>
            <div className="filter-group">
              <label className="filter-label">Risk Level</label>
              <select
                className="filter-input"
                value={riskLevelFilter}
                onChange={(e) => setRiskLevelFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="filter-group">
              <button
                type="button"
                className="filter-input"
                onClick={() => {
                  setStartDate(null);
                  setEndDate(null);
                  setStatusFilter('all');
                  setRiskLevelFilter('all');
                }}
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Scrollable Table Container for Storage Management */}
        <div className="storage-table-container">
          <Table
            columns={allocationColumns}
            data={filteredActiveAllocations}
            disableInternalPagination={false}
          />
        </div>
      </div>
      
    </div>
  );
};

export default StorageAllocation;