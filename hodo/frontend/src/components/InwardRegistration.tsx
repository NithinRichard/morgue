import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/inward.css';
import ButtonWithGradient from './ButtonWithGradient';
import StorageUnitDisplay from './StorageUnitDisplay';
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
}

interface Discharge {
  id: string;
  patientId: string;
  patientName: string;
  age: string;
  gender: string;
  admissionDate: string;
  dischargeDate: string;
  ward: string;
  diagnosis: string;
  dischargeStatus: string;
  contactPerson: string;
  contactNumber: string;
  address: string;
  mlcCase: boolean;
  policeInvolved: boolean;
  notes: string;
  dischargedBy: string;
  dischargeTime: string;
}

const InwardRegistration: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    dateOfDeath: new Date().toISOString().split('T')[0],
    placeOfDeath: '',
    timeOfDeath: new Date().toTimeString().substring(0, 5),
    address: '',
    contactPerson: '',
    contactNumber: '',
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
    fromDischarge: false,
    dischargeId: '',
  });

  const [availableUnits, setAvailableUnits] = useState<string[]>([]);
  const [discharges, setDischarges] = useState<Discharge[]>([]);
  const [selectedDischarge, setSelectedDischarge] = useState<string>('');
  const [bodies, setBodies] = useState<Body[]>([]);
  const [showStorageUnitGrid, setShowStorageUnitGrid] = useState(false);
  const [showStorageModal, setShowStorageModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bodies
        const bodiesResponse = await fetch('http://192.168.50.124:3001/api/bodies');
        const bodiesData: Body[] = await bodiesResponse.json();
        setBodies(bodiesData);
        
        // Calculate available units
        const occupiedUnits = new Set(bodiesData.map(body => body.storageUnit));
        const allUnits = Array.from({ length: 30 }, (_, i) => `F-${String(i + 1).padStart(2, '0')}`);
        const available = allUnits.filter(unit => !occupiedUnits.has(unit));
        setAvailableUnits(available);
        if (available.length > 0) {
          setFormData(prev => ({ ...prev, storageUnit: available[0] }));
        }

        // Fetch discharges
        const dischargesResponse = await fetch('http://192.168.50.124:3001/api/discharges');
        const dischargesData: Discharge[] = await dischargesResponse.json();
        setDischarges(dischargesData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  const addBelonging = () => {
    setFormData(prev => ({
      ...prev,
      belongings: [...prev.belongings, '']
    }));
  };

  const removeBelonging = (index: number) => {
    const newBelongings = [...formData.belongings];
    newBelongings.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      belongings: newBelongings
    }));
    
  };

  const handleBelongingChange = (index: number, value: string) => {
    const newBelongings = [...formData.belongings];
    newBelongings[index] = value;
    setFormData(prev => ({
      ...prev,
      belongings: newBelongings
    }));
  };

  const addAccompanyingPerson = () => {
    setFormData(prev => ({
      ...prev,
      accompanyingPersons: [...prev.accompanyingPersons, { name: '', contact: '' }]
    }));
  };

  const removeAccompanyingPerson = (index: number) => {
    const newPersons = [...formData.accompanyingPersons];
    newPersons.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      accompanyingPersons: newPersons
      
    }));
    
  };

  const handlePersonChange = (index: number, field: string, value: string) => {
    const newPersons = [...formData.accompanyingPersons];
    newPersons[index] = { ...newPersons[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      accompanyingPersons: newPersons
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDischargeSelect = (dischargeId: string) => {
    setSelectedDischarge(dischargeId);
    const selectedDischargeData = discharges.find(d => d.id === dischargeId);
    
    if (selectedDischargeData) {
      setFormData(prev => ({
        ...prev,
        name: selectedDischargeData.patientName,
        age: selectedDischargeData.age,
        gender: selectedDischargeData.gender,
        contactPerson: selectedDischargeData.contactPerson,
        contactNumber: selectedDischargeData.contactNumber,
        address: selectedDischargeData.address,
        mlcCase: selectedDischargeData.mlcCase,
        policeInvolved: selectedDischargeData.policeInvolved,
        notes: selectedDischargeData.notes,
        dateOfDeath: selectedDischargeData.dischargeDate,
        timeOfDeath: new Date(selectedDischargeData.dischargeTime).toISOString().substring(0, 16),
        incidentType: selectedDischargeData.diagnosis.toLowerCase().includes('accident') ? 'accident' : 
                     selectedDischargeData.diagnosis.toLowerCase().includes('suicide') ? 'suicide' : 
                     selectedDischargeData.diagnosis.toLowerCase().includes('homicide') ? 'homicide' : 'natural',
        fromDischarge: true,
        dischargeId: dischargeId
      }));
    }
  };

  const handleUnitSelect = (unitId: string) => {
    setFormData(prev => ({ ...prev, storageUnit: unitId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
              const response = await fetch('http://192.168.50.124:3001/api/bodies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to register body');
      }

      toast.success("Body registered successfully!")
      // toast.success('Body registered successfully!');
      navigate('/bodies'); // Navigate to bodies page after success
    } catch (error) {
      console.error('Registration failed:', error);
      // alert('Registration failed. Please try again.');
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
              {/* Restore Discharge Records Dropdown */}
              <div className="form-group full-width">
                <label className="form-label">Select from Discharge Records (Optional)</label>
                <select
                  className="form-select"
                  value={selectedDischarge}
                  onChange={(e) => handleDischargeSelect(e.target.value)}
                >
                  <option value="">Select a deceased patient from discharge records</option>
                  {discharges.map((discharge) => (
                    <option key={discharge.id} value={discharge.id}>
                      {discharge.patientName} - {discharge.age} years, {discharge.gender} - {discharge.diagnosis}
                    </option>
                  ))}
                </select>
                <small className="form-help-text">
                  Selecting a discharge record will auto-fill the form with patient information
                </small>
              </div>
              {/* Storage Unit Selection Toggle */}
              <div className="form-group">
                <label className="form-label">Storage Unit</label>
                <input
                  className="form-input"
                  value={formData.storageUnit}
                  readOnly
                  placeholder="Select Storage Unit"
                  onClick={() => setShowStorageModal(true)}
                  style={{ cursor: "pointer", background: "#f9fafb" }}
                />
              </div>
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
                      bodies={bodies}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name" className="form-label">Full Name </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  readOnly={formData.fromDischarge}
                />
              </div>

              <div className="form-group">
                <label htmlFor="age" className="form-label">Age</label>
                <input
                  id="age"
                  type="number"
                  name="age"
                  className="form-input"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter age"
                  readOnly={formData.fromDischarge}
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender" className="form-label">Gender </label>
                <select
                  id="gender"
                  name="gender"
                  className="form-select"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  disabled={formData.fromDischarge}
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="dateOfDeath" className="form-label">Date of Death </label>
                <input
                  id="dateOfDeath"
                  type="date"
                  name="dateOfDeath"
                  className="form-input"
                  value={formData.dateOfDeath}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="placeOfDeath" className="form-label">Place/Cause of Death</label>
                <input
                  id="placeOfDeath"
                  type="text"
                  name="placeOfDeath"
                  className="form-input"
                  value={formData.placeOfDeath}
                  onChange={handleChange}
                  placeholder="Enter place or cause of death"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="timeOfDeath" className="form-label">Time of Death </label>
                <input
                  id="timeOfDeath"
                  type="datetime-local"
                  name="timeOfDeath"
                  className="form-input"
                  value={formData.timeOfDeath}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPerson" className="form-label">Contact Person </label>
                <input
                  id="contactPerson"
                  type="text"
                  name="contactPerson"
                  className="form-input"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  placeholder="Contact person's name"
                  required
                  readOnly={formData.fromDischarge}
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactNumber" className="form-label">Contact Number </label>
                <input
                  id="contactNumber"
                  type="tel"
                  name="contactNumber"
                  className="form-input"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="Contact number"
                  required
                  readOnly={formData.fromDischarge}
                />
              </div>

              <div className="form-group">
                <label htmlFor="incidentType" className="form-label">Incident Type </label>
                <select
                  id="incidentType"
                  name="incidentType"
                  className="form-select"
                  value={formData.incidentType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select incident type</option>
                  <option value="natural">Natural Death</option>
                  <option value="accident">Accident</option>
                  <option value="suicide">Suicide</option>
                  <option value="homicide">Homicide</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>

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
                  readOnly={formData.fromDischarge}
                />
              </div>

              {formData.fromDischarge && (
                <div className="form-help-text" style={{ color: '#b91c1c' }}>
                  These details are imported from the discharge record and cannot be edited.
                </div>
              )}

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

              <div className="form-group">
                <label htmlFor="riskLevel" className="form-label">Risk Level</label>
                <select
                  id="riskLevel"
                  name="riskLevel"
                  className="form-select"
                  value={formData.riskLevel}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Belongings</label>
              <div className="belongings-list">
                {formData.belongings.map((belonging, index) => (
                  <div key={index} className="belonging-item">
                    <input
                      type="text"
                      className="form-input"
                      value={belonging}
                      onChange={(e) => handleBelongingChange(index, e.target.value)}
                      placeholder="Describe belonging item"
                    />
                    {formData.belongings.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeBelonging(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-btn" onClick={addBelonging}>
                  + Add Belonging
                </button>
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Accompanying Persons</label>
              <div className="persons-list">
                {formData.accompanyingPersons.map((person, index) => (
                  <div key={index} className="person-item">
                    <input
                      type="text"
                      className="form-input"
                      value={person.name}
                      onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
                      placeholder="Name"
                    />
                    <input
                      type="tel"
                      className="form-input"
                      value={person.contact}
                      onChange={(e) => handlePersonChange(index, 'contact', e.target.value)}
                      placeholder="Contact number"
                    />
                    {formData.accompanyingPersons.length > 1 && (
                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() => removeAccompanyingPerson(index)}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="add-btn" onClick={addAccompanyingPerson}>
                  + Add Person
                </button>
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
        // onClick={() => alert('Hello!')}
        type="submit"
      >
         </ButtonWithGradient>

            
              
          
          </form>
        </div>
      </div>
    </div>
  );
};

export default InwardRegistration; 