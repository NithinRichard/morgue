import React, { useState, useEffect } from 'react';
import '../styles/storage.css';

interface Body {
  id: string;
  name: string;
  storageUnit: string;
  status: string;
  riskLevel: string;
}

interface StorageAllocation {
  id: string;
  bodyId: string;
  storageUnitId: string;
  storageUnitCode: string;
  allocatedBy: string;
  status: number;
  temperatureRequired: number;
  priorityLevel: string;
}

interface StorageUnitDisplayProps {
  selectedUnit: string;
  onUnitSelect: (unitId: string) => void;
  allocations: StorageAllocation[];
}

const StorageUnitDisplay: React.FC<StorageUnitDisplayProps> = ({ 
  selectedUnit, 
  onUnitSelect, 
  allocations 
}) => {
  const totalUnits = 30;
  // Only consider bodies that are not released as occupying storage units
  const occupiedUnits = new Set(
    (allocations || [])
      .filter(allocation => allocation?.status && allocation.status.toLowerCase() !== 'released')
      .map(allocation => allocation.storageUnitCode)
      .filter(Boolean) // Ensure we only have valid unit codes
  );

  const storageUnits = Array.from({ length: totalUnits }, (_, i) => {
    const unitNumber = `F-${String(i + 1).padStart(2, '0')}`;
    const isOccupied = occupiedUnits.has(unitNumber);
    const allocation = isOccupied ? allocations.find(a => a.storageUnitCode === unitNumber) : null;

    return {
      id: unitNumber,
      occupied: isOccupied,
      bodyId: allocation ? allocation.bodyId : null,
      allocatedBy: allocation ? allocation.allocatedBy : null,
      temperatureRequired: allocation ? allocation.temperatureRequired : null,
      priorityLevel: allocation ? allocation.priorityLevel : null,
      isSelected: selectedUnit === unitNumber
    };
  });

  const getUnitColor = (unit: any) => {
    if (unit.isSelected) return 'unit-selected';
    if (!unit.occupied) return 'unit-available';
    if (unit.priorityLevel === 'High') return 'unit-high-priority';
    if (unit.priorityLevel === 'Medium') return 'unit-medium-priority';
    return 'unit-occupied';
  };

  const getStatusText = (unit: any) => {
    if (unit.isSelected) return 'Selected';
    if (!unit.occupied) return 'Available';
    if (unit.priorityLevel === 'High') return 'High Priority';
    if (unit.priorityLevel === 'Medium') return 'Medium Priority';
    return 'Occupied';
  };

  return (
    <div className="storage-unit-display">
      <div className="storage-display-header">
        <h4>Storage Unit Selection</h4>
        <p>Click on an available unit to assign storage location</p>
        <div style={{ 
          fontSize: '0.85rem', 
          color: '#6b7280', 
          marginTop: '0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <span>Total Units: {totalUnits}</span>
          <span>Available: {totalUnits - occupiedUnits.size}</span>
          <span>Occupied: {occupiedUnits.size}</span>
        </div>
      </div>
      
      <div className="units-grid-compact">
        {storageUnits.map((unit) => (
          <div
            key={unit.id}
            onClick={() => !unit.occupied && onUnitSelect(unit.id)}
            className={`unit-box-compact ${getUnitColor(unit)}${!unit.occupied ? ' clickable' : ''}`}
            title={unit.occupied ? `Body ID: ${unit.bodyId} (${unit.priorityLevel} priority)` : `Select ${unit.id}`}
          >
            <div className="unit-center-compact">
              <p className="unit-id-compact">{unit.id}</p>
              <div className="unit-icon-compact">
                {unit.occupied ? (
                  <span role="img" aria-label="occupied">👤</span>
                ) : (
                  <span className="unit-dot-compact"></span>
                )}
              </div>
              <p className="unit-status-compact">{getStatusText(unit)}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="unit-legend-compact">
        <div className="legend-item">
          <span className="legend-dot unit-available"></span>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot unit-selected"></span>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot unit-occupied"></span>
          <span>Occupied</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot unit-medium-risk"></span>
          <span>Medium Risk</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot unit-high-risk"></span>
          <span>High Risk</span>
        </div>
      </div>
      
      {selectedUnit && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#0c4a6e'
        }}>
          <strong>Selected Unit: {selectedUnit}</strong>
          <br />
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Click "Register Body" to confirm this selection
          </span>
        </div>
      )}
    </div>
  );
};

export default StorageUnitDisplay;