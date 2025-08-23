const API_BASE = "http://localhost:8080/api";

// Function to show notification
function showNotification(message, type = "success") {
  $(".alert-notification").remove();
  const alertClass = type === "success" ? "alert-success" : "alert-danger";
  const icon = type === "success" ? "fa-check-circle" : "fa-exclamation-circle";

  const notification = $(`
    <div class="alert ${alertClass} alert-dismissible fade show notification" role="alert">
      <i class="fas ${icon} me-2"></i>${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `);

  $("body").append(notification);
  setTimeout(() => {
    notification.alert("close");
  }, 5000);
}

// 🔹 Logout
$("#logoutBtn").on("click", function () {
  localStorage.removeItem("jwt");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  localStorage.removeItem("role");

  showNotification("Logged out successfully!");
  setTimeout(() => {
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
  }, 1000);
});

// 🔹 Article Create
$("#articleForm").on("submit", function (e) {
  e.preventDefault();

  const title = $("#articleTitle").val().trim();
  const content = $("#articleContent").val().trim();
  const category = $("#articleCategory").val();
  const publishDate = $("#publishDate").val();
  const imageFile = $("#articleImage")[0].files[0];

  if (!title || !content) {
    showNotification("Title and content are required", "error");
    return;
  }

  const fd = new FormData();
  fd.append("title", title);
  fd.append("content", content);
  if (category) fd.append("category", category);
  if (publishDate) fd.append("publishDate", publishDate);
  if (imageFile) fd.append("image", imageFile);

  const token = localStorage.getItem("jwt");
  if (!token) {
    showNotification("Please login again", "error");
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
    return;
  }

  $.ajax({
    url: API_BASE + "/articles",
    method: "POST",
    data: fd,
    processData: false,
    contentType: false,
    headers: { Authorization: "Bearer " + token },
    success: function (data) {
      $("#createArticleModal").modal("hide");
      $("#articleForm")[0].reset();

      const message =
        data.status === "PUBLISHED"
          ? "Article published successfully!"
          : "Article scheduled for " +
            new Date(data.scheduleAt).toLocaleString();

      showNotification(message);
      loadMyArticles("PUBLISHED");
      loadMyArticles("SCHEDULED");
    },
    error: function (xhr) {
      console.error("Article creation error:", xhr);
      if (xhr.status === 403) {
        showNotification(
          "Permission denied. Please check your authentication.",
          "error"
        );
      } else if (xhr.status === 401) {
        showNotification("Session expired. Please login again.", "error");
        window.location.href =
          "/Frontend/pages/login-and-register/login-and-register.html";
      } else if (xhr.status === 415) {
        showNotification(
          "Unsupported media type. Try a different image format.",
          "error"
        );
      } else {
        showNotification("Error creating article: " + xhr.statusText, "error");
      }
    },
  });
});

// 🔹 Load My Articles
function loadMyArticles(status) {
  const wrapId =
    status === "PUBLISHED" ? "publishedContainer" : "scheduledContainer";
  const emptyId = status === "PUBLISHED" ? "publishedEmpty" : "scheduledEmpty";
  const container = $("#" + wrapId);
  const emptyState = $("#" + emptyId);

  container.empty();

  const token = localStorage.getItem("jwt");
  if (!token) {
    emptyState.show();
    return;
  }

  $.ajax({
    url: `${API_BASE}/articles/me?status=${status}&page=0&size=50`,
    method: "GET",
    headers: { Authorization: "Bearer " + token },
    success: function (json) {
      if (!json.content || json.content.length === 0) {
        emptyState.show();
        return;
      }

      emptyState.hide();
      json.content.forEach((article) => {
        const excerpt = article.excerpt
          ? article.excerpt.substring(0, 100) +
            (article.excerpt.length > 100 ? "..." : "")
          : "No content available";

        const card = $(`
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              ${
                article.imageUrl
                  ? `<img src="${article.imageUrl}" class="card-img-top" alt="${article.title}">`
                  : `<div class="card-img-top bg-light d-flex align-items-center justify-content-center">
                       <i class="fas fa-image fa-3x text-muted"></i>
                     </div>`
              }
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text flex-grow-1">${excerpt}</p>
                <div class="mt-auto d-flex justify-content-between align-items-center">
                  <small class="text-muted">${new Date(
                    article.createdAt
                  ).toLocaleDateString()}</small>
                  <div>
                    <button class="btn btn-outline-primary btn-sm view-article" data-id="${
                      article.id
                    }">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `);
        container.append(card);
      });
    },
    error: function (xhr) {
      console.error("Error loading articles", xhr);
      emptyState.show();
      if (xhr.status === 401) {
        showNotification("Session expired. Please login again.", "error");
      }
    },
  });
}

// 🔹 Initial load
$(document).ready(function () {
  const token = localStorage.getItem("jwt");
  if (!token) {
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
    return;
  }

  loadMyArticles("PUBLISHED");
  loadMyArticles("SCHEDULED");

  $("#generateArticleBtn").on("click", function () {
    showNotification("Article generation feature coming soon!", "info");
  });
});
