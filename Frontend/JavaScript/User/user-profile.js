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
        this.loadProfileImage(); // Load profile image on init
    }

    bindEventListeners() {
        const editBtn = document.querySelector('.btn-light-custom');
        const saveBtn = document.querySelector('.btn-dark-custom');
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
        const storedEmail = localStorage.getItem('email'); // Login stores as 'email', not 'userEmail'
        const storedUsername = localStorage.getItem('username');
        const storedToken = localStorage.getItem('token'); // Login stores as 'token', not 'authToken'

        console.log('Checking localStorage for user data:');
        console.log('- Email:', storedEmail);
        console.log('- Username:', storedUsername);
        console.log('- Token:', storedToken ? 'Present' : 'Missing');

        // If we have stored email, use it
        if (storedEmail) {
            console.log('Found stored email:', storedEmail);
            return storedEmail;
        }

        // Try to get user email from JWT token as fallback
        if (storedToken) {
            try {
                const payload = JSON.parse(atob(storedToken.split('.')[1]));
                console.log('JWT payload:', payload);

                // Try different possible email fields in JWT
                const email = payload.sub || payload.email || payload.username;
                if (email) {
                    console.log('Found email in JWT:', email);
                    return email;
                }
            } catch (error) {
                console.error('Error parsing token:', error);
                localStorage.removeItem('token'); // Remove invalid token
            }
        }

        // Last fallback - for testing purposes only
        console.warn('No user data found in localStorage. User needs to login.');
        return null; // Return null instead of dummy email to force proper authentication
    }

    async loadUserProfile() {
        try {
            this.showLoading();

            // Check if we have user email first
            if (!this.currentUserEmail) {
                console.warn('No user email found. User needs to login first.');
                this.showWarning('Please login to view your profile.');
                this.handleAuthenticationFailure();
                return;
            }

            // Check if we have authentication using the correct key that login stores
            const token = localStorage.getItem('token'); // Use 'token' not 'authToken'
            if (!token) {
                console.warn('No authentication token found. User needs to login.');
                this.showWarning('Please login to access your profile.');
                this.handleAuthenticationFailure();
                return;
            }

            console.log('Loading profile for:', this.currentUserEmail);
            console.log('Using token:', token ? 'Present' : 'Missing');

            const response = await fetch(`${this.baseUrl}/profile/${this.currentUserEmail}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);

            // Check if response is ok first
            if (!response.ok) {
                if (response.status === 401) {
                    this.showError('Authentication failed. Please login again.');
                    this.handleAuthenticationFailure();
                    return;
                } else if (response.status === 403) {
                    this.showError('Access denied. Please login again.');
                    this.handleAuthenticationFailure();
                    return;
                } else if (response.status === 404) {
                    this.showError('Profile not found. Using stored user data.');
                    this.setUserDataFromStorage();
                    return;
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            // Check if response has content before parsing JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Response is not JSON format');
            }

            const text = await response.text();
            if (!text.trim()) {
                throw new Error('Empty response from server');
            }

            let result;
            try {
                result = JSON.parse(text);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError);
                console.error('Response text:', text);
                throw new Error('Invalid JSON response from server');
            }

            if (result.code === 200) {
                this.populateForm(result.data);
                this.showSuccess('Profile loaded successfully');
            } else {
                this.showError('Failed to load profile: ' + (result.message || 'Unknown error'));
                // Use stored user data if API fails
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

        // Load profile image from backend data
        if (profileImg && profileData.profileImageUrl) {
            profileImg.src = profileData.profileImageUrl;
            // Store URL locally for quick access
            localStorage.setItem('profileImageUrl', profileData.profileImageUrl);
            console.log('Loaded profile image from backend:', profileData.profileImageUrl);
        }
    }

    setDefaultValues() {
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');

        if (usernameInput && !usernameInput.value) usernameInput.value = 'JohnDoe';
        if (emailInput && !emailInput.value) emailInput.value = this.currentUserEmail;
    }

    setUserDataFromStorage() {
        // Use the actual user data from localStorage instead of dummy data
        const storedEmail = localStorage.getItem('email');
        const storedUsername = localStorage.getItem('username');
        const storedProfileImageUrl = localStorage.getItem('profileImageUrl'); // ImgBB URL from localStorage

        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        const profileImg = document.getElementById('profileImage');

        if (usernameInput) {
            usernameInput.value = storedUsername || 'User';
        }
        if (emailInput) {
            emailInput.value = storedEmail || this.currentUserEmail || 'user@example.com';
        }

        // Load saved profile image URL if exists
        if (profileImg && storedProfileImageUrl) {
            profileImg.src = storedProfileImageUrl;
        }

        console.log('Populated form with stored user data:');
        console.log('- Username:', storedUsername);
        console.log('- Email:', storedEmail);
        console.log('- Profile Image URL:', storedProfileImageUrl ? 'Present' : 'Not found');
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        const editBtn = document.querySelector('.btn-light-custom');
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');

        if (this.isEditMode) {
            // Enable editing
            if (usernameInput) usernameInput.removeAttribute('readonly');
            if (emailInput) emailInput.removeAttribute('readonly');
            if (editBtn) editBtn.textContent = 'Cancel';
            this.showInfo('Edit mode enabled. Modify your details and click Save.');
        } else {
            // Disable editing
            if (usernameInput) usernameInput.setAttribute('readonly', true);
            if (emailInput) emailInput.setAttribute('readonly', true);
            if (editBtn) editBtn.textContent = 'Edit';
            this.loadUserProfile(); // Reload original data
        }
    }

    async saveProfile() {
        if (!this.isEditMode) {
            this.showWarning('Please click Edit first to modify your profile');
            return;
        }

        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');

        const username = usernameInput?.value?.trim();
        const email = emailInput?.value?.trim();

        if (!username || !email) {
            this.showError('Please fill in all required fields');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        // Get current password for verification
        const currentPassword = await this.promptForPassword();
        if (!currentPassword) {
            this.showWarning('Current password is required to update profile');
            return;
        }

        const updateData = {
            username: username,
            email: email,
            currentPassword: currentPassword,
            newPassword: null // No password change in this basic implementation
        };

        try {
            this.showLoading();

            const response = await fetch(`${this.baseUrl}/profile/${this.currentUserEmail}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Use correct token key
                },
                body: JSON.stringify(updateData)
            });

            const result = await response.json();

            if (result.code === 200) {
                this.showSuccess('Profile updated successfully!');
                this.currentUserEmail = result.data.email; // Update current email if changed
                this.isEditMode = false;

                // Update UI to reflect changes
                const editBtn = document.querySelector('.btn-light-custom');
                if (editBtn) editBtn.textContent = 'Edit';
                if (usernameInput) usernameInput.setAttribute('readonly', true);
                if (emailInput) emailInput.setAttribute('readonly', true);

                // Update localStorage if email changed
                localStorage.setItem('userEmail', result.data.email);

            } else {
                this.showError('Failed to update profile: ' + result.message);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            this.showError('Network error while updating profile');
        } finally {
            this.hideLoading();
        }
    }

    async promptForPassword() {
        return new Promise((resolve) => {
            const password = prompt('Please enter your current password to continue:');
            resolve(password);
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // UI Feedback Methods
    showLoading() {
        this.showToast('Processing...', 'info');
    }

    hideLoading() {
        // Loading message will auto-hide with toast timeout
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showWarning(message) {
        this.showToast(message, 'warning');
    }

    showInfo(message) {
        this.showToast(message, 'info');
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${this.getBootstrapClass(type)} position-fixed`;
        toast.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        toast.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <span>${message}</span>
                <button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    getBootstrapClass(type) {
        const classMap = {
            success: 'success',
            error: 'danger',
            warning: 'warning',
            info: 'info'
        };
        return classMap[type] || 'info';
    }

    handleAuthenticationFailure() {
        // Logic to handle authentication failure, e.g., redirect to login or show a message
        this.showWarning('Authentication failed. Redirecting to login page...');
        setTimeout(() => {
            window.location.href = '/login.html'; // Redirect to login page
        }, 3000);
    }

    // Image handling methods - Updated to use ImgBB via backend
    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Please select a valid image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('Image size must be less than 5MB');
            return;
        }

        try {
            this.showLoading();
            console.log('Uploading image to ImgBB via backend...');

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('image', file);

            // Get authentication token
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required for image upload');
            }

            // Upload to backend which will use ImgBB
            const response = await fetch(`${this.baseUrl}/profile/${this.currentUserEmail}/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();

            if (result.code === 200) {
                // Show the uploaded image immediately
                const profileImg = document.getElementById('profileImage');
                if (profileImg) {
                    profileImg.src = result.data; // ImgBB URL
                }

                // Store the URL locally for quick access (optional)
                localStorage.setItem('profileImageUrl', result.data);

                this.showSuccess('Profile image uploaded successfully!');
                console.log('Image uploaded to ImgBB:', result.data);
            } else {
                throw new Error(result.message || 'Failed to upload image');
            }

        } catch (error) {
            console.error('Error uploading image:', error);
            this.showError('Failed to upload image: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // Remove the old base64 conversion method and replace with backend integration
    loadProfileImage() {
        // Try to load from backend first, then fallback to localStorage
        this.loadUserProfile(); // This will load the profile image URL from backend

        // Fallback to localStorage if needed (for immediate display while API loads)
        const storedImageUrl = localStorage.getItem('profileImageUrl');
        const profileImg = document.getElementById('profileImage');

        if (profileImg && storedImageUrl && !profileImg.src.includes('placehold.co')) {
            profileImg.src = storedImageUrl;
            console.log('Loaded profile image URL from localStorage as fallback');
        }
    }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UserProfileManager();
});

// Enhanced image preview function (keeping the existing functionality)
function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function () {
        document.getElementById("profileImage").src = reader.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

// Add some CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .form-control[readonly] {
        background-color: rgba(255, 255, 255, 0.05) !important;
        cursor: not-allowed;
    }
    
    .form-control:not([readonly]):focus {
        box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
        border-color: #ffffff;
    }
`;
document.head.appendChild(style);
