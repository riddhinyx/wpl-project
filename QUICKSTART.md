# Quick Start Guide

## Prerequisites
- PHP 7.4+ with `php-curl` and `php-pdo` extensions
- Node.js 16+ (for frontend build tool Vite)
- MySQL/MariaDB server running
- Git (optional, for version control)

## Backend Setup (PHP)

### 1. Database Setup
```bash
# Start MySQL/MariaDB service
# For Linux/Mac:
# brew services start mysql  (if using Homebrew)
# For Windows: Use MySQL Workbench or command line

# Import schema
mysql -u root -p < backend/schema.sql
```

### 2. Environment Configuration
```bash
cd backend

# Edit config/config.php with your database credentials
# Update:
# - 'host' => 'localhost'
# - 'name' => 'your_database_name'
# - 'user' => 'root'
# - 'pass' => 'your_password'
# - 'jwt_secret' => 'change-this-to-a-secure-random-string'
```

### 3. Start Backend Server
```bash
cd backend

# Start PHP development server on port 8000
php -S localhost:8000

# You should see: Listening on http://localhost:8000
```

## Frontend Setup (Vue/Vite)

### 1. Install Dependencies
```bash
cd frontend

npm install
```

### 2. Start Development Server
```bash
npm run dev

# You should see: VITE v5.X.X ready in XXXms
# Local: http://localhost:5173/
```

## Testing the Integration

### 1. Open Frontend in Browser
```
http://localhost:5173
```

### 2. Login with Test Credentials
Assuming you have test users in your database:
- **Email**: test@donor.com (or any registered test email)
- **Password**: password123
- **Role**: Select from dropdown (donor, ngo, or admin)

### 3. Test Features by Role

#### Donor Account
1. Go to "Food Donation Portal"
2. Fill out the donation form:
   - Food Type: "Rice and Curry"
   - Quantity: "20"
   - Unit: "lbs"
   - Pickup Location: "123 Main St"
   - Available From/Until: Select times
3. Click "Submit Donation"
4. Go to "Donation History" to see your donation

#### NGO/Volunteer Account
1. Go to "Available Donations"
2. Browse available food items (if any donations exist)
3. Click "Accept Pickup" to accept a donation
4. Go to "My Pickups" to see your accepted pickups
5. Click "Mark as Delivered" to complete pickup

#### Admin Account
1. Go to "Admin Dashboard" - see platform stats
2. Go to "User Management" - see pending user approvals
3. Click "Approve" or "Reject" for users
4. See real-time statistics update

### 4. Test Logout
- Click "Logout" button in sidebar
- You should be redirected to login page

## File Structure

```
wpl-proj/
├── backend/
│   ├── api/                 # API endpoint files
│   ├── core/                # Core classes (Auth, Database, etc)
│   ├── config/              # Configuration
│   ├── cron/                # Scheduled tasks
│   ├── router.php           # Route handler
│   ├── schema.sql           # Database schema
│   └── README.md
│
├── frontend/
│   ├── api.js              # ✨ NEW - API service layer
│   ├── config.js           # ✨ NEW - Frontend configuration
│   ├── main.js             # ✨ UPDATED - App logic with API integration
│   ├── style.css           # CSS styling
│   ├── index.html          # ✨ UPDATED - HTML with logout button
│   ├── package.json        # npm dependencies
│   └── src/                # Source files
│
└── INTEGRATION_GUIDE.md    # ✨ NEW - Detailed integration docs
```

## Important URLs

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:5173 | 5173 |
| Backend API | http://localhost:8000/api | 8000 |
| MySQL | localhost | 3306 |

## Common Issues & Solutions

### Issue: Backend returns 404 errors
**Solution**: 
- Ensure backend is running: `php -S localhost:8000`
- Check backend/router.php is properly routing requests
- Verify API_BASE_URL in frontend/config.js matches backend port

### Issue: "Cannot login" or "Invalid credentials"
**Solution**:
- Ensure database has test users
- Run `mysql -u root -p < backend/schema.sql` to set up database
- Check mysql connection in backend/config/config.php

### Issue: CORS errors in console
**Solution**:
- Ensure both frontend and backend are running
- Frontend must be on localhost:5173 (as configured in backend CORS)
- Check CORS settings in backend/core/bootstrap.php

### Issue: "Token expired" immediately after login
**Solution**:
- Check server time synchronization
- Verify JWT_SECRET in config.php is correct
- Clear localStorage and try again

### Issue: Vite "Cannot find module" errors
**Solution**:
- Run `npm install` from frontend directory
- Ensure you're in the frontend directory: `cd frontend`
- Delete `node_modules` and package-lock.json, then reinstall

## Development Workflow

### Making Changes

1. **Backend Changes**:
   - Edit files in `backend/` folder
   - No restart needed - PHP reloads automatically
   - Test with curl or Postman

2. **Frontend Changes**:
   - Edit files in `frontend/` folder
   - Changes hot-reload automatically in browser
   - Check browser console for errors

3. **API Changes**:
   - Update endpoints in `backend/api/`
   - Update matching methods in `frontend/api.js`
   - Test from frontend forms

### Build for Production

```bash
# Backend
# Copy backend/ folder to production server
# Update config.php with production database credentials

# Frontend
cd frontend
npm run build
# Output goes to frontend/dist/ - deploy this folder
```

## Database Schema

The database is automatically set up by `backend/schema.sql`. It includes:
- **users** - User accounts (donors, ngos, admins)
- **donations** - Food donations posted by donors
- **pickup_requests** - Pickups accepted by NGOs
- **notifications** - User notifications
- **beneficiary_distributions** - Food distribution records

See `backend/schema.sql` for full schema details.

## API Documentation

For detailed API endpoint documentation, see [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

## Next Steps

1. ✅ Backend setup and database
2. ✅ Frontend setup and dependencies  
3. ✅ Test login flow
4. ✅ Test feature flows for each role
5. Add more test users to `database`
6. (Optional) Add profile/settings pages
7. (Optional) Add notifications feature
8. (Optional) Add geolocation/maps
9. Deploy to production

## Support

For issues or questions:
1. Check the console (F12) for error messages
2. Review INTEGRATION_GUIDE.md for detailed information
3. Check backend/README.md for backend-specific info
4. Review network tab in DevTools to see API calls

---

**Frontend & Backend Integration Complete! ✨**
