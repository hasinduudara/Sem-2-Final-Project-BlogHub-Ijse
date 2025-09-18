const token = localStorage.getItem("token"); // Logged-in JWT
console.log("JWT Token:", token);

// Generate article button click
$("#generateBtn").on("click", function () {
  const title = $("#titleInput").val()?.trim();

  if (!title) return alert("Title is required!");

  if (!token) return alert("You must be logged in!");

  $("#loading").removeClass("d-none");

  $.ajax({
    url: "http://localhost:8080/api/articles/generate",
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    data: { title: title },
    success: function (res) {
      $("#loading").addClass("d-none");
      $("#genTitle").text(res.data.title);
      // Use .html() instead of .text() to preserve formatting
      $("#genContent").html(res.data.content);
      $("#generatedArticle").removeClass("d-none");
    },
    error: function (xhr) {
      $("#loading").addClass("d-none");
      $("#statusMsg").html(
        "<div class='alert alert-danger'>Failed to generate article.</div>"
      );
      console.error(xhr);
    },
  });
});

// Image upload and preview
$("#articleImage").on("change", function () {
  const file = this.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      $("#previewImg").attr("src", e.target.result);
      $("#imagePreview").removeClass("d-none");
    };
    reader.readAsDataURL(file);
  } else {
    $("#imagePreview").addClass("d-none");
  }
});

// Remove image button click
$("#removeImage").on("click", function () {
  $("#articleImage").val("");
  $("#previewImg").attr("src", "");
  $("#imagePreview").addClass("d-none");
});

// Publish button click
$("#publishBtn").on("click", function () {
  const title = $("#genTitle").text();
  // Get HTML content instead of plain text
  const content = $("#genContent").html();
  const imageFile = $("#articleImage")[0].files[0];

  // Create FormData object for multipart/form-data
  const formData = new FormData();
  formData.append("title", title);
  formData.append("content", content);

  // Append image file if selected
  if (imageFile) {
    formData.append("image", imageFile);
  }

  // Disable the publish button to prevent double submission
  $("#publishBtn").prop("disabled", true).text("Publishing...");

  $.ajax({
    url: "http://localhost:8080/api/articles",
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
    data: formData,
    processData: false, // Important: Don't process the data
    contentType: false, // Important: Don't set content type, let browser set it
    success: function (res) {
      $("#statusMsg").html(
        "<div class='alert alert-success'>Article published successfully!</div>"
      );

      // Show popup message and navigate to dashboard
      alert("Published");

      // Navigate to publisher dashboard after a short delay
      setTimeout(function () {
        window.location.href =
          "/Frontend/pages/Publisher/publisher-dashboard.html";
      }, 500);
    },
    error: function (xhr) {
      $("#statusMsg").html(
        "<div class='alert alert-danger'>Failed to publish article.</div>"
      );
      console.error(xhr);

      // Re-enable the publish button on error
      $("#publishBtn").prop("disabled", false).text("Publish Article");
    },
  });
});
