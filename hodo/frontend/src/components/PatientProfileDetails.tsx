import React from 'react';
import '../styles/PatientProfileDetails.css';

interface PatientProfileDetailsProps {
  patient: {
    // Existing fields
    id?: string;
    name?: string;
    age?: string;
    gender?: string;
    contactNumber?: string;
    email?: string;
    tokenNo?: string;
    patientType?: string;
    address?: string;
    bloodGroup?: string;
    visitId?: string;
    uhid?: string;
    civilIds?: string;

    // Additional body details to display
    status?: string;
    riskLevel?: string;
    storageUnit?: string;
    incidentType?: string;
    timeOfDeath?: string;
    dateOfDeath?: string;
    placeOfDeath?: string;
    mlcCase?: boolean;
    policeInvolved?: boolean;
    notes?: string;
    tagNumber?: string;
    registeredBy?: string;
    registrationDate?: string;
    belongings?: string[];
    accompanyingPersons?: { name: string; contact: string; }[];
  };
  onEdit?: () => void;
}

const PatientProfileDetails: React.FC<PatientProfileDetailsProps> = ({ patient }) => {
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names[0] ? names[0].charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="patient-profile-card">
      <div className="profile-main">
        <div className="profile-avatar">
          <span>{getInitials(patient.name)}</span>
        </div>
        <div className="profile-details-columns">
          {/* Column 1 */}
          <div className="profile-column">
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <span className="detail-value link">{patient.name || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Age & Gender</span>
              <span className="detail-value bold">{`${patient.age || ''} yrs, ${patient.gender || ''}`}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Date & Time of Death</span>
              <span className="detail-value">{`${patient.dateOfDeath || ''} ${patient.timeOfDeath || ''}`}</span>
            </div>
          </div>

          {/* Column 2 */}
          <div className="profile-column">
            <div className="detail-item">
              <span className="detail-label">Phone Number</span>
              <span className="detail-value">{patient.contactNumber || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Patient Type</span>
              <span className="detail-value bold">{patient.patientType || '-'}</span>
            </div>
             <div className="detail-item">
              <span className="detail-label">Place of Death</span>
              <span className="detail-value">{patient.placeOfDeath || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">UHID</span>
              <span className="detail-value">{patient.uhid || '-'}</span>
            </div>
          </div>

          {/* Column 3 */}
          <div className="profile-column">
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{patient.email || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address</span>
              <span className="detail-value bold">{patient.address || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Incident Type</span>
              <span className="detail-value">{patient.incidentType || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Civil IDs</span>
              <span className="detail-value">{patient.civilIds || '-'}</span>
            </div>
          </div>

          {/* Column 4 */}
          <div className="profile-column">
            <div className="detail-item">
              <span className="detail-label">Token No</span>
              <span className="detail-value">{patient.tokenNo || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Blood Group</span>
              <span className="detail-value bold">{patient.bloodGroup || '-'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Storage Unit</span>
              <span className="detail-value">{patient.storageUnit || '-'}</span>
            </div>
             <div className="detail-item">
              <span className="detail-label">Risk Level</span>
              <span className="detail-value">{patient.riskLevel || '-'}</span>
            </div>
          </div>
        </div>
      </div>
      {/* The secondary details row below is being removed */}
    </div>
  );
};

export default PatientProfileDetails;
