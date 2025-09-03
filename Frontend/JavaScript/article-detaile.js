const params = new URLSearchParams(window.location.search);
const articleId = params.get("id");

// Load article
async function loadArticle() {
  try {
    const res = await fetch(`http://localhost:8080/api/articles/${articleId}`);
    if (!res.ok) throw new Error("Failed to load article");

    const article = await res.json();
    const container = document.getElementById("articleContainer");

    container.innerHTML = `
          <div class="card">
            ${
              article.imageUrl
                ? `<img src="${article.imageUrl}" class="card-img-top article-image" alt="">`
                : ""
            }
            <div class="card-body">
              <h2>${article.title}</h2>
              <p class="text-muted">By ${article.authorName} | ${new Date(
      article.publishedAt
    ).toLocaleDateString()}</p>
              <p>${article.content}</p>
              <button class="like-btn" id="likeBtn">
                <i class="fas fa-thumbs-up me-1"></i> Like (<span id="likeCount">${
                  article.likes || 0
                }</span>)
              </button>
            </div>
          </div>
        `;

    // Like button handler
    document.getElementById("likeBtn").addEventListener("click", async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/articles/${articleId}/like`,
          {
            method: "POST",
            credentials: "include",
          }
        );
        if (res.ok) {
          const newCount = await res.json();
          document.getElementById("likeCount").textContent = newCount.likes;
        }
      } catch (err) {
        console.error(err);
      }
    });
  } catch (err) {
    console.error(err);
    document.getElementById("articleContainer").innerHTML = `
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>Failed to load article
          </div>
        `;
  }
}

// Load comments
async function loadComments() {
  try {
    const res = await fetch(
      `http://localhost:8080/api/articles/${articleId}/comments`
    );
    if (!res.ok) throw new Error("Failed to load comments");

    const comments = await res.json();
    const list = document.getElementById("commentsList");
    list.innerHTML = "";

    if (comments.length === 0) {
      list.innerHTML = `<li class="list-group-item">No comments yet</li>`;
      return;
    }

    comments.forEach((c) => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `<strong>${c.username}</strong>: ${c.text}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    document.getElementById(
      "commentsList"
    ).innerHTML = `<li class="list-group-item text-danger">Error loading comments</li>`;
  }
}

// Post comment
document.getElementById("commentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = document.getElementById("commentText").value;

  try {
    const res = await fetch(
      `http://localhost:8080/api/articles/${articleId}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text }),
      }
    );
    if (res.ok) {
      document.getElementById("commentText").value = "";
      loadComments();
    } else {
      alert("Failed to post comment");
    }
  } catch (err) {
    console.error(err);
    alert("Error posting comment");
  }
});

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadArticle();
  loadComments();
});
