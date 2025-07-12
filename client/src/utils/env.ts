// Environment configuration for StackIt
export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:5000',
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
} as const;

// Validate required environment variables
if (!ENV.API_URL) {
  console.warn('VITE_API_URL is not set, using default localhost');
}

export default ENV;