$(document).ready(function () {
  // Logout function
  $("#logoutBtn").on("click", function () {
    // Clear the token and any user data from local storage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUsername");

    // Redirect to the login page
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
    alert("You have been logged out successfully.");
  });

  // Check for an admin token on page load (basic auth check)
  const token = localStorage.getItem("adminToken");
  if (!token) {
    alert("Access denied. Please log in as an admin.");
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
  }
});
