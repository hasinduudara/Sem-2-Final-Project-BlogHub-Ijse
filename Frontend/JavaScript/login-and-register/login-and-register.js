document.addEventListener('DOMContentLoaded', () => {
    // Get all elements
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeBtn = forgotPasswordModal.querySelector('.close');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');

    // Add click event listeners to toggle buttons
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');

            // Toggle forms based on button clicked
            if (button.dataset.form === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            } else {
                registerForm.classList.add('active');
                loginForm.classList.remove('active');
            }
        });
    });

    // Forgot Password Modal functionality
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPasswordModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        forgotPasswordModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === forgotPasswordModal) {
            forgotPasswordModal.style.display = 'none';
        }
    });

    // Handle forgot password form submission
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        
        try {
            // Here you would typically make an API call to send reset password email
            console.log('Sending reset password email to:', email);
            // Show success message or handle API response
            alert('Password reset link has been sent to your email if it exists in our system.');
            forgotPasswordModal.style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while processing your request. Please try again.');
        }
    });
});