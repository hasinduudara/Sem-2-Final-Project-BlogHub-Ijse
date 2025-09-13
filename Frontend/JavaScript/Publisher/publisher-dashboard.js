const API_BASE = "http://localhost:8080/api";

// Function to show notification
function showNotification(message, type = "success") {
  $(".alert-notification").remove();
  const alertClass =
    type === "success"
      ? "alert-success"
      : type === "error"
      ? "alert-danger"
      : "alert-info";
  const icon =
    type === "success"
      ? "fa-check-circle"
      : type === "error"
      ? "fa-exclamation-circle"
      : "fa-info-circle";

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

// Helper: Get token or redirect
function getAuthToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
  }
  return token;
}

// Helper: Refresh all articles
function refreshArticles() {
  loadMyArticles("PUBLISHED");
  loadMyArticles("SCHEDULED");
}

// 🔹 Logout
$("#logoutBtn").on("click", function () {
  localStorage.removeItem("token");
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

  const token = getAuthToken();

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
      refreshArticles();
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
        showNotification(
          xhr.responseJSON?.message ||
            "Error creating article: " + xhr.statusText,
          "error"
        );
      }
    },
  });
});

// 🔹 View Article
$(document).on("click", ".view-article", function () {
  const articleId = $(this).data("id");
  window.location.href = `/Frontend/pages/article-detail.html?id=${articleId}`;
});

// 🔹 Article Edit
$(document).on("click", ".edit-article", function () {
  const articleId = $(this).data("id");
  const token = getAuthToken();

  $.ajax({
    url: API_BASE + "/articles/" + articleId,
    method: "GET",
    headers: { Authorization: "Bearer " + token },
    success: function (article) {
      $("#editArticleId").val(article.id);
      $("#editArticleTitle").val(article.title);
      $("#editArticleContent").val(article.content);
      $("#editArticleCategory").val(article.category || "");
      if (article.scheduleAt) {
        const formattedDate = new Date(article.scheduleAt)
          .toISOString()
          .slice(0, 16);
        $("#editPublishDate").val(formattedDate);
      } else {
        $("#editPublishDate").val("");
      }
      $("#editArticleModal").modal("show");
    },
    error: function () {
      showNotification("Error loading article for edit.", "error");
    },
  });
});

$("#editArticleForm").on("submit", function (e) {
  e.preventDefault();
  const articleId = $("#editArticleId").val();
  const title = $("#editArticleTitle").val().trim();
  const content = $("#editArticleContent").val().trim();
  const category = $("#editArticleCategory").val();
  const publishDate = $("#editPublishDate").val();
  const imageFile = $("#editArticleImage")[0].files[0];

  const fd = new FormData();
  fd.append("title", title);
  fd.append("content", content);
  if (category) fd.append("category", category);
  if (publishDate) fd.append("publishDate", publishDate);
  if (imageFile) fd.append("image", imageFile);

  const token = getAuthToken();

  $.ajax({
    url: API_BASE + "/articles/" + articleId,
    method: "PUT",
    data: fd,
    processData: false,
    contentType: false,
    headers: { Authorization: "Bearer " + token },
    success: function () {
      $("#editArticleModal").modal("hide");
      showNotification("Article updated successfully!");
      refreshArticles();
    },
    error: function (xhr) {
      console.error("Article update error:", xhr);
      showNotification(
        xhr.responseJSON?.message || "Error updating article.",
        "error"
      );
    },
  });
});

// 🔹 Article Delete
$(document).on("click", ".delete-article", function () {
  const articleId = $(this).data("id");
  const confirmed = confirm("Are you sure you want to delete this article?");
  if (!confirmed) return;

  const token = getAuthToken();

  $.ajax({
    url: API_BASE + "/articles/" + articleId,
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
    success: function () {
      showNotification("Article deleted successfully!");
      refreshArticles();
    },
    error: function (xhr) {
      showNotification(
        xhr.responseJSON?.message || "Error deleting article.",
        "error"
      );
    },
  });
});

// 🔹 Load My Articles
function loadMyArticles(status) {
  const containerId =
    status === "PUBLISHED" ? "publishedContainer" : "scheduledContainer";
  const emptyId = status === "PUBLISHED" ? "publishedEmpty" : "scheduledEmpty";

  const container = $("#" + containerId);
  const emptyState = $("#" + emptyId);

  container.empty();
  emptyState.hide();

  const token = getAuthToken();

  $.ajax({
    url: `${API_BASE}/articles/me?status=${status}&page=0&size=50`,
    type: "GET",
    headers: { Authorization: "Bearer " + token },
    success: function (res) {
      if (!res.content || res.content.length === 0) {
        emptyState.show();
        return;
      }

      container.empty();
      res.content.forEach((article) => {
        const excerpt = article.excerpt
          ? article.excerpt.length > 100
            ? article.excerpt.substring(0, 100) + "..."
            : article.excerpt
          : "No content available";

        const card = $(`
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              ${
                article.imageUrl
                  ? `<img src="${article.imageUrl}" class="card-img-top" alt="${article.title}">`
                  : `<div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height:200px;">
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
                    }">View</button>
                    <button class="btn btn-outline-secondary btn-sm edit-article" data-id="${
                      article.id
                    }">Edit</button>
                    <button class="btn btn-outline-danger btn-sm delete-article" data-id="${
                      article.id
                    }">Delete</button>
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
      console.error("Error loading articles:", xhr);
      emptyState.show();
      if (xhr.status === 401) {
        alert("Session expired. Please login again.");
        window.location.href =
          "/Frontend/pages/login-and-register/login-and-register.html";
      }
    },
  });
}

// Function to load and display publisher profile image
function loadPublisherProfileImage() {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  if (!token || !email) {
    return; // Use default image if no auth data
  }

  // Try to get cached image URL first
  const cachedImageUrl = localStorage.getItem("publisherLogoUrl");
  if (cachedImageUrl) {
    updateProfileImage(cachedImageUrl);
  }

  // Fetch latest profile data from API
  $.ajax({
    url: API_BASE + "/publishers/profile/" + email,
    method: "GET",
    headers: { Authorization: "Bearer " + token },
    success: function (response) {
      if (response.code === 200 && response.data.logoUrl) {
        updateProfileImage(response.data.logoUrl);
        // Cache the image URL
        localStorage.setItem("publisherLogoUrl", response.data.logoUrl);
      }
    },
    error: function (xhr) {
      console.log("Could not load profile image:", xhr.statusText);
      // Keep using default image on error
    },
  });
}

// Function to update the profile image element
function updateProfileImage(imageUrl) {
  if (imageUrl && imageUrl.trim() !== "") {
    $(".profile-img").attr("src", imageUrl);
  }
}

// 🔹 Initial load
$(document).ready(function () {
  const token = getAuthToken();
  if (!token) return;

  refreshArticles();
  loadPublisherProfileImage();

  $("#generateArticleBtn").on("click", function () {
    showNotification("Article generation feature coming soon!", "info");
  });
});
