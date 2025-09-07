$(document).ready(function () {
  // Logout function
  $("#logoutBtn").on("click", function () {
    // Clear all tokens and user data from local storage
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    // Keep legacy clear for compatibility
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");

    // Redirect to the login page
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
    alert("You have been logged out successfully.");
  });

  // Check for proper admin authentication on page load
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role || role !== "ADMIN") {
    alert("Access denied. Please log in as an admin.");
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
  }
});
