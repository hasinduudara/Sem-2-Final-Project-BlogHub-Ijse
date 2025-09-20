// User Profile Management JavaScript

class UserProfileManager {
    constructor() {
        this.baseUrl = 'http://localhost:8080/api/auth';
        this.currentUserEmail = this.getCurrentUserEmail();
        this.isEditMode = false;
        this.defaultProfileImageUrl = "https://placehold.co/120x120/e9ecef/6c757d?text=No+Image";
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.setInitialProfileImage();
        this.loadUserProfile();
    }

    setInitialProfileImage() {
        const profileImg = document.getElementById('profileImage');
        const storedImageUrl = localStorage.getItem('profileImageUrl');
        const currentUserEmail = this.currentUserEmail;
        const storedUserEmail = localStorage.getItem('email');

        if (profileImg) {
            // Only use stored image if it belongs to the current user
            if (storedImageUrl &&
                storedImageUrl !== this.defaultProfileImageUrl &&
                currentUserEmail &&
                storedUserEmail &&
                currentUserEmail === storedUserEmail) {
                profileImg.src = storedImageUrl;
            } else {
                // Clear any invalid stored image and use default
                if (storedImageUrl && currentUserEmail !== storedUserEmail) {
                    localStorage.removeItem('profileImageUrl');
                }
                profileImg.src = this.defaultProfileImageUrl;
            }
        }
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

        // Handle profile image - only set if backend provides a valid URL
        if (profileImg && profileData.profileImageUrl && profileData.profileImageUrl.trim() !== "") {
            profileImg.src = profileData.profileImageUrl;
            localStorage.setItem('profileImageUrl', profileData.profileImageUrl);
        } else {
            // If no image from backend, check localStorage
            const storedImageUrl = localStorage.getItem('profileImageUrl');
            if (profileImg) {
                if (storedImageUrl && storedImageUrl !== this.defaultProfileImageUrl) {
                    profileImg.src = storedImageUrl;
                } else {
                    profileImg.src = this.defaultProfileImageUrl;
                    // Don't store the default image URL in localStorage
                }
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

        if (profileImg) {
            if (storedProfileImageUrl && storedProfileImageUrl !== this.defaultProfileImageUrl) {
                profileImg.src = storedProfileImageUrl;
            } else {
                profileImg.src = this.defaultProfileImageUrl;
            }
        }
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

                // Update the current user email immediately to prevent 403 errors
                this.currentUserEmail = result.data.email;
                localStorage.setItem('email', result.data.email);
                localStorage.setItem('username', result.data.username);

                // Exit edit mode without reloading profile to avoid 403 error
                this.isEditMode = false;
                const usernameInput = document.getElementById('username');
                const emailInput = document.getElementById('email');
                const editBtn = document.querySelector('.btn-edit');

                if (usernameInput) usernameInput.setAttribute('readonly', true);
                if (emailInput) emailInput.setAttribute('readonly', true);
                if (editBtn) editBtn.textContent = 'Edit';

                // Populate form with the updated data instead of reloading
                this.populateForm(result.data);

                // If email was changed, show a notice about re-authentication
                if (result.data.email !== JSON.parse(atob(token.split(".")[1])).sub) {
                    this.showWarning("Email updated. Please log out and log back in for full functionality.");
                }
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
            const storedImageUrl = localStorage.getItem('profileImageUrl');
            const profileImg = document.getElementById('profileImage');
            if (profileImg) {
                if (storedImageUrl && storedImageUrl !== this.defaultProfileImageUrl) {
                    profileImg.src = storedImageUrl;
                } else {
                    profileImg.src = this.defaultProfileImageUrl;
                }
            }
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