/**
 * Admin User Management Module
 * Implements user creation, permissions, and account management
 */

class AdminUserManagement {
  constructor() {
    this.isInitialized = false;
    this.users = [];
    this.roles = [
      { id: 'SYSTEM_ADMIN', name: 'System Administrator', description: 'Full system access' },
      { id: 'TRANSPORT_ADMIN', name: 'Transport Administrator', description: 'Transport service management only' },
      { id: 'CONTENT_EDITOR', name: 'Content Editor', description: 'Edit website content only' },
      { id: 'VIEWER', name: 'Viewer', description: 'View-only access to admin panel' }
    ];
    
    // Storage key for users
    this.STORAGE_KEY = 'adminUsers';
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', () => this.init());
  }
  
  /**
   * Initialize user management module
   */
  init() {
    if (this.isInitialized) return;
    
    console.log('Initializing Admin User Management module');
    
    // Load saved users
    this.loadUsers();
    
    // Create UI if the user management section exists
    this.createUserManagementUI();
    
    // Set up event listeners
    this.setupEventListeners();
    
    this.isInitialized = true;
  }
  
  /**
   * Load users from localStorage
   */
  loadUsers() {
    try {
      const savedUsers = localStorage.getItem(this.STORAGE_KEY);
      this.users = savedUsers ? JSON.parse(savedUsers) : [];
      
      // Ensure default admin user exists
      if (!this.users.find(user => user.username === 'admin')) {
        this.users.push({
          id: this.generateId(),
          username: 'admin',
          fullName: 'System Administrator',
          email: 'admin@srilankastay.com',
          role: 'SYSTEM_ADMIN',
          password: this.hashPassword('rangabandara2024'), // In a real app, this should be properly hashed
          active: true,
          created: new Date().toISOString(),
          lastLogin: null
        });
        
        // Save to localStorage
        this.saveUsers();
      }
      
      // Ensure default transport admin user exists
      if (!this.users.find(user => user.username === 'transport')) {
        this.users.push({
          id: this.generateId(),
          username: 'transport',
          fullName: 'Transport Manager',
          email: 'transport@srilankastay.com',
          role: 'TRANSPORT_ADMIN',
          password: this.hashPassword('transport2024'), // In a real app, this should be properly hashed
          active: true,
          created: new Date().toISOString(),
          lastLogin: null
        });
        
        // Save to localStorage
        this.saveUsers();
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.users = [];
    }
  }
  
  /**
   * Save users to localStorage
   */
  saveUsers() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }
  
  /**
   * Create user management UI elements
   */
  createUserManagementUI() {
    // Find the user management section or create it
    let userSection = document.getElementById('userManagementSection');
    
    if (!userSection) {
      // Create the section if it doesn't exist
      userSection = document.createElement('div');
      userSection.id = 'userManagementSection';
      userSection.className = 'admin-section';
      
      // Add to admin panel
      const adminPanel = document.querySelector('.admin-panel');
      if (adminPanel) {
        adminPanel.appendChild(userSection);
      } else {
        // If no admin panel, add to body
        document.body.appendChild(userSection);
      }
    }
    
    // Create section content
    userSection.innerHTML = `
      <h2 class="section-title">User Management</h2>
      <div class="section-description">
        <p>Manage system administrators and user accounts</p>
      </div>
      
      <div class="action-buttons">
        <button class="admin-btn" id="createUserBtn">
          <i class="fas fa-user-plus"></i> Add New User
        </button>
        <button class="admin-btn secondary" id="refreshUsersBtn">
          <i class="fas fa-sync"></i> Refresh
        </button>
      </div>
      
      <div class="users-container">
        <div class="users-filter">
          <div class="filter-group">
            <input type="text" id="userSearchInput" placeholder="Search users..." class="form-control">
          </div>
          <div class="filter-group">
            <select id="roleFilterSelect" class="form-control">
              <option value="all">All Roles</option>
              ${this.roles.map(role => `<option value="${role.id}">${role.name}</option>`).join('')}
            </select>
          </div>
          <div class="filter-group">
            <select id="statusFilterSelect" class="form-control">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        
        <div class="users-table-wrapper">
          <table class="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="usersTableBody">
              <!-- Will be populated dynamically -->
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Create/Edit User Modal -->
      <div id="userModal" class="admin-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h3 id="userModalTitle">Add New User</h3>
            <button class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <form id="userForm">
              <input type="hidden" id="userId">
              
              <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" class="form-control" required>
              </div>
              
              <div class="form-group">
                <label for="fullName">Full Name</label>
                <input type="text" id="fullName" class="form-control" required>
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" class="form-control" required>
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" class="form-control" autocomplete="new-password">
                <span class="form-hint" id="passwordHint">Leave blank to keep current password</span>
              </div>
              
              <div class="form-group">
                <label for="role">Role</label>
                <select id="role" class="form-control" required>
                  ${this.roles.map(role => `
                    <option value="${role.id}">${role.name}</option>
                  `).join('')}
                </select>
                <span class="form-hint" id="roleDescription"></span>
              </div>
              
              <div class="form-group">
                <label for="status">Status</label>
                <div class="toggle-switch">
                  <input type="checkbox" id="status" checked>
                  <label for="status">Active</label>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="admin-btn secondary" id="cancelUserBtn">Cancel</button>
            <button class="admin-btn primary" id="saveUserBtn">Save User</button>
          </div>
        </div>
      </div>
      
      <!-- Confirmation Modal -->
      <div id="confirmModal" class="admin-modal">
        <div class="modal-content" style="max-width: 400px;">
          <div class="modal-header">
            <h3>Confirm Action</h3>
            <button class="close-modal">&times;</button>
          </div>
          <div class="modal-body">
            <p id="confirmMessage">Are you sure you want to proceed?</p>
          </div>
          <div class="modal-footer">
            <button class="admin-btn secondary" id="cancelActionBtn">Cancel</button>
            <button class="admin-btn danger" id="confirmActionBtn">Confirm</button>
          </div>
        </div>
      </div>
    `;
    
    // Add CSS for users management
    this.addUserManagementStyles();
    
    // Populate user table
    this.renderUsersTable();
  }
  
  /**
   * Add CSS styles for user management
   */
  addUserManagementStyles() {
    if (document.getElementById('user-management-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'user-management-styles';
    styleEl.textContent = `
      .users-container {
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        margin-top: 20px;
        padding: 20px;
      }
      
      .users-filter {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
      }
      
      .filter-group {
        flex: 1;
      }
      
      .users-table-wrapper {
        overflow-x: auto;
      }
      
      .users-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .users-table th,
      .users-table td {
        padding: 12px 15px;
        text-align: left;
        border-bottom: 1px solid #eee;
      }
      
      .users-table th {
        background-color: #f8f9fa;
        font-weight: 600;
      }
      
      .users-table tr:hover {
        background-color: #f5f5f5;
      }
      
      .user-status {
        display: inline-block;
        padding: 3px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
      
      .user-status.active {
        background-color: #d4edda;
        color: #155724;
      }
      
      .user-status.inactive {
        background-color: #f8d7da;
        color: #721c24;
      }
      
      .user-actions {
        display: flex;
        gap: 5px;
      }
      
      .user-action-btn {
        padding: 5px;
        background: none;
        border: none;
        cursor: pointer;
        border-radius: 3px;
        color: #495057;
      }
      
      .user-action-btn:hover {
        background-color: #e9ecef;
      }
      
      .user-action-btn.edit {
        color: #0d6efd;
      }
      
      .user-action-btn.delete {
        color: #dc3545;
      }
      
      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 30px;
      }
      
      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }
      
      .toggle-switch label {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
        border-radius: 34px;
        padding: 5px 0 0 35px;
      }
      
      .toggle-switch label:before {
        position: absolute;
        content: "";
        height: 22px;
        width: 22px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
      }
      
      .toggle-switch input:checked + label {
        background-color: #2196F3;
        color: white;
        padding: 5px 35px 0 10px;
      }
      
      .toggle-switch input:checked + label:before {
        transform: translateX(30px);
      }
      
      .form-hint {
        display: block;
        margin-top: 5px;
        font-size: 12px;
        color: #6c757d;
      }
    `;
    
    document.head.appendChild(styleEl);
  }
  
  /**
   * Set up event listeners for user management
   */
  setupEventListeners() {
    // Create user button
    const createUserBtn = document.getElementById('createUserBtn');
    if (createUserBtn) {
      createUserBtn.addEventListener('click', () => this.showUserModal());
    }
    
    // Refresh users button
    const refreshUsersBtn = document.getElementById('refreshUsersBtn');
    if (refreshUsersBtn) {
      refreshUsersBtn.addEventListener('click', () => this.renderUsersTable());
    }
    
    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.hideUserModal();
        this.hideConfirmModal();
      });
    });
    
    // Cancel user button
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    if (cancelUserBtn) {
      cancelUserBtn.addEventListener('click', () => this.hideUserModal());
    }
    
    // Save user button
    const saveUserBtn = document.getElementById('saveUserBtn');
    if (saveUserBtn) {
      saveUserBtn.addEventListener('click', () => this.saveUser());
    }
    
    // Cancel action button
    const cancelActionBtn = document.getElementById('cancelActionBtn');
    if (cancelActionBtn) {
      cancelActionBtn.addEventListener('click', () => this.hideConfirmModal());
    }
    
    // Confirm action button
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    if (confirmActionBtn) {
      confirmActionBtn.addEventListener('click', () => this.executeConfirmedAction());
    }
    
    // Search input
    const searchInput = document.getElementById('userSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterUsers());
    }
    
    // Role filter
    const roleFilter = document.getElementById('roleFilterSelect');
    if (roleFilter) {
      roleFilter.addEventListener('change', () => this.filterUsers());
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilterSelect');
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.filterUsers());
    }
    
    // Role description
    const roleSelect = document.getElementById('role');
    if (roleSelect) {
      roleSelect.addEventListener('change', () => this.updateRoleDescription());
    }
  }
  
  /**
   * Update the role description when role is selected
   */
  updateRoleDescription() {
    const roleSelect = document.getElementById('role');
    const roleDescription = document.getElementById('roleDescription');
    
    if (!roleSelect || !roleDescription) return;
    
    const selectedRole = this.roles.find(role => role.id === roleSelect.value);
    if (selectedRole) {
      roleDescription.textContent = selectedRole.description;
    } else {
      roleDescription.textContent = '';
    }
  }
  
  /**
   * Render the users table
   */
  renderUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    // Clear table
    tableBody.innerHTML = '';
    
    // Sort users by username
    const sortedUsers = [...this.users].sort((a, b) => a.username.localeCompare(b.username));
    
    // Render each user
    sortedUsers.forEach(user => {
      const row = document.createElement('tr');
      row.dataset.id = user.id;
      
      // Format dates
      const created = user.created ? new Date(user.created).toLocaleDateString() : 'N/A';
      const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never';
      
      // Get role name
      const role = this.roles.find(r => r.id === user.role);
      const roleName = role ? role.name : user.role;
      
      row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.fullName}</td>
        <td>${user.email}</td>
        <td>${roleName}</td>
        <td>
          <span class="user-status ${user.active ? 'active' : 'inactive'}">
            ${user.active ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td>${created}</td>
        <td>${lastLogin}</td>
        <td>
          <div class="user-actions">
            <button class="user-action-btn edit" title="Edit user" data-id="${user.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="user-action-btn delete" title="Delete user" data-id="${user.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      
      // Add to table
      tableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    this.addTableActionListeners();
  }
  
  /**
   * Add event listeners to table action buttons
   */
  addTableActionListeners() {
    // Edit buttons
    const editButtons = document.querySelectorAll('.user-action-btn.edit');
    editButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const userId = e.currentTarget.dataset.id;
        this.editUser(userId);
      });
    });
    
    // Delete buttons
    const deleteButtons = document.querySelectorAll('.user-action-btn.delete');
    deleteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const userId = e.currentTarget.dataset.id;
        this.confirmDeleteUser(userId);
      });
    });
  }
  
  /**
   * Filter users based on search input and filters
   */
  filterUsers() {
    const searchInput = document.getElementById('userSearchInput');
    const roleFilter = document.getElementById('roleFilterSelect');
    const statusFilter = document.getElementById('statusFilterSelect');
    const tableRows = document.querySelectorAll('#usersTableBody tr');
    
    if (!searchInput || !roleFilter || !statusFilter) return;
    
    const search = searchInput.value.toLowerCase();
    const role = roleFilter.value;
    const status = statusFilter.value;
    
    // Loop through all table rows
    tableRows.forEach(row => {
      const userId = row.dataset.id;
      const user = this.users.find(u => u.id === userId);
      
      if (!user) return;
      
      // Check if user matches all filters
      const matchesSearch = search === '' || 
                           user.username.toLowerCase().includes(search) || 
                           user.fullName.toLowerCase().includes(search) || 
                           user.email.toLowerCase().includes(search);
                           
      const matchesRole = role === 'all' || user.role === role;
      const matchesStatus = status === 'all' || 
                           (status === 'active' && user.active) || 
                           (status === 'inactive' && !user.active);
      
      // Show/hide row based on filter matches
      if (matchesSearch && matchesRole && matchesStatus) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  }
  
  /**
   * Show the user modal for creating a new user
   */
  showUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const title = document.getElementById('userModalTitle');
    const passwordHint = document.getElementById('passwordHint');
    
    if (!modal || !form || !title) return;
    
    // Reset form
    form.reset();
    
    if (userId) {
      // Edit mode
      title.textContent = 'Edit User';
      passwordHint.style.display = '';
      
      // Find user
      const user = this.users.find(u => u.id === userId);
      if (!user) return;
      
      // Fill form
      document.getElementById('userId').value = user.id;
      document.getElementById('username').value = user.username;
      document.getElementById('fullName').value = user.fullName;
      document.getElementById('email').value = user.email;
      document.getElementById('role').value = user.role;
      document.getElementById('status').checked = user.active;
      
      // Update role description
      this.updateRoleDescription();
    } else {
      // Create mode
      title.textContent = 'Add New User';
      passwordHint.style.display = 'none';
      document.getElementById('userId').value = '';
      
      // Set default role
      if (document.getElementById('role')) {
        document.getElementById('role').value = 'CONTENT_EDITOR';
        this.updateRoleDescription();
      }
    }
    
    // Show modal
    modal.classList.add('active');
  }
  
  /**
   * Hide the user modal
   */
  hideUserModal() {
    const modal = document.getElementById('userModal');
    if (!modal) return;
    
    modal.classList.remove('active');
  }
  
  /**
   * Edit an existing user
   */
  editUser(userId) {
    this.showUserModal(userId);
  }
  
  /**
   * Confirm user deletion
   */
  confirmDeleteUser(userId) {
    // Find user
    const user = this.users.find(u => u.id === userId);
    if (!user) return;
    
    // Cannot delete self or default admin
    if (user.username === 'admin') {
      this.showNotification('Cannot delete the default administrator account', 'error');
      return;
    }
    
    // Set confirmation message
    const confirmMessage = document.getElementById('confirmMessage');
    if (confirmMessage) {
      confirmMessage.textContent = `Are you sure you want to delete the user "${user.username}"? This action cannot be undone.`;
    }
    
    // Store user ID for action execution
    this.pendingAction = {
      type: 'deleteUser',
      id: userId
    };
    
    // Show confirmation modal
    this.showConfirmModal();
  }
  
  /**
   * Show confirmation modal
   */
  showConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    
    modal.classList.add('active');
  }
  
  /**
   * Hide confirmation modal
   */
  hideConfirmModal() {
    const modal = document.getElementById('confirmModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    this.pendingAction = null;
  }
  
  /**
   * Execute confirmed action
   */
  executeConfirmedAction() {
    if (!this.pendingAction) return;
    
    // Execute action based on type
    if (this.pendingAction.type === 'deleteUser') {
      this.deleteUser(this.pendingAction.id);
    }
    
    // Hide confirmation modal
    this.hideConfirmModal();
    
    // Clear pending action
    this.pendingAction = null;
  }
  
  /**
   * Delete a user
   */
  deleteUser(userId) {
    // Find user index
    const userIndex = this.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return;
    
    // Remove user
    this.users.splice(userIndex, 1);
    
    // Save changes
    this.saveUsers();
    
    // Update UI
    this.renderUsersTable();
    
    // Show notification
    this.showNotification('User deleted successfully');
  }
  
  /**
   * Save user from form
   */
  saveUser() {
    // Get form values
    const userId = document.getElementById('userId').value.trim();
    const username = document.getElementById('username').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const active = document.getElementById('status').checked;
    
    // Validate required fields
    if (!username || !fullName || !email || !role) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Check if username is already taken (except for editing the same user)
    const existingUser = this.users.find(u => u.username === username && u.id !== userId);
    if (existingUser) {
      this.showNotification('Username is already taken', 'error');
      return;
    }
    
    if (userId) {
      // Update existing user
      const userIndex = this.users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        // Don't update password if not provided
        if (password) {
          this.users[userIndex].password = this.hashPassword(password);
        }
        
        // Update other fields
        this.users[userIndex].username = username;
        this.users[userIndex].fullName = fullName;
        this.users[userIndex].email = email;
        this.users[userIndex].role = role;
        this.users[userIndex].active = active;
      }
    } else {
      // Create new user
      if (!password) {
        this.showNotification('Password is required for new users', 'error');
        return;
      }
      
      // Add new user
      this.users.push({
        id: this.generateId(),
        username,
        fullName,
        email,
        role,
        password: this.hashPassword(password),
        active,
        created: new Date().toISOString(),
        lastLogin: null
      });
    }
    
    // Save changes
    this.saveUsers();
    
    // Update UI
    this.renderUsersTable();
    
    // Hide modal
    this.hideUserModal();
    
    // Show notification
    this.showNotification(`User ${userId ? 'updated' : 'created'} successfully`);
  }
  
  /**
   * Generate unique ID for user
   */
  generateId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * Hash password (for demo purposes only - in production use proper hashing)
   */
  hashPassword(password) {
    // In a real app, you'd use a proper hashing library
    // This is a simple representation for demo purposes
    return btoa(password);
  }
  
  /**
   * Show notification message
   */
  showNotification(message, type = 'success') {
    // Use toastr if available
    if (window.toastr) {
      if (type === 'error') {
        toastr.error(message);
      } else {
        toastr.success(message);
      }
      return;
    }
    
    // Fallback to alert
    alert(message);
  }
}

// Initialize the user management module
window.AdminUserManagement = new AdminUserManagement(); 