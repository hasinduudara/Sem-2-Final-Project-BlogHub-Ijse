// ==========================
// AUTH HANDLER SCRIPT (auth.js)
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

      try {
        const res = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, email, password, role }),
        });

        const data = await res.json();
        if (res.ok && data.code === 201) {
          alert("Registration Successful! Please login.");
          // Switch to login form
          document.querySelector('.toggle-btn[data-form="login"]')?.click();
          document.getElementById("loginEmail").value = email; // pre-fill email
        } else {
          alert(data.data || "Registration failed");
        }
      } catch (err) {
        console.error(err);
        alert("An error occurred during registration.");
      }
    });

  // -----------------------
  // LOGIN FORM HANDLER
  // -----------------------
  document
    .getElementById("loginForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      try {
        const res = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          const text = await res.text();
          console.error("Non-JSON response:", text);
          throw parseError;
        }

        if (res.ok && data.code === 200) {
          const token = data.data.token;
          const username = data.data.username;

          // Show success message first
          alert("Login Successful!");

          // ✅ Safe localStorage access
          try {
            localStorage.setItem("token", token);
            localStorage.setItem("username", username);
          } catch (e) {
            console.warn("Cannot access localStorage:", e);
          }

          // Fetch user role and redirect
          try {
            const userRole = await fetchUserRole(email, token);
            if (userRole) {
              redirectToDashboard(userRole.toUpperCase());
            } else {
              alert("Unable to determine user role.");
            }
          } catch (roleError) {
            console.error("Error fetching user role:", roleError);
            alert("Login successful but unable to redirect. Please try again.");
          }
        } else {
          alert(data.message || "Login failed");
        }
      } catch (err) {
        console.error("Login error:", err);
        alert("Something went wrong");
      }
    });

  // -----------------------
  // HELPER: Fetch user role
  // -----------------------
  async function fetchUserRole(email, token) {
    try {
      const res = await fetch(`http://localhost:8080/api/auth/users/${email}`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Failed to fetch user role, status:", res.status);
        return null;
      }

      const userData = await res.json();
      console.log("User data received:", userData);
      return userData.role || null;
    } catch (err) {
      console.error("Error in fetchUserRole:", err);
      return null;
    }
  }

  // -----------------------
  // HELPER: Redirect
  // -----------------------
  function redirectToDashboard(role) {
    console.log("Redirecting with role:", role);

    const baseUrl = "http://127.0.0.1:5500/Frontend/pages";

    if (role === "USER") {
      console.log("Navigating to user profile");
      window.location.href = `${baseUrl}/home-page.html`;
    } else if (role === "PUBLISHER") {
      console.log("Navigating to publisher dashboard");
      window.location.href = `${baseUrl}/Publisher/publisher-dashboard.html`;
    } else if (role === "ADMIN") {
      console.log("Navigating to admin dashboard");
      window.location.href = `${baseUrl}/Admin/admin-dashboard.html`;
    } else {
      console.error("Unknown role received:", role);
      alert("Unknown role: " + role);
    }
  }
});
