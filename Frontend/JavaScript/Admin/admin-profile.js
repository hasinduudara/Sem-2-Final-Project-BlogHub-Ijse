$(document).ready(function () {
  const API_BASE = "http://localhost:8080/api";
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const adminId = localStorage.getItem("userId");

  // Enhanced debugging
  console.log("Admin Profile - Auth Check:", {
    hasToken: !!token,
    role: role,
    adminId: adminId,
    tokenLength: token ? token.length : 0
  });

  if (!token || !role || role !== "ADMIN") {
    alert("Access denied. Please log in as an admin.");
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
    return;
  }
  if (!adminId) {
    alert("Admin ID not found. Please log in again.");
    localStorage.clear();
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
    return;
  }

  // Helper function to check token validity
  function isTokenValid() {
    if (!token) return false;
    try {
      // Basic JWT structure check
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp > currentTime;
    } catch (e) {
      console.error("Token validation error:", e);
      return false;
    }
  }

  // Enhanced AJAX setup with better error handling
  $.ajaxSetup({
    beforeSend: function(xhr, settings) {
      console.log("Making request to:", settings.url);
      console.log("With headers:", xhr.getAllResponseHeaders);
    },
    error: function(xhr, status, error) {
      console.error("Global AJAX error:", {
        status: status,
        error: error,
        responseText: xhr.responseText,
        statusCode: xhr.status,
        url: this.url
      });
    }
  });

  // ✅ Load current admin profile
  function loadAdminProfile() {
    if (!isTokenValid()) {
      alert("Session expired. Please log in again.");
      localStorage.clear();
      window.location.href = "/Frontend/pages/login-and-register/login-and-register.html";
      return;
    }

    $.ajax({
      url: API_BASE + "/admin/profile/" + adminId,
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      success: function (res) {
        console.log("Profile loaded successfully:", res);
        $("#adminUsername").val(res.username || "");
        $("#adminEmail").val(res.email || "");
        localStorage.setItem("username", res.username);
        localStorage.setItem("email", res.email);
      },
      error: function (xhr, status, error) {
        console.error("Failed to load admin profile:", {
          status: status,
          error: error,
          responseText: xhr.responseText,
          statusCode: xhr.status
        });
        if (xhr.status === 401 || xhr.status === 403) {
          alert("Session expired or access denied. Please log in again.");
          localStorage.clear();
          window.location.href = "/Frontend/pages/login-and-register/login-and-register.html";
        } else {
          alert("Failed to load admin profile. Please try refreshing the page.");
        }
      },
    });
  }
  loadAdminProfile();

  // ✅ Update profile
  $("#updateAdminProfileForm").on("submit", function (e) {
    e.preventDefault();

    if (!isTokenValid()) {
      alert("Session expired. Please log in again.");
      localStorage.clear();
      window.location.href = "/Frontend/pages/login-and-register/login-and-register.html";
      return;
    }

    $.ajax({
      url: API_BASE + "/admin/profile/" + adminId,
      method: "PUT",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      data: JSON.stringify({
        username: $("#adminUsername").val(),
        email: $("#adminEmail").val(),
      }),
      success: function (res) {
        console.log("Profile updated successfully:", res);
        alert("Profile updated successfully!");
        localStorage.setItem("username", res.username);
        localStorage.setItem("email", res.email);
      },
      error: function (xhr, status, error) {
        console.error("Failed to update profile:", xhr.responseText);
        if (xhr.status === 401 || xhr.status === 403) {
          alert("Session expired or access denied. Please log in again.");
          localStorage.clear();
          window.location.href = "/Frontend/pages/login-and-register/login-and-register.html";
        } else {
          alert("Failed to update profile: " + (xhr.responseJSON?.message || xhr.responseText || "Unknown error"));
        }
      },
    });
  });

  // ✅ Add new admin
  $("#addNewAdminForm").on("submit", function (e) {
    e.preventDefault();

    if (!isTokenValid()) {
      alert("Session expired. Please log in again.");
      localStorage.clear();
      window.location.href = "/Frontend/pages/login-and-register/login-and-register.html";
      return;
    }

    const newAdminEmail = $("#newAdminEmail").val();
    const newAdminUsername = $("#newAdminUsername").val();
    const newAdminPassword = $("#newAdminPassword").val();

    // Basic validation
    if (!newAdminEmail || !newAdminUsername || !newAdminPassword) {
      alert("Please fill in all fields.");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newAdminEmail)) {
      alert("Please enter a valid email address.");
      return;
    }

    $.ajax({
      url: API_BASE + "/admin/register-new",
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      data: JSON.stringify({
        username: newAdminUsername,
        email: newAdminEmail,
        password: newAdminPassword,
      }),
      success: function (res) {
        console.log("New admin added successfully:", res);
        alert("New admin added successfully!");
        $("#addNewAdminForm")[0].reset();
        loadAllAdmins();
      },
      error: function (xhr, status, error) {
        console.error("Failed to add new admin:", xhr.responseText);

        let errorMessage = "Failed to add new admin: ";

        try {
          // Try to parse the error response
          const errorResponse = JSON.parse(xhr.responseText);

          if (errorResponse.data && errorResponse.data.includes("Email already exists")) {
            errorMessage = "Cannot add admin: This email address is already registered. Please use a different email address.";
          } else if (errorResponse.data && errorResponse.data.includes("Username already exists")) {
            errorMessage = "Cannot add admin: This username is already taken. Please choose a different username.";
          } else if (errorResponse.data) {
            errorMessage += errorResponse.data;
          } else if (errorResponse.message) {
            errorMessage += errorResponse.message;
          } else {
            errorMessage += "Unknown error occurred.";
          }
        } catch (parseError) {
          // If response is not JSON, use the raw response
          if (xhr.responseText) {
            errorMessage += xhr.responseText;
          } else {
            errorMessage += "Unknown error occurred.";
          }
        }

        if (xhr.status === 401 || xhr.status === 403) {
          alert("Session expired or access denied. Please log in again.");
          localStorage.clear();
          window.location.href = "/Frontend/pages/login-and-register/login-and-register.html";
        } else {
          alert(errorMessage);
        }
      },
    });
  });

  // ✅ Load all admins with enhanced debugging and error handling
  function loadAllAdmins() {
    const tbody = $("#adminTable tbody");
    tbody.html('<tr><td colspan="4" class="text-center">Loading admins...</td></tr>');

    console.log("Loading admins with token:", token ? "Present" : "Missing");

    if (!isTokenValid()) {
      alert("Session expired. Please log in again.");
      localStorage.clear();
      window.location.href = "/Frontend/pages/login-and-register/login-and-register.html";
      return;
    }

    // Try the debug endpoint first as it's more likely to work
    $.ajax({
      url: API_BASE + "/auth/debug/users",
      method: "GET",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      },
      timeout: 15000,
      success: function (debugRes) {
        console.log("Debug endpoint response:", debugRes);
        tbody.empty();

        // Filter for admin users from the debug response
        let adminUsers = [];
        if (debugRes.data && Array.isArray(debugRes.data)) {
          adminUsers = debugRes.data.filter(user => user.role === 'ADMIN');
        } else if (Array.isArray(debugRes)) {
          adminUsers = debugRes.filter(user => user.role === 'ADMIN');
        }

        if (adminUsers.length === 0) {
          tbody.append('<tr><td colspan="4" class="text-center text-muted">No admins found</td></tr>');
          return;
        }

        adminUsers.forEach((a) => {
          tbody.append(`
            <tr>
              <td>${a.id || 'N/A'}</td>
              <td>${a.username || 'N/A'}</td>
              <td>${a.email || 'N/A'}</td>
              <td>
                <button class="btn btn-sm btn-danger delete-admin" data-id="${a.id}" ${a.id == adminId ? 'disabled title="Cannot delete yourself"' : ''}>
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          `);
        });
      },
      error: function (xhr, status, error) {
        console.error("Debug endpoint failed, trying admin users endpoint...");

        // If debug endpoint fails, try the admin users endpoint
        $.ajax({
          url: API_BASE + "/admin/users?role=ADMIN",
          method: "GET",
          headers: {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
          },
          timeout: 15000,
          success: function (res) {
            console.log("Admin users endpoint response:", res);
            tbody.empty();

            let adminUsers = Array.isArray(res) ? res : (res.data || []);

            if (adminUsers.length === 0) {
              tbody.append('<tr><td colspan="4" class="text-center text-muted">No admins found</td></tr>');
              return;
            }

            adminUsers.forEach((a) => {
              tbody.append(`
                <tr>
                  <td>${a.id || 'N/A'}</td>
                  <td>${a.username || 'N/A'}</td>
                  <td>${a.email || 'N/A'}</td>
                  <td>
                    <button class="btn btn-sm btn-danger delete-admin" data-id="${a.id}" ${a.id == adminId ? 'disabled title="Cannot delete yourself"' : ''}>
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              `);
            });
          },
          error: function (xhr2, status2, error2) {
            console.error("Both endpoints failed:", {
              debugError: {status: status, error: error, statusCode: xhr.status},
              adminUsersError: {status: status2, error: error2, statusCode: xhr2.status}
            });

            let errorMessage = "Failed to load admins list.";
            if (xhr2.status === 0) {
              errorMessage += " Please check if the server is running at " + API_BASE;
            } else if (xhr2.status === 401) {
              errorMessage += " Authentication failed. Please log in again.";
              localStorage.clear();
              window.location.href = "/Frontend/pages/login-and-register/login-and-register.html";
              return;
            } else if (xhr2.status === 403) {
              errorMessage += " Access denied. You may not have sufficient permissions to view admin users.";
            } else if (xhr2.status === 404) {
              errorMessage += " API endpoint not found. Please check the backend server.";
            } else if (xhr2.status >= 500) {
              errorMessage += " Server error occurred. Please try again later.";
            }

            tbody.html(`<tr><td colspan="4" class="text-center text-danger">${errorMessage}</td></tr>`);
            console.error("Detailed error info:", {
              debugEndpoint: {
                url: API_BASE + "/auth/debug/users",
                status: xhr.status,
                response: xhr.responseText
              },
              adminEndpoint: {
                url: API_BASE + "/admin/users?role=ADMIN",
                status: xhr2.status,
                response: xhr2.responseText
              }
            });
          }
        });
      },
    });
  }

  // Load admins after a short delay to ensure DOM is ready
  setTimeout(loadAllAdmins, 500);

  // ✅ Delete admin functionality
  $(document).on("click", ".delete-admin", function () {
    const id = $(this).data("id");

    // Prevent admin from deleting themselves
    if (id == adminId) {
      alert("You cannot delete your own admin account.");
      return false;
    }

    if (confirm("Are you sure you want to delete this admin? This action cannot be undone.")) {
      const deleteButton = $(this);
      const originalBtnText = deleteButton.html();

      // Disable button and show loading spinner with text
      deleteButton.prop('disabled', true);
      deleteButton.html('<i class="fas fa-spinner fa-spin me-1"></i> Removing...');

      $.ajax({
        url: API_BASE + "/admin/users/" + id,
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        },
        data: JSON.stringify({
          reason: "Deleted by admin from admin management panel"
        }),
        success: function (response) {
          console.log("Admin deleted successfully:", response);
          alert("Admin removed successfully!");
          loadAllAdmins(); // Reload the admin list
        },
        error: function (xhr, status, error) {
          console.error("Failed to delete admin:", xhr.responseText);

          if (xhr.status === 401 || xhr.status === 403) {
            alert("Session expired or access denied. Please log in again.");
            localStorage.clear();
            window.location.href = "/Frontend/pages/login-and-register/login-and-register.html";
          } else {
            let errorMessage = "Failed to remove admin: ";
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              errorMessage += errorResponse.message || errorResponse.data || "Unknown error";
            } catch (e) {
              errorMessage += xhr.responseText || "Unknown error";
            }
            alert(errorMessage);
          }
        },
        complete: function() {
          // Always restore button state when request completes (success or error)
          deleteButton.prop('disabled', false);
          deleteButton.html(originalBtnText);
        }
      });
    }
  });
});
