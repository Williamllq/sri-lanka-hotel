/**
 * 用户认证系统
 * 实现登录、注册、用户会话管理功能
 */

// 立即执行函数，避免全局变量污染
(function() {
    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
        console.log('User authentication system initialized');
        initAuthUI();
        checkAuthStatus();
    });

    // 初始化认证UI
    function initAuthUI() {
        // 不再创建登录/注册按钮，使用已有的导航栏按钮
        // 检查导航栏中是否已存在登录按钮
        const existingAuthBtn = document.getElementById('authToggleBtn');
        if (!existingAuthBtn) {
            console.warn('Auth button not found in navigation');
            // 创建登录/注册按钮 (仅在导航栏中不存在时)
            const authButton = document.createElement('div');
            authButton.className = 'auth-button';
            authButton.innerHTML = `
                <button id="authToggleBtn" class="btn auth-toggle-btn">
                    <i class="fas fa-user"></i> <span id="authBtnText">Login</span>
                </button>
            `;
            
            // 将按钮添加到导航栏
            const navMenu = document.querySelector('nav ul') || document.querySelector('header ul');
            if (navMenu) {
                const li = document.createElement('li');
                li.className = 'auth-nav-item';
                li.appendChild(authButton);
                navMenu.appendChild(li);
            } else {
                const header = document.querySelector('header') || document.querySelector('.header');
                if (header) {
                    header.appendChild(authButton);
                } else {
                    console.warn('Could not find navigation or header to add auth button');
                }
            }
        }

        // 创建认证模态框
        const authModal = document.createElement('div');
        authModal.className = 'auth-modal';
        authModal.id = 'authModal';
        authModal.innerHTML = `
            <div class="auth-modal-content">
                <span class="auth-close">&times;</span>
                <div class="auth-tabs">
                    <button class="auth-tab active" data-tab="login">Login</button>
                    <button class="auth-tab" data-tab="register">Register</button>
                </div>
                
                <div class="auth-tab-content active" id="loginTab">
                    <h3>Login to Your Account</h3>
                    <form id="loginForm">
                        <div class="auth-form-group">
                            <label for="loginEmail">Email</label>
                            <input type="email" id="loginEmail" required>
                        </div>
                        <div class="auth-form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" required>
                        </div>
                        <div class="auth-form-actions">
                            <button type="submit" class="btn auth-submit">Login</button>
                        </div>
                    </form>
                </div>
                
                <div class="auth-tab-content" id="registerTab">
                    <h3>Create New Account</h3>
                    <form id="registerForm">
                        <div class="auth-form-group">
                            <label for="registerName">Full Name</label>
                            <input type="text" id="registerName" required>
                        </div>
                        <div class="auth-form-group">
                            <label for="registerEmail">Email</label>
                            <input type="email" id="registerEmail" required>
                        </div>
                        <div class="auth-form-group">
                            <label for="registerPassword">Password</label>
                            <input type="password" id="registerPassword" required>
                        </div>
                        <div class="auth-form-group">
                            <label for="registerConfirmPassword">Confirm Password</label>
                            <input type="password" id="registerConfirmPassword" required>
                        </div>
                        <div class="auth-form-actions">
                            <button type="submit" class="btn auth-submit">Register</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            /* 导航菜单中登录按钮的样式 */
            nav ul li #authToggleBtn {
                display: inline-block;
                text-decoration: none;
                color: inherit;
                background: none;
                border: none;
                font-size: inherit;
                padding: 0;
                cursor: pointer;
                font-family: inherit;
            }
            
            nav ul li #authToggleBtn:hover {
                color: #4a6fa5;
            }
            
            /* 原有样式 */
            .auth-button {
                display: inline-block;
                margin-left: 15px;
            }
            
            .auth-toggle-btn {
                background-color: #4a6fa5;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .auth-toggle-btn:hover {
                background-color: #3a5d8f;
            }
            
            .auth-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                z-index: 1000;
                align-items: center;
                justify-content: center;
            }
            
            .auth-modal-content {
                background-color: white;
                width: 90%;
                max-width: 400px;
                border-radius: 8px;
                padding: 20px;
                position: relative;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            }
            
            .auth-close {
                position: absolute;
                top: 10px;
                right: 15px;
                font-size: 24px;
                color: #999;
                cursor: pointer;
            }
            
            .auth-close:hover {
                color: #333;
            }
            
            .auth-tabs {
                display: flex;
                border-bottom: 1px solid #eee;
                margin-bottom: 20px;
            }
            
            .auth-tab {
                background: none;
                border: none;
                padding: 10px 15px;
                cursor: pointer;
                font-size: 16px;
                color: #666;
                border-bottom: 2px solid transparent;
            }
            
            .auth-tab:hover {
                color: #333;
            }
            
            .auth-tab.active {
                color: #4a6fa5;
                border-bottom-color: #4a6fa5;
                font-weight: 500;
            }
            
            .auth-tab-content {
                display: none;
            }
            
            .auth-tab-content.active {
                display: block;
            }
            
            .auth-form-group {
                margin-bottom: 15px;
            }
            
            .auth-form-group label {
                display: block;
                margin-bottom: 5px;
                font-size: 14px;
                color: #555;
            }
            
            .auth-form-group input {
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            }
            
            .auth-form-actions {
                margin-top: 20px;
            }
            
            .auth-submit {
                width: 100%;
                padding: 10px;
                background-color: #4a6fa5;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
            }
            
            .auth-submit:hover {
                background-color: #3a5d8f;
            }
            
            .user-menu {
                position: relative;
                display: inline-block;
            }
            
            .user-menu-content {
                display: none;
                position: absolute;
                right: 0;
                top: 40px;
                background-color: white;
                min-width: 180px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                border-radius: 4px;
                z-index: 10;
            }
            
            .user-menu:hover .user-menu-content {
                display: block;
            }
            
            .user-menu-item {
                padding: 10px 15px;
                display: block;
                color: #333;
                text-decoration: none;
                font-size: 14px;
                cursor: pointer;
            }
            
            .user-menu-item:hover {
                background-color: #f5f5f5;
            }
            
            .user-menu-divider {
                border-top: 1px solid #eee;
                margin: 5px 0;
            }
        `;
        document.head.appendChild(style);

        // 添加模态框到body
        document.body.appendChild(authModal);

        // 添加事件监听器
        const authToggleBtn = document.getElementById('authToggleBtn');
        if (authToggleBtn) {
            authToggleBtn.addEventListener('click', toggleAuthModal);
        } else {
            console.error('Auth toggle button not found');
        }
        
        document.querySelector('.auth-close').addEventListener('click', closeAuthModal);
        
        // 标签切换
        const tabs = document.querySelectorAll('.auth-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                const tabContent = document.querySelectorAll('.auth-tab-content');
                tabContent.forEach(content => content.classList.remove('active'));
                
                const tabId = this.getAttribute('data-tab') + 'Tab';
                document.getElementById(tabId).classList.add('active');
            });
        });

        // 表单提交
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
        document.getElementById('registerForm').addEventListener('submit', handleRegister);

        // 点击模态框外部关闭
        window.addEventListener('click', function(event) {
            const modal = document.getElementById('authModal');
            if (event.target === modal) {
                closeAuthModal();
            }
        });
    }

    // 切换认证模态框
    function toggleAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
        }
    }

    // 关闭认证模态框
    function closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // 处理登录
    function handleLogin(event) {
        event.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        
        // 获取用户数据
        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        if (!users[email]) {
            alert('User not found. Please check your email or register.');
            return;
        }
        
        if (users[email].password !== password) {
            alert('Incorrect password. Please try again.');
            return;
        }
        
        // 登录成功
        const user = users[email];
        // 移除密码敏感信息
        const sessionUser = {
            name: user.name,
            email: user.email
        };
        
        // 保存会话
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));
        
        // 关闭模态框并更新UI
        closeAuthModal();
        updateAuthUI();
        alert('Login successful! Welcome back, ' + user.name);
        
        // 刷新页面
        window.location.reload();
    }

    // 处理注册
    function handleRegister(event) {
        event.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill out all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // 获取用户数据
        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        if (users[email]) {
            alert('An account with this email already exists. Please login instead.');
            return;
        }
        
        // 创建新用户
        users[email] = {
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };
        
        // 保存用户数据
        localStorage.setItem('users', JSON.stringify(users));
        
        // 自动登录
        const sessionUser = {
            name: name,
            email: email
        };
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));
        
        // 关闭模态框并更新UI
        closeAuthModal();
        updateAuthUI();
        alert('Registration successful! Welcome, ' + name);
        
        // 刷新页面
        window.location.reload();
    }

    // 退出登录
    function logout() {
        localStorage.removeItem('currentUser');
        updateAuthUI();
        alert('You have been logged out.');
        
        // 刷新页面
        window.location.reload();
    }

    // 检查认证状态
    function checkAuthStatus() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            updateAuthUI(true, currentUser);
        } else {
            updateAuthUI(false);
        }
    }

    // 更新认证UI
    function updateAuthUI(isLoggedIn, user) {
        const authToggleBtn = document.getElementById('authToggleBtn');
        const authBtnText = document.getElementById('authBtnText');
        
        if (!authToggleBtn || !authBtnText) return;
        
        if (isLoggedIn && user) {
            authBtnText.textContent = user.name;
            authToggleBtn.parentElement.className = 'user-menu';
            
            // 创建用户菜单
            let userMenu = document.querySelector('.user-menu-content');
            if (!userMenu) {
                userMenu = document.createElement('div');
                userMenu.className = 'user-menu-content';
                authToggleBtn.parentElement.appendChild(userMenu);
            }
            
            userMenu.innerHTML = `
                <div class="user-menu-item user-email">${user.email}</div>
                <div class="user-menu-divider"></div>
                <a href="#" class="user-menu-item" id="viewMyBookingsBtn">My Bookings</a>
                <div class="user-menu-divider"></div>
                <a href="#" class="user-menu-item" id="logoutBtn">Logout</a>
            `;
            
            // 添加事件监听器
            document.getElementById('viewMyBookingsBtn').addEventListener('click', function(e) {
                e.preventDefault();
                if (typeof showMyBookingsSection === 'function') {
                    showMyBookingsSection();
                } else if (typeof showMyBookings === 'function') {
                    showMyBookings();
                }
            });
            
            document.getElementById('logoutBtn').addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        } else {
            authBtnText.textContent = 'Login';
            authToggleBtn.parentElement.className = 'auth-button';
            
            // 移除用户菜单
            const userMenu = document.querySelector('.user-menu-content');
            if (userMenu) {
                userMenu.remove();
            }
            
            // 重新绑定点击事件
            authToggleBtn.onclick = toggleAuthModal;
        }
    }

    // 公开API
    window.UserAuth = {
        getCurrentUser: function() {
            return JSON.parse(localStorage.getItem('currentUser'));
        },
        isLoggedIn: function() {
            return !!localStorage.getItem('currentUser');
        },
        logout: logout,
        showLoginModal: function() {
            const modal = document.getElementById('authModal');
            if (modal) {
                // 确保登录标签处于活动状态
                document.querySelectorAll('.auth-tab').forEach(tab => {
                    tab.classList.toggle('active', tab.getAttribute('data-tab') === 'login');
                });
                document.querySelectorAll('.auth-tab-content').forEach(content => {
                    content.classList.toggle('active', content.id === 'loginTab');
                });
                
                modal.style.display = 'flex';
            }
        }
    };
})(); 