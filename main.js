import './style.css'

document.addEventListener('DOMContentLoaded', () => {
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
           
           <form onsubmit="event.preventDefault(); alert('Food Donation Submitted Successfully!');">
             <div class="form-group">
               <label class="title-sm">Food Type / Description</label>
               <input type="text" class="input-field" placeholder="E.g., 5 pans of rice, assorted baked goods..." required />
             </div>
             
             <div class="form-group">
               <label class="title-sm">Quantity (lbs or portions)</label>
               <input type="text" class="input-field" placeholder="E.g., 20 lbs" required />
             </div>
             
             <div class="form-group">
               <label class="title-sm">Pickup Location</label>
               <input type="text" class="input-field" placeholder="123 Bakery St, Downtown" required />
             </div>
             
             <div class="form-group">
               <label class="title-sm">Available Pickup Time</label>
               <input type="time" class="input-field" required />
             </div>
             
             <button type="submit" class="btn btn-primary" style="margin-top: var(--spacing-4);">
               <i class="ph ph-check-circle"></i> Submit Donation
             </button>
           </form>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: var(--spacing-8);">
           <div class="card hero-card">
              <span class="label-md" style="color: rgba(255,255,255,0.7)">Your Impact</span>
              <h2 class="display-lg" style="margin: var(--spacing-4) 0;">420 lbs</h2>
              <p class="body-md" style="color: rgba(255,255,255,0.9);">Donated by you this month! Thank you for sharing the excess.</p>
           </div>
           <div class="card" style="background-color: var(--surface-container-highest);">
              <h3 class="headline-md" style="margin-bottom: var(--spacing-4);">Recent Donation Status</h3>
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: var(--spacing-4);">
                 <div>
                   <h4 class="title-sm">Assorted Baked Goods</h4>
                   <p class="body-md" style="font-size: 0.875rem;">15 lbs</p>
                 </div>
                 <span class="impact-chip">Collected</span>
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
         <div style="display: flex; flex-direction: column; gap: var(--spacing-4);">
            <div style="background-color: var(--surface-container-low); padding: var(--spacing-6); border-radius: var(--rounded-lg); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 class="title-sm" style="font-size: 1.25rem;">Rice & Curry Spread</h4>
                <p class="body-md" style="margin-top: var(--spacing-2);">May 12, 2026 &bull; 40 lbs collected by NGO Shelter Central</p>
              </div>
              <span class="label-md" style="color: var(--on-surface);">Distributed</span>
            </div>
            
            <div style="background-color: var(--surface-container-low); padding: var(--spacing-6); border-radius: var(--rounded-lg); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 class="title-sm" style="font-size: 1.25rem;">Breakfast Pastries</h4>
                <p class="body-md" style="margin-top: var(--spacing-2);">May 10, 2026 &bull; 10 lbs collected by Volunteer Anna K.</p>
              </div>
              <span class="label-md" style="color: var(--on-surface);">Distributed</span>
            </div>
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
         
         <div style="display: flex; flex-direction: column; gap: var(--spacing-6);">
            <!-- Item 1 -->
            <div style="background-color: var(--surface-container-low); padding: var(--spacing-6); border-radius: var(--rounded-lg); display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; gap: var(--spacing-6); align-items: center;">
                <div style="width: 60px; height: 60px; border-radius: var(--rounded-md); background-color: var(--surface-container-highest); display: flex; align-items: center; justify-content: center; color: var(--secondary);">
                  <i class="ph ph-bag" style="font-size: 2rem;"></i>
                </div>
                <div>
                  <h4 class="title-sm" style="font-size: 1.25rem;">Fresh Produce Box</h4>
                  <p class="body-md" style="margin-top: 4px;">Donor: Harvest Market &bull; Quantity: 50 lbs &bull; Pickup Time: Pre-5 PM</p>
                  <p class="body-md" style="font-size: 0.875rem; color: var(--on-surface-variant); margin-top: 4px;"><i class="ph ph-map-pin"></i> 841 Green Avenue (2.1 miles away)</p>
                </div>
              </div>
              <button class="btn btn-secondary" onclick="alert('You have accepted this pickup! The donor has been notified.')">Accept Request</button>
            </div>
            
            <!-- Item 2 -->
            <div style="background-color: var(--surface-container-low); padding: var(--spacing-6); border-radius: var(--rounded-lg); display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; gap: var(--spacing-6); align-items: center;">
                <div style="width: 60px; height: 60px; border-radius: var(--rounded-md); background-color: var(--surface-container-highest); display: flex; align-items: center; justify-content: center; color: var(--secondary);">
                  <i class="ph ph-bowl-food" style="font-size: 2rem;"></i>
                </div>
                <div>
                  <h4 class="title-sm" style="font-size: 1.25rem;">Prepared Hot Meals</h4>
                  <p class="body-md" style="margin-top: 4px;">Donor: Grand Banquet Hall &bull; Quantity: 100 portions &bull; Pickup Time: ASAP</p>
                  <p class="body-md" style="font-size: 0.875rem; color: var(--on-surface-variant); margin-top: 4px;"><i class="ph ph-map-pin"></i> 100 Main St (4.5 miles away)</p>
                </div>
              </div>
              <button class="btn btn-secondary" onclick="alert('You have accepted this pickup! The donor has been notified.')">Accept Request</button>
            </div>
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
         
         <div style="background-color: var(--surface-container-lowest); padding: var(--spacing-6); border-radius: var(--rounded-lg); margin-bottom: var(--spacing-6);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h4 class="title-sm" style="font-size: 1.25rem;">Vegetable Surplus</h4>
                <p class="body-md">Pickup From: Green Grocers</p>
                <p class="body-md">Deliver To: Community Kitchen #3</p>
              </div>
              <span class="impact-chip">In Transit</span>
            </div>
            
            <!-- Simple custom progress bar for tracking -->
            <div style="margin-top: var(--spacing-6); display: flex; justify-content: space-between; position: relative;">
               <div style="position: absolute; top: 12px; left: 0; right: 0; height: 2px; background-color: var(--surface-variant); z-index: 1;"></div>
               <div style="position: absolute; top: 12px; left: 0; width: 50%; height: 2px; background-color: var(--primary); z-index: 2;"></div>
               
               <div style="background: var(--primary); width: 24px; height: 24px; border-radius: 50%; z-index: 3; display: flex; justify-content: center; align-items: center; color: white; font-size: 12px;"><i class="ph ph-check"></i></div>
               <div style="background: var(--primary); width: 24px; height: 24px; border-radius: 50%; z-index: 3; display: flex; justify-content: center; align-items: center; color: white; font-size: 12px;"><i class="ph ph-check"></i></div>
               <div style="background: var(--surface-highest); border: 2px solid var(--primary); width: 24px; height: 24px; border-radius: 50%; z-index: 3;"></div>
            </div>
            <div style="margin-top: var(--spacing-2); display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--on-surface-variant);">
              <span>Accepted</span>
              <span>Picked Up</span>
              <span>Delivered</span>
            </div>
            
            <button class="btn btn-primary" style="margin-top: var(--spacing-6); width: 100%; justify-content: center;" onclick="alert('Status updated to Delivered! Beneficiaries fed.')">Mark as Delivered</button>
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
           <h2 class="display-lg">14,250</h2>
           <p class="body-md" style="color: rgba(255,255,255,0.9);">Pounds of food redistributed</p>
         </div>
         
         <div class="card" style="background-color: var(--surface-container-highest);">
           <h3 class="title-sm" style="color: var(--on-surface-variant);">Active Users</h3>
           <h2 class="display-lg">248</h2>
           <p class="body-md">Registered Volunteers & Donors</p>
         </div>
         
         <div class="card" style="background-color: var(--surface-container-highest);">
           <h3 class="title-sm" style="color: var(--on-surface-variant);">Active Deliveries</h3>
           <h2 class="display-lg">12</h2>
           <p class="body-md">Shipments currently in transit</p>
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
           <tbody>
             <tr style="border-bottom: 1px solid var(--surface-variant);">
               <td style="padding: var(--spacing-4) 0; font-weight: 600;">Harvest Market</td>
               <td style="padding: var(--spacing-4) 0;">Sarah M.</td>
               <td style="padding: var(--spacing-4) 0;">Produce (50 lbs)</td>
               <td style="padding: var(--spacing-4) 0;"><span class="impact-chip">In Transit</span></td>
             </tr>
             <tr style="border-bottom: 1px solid var(--surface-variant);">
               <td style="padding: var(--spacing-4) 0; font-weight: 600;">Downtown Bakery</td>
               <td style="padding: var(--spacing-4) 0;">Shelter Central</td>
               <td style="padding: var(--spacing-4) 0;">Baked Goods (15 lbs)</td>
               <td style="padding: var(--spacing-4) 0;"><span class="label-md">Delivered</span></td>
             </tr>
             <tr>
               <td style="padding: var(--spacing-4) 0; font-weight: 600;">Grand Banquet</td>
               <td style="padding: var(--spacing-4) 0;">Unassigned</td>
               <td style="padding: var(--spacing-4) 0;">Hot Meals (100)</td>
               <td style="padding: var(--spacing-4) 0;"><span class="impact-chip" style="background: var(--surface-variant);">Pending Pickup</span></td>
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
        <div style="display: flex; gap: var(--spacing-4);">
          <input type="text" class="input-field" placeholder="Search users by name..." style="min-width: 300px; margin-bottom: 0;" />
          <button class="btn btn-primary">Filter</button>
        </div>
      </header>
      
      <div class="dashboard-grid animate-slide-up stagger-2" style="grid-template-columns: 2fr 1fr;">
         <div class="card" style="background-color: var(--surface);">
           <h3 class="headline-md" style="margin-bottom: var(--spacing-6);">User Verifications Pending</h3>
           
           <div style="display: flex; flex-direction: column; gap: var(--spacing-4);">
             <div style="background-color: var(--surface-container-low); padding: var(--spacing-4); border-radius: var(--rounded-lg); display: flex; justify-content: space-between; align-items: center;">
               <div>
                  <h4 class="title-sm">Food Bank of the East</h4>
                  <p class="body-md" style="font-size: 0.875rem;">NGO Account Request &bull; Submitted 2 hrs ago</p>
               </div>
               <div style="display: flex; gap: var(--spacing-2);">
                  <button class="btn btn-tertiary">Reject</button>
                  <button class="btn btn-secondary">Approve</button>
               </div>
             </div>
             <div style="background-color: var(--surface-container-low); padding: var(--spacing-4); border-radius: var(--rounded-lg); display: flex; justify-content: space-between; align-items: center;">
               <div>
                  <h4 class="title-sm">Michael Chang</h4>
                  <p class="body-md" style="font-size: 0.875rem;">Volunteer Driver Request &bull; Submitted 1 day ago</p>
               </div>
               <div style="display: flex; gap: var(--spacing-2);">
                  <button class="btn btn-tertiary">Reject</button>
                  <button class="btn btn-secondary">Approve</button>
               </div>
             </div>
           </div>
         </div>
         
         <div class="card" style="background-color: var(--surface-container-highest);">
            <h3 class="headline-md" style="margin-bottom: var(--spacing-4);">User Metrics</h3>
            <ul style="list-style: none; display: flex; flex-direction: column; gap: var(--spacing-4);">
              <li style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px;">
                <span class="body-md">Verified Donors</span>
                <strong class="title-sm">82</strong>
              </li>
              <li style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px;">
                <span class="body-md">Verified Volunteers</span>
                <strong class="title-sm">144</strong>
              </li>
              <li style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 8px;">
                <span class="body-md">Verified NGOs</span>
                <strong class="title-sm">22</strong>
              </li>
            </ul>
         </div>
      </div>
    `
  };

  const navItems = document.querySelectorAll('.nav-item');
  
  // Set default page
  routerView.innerHTML = pages['Food Donation Portal'];
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const pageName = item.querySelector('.nav-text').innerText.trim();
      
      if (pages[pageName]) {
        // Remove active from all
        navItems.forEach(n => n.classList.remove('active'));
        // Add active to clicked
        item.classList.add('active');
        
        // Render content
        routerView.innerHTML = pages[pageName];
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
  const landingPage = document.getElementById('landing-page');
  const appContainer = document.getElementById('app');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const roleSelect = loginForm.querySelector('select');
      const selectedRole = roleSelect.value;
      
      // Hide landing page, show app container
      landingPage.style.display = 'none';
      appContainer.style.display = 'flex';
      
      // Route to correct starting page based on role selector
      let targetPage = 'Food Donation Portal'; // fallback
      
      if (selectedRole === 'donor') {
        targetPage = 'Food Donation Portal';
      } else if (selectedRole === 'ngo') {
        targetPage = 'Available Donations';
      } else if (selectedRole === 'admin') {
        targetPage = 'Admin Dashboard';
      }
      
      // Update navigation highlighting and router view
      navItems.forEach(n => n.classList.remove('active'));
      const targetNav = Array.from(navItems).find(item => item.querySelector('.nav-text').innerText.trim() === targetPage);
      if (targetNav) targetNav.classList.add('active');
      
      routerView.innerHTML = pages[targetPage];
    });
  }
});
