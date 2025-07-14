import React from 'react';
import { FaTrash } from 'react-icons/fa';
import '../styles/DeleteButton.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';


interface DeleteButtonProps {
  onClick: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ 
  onClick, 
  size = 14,
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      className={`delete-button ${className}`}
      aria-label="Delete"
    >
     <FontAwesomeIcon icon={faTrash} style={{ color: "#ffffff", fontSize: size }} />
    </button>
  );
};

export default DeleteButton;