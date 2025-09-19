$(document).ready(function() {
    // ✅ Check authentication status on page load
    checkAuthenticationStatus();
});

function checkAuthenticationStatus() {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const userRole = localStorage.getItem("role");

    console.log("=== AUTHENTICATION CHECK ===");
    console.log("Token:", token ? "Present" : "Missing");
    console.log("UserId:", userId);
    console.log("User Role:", userRole);
    console.log("============================");

    if (!token || !userId || userId === 'null' || userId === 'undefined') {
        console.warn("User not authenticated - redirecting to login");

        // Show user-friendly message
        Swal.fire({
            icon: 'warning',
            title: 'Authentication Required',
            text: 'Please log in to continue with your payment.',
            confirmButtonText: 'Go to Login',
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                // Redirect to login page
                window.location.href = "http://localhost:5500/Frontend/pages/login-and-register/login-and-register.html";
            }
        });
        return false;
    }

    return true;
}

$(document).on('click', '#payHereButton', function () {
    // ✅ Check authentication before processing payment
    if (!checkAuthenticationStatus()) {
        return; // Stop execution if not authenticated
    }

    const token = localStorage.getItem("token");
    const exchangeId = $(this).data('id');
    const card = $(`.booking-card[data-booking-id="${exchangeId}"]`);
    let price = parseFloat(card.find('.booking-price').data('price') || 0);
    const itemName = card.find('.booking-item').text().trim() || "Subscription Payment";

    // Step 1: Get user profile
    getUserProfile(token).then(profile => {
        // Step 2: Generate hash
        $.ajax({
            url: "http://localhost:8080/payment/generate-hash",
            type: "GET",
            headers: { "Authorization": "Bearer " + token },
            data: { orderId: exchangeId, amount: price.toFixed(2), currency: "LKR" },
            success: function(response) {
                const payment = {
                    sandbox: true,
                    merchant_id: "1231966",
                    return_url: "http://localhost:8080/payment-success",
                    cancel_url: "http://localhost:8080/payment-cancel",
                    notify_url: "http://localhost:8080/payment-notify",
                    order_id: exchangeId,
                    items: itemName,
                    amount: price.toFixed(2),
                    currency: "LKR",
                    first_name: profile.firstName,
                    last_name: profile.lastName,
                    email: profile.email,
                    phone: profile.phone,
                    address: profile.address,
                    city: profile.city,
                    country: profile.country,
                    hash: response.hash
                };

                console.log("Payment Request:", payment);
                payhere.startPayment(payment);
            },
            error: function(err) {
                console.error("Failed to get hash:", err);
                Swal.fire({
                    icon: 'error',
                    title: 'Payment Error',
                    text: 'Unable to generate payment hash. Please try again.'
                });
            }
        });
    }).catch(err => {
        console.error("Error preparing payment:", err);
        Swal.fire({
            icon: 'error',
            title: 'Profile Error',
            text: 'Unable to load your profile. Please ensure you are logged in.'
        });
    });
});

// ✅ Enhanced Function to get user profile details with better error handling
function getUserProfile(token) {
    let userId = localStorage.getItem("userId");
    console.log("Retrieved userId from localStorage:", userId);

    // Check if userId is null or empty
    if (!userId || userId === 'null' || userId === 'undefined') {
        console.error("UserId is null or empty. User needs to log in.");
        return Promise.reject("Please log in to continue with payment");
    }

    return new Promise((resolve, reject) => {
        $.ajax({
            url: "http://localhost:8080/getprofile/getprofildetails",
            type: "GET",
            data: { userId: userId },
            headers: { "Authorization": "Bearer " + token },
            success: function(profileResponse) {
                console.log("Profile response:", profileResponse);
                const profile = {
                    firstName: profileResponse.username || profileResponse.firstName || "John", // Use username from backend
                    lastName: profileResponse.lastName || "Doe",
                    email: profileResponse.email || "john@example.com",
                    phone: profileResponse.phone || "0771234567",
                    address: profileResponse.address || "Colombo",
                    city: profileResponse.city || "Colombo",
                    country: "Sri Lanka"
                };
                resolve(profile);
            },
            error: function(err) {
                console.error("Failed to fetch profile details:", err);
                if (err.status === 401 || err.status === 403) {
                    // Authentication error - redirect to login
                    localStorage.clear(); // Clear invalid session data
                    window.location.href = "http://localhost:5500/Frontend/pages/login-and-register/login-and-register.html";
                }
                reject("Unable to load profile information");
            }
        });
    });
}

// ✅ PayHere completed callback
payhere.onCompleted = function onCompleted(orderId) {
    console.log("✅ Payment completed for Order:", orderId);

    // Send to backend to confirm payment first
    const token = localStorage.getItem("token");
    const paymentData = {
        payerId: localStorage.getItem('userId'),
        exchangeId: orderId.toString(),
        amount: 4999,
        paymentMethod: "CARD",
        paymentStatus: "COMPLETED",
        paymentDate: new Date().toISOString(),
        transactionId: "TRX" + Math.floor(Math.random() * 1000000000)
    };

    $.ajax({
        url: "http://localhost:8080/mybookings/paymentdone",
        method: "POST",
        contentType: "application/json",
        headers: { "Authorization": "Bearer " + token },
        data: JSON.stringify(paymentData),
        success: function (response) {
            console.log("✅ Payment saved:", response);

            // Show success alert and then navigate
            Swal.fire({
                icon: 'success',
                title: 'Payment Successful!',
                text: 'Your subscription has been activated! You will now be redirected to create AI articles.',
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: true,
                confirmButtonText: 'Continue to AI Articles',
                allowOutsideClick: false
            }).then((result) => {
                // Navigate to AI article generation page
                console.log("🚀 Navigating to AI article generation page...");
                window.location.href = "http://localhost:5500/Frontend/pages/Publisher/AI-generated-article.html";
            });
        },
        error: function (err) {
            console.error('Payment error (backend):', err);

            // Even if backend fails, show success and navigate (payment was successful on PayHere)
            Swal.fire({
                icon: 'warning',
                title: 'Payment Successful',
                text: 'Your payment was successful, but there was an issue saving the record. You can still access AI article generation.',
                confirmButtonText: 'Continue to AI Articles',
                allowOutsideClick: false
            }).then((result) => {
                // Navigate to AI article generation page even if backend save failed
                console.log("🚀 Navigating to AI article generation page (despite backend error)...");
                window.location.href = "http://localhost:5500/Frontend/pages/Publisher/AI-generated-article.html";
            });
        }
    });
};
