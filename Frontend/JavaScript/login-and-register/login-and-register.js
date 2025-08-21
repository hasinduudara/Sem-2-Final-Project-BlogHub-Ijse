document.addEventListener("DOMContentLoaded", () => {
  const toggleButtons = document.querySelectorAll(".toggle-btn");
  const loginForm = document.querySelector(".login-form");
  const registerForm = document.querySelector(".register-form");
  const forgotPasswordLink = document.getElementById("forgotPasswordLink");
  const forgotPasswordModal = document.getElementById("forgotPasswordModal");
  const closeBtn = forgotPasswordModal.querySelector(".close");
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");

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

  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault();
    forgotPasswordModal.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    forgotPasswordModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === forgotPasswordModal) {
      forgotPasswordModal.style.display = "none";
    }
  });

  forgotPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("forgotEmail").value;
    alert(
      "Password reset link has been sent to your email if it exists in our system."
    );
    forgotPasswordModal.style.display = "none";
  });

  // -----------------------
  //  REGISTER FORM HANDLER
  // -----------------------
  document
    .getElementById("registerForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("registerUsername").value;
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
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
          document.querySelector('.toggle-btn[data-form="login"]').click();
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
  //  LOGIN FORM HANDLER
  // -----------------------
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // only needed if your backend sets cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.code === 200) {
        const token = data.data.token; // ✅ correct property
        const username = data.data.username;

        // Save token for later requests
        localStorage.setItem("jwt", token);
        localStorage.setItem("username", username);

        alert("Login Successful!");

        // ✅ Fetch role with token
        const userRole = await fetchUserRole(email, token);
        if (userRole) {
          redirectToDashboard(userRole.toUpperCase());
        } else {
          alert("Unable to determine user role.");
        }
      } else {
        alert(data.status || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during login.");
    }
  });

  // -----------------------
  // HELPER: Fetch user role
  // -----------------------
  async function fetchUserRole(email) {
    try {
      const res = await fetch(`http://localhost:8080/api/auth/users/${email}`, {
        credentials: "include",
      });
      if (!res.ok) return null;

      const userData = await res.json();
      return userData.role || null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  // -----------------------
  // HELPER: Redirect
  // -----------------------
  function redirectToDashboard(role) {
    if (role === "USER") {
      window.location.href = "/Frontend/pages/home-page.html";
    } else if (role === "PUBLISHER") {
      window.location.href =
        "/Frontend/pages/Publisher/publisher-dashboard.html";
    } else if (role === "ADMIN") {
      window.location.href = "/Frontend/pages/Admin/admin-dashboard.html";
    } else {
      alert("Unknown role: " + role);
    }
  }
});
