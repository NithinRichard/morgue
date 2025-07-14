import React from 'react';
import '../styles/EditButton.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

interface EditButtonProps {
  onClick: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
}

const EditButton: React.FC<EditButtonProps> = ({ 
  onClick, 
  size = 14,
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`edit-button ${className}`}
      aria-label="Edit"
    >
     <FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: size }} />
    </button>
  );
};

export default EditButton;