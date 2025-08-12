import React from 'react';

// Validation utility functions

/**
 * Validates if a phone number is exactly 10 digits
 * @param phoneNumber - The phone number to validate
 * @returns boolean - true if valid, false otherwise
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Check if it's exactly 10 digits
  return digitsOnly.length === 10;
};

/**
 * Formats phone number input to only allow digits and limit to 10 characters
 * @param value - The input value
 * @returns string - Formatted phone number (digits only, max 10)
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove any non-digit characters and limit to 10 digits
  return value.replace(/\D/g, '').slice(0, 10);
};

/**
 * Gets validation error message for phone number
 * @param phoneNumber - The phone number to validate
 * @returns string - Error message or empty string if valid
 */
export const getPhoneNumberError = (phoneNumber: string): string => {
  if (!phoneNumber) {
    return 'Phone number is required';
  }
  
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  if (digitsOnly.length === 0) {
    return 'Phone number must contain digits';
  }
  
  if (digitsOnly.length < 10) {
    return 'Phone number must be exactly 10 digits';
  }
  
  if (digitsOnly.length > 10) {
    return 'Phone number cannot exceed 10 digits';
  }
  
  return '';
};

/**
 * Validates phone number and returns both validity and error message
 * @param phoneNumber - The phone number to validate
 * @returns object with isValid boolean and errorMessage string
 */
export const validatePhoneNumberWithMessage = (phoneNumber: string): { isValid: boolean; errorMessage: string } => {
  const errorMessage = getPhoneNumberError(phoneNumber);
  return {
    isValid: errorMessage === '',
    errorMessage
  };
};

/**
 * Custom hook for phone number input handling
 * @param initialValue - Initial phone number value
 * @returns object with value, error, handleChange, and isValid
 */
export const usePhoneNumberInput = (initialValue: string = '') => {
  const [value, setValue] = React.useState(formatPhoneNumber(initialValue));
  const [error, setError] = React.useState('');
  
  const handleChange = (inputValue: string) => {
    const formatted = formatPhoneNumber(inputValue);
    setValue(formatted);
    
    const errorMessage = getPhoneNumberError(formatted);
    setError(errorMessage);
  };
  
  const isValid = validatePhoneNumber(value);
  
  return {
    value,
    error,
    handleChange,
    isValid
  };
};

// Enhanced validation functions for mortuary management

/**
 * Validates name fields (patient name, verifier name, etc.)
 */
export const validateName = (name: string): { isValid: boolean; errorMessage: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, errorMessage: 'Name is required' };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, errorMessage: 'Name must be at least 2 characters long' };
  }
  
  if (name.trim().length > 100) {
    return { isValid: false, errorMessage: 'Name cannot exceed 100 characters' };
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
  if (!nameRegex.test(name.trim())) {
    return { isValid: false, errorMessage: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { isValid: true, errorMessage: '' };
};

/**
 * Validates age input
 */
export const validateAge = (age: string): { isValid: boolean; errorMessage: string } => {
  if (!age || age.trim().length === 0) {
    return { isValid: false, errorMessage: 'Age is required' };
  }
  
  const ageNumber = parseInt(age, 10);
  
  if (isNaN(ageNumber)) {
    return { isValid: false, errorMessage: 'Age must be a valid number' };
  }
  
  if (ageNumber < 0) {
    return { isValid: false, errorMessage: 'Age cannot be negative' };
  }
  
  if (ageNumber > 150) {
    return { isValid: false, errorMessage: 'Age cannot exceed 150 years' };
  }
  
  return { isValid: true, errorMessage: '' };
};

/**
 * Validates date inputs
 */
export const validateDate = (date: string, fieldName: string = 'Date'): { isValid: boolean; errorMessage: string } => {
  if (!date || date.trim().length === 0) {
    return { isValid: false, errorMessage: `${fieldName} is required` };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, errorMessage: `${fieldName} must be a valid date` };
  }
  
  // Check if date is not in the future (for death dates, registration dates)
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  if (dateObj > today) {
    return { isValid: false, errorMessage: `${fieldName} cannot be in the future` };
  }
  
  // Check if date is not too far in the past (reasonable limit)
  const hundredYearsAgo = new Date();
  hundredYearsAgo.setFullYear(hundredYearsAgo.getFullYear() - 100);
  
  if (dateObj < hundredYearsAgo) {
    return { isValid: false, errorMessage: `${fieldName} cannot be more than 100 years ago` };
  }
  
  return { isValid: true, errorMessage: '' };
};

/**
 * Validates time inputs
 */
export const validateTime = (time: string, fieldName: string = 'Time'): { isValid: boolean; errorMessage: string } => {
  if (!time || time.trim().length === 0) {
    return { isValid: false, errorMessage: `${fieldName} is required` };
  }
  
  // Check time format (HH:MM)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return { isValid: false, errorMessage: `${fieldName} must be in HH:MM format` };
  }
  
  return { isValid: true, errorMessage: '' };
};

/**
 * Validates ID proof inputs
 */
export const validateIdProof = (idProof: string): { isValid: boolean; errorMessage: string } => {
  if (!idProof || idProof.trim().length === 0) {
    return { isValid: false, errorMessage: 'ID proof is required' };
  }
  
  if (idProof.trim().length < 5) {
    return { isValid: false, errorMessage: 'ID proof must be at least 5 characters long' };
  }
  
  if (idProof.trim().length > 50) {
    return { isValid: false, errorMessage: 'ID proof cannot exceed 50 characters' };
  }
  
  return { isValid: true, errorMessage: '' };
};

/**
 * Validates medical registration number
 */
export const validateMedicalRegNo = (regNo: string): { isValid: boolean; errorMessage: string } => {
  if (!regNo || regNo.trim().length === 0) {
    return { isValid: false, errorMessage: 'Medical registration number is required' };
  }
  
  if (regNo.trim().length < 5) {
    return { isValid: false, errorMessage: 'Medical registration number must be at least 5 characters long' };
  }
  
  if (regNo.trim().length > 20) {
    return { isValid: false, errorMessage: 'Medical registration number cannot exceed 20 characters' };
  }
  
  // Basic alphanumeric validation
  const regNoRegex = /^[a-zA-Z0-9\-\/]+$/;
  if (!regNoRegex.test(regNo.trim())) {
    return { isValid: false, errorMessage: 'Medical registration number can only contain letters, numbers, hyphens, and slashes' };
  }
  
  return { isValid: true, errorMessage: '' };
};

/**
 * Validates badge number for police
 */
export const validateBadgeNumber = (badgeNo: string): { isValid: boolean; errorMessage: string } => {
  if (!badgeNo || badgeNo.trim().length === 0) {
    return { isValid: false, errorMessage: 'Badge number is required' };
  }
  
  if (badgeNo.trim().length < 3) {
    return { isValid: false, errorMessage: 'Badge number must be at least 3 characters long' };
  }
  
  if (badgeNo.trim().length > 15) {
    return { isValid: false, errorMessage: 'Badge number cannot exceed 15 characters' };
  }
  
  // Basic alphanumeric validation
  const badgeRegex = /^[a-zA-Z0-9\-]+$/;
  if (!badgeRegex.test(badgeNo.trim())) {
    return { isValid: false, errorMessage: 'Badge number can only contain letters, numbers, and hyphens' };
  }
  
  return { isValid: true, errorMessage: '' };
};

/**
 * Validates temperature values
 */
export const validateTemperature = (temp: string): { isValid: boolean; errorMessage: string } => {
  if (!temp || temp.trim().length === 0) {
    return { isValid: false, errorMessage: 'Temperature is required' };
  }
  
  const tempNumber = parseFloat(temp);
  
  if (isNaN(tempNumber)) {
    return { isValid: false, errorMessage: 'Temperature must be a valid number' };
  }
  
  // Reasonable temperature range for mortuary storage (-30°C to 10°C)
  if (tempNumber < -30) {
    return { isValid: false, errorMessage: 'Temperature cannot be below -30°C' };
  }
  
  if (tempNumber > 10) {
    return { isValid: false, errorMessage: 'Temperature cannot be above 10°C' };
  }
  
  return { isValid: true, errorMessage: '' };
};

/**
 * Validates text area inputs (notes, remarks, etc.)
 */
export const validateTextArea = (text: string, fieldName: string, maxLength: number = 500): { isValid: boolean; errorMessage: string } => {
  if (text && text.length > maxLength) {
    return { isValid: false, errorMessage: `${fieldName} cannot exceed ${maxLength} characters` };
  }
  
  return { isValid: true, errorMessage: '' };
};

/**
 * Validates date range (from date should be before or equal to to date)
 */
export const validateDateRange = (fromDate: Date | null, toDate: Date | null): { isValid: boolean; errorMessage: string } => {
  if (fromDate && toDate && fromDate > toDate) {
    return { isValid: false, errorMessage: 'From date cannot be after To date' };
  }
  
  return { isValid: true, errorMessage: '' };
};

/**
 * Validates required field selection (dropdowns)
 */
export const validateSelection = (value: string | number, fieldName: string): { isValid: boolean; errorMessage: string } => {
  if (!value || value === '' || value === 0) {
    return { isValid: false, errorMessage: `${fieldName} is required` };
  }
  
  return { isValid: true, errorMessage: '' };
};

/**
 * Comprehensive form validation function
 */
export const validateForm = (formData: Record<string, any>, validationRules: Record<string, (value: any) => { isValid: boolean; errorMessage: string }>): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  let isValid = true;
  
  Object.keys(validationRules).forEach(field => {
    const validation = validationRules[field](formData[field]);
    if (!validation.isValid) {
      errors[field] = validation.errorMessage;
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

/**
 * Sanitizes input to prevent XSS attacks
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validates and sanitizes input
 */
export const validateAndSanitize = (input: string, validator: (value: string) => { isValid: boolean; errorMessage: string }): { isValid: boolean; errorMessage: string; sanitizedValue: string } => {
  const validation = validator(input);
  const sanitizedValue = sanitizeInput(input);
  
  return {
    ...validation,
    sanitizedValue
  };
};



