$(document).ready(function () {
  const API_BASE = "http://localhost:8080/api";

  // ✅ Token & Role Check
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const adminId = localStorage.getItem("userId"); // Assuming userId is stored in localStorage

  if (!token || !role || role !== "ADMIN") {
    alert("Access denied. Please log in as an admin.");
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
    return;
  }

  // Check if adminId exists
  if (!adminId) {
    alert("Admin ID not found. Please log in again.");
    localStorage.clear();
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
    return;
  }

  // ✅ Load current admin profile data from backend
  function loadAdminProfile() {
    $.ajax({
      url: API_BASE + "/admin/profile/" + adminId,
      method: "GET",
      headers: { Authorization: "Bearer " + token },
      success: function (response) {
        $("#adminUsername").val(response.username);
        $("#adminEmail").val(response.email);

        // update localStorage
        localStorage.setItem("username", response.username);
        localStorage.setItem("email", response.email);
      },
      error: function () {
        alert("Failed to load admin profile.");
      },
    });
  }

  loadAdminProfile();

  // ✅ Update Profile
  $("#updateAdminProfileForm").on("submit", function (e) {
    e.preventDefault();
    const newUsername = $("#adminUsername").val();
    const newEmail = $("#adminEmail").val();

    $.ajax({
      url: API_BASE + "/admin/profile/" + adminId,
      method: "PUT",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({
        username: newUsername,
        email: newEmail,
      }),
      success: function (response) {
        alert("Profile updated successfully!");
        localStorage.setItem("username", response.username);
        localStorage.setItem("email", response.email);
      },
      error: function () {
        alert("Failed to update profile.");
      },
    });
  });

  // ✅ Add New Admin
  $("#addNewAdminForm").on("submit", function (e) {
    e.preventDefault();
    const newAdminUsername = $("#newAdminUsername").val();
    const newAdminEmail = $("#newAdminEmail").val();
    const newAdminPassword = $("#newAdminPassword").val();

    $.ajax({
      url: API_BASE + "/admin/register-new",
      method: "POST",
      headers: { Authorization: "Bearer " + token },
      contentType: "application/json",
      data: JSON.stringify({
        username: newAdminUsername,
        email: newAdminEmail,
        password: newAdminPassword,
      }),
      success: function () {
        alert("✅ New admin added successfully!");
        $("#addNewAdminForm")[0].reset();
      },
      error: function (xhr) {
        alert("❌ Failed to add new admin: " + xhr.responseText);
      },
    });
  });
});
