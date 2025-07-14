import React, { useState, useEffect } from 'react';
import '../styles/storage.css';

interface Body {
  id: string;
  name: string;
  storageUnit: string;
  status: string;
  riskLevel: string;
}

interface StorageUnitDisplayProps {
  selectedUnit: string;
  onUnitSelect: (unitId: string) => void;
  bodies: Body[];
}

const StorageUnitDisplay: React.FC<StorageUnitDisplayProps> = ({ 
  selectedUnit, 
  onUnitSelect, 
  bodies 
}) => {
  const totalUnits = 30;
  const occupiedUnits = new Set(bodies.map(body => body.storageUnit));

  const storageUnits = Array.from({ length: totalUnits }, (_, i) => {
    const unitNumber = `F-${String(i + 1).padStart(2, '0')}`;
    const isOccupied = occupiedUnits.has(unitNumber);
    const body = isOccupied ? bodies.find(b => b.storageUnit === unitNumber) : null;

    return {
      id: unitNumber,
      occupied: isOccupied,
      bodyId: body ? body.id : null,
      bodyName: body ? body.name : null,
      riskLevel: body ? body.riskLevel : null,
      isSelected: selectedUnit === unitNumber
    };
  });

  const getUnitColor = (unit: any) => {
    if (unit.isSelected) return 'unit-selected';
    if (!unit.occupied) return 'unit-available';
    if (unit.riskLevel === 'high') return 'unit-high-risk';
    if (unit.riskLevel === 'medium') return 'unit-medium-risk';
    return 'unit-occupied';
  };

  const getStatusText = (unit: any) => {
    if (unit.isSelected) return 'Selected';
    if (!unit.occupied) return 'Available';
    if (unit.riskLevel === 'high') return 'High Risk';
    if (unit.riskLevel === 'medium') return 'Medium Risk';
    return 'Occupied';
  };

  return (
    <div className="storage-unit-display">
      <div className="storage-display-header">
        <h4>Storage Unit Selection</h4>
        <p>Click on an available unit to assign storage location</p>
      </div>
      
      <div className="units-grid-compact">
        {storageUnits.map((unit) => (
          <div
            key={unit.id}
            onClick={() => !unit.occupied && onUnitSelect(unit.id)}
            className={`unit-box-compact ${getUnitColor(unit)}${!unit.occupied ? ' clickable' : ''}`}
            title={unit.occupied ? `${unit.bodyName} (${unit.riskLevel} risk)` : `Select ${unit.id}`}
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
        <div className="legend-item"><span className="legend-dot unit-available"></span>Available</div>
        <div className="legend-item"><span className="legend-dot unit-selected"></span>Selected</div>
        <div className="legend-item"><span className="legend-dot unit-occupied"></span>Occupied</div>
        <div className="legend-item"><span className="legend-dot unit-medium-risk"></span>Medium Risk</div>
        <div className="legend-item"><span className="legend-dot unit-high-risk"></span>High Risk</div>
      </div>
    </div>
  );
};

export default StorageUnitDisplay; 