import React, { useState, useEffect } from 'react';
import { formatPhoneNumber, getPhoneNumberError } from '../utils/validation';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  label?: string;
  showError?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  placeholder = "Enter 10-digit phone number",
  required = false,
  className = "form-input",
  id,
  name,
  label,
  showError = true
}) => {
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  // Validate on value change
  useEffect(() => {
    if (touched || value) {
      const errorMessage = getPhoneNumberError(value);
      setError(errorMessage);
    }
  }, [value, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatPhoneNumber(inputValue);
    onChange(formatted);
  };

  const handleBlur = () => {
    setTouched(true);
    const errorMessage = getPhoneNumberError(value);
    setError(errorMessage);
  };

  const inputClassName = `${className} ${error && touched ? 'error' : ''}`;

  return (
    <div className="phone-input-wrapper" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label} {required && <span className="required" style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}
      <input
        type="tel"
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={inputClassName}
        maxLength={10}
        pattern="[0-9]{10}"
        title="Please enter exactly 10 digits"
        required={required}
      />
      {showError && error && touched && (
        <div className="error-message" style={{ color: '#ef4444', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {error}
        </div>
      )}
      <div className="phone-input-hint" style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
        {value.length}/10 digits
      </div>
    </div>
  );
};

export default PhoneInput;