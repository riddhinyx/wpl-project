/**
 * API Service Module
 * Handles all communication with the backend API
 */

import CONFIG from './config.js';

class ApiService {
  constructor() {
    this.baseUrl = CONFIG.API_BASE_URL;
    this.token = this.getToken();
  }

  /**
   * Get stored authentication token
   */
  getToken() {
    return localStorage.getItem(CONFIG.TOKEN_KEY);
  }

  /**
   * Store authentication token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(CONFIG.TOKEN_KEY, token);
      this.token = token;
    } else {
      localStorage.removeItem(CONFIG.TOKEN_KEY);
      this.token = null;
    }
  }

  /**
   * Get stored user data
   */
  getUser() {
    const userStr = localStorage.getItem(CONFIG.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Store user data
   */
  setUser(user) {
    if (user) {
      localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CONFIG.USER_KEY);
    }
  }

  /**
   * Make HTTP request with proper headers and error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const method = options.method || 'GET';
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const fetchOptions = {
      method,
      headers,
      ...options,
    };

    // Add body if provided
    if (options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, fetchOptions);
      const data = await response.json();

      // Check if response indicates success
      if (!response.ok || !data.success) {
        // Handle 401 - token expired or invalid
        if (response.status === 401) {
          this.setToken(null);
          this.setUser(null);
          window.location.href = '/';
        }
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data.data;
    } catch (error) {
      console.error(`API Error [${method} ${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * ====================
   * AUTHENTICATION ENDPOINTS
   * ====================
   */

  /**
   * POST /api/auth/register
   * Register a new user (donor or ngo)
   */
  async register(userData) {
    const response = await fetch(`${this.baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Registration failed');
    }

    return data.data;
  }

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  async login(email, password, role) {
    const response = await fetch(`${this.baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, role }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || 'Login failed');
    }

    // Store token and user data
    const { token, user } = data.data;
    this.setToken(token);
    this.setUser(user);

    return data.data;
  }

  /**
   * GET /api/auth/me
   * Get current authenticated user profile
   */
  async getCurrentUser() {
    return this.request('/auth/me');
  }

  /**
   * POST /api/auth/logout
   * Logout current user
   */
  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
      this.setUser(null);
    }
  }

  /**
   * ====================
   * DONATION ENDPOINTS
   * ====================
   */

  /**
   * POST /api/donations
   * Create a new donation (donor only)
   */
  async createDonation(donationData) {
    return this.request('/donations', {
      method: 'POST',
      body: donationData,
    });
  }

  /**
   * GET /api/donations
   * Get available donations (ngo only)
   * Optional params: lat, lng, radius_km
   */
  async getAvailableDonations(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = '/donations' + (queryString ? `?${queryString}` : '');
    return this.request(endpoint);
  }

  /**
   * GET /api/donations/my
   * Get current user's donations (donor only)
   */
  async getMyDonations() {
    return this.request('/donations/my');
  }

  /**
   * PUT /api/donations/{id}
   * Update a donation (donor only)
   */
  async updateDonation(id, donationData) {
    return this.request(`/donations/${id}`, {
      method: 'PUT',
      body: donationData,
    });
  }

  /**
   * DELETE /api/donations/{id}
   * Cancel a donation (donor only)
   */
  async deleteDonation(id) {
    return this.request(`/donations/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * ====================
   * PICKUP ENDPOINTS
   * ====================
   */

  /**
   * POST /api/pickups
   * Accept a donation for pickup (ngo only)
   */
  async acceptPickup(donationId) {
    return this.request('/pickups', {
      method: 'POST',
      body: { donation_id: donationId },
    });
  }

  /**
   * GET /api/pickups/my
   * Get current NGO's pickup requests
   */
  async getMyPickups() {
    return this.request('/pickups/my');
  }

  /**
   * PUT /api/pickups/{id}/complete
   * Mark a pickup as complete (ngo only)
   */
  async completePickup(id, pickupData) {
    return this.request(`/pickups/${id}/complete`, {
      method: 'PUT',
      body: pickupData,
    });
  }

  /**
   * ====================
   * NOTIFICATION ENDPOINTS
   * ====================
   */

  /**
   * GET /api/notifications
   * Get user's notifications
   */
  async getNotifications() {
    return this.request('/notifications');
  }

  /**
   * PUT /api/notifications/{id}/read
   * Mark a notification as read
   */
  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  /**
   * ====================
   * ADMIN ENDPOINTS
   * ====================
   */

  /**
   * GET /api/admin/users
   * Get all users (admin only)
   * Optional params: role (donor|ngo|admin)
   */
  async getAllUsers(role = null) {
    const params = role ? { role } : {};
    const queryString = new URLSearchParams(params).toString();
    const endpoint = '/admin/users' + (queryString ? `?${queryString}` : '');
    return this.request(endpoint);
  }

  /**
   * PUT /api/admin/users/{id}/verify
   * Verify a user (admin only)
   */
  async verifyUser(id) {
    return this.request(`/admin/users/${id}/verify`, {
      method: 'PUT',
    });
  }

  /**
   * DELETE /api/admin/users/{id}
   * Deactivate a user (admin only)
   */
  async deactivateUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * GET /api/admin/donations
   * Get all donations (admin only)
   */
  async getAllDonations() {
    return this.request('/admin/donations');
  }

  /**
   * GET /api/admin/stats
   * Get platform statistics (admin only)
   */
  async getAdminStats() {
    return this.request('/admin/stats');
  }

  /**
   * ====================
   * UTILITY METHODS
   * ====================
   */

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }

  /**
   * Get current user's role
   */
  getUserRole() {
    const user = this.getUser();
    return user ? user.role : null;
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role) {
    return this.getUserRole() === role;
  }

  /**
   * Clear all stored data (for logout)
   */
  clearStorage() {
    this.setToken(null);
    this.setUser(null);
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
