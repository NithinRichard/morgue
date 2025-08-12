import { useState, useCallback, useEffect } from 'react';
import { validateForm } from '../utils/validation';

export interface ValidationRule {
  (value: any): { isValid: boolean; errorMessage: string };
}

export interface FormValidationConfig {
  [fieldName: string]: ValidationRule;
}

export interface UseFormValidationReturn {
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
  validateField: (fieldName: string, value: any) => boolean;
  validateAllFields: (formData: Record<string, any>) => boolean;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  setFieldError: (fieldName: string, error: string) => void;
  setSubmitting: (submitting: boolean) => void;
  hasErrors: boolean;
  getFieldError: (fieldName: string) => string | undefined;
}

export const useFormValidation = (
  validationConfig: FormValidationConfig,
  options: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    showErrorsImmediately?: boolean;
  } = {}
): UseFormValidationReturn => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const {
    validateOnChange = false,
    validateOnBlur = true,
    showErrorsImmediately = false
  } = options;

  // Validate a single field
  const validateField = useCallback((fieldName: string, value: any): boolean => {
    if (!validationConfig[fieldName]) {
      return true;
    }

    const validation = validationConfig[fieldName](value);
    
    setErrors(prev => {
      const newErrors = { ...prev };
      if (validation.isValid) {
        delete newErrors[fieldName];
      } else {
        // Only show error if field has been touched or we're showing errors immediately
        if (touchedFields.has(fieldName) || showErrorsImmediately || isSubmitting) {
          newErrors[fieldName] = validation.errorMessage;
        }
      }
      return newErrors;
    });

    return validation.isValid;
  }, [validationConfig, touchedFields, showErrorsImmediately, isSubmitting]);

  // Validate all fields
  const validateAllFields = useCallback((formData: Record<string, any>): boolean => {
    const validation = validateForm(formData, validationConfig);
    
    setErrors(validation.errors);
    
    // Mark all fields as touched when validating all
    setTouchedFields(new Set(Object.keys(validationConfig)));
    
    return validation.isValid;
  }, [validationConfig]);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
    setTouchedFields(new Set());
  }, []);

  // Clear error for a specific field
  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Set error for a specific field
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  // Mark field as touched
  const markFieldAsTouched = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));
  }, []);

  // Get error for a specific field
  const getFieldError = useCallback((fieldName: string): string | undefined => {
    return errors[fieldName];
  }, [errors]);

  // Set submitting state
  const setSubmitting = useCallback((submitting: boolean) => {
    setIsSubmitting(submitting);
  }, []);

  // Computed values
  const isValid = Object.keys(errors).length === 0;
  const hasErrors = Object.keys(errors).length > 0;

  // Create field handlers
  const createFieldHandlers = useCallback((fieldName: string) => ({
    onChange: (value: any) => {
      if (validateOnChange) {
        validateField(fieldName, value);
      }
    },
    onBlur: () => {
      markFieldAsTouched(fieldName);
      if (validateOnBlur) {
        // We need the current value, but since this is just onBlur,
        // we'll validate with the current form state
        // This should be called with the actual value from the component
      }
    },
    onFocus: () => {
      // Clear error when user focuses on field (optional)
      if (errors[fieldName]) {
        clearFieldError(fieldName);
      }
    }
  }), [fieldName, validateOnChange, validateOnBlur, validateField, markFieldAsTouched, errors, clearFieldError]);

  return {
    errors,
    isValid,
    isSubmitting,
    validateField,
    validateAllFields,
    clearErrors,
    clearFieldError,
    setFieldError,
    setSubmitting,
    hasErrors,
    getFieldError,
    // Additional utilities
    markFieldAsTouched,
    createFieldHandlers
  } as UseFormValidationReturn & {
    markFieldAsTouched: (fieldName: string) => void;
    createFieldHandlers: (fieldName: string) => any;
  };
};