const API_BASE = "http://localhost:8080/api/forgot-password";
let currentEmail = "";

function showStep(stepId) {
  document
    .querySelectorAll(".form-step")
    .forEach((step) => step.classList.remove("active"));
  document.getElementById(stepId).classList.add("active");
}

async function validateEmail() {
  const email = document.getElementById("emailInput").value.trim();
  if (!email) {
    alert("Please enter your email address.");
    return;
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  try {
    // Check if user exists with this email
    const res = await fetch(
      `${API_BASE}/validate-email/${encodeURIComponent(email)}`
    );
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("No account found with this email address.");
      }
      throw new Error("Error validating email. Please try again.");
    }

    currentEmail = email;
    document.getElementById("confirmEmail").innerText = email;
    showStep("confirmStep");
    document.getElementById("message").innerText = "";
  } catch (err) {
    document.getElementById("message").innerText = err.message;
  }
}

async function sendOtp() {
  if (!currentEmail) return;

  try {
    const res = await fetch(
      `${API_BASE}/send-otp?email=${encodeURIComponent(currentEmail)}`,
      {
        method: "POST",
      }
    );
    if (!res.ok) throw new Error("Failed to send OTP. Please try again.");

    document.getElementById("message").innerText =
      "OTP sent to your email. Please check your inbox.";
    showStep("otpStep");
  } catch (err) {
    document.getElementById("message").innerText = err.message;
  }
}

async function verifyOtp() {
  const otp = document.getElementById("otp").value.trim();
  if (!otp) {
    alert("Please enter the OTP.");
    return;
  }

  if (otp.length !== 6 || !/^\d+$/.test(otp)) {
    alert("Please enter a valid 6-digit OTP.");
    return;
  }

  try {
    const res = await fetch(
      `${API_BASE}/verify-otp?email=${encodeURIComponent(currentEmail)}&otp=${otp}`,
      { method: "POST" }
    );
    if (!res.ok) {
      if (res.status === 400) {
        throw new Error("Invalid or expired OTP. Please try again.");
      }
      throw new Error("Error verifying OTP. Please try again.");
    }

    document.getElementById("message").innerText = "OTP verified successfully!";
    showStep("newPasswordStep");
  } catch (err) {
    document.getElementById("message").innerText = err.message;
  }
}

async function resetPassword() {
  const newPassword = document.getElementById("newPassword").value.trim();
  if (!newPassword) {
    alert("Please enter a new password.");
    return;
  }

  // if (newPassword.length < 6) {
  //   alert("Password must be at least 6 characters long.");
  //   return;
  // }

  try {
    const res = await fetch(
      `${API_BASE}/reset-password?email=${encodeURIComponent(
        currentEmail
      )}&newPassword=${encodeURIComponent(newPassword)}`,
      { method: "POST" }
    );
    if (!res.ok) throw new Error("Failed to reset password. Please try again.");

    document.getElementById("message").innerText =
      "Password updated successfully! You can now log in with your new password.";

    // Optionally redirect to login page after a delay
    setTimeout(() => {
      window.location.href =
        "/Frontend/pages/login-and-register/login-and-register.html";
    }, 3000);
  } catch (err) {
    document.getElementById("message").innerText = err.message;
  }
}
