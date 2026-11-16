import { isAxiosError } from 'axios';
import { ApiErrorResponse } from './apiTypes';

export class ApiError extends Error {
  public readonly status?: number;
  public readonly code?: string;
  public readonly validationErrors?: Record<string, string[]>;
  public readonly isNetworkError: boolean;

  constructor(
    message: string,
    options?: {
      status?: number;
      code?: string;
      validationErrors?: Record<string, string[]>;
      isNetworkError?: boolean;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.code = options?.code;
    this.validationErrors = options?.validationErrors;
    this.isNetworkError = options?.isNetworkError ?? false;
  }
}

/**
 * Normalizes any error into a typed ApiError instance.
 */
export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error;
  }

  if (isAxiosError(error)) {
    if (!error.response) {
      return new ApiError(
        error.message ||
          'Network error. Please check your internet connection.',
        { isNetworkError: true }
      );
    }

    const status = error.response.status;
    const data = error.response.data as ApiErrorResponse | undefined;

    const message =
      data?.message ||
      (status === 401
        ? 'Session expired or unauthenticated.'
        : status === 403
          ? 'You do not have permission to perform this action.'
          : status === 404
            ? 'The requested resource was not found.'
            : status === 422
              ? 'Validation failed. Please verify your input.'
              : status >= 500
                ? 'Server error. Please try again later.'
                : 'An unexpected error occurred.');

    return new ApiError(message, {
      status,
      code: data?.code,
      validationErrors: data?.errors,
    });
  }

  if (error instanceof Error) {
    return new ApiError(error.message);
  }

  return new ApiError('An unknown error occurred.');
};
