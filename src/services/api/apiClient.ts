/* eslint-disable import/no-named-as-default-member */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Config } from '../../constants/config';
import { secureStorage } from '../storage/secureStorage';
import { handleApiError } from './apiErrors';
import { logger } from '../../utils/logger';

const TAG = 'ApiClient';

/**
 * Creates and configures the centralized Axios client for LifePilot.
 */
export const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: Config.apiUrl,
    timeout: Config.apiTimeout,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: attach bearer token from SecureStore
  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        const token = await secureStorage.getAuthToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        logger.warn(TAG, 'Failed to retrieve auth token for request', error);
      }

      logger.debug(
        TAG,
        `Outgoing Request: [${config.method?.toUpperCase()}] ${config.baseURL}${config.url}`
      );
      return config;
    },
    (error) => {
      logger.error(TAG, 'Request configuration error', error);
      return Promise.reject(handleApiError(error));
    }
  );

  // Response interceptor: normalize errors
  instance.interceptors.response.use(
    (response) => {
      logger.debug(
        TAG,
        `Response [${response.status}] for ${response.config.url}`
      );
      return response;
    },
    (error) => {
      const apiError = handleApiError(error);
      logger.warn(TAG, `API Error [${apiError.status}]: ${apiError.message}`);
      return Promise.reject(apiError);
    }
  );

  return instance;
};

export const apiClient = createApiClient();
