import React from 'react';
import '../styles/form.css';

interface AddInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  width?: string | number;
}

const AddInput: React.FC<AddInputProps> = ({ label, value, onChange, placeholder, width }) => (
  <div className="addinput-container">
    <label className="addinput-label">{label}</label>
    <textarea
      className="addinput-textarea"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      style={width ? { width } : {}}
    />
  </div>
);

export default AddInput; 