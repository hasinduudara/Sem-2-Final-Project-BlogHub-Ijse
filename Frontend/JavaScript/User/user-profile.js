// User Profile Management JavaScript

class UserProfileManager {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api/auth';
        this.currentUserEmail = this.getCurrentUserEmail();
        this.isEditMode = false;
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.loadUserProfile();
    }

    bindEventListeners() {
        // Updated selectors to match the new HTML classes
        const editBtn = document.querySelector('.btn-edit');
        const saveBtn = document.querySelector('.btn-save');
        const form = document.querySelector('form');
        const imageUpload = document.getElementById('imageUpload');

        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleEditMode();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        if (imageUpload) {
            imageUpload.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }
    }

    getCurrentUserEmail() {
        // Get user data from localStorage using the correct keys that login stores
        const storedEmail = localStorage.getItem('email');
        const storedUsername = localStorage.getItem('username');
        const storedToken = localStorage.getItem('token');

        console.log('Checking localStorage for user data:');
        console.log('- Email:', storedEmail);
        console.log('- Username:', storedUsername);
        console.log('- Token:', storedToken ? 'Present' : 'Missing');

        if (storedEmail) {
            return storedEmail;
        }

        if (storedToken) {
            try {
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                const email = payload.sub || payload.email || payload.username;
                if (email) {
                    return email;
                }
            } catch (error) {
                console.error('Error parsing token:', error);
                localStorage.removeItem('token'); // Remove invalid token
            }
        }

        console.warn('No user data found in localStorage. User needs to login.');
        return null;
    }

    async loadUserProfile() {
        try {
            this.showLoading();

            if (!this.currentUserEmail) {
                this.showWarning('Please login to view your profile.');
                this.handleAuthenticationFailure();
                return;
            }

            const token = localStorage.getItem('token');
            if (!token) {
                this.showWarning('Please login to access your profile.');
                this.handleAuthenticationFailure();
                return;
            }

            const response = await fetch(`${this.baseUrl}/profile/${this.currentUserEmail}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    this.showError('Authentication failed. Please login again.');
                    this.handleAuthenticationFailure();
                } else if (response.status === 404) {
                    this.showError('Profile not found. Using local data as fallback.');
                    this.setUserDataFromStorage();
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return;
            }

            const result = await response.json();

            if (result.code === 200 && result.data) {
                this.populateForm(result.data);
                this.showSuccess('Profile loaded successfully');
            } else {
                this.showError('Failed to load profile: ' + (result.message || 'Unknown error'));
                this.setUserDataFromStorage();
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showError('Network error while loading profile: ' + error.message);
            this.setUserDataFromStorage();
        } finally {
            this.hideLoading();
        }
    }

    populateForm(profileData) {
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const profileImg = document.getElementById('profileImage');

        if (usernameInput) usernameInput.value = profileData.username || '';
        if (emailInput) emailInput.value = profileData.email || '';

        if (profileImg && profileData.profileImageUrl) {
            profileImg.src = profileData.profileImageUrl;
            localStorage.setItem('profileImageUrl', profileData.profileImageUrl);
        } else {
            // Fallback to locally stored image if backend doesn't provide one
            const storedImageUrl = localStorage.getItem('profileImageUrl');
            if(profileImg && storedImageUrl) {
                profileImg.src = storedImageUrl;
            }
        }
    }

    setUserDataFromStorage() {
        const storedEmail = localStorage.getItem('email');
        const storedUsername = localStorage.getItem('username');
        const storedProfileImageUrl = localStorage.getItem('profileImageUrl');

        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const profileImg = document.getElementById('profileImage');

        if (usernameInput) usernameInput.value = storedUsername || 'User';
        if (emailInput) emailInput.value = storedEmail || this.currentUserEmail || 'user@example.com';
        if (profileImg && storedProfileImageUrl) profileImg.src = storedProfileImageUrl;
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        // Updated selector to match the new HTML class
        const editBtn = document.querySelector('.btn-edit');
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');

        if (this.isEditMode) {
            if (usernameInput) usernameInput.removeAttribute('readonly');
            if (emailInput) emailInput.removeAttribute('readonly');
            if (editBtn) editBtn.textContent = 'Cancel';
            this.showInfo('Edit mode enabled. You can now change your details.');
        } else {
            if (usernameInput) usernameInput.setAttribute('readonly', true);
            if (emailInput) emailInput.setAttribute('readonly', true);
            if (editBtn) editBtn.textContent = 'Edit';
            this.loadUserProfile(); // Reload original data on cancel
        }
    }

    async saveProfile() {
        if (!this.isEditMode) {
            this.showWarning('Please click "Edit" first to make changes.');
            return;
        }

        const username = document.getElementById('username')?.value?.trim();
        const email = document.getElementById('email')?.value?.trim();

        if (!username || !email) {
            this.showError('Username and Email fields cannot be empty.');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address.');
            return;
        }

        const currentPassword = await this.promptForPassword();
        if (currentPassword === null) { // User cancelled the prompt
            this.showInfo('Profile update cancelled.');
            return;
        }
        if (!currentPassword) {
            this.showWarning('Current password is required to update the profile.');
            return;
        }

        const updateData = { username, email, currentPassword, newPassword: null };

        try {
            this.showLoading();
            const token = localStorage.getItem('token');
            const response = await fetch(`${this.baseUrl}/profile/${this.currentUserEmail}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });

            const result = await response.json();

            if (result.code === 200) {
                this.showSuccess('Profile updated successfully!');
                this.currentUserEmail = result.data.email;
                this.toggleEditMode(); // This will reset the UI state
                localStorage.setItem('email', result.data.email); // Use consistent key
                localStorage.setItem('username', result.data.username);
            } else {
                this.showError('Update failed: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showError('Network error while updating profile.');
        } finally {
            this.hideLoading();
        }
    }

    async promptForPassword() {
        return prompt('To save changes, please enter your current password:');
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // --- Image Handling ---

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // --- 1. Instant Preview for better UX ---
        const reader = new FileReader();
        reader.onload = (e) => {
            const profileImg = document.getElementById('profileImage');
            if (profileImg) {
                profileImg.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);

        // --- 2. Validate the file ---
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file (e.g., JPG, PNG, GIF).');
            return;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            this.showError('Image size must be less than 5MB.');
            return;
        }
        
        // --- 3. Upload to backend ---
        try {
            this.showLoading();
            const formData = new FormData();
            formData.append('image', file);

            const token = localStorage.getItem('token');
            if (!token) throw new Error('Authentication required for image upload.');

            const response = await fetch(`${this.baseUrl}/profile/${this.currentUserEmail}/upload-image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const result = await response.json();

            if (result.code === 200) {
                const finalImageUrl = result.data;
                document.getElementById('profileImage').src = finalImageUrl;
                localStorage.setItem('profileImageUrl', finalImageUrl);
                this.showSuccess('Profile image updated successfully!');
            } else {
                throw new Error(result.message || 'Failed to upload image.');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            this.showError('Upload failed: ' + error.message);
            // Revert to previously saved image on failure
            document.getElementById('profileImage').src = localStorage.getItem('profileImageUrl') || 'https://placehold.co/120x120/0d6efd/FFFFFF?text=JD';
        } finally {
            this.hideLoading();
        }
    }


    // --- UI Feedback Methods ---
    showLoading() { this.showToast('Processing...', 'info'); }
    hideLoading() { /* Toast auto-hides */ }
    showSuccess(message) { this.showToast(message, 'success'); }
    showError(message) { this.showToast(message, 'danger'); }
    showWarning(message) { this.showToast(message, 'warning'); }
    showInfo(message) { this.showToast(message, 'info'); }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed`;
        toast.style.cssText = `top: 20px; right: 20px; z-index: 9999; min-width: 300px; animation: slideInRight 0.3s ease-out;`;
        toast.innerHTML = `<div class="d-flex justify-content-between align-items-center"><span>${message}</span><button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button></div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }
    
    handleAuthenticationFailure() {
        this.showError('Authentication failed. Redirecting to login page...');
        setTimeout(() => {
            // Adjust this path to your actual login page
            window.location.href = '/Frontend/pages/login-and-register/login.html'; 
        }, 3000);
    }
}

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new UserProfileManager();
});

// Add animation keyframes to the document head
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);