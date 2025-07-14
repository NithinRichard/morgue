import React from 'react';
import { useField } from 'formik';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  label: string;
  name: string;
  options: Option[];
  required?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, options, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="form-group">
      <label htmlFor={props.name} className="form-label">
        {label} {props.required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <select
        className={`form-select${meta.touched && meta.error ? ' is-invalid' : ''}`}
        {...field}
        id={props.name}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {meta.touched && meta.error ? (
        <div className="form-error">{meta.error}</div>
      ) : null}
    </div>
  );
};

export default SelectField; 