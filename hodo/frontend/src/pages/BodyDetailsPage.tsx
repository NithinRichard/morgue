import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import PatientProfileDetails from '../components/PatientProfileDetails';
import EditModal from '../components/EditModal';
import * as Yup from 'yup';
import ButtonWithGradient from '../components/ButtonWithGradient';

const BodyDetailsPage: React.FC<{ sidebarCollapsed: boolean; toggleSidebar: () => void }> = ({ sidebarCollapsed, toggleSidebar }) => {
  const { id } = useParams<{ id: string }>();
  const [body, setBody] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationForm, setVerificationForm] = useState({
    name: '',
    relation: '',
    contact: '',
    idProof: '',
    remarks: ''
  });
  const [verifying, setVerifying] = useState(false);

  // Storage unit options (static for now, could be dynamic)
  const totalUnits = 30;
  const allUnits = Array.from({ length: totalUnits }, (_, i) => `F-${String(i + 1).padStart(2, '0')}`);
  const storageUnitOptions = allUnits.map(unit => ({ value: unit, label: unit }));

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

  const fetchBody = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // First try to fetch the specific body
      let res = await fetch(`http://192.168.50.126:3001/api/bodies/${id}`);
      let data;
      
      if (!res.ok && res.status === 404) {
        // Fallback: fetch all bodies and find the one with matching ID
        console.log('Individual body endpoint returned 404, trying fallback method...');
        const allBodiesRes = await fetch('http://192.168.50.126:3001/api/bodies');
        if (!allBodiesRes.ok) {
          throw new Error(`Failed to fetch bodies list: ${allBodiesRes.status} ${allBodiesRes.statusText}`);
        }
        const allBodies = await allBodiesRes.json();
        const foundBody = allBodies.find((body: any) => body.id == id); // Use == to handle string/number comparison
        
        if (!foundBody) {
          throw new Error(`Body with ID "${id}" was not found. It may have been deleted or the ID may be incorrect.`);
        }
        data = foundBody;
        console.log('Found body using fallback method:', data);
      } else if (!res.ok) {
        throw new Error(`Failed to fetch body details: ${res.status} ${res.statusText}`);
      } else {
        data = await res.json();
        console.log('Fetched body data directly:', data);
      }
      
      setBody(data);
    } catch (err: any) {
      console.error('Error fetching body:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBody();
    // eslint-disable-next-line
  }, [id]);

  const handleEditSubmit = async (values: any) => {
    if (!id) return;
    setEditLoading(true);
    try {
      const response = await fetch(`http://192.168.50.126:3001/api/bodies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!response.ok) throw new Error('Failed to update body');
      setShowEditModal(false);
      await fetchBody();
    } catch (error) {
      alert('Failed to update body.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setVerifying(true);
    try {
      const response = await fetch(`http://192.168.50.126:3001/api/bodies/${id}/verify-log`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verificationForm)
      });
      if (!response.ok) throw new Error('Verification failed');
      setShowVerificationModal(false);
      setVerificationForm({ name: '', relation: '', contact: '', idProof: '', remarks: '' });
      await fetchBody();
    } catch (error) {
      alert('Failed to verify body.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime />
      <PageContainer>
        <SectionHeading title="Death Profile" subtitle="Death record details" />
        {loading && (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            fontSize: '16px',
            color: '#666'
          }}>
            Loading body details...
          </div>
        )}
        {error && (
          <div style={{ 
            padding: '40px 20px',
            textAlign: 'center',
            border: '1px solid #ff6b6b',
            borderRadius: '8px',
            backgroundColor: '#ffe0e0',
            color: '#cc0000',
            margin: '20px 0'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#cc0000' }}>Error Loading Body Details</h3>
            <p style={{ margin: '0 0 20px 0', lineHeight: '1.5' }}>{error}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <ButtonWithGradient
                text="Go Back to Bodies List"
                onClick={() => window.history.back()}
                type="button"
              />
              <ButtonWithGradient
                text="Try Again"
                onClick={() => fetchBody()}
                type="button"
              />
            </div>
          </div>
        )}
        {body && (
          <PatientProfileDetails
            patient={{
              // Core Info
              id: body.id,
              name: body.name || 'Unknown',
              contactNumber: body.contactNumber || '-',
              
              // Details from the new layout (and more)
              doctorName: body.doctorName || '-',
              ipNo: body.ipNo || '-',
              date: body.dateOfDeath ? new Date(body.dateOfDeath).toLocaleDateString('en-CA') : '-',
              gender: body.gender || '-',
              causeOfDeath: body.causeOfDeath || '-',
              type: body.incidentType || '-', // Mapped from incidentType
              postmortemDone: typeof body.postmortemDone === 'boolean' ? (body.postmortemDone ? 'Yes' : 'No') : '-',
              pathologistName: body.pathologistName || '-',
              placeOfDeath: body.placeOfDeath || '-',
              
              // Contact and Relatives
              contactPerson: body.contactPerson || '-',
              address: body.address || '-',
              relatives: body.relatives || [],

              // Other existing fields
              age: body.age || '-',
              timeOfDeath: body.timeOfDeath || '-',
              belongings: Array.isArray(body.belongings) ? body.belongings.join(', ') : (body.belongings || '-'),
              accompanyingPersons: Array.isArray(body.accompanyingPersons) ? body.accompanyingPersons.map((p: any) => `${p.name || ''} (${p.contact || ''})`).join(', ') : (body.accompanyingPersons || '-'),
              mlcCase: typeof body.mlcCase === 'boolean' ? (body.mlcCase ? 'Yes' : 'No') : '-',
              policeInvolved: typeof body.policeInvolved === 'boolean' ? (body.policeInvolved ? 'Yes' : 'No') : '-',
              status: body.status || '-',
              storageLocation: body.storageLocation || '-',
              registeredBy: body.registeredBy || '-',
              registrationDate: body.registrationDate ? new Date(body.registrationDate).toLocaleString() : '-',
              storageUnit: body.storageUnit || '-',
              riskLevel: body.riskLevel || '-',
              incidentType: body.incidentType || '-',
              notes: body.notes || '-',
              tokenNo: body.tagNumber || body.id || '-',
            }}
            onEdit={() => setShowEditModal(true)}
          />
        )}
        <EditModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          data={body}
          formConfig={bodyFormConfig}
          onSubmit={handleEditSubmit}
          loading={editLoading}
          title="Edit Body"
        />
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
                  <label className="labelPatientDetails">Relation to Deceased</label>
                  <input
                    className="form-input"
                    type="text"
                    value={verificationForm.relation}
                    onChange={e => setVerificationForm(f => ({ ...f, relation: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="labelPatientDetails">Contact Number</label>
                  <input
                    className="form-input"
                    type="tel"
                    value={verificationForm.contact}
                    onChange={e => setVerificationForm(f => ({ ...f, contact: e.target.value }))}
                    required
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
            </div>
          </div>
        )}
      </PageContainer>
      <Footer />
    </>
  );
};

export default BodyDetailsPage; 