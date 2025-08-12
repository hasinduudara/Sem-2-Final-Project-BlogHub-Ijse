// -----------------------
// dashboard logout
// -----------------------
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      console.log("Token deleted");
      alert("Logged out successfully!");
      window.location.href =
        "/Frontend/pages/login-and-register/login-and-register.html"; // Login page path එක
    } else {
      console.error("Logout failed");
      alert("Logout failed");
    }
  } catch (err) {
    console.error(err);
    alert("Error logging out");
  }
});
