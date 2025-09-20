$(document).ready(function () {
  // Add a small delay to ensure localStorage is fully populated after redirect
  setTimeout(function() {
    checkAdminAuthentication();
  }, 100);

  function checkAdminAuthentication() {
    // Check for proper admin authentication on page load with detailed debugging
    console.log("=== ADMIN DASHBOARD AUTH CHECK ===");

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");

    console.log("Token exists:", token ? "Yes" : "No");
    console.log("Role value:", role);
    console.log("Role type:", typeof role);
    console.log("Role length:", role ? role.length : "N/A");
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Checking role === 'ADMIN':", role === "ADMIN");
    console.log("All localStorage keys:", Object.keys(localStorage));

    // Check for any extra whitespace or hidden characters
    if (role) {
      console.log("Role after trim:", role.trim());
      console.log("Role after trim === 'ADMIN':", role.trim() === "ADMIN");
      console.log("Role chars:", Array.from(role).map(c => c.charCodeAt(0)));
    }

    // If no token or role, give localStorage more time to populate
    if ((!token || !role) && window.location.href.includes('admin-dashboard')) {
      console.log("First check failed, retrying after 500ms...");
      setTimeout(function() {
        const retryToken = localStorage.getItem("token");
        const retryRole = localStorage.getItem("role");
        console.log("Retry - Token:", retryToken ? "Yes" : "No");
        console.log("Retry - Role:", retryRole);

        if (!retryToken || !retryRole || retryRole.trim() !== "ADMIN") {
          console.log("Authentication failed after retry");
          alert("Access denied. Please log in as an admin.");
          window.location.href = "http://127.0.0.1:5500/Frontend/pages/login-and-register/login-and-register.html";
          return;
        } else {
          console.log("Authentication successful after retry - User is admin");
          initializeAdminDashboard();
        }
      }, 500);
      return;
    }

    if (!token || !role || role.trim() !== "ADMIN") {
      console.log("Authentication failed:");
      console.log("- No token:", !token);
      console.log("- No role:", !role);
      console.log("- Role not ADMIN:", role ? role.trim() !== "ADMIN" : "No role");

      alert("Access denied. Please log in as an admin.");
      window.location.href = "http://127.0.0.1:5500/Frontend/pages/login-and-register/login-and-register.html";
      return;
    }

    console.log("Authentication successful - User is admin");
    console.log("================================");
    initializeAdminDashboard();
  }

  function initializeAdminDashboard() {
    // Display username in the UI
    const username = localStorage.getItem("username");
    const userDisplayElement = document.getElementById("userDisplay");
    if (userDisplayElement && username) {
      userDisplayElement.textContent = username;
    }

    // Logout function
    $("#logoutBtn").on("click", function () {
      // Clear all tokens and user data from local storage
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("role");
      localStorage.removeItem("email");
      localStorage.removeItem("profileImageUrl"); // Clear user profile image
      localStorage.removeItem("publisherLogoUrl"); // Clear publisher logo
      localStorage.removeItem("publisherName"); // Clear publisher name
      // Keep legacy clear for compatibility
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUsername");

      // Redirect to the login page
      window.location.href = "http://127.0.0.1:5500/Frontend/pages/login-and-register/login-and-register.html";
      alert("You have been logged out successfully.");
    });
  }
});
