document.addEventListener('DOMContentLoaded', () => {
    // Get all elements
    const usernameStep = document.getElementById('usernameStep');
    const emailStep = document.getElementById('emailStep');
    const otpStep = document.getElementById('otpStep');
    const newPasswordStep = document.getElementById('newPasswordStep');
    
    const usernameInput = document.getElementById('username');
    const userEmailSpan = document.getElementById('userEmail');
    const otpInput = document.getElementById('otp');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    const findEmailBtn = document.getElementById('findEmailBtn');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const updatePasswordBtn = document.getElementById('updatePasswordBtn');

    // Function to show error message
    function showError(message, element) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        element.parentElement.insertBefore(errorDiv, element.nextSibling);
        
        // Remove error message after 3 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }

    // Function to hide all steps except the active one
    function showStep(step) {
        [usernameStep, emailStep, otpStep, newPasswordStep].forEach(s => s.classList.remove('active'));
        step.classList.add('active');
    }

    // Find Email button click handler
    findEmailBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (!username) {
            showError('Please enter a username', usernameInput);
            return;
        }

        // Simulate API call - you would replace this with actual API call
        simulateApiCall(username, (email) => {
            userEmailSpan.textContent = email;
            showStep(emailStep);
        });
    });

    // Send OTP button click handler
    sendOtpBtn.addEventListener('click', () => {
        // Simulate API call - you would replace this with actual API call
        simulateApiCall('sendOtp', (otp) => {
            // Store OTP in localStorage for verification
            localStorage.setItem('forgotPasswordOtp', otp);
            showStep(otpStep);
        });
    });

    // Verify OTP button click handler
    verifyOtpBtn.addEventListener('click', () => {
        const enteredOtp = otpInput.value.trim();
        const storedOtp = localStorage.getItem('forgotPasswordOtp');

        if (enteredOtp !== storedOtp) {
            showError('Invalid OTP', otpInput);
            return;
        }

        showStep(newPasswordStep);
    });

    // Update Password button click handler
    updatePasswordBtn.addEventListener('click', () => {
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (!newPassword || !confirmPassword) {
            showError('Please enter both password fields', newPasswordInput);
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('Passwords do not match', confirmPasswordInput);
            return;
        }

        // Simulate API call - you would replace this with actual API call
        simulateApiCall('updatePassword', () => {
            // Redirect to login page
            window.location.href = '/Frontend/pages/login-and-register/login-and-register.html';
        });
    });

    // Simulate API call function (replace with actual API calls)
    function simulateApiCall(type, callback) {
        setTimeout(() => {
            switch (type) {
                case 'user@example.com':
                    callback('user@example.com');
                    break;
                case 'sendOtp':
                    const otp = Math.floor(100000 + Math.random() * 900000);
                    callback(otp.toString());
                    break;
                case 'updatePassword':
                    callback();
                    break;
                default:
                    callback('user@example.com');
            }
        }, 1000);
    }
});