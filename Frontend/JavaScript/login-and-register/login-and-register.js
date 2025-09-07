// ==========================
// AUTH HANDLER SCRIPT (auth.js) - Enhanced with Debug
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  const loginForm = document.querySelector(".login-form");
  const registerForm = document.querySelector(".register-form");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const forgotPasswordModal = document.getElementById("forgotPasswordModal");
  const closeBtn = forgotPasswordModal?.querySelector(".close");
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");

  // -----------------------
  // FORM TOGGLE (Login <-> Register)
  // -----------------------
  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      toggleButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      if (button.dataset.form === "login") {
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
      } else {
        registerForm.classList.add("active");
        loginForm.classList.remove("active");
      }
    });
  });

  // -----------------------
  // FORGOT PASSWORD MODAL
  // -----------------------
  forgotPasswordLink?.addEventListener("click", (e) => {
    e.preventDefault();
    forgotPasswordModal.style.display = "block";
  });

  closeBtn?.addEventListener("click", () => {
    forgotPasswordModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === forgotPasswordModal) {
      forgotPasswordModal.style.display = "none";
    }
  });

  forgotPasswordForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgotEmail").value.trim();
    alert(
      "Password reset link has been sent to your email if it exists in our system."
    );
    forgotPasswordModal.style.display = "none";
  });

  // -----------------------
  // REGISTER FORM HANDLER
  // -----------------------
  document
    .getElementById("registerForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("registerUsername").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value.trim();
      const role = document.getElementById("role").value;

      console.log("=== REGISTRATION ATTEMPT ===");
      console.log("Username:", username);
      console.log("Email:", email);
      console.log("Role:", role);
      console.log("Password provided:", password ? "Yes" : "No");

      try {
        const res = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, email, password, role }),
        });

        const data = await res.json();
        console.log("Registration response:", data);

        if (res.ok && data.code === 201) {
          alert("Registration Successful! Please login.");
          // Switch to login form
          document.querySelector('.toggle-btn[data-form="login"]')?.click();
          document.getElementById("loginEmail").value = email; // pre-fill email
        } else {
          console.error("Registration failed:", data);
          alert(data.data || "Registration failed");
        }
      } catch (err) {
        console.error("Registration error:", err);
        alert("An error occurred during registration.");
      }
    });

  // -----------------------
  // LOGIN FORM HANDLER - Enhanced with debugging
  // -----------------------
  document
    .getElementById("loginForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      console.log("=== LOGIN ATTEMPT ===");
      console.log("Email:", email);
      console.log("Password provided:", password ? "Yes" : "No");
      console.log("Password length:", password ? password.length : 0);

      try {
        const res = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        console.log("Response status:", res.status);
        console.log("Response ok:", res.ok);

        const data = await res.json();
        console.log("Login response data:", data);

        if (res.ok && data.code === 200) {
          const token = data.data.token;
          const username = data.data.username;
          const role = data.data.role;

          console.log("Login successful!");
          console.log("Token received:", token ? "Yes" : "No");
          console.log("Username:", username);
          console.log("Role received:", role);

          alert("Login Successful!");

          // Store all data in localStorage
          localStorage.setItem("token", token);
          localStorage.setItem("username", username);
          localStorage.setItem("role", role);
          localStorage.setItem("email", email);

          console.log("Data stored in localStorage:");
          console.log(
            "- Token:",
            localStorage.getItem("token") ? "Stored" : "Not stored"
          );
          console.log("- Username:", localStorage.getItem("username"));
          console.log("- Role:", localStorage.getItem("role"));
          console.log("- Email:", localStorage.getItem("email"));

          // Redirect based on role
          console.log("Attempting to redirect with role:", role);
          redirectToDashboard(role.toUpperCase());
        } else {
          console.error("Login failed:");
          console.error("- Code:", data.code);
          console.error("- Message:", data.message);
          console.error("- Data:", data.data);
          alert(data.message || "Login failed");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Something went wrong: " + err.message);
      }
    });

  // -----------------------
  // HELPER: Redirect with enhanced logging
  // -----------------------
  function redirectToDashboard(role) {
    console.log("=== REDIRECT ATTEMPT ===");
    console.log("Role for redirect:", role);
    console.log("Role type:", typeof role);

    const baseUrl = "http://127.0.0.1:5500/Frontend/pages";

    if (role === "USER") {
      console.log("Redirecting to USER dashboard");
      window.location.href = `${baseUrl}/home-page.html`;
    } else if (role === "PUBLISHER") {
      console.log("Redirecting to PUBLISHER dashboard");
      window.location.href = `${baseUrl}/Publisher/publisher-dashboard.html`;
    } else if (role === "ADMIN") {
      console.log("Redirecting to ADMIN dashboard");
      window.location.href = `${baseUrl}/Admin/admin-dashboard.html`;
    } else {
      console.error("Unknown role received:", role);
      console.log("Available roles should be: USER, PUBLISHER, ADMIN");
      alert("Unknown role: " + role + ". Please contact support.");
    }
  }

  // -----------------------
  // DEBUG FUNCTION: Check all users (only for development)
  // -----------------------
  window.debugCheckUsers = async function () {
    try {
      const res = await fetch("http://localhost:8080/api/auth/debug/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = await res.json();
      console.log("All users in database:", data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Add debug info to console
  console.log("Auth.js loaded successfully");
  console.log("To debug users, run: debugCheckUsers()");
});
