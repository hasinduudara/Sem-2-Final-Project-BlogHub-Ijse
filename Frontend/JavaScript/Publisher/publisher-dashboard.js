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

const articleForm = document.getElementById("articleForm");

articleForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("articleTitle").value.trim();
  const content = document.getElementById("articleContent").value.trim();
  const category = document.getElementById("articleCategory").value;
  const publishDate = document.getElementById("publishDate").value; // '' or ISO
  const imageFile = document.getElementById("articleImage").files[0];

  const fd = new FormData();
  fd.append("title", title);
  fd.append("content", content);
  fd.append("category", category === "Select a category" ? "" : category);
  if (publishDate) fd.append("publishDate", publishDate);
  if (imageFile) fd.append("image", imageFile);

  try {
    const res = await fetch("http://localhost:8080/api/articles", {
      method: "POST",
      credentials: "include", // JWT cookie
      body: fd,
    });

    if (!res.ok) throw new Error("Create failed");
    const data = await res.json();

    // close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("createArticleModal")
    );
    modal.hide();

    alert(
      data.status === "PUBLISHED"
        ? "Article published!"
        : "Article scheduled for " + data.scheduleAt
    );

    // Reload your dashboard lists
    loadMyArticles("PUBLISHED");
    loadMyArticles("SCHEDULED");
  } catch (err) {
    console.error(err);
    alert("Error creating article");
  }
});

async function loadMyArticles(status) {
  const wrapId = status === "PUBLISHED" ? "published" : "scheduled";
  const container = document.getElementById(wrapId);
  container.innerHTML = ""; // clear

  const res = await fetch(
    `http://localhost:8080/api/articles/me?status=${status}&page=0&size=50`,
    {
      credentials: "include",
    }
  );
  const json = await res.json();
  if (!json.content.length) {
    container.innerHTML = `<div class="text-center py-5">
          <h4 class="text-muted">No ${status.toLowerCase()} articles</h4>
        </div>`;
    return;
  }

  const rows = document.createElement("div");
  rows.className = "row g-3";

  json.content.forEach((a) => {
    const col = document.createElement("div");
    col.className = "col-md-4";
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
            <div class="mt-auto">
              <a class="btn btn-outline-primary btn-sm" href="/Frontend/pages/Publisher/publisher-dashboard.html#view-${
                a.id
              }">
                View
              </a>
            </div>
          </div>
        </div>`;
    rows.appendChild(col);
  });

  container.appendChild(rows);
}

document.addEventListener("DOMContentLoaded", () => {
  loadMyArticles("PUBLISHED");
  loadMyArticles("SCHEDULED");
});
