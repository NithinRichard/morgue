import React from 'react';
import '../styles/form.css';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  placeholder?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  onBlur?: () => void;
  style?: React.CSSProperties;
  className?: string;
  error?: string;
  showError?: boolean;
}

const Select: React.FC<SelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options,
  placeholder,
  name,
  id,
  required,
  disabled,
  onBlur,
  style,
  className,
  error,
  showError = false
}) => {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
        {required && <span className="required"> *</span>}
      </label>
      <select
        className={className || "form-select"}
        value={value}
        onChange={onChange}
        name={name}
        id={id}
        required={required}
        disabled={disabled}
        onBlur={onBlur}
        style={style}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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

export default Select;