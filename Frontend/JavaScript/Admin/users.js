$(document).ready(function () {
  const API_BASE = "http://localhost:8080/api";

  // Check for proper admin authentication on page load
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role || role !== "ADMIN") {
    alert("Access denied. Please log in as an admin.");
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
    return;
  }

  // Load users and publishers
  function loadUsersByRole(role) {
    const tableBodyId =
      role === "USER" ? "#users-table-body" : "#publishers-table-body";
    const noUsersId = role === "USER" ? "#no-users" : "#no-publishers";
    const tableBody = $(tableBodyId);
    const noUsersPara = $(noUsersId);

    tableBody.empty();
    noUsersPara.addClass("d-none");

    $.ajax({
      url: API_BASE + `/admin/users?role=${role}`,
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
      },
      success: function (response) {
        if (response.length > 0) {
          response.forEach((user, index) => {
            const row = `
                <tr>
                  <td>${index + 1}</td>
                  <td>${user.username}</td>
                  <td>${user.email}</td>
                  <td>${new Date(user.registeredAt).toLocaleDateString()}</td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-danger remove-user-btn" data-id="${
                      user.id
                    }" data-bs-toggle="modal" data-bs-target="#removeUserModal">
                      <i class="fas fa-user-slash"></i> Remove
                    </button>
                  </td>
                </tr>
              `;
            tableBody.append(row);
          });
        } else {
          noUsersPara.removeClass("d-none");
        }
      },
      error: function (xhr) {
        console.error(`Error loading ${role}s:`, xhr);
        alert(`Failed to load ${role} list. ` + xhr.statusText);
      },
    });
  }

  // Handle remove button click (modal populating)
  $(document).on("click", ".remove-user-btn", function () {
    const userId = $(this).data("id");
    $("#userIdToRemove").val(userId);
  });

  // Handle modal form submission for removal
  $("#removeUserForm").on("submit", function (e) {
    e.preventDefault();
    const userId = $("#userIdToRemove").val();
    const reason = $("#removeReason").val();

    if (!reason.trim()) {
      alert("Please provide a reason for removal.");
      return;
    }

    $.ajax({
      url: API_BASE + `/admin/users/${userId}`,
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
      contentType: "application/json",
      data: JSON.stringify({ reason: reason }),
      success: function (response) {
        alert("User account removed and notified successfully.");
        $("#removeUserModal").modal("hide");
        loadUsersByRole("USER");
        loadUsersByRole("PUBLISHER");
      },
      error: function (xhr) {
        console.error("Removal error:", xhr);
        alert("Failed to remove user. " + xhr.statusText);
      },
    });
  });

  // Initial load
  loadUsersByRole("USER");
  loadUsersByRole("PUBLISHER");
});
