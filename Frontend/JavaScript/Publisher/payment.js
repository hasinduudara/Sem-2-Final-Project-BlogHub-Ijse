const API_BASE = "http://localhost:8080/api";

// Function to show notification
function showNotification(message, type = "success") {
  const alertClass =
    type === "success"
      ? "alert-success"
      : type === "error"
      ? "alert-danger"
      : "alert-info";
  const icon =
    type === "success"
      ? "fa-check-circle"
      : type === "error"
      ? "fa-exclamation-circle"
      : "fa-info-circle";

  const notification = $(`
    <div class="alert ${alertClass} alert-dismissible fade show position-fixed" 
         style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;" role="alert">
      <i class="fas ${icon} me-2"></i>${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `);

  $("body").append(notification);
  setTimeout(() => {
    notification.alert("close");
  }, 5000);
}

// Helper: Get token or redirect to login if not authenticated
function getAuthToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    showNotification("Please log in to continue with your subscription purchase.", "error");
    setTimeout(() => {
      window.location.href = "/Frontend/pages/login-and-register/login-and-register.html";
    }, 2000);
    return null;
  }
  return token;
}

// Helper: Check if user is authenticated publisher
function checkPublisherAuth() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  if (!token || !role || !email) {
    showNotification("Authentication required. Please log in to purchase subscription.", "error");
    setTimeout(() => {
      window.location.href = "/Frontend/pages/login-and-register/login-and-register.html";
    }, 2000);
    return false;
  }

  if (role !== "PUBLISHER") {
    showNotification("Only publishers can purchase subscriptions.", "error");
    setTimeout(() => {
      window.location.href = "/Frontend/index.html";
    }, 2000);
    return false;
  }

  return true;
}

// Function to clear all user data from localStorage
function clearUserData() {
  const keysToRemove = [
    "token", "userId", "username", "role", "email",
    "profileImageUrl", "publisherLogoUrl", "publisherName",
    "hasSubscription", "subscriptionDate", "pendingPayment"
  ];

  keysToRemove.forEach(key => localStorage.removeItem(key));
  console.log("All user data cleared from localStorage");
}

// Function to refresh user data from backend
async function refreshUserData() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE}/auth/profile`, {
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        // Update localStorage with fresh data from backend
        localStorage.setItem("email", data.data.email);
        localStorage.setItem("username", data.data.username);
        localStorage.setItem("role", data.data.role);
        console.log("User data refreshed:", data.data);
        return true;
      }
    }
  } catch (error) {
    console.error("Failed to refresh user data:", error);
  }
  return false;
}

// PayHere payment integration
function initiatePayment() {
  const token = getAuthToken();
  if (!token) return;

  const email = localStorage.getItem("email");
  const username = localStorage.getItem("username");

  if (!email || !username) {
    showNotification("User information not found. Please log in again.", "error");
    return;
  }

  // Generate unique order ID
  const orderId = "SUB_" + Date.now();

  // Try to create payment record in backend first
  $.ajax({
    url: API_BASE + "/payments/create",
    method: "POST",
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json"
    },
    data: JSON.stringify({
      orderId: orderId,
      amount: 4999.00,
      currency: "LKR",
      description: "BlogHub Premium Subscription - Lifetime Access",
      userEmail: email
    }),
    success: function(response) {
      console.log("Payment creation successful:", response);

      // Configure PayHere payment object with proper hash
      const payment = {
        sandbox: true, // Set to false for production
        merchant_id: "1231966", // Updated to match backend configuration
        return_url: window.location.origin + "/Frontend/pages/Publisher/publisher-dashboard.html",
        cancel_url: window.location.origin + "/Frontend/pages/Publisher/buy-subscription.html",
        notify_url: "http://localhost:8080/api/payments/notify", // Backend webhook URL
        order_id: orderId,
        items: "BlogHub Premium Subscription - Lifetime Access",
        amount: "4999.00",
        currency: "LKR",
        hash: response.data && response.data.hash ? response.data.hash : "DEV_" + orderId,
        first_name: username.split(" ")[0] || username,
        last_name: username.split(" ")[1] || "User",
        email: email,
        phone: "0777123456", // Provide default phone number for testing
        address: "Colombo", // Provide default address
        city: "Colombo",
        country: "Sri Lanka",
        delivery_address: "Colombo",
        delivery_city: "Colombo",
        delivery_country: "Sri Lanka",
        custom_1: email, // Pass user email for backend processing
        custom_2: token // Pass token for verification
      };

      console.log("Initiating PayHere payment with config:", payment);

      // Initialize PayHere payment
      payhere.startPayment(payment);
    },
    error: function(xhr) {
      console.error("Payment creation error:", xhr);

      if (xhr.status === 401 || xhr.status === 403) {
        showNotification("Authentication failed. Please log in again.", "error");
        setTimeout(() => {
          window.location.href = "/Frontend/pages/login-and-register/login-and-register.html";
        }, 2000);
        return;
      }

      // Fallback: Continue with payment without backend hash (for development)
      showNotification("Payment system initialized. Proceeding with PayHere...", "info");

      const fallbackPayment = {
        sandbox: true,
        merchant_id: "1231966",
        return_url: window.location.origin + "/Frontend/pages/Publisher/publisher-dashboard.html",
        cancel_url: window.location.origin + "/Frontend/pages/Publisher/buy-subscription.html",
        notify_url: "http://localhost:8080/api/payments/notify",
        order_id: orderId,
        items: "BlogHub Premium Subscription - Lifetime Access",
        amount: "4999.00",
        currency: "LKR",
        hash: "FALLBACK_" + orderId,
        first_name: username.split(" ")[0] || username,
        last_name: username.split(" ")[1] || "User",
        email: email,
        phone: "0777123456",
        address: "Colombo",
        city: "Colombo",
        country: "Sri Lanka",
        delivery_address: "Colombo",
        delivery_city: "Colombo",
        delivery_country: "Sri Lanka",
        custom_1: email,
        custom_2: token
      };

      // Store payment info locally for manual processing if needed
      localStorage.setItem("pendingPayment", JSON.stringify({
        orderId: orderId,
        email: email,
        amount: 4999.00,
        timestamp: new Date().toISOString()
      }));

      // Initialize PayHere payment anyway
      payhere.startPayment(fallbackPayment);
    }
  });
}

// PayHere event handlers
payhere.onCompleted = function onCompleted(orderId) {
  console.log("Payment completed. OrderID:" + orderId);

  showNotification("Payment completed successfully! Your subscription is now active.", "success");

  // Update local storage to reflect subscription status
  localStorage.setItem("hasSubscription", "true");
  localStorage.setItem("subscriptionDate", new Date().toISOString());

  // Redirect to dashboard after a short delay
  setTimeout(() => {
      window.location.href = "/Frontend/pages/Publisher/AI-generated-article.html";
  }, 3000);
};

payhere.onDismissed = function onDismissed() {
  console.log("Payment dismissed");
  showNotification("Payment was cancelled.", "info");
};

payhere.onError = function onError(error) {
  console.log("Error:" + error);
  showNotification("Payment failed: " + error, "error");
};

// Initialize page
$(document).ready(function() {
  // Check authentication first
  if (!checkPublisherAuth()) {
    return;
  }

  // Refresh user data from backend
  refreshUserData();

  // Populate user information
  const email = localStorage.getItem("email");
  const username = localStorage.getItem("username");

  if (email && username) {
    // Update UI with user info if needed
    console.log("Payment page loaded for:", username, email);
  }

  // Bind payment button click event
  $("#payHereButton").on("click", function() {
    const $btn = $(this);
    const originalText = $btn.html();

    // Show loading state
    $btn.prop('disabled', true);
    $btn.html('<i class="fas fa-spinner fa-spin me-2"></i>Processing...');

    // Initialize payment
    initiatePayment();

    // Reset button after a delay (in case payment modal doesn't open)
    setTimeout(() => {
      $btn.prop('disabled', false);
      $btn.html(originalText);
    }, 5000);
  });
});
