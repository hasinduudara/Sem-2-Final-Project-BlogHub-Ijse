const params = new URLSearchParams(window.location.search);
const articleId = params.get("id");

// Function to convert plain text with newlines to HTML paragraphs
function formatArticleContent(content) {
  if (!content) return "";

  // Split content by double newlines (paragraph breaks) and single newlines
  return content
    .split(/\n\s*\n/) // Split by double newlines (paragraph breaks)
    .map((paragraph) => {
      // Trim whitespace and replace single newlines with <br> tags
      const formattedParagraph = paragraph.trim().replace(/\n/g, "<br>");
      return formattedParagraph ? `<p>${formattedParagraph}</p>` : "";
    })
    .filter((p) => p) // Remove empty paragraphs
    .join("");
}

// Load article
function loadArticle() {
  $.ajax({
    url: `http://localhost:8080/api/articles/${articleId}`,
    method: "GET",
    success: function (article) {
      const container = $("#articleContainer");
      const formattedContent = formatArticleContent(article.content);

      container.html(`
        <div class="card">
          ${
            article.imageUrl
              ? `<img src="${article.imageUrl}" class="card-img-top article-image" alt="Article Image">`
              : ""
          }
          <div class="card-body">
            <h2 class="card-title">${article.title}</h2>
            <p class="text-muted">By <strong>${
              article.publisherName
            }</strong> | ${new Date(article.publishAt).toLocaleDateString()}</p>
            <div class="card-text mt-4 article-content">${formattedContent}</div>
            <button class="like-btn mt-3" id="likeBtn">
              <i class="fas fa-thumbs-up me-1"></i> Like (<span id="likeCount">0</span>)
            </button>
            <button class="share-btn mt-3 ms-2" id="shareBtn">
              <i class="fas fa-share-alt me-1"></i> Share
            </button>
          </div>
        </div>
      `);

      loadLikeCount();

      // Attach like button event listener
      $("#likeBtn").click(function () {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("You must be logged in to like articles.");
          return;
        }

        $.ajax({
          url: `http://localhost:8080/api/likes/${articleId}`,
          method: "POST",
          headers: { Authorization: "Bearer " + token },
          success: function (apiResponse) {
            console.log("Like response:", apiResponse);
            loadLikeCount();
          },
          error: function (xhr) {
            console.error("Like failed", xhr.status, xhr.responseText);
            if (xhr.status === 401) {
              alert("You must be logged in to like articles.");
            } else {
              alert("Failed to like article. Please try again.");
            }
          },
        });
      });

      // Attach share button event listener after button is created
      $("#shareBtn").click(function () {
        console.log("Share button clicked!"); // Debug log
        const shareUrl = window.location.href;
        const articleTitle = article.title;

        if (navigator.share) {
          navigator
            .share({
              title: articleTitle,
              text: `Check out this article: ${articleTitle}`,
              url: shareUrl,
            })
            .then(() => {
              console.log("Article shared successfully!");
            })
            .catch((error) => {
              console.error("Error sharing article:", error);
              // Fallback to clipboard if native sharing fails
              fallbackToClipboard(shareUrl, articleTitle);
            });
        } else {
          // Fallback for browsers that don't support navigator.share
          fallbackToClipboard(shareUrl, articleTitle);
        }
      });
    },
    error: function (xhr) {
      console.error("Failed to load article", xhr.status);
      $("#articleContainer").html(`
        <div class="alert alert-danger rounded-0 text-center">
          <i class="fas fa-exclamation-triangle me-2"></i>Failed to load article.
        </div>
      `);
    },
  });
}

// Fallback function for clipboard sharing
function fallbackToClipboard(shareUrl, articleTitle) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        alert(
          `Article link copied to clipboard!\n\n"${articleTitle}"\n${shareUrl}`
        );
      })
      .catch((error) => {
        console.error("Failed to copy to clipboard:", error);
        // Final fallback - show the URL in an alert
        prompt("Copy this link to share the article:", shareUrl);
      });
  } else {
    // For older browsers without clipboard API
    prompt("Copy this link to share the article:", shareUrl);
  }
}

// Load like count
function loadLikeCount() {
  $.ajax({
    url: `http://localhost:8080/api/likes/${articleId}`,
    method: "GET",
    success: function (apiResponse) {
      const likeCount = apiResponse.data || 0;
      $("#likeCount").text(likeCount);
    },
    error: function (xhr) {
      console.error("Failed to load like count", xhr.status);
      $("#likeCount").text("0");
    },
  });
}

// Load comments
function loadComments() {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers["Authorization"] = "Bearer " + token;

  $.ajax({
    url: `http://localhost:8080/api/comments/${articleId}`,
    method: "GET",
    headers,
    success: function (apiResponse) {
      const comments = apiResponse.data || [];
      const list = $("#commentsList");
      list.empty();

      if (comments.length === 0) {
        list.html(
          `<li class="list-group-item text-center">No comments yet.</li>`
        );
        return;
      }

      comments.forEach((c) => {
        // Ensure username is displayed properly, with fallback for edge cases
        const displayName = c.username || "Anonymous User";
        list.append(
          `<li class="list-group-item"><strong>${displayName}</strong>: ${c.content}</li>`
        );
      });
    },
    error: function (xhr) {
      console.error("Error loading comments", xhr.status);
      $("#commentsList").html(
        `<li class="list-group-item text-danger text-center">Error loading comments.</li>`
      );
    },
  });
}

// Post comment
$("#commentForm").submit(function (e) {
  e.preventDefault();
  const content = $("#commentText").val();
  const token = localStorage.getItem("token");

  if (!token) {
    alert("You must be logged in to post a comment.");
    return;
  }
  if (!content.trim()) {
    alert("Comment cannot be empty.");
    return;
  }

  const payload = JSON.stringify({ content, articleId: Number(articleId) });

  $.ajax({
    url: "http://localhost:8080/api/comments",
    method: "POST",
    data: payload,
    contentType: "application/json",
    headers: { Authorization: "Bearer " + token },
    success: function () {
      $("#commentText").val("");
      loadComments();
    },
    error: function (xhr) {
      console.error("Post comment failed", xhr.status, xhr.responseText);
      let msg = "Failed to post comment.";
      if (xhr.responseJSON && xhr.responseJSON.status)
        msg = xhr.responseJSON.status;
      alert(msg);
    },
  });
});

// Init
$(document).ready(function () {
  loadArticle();
  loadComments();
});
