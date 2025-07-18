import React, { useState } from 'react';
import '../styles/PatientProfileDetails.css';
import ButtonWithGradient from './ButtonWithGradient';
import pencilIcon from '../assets/pencil.png';

interface PatientProfileDetailsProps {
  patient: {
    id: string;
    name: string;
    // Expanded fields
    age?: string;
    gender?: string;
    address?: string;
    contactNumber?: string;
    date?: string; // Date of Death
    timeOfDeath?: string;
    ipNo?: string;
    causeOfDeath?: string;
    type?: string; // Incident type
    postmortemDone?: string;
    pathologistName?: string;
    placeOfDeath?: string;
    doctorName?: string;
    contactPerson?: string; // First informed person
    relatives?: { name: string; relation: string; contact: string; address: string }[];
    // Other system-related fields
    status?: string;
    riskLevel?: string;
    storageUnit?: string;
    belongings?: string;
    mlcCase?: string;
    policeInvolved?: string;
    notes?: string;
    registeredBy?: string;
    registrationDate?: string;
    incidentType?: string;
    storageLocation?: string; // Added for the new card
    accompanyingPersons?: string; // Added for the new card
  };
  onEdit?: () => void;
}

const PatientProfileDetails: React.FC<PatientProfileDetailsProps> = ({
  patient,
  onEdit,
}) => {
  const getInitials = (name: string) => {
    if (!name || name === 'Unknown') return 'U';
    const names = name.split(' ');
    if (names.length > 1 && names[1]) {
      return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Helper for booleans
  const yesNo = (val: boolean | string | undefined) =>
    val === true || val === 'true' ? 'Yes' : val === false || val === 'false' ? 'No' : '-';

  // Belongings and Accompanying Persons
  const belongingsArr = Array.isArray(patient.belongings)
    ? patient.belongings.filter(Boolean)
    : typeof patient.belongings === 'string' && patient.belongings
    ? patient.belongings.split(',').map(b => b.trim()).filter(Boolean)
    : [];
  const accompanyingArr = Array.isArray(patient.accompanyingPersons)
    ? patient.accompanyingPersons.filter(p => p && (p.name || p.contact))
    : typeof patient.accompanyingPersons === 'string' && patient.accompanyingPersons
    ? patient.accompanyingPersons.split(',').map(p => ({ name: p, contact: '' }))
    : [];

  return (
    <>
      {/* Card 1: Personal/Death Details */}
      <div className="patient-profile-details-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {getInitials(patient.name)}
          </div>
          <div className="profile-name-contact">
            <h2>{patient.name}</h2>
            <p>{patient.contactNumber}</p>
          </div>
          <div className="profile-actions">
            {onEdit && (
              <button className="edit-profile-btn" onClick={onEdit}>
                <img src={pencilIcon} alt="Edit" style={{ width: 18, height: 18, marginRight: 8, verticalAlign: 'middle' }} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
        <div className="profile-grid">
          <div className="detail-item">
            <span className="detail-label">Age</span>
            <span className="detail-value">{patient.age}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Gender</span>
            <span className="detail-value">{patient.gender}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date of Death</span>
            <span className="detail-value">{patient.date}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Time of Death</span>
            <span className="detail-value">{patient.timeOfDeath}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Place/Cause of Death</span>
            <span className="detail-value">{patient.placeOfDeath}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Incident Type</span>
            <span className="detail-value">{typeof patient.incidentType !== 'undefined' ? patient.incidentType : '-'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Contact Person</span>
            <span className="detail-value">{patient.contactPerson}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Contact Number</span>
            <span className="detail-value">{patient.contactNumber}</span>
          </div>
          <div className="detail-item detail-item-full-width">
            <span className="detail-label">Address</span>
            <span className="detail-value">{patient.address}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">MLC Case</span>
            <span className="detail-value">{yesNo(patient.mlcCase)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Police Involved</span>
            <span className="detail-value">{yesNo(patient.policeInvolved)}</span>
          </div>
          <div className="detail-item detail-item-full-width">
            <span className="detail-label">Notes</span>
            <span className="detail-value">{patient.notes}</span>
          </div>
        </div>
      </div>
      {/* Card 2: Administrative/Storage Details */}
      <div className="patient-profile-details-card" style={{marginTop: 32}}>
        <div className="profile-grid">
          <div className="detail-item">
            <span className="detail-label">Storage Unit</span>
            <span className="detail-value">{patient.storageUnit}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Storage Location</span>
            <span className="detail-value">{patient.storageLocation}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Risk Level</span>
            <span className="detail-value">{patient.riskLevel}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Status</span>
            <span className="detail-value">{patient.status}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Registered By</span>
            <span className="detail-value">{patient.registeredBy}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Registration Date</span>
            <span className="detail-value">{patient.registrationDate}</span>
          </div>
          <div className="detail-item detail-item-full-width">
            <span className="detail-label">Belongings</span>
            {belongingsArr.length > 0 ? (
              <ul className="relatives-list">
                {belongingsArr.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            ) : (
              <span className="detail-value">-</span>
            )}
          </div>
          <div className="detail-item detail-item-full-width">
            <span className="detail-label">Accompanying Persons</span>
            {accompanyingArr.length > 0 ? (
              <ul className="relatives-list">
                {accompanyingArr.map((p, i) => <li key={i}>{p.name}{p.contact ? ` (${p.contact})` : ''}</li>)}
              </ul>
            ) : (
              <span className="detail-value">-</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientProfileDetails;
