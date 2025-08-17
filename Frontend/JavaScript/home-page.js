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

async function loadHomeArticles() {
  const res = await fetch(
    "http://localhost:8080/api/articles/published?page=0&size=12",
    {
      credentials: "include",
    }
  );
  const json = await res.json();

  const row = document.querySelector(".container .row");
  row.innerHTML = ""; // clear info alert

  if (!json.content.length) {
    row.innerHTML = `<div class="col-12 text-center">
      <div class="alert alert-info">
      <i class="fas fa-info-circle me-2"></i>No articles available yet.
      </div>
    </div>`;
    return;
  }

  json.content.forEach((a) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-3";
    col.innerHTML = `
      <div class="card h-100">
        ${
          a.imageUrl
            ? `<img src="${a.imageUrl}" class="card-img-top" alt="">`
            : ""
        }
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${a.title}</h5>
          <p class="card-text">${a.excerpt}</p>
          <a href="/Frontend/pages/Publisher/publisher-dashboard.html#article-${
            a.id
          }" class="btn btn-primary mt-auto">
            Read Full Article
          </a>
        </div>
      </div>`;
    row.appendChild(col);
  });
}

document.addEventListener("DOMContentLoaded", loadHomeArticles);
