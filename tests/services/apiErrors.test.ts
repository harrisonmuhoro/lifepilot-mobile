import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { handleApiError, ApiError } from '../../src/services/api/apiErrors';

describe('ApiError & handleApiError', () => {
  it('identifies and normalizes network connection failures', () => {
    const networkError = new AxiosError('Network Error');
    const result = handleApiError(networkError);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.isNetworkError).toBe(true);
    expect(result.message).toContain('Network Error');
  });

  it('handles 401 unauthenticated errors', () => {
    const error = new AxiosError(
      'Request failed with status code 401',
      'ERR_BAD_REQUEST',
      {} as InternalAxiosRequestConfig,
      {},
      {
        status: 401,
        statusText: 'Unauthorized',
        data: {},
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      } as AxiosResponse
    );

    const result = handleApiError(error);
    expect(result.status).toBe(401);
    expect(result.message).toBe('Session expired or unauthenticated.');
  });

  it('extracts structured Laravel validation errors on 422', () => {
    const validationPayload = {
      message: 'The email has already been taken.',
      errors: {
        email: ['The email has already been taken.'],
      },
    };

    const error = new AxiosError(
      'Validation Error',
      'ERR_BAD_REQUEST',
      {} as InternalAxiosRequestConfig,
      {},
      {
        status: 422,
        statusText: 'Unprocessable Entity',
        data: validationPayload,
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      } as AxiosResponse
    );

    const result = handleApiError(error);
    expect(result.status).toBe(422);
    expect(result.message).toBe('The email has already been taken.');
    expect(result.validationErrors?.email).toContain(
      'The email has already been taken.'
    );
  });
});
