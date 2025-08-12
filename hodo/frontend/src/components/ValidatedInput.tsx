import React, { useState, useEffect } from 'react';
import '../styles/form.css';

interface ValidatedInputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date' | 'time' | 'datetime-local';
  value: string | number;
  onChange: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  validator?: (value: string) => { isValid: boolean; errorMessage: string };
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  showError?: boolean;
  maxLength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  autoComplete?: string;
  id?: string;
}

const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  validator,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  error: externalError,
  showError = true,
  maxLength,
  min,
  max,
  step,
  autoComplete,
  id
}) => {
  const [internalError, setInternalError] = useState<string>('');
  const [isTouched, setIsTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const displayError = externalError || internalError;
  const hasError = showError && isTouched && displayError;

  // Validate on value change if validator is provided
  useEffect(() => {
    if (validator && isTouched) {
      const validation = validator(String(value));
      setInternalError(validation.isValid ? '' : validation.errorMessage);
    }
  }, [value, validator, isTouched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleBlur = () => {
    setIsTouched(true);
    setIsFocused(false);
    
    if (validator) {
      const validation = validator(String(value));
      setInternalError(validation.isValid ? '' : validation.errorMessage);
    }
    
    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    
    if (onFocus) {
      onFocus();
    }
  };

  const inputClasses = [
    'form-input',
    className,
    hasError ? 'form-input-error' : '',
    isFocused ? 'form-input-focused' : '',
    disabled ? 'form-input-disabled' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      <label htmlFor={inputId} className="form-label">
        {label}
        {required && <span className="form-label-required">*</span>}
      </label>
      
      <div className="form-input-container">
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={inputClasses}
          maxLength={maxLength}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${inputId}-error` : undefined}
        />
        
        {hasError && (
          <div className="form-input-error-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            </svg>
          </div>
        )}
      </div>
      
      {hasError && (
        <div id={`${inputId}-error`} className="form-error-message" role="alert">
          {displayError}
        </div>
      )}
      
      {/* Success indicator when field is valid and has been touched */}
      {isTouched && !hasError && value && (
        <div className="form-success-message">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425a.247.247 0 0 1 .02-.022Z"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default ValidatedInput;