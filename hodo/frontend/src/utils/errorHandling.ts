import { toast } from 'react-toastify';

// Error types for better error categorization
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  NETWORK = 'NETWORK',
  SERVER = 'SERVER',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNKNOWN = 'UNKNOWN'
}

// Custom error class for application errors
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode?: number;
  public readonly details?: any;

  constructor(message: string, type: ErrorType = ErrorType.UNKNOWN, statusCode?: number, details?: any) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// Error messages for different scenarios
export const ERROR_MESSAGES = {
  NETWORK: {
    CONNECTION_FAILED: 'Unable to connect to the server. Please check your internet connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    OFFLINE: 'You appear to be offline. Please check your connection.'
  },
  SERVER: {
    INTERNAL_ERROR: 'An internal server error occurred. Please try again later.',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
    BAD_REQUEST: 'Invalid request. Please check your input and try again.'
  },
  AUTHENTICATION: {
    INVALID_CREDENTIALS: 'Invalid username or password.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.'
  },
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required.',
    INVALID_FORMAT: 'Invalid format. Please check your input.',
    DUPLICATE_ENTRY: 'This entry already exists.',
    INVALID_DATE_RANGE: 'Invalid date range selected.'
  },
  MORTUARY: {
    BODY_NOT_FOUND: 'Body record not found.',
    STORAGE_UNIT_OCCUPIED: 'Storage unit is already occupied.',
    STORAGE_UNIT_NOT_FOUND: 'Storage unit not found.',
    BODY_ALREADY_VERIFIED: 'Body has already been verified.',
    BODY_NOT_VERIFIED: 'Body must be verified before this action.',
    EXIT_RECORD_EXISTS: 'Exit record already exists for this body.',
    INVALID_STORAGE_ALLOCATION: 'Invalid storage allocation.',
    TEMPERATURE_OUT_OF_RANGE: 'Temperature is outside acceptable range.'
  }
};

// HTTP status code to error type mapping
export const getErrorTypeFromStatus = (statusCode: number): ErrorType => {
  switch (statusCode) {
    case 400:
      return ErrorType.VALIDATION;
    case 401:
      return ErrorType.AUTHENTICATION;
    case 403:
      return ErrorType.AUTHORIZATION;
    case 404:
      return ErrorType.NOT_FOUND;
    case 409:
      return ErrorType.CONFLICT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorType.SERVER;
    default:
      return ErrorType.UNKNOWN;
  }
};

// Parse API error response
export const parseApiError = (error: any): AppError => {
  // Network errors
  if (!error.response) {
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      return new AppError(ERROR_MESSAGES.NETWORK.CONNECTION_FAILED, ErrorType.NETWORK);
    }
    if (error.code === 'ECONNABORTED') {
      return new AppError(ERROR_MESSAGES.NETWORK.TIMEOUT, ErrorType.NETWORK);
    }
    return new AppError(error.message || 'Unknown network error', ErrorType.NETWORK);
  }

  // HTTP errors
  const { status, data } = error.response;
  const errorType = getErrorTypeFromStatus(status);
  const message = data?.message || data?.error || `HTTP ${status} Error`;
  
  return new AppError(message, errorType, status, data);
};

// Error logging function
export const logError = (error: Error | AppError, context?: string) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  };

  if (error instanceof AppError) {
    errorInfo['type'] = error.type;
    errorInfo['statusCode'] = error.statusCode;
    errorInfo['details'] = error.details;
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  }

  // In production, you would send this to your logging service
  // Example: sendToLoggingService(errorInfo);
};

// Display user-friendly error messages
export const displayError = (error: Error | AppError, context?: string) => {
  logError(error, context);

  let message = error.message;
  let toastType: 'error' | 'warning' | 'info' = 'error';

  if (error instanceof AppError) {
    switch (error.type) {
      case ErrorType.NETWORK:
        message = ERROR_MESSAGES.NETWORK.CONNECTION_FAILED;
        break;
      case ErrorType.AUTHENTICATION:
        message = ERROR_MESSAGES.AUTHENTICATION.SESSION_EXPIRED;
        toastType = 'warning';
        break;
      case ErrorType.AUTHORIZATION:
        message = ERROR_MESSAGES.AUTHENTICATION.UNAUTHORIZED;
        toastType = 'warning';
        break;
      case ErrorType.NOT_FOUND:
        message = 'The requested resource was not found.';
        toastType = 'info';
        break;
      case ErrorType.VALIDATION:
        // Validation errors should be handled at the form level
        return;
      default:
        message = error.message || 'An unexpected error occurred.';
    }
  }

  toast[toastType](message, {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Retry mechanism for failed requests
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain error types
      if (error instanceof AppError) {
        if ([ErrorType.AUTHENTICATION, ErrorType.AUTHORIZATION, ErrorType.VALIDATION].includes(error.type)) {
          throw error;
        }
      }

      if (attempt === maxRetries) {
        break;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
};

// Safe async operation wrapper
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  context?: string,
  showError: boolean = true
): Promise<T | null> => {
  try {
    return await operation();
  } catch (error) {
    const appError = error instanceof AppError ? error : parseApiError(error);
    
    if (showError) {
      displayError(appError, context);
    } else {
      logError(appError, context);
    }
    
    return null;
  }
};

// Form validation error handler
export const handleValidationErrors = (errors: Record<string, string>) => {
  const errorMessages = Object.values(errors);
  if (errorMessages.length > 0) {
    toast.error(`Please fix the following errors:\n${errorMessages.join('\n')}`, {
      position: 'top-right',
      autoClose: 8000,
    });
  }
};

// API response validator
export const validateApiResponse = (response: any, expectedFields: string[] = []): boolean => {
  if (!response) {
    throw new AppError('Empty response received', ErrorType.SERVER);
  }

  if (expectedFields.length > 0) {
    const missingFields = expectedFields.filter(field => !(field in response));
    if (missingFields.length > 0) {
      throw new AppError(
        `Invalid response format. Missing fields: ${missingFields.join(', ')}`,
        ErrorType.SERVER
      );
    }
  }

  return true;
};

// Data integrity checker
export const checkDataIntegrity = (data: any, rules: Record<string, (value: any) => boolean>): void => {
  Object.entries(rules).forEach(([field, validator]) => {
    if (!validator(data[field])) {
      throw new AppError(
        `Data integrity check failed for field: ${field}`,
        ErrorType.VALIDATION
      );
    }
  });
};

// Duplicate prevention helper
export const preventDuplicateSubmission = (() => {
  const submissionTracker = new Set<string>();

  return (key: string, ttl: number = 5000): boolean => {
    if (submissionTracker.has(key)) {
      return false; // Duplicate submission
    }

    submissionTracker.add(key);
    setTimeout(() => submissionTracker.delete(key), ttl);
    return true; // Allow submission
  };
})();

// Error recovery suggestions
export const getErrorRecoverySuggestions = (error: AppError): string[] => {
  const suggestions: string[] = [];

  switch (error.type) {
    case ErrorType.NETWORK:
      suggestions.push('Check your internet connection');
      suggestions.push('Try refreshing the page');
      suggestions.push('Contact IT support if the problem persists');
      break;
    case ErrorType.SERVER:
      suggestions.push('Try again in a few minutes');
      suggestions.push('Contact system administrator if the problem persists');
      break;
    case ErrorType.AUTHENTICATION:
      suggestions.push('Log out and log back in');
      suggestions.push('Clear your browser cache');
      break;
    case ErrorType.VALIDATION:
      suggestions.push('Check all required fields are filled');
      suggestions.push('Verify the format of your input');
      break;
    case ErrorType.NOT_FOUND:
      suggestions.push('Verify the item still exists');
      suggestions.push('Try refreshing the page');
      break;
    default:
      suggestions.push('Try refreshing the page');
      suggestions.push('Contact support if the problem persists');
  }

  return suggestions;
};