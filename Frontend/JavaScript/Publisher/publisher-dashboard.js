const API_BASE = "http://localhost:8080/api";

// Function to show notification
function showNotification(message, type = "success") {
  $(".alert-notification").remove(); // Ensure only one notification is shown
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
  }, 5000); // Notification disappears after 5 seconds
}

// Helper: Get token or redirect to login if not authenticated
function getAuthToken() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
    return null; // Return null if no token found
  }
  return token;
}

// Helper: Refreshes both published and scheduled articles
function refreshArticles() {
  loadMyArticles("PUBLISHED");
  loadMyArticles("SCHEDULED");
}

// 🔹 Logout Functionality
$("#logoutBtn").on("click", function () {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("email");
  localStorage.removeItem("role");

  showNotification("Logged out successfully!");
  setTimeout(() => {
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
  }, 1000); // Redirect after a short delay
});

// 🔹 Article Creation Form Submission
$("#articleForm").on("submit", function (e) {
  e.preventDefault();

  const title = $("#articleTitle").val().trim();
  const content = $("#articleContent").val().trim();
  const category = $("#articleCategory").val();
  const publishDate = $("#publishDate").val();
  const imageFile = $("#articleImage")[0].files[0]; // Get the file object

  if (!title || !content) {
    showNotification("Title and content are required", "error");
    return; // Stop submission if validation fails
  }

  const fd = new FormData(); // FormData is used for file uploads
  fd.append("title", title);
  fd.append("content", content);
  if (category) fd.append("category", category); // Append only if category is selected
  if (publishDate) fd.append("publishDate", publishDate); // Append only if date is set
  if (imageFile) fd.append("image", imageFile); // Append image file if selected

  const token = getAuthToken();
  if (!token) return; // Exit if not authenticated

  // Get the submit button and show loading state
  const submitBtn = $(this).find('button[type="submit"]');
  const originalBtnText = submitBtn.html();

  // Disable button and show loading spinner
  submitBtn.prop('disabled', true);
  submitBtn.html('<i class="fas fa-spinner fa-spin me-1"></i> Publishing...');

  $.ajax({
    url: API_BASE + "/articles",
    method: "POST",
    data: fd,
    processData: false, // Don't process the data into a query string
    contentType: false, // Let FormData set the content type
    headers: { Authorization: "Bearer " + token }, // Set authentication token
    success: function (data) {
      $("#createArticleModal").modal("hide"); // Close the modal
      $("#articleForm")[0].reset(); // Reset the form fields

      // Determine success message based on article status
      const message =
        data.status === "PUBLISHED"
          ? "Article published successfully!"
          : `Article scheduled for ${new Date(
              data.scheduleAt
            ).toLocaleString()}`;

      showNotification(message, "success");
      refreshArticles(); // Refresh the article lists
    },
    error: function (xhr) {
      console.error("Article creation error:", xhr);
      // Handle specific error codes for better user feedback
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
        // Unsupported Media Type
        showNotification(
          "Unsupported file format for image. Please use JPG, PNG, or GIF.",
          "error"
        );
      } else {
        // Generic error message for other issues
        showNotification(
          xhr.responseJSON?.message ||
            `Error creating article: ${xhr.statusText}`,
          "error"
        );
      }
    },
    complete: function() {
      // Always restore button state when request completes (success or error)
      submitBtn.prop('disabled', false);
      submitBtn.html(originalBtnText);
    }
  });
});

// 🔹 View Article Details
$(document).on("click", ".view-article", function () {
  const articleId = $(this).data("id");
  // Navigate to the article detail page, passing the article ID as a query parameter
  window.location.href = `/Frontend/pages/article-detail.html?id=${articleId}`;
});

// 🔹 Article Edit - Load data into modal
$(document).on("click", ".edit-article", function () {
  const articleId = $(this).data("id");
  const token = getAuthToken();
  if (!token) return;

  // Fetch article data for editing
  $.ajax({
    url: API_BASE + "/articles/" + articleId,
    method: "GET",
    headers: { Authorization: "Bearer " + token },
    success: function (article) {
      // Populate the edit modal with fetched article data
      $("#editArticleId").val(article.id);
      $("#editArticleTitle").val(article.title);
      $("#editArticleContent").val(article.content);
      $("#editArticleCategory").val(article.category || ""); // Set category, default to empty
      // Format date for datetime-local input
      if (article.scheduleAt) {
        const formattedDate = new Date(article.scheduleAt)
          .toISOString()
          .slice(0, 16); // YYYY-MM-DDTHH:MM
        $("#editPublishDate").val(formattedDate);
      } else {
        $("#editPublishDate").val(""); // Clear if no schedule date
      }

      // Show existing image preview if available
      if (article.imageUrl) {
        $("#editPreviewImg").attr("src", article.imageUrl);
        $("#editImagePreview").show();
      } else {
        $("#editImagePreview").hide();
      }

      $("#editArticleModal").modal("show"); // Show the edit modal
    },
    error: function () {
      showNotification("Error loading article for edit.", "error");
    },
  });
});

// 🔹 Article Update Form Submission
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
  if (imageFile) fd.append("image", imageFile); // Only append if a new file is selected

  const token = getAuthToken();
  if (!token) return;

  // Get the submit button and show loading state
  const submitBtn = $(this).find('button[type="submit"]');
  const originalBtnText = submitBtn.html();

  // Disable button and show loading spinner
  submitBtn.prop('disabled', true);
  submitBtn.html('<i class="fas fa-spinner fa-spin me-1"></i> Saving...');

  // Update the existing article via PUT request
  $.ajax({
    url: API_BASE + "/articles/" + articleId,
    method: "PUT",
    data: fd,
    processData: false,
    contentType: false,
    headers: { Authorization: "Bearer " + token },
    success: function () {
      $("#editArticleModal").modal("hide"); // Close modal on success
      showNotification("Article updated successfully!", "success");
      refreshArticles(); // Refresh article lists
    },
    error: function (xhr) {
      console.error("Article update error:", xhr);
      showNotification(
        xhr.responseJSON?.message || "Error updating article.",
        "error"
      );
    },
    complete: function() {
      // Always restore button state when request completes (success or error)
      submitBtn.prop('disabled', false);
      submitBtn.html(originalBtnText);
    }
  });
});

// 🔹 Article Deletion Confirmation and Request
$(document).on("click", ".delete-article", function () {
  const articleId = $(this).data("id");
  // Confirm deletion with the user
  const confirmed = confirm("Are you sure you want to delete this article?");
  if (!confirmed) return; // Exit if user cancels

  const token = getAuthToken();
  if (!token) return;

  // Send DELETE request to the API
  $.ajax({
    url: API_BASE + "/articles/" + articleId,
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
    success: function () {
      showNotification("Article deleted successfully!", "success");
      refreshArticles(); // Refresh lists after deletion
    },
    error: function (xhr) {
      showNotification(
        xhr.responseJSON?.message || "Error deleting article.",
        "error"
      );
    },
  });
});

// 🔹 Function to Load and Display Articles (Published or Scheduled)
function loadMyArticles(status) {
  // Determine which container and empty state element to use based on status
  const containerId =
    status === "PUBLISHED" ? "publishedContainer" : "scheduledContainer";
  const emptyId = status === "PUBLISHED" ? "publishedEmpty" : "scheduledEmpty";

  const container = $("#" + containerId);
  const emptyState = $("#" + emptyId);

  container.empty(); // Clear existing content
  emptyState.hide(); // Hide empty state initially

  const token = getAuthToken();
  if (!token) return;

  // Fetch articles from the API
  $.ajax({
    url: `${API_BASE}/articles/me?status=${status}&page=0&size=50`, // Fetch first 50 articles
    type: "GET",
    headers: { Authorization: "Bearer " + token },
    success: function (res) {
      // If no articles are found, show the empty state
      if (!res.content || res.content.length === 0) {
        emptyState.show();
        return;
      }

      container.empty(); // Clear again before appending new content
      // Loop through each article and create a card element
      res.content.forEach((article) => {
        // Create a short excerpt for the card
        const excerpt = article.excerpt
          ? article.excerpt.length > 100
            ? article.excerpt.substring(0, 100) + "..." // Truncate if too long
            : article.excerpt
          : "No content available"; // Fallback text

        // Generate the HTML for the article card
        const card = $(`
          <div class="col-md-6 col-lg-4">
            <div class="card h-100">
              ${
                article.imageUrl
                  ? `<img src="${article.imageUrl}" class="card-img-top" alt="${article.title}">`
                  : `<div class="card-img-top bg-light d-flex align-items-center justify-content-center" style="height:200px;">
                      <i class="fas fa-image fa-3x text-muted"></i>
                    </div>` // Placeholder image if none exists
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
        container.append(card); // Add the card to the container
      });
    },
    error: function (xhr) {
      console.error("Error loading articles:", xhr);
      emptyState.show(); // Show empty state on error
      if (xhr.status === 401) {
        alert("Session expired. Please login again.");
        window.location.href =
          "/Frontend/pages/login-and-register/login-and-register.html";
      }
    },
  });
}

// Function to load and display the publisher's profile image
function loadPublisherProfileImage() {
  const token = localStorage.getItem("token");
  const email = localStorage.getItem("email");

  if (!token || !email) {
    // If no token or email, use the default image (already set in HTML)
    return;
  }

  // Attempt to use a cached image URL first for performance
  const cachedImageUrl = localStorage.getItem("publisherLogoUrl");
  if (cachedImageUrl) {
    updateProfileImage(cachedImageUrl);
  }

  // Fetch the latest profile data from the API to get the logo URL
  $.ajax({
    url: API_BASE + "/publishers/profile/" + email,
    method: "GET",
    headers: { Authorization: "Bearer " + token },
    success: function (response) {
      // Check if the response contains a valid logo URL
      if (response.code === 200 && response.data.logoUrl) {
        updateProfileImage(response.data.logoUrl);
        // Cache the new URL for future use
        localStorage.setItem("publisherLogoUrl", response.data.logoUrl);
      }
    },
    error: function (xhr) {
      console.log("Could not load profile image:", xhr.statusText);
      // If fetching fails, the default image remains visible.
    },
  });
}

// Helper function to update the src attribute of the profile image
function updateProfileImage(imageUrl) {
  if (imageUrl && imageUrl.trim() !== "") {
    $(".profile-img").attr("src", imageUrl);
  }
}

// 🔹 Initial Load when the document is ready
$(document).ready(function () {
  const token = getAuthToken(); // Ensure user is authenticated
  if (!token) return; // Stop execution if not authenticated

  refreshArticles(); // Load published and scheduled articles
  loadPublisherProfileImage(); // Load the publisher's profile image
});

// 🔹 Image Preview Functionality for Create Article Modal
$("#articleImage").on("change", function (e) {
  const file = e.target.files[0];
  const previewContainer = $("#imagePreview");
  const previewImg = $("#previewImg");

  if (file) {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      showNotification("Please select a valid image file", "error");
      $(this).val(""); // Clear the input
      previewContainer.hide();
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image size must be less than 5MB", "error");
      $(this).val(""); // Clear the input
      previewContainer.hide();
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg.attr("src", e.target.result);
      previewContainer.show();
    };
    reader.readAsDataURL(file);
  } else {
    previewContainer.hide();
  }
});

// Remove image button for create modal
$("#removeImage").on("click", function () {
  $("#articleImage").val("");
  $("#imagePreview").hide();
});

// 🔹 Image Preview Functionality for Edit Article Modal
$("#editArticleImage").on("change", function (e) {
  const file = e.target.files[0];
  const previewContainer = $("#editImagePreview");
  const previewImg = $("#editPreviewImg");

  if (file) {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      showNotification("Please select a valid image file", "error");
      $(this).val(""); // Clear the input
      previewContainer.hide();
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showNotification("Image size must be less than 5MB", "error");
      $(this).val(""); // Clear the input
      previewContainer.hide();
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      previewImg.attr("src", e.target.result);
      previewContainer.show();
    };
    reader.readAsDataURL(file);
  } else {
    previewContainer.hide();
  }
});

// Remove image button for edit modal
$("#removeEditImage").on("click", function () {
  $("#editArticleImage").val("");
  $("#editImagePreview").hide();
});

// Clear preview when modals are closed
$("#createArticleModal").on("hidden.bs.modal", function () {
  $("#articleImage").val("");
  $("#imagePreview").hide();
});

$("#editArticleModal").on("hidden.bs.modal", function () {
  $("#editArticleImage").val("");
  $("#editImagePreview").hide();
});

