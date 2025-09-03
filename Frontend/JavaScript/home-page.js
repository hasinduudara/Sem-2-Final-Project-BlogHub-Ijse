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
    const res = await fetch("http://localhost:8080/api/home/articles");
    if (!res.ok) throw new Error("Network response was not ok");

    const data = await res.json();
    renderArticles(data);
  } catch (err) {
    console.error(err);
    document.getElementById("articlesRow").innerHTML = `
            <div class="col-12 text-center">
              <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>Error loading articles
              </div>
            </div>
          `;
  }
}

// Logout functionality
document.getElementById("logoutBtn").addEventListener("click", () => {
  // Clear saved auth data
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  localStorage.removeItem("role");

  // Show Bootstrap toast
  const toastEl = document.getElementById("logoutToast");
  const toast = new bootstrap.Toast(toastEl);
  toast.show();

  // Redirect after short delay
  setTimeout(() => {
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
  }, 1500);
});

// Load articles when DOM is ready
document.addEventListener("DOMContentLoaded", loadHomeArticles);
