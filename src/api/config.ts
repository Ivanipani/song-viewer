/**
 * Parse a string environment variable as a boolean
 */
const parseBoolean = (value: string | undefined): boolean => {
  return value === "true" || value === "1";
};

/**
 * Feature flags configuration
 */
export const features = {
  /**
   * Whether the tracks/stems view is enabled
   * @default true in development, false in production
   */
  tracksView: parseBoolean(import.meta.env.VITE_ENABLE_TRACKS_VIEW),
} as const;

/**
 * API configuration
 */
export const api = {
  /**
   * Base URL for the media API
   */
  endpoint: import.meta.env.VITE_API_ENDPOINT as string,
} as const;

/**
 * Debug configuration
 */
export const debug = {
  /**
   * Enable CSS debugging utilities
   */
  css: parseBoolean(import.meta.env.VITE_DEBUG_CSS),
} as const;

/**
 * Main configuration object
 */
export const config = {
  features,
  api,
  debug,
} as const;

/**
 * Check if a specific feature is enabled
 * @param feature - Feature name to check
 */
export const isFeatureEnabled = (feature: keyof typeof features): boolean => {
  return features[feature];
};

/**
 * Get the current environment mode
 */
export const getEnvironment = (): "development" | "production" => {
  return import.meta.env.MODE as "development" | "production";
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => {
  return getEnvironment() === "development";
};

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => {
  return getEnvironment() === "production";
};

export const API_URL = api.endpoint;

export const MEDIA_API_URL = `${API_URL}/media`;
export const FOTOS_API_URL = `${API_URL}/fotos`;
