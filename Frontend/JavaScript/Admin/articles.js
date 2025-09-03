$(document).ready(function () {
  const API_BASE = "http://localhost:8080/api";

  // Check for admin token on page load
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
    return;
  }

  // Load published articles
  function loadArticles() {
    $.ajax({
      url: API_BASE + "/articles/all",
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      success: function (response) {
        const tableBody = $("#articles-table-body");
        tableBody.empty();
        if (response.length > 0) {
          response.forEach((article, index) => {
            const row = `
                <tr>
                  <td>${index + 1}</td>
                  <td>${article.title}</td>
                  <td>${article.authorName}</td>
                  <td>${new Date(article.publishedAt).toLocaleDateString()}</td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-info view-article-btn" data-id="${
                      article.id
                    }">
                      <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-article-btn" data-id="${
                      article.id
                    }" data-bs-toggle="modal" data-bs-target="#deleteArticleModal">
                      <i class="fas fa-trash-alt"></i> Delete
                    </button>
                  </td>
                </tr>
              `;
            tableBody.append(row);
          });
        } else {
          $("#no-articles").removeClass("d-none");
        }
      },
      error: function (xhr) {
        console.error("Error loading articles:", xhr);
        alert("Failed to load articles. " + xhr.statusText);
      },
    });
  }

  // Handle View button click
  $(document).on("click", ".view-article-btn", function () {
    const articleId = $(this).data("id");
    // This will redirect to a public view page. You need to have this page ready.
    window.open(`/Frontend/pages/article-view.html?id=${articleId}`, "_blank");
  });

  // Handle Delete button click (modal populating)
  $(document).on("click", ".delete-article-btn", function () {
    const articleId = $(this).data("id");
    $("#articleIdToDelete").val(articleId);
  });

  // Handle modal form submission for deletion
  $("#deleteArticleForm").on("submit", function (e) {
    e.preventDefault();
    const articleId = $("#articleIdToDelete").val();
    const reason = $("#deleteReason").val();

    if (!reason.trim()) {
      alert("Please provide a reason for deletion.");
      return;
    }

    $.ajax({
      url: API_BASE + `/articles/${articleId}`,
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
      contentType: "application/json",
      data: JSON.stringify({ reason: reason }),
      success: function (response) {
        alert("Article deleted successfully and publisher has been notified.");
        $("#deleteArticleModal").modal("hide");
        loadArticles(); // Reload the table
      },
      error: function (xhr) {
        console.error("Deletion error:", xhr);
        alert("Failed to delete article. " + xhr.statusText);
      },
    });
  });

  // Initial load of articles
  loadArticles();
});
