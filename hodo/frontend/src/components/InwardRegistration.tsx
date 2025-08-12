import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/inward.css';
import '../styles/form.css';
import ButtonWithGradient from './ButtonWithGradient';
import StorageUnitDisplay from './StorageUnitDisplay';
import Input from './Input';
import Select from './Select';
import { toast } from 'react-toastify';

interface Body {
  id: string;
  name: string;
  timeOfDeath: string;
  status: string;
  riskLevel: string;
  storageUnit: string;
  incidentType: string;
  verifiedBy?: string | null;
  belongings: string[];
  accompanyingPersons: Array<{ name: string; contact: string }>;
}

interface ExpiredPatient {
  id: string;
  name: string;
  firstName: string;
  middleName: string;
  lastName: string;
  dateOfBirth: string;
  age: string;
  gender: string;
  idNumber: string;
  occupation: string;
  maritalStatus: string;
  parentOrSpouse: string;
  contactNumber: string;
  address: string;
  admissionId: string;
  dischargeDate: string;
}

interface FormData {
  name: string;
  age: string;
  gender: string;
  placeOfDeath: string;
  timeOfDeath: string;
  address: string;
  contactPerson: string;
  incidentType: string;
  notes: string;
  belongings: string[];
  accompanyingPersons: Array<{ name: string; contact: string }>;
  mlcCase: boolean;
  policeInvolved: boolean;
  status: string;
  storageLocation: string;
  registeredBy: string;
  registrationDate: string;
  storageUnit: string;
  riskLevel: string;
  patientId: string | null;
  fromDischarge?: boolean;
  dischargeId?: string;
}

const InwardRegistration: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    gender: '',
    placeOfDeath: '',
    timeOfDeath: new Date().toISOString().slice(0, 16),
    address: '',
    contactPerson: '',
    incidentType: '',
    notes: '',
    belongings: [''],
    accompanyingPersons: [{ name: '', contact: '' }],
    mlcCase: false,
    policeInvolved: false,
    status: 'pending',
    storageLocation: 'Morgue A',
    registeredBy: 'Staff',
    registrationDate: new Date().toISOString(),
    storageUnit: '',
    riskLevel: 'low',
    patientId: null,
  });

  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const [expiredPatients, setExpiredPatients] = useState<ExpiredPatient[]>([]);
  const [selectedExpiredPatient, setSelectedExpiredPatient] = useState<string>('');
  const [bodies, setBodies] = useState<Body[]>([]);
  const [storageAllocations, setStorageAllocations] = useState<any[]>([]);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showExpiredPatientsModal, setShowExpiredPatientsModal] = useState(false);
  const [expiredPatientSearch, setExpiredPatientSearch] = useState('');
  const [selectedExpiredPatientData, setSelectedExpiredPatientData] = useState<ExpiredPatient | null>(null);

  const [touchedFields, setTouchedFields] = useState<{ [key: string]: boolean }>({
    storageUnit: false,
    name: false,
    gender: false,
    timeOfDeath: false,
    placeOfDeath: false,
    contactPerson: false,
    incidentType: false
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch storage allocations
        const allocationsResponse = await fetch('http://192.168.50.126:3001/api/storage-allocations');
        const allocationsData = allocationsResponse.ok ? await allocationsResponse.json() : [];
        setStorageAllocations(Array.isArray(allocationsData) ? allocationsData : []);

        // Calculate available units
        const occupiedUnits = new Set(allocationsData
          .filter((allocation: any) => allocation.status && allocation.status.toLowerCase() !== 'released')
          .map((allocation: any) => allocation.storageUnitId)
          .filter(Boolean)
        );
        const allUnits = Array.from({ length: 30 }, (_, i) => `F-${String(i + 1).padStart(2, '0')}`);
        const available = allUnits.filter(unit => !occupiedUnits.has(unit));
        setAvailableUnits(available);

        // Fetch expired patients
        const expiredPatientsResponse = await fetch('http://192.168.50.126:3001/api/expired-patients');
        if (expiredPatientsResponse.ok) {
          const expiredPatientsData = await expiredPatientsResponse.json();
          setExpiredPatients(Array.isArray(expiredPatientsData) ? expiredPatientsData : []);
          console.log('Fetched expired patients:', expiredPatientsData);
        } else {
          console.error('Failed to fetch expired patients:', expiredPatientsResponse.status);
          setExpiredPatients([]);
        }

        console.log('Fetched storage allocations:', allocationsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error('Failed to load data. Please try again.');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleExpiredPatientSelect = (patient: ExpiredPatient) => {
    setSelectedExpiredPatient(patient.id);
    setSelectedExpiredPatientData(patient);

    const dischargeDate = patient.dischargeDate
      ? new Date(patient.dischargeDate)
      : new Date();

    const timeOfDeath = dischargeDate.toISOString().slice(0, 16);

    // Map gender from database format to form format
    const mapGender = (gender: string) => {
      if (!gender) return '';
      const genderLower = gender.toLowerCase();
      if (genderLower.includes('male') && !genderLower.includes('female')) return 'male';
      if (genderLower.includes('female')) return 'female';
      if (genderLower.includes('other') || genderLower.includes('transgender')) return 'other';
      return '';
    };

    setFormData(prev => ({
      ...prev,
      name: patient.name || 'Unknown',
      age: String(patient.age),
      gender: mapGender(patient.gender),
      contactPerson: patient.parentOrSpouse || 'N/A',
      address: patient.address || 'N/A',
      timeOfDeath,
      notes: `Expired patient - ${patient.name || 'Unknown'} (${patient.age} years, ${patient.gender || 'Unknown'})`,
      patientId: patient.id
    }));

    setShowExpiredPatientsModal(false);
  };

  const filteredExpiredPatients = expiredPatients.filter(patient => {
    if (!expiredPatientSearch) return true;
    const searchLower = expiredPatientSearch.toLowerCase();

    // Safely convert values to strings and handle null/undefined
    const name = (patient?.name || '').toString().toLowerCase();
    const id = (patient?.id || '').toString().toLowerCase();
    const age = (patient?.age || '').toString().toLowerCase();
    const gender = (patient?.gender || '').toString().toLowerCase();
    const admissionId = (patient?.admissionId || '').toString().toLowerCase();

    return (
      name.includes(searchLower) ||
      id.includes(searchLower) ||
      age.includes(searchLower) ||
      gender.includes(searchLower) ||
      admissionId.includes(searchLower)
    );
  });

  const handleStorageUnitClick = () => {
    setTouchedFields(prev => ({ ...prev, storageUnit: true }));
    setShowStorageModal(true);
  };

  const shouldShowError = (fieldName: string, value: any) => {
    return touchedFields[fieldName] && (!value || String(value).trim() === '');
  };

  const getErrorMessage = (fieldName: string) => {
    const errorMessages: { [key: string]: string } = {
      storageUnit: 'Storage unit selection is mandatory',
      name: 'Full name is mandatory',
      gender: 'Gender selection is mandatory',
      timeOfDeath: 'Date & time of death is mandatory',
      placeOfDeath: 'Place/cause of death is mandatory',
      contactPerson: 'Contact person is mandatory',
      incidentType: 'Incident type selection is mandatory'
    };
    return errorMessages[fieldName] || 'This field is mandatory';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouchedFields({
      storageUnit: true,
      name: true,
      gender: true,
      timeOfDeath: true,
      placeOfDeath: true,
      contactPerson: true,
      incidentType: true
    });

    const requiredFields = [
      { field: 'storageUnit', message: 'Storage unit selection is mandatory' },
      { field: 'name', message: 'Full name is mandatory' },
      { field: 'gender', message: 'Gender selection is mandatory' },
      { field: 'timeOfDeath', message: 'Date & time of death is mandatory' },
      { field: 'placeOfDeath', message: 'Place/cause of death is mandatory' },
      { field: 'contactPerson', message: 'Contact person is mandatory' },
      { field: 'incidentType', message: 'Incident type selection is mandatory' }
    ];

    for (const { field, message } of requiredFields) {
      if (!formData[field as keyof FormData] || String(formData[field as keyof FormData]).trim() === '') {
        toast.error(message);
        return;
      }
    }

    try {
      const dateOfDeath = formData.timeOfDeath ? formData.timeOfDeath.split('T')[0] : '';

      const bodyData = {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        dateOfDeath: dateOfDeath,
        timeOfDeath: formData.timeOfDeath,
        placeOfDeath: formData.placeOfDeath,
        address: formData.address,
        contactPerson: formData.contactPerson,
        incidentType: formData.incidentType,
        notes: formData.notes,
        mlcCase: formData.mlcCase,
        policeInvolved: formData.policeInvolved,
        status: formData.status,
        storageUnit: formData.storageUnit,
        riskLevel: formData.riskLevel,
        patientId: formData.patientId,
        belongings: formData.belongings.filter(b => b.trim() !== ''),
        accompanyingPersons: formData.accompanyingPersons
          .filter(p => p.name.trim() !== '' || p.contact.trim() !== '')
      };

      const response = await fetch('http://192.168.50.126:3001/api/bodies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to register body');
      }

      const result = await response.json();
      toast.success("Body registered successfully!");
      navigate('/bodies');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <div className="inward-container">
      <div className="inward-card">
        <div className="card-header">
          <h3 className="card-title">Body Registration Form</h3>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="inward-form">
            <div className="form-grid">
              {/* Expired Patient Selection */}
              <div className="form-group full-width">
                <label className="form-label">Select Expired Patient (Optional)</label>
                <input
                  className="form-input"
                  value={selectedExpiredPatientData ? `${selectedExpiredPatientData.name} - ${selectedExpiredPatientData.age}yrs - ${selectedExpiredPatientData.gender}` : ''}
                  readOnly
                  placeholder="Click to select from expired patients list"
                  onClick={() => setShowExpiredPatientsModal(true)}
                  style={{
                    cursor: "pointer",
                    background: "#f9fafb",
                    color: !selectedExpiredPatientData ? '#9ca3af' : '#374151'
                  }}
                />
                {selectedExpiredPatientData && (
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    marginTop: '0.25rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>Patient ID: {selectedExpiredPatientData.id} | DOB: {selectedExpiredPatientData.dateOfBirth ? new Date(selectedExpiredPatientData.dateOfBirth).toLocaleDateString() : 'N/A'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedExpiredPatient('');
                        setSelectedExpiredPatientData(null);
                        setFormData(prev => ({
                          ...prev,
                          name: '',
                          age: '',
                          gender: '',
                          contactPerson: '',
                          address: '',
                          notes: '',
                          patientId: null
                        }));
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        textDecoration: 'underline'
                      }}
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>

              {/* Storage Unit */}
              <Input
                label="Storage Unit"
                value={formData.storageUnit || ''}
                onChange={() => { }} // No-op since it's readOnly
                placeholder="Click to select storage unit (Required)"
                type="text"
                name="storageUnit"
                id="storageUnit"
                required
                readOnly
                className="form-input"
                style={{
                  cursor: "pointer",
                  background: "#f9fafb",
                  border: shouldShowError('storageUnit', formData.storageUnit) ? '2px solid #dc2626' : '2px solid #d1d5db',
                  color: !formData.storageUnit ? '#9ca3af' : '#374151'
                }}
                onClick={handleStorageUnitClick}
                error={getErrorMessage('storageUnit')}
                showError={shouldShowError('storageUnit', formData.storageUnit)}
              />

              {/* Full Name */}
              <Input
                label="Full Name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                type="text"
                name="name"
                id="name"
                required
                readOnly={!!selectedExpiredPatientData}
                onBlur={() => handleFieldBlur('name')}
                className="form-input"
                style={{
                  border: shouldShowError('name', formData.name) ? '2px solid #dc2626' : '2px solid #d1d5db',
                  backgroundColor: selectedExpiredPatientData ? '#f9fafb' : 'white',
                  cursor: selectedExpiredPatientData ? 'not-allowed' : 'text'
                }}
                error={getErrorMessage('name')}
                showError={shouldShowError('name', formData.name)}
              />

              {/* Age */}
              <Input
                label="Age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                type="number"
                name="age"
                id="age"
                readOnly={!!selectedExpiredPatientData}
                onBlur={() => handleFieldBlur('age')}
                className="form-input"
                style={{
                  border: shouldShowError('age', formData.age) ? '1px solid #dc2626' : '2px solid #d1d5db',
                  backgroundColor: selectedExpiredPatientData ? '#f9fafb' : 'white',
                  cursor: selectedExpiredPatientData ? 'not-allowed' : 'text',
               
                }}
                error={getErrorMessage('age')}
                showError={shouldShowError('age', formData.age)}
              />

              {/* Gender */}
              <Select
                label="Gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }
                ]}
                placeholder="Select gender"
                name="gender"
                id="gender"
                required
                disabled={!!selectedExpiredPatientData}
                onBlur={() => handleFieldBlur('gender')}
                className="form-select"
                style={{
                  border: shouldShowError('gender', formData.gender) ? '2px solid #dc2626' : '2px solid #d1d5db',
                  backgroundColor: selectedExpiredPatientData ? '#f9fafb' : 'white',
                  cursor: selectedExpiredPatientData ? 'not-allowed' : 'pointer'
                }}
                error={getErrorMessage('gender')}
                showError={shouldShowError('gender', formData.gender)}
              />

              {/* Date & Time of Death */}
              <Input
                label="Date & Time of Death"
                value={formData.timeOfDeath}
                onChange={handleChange}
                type="datetime-local"
                name="timeOfDeath"
                id="timeOfDeath"
                required
                readOnly={!!selectedExpiredPatientData}
                onBlur={() => handleFieldBlur('timeOfDeath')}
                className="form-input"
                style={{
                  border: shouldShowError('timeOfDeath', formData.timeOfDeath) ? '2px solid #dc2626' : '2px solid #d1d5db',
                  backgroundColor: selectedExpiredPatientData ? '#f9fafb' : 'white',
                  cursor: selectedExpiredPatientData ? 'not-allowed' : 'text'
                }}
                error={getErrorMessage('timeOfDeath')}
                showError={shouldShowError('timeOfDeath', formData.timeOfDeath)}
              />

              {/* Place/Cause of Death */}
              <Input
                label="Place/Cause of Death"
                value={formData.placeOfDeath}
                onChange={handleChange}
                placeholder="Enter place or cause of death"
                type="text"
                name="placeOfDeath"
                id="placeOfDeath"
                required
                onBlur={() => handleFieldBlur('placeOfDeath')}
                className="form-input"
                style={{
                  border: shouldShowError('placeOfDeath', formData.placeOfDeath) ? '2px solid #dc2626' : '2px solid #d1d5db'
                }}
                error={getErrorMessage('placeOfDeath')}
                showError={shouldShowError('placeOfDeath', formData.placeOfDeath)}
              />

              {/* Contact Person */}
              <Input
                label="Contact Person"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Contact person's name"
                type="text"
                name="contactPerson"
                id="contactPerson"
                required
                readOnly={!!selectedExpiredPatientData}
                onBlur={() => handleFieldBlur('contactPerson')}
                className="form-input"
                style={{
                  border: shouldShowError('contactPerson', formData.contactPerson) ? '2px solid #dc2626' : '2px solid #d1d5db',
                  backgroundColor: selectedExpiredPatientData ? '#f9fafb' : 'white',
                  cursor: selectedExpiredPatientData ? 'not-allowed' : 'text'
                }}
                error={getErrorMessage('contactPerson')}
                showError={shouldShowError('contactPerson', formData.contactPerson)}
              />

              {/* Incident Type */}
              <Select
                label="Incident Type"
                value={formData.incidentType}
                onChange={handleChange}
                options={[
                  { value: 'natural', label: 'Natural Death' },
                  { value: 'accident', label: 'Accident' },
                  { value: 'suicide', label: 'Suicide' },
                  { value: 'homicide', label: 'Homicide' },
                  { value: 'unknown', label: 'Unknown' }
                ]}
                placeholder="Select incident type"
                name="incidentType"
                id="incidentType"
                required
                onBlur={() => handleFieldBlur('incidentType')}
                className="form-select"
                style={{
                  border: shouldShowError('incidentType', formData.incidentType) ? '2px solid #dc2626' : '2px solid #d1d5db'
                }}
                error={getErrorMessage('incidentType')}
                showError={shouldShowError('incidentType', formData.incidentType)}
              />

              {/* Risk Level */}
              <Select
                label="Risk Level"
                value={formData.riskLevel}
                onChange={handleChange}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' }
                ]}
                name="riskLevel"
                id="riskLevel"
                onBlur={() => handleFieldBlur('riskLevel')}
                className="form-select"
                style={{
                  border: shouldShowError('riskLevel', formData.riskLevel) ? '2px solid #dc2626' : '2px solid #d1d5db'
                }}
                error={getErrorMessage('riskLevel')}
                showError={shouldShowError('riskLevel', formData.riskLevel)}
              />

              {/* Address */}
              <div className="form-group full-width">
                <label htmlFor="address" className="form-label">Address</label>
                <textarea
                  id="address"
                  name="address"
                  className="form-textarea"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  rows={3}
                  readOnly={!!selectedExpiredPatientData}
                  style={{
                    backgroundColor: selectedExpiredPatientData ? '#f9fafb' : 'white',
                    cursor: selectedExpiredPatientData ? 'not-allowed' : 'text'
                  }}
                />
              </div>

              {/* Notes */}
              <div className="form-group full-width">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  className="form-textarea"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Enter additional notes"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    id="mlcCase"
                    name="mlcCase"
                    className="form-checkbox"
                    checked={formData.mlcCase}
                    onChange={handleChange}
                  />
                  <span>MLC Case</span>
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    id="policeInvolved"
                    name="policeInvolved"
                    className="form-checkbox"
                    checked={formData.policeInvolved}
                    onChange={handleChange}
                  />
                  <span>Police Involved</span>
                </label>
              </div>
            </div>

            <ButtonWithGradient
              className=''
              text="Register Body"
              type="submit"
            />
          </form>
        </div>
      </div>

      {/* Storage Modal */}
      {showStorageModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowStorageModal(false)}>×</button>
            <StorageUnitDisplay
              selectedUnit={formData.storageUnit}
              onUnitSelect={unitId => {
                setFormData(prev => ({ ...prev, storageUnit: unitId }));
                setShowStorageModal(false);
              }}
              allocations={storageAllocations}
            />
          </div>
        </div>
      )}

      {/* Expired Patients Modal */}
      {showExpiredPatientsModal && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '80vh', overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              <h3 style={{ margin: 0, color: '#374151', fontSize: '1.25rem', fontWeight: '600' }}>
                Select Expired Patient ({expiredPatients.length} available)
              </h3>
              <button
                onClick={() => {
                  setShowExpiredPatientsModal(false);
                  setExpiredPatientSearch('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '0.25rem'
                }}
              >
                ×
              </button>
            </div>

            {/* Search Bar */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
              <Input
                label=""
                value={expiredPatientSearch}
                onChange={(e) => setExpiredPatientSearch(e.target.value)}
                placeholder="Search by name, ID, age, gender, or admission ID..."
                type="text"
                noWrapper={true}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
              {expiredPatientSearch && (
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  color: '#6b7280'
                }}>
                  Showing {filteredExpiredPatients.length} of {expiredPatients.length} patients
                </div>
              )}
            </div>

            {/* Patient List */}
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '0.5rem'
            }}>
              {filteredExpiredPatients.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: '#6b7280'
                }}>
                  {expiredPatientSearch ? 'No patients found matching your search.' : 'No expired patients available.'}
                </div>
              ) : (
                filteredExpiredPatients.map((patient, index) => (
                  <div
                    key={patient.id}
                    onClick={() => handleExpiredPatientSelect(patient)}
                    style={{
                      padding: '1rem',
                      margin: '0.5rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: '#ffffff'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem'
                    }}>
                      <div>
                        <h4 style={{
                          margin: 0,
                          fontSize: '1rem',
                          fontWeight: '600',
                          color: '#111827'
                        }}>
                          {patient.name || 'Unknown Name'}
                        </h4>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#6b7280',
                          marginTop: '0.25rem'
                        }}>
                          Patient ID: {patient.id} | Admission ID: {patient.admissionId || 'N/A'}
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'right',
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        #{index + 1}
                      </div>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                      gap: '0.75rem',
                      fontSize: '0.875rem'
                    }}>
                      <div>
                        <span style={{ fontWeight: '500', color: '#374151' }}>Age:</span>
                        <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                          {patient.age || 'Unknown'} years
                        </span>
                      </div>
                      <div>
                        <span style={{ fontWeight: '500', color: '#374151' }}>Gender:</span>
                        <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                          {patient.gender || 'Unknown'}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontWeight: '500', color: '#374151' }}>DOB:</span>
                        <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                          {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {(patient.parentOrSpouse || patient.occupation) && (
                      <div style={{
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid #f3f4f6',
                        fontSize: '0.875rem'
                      }}>
                        {patient.parentOrSpouse && (
                          <div style={{ marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: '500', color: '#374151' }}>Contact Person:</span>
                            <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                              {patient.parentOrSpouse}
                            </span>
                          </div>
                        )}
                        {patient.occupation && (
                          <div>
                            <span style={{ fontWeight: '500', color: '#374151' }}>Occupation:</span>
                            <span style={{ marginLeft: '0.5rem', color: '#6b7280' }}>
                              {patient.occupation}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {patient.dischargeDate && (
                      <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.75rem',
                        color: '#dc2626',
                        fontWeight: '500'
                      }}>
                        Discharge Date: {new Date(patient.dischargeDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                Click on a patient to select and auto-fill the form
              </div>
              <button
                onClick={() => {
                  setShowExpiredPatientsModal(false);
                  setExpiredPatientSearch('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InwardRegistration;