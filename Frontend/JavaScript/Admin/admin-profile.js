$(document).ready(function () {
  const API_BASE = "http://localhost:8080/api";

  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
    return;
  }

  // Load current admin profile data
  // (This requires a backend endpoint to get admin details)
  // For now, we can just display the stored info if available.
  const adminUsername = localStorage.getItem("adminUsername");
  const adminEmail = localStorage.getItem("adminEmail");
  if (adminUsername) {
    $("#adminUsername").val(adminUsername);
  }
  if (adminEmail) {
    $("#adminEmail").val(adminEmail);
  }

  // Handle Update Profile form submission
  $("#updateAdminProfileForm").on("submit", function (e) {
    e.preventDefault();
    const newUsername = $("#adminUsername").val();
    const newEmail = $("#adminEmail").val();

    // In a real application, you would send this data to the backend
    // using a PUT request.
    // Example:
    /*
      $.ajax({
        url: API_BASE + "/admin/profile",
        method: "PUT",
        headers: { Authorization: "Bearer " + token },
        contentType: "application/json",
        data: JSON.stringify({ username: newUsername, email: newEmail }),
        success: function(response) {
          alert("Profile updated successfully!");
          localStorage.setItem("adminUsername", response.username);
          localStorage.setItem("adminEmail", response.email);
        },
        error: function(xhr) {
          alert("Failed to update profile.");
        }
      });
      */
    alert("Profile update functionality is a backend task. UI is ready.");
  });

  // Handle Add New Admin form submission
  $("#addNewAdminForm").on("submit", function (e) {
    e.preventDefault();
    const newAdminUsername = $("#newAdminUsername").val();
    const newAdminEmail = $("#newAdminEmail").val();
    const newAdminPassword = $("#newAdminPassword").val();

    // This will require a backend endpoint to register a new admin
    // Example:
    /*
      $.ajax({
        url: API_BASE + "/admin/register-new",
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        contentType: "application/json",
        data: JSON.stringify({ username: newAdminUsername, email: newAdminEmail, password: newAdminPassword }),
        success: function(response) {
          alert("New admin added successfully!");
          $("#addNewAdminForm")[0].reset();
        },
        error: function(xhr) {
          alert("Failed to add new admin.");
        }
      });
      */
    alert(
      "New admin registration functionality is a backend task. UI is ready."
    );
  });
});
