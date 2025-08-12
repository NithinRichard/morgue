import React from 'react';
import '../styles/form.css';

interface InputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  width?: string | number;
  name?: string;
  id?: string;
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  noWrapper?: boolean; // Option to render without form-group wrapper
  error?: string; // Error message to display
  showError?: boolean; // Whether to show the error
}

const Input: React.FC<InputProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text', 
  width,
  name,
  id,
  required,
  readOnly,
  disabled,
  onBlur,
  onClick,
  style,
  className,
  noWrapper = false,
  error,
  showError = false
}) => {
  const inputElement = (
    <input
      className={className || "form-input"}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      name={name}
      id={id}
      required={required}
      readOnly={readOnly}
      disabled={disabled}
      onBlur={onBlur}
      onClick={onClick}
      style={width ? { width, ...style } : style}
    />
  );

  if (noWrapper) {
    return inputElement;
  }

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
        {required && <span className="required"> *</span>}
      </label>
      {inputElement}
      {showError && error && (
        <div style={{ 
          fontSize: '0.875rem', 
          color: '#dc2626', 
          marginTop: '0.25rem',
          fontWeight: '500'
        }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;