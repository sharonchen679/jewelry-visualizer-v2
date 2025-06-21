// Admin Module for Jewelry Visualizer
// Handles all admin-related functionality

class JewelryVisualizerAdmin {
    constructor(mainInstance) {
        this.mainInstance = mainInstance;
        this.isAdminMode = false;
        this.passwordBuffer = '';
    }

    // Password System
    setupPasswordSystem() {
        const title = document.getElementById('center-stone-title');
        const letters = title.querySelectorAll('span[data-letter]');

        letters.forEach(letter => {
            letter.addEventListener('click', () => {
                const clickedLetter = letter.dataset.letter;
                this.handlePasswordInput(clickedLetter);
            });
        });
    }

    handlePasswordInput(letter) {
        this.passwordBuffer += letter;

        // Check if current buffer matches any valid password
        const validPasswords = this.getValidPasswords();
        
        for (const password of validPasswords) {
            if (this.passwordBuffer === password) {
                this.activateAdminMode();
                this.passwordBuffer = '';
                return;
            }
        }

        // Reset buffer if it's too long or doesn't match any password start
        if (this.passwordBuffer.length > 20 || !this.isValidPasswordStart()) {
            this.passwordBuffer = '';
        }
    }

    getValidPasswords() {
        const defaultPassword = CONFIG.admin.defaultPassword;
        const customPassword = localStorage.getItem(CONFIG.admin.passwordStorageKey);
        
        const passwords = [defaultPassword];
        if (customPassword && customPassword !== defaultPassword) {
            passwords.push(customPassword);
        }
        
        return passwords;
    }

    isValidPasswordStart() {
        const validPasswords = this.getValidPasswords();
        return validPasswords.some(password => password.startsWith(this.passwordBuffer));
    }

    activateAdminMode() {
        this.isAdminMode = true;
        this.mainInstance.isAdminMode = true;
        sessionStorage.setItem(CONFIG.admin.sessionStorageKey, 'true');
        this.showAdminPanel();
    }

    showAdminPanel() {
        const panel = document.getElementById('admin-panel');
        
        // Inject admin content dynamically for security
        panel.innerHTML = `
            <div class="admin-content">
                <h3>Admin Panel</h3>
                <button id="change-password-btn">Change Password</button>
                <button id="asset-manager-btn">Manage Assets</button>
                <button id="logout-btn">Logout</button>
            </div>
        `;
        
        panel.classList.remove('hidden');
        this.setupAdminEventListeners();
        this.setupAdminDrag();
    }

    setupAdminEventListeners() {
        const changePasswordBtn = document.getElementById('change-password-btn');
        const assetManagerBtn = document.getElementById('asset-manager-btn');
        const logoutBtn = document.getElementById('logout-btn');

        changePasswordBtn.addEventListener('click', () => {
            // TODO: Change password functionality in Part 3
            alert('Change password functionality coming in Part 3');
        });

        assetManagerBtn.addEventListener('click', () => {
            // TODO: Implement asset manager
            alert('Asset manager coming in next part');
        });

        logoutBtn.addEventListener('click', () => {
            this.logout();
        });
    }

    logout() {
        this.isAdminMode = false;
        this.mainInstance.isAdminMode = false;
        sessionStorage.removeItem(CONFIG.admin.sessionStorageKey);
        const panel = document.getElementById('admin-panel');
        panel.classList.add('hidden');
        panel.innerHTML = '<!-- Content injected dynamically for security -->'; // Clear content
        
        // Reset panel position
        panel.style.transform = '';
        panel.style.left = '';
        panel.style.top = '';        
    }

    // Admin panel drag functionality
    setupAdminDrag() {
        const panel = document.getElementById('admin-panel');
        
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;

        panel.addEventListener('mousedown', (e) => {
            // Don't start drag if clicking on a button
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                return;
            }
            
            isDragging = true;
            
            startX = e.clientX;
            startY = e.clientY;
            
            // Get current position from the panel's actual position
            const rect = panel.getBoundingClientRect();
            const panelCenterX = rect.left + rect.width / 2;
            const panelCenterY = rect.top + rect.height / 2;
            const windowCenterX = window.innerWidth / 2;
            const windowCenterY = window.innerHeight / 2;
            
            // Calculate current offset from center
            currentX = panelCenterX - windowCenterX;
            currentY = panelCenterY - windowCenterY;
            
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            const newX = currentX + deltaX;
            const newY = currentY + deltaY;
            
            // Apply constraints to keep panel visible
            const panelRect = panel.getBoundingClientRect();
            const halfWidth = panelRect.width / 2;
            const halfHeight = panelRect.height / 2;
            
            // Calculate max offsets from center to keep panel in viewport
            const maxX = (window.innerWidth / 2) - 50; // Keep at least 50px visible
            const minX = -(window.innerWidth / 2) + 50;
            const maxY = (window.innerHeight / 2) - 50;
            const minY = -(window.innerHeight / 2) + halfHeight; // Don't go above top edge
            
            const constrainedX = Math.max(minX, Math.min(maxX, newX));
            const constrainedY = Math.max(minY, Math.min(maxY, newY));
            
            // Apply transform relative to the original center position
            panel.style.transform = `translate(calc(-50% + ${constrainedX}px), calc(-50% + ${constrainedY}px))`;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;
        });
    }

    // Check for existing admin session
    checkExistingSession() {
        if (sessionStorage.getItem(CONFIG.admin.sessionStorageKey)) {
            this.isAdminMode = true;
            this.mainInstance.isAdminMode = true;
            this.showAdminPanel();
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JewelryVisualizerAdmin;
} 