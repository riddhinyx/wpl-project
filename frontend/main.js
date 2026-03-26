import './style.css'
import api from './api.js'
import CONFIG from './config.js'

document.addEventListener('DOMContentLoaded', async () => {
  const routerView = document.getElementById('router-view');
  
  // Define HTML templates for each feature
  const pages = {
    // ---------------- DONOR INTERFACES ----------------
    'Food Donation Portal': `
      <header class="header animate-slide-up stagger-1">
        <div>
          <span class="label-md">Donor</span>
          <h1 class="headline-md">Food Donation Portal</h1>
        </div>
      </header>
      
      <div class="dashboard-grid animate-slide-up stagger-2" style="grid-template-columns: 1fr 1fr;">
        <div class="card" style="background-color: var(--surface);">
           <h3 class="headline-md" style="margin-bottom: var(--spacing-6);">Log Surplus Food</h3>
           <p class="body-md" style="margin-bottom: var(--spacing-6);">Help minimize food wastage by registering your excess food here.</p>
           
           <form id="donation-form" onsubmit="event.preventDefault();">
             <div class="form-group">
               <label class="title-sm">Food Type / Description</label>
               <input id="food_type" type="text" class="input-field" placeholder="E.g., 5 pans of rice, assorted baked goods..." required />
             </div>
             
             <div class="form-group">
               <label class="title-sm">Quantity (lbs or portions)</label>
               <input id="quantity" type="text" class="input-field" placeholder="E.g., 20" required />
             </div>
             
             <div class="form-group">
               <label class="title-sm">Unit</label>
               <select id="unit" class="input-field" required>
                 <option value="">Select unit</option>
                 <option value="lbs">lbs</option>
                 <option value="kg">kg</option>
                 <option value="portions">portions</option>
                 <option value="servings">servings</option>
               </select>
             </div>
             
             <div class="form-group">
               <label class="title-sm">Pickup Location</label>
               <input id="pickup_address" type="text" class="input-field" placeholder="123 Bakery St, Downtown" required />
             </div>
             
             <div class="form-group">
               <label class="title-sm">Description (optional)</label>
               <input id="description" type="text" class="input-field" placeholder="Additional details..." />
             </div>
             
             <div class="form-group">
               <label class="title-sm">Available From (Date & Time)</label>
               <input id="available_from" type="datetime-local" class="input-field" required />
             </div>
             
             <div class="form-group">
               <label class="title-sm">Available Until (Date & Time)</label>
               <input id="available_until" type="datetime-local" class="input-field" required />
             </div>
             
             <button type="submit" class="btn btn-primary" style="margin-top: var(--spacing-4);">
               <i class="ph ph-check-circle"></i> Submit Donation
             </button>
           </form>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: var(--spacing-8);">
           <div class="card hero-card">
              <span class="label-md" style="color: rgba(255,255,255,0.7)">Your Impact</span>
              <h2 class="display-lg" id="total_donated" style="margin: var(--spacing-4) 0;">0 lbs</h2>
              <p class="body-md" style="color: rgba(255,255,255,0.9);">Donated by you! Thank you for sharing the excess.</p>
           </div>
           <div class="card" style="background-color: var(--surface-container-highest);">
              <h3 class="headline-md" style="margin-bottom: var(--spacing-4);">Recent Donation</h3>
              <div id="recent_donation_status" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: var(--spacing-4);">
                 <p class="body-md">No donations yet</p>
              </div>
           </div>
        </div>
      </div>
    `,
    'Donation History': `
      <header class="header animate-slide-up stagger-1">
        <div>
          <span class="label-md">Donor</span>
          <h1 class="headline-md">Previous Donations</h1>
        </div>
      </header>
      <div class="card animate-slide-up stagger-2" style="background-color: var(--surface);">
         <p class="body-md" style="margin-bottom: var(--spacing-6);">Log of your previously donated items.</p>
         <div id="donations-list" style="display: flex; flex-direction: column; gap: var(--spacing-4);">
            <p class="body-md">Loading donations...</p>
         </div>
      </div>
    `,
    
    // ---------------- VOLUNTEER INTERFACES ----------------
    'Available Donations': `
      <header class="header animate-slide-up stagger-1">
        <div>
          <span class="label-md">Volunteer / NGO</span>
          <h1 class="headline-md">Available Food Donations</h1>
        </div>
      </header>
      <div class="card animate-slide-up stagger-2" style="background-color: var(--surface);">
         <p class="body-md" style="margin-bottom: var(--spacing-8);">Review nearby surplus food available for pickup and distribution.</p>
         
         <div id="available-donations-list" style="display: flex; flex-direction: column; gap: var(--spacing-6);">
            <p class="body-md">Loading available donations...</p>
         </div>
      </div>
    `,
    'My Pickups': `
      <header class="header animate-slide-up stagger-1">
        <div>
          <span class="label-md">Volunteer / NGO</span>
          <h1 class="headline-md">My Active Pickups</h1>
        </div>
      </header>
      <div class="card animate-slide-up stagger-2" style="background-color: var(--surface-container-low);">
         <h3 class="headline-md" style="margin-bottom: var(--spacing-4);">Status Tracking</h3>
         <p class="body-md" style="margin-bottom: var(--spacing-6);">Logistics tracking for your accepted food rescues.</p>
         
         <div id="pickups-list" style="display: flex; flex-direction: column; gap: var(--spacing-6);">
            <p class="body-md">Loading pickups...</p>
         </div>
      </div>
    `,
    
    // ---------------- ADMIN INTERFACES ----------------
    'Admin Dashboard': `
      <header class="header animate-slide-up stagger-1">
        <div>
          <span class="label-md">Administrator</span>
          <h1 class="headline-md">Redistribution Activity Overview</h1>
        </div>
      </header>
      
      <div class="dashboard-grid animate-slide-up stagger-2" style="grid-template-columns: 1fr 1fr 1fr;">
         <!-- Totals -->
         <div class="card hero-card">
           <h3 class="title-sm" style="color: rgba(255,255,255,0.7);">Total Donations (All Time)</h3>
           <h2 class="display-lg" id="admin_total_donations">0</h2>
           <p class="body-md" style="color: rgba(255,255,255,0.9);">Pounds of food redistributed</p>
         </div>
         
         <div class="card" style="background-color: var(--surface-container-highest);">
           <h3 class="title-sm" style="color: var(--on-surface-variant);">Active Users</h3>
           <h2 class="display-lg" id="admin_active_users">0</h2>
           <p class="body-md">Registered Volunteers & Donors</p>
         </div>
         
         <div class="card" style="background-color: var(--surface-container-highest);">
           <h3 class="title-sm" style="color: var(--on-surface-variant);">Food Distributed</h3>
           <h2 class="display-lg" id="admin_distributed">0</h2>
           <p class="body-md">Pounds distributed to beneficiaries</p>
         </div>
      </div>
      
      <div class="card animate-slide-up stagger-3" style="background-color: var(--surface); margin-top: var(--spacing-8);">
         <h3 class="headline-md" style="margin-bottom: var(--spacing-6);">Live Activity Monitor</h3>
         
         <table style="width: 100%; text-align: left; border-collapse: collapse;">
           <thead>
             <tr style="border-bottom: 2px solid var(--surface-variant);">
               <th style="padding: var(--spacing-4) 0; color: var(--on-surface-variant);">Donor</th>
               <th style="padding: var(--spacing-4) 0; color: var(--on-surface-variant);">NGO / Volunteer</th>
               <th style="padding: var(--spacing-4) 0; color: var(--on-surface-variant);">Food Type</th>
               <th style="padding: var(--spacing-4) 0; color: var(--on-surface-variant);">Status</th>
             </tr>
           </thead>
           <tbody id="admin_activity_table">
             <tr>
               <td colspan="4" style="padding: var(--spacing-4) 0; text-align: center;">Loading activity...</td>
             </tr>
           </tbody>
         </table>
      </div>
    `,
    'User Management': `
      <header class="header animate-slide-up stagger-1">
        <div>
          <span class="label-md">Administrator</span>
          <h1 class="headline-md">Manage Platform Users</h1>
        </div>
      </header>
      
      <div class="dashboard-grid animate-slide-up stagger-2" style="grid-template-columns: 2fr 1fr;">
         <div class="card" style="background-color: var(--surface);">
           <h3 class="headline-md" style="margin-bottom: var(--spacing-6);">Unverified Users</h3>
           
           <div id="unverified-users-list" style="display: flex; flex-direction: column; gap: var(--spacing-4);">
             <p class="body-md">Loading users...</p>
           </div>
         </div>
         
         <div class="card" style="background-color: var(--surface-container-highest);">
            <h3 class="headline-md" style="margin-bottom: var(--spacing-4);">User Metrics</h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--spacing-4);">
              <li style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px;">
                <span class="body-md">Verified Donors</span>
                <strong class="title-sm" id="metric_donors">0</strong>
              </li>
              <li style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px;">
                <span class="body-md">Verified NGOs</span>
                <strong class="title-sm" id="metric_ngos">0</strong>
              </li>
              <li style="display: flex; justify-content: space-between;">
                <span class="body-md">Admins</span>
                <strong class="title-sm" id="metric_admins">0</strong>
              </li>
            </ul>
         </div>
      </div>
    `
  };

  const navItems = document.querySelectorAll('.nav-item');
  const navMenu = document.querySelector('.nav-menu');
  const pageAccess = {
    'Food Donation Portal': [CONFIG.ROLE_DONOR],
    'Donation History': [CONFIG.ROLE_DONOR],
    'Available Donations': [CONFIG.ROLE_NGO],
    'My Pickups': [CONFIG.ROLE_NGO],
    'Admin Dashboard': [CONFIG.ROLE_ADMIN],
    'User Management': [CONFIG.ROLE_ADMIN],
  };

  const canAccessPage = (pageName, role) => {
    const allowedRoles = pageAccess[pageName];
    if (!allowedRoles) return false;
    return allowedRoles.includes(role);
  };

  const applyRoleBasedNavigation = (role) => {
    navItems.forEach((item) => {
      const pageName = item.querySelector('.nav-text')?.innerText.trim();
      const allowed = canAccessPage(pageName, role);
      item.style.display = allowed ? 'flex' : 'none';
      item.classList.toggle('active', false);
    });

    if (!navMenu) return;

    const children = Array.from(navMenu.children);
    for (let i = 0; i < children.length; i += 1) {
      const child = children[i];
      if (child.tagName !== 'DIV') continue;

      let hasVisiblePage = false;
      for (let j = i + 1; j < children.length; j += 1) {
        const sibling = children[j];
        if (sibling.tagName === 'DIV') break;
        if (sibling.classList.contains('nav-item') && sibling.style.display !== 'none') {
          hasVisiblePage = true;
          break;
        }
      }

      child.style.display = hasVisiblePage ? 'block' : 'none';
    }
  };
  
  // Function to show app and hide landing
  window.showApp = async () => {
    const landingPage = document.getElementById('landing-page');
    const appContainer = document.getElementById('app');
    if (landingPage) landingPage.style.display = 'none';
    if (appContainer) appContainer.style.display = 'flex';
    
    // Route to appropriate starting page
    const role = api.getUserRole();
    applyRoleBasedNavigation(role);

    let startPage = 'Food Donation Portal';
    if (role === CONFIG.ROLE_NGO) startPage = 'Available Donations';
    else if (role === CONFIG.ROLE_ADMIN) startPage = 'Admin Dashboard';
    
    const startNav = Array.from(navItems).find(item => 
      item.querySelector('.nav-text')?.innerText.trim() === startPage
    );
    if (startNav && startNav.style.display !== 'none') {
      startNav.click();
      return;
    }

    const firstAllowedNav = Array.from(navItems).find(item => item.style.display !== 'none');
    if (firstAllowedNav) {
      firstAllowedNav.click();
      return;
    }

    routerView.innerHTML = '<p class="body-md">No pages available for this role.</p>';
  };
  
  // Function to load page data based on page name
  async function loadPageData(pageName) {
    try {
      if (pageName === 'Food Donation Portal') {
        const [donations] = await Promise.all([api.getMyDonations()]);
        const totalQty = donations && donations.length > 0 
          ? donations.reduce((sum, d) => sum + parseFloat(d.quantity || 0), 0)
          : 0;
        const recentDonation = donations && donations[0];
        
        const totalEl = document.getElementById('total_donated');
        if (totalEl) totalEl.textContent = `${totalQty} ${donations[0]?.unit || 'lbs'}`;
        
        const recentEl = document.getElementById('recent_donation_status');
        if (recentEl && recentDonation) {
          recentEl.innerHTML = `
            <div>
              <h4 class="title-sm">${recentDonation.food_type}</h4>
              <p class="body-md" style="font-size: 0.875rem;">${recentDonation.quantity} ${recentDonation.unit}</p>
            </div>
            <span class="impact-chip">${recentDonation.status || 'pending'}</span>
          `;
        }
      } 
      else if (pageName === 'Donation History') {
        const donations = await api.getMyDonations();
        const list = document.getElementById('donations-list');
        if (list) {
          list.innerHTML = donations && donations.length > 0 ? donations.map(d => `
            <div style="background-color: var(--surface-container-low); padding: var(--spacing-6); border-radius: var(--rounded-lg); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 class="title-sm" style="font-size: 1.25rem;">${d.food_type}</h4>
                <p class="body-md" style="margin-top: var(--spacing-2);">${d.quantity} ${d.unit} &bull; Available: ${new Date(d.available_from).toLocaleDateString()}</p>
              </div>
              <span class="label-md" style="color: var(--on-surface);">${d.status}</span>
            </div>
          `).join('') : `<p class="body-md">No donations yet</p>`;
        }
      }
      else if (pageName === 'Available Donations') {
        const donations = await api.getAvailableDonations();
        const list = document.getElementById('available-donations-list');
        if (list) {
          list.innerHTML = donations && donations.length > 0 ? donations.map(d => `
            <div style="background-color: var(--surface-container-low); padding: var(--spacing-6); border-radius: var(--rounded-lg); display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; gap: var(--spacing-6); align-items: center; flex: 1;">
                <div style="width: 60px; height: 60px; border-radius: var(--rounded-md); background-color: var(--surface-container-highest); display: flex; align-items: center; justify-content: center; color: var(--secondary);">
                  <i class="ph ph-bag" style="font-size: 2rem;"></i>
                </div>
                <div>
                  <h4 class="title-sm" style="font-size: 1.25rem;">${d.food_type}</h4>
                  <p class="body-md" style="margin-top: 4px;">${d.quantity} ${d.unit} &bull; Available until: ${new Date(d.available_until).toLocaleDateString()}</p>
                  <p class="body-md" style="font-size: 0.875rem; color: var(--on-surface-variant); margin-top: 4px;"><i class="ph ph-map-pin"></i> ${d.pickup_address}</p>
                </div>
              </div>
              <button class="btn btn-secondary" onclick="acceptPickupHandler(${d.id})">Accept Pickup</button>
            </div>
          `).join('') : `<p class="body-md">No available donations</p>`;
        }
      }
      else if (pageName === 'My Pickups') {
        const pickups = await api.getMyPickups();
        const list = document.getElementById('pickups-list');
        if (list) {
          list.innerHTML = pickups && pickups.length > 0 ? pickups.map(p => `
            <div style="background-color: var(--surface-container-lowest); padding: var(--spacing-6); border-radius: var(--rounded-lg); margin-bottom: var(--spacing-6);">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h4 class="title-sm" style="font-size: 1.25rem;">${p.donation?.food_type || 'Food Donation'}</h4>
                  <p class="body-md">Quantity: ${p.donation?.quantity} ${p.donation?.unit}</p>
                  <p class="body-md">Status: ${p.status}</p>
                </div>
                <span class="impact-chip">${p.status}</span>
              </div>
              ${p.status === 'accepted' ? `<button class="btn btn-primary" style="margin-top: var(--spacing-6); width: 100%; justify-content: center;" onclick="completePickupHandler(${p.id})">Mark as Delivered</button>` : ''}
            </div>
          `).join('') : `<p class="body-md">No active pickups</p>`;
        }
      }
      else if (pageName === 'Admin Dashboard') {
        try {
          const stats = await api.getAdminStats();
          document.getElementById('admin_total_donations').textContent = stats.total_collected || '0';
          document.getElementById('admin_active_users').textContent = stats.total_users || '0';
          document.getElementById('admin_distributed').textContent = stats.total_distributed || '0';
          
          const donations = await api.getAllDonations();
          const table = document.getElementById('admin_activity_table');
          if (table && donations) {
            table.innerHTML = donations.slice(0, 5).map(d => `
              <tr style="border-bottom: 1px solid var(--surface-variant);">
                <td style="padding: var(--spacing-4) 0; font-weight: 600;">${d.donor?.name || 'Unknown'}</td>
                <td style="padding: var(--spacing-4) 0;">-</td>
                <td style="padding: var(--spacing-4) 0;">${d.food_type} (${d.quantity} ${d.unit})</td>
                <td style="padding: var(--spacing-4) 0;"><span class="impact-chip">${d.status}</span></td>
              </tr>
            `).join('');
          }
        } catch (e) {
          console.error('Error loading admin stats:', e);
        }
      }
      else if (pageName === 'User Management') {
        try {
          const users = await api.getAllUsers();
          const unverifiedList = document.getElementById('unverified-users-list');
          const unverifiedUsers = users ? users.filter(u => !u.is_verified) : [];
          
          if (unverifiedList) {
            unverifiedList.innerHTML = unverifiedUsers.length > 0 ? unverifiedUsers.map(u => `
              <div style="background-color: var(--surface-container-low); padding: var(--spacing-4); border-radius: var(--rounded-lg); display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h4 class="title-sm">${u.name}</h4>
                  <p class="body-md" style="font-size: 0.875rem;">${u.role} Account &bull; ${u.email}</p>
                </div>
                <div style="display: flex; gap: var(--spacing-2);">
                  <button class="btn btn-tertiary" onclick="deactivateUserHandler(${u.id})">Reject</button>
                  <button class="btn btn-secondary" onclick="verifyUserHandler(${u.id})">Approve</button>
                </div>
              </div>
            `).join('') : `<p class="body-md">No pending verifications</p>`;
          }
          
          // Count metrics
          const donors = users ? users.filter(u => u.role === 'donor' && u.is_verified).length : 0;
          const ngos = users ? users.filter(u => u.role === 'ngo' && u.is_verified).length : 0;
          const admins = users ? users.filter(u => u.role === 'admin').length : 0;
          
          document.getElementById('metric_donors').textContent = donors.toString();
          document.getElementById('metric_ngos').textContent = ngos.toString();
          document.getElementById('metric_admins').textContent = admins.toString();
        } catch (e) {
          console.error('Error loading users:', e);
        }
      }
    } catch (error) {
      console.error(`Error loading data for ${pageName}:`, error);
      alert('Error loading page: ' + error.message);
    }
  }
  
  // Global handler for accepting pickups
  window.acceptPickupHandler = async (donationId) => {
    try {
      const button = event.target;
      button.disabled = true;
      button.textContent = 'Accepting...';
      await api.acceptPickup(donationId);
      alert('Pickup accepted! The donor has been notified.');
      button.textContent = 'Accept Pickup';
      button.disabled = false;
      // Reload
      loadPageData('Available Donations');
    } catch (error) {
      alert('Error accepting pickup: ' + error.message);
      event.target.disabled = false;
      event.target.textContent = 'Accept Pickup';
    }
  };
  
  // Global handler for completing pickups
  window.completePickupHandler = async (pickupId) => {
    const beneficiaries = prompt('How many beneficiaries were fed?', '0');
    if (beneficiaries === null) return;
    
    try {
      await api.completePickup(pickupId, { 
        beneficiary_count: parseInt(beneficiaries),
        notes: ''
      });
      alert('Pickup marked as complete!');
      loadPageData('My Pickups');
    } catch (error) {
      alert('Error completing pickup: ' + error.message);
    }
  };
  
  // Global handler for verifying users
  window.verifyUserHandler = async (userId) => {
    try {
      await api.verifyUser(userId);
      alert('User verified successfully!');
      loadPageData('User Management');
    } catch (error) {
      alert('Error verifying user: ' + error.message);
    }
  };
  
  // Global handler for deactivating users
  window.deactivateUserHandler = async (userId) => {
    if (!confirm('Are you sure you want to reject this user?')) return;
    try {
      await api.deactivateUser(userId);
      alert('User deactivated');
      loadPageData('User Management');
    } catch (error) {
      alert('Error deactivating user: ' + error.message);
    }
  };
  
  // Set default page
  if (api.isAuthenticated()) {
    showApp();
  } else {
    routerView.innerHTML = pages['Food Donation Portal'];
  }
  
  navItems.forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      const pageName = item.querySelector('.nav-text')?.innerText.trim();
      const role = api.getUserRole();

      if (!canAccessPage(pageName, role)) {
        alert('You do not have access to this page.');
        return;
      }
      
      if (pages[pageName]) {
        // Remove active from all
        navItems.forEach(n => n.classList.remove('active'));
        // Add active to clicked
        item.classList.add('active');
        
        // Render content
        routerView.innerHTML = pages[pageName];
        
        // Load data
        await loadPageData(pageName);
        
        // Attach form handlers if this is a form page
        if (pageName === 'Food Donation Portal') {
          const form = document.getElementById('donation-form');
          if (form) {
            form.addEventListener('submit', async (e) => {
              e.preventDefault();
              try {
                const button = e.target.querySelector('button[type="submit"]');
                button.disabled = true;
                button.textContent = 'Submitting...';
                
                await api.createDonation({
                  food_type: document.getElementById('food_type').value,
                  quantity: parseFloat(document.getElementById('quantity').value),
                  unit: document.getElementById('unit').value,
                  pickup_address: document.getElementById('pickup_address').value,
                  description: document.getElementById('description').value || null,
                  available_from: new Date(document.getElementById('available_from').value).toISOString().slice(0, 19).replace('T', ' '),
                  available_until: new Date(document.getElementById('available_until').value).toISOString().slice(0, 19).replace('T', ' '),
                });
                
                alert('Donation submitted successfully! Nearby NGOs will be notified.');
                form.reset();
                button.disabled = false;
                button.textContent = 'Submit Donation';
                loadPageData('Food Donation Portal');
              } catch (error) {
                alert('Error: ' + error.message);
                e.target.querySelector('button[type="submit"]').disabled = false;
                e.target.querySelector('button[type="submit"]').textContent = 'Submit Donation';
              }
            });
          }
        }
      }
    });
  });

  // Attach global button micro-interactions
  document.body.addEventListener('mousedown', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) {
      btn.style.transform = 'scale(0.98)';
      btn.style.transition = 'transform 0.1s ease';
    }
  });
  
  document.body.addEventListener('mouseup', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) {
      btn.style.transform = '';
    }
  });
  
  document.body.addEventListener('mouseout', (e) => {
    const btn = e.target.closest('.btn');
    if (btn) {
      btn.style.transform = '';
    }
  });

  // Handle Login Flow
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const landingPage = document.getElementById('landing-page');
  const appContainer = document.getElementById('app');
  const loginContainer = document.getElementById('login-container');
  const signupContainer = document.getElementById('signup-container');
  
  // Toggle between login and signup forms
  const gotoSignupBtn = document.getElementById('goto-signup-btn');
  const gotoLoginBtn = document.getElementById('goto-login-btn');
  
  if (gotoSignupBtn) {
    gotoSignupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginContainer.style.display = 'none';
      signupContainer.style.display = 'block';
    });
  }
  
  if (gotoLoginBtn) {
    gotoLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      signupContainer.style.display = 'none';
      loginContainer.style.display = 'block';
    });
  }
  
  // Handle Signup Form Submission
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const name = document.getElementById('signup_name').value;
        const email = document.getElementById('signup_email').value;
        const password = document.getElementById('signup_password').value;
        const phone = document.getElementById('signup_phone').value;
        const address = document.getElementById('signup_address').value;
        const role = document.getElementById('signup_role').value;
        
        if (!name || !email || !password || !phone || !role) {
          alert('Please fill all required fields');
          return;
        }
        
        if (password.length < 8) {
          alert('Password must be at least 8 characters');
          return;
        }
        
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';
        
        await api.register({
          name,
          email,
          password,
          phone,
          address: address || null,
          role
        });
        
        alert('Account created successfully! Please log in with your credentials.');
        signupForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Account';
        
        // Switch back to login form
        signupContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        
        // Pre-fill email for convenience
        loginForm.querySelector('input[type="email"]').value = email;
        
      } catch (error) {
        alert('Registration failed: ' + error.message);
        signupForm.querySelector('button[type="submit"]').disabled = false;
        signupForm.querySelector('button[type="submit"]').textContent = 'Create Account';
      }
    });
  }
  
  // Handle Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      try {
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        const roleSelect = loginForm.querySelector('select');
        const selectedRole = roleSelect.value;
        
        if (!email || !password || !selectedRole) {
          alert('Please fill all fields');
          return;
        }
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        await api.login(email, password, selectedRole);
        
        // Clear form
        loginForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Log In';
        
        // Show app
        showApp();
      } catch (error) {
        alert('Login failed: ' + error.message);
        loginForm.querySelector('button[type="submit"]').disabled = false;
        loginForm.querySelector('button[type="submit"]').textContent = 'Log In';
      }
    });
  }
  
  // Handle Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await api.logout();
        // Reload page to show login form
        window.location.href = '/';
      } catch (error) {
        console.error('Logout error:', error);
        // Clear local storage and redirect anyway
        api.clearStorage();
        window.location.href = '/';
      }
    });
  }
});

