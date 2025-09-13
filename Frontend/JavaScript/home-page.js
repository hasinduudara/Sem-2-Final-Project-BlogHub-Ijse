// Render articles to DOM
function renderArticles(articles) {
  const row = document.getElementById("articlesRow");
  row.innerHTML = "";

  if (!articles || articles.length === 0) {
    row.innerHTML = `
            <div class="col-12 text-center">
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>No articles yet
              </div>
            </div>
          `;
    return;
  }

  articles.forEach((article) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-3";

    const excerpt =
      article.excerpt && article.excerpt.length > 100
        ? article.excerpt.substring(0, 100) + "..."
        : article.excerpt || "";

    col.innerHTML = `
            <div class="card article-card h-100">
              ${
                article.imageUrl
                  ? `<img src="${article.imageUrl}" class="card-img-top article-image" alt="">`
                  : ""
              }
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${excerpt}</p>
                <a href="article-detail.html?id=${
                  article.id
                }" class="btn btn-primary mt-auto">Read Full Article</a>
              </div>
            </div>
          `;

    row.appendChild(col);
  });
}

// Load articles from backend
async function loadHomeArticles() {
  try {
    const res = await fetch("http://localhost:8080/api/articles/published");
    if (!res.ok) throw new Error("Network response was not ok");

    const data = await res.json();
    console.log("Loaded articles:", data);
    renderArticles(data);
  } catch (error) {
    console.error("Error loading articles:", error);
    const row = document.getElementById("articlesRow");
    row.innerHTML = `
            <div class="col-12 text-center">
              <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>Error loading articles: ${error.message}
              </div>
            </div>
          `;
  }
}

// Load user profile image for navigation bar
async function loadUserProfileImage() {
  try {
    // Get user email from localStorage
    const userEmail = localStorage.getItem('email');
    const token = localStorage.getItem('token');

    if (!userEmail || !token) {
      console.log('No user authentication found, using default profile image');
      return;
    }

    console.log('Loading profile image for user:', userEmail);

    const response = await fetch(`http://localhost:8080/api/auth/profile/${userEmail}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.json();

      if (result.code === 200 && result.data.profileImageUrl) {
        const profileImg = document.querySelector('.profile-image');
        if (profileImg) {
          profileImg.src = result.data.profileImageUrl;
          console.log('Profile image loaded:', result.data.profileImageUrl);
        }
      } else {
        console.log('No profile image found for user');
      }
    } else {
      console.log('Failed to load user profile:', response.status);
    }
  } catch (error) {
    console.error('Error loading user profile image:', error);
    // Keep default image on error
  }
}

// ✅ Logout functionality
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    // Always clear local storage + cookies reference
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    if (res.ok) {
      const toastEl = document.getElementById("logoutToast");
      const toast = new bootstrap.Toast(toastEl);
      toast.show();

      setTimeout(() => {
        window.location.href =
          "/Frontend/pages/login-and-register/login-and-register.html";
      }, 1500);
    } else {
      alert("Logout failed on server");
    }
  } catch (err) {
    console.error(err);
    alert("Error logging out");
  }
});

// Load articles and user profile image when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  loadHomeArticles();
  loadUserProfileImage();
});
