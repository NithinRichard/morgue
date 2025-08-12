import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logError, AppError, ErrorType } from '../utils/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showErrorDetails?: boolean;
  context?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Generate a unique error ID for tracking
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with context
    const appError = new AppError(
      error.message,
      ErrorType.UNKNOWN,
      undefined,
      {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.props.context || 'Unknown'
      }
    );

    logError(appError, `ErrorBoundary: ${this.props.context || 'Unknown'}`);

    // Store error info in state
    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo, this.state.errorId);
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => {
        alert('Error details copied to clipboard');
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = JSON.stringify(errorDetails, null, 2);
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Error details copied to clipboard');
      });
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div style={{
          padding: '2rem',
          border: '2px solid #ef4444',
          borderRadius: '0.5rem',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          margin: '1rem 0',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              style={{ marginRight: '0.5rem', flexShrink: 0 }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '600' }}>
              Something went wrong
            </h3>
          </div>

          <p style={{ margin: '0 0 1rem 0', lineHeight: '1.5' }}>
            We're sorry, but an unexpected error occurred while rendering this component. 
            This issue has been logged and will be investigated.
          </p>

          {this.state.errorId && (
            <p style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '0.875rem', 
              fontFamily: 'monospace',
              backgroundColor: '#fee2e2',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid #fecaca'
            }}>
              <strong>Error ID:</strong> {this.state.errorId}
            </p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <button
              onClick={this.handleRetry}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
            >
              Try Again
            </button>

            <button
              onClick={this.handleReload}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
            >
              Reload Page
            </button>

            {(this.props.showErrorDetails || process.env.NODE_ENV === 'development') && (
              <button
                onClick={this.copyErrorDetails}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f59e0b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
              >
                Copy Error Details
              </button>
            )}
          </div>

          {/* Error details for development */}
          {(this.props.showErrorDetails || process.env.NODE_ENV === 'development') && this.state.error && (
            <details style={{ marginTop: '1rem' }}>
              <summary style={{ 
                cursor: 'pointer', 
                fontWeight: '600',
                marginBottom: '0.5rem',
                fontSize: '0.875rem'
              }}>
                Technical Details (Click to expand)
              </summary>
              
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fecaca',
                borderRadius: '0.375rem',
                padding: '1rem',
                marginTop: '0.5rem'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  <strong style={{ fontSize: '0.875rem' }}>Error Message:</strong>
                  <pre style={{ 
                    fontSize: '0.75rem', 
                    marginTop: '0.25rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    backgroundColor: '#fef2f2',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                    border: '1px solid #fecaca'
                  }}>
                    {this.state.error.message}
                  </pre>
                </div>

                {this.state.error.stack && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ fontSize: '0.875rem' }}>Stack Trace:</strong>
                    <pre style={{ 
                      fontSize: '0.75rem', 
                      marginTop: '0.25rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      backgroundColor: '#fef2f2',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #fecaca',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}

                {this.state.errorInfo?.componentStack && (
                  <div>
                    <strong style={{ fontSize: '0.875rem' }}>Component Stack:</strong>
                    <pre style={{ 
                      fontSize: '0.75rem', 
                      marginTop: '0.25rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      backgroundColor: '#fef2f2',
                      padding: '0.5rem',
                      borderRadius: '0.25rem',
                      border: '1px solid #fecaca',
                      maxHeight: '200px',
                      overflow: 'auto'
                    }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            color: '#374151'
          }}>
            <strong>What you can do:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
              <li>Try refreshing the page</li>
              <li>Check your internet connection</li>
              <li>Clear your browser cache</li>
              <li>Contact support if the problem persists</li>
            </ul>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;