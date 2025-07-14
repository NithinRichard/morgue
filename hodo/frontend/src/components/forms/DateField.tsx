import React from 'react';
import { useField } from 'formik';

interface DateFieldProps {
  label: string;
  name: string;
  required?: boolean;
}

const DateField: React.FC<DateFieldProps> = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <div className="form-group">
      <label htmlFor={props.name} className="form-label">
        {label} {props.required && <span style={{ color: 'red' }}>*</span>}
      </label>
      <input
        className={`form-input${meta.touched && meta.error ? ' is-invalid' : ''}`}
        {...field}
        {...props}
        id={props.name}
        type="date"
        autoComplete="off"
      />
      {meta.touched && meta.error ? (
        <div className="form-error">{meta.error}</div>
      ) : null}
    </div>
  );
};

export default DateField; 