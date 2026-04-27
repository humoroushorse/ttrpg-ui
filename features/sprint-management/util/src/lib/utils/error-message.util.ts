/**
 * Error message utility
 * Extracts user-friendly error messages from various error types
 */

/**
 * Extract error message from error object or string
 * @param error - Error object, string, or unknown type
 * @param defaultMessage - Default message if error cannot be parsed
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    // Check for userMessage property
    if ('userMessage' in error && typeof error.userMessage === 'string') {
      return error.userMessage;
    }

    // Check for message property
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }

    // Check for error property (common in HTTP errors)
    if ('error' in error && error.error && typeof error.error === 'object') {
      if ('detail' in error.error && typeof error.error.detail === 'string') {
        return error.error.detail;
      }
      if ('message' in error.error && typeof error.error.message === 'string') {
        return error.error.message;
      }
    }
  }

  return defaultMessage;
}
