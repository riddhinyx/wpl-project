# Frontend-Backend Integration Guide

## Overview
The frontend is now fully integrated with the PHP backend API. The application uses a service-oriented architecture with JWT authentication for secure API communication.

## Architecture

### Files Created/Modified

#### 1. **frontend/config.js** (NEW)
Configuration file containing:
- `API_BASE_URL`: Backend API endpoint (http://localhost:8000/api)
- `TOKEN_KEY`: LocalStorage key for JWT token ('auth_token')
- `USER_KEY`: LocalStorage key for user data ('auth_user')
- Role constants: ROLE_DONOR, ROLE_NGO, ROLE_ADMIN
- Other app constants

#### 2. **frontend/api.js** (NEW)
API Service layer handling all backend communication:
- **Authentication Methods**:
  - `login(email, password, role)` - Authenticate user and store JWT token
  - `register(userData)` - Register new user
  - `logout()` - Clear token and user data
  - `getCurrentUser()` - Fetch current user profile

- **Donation Methods**:
  - `createDonation(donationData)` - Submit new food donation
  - `getMyDonations()` - Fetch user's donations
  - `getAvailableDonations(params)` - Fetch available donations for NGOs
  - `updateDonation(id, data)` - Update donation details
  - `deleteDonation(id)` - Cancel donation

- **Pickup Methods**:
  - `acceptPickup(donationId)` - Accept donation for pickup
  - `getMyPickups()` - Fetch NGO's active pickups
  - `completePickup(id, data)` - Mark pickup as delivered

- **Admin Methods**:
  - `getAllUsers(role)` - Fetch all users (with optional role filter)
  - `verifyUser(id)` - Approve unverified user
  - `deactivateUser(id)` - Reject/deactivate user
  - `getAllDonations()` - Fetch all platform donations
  - `getAdminStats()` - Fetch platform statistics

- **Notification Methods**:
  - `getNotifications()` - Fetch user notifications
  - `markNotificationAsRead(id)` - Mark notification as read

- **Utility Methods**:
  - `getToken()` / `setToken(token)` - Manage JWT token
  - `getUser()` / `setUser(user)` - Manage user data
  - `isAuthenticated()` - Check authentication status
  - `getUserRole()` - Get current user's role
  - `hasRole(role)` - Check if user has specific role

#### 3. **frontend/main.js** (UPDATED)
Main application logic with full API integration:
- Page templates for all user roles
- Page data loading functions
- Form handlers for submissions
- Navigation and routing logic
- Login/logout flows
- Admin action handlers

#### 4. **frontend/index.html** (UPDATED)
- Added logout button in sidebar
- Added form fields for login (email, password, role)
- All HTML structure ready for API integration

## Data Flow

### Login Flow
```
User filled login form 
  → loginForm.submit event
  → api.login(email, password, role)
  → Backend validates and returns JWT token + user info
  → Token + user stored in localStorage
  → showApp() - display main application
  → Route to role-appropriate starting page
```

### Donation Creation (Donor)
```
Donor fills donation form
  → form.submit event
  → Collect form data (food_type, quantity, unit, etc.)
  → api.createDonation(data)
  → Backend creates donation record
  → Backend notifies nearby verified NGOs
  → Show success message
  → Reload donation list
```

### Available Donations (NGO)
```
NGO navigates to "Available Donations"
  → loadPageData('Available Donations') called
  → api.getAvailableDonations() fetches available donations
  → Display list with "Accept Pickup" buttons
  → onClick handler: acceptPickupHandler(donationId)
  → api.acceptPickup(donationId)
  → Backend creates pickup_request record
  → Show success and reload
```

### Complete Pickup (NGO)
```
NGO clicks "Mark as Delivered" button
  → completePickupHandler(pickupId) called
  → Prompt for beneficiary count
  → api.completePickup(id, {beneficiary_count, notes})
  → Backend marks pickup as 'completed'
  → Updates donation status
  → Show success and reload pickups list
```

### Admin Dashboard
```
Admin navigates to "Admin Dashboard"
  → loadPageData('Admin Dashboard') called
  → Parallel API calls:
     - api.getAdminStats() → Display stats (total donations, users, distributed)
     - api.getAllDonations() → Display activity table
  → Show real-time platform overview
```

### User Verification (Admin)
```
Admin on "User Management" page
  → loadPageData('User Management') called
  → api.getAllUsers() fetches unverified accounts
  → Display pending users with Approve/Reject buttons
  → onClick "Approve": verifyUserHandler(userId) → api.verifyUser(id)
  → onClick "Reject": deactivateUserHandler(userId) → api.deactivateUser(id)
  → Reload users list
```

## JWT Authentication

### Token Management
1. **Token Storage**: Stored in `localStorage` under key `auth_token`
2. **User Data Storage**: Stored in `localStorage` under key `auth_user`
3. **Token Expiry**: Backend JWT TTL is 86400 seconds (24 hours)
4. **Token Refresh**: Re-login required when token expires
5. **Token Invalidation**: Logout increments user's `token_version`, invalidating all old tokens

### Unauthorized Handling
```javascript
if (response.status === 401) {
  // Token expired or invalid
  api.setToken(null);
  api.setUser(null);
  window.location.href = '/';  // Redirect to login
}
```

## Error Handling

All API errors are caught and user-friendly error messages are displayed:
```javascript
try {
  const result = await api.methodName();
  // Success handling
} catch (error) {
  alert('Error: ' + error.message);
  // Error recovery
}
```

## Role-Based Pages

### Donor Pages
- **Food Donation Portal**: Create new donations with form
- **Donation History**: View donation status and distribution

### NGO/Volunteer Pages
- **Available Donations**: Browse and accept nearby food donations
- **My Pickups**: Track pickup status from accepted to completion

### Admin Pages
- **Admin Dashboard**: Real-time platform statistics and activity
- **User Management**: Approve pending users, view user metrics

## Data Validation & Constraints

### Donation Form Validation
- food_type: Required, string
- quantity: Required, float > 0
- unit: Required, one of [lbs, kg, portions, servings]
- pickup_address: Required, string
- available_from: Required, ISO datetime
- available_until: Required, ISO datetime (must be > available_from)
- description: Optional, string

### Login Validation
- Email: Required, valid email format
- Password: Required, min 8 characters (backend enforces)
- Role: Required, one of [donor, ngo, admin]

## API Endpoints Summary

### Authentication (No auth required for login/register)
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/auth/me` *(requires auth)*
- `POST /api/auth/logout` *(requires auth)*

### Donations (Require auth, donors only for create/update/delete)
- `POST /api/donations` *(donor)*
- `GET /api/donations` *(ngo - with optional lat/lng/radius)*
- `GET /api/donations/my` *(donor)*
- `PUT /api/donations/{id}` *(donor)*
- `DELETE /api/donations/{id}` *(donor)*

### Pickups (NGO only, requires auth)
- `POST /api/pickups`
- `GET /api/pickups/my`
- `PUT /api/pickups/{id}/complete`

### Admin (Admin role only, requires auth)
- `GET /api/admin/users`
- `PUT /api/admin/users/{id}/verify`
- `DELETE /api/admin/users/{id}`
- `GET /api/admin/donations`
- `GET /api/admin/stats`

### Notifications (Requires auth)
- `GET /api/notifications`
- `PUT /api/notifications/{id}/read`

## CORS Configuration

Frontend origin: `http://localhost:5173` or `http://127.0.0.1:5173`
Backend CORS allows: GET, POST, PUT, DELETE, OPTIONS
Headers: Content-Type, Authorization

## Running the Application

### Backend
```bash
cd backend
# Start PHP development server on port 8000
php -S localhost:8000
```

### Frontend
```bash
cd frontend
# Install dependencies
npm install

# Start Vite dev server (runs on localhost:5173)
npm run dev

# Build for production
npm run build
```

## Testing Checklist

- [ ] Backend running on `http://localhost:8000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] Can login with valid credentials
- [ ] Can see role-appropriate pages
- [ ] Donor can create donations
- [ ] NGO can see available donations
- [ ] NGO can accept pickups
- [ ] NGO can complete pickups
- [ ] Admin can see stats and users
- [ ] Admin can verify/reject users
- [ ] Logout clears localStorage and redirects
- [ ] Invalid token redirects to login

## Known Limitations & Future Improvements

1. **No registration form**: Currently only login is implemented. Registration form can be added.
2. **No geolocation**: Pickup location is text-based. Add geocoding/maps integration.
3. **No real-time notifications**: Notifications are fetched on page load. Add WebSockets for real-time updates.
4. **No file uploads**: Currently no photo/documents. Add file upload support to donations.
5. **No edit form**: Donations can be updated via API but no edit UI implemented.
6. **No search/filter**: User management doesn't have search yet.

## Troubleshooting

### "Cannot find module" errors
- Ensure import statements use correct relative paths
- Check that `config.js` and `api.js` are in the `frontend/` root directory

### Backend connection errors
- Verify backend is running: `php -S localhost:8000` from backend folder
- Check `config.js` API_BASE_URL matches your backend port
- Check browser console for CORS errors

### "401 Unauthorized" errors
- Token may have expired. Login again.
- Check that Authorization header is being sent in requests
- Verify backend JWT secret matches

### Form submissions not working
- Check browser console for JavaScript errors
- Verify API endpoints match backend routes
- Check that required form fields are filled
- Check network tab in DevTools to see API requests

## Future Enhancement Ideas

1. Add WebSocket support for real-time donation notifications
2. Implement Google Maps integration for location selection
3. Add photo upload for donations
4. Implement email notifications
5. Add donation comments/ratings
6. Implement search and advanced filtering
7. Add mobile app version with React Native
8. Implement payment integration for donations
9. Add NGO profiles and ratings
10. Implement SMS notifications for pickups
