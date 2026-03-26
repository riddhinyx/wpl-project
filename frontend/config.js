/**
 * Frontend Configuration
 * Contains API endpoints and application settings
 */

const CONFIG = {
  API_BASE_URL: 'http://localhost:8000/api',
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'auth_user',
  ROLE_DONOR: 'donor',
  ROLE_NGO: 'ngo',
  ROLE_ADMIN: 'admin',
  NOTIFICATIONS_MAX: 200,
  DONATION_NOTIFY_RADIUS_KM: 20,
};

export default CONFIG;
