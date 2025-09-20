// publisher-profile.js

class PublisherProfileManager {
  constructor() {
    // NOTE: Adjust the baseUrl to your actual publisher API endpoint
    this.baseUrl = "http://localhost:8080/api/publishers";
    this.currentUserEmail = this.getCurrentUserEmail();
    this.isEditMode = false;
    this.defaultLogoUrl = "https://placehold.co/120x120/e9ecef/6c757d?text=No+Logo";
    this.init();
  }

  init() {
    this.bindEventListeners();
    this.setInitialProfileImage();
    this.loadPublisherProfile();
  }

  setInitialProfileImage() {
    const profileImageElement = document.getElementById("profileImage");
    const storedLogo = localStorage.getItem("publisherLogoUrl");
    const currentUserEmail = this.currentUserEmail;
    const storedUserEmail = localStorage.getItem("email");

    if (profileImageElement) {
      // Only use stored image if it belongs to the current user
      if (storedLogo &&
          storedLogo !== this.defaultLogoUrl &&
          currentUserEmail &&
          storedUserEmail &&
          currentUserEmail === storedUserEmail) {
        profileImageElement.src = storedLogo;
      } else {
        // Clear any invalid stored image and use default
        if (storedLogo && currentUserEmail !== storedUserEmail) {
          localStorage.removeItem("publisherLogoUrl");
        }
        profileImageElement.src = this.defaultLogoUrl;
      }
    }
  }

  bindEventListeners() {
    // Updated selector to match the new blue button class
    const editBtn = document.querySelector(".btn-edit");
    const form = document.querySelector("form");
    const imageUpload = document.getElementById("imageUpload");

    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleEditMode();
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.savePublisherProfile();
      });
    }

    if (imageUpload) {
      imageUpload.addEventListener("change", (e) => {
        this.handleImageUpload(e);
      });
    }
  }

  getCurrentUserEmail() {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) return storedEmail;

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub || payload.email;
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
    return null;
  }

  async loadPublisherProfile() {
    if (!this.currentUserEmail) {
      this.showWarning("Please login to view your publisher profile.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      this.showWarning("Authentication required.");
      return;
    }

    try {
      this.showInfo("Loading profile...");
      const response = await fetch(
        `${this.baseUrl}/profile/${this.currentUserEmail}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch profile. Status: ${response.status}`);
      }
      const result = await response.json();
      if (result.code === 200) {
        this.populateForm(result.data);
        this.showSuccess("Profile loaded successfully");
      } else {
        throw new Error(result.message || "Could not load profile data.");
      }
    } catch (error) {
      console.error("Error loading publisher profile:", error);
      this.showError(error.message);
      this.setPublisherDataFromStorage();
    }
  }

  populateForm(data) {
    if (!data) {
      this.setPublisherDataFromStorage();
      return;
    }
    const publisherNameElement = document.getElementById("publisherName");
    const contactEmailElement = document.getElementById("contactEmail");
    const profileImageElement = document.getElementById("profileImage");

    if (publisherNameElement) {
      const publisherName = data.publisherName || "";
      publisherNameElement.value = publisherName;
      if (publisherName) {
        localStorage.setItem("publisherName", publisherName);
        localStorage.setItem("username", publisherName);
      }
    }
    if (contactEmailElement) {
      contactEmailElement.value = data.email || "";
      if (data.email) {
        localStorage.setItem("email", data.email);
      }
    }

    // Handle profile image - only set if backend provides a valid URL
    if (data.logoUrl && data.logoUrl.trim() !== "" && profileImageElement) {
      profileImageElement.src = data.logoUrl;
      localStorage.setItem("publisherLogoUrl", data.logoUrl);
    } else {
      // If no logo from backend, check localStorage
      const storedLogo = localStorage.getItem("publisherLogoUrl");
      if (profileImageElement) {
        if (storedLogo && storedLogo !== this.defaultLogoUrl) {
          profileImageElement.src = storedLogo;
        } else {
          profileImageElement.src = this.defaultLogoUrl;
          // Don't store the default logo URL in localStorage
        }
      }
    }
  }

  setPublisherDataFromStorage() {
    const publisherName =
      localStorage.getItem("publisherName") ||
      localStorage.getItem("username") ||
      "";
    const email = localStorage.getItem("email") || "";
    const logoUrl = localStorage.getItem("publisherLogoUrl");

    document.getElementById("publisherName").value = publisherName;
    document.getElementById("contactEmail").value = email;

    const profileImageElement = document.getElementById("profileImage");
    if (profileImageElement) {
      if (logoUrl && logoUrl !== this.defaultLogoUrl) {
        profileImageElement.src = logoUrl;
      } else {
        profileImageElement.src = this.defaultLogoUrl;
      }
    }
  }

  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    const inputs = document.querySelectorAll(".form-control");
    // Updated selector to match the new blue button class
    const editBtn = document.querySelector(".btn-edit");

    inputs.forEach((input) => {
      if (input.type !== "file") {
        // Exclude the file input
        input.readOnly = !this.isEditMode;
      }
    });

    if (this.isEditMode) {
      editBtn.textContent = "Cancel";
      this.showInfo("Edit mode enabled.");
    } else {
      editBtn.textContent = "Edit";
      this.loadPublisherProfile(); // Revert changes on cancel
    }
  }

  async savePublisherProfile() {
    if (!this.isEditMode) {
      this.showWarning('Click "Edit" first to make changes.');
      return;
    }

    const publisherName = document.getElementById("publisherName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();

    if (!publisherName || !email) {
      this.showError("Publisher Name and Contact Email are required.");
      return;
    }

    const currentPassword = prompt(
      "Please enter your current password to save changes:"
    );
    if (currentPassword === null) return; // User cancelled
    if (!currentPassword) {
      this.showWarning("Password is required to save changes.");
      return;
    }

    const updateData = { publisherName, email, currentPassword };
    const token = localStorage.getItem("token");

    try {
      this.showInfo("Saving profile...");
      const response = await fetch(
        `${this.baseUrl}/profile/${this.currentUserEmail}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );
      const result = await response.json();

      if (result.code === 200) {
        this.showSuccess("Profile updated successfully!");

        // Update the current user email immediately to prevent 403 errors
        this.currentUserEmail = result.data.email;
        localStorage.setItem("email", result.data.email);
        localStorage.setItem("publisherName", result.data.publisherName);

        // Exit edit mode without reloading profile to avoid 403 error
        this.isEditMode = false;
        const inputs = document.querySelectorAll(".form-control");
        const editBtn = document.querySelector(".btn-edit");

        inputs.forEach((input) => {
          if (input.type !== "file") {
            input.readOnly = true;
          }
        });

        if (editBtn) {
          editBtn.textContent = "Edit";
        }

        // Populate form with the updated data instead of reloading
        this.populateForm(result.data);

        // If email was changed, show a notice about re-authentication
        if (result.data.email !== JSON.parse(atob(token.split(".")[1])).sub) {
          this.showWarning("Email updated. Please log out and log back in for full functionality.");
        }
      } else {
        throw new Error(result.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error saving publisher profile:", error);
      this.showError(error.message);
    }
  }

  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // --- 1. Instant Preview ---
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("profileImage").src = e.target.result;
    };
    reader.readAsDataURL(file);

    // --- 2. Validation ---
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      this.showError("Image size must be less than 5MB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      this.showError("Please select a valid image file.");
      return;
    }

    // --- 3. Upload ---
    const formData = new FormData();
    formData.append("image", file);
    const token = localStorage.getItem("token");

    try {
      this.showInfo("Uploading logo...");
      const response = await fetch(
        `${this.baseUrl}/profile/${this.currentUserEmail}/upload-logo`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      const result = await response.json();
      if (result.code === 200) {
        document.getElementById("profileImage").src = result.data;
        localStorage.setItem("publisherLogoUrl", result.data);
        this.showSuccess("Logo uploaded successfully!");
      } else {
        throw new Error(result.message || "Failed to upload logo.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      this.showError(error.message);
      // Revert to previous image on failure
      const storedLogo = localStorage.getItem("publisherLogoUrl");
      const profileImageElement = document.getElementById("profileImage");
      if (profileImageElement) {
        if (storedLogo && storedLogo !== this.defaultLogoUrl) {
          profileImageElement.src = storedLogo;
        } else {
          profileImageElement.src = this.defaultLogoUrl;
        }
      }
    }
  }

  // --- UI Feedback Methods ---
  showToast(message, type = "info") {
    const toast = document.createElement("div");
    const bootstrapClass =
      {
        success: "success",
        error: "danger",
        warning: "warning",
        info: "info",
      }[type] || "info";

    toast.className = `alert alert-${bootstrapClass} position-fixed`;
    toast.style.cssText = `top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideInRight 0.3s ease-out;`;
    toast.innerHTML = `<div class="d-flex justify-content-between align-items-center"><span>${message}</span><button type="button" class="btn-close" onclick="this.parentElement.parentElement.remove()"></button></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
  }

  showSuccess(message) {
    this.showToast(message, "success");
  }
  showError(message) {
    this.showToast(message, "error");
  }
  showWarning(message) {
    this.showToast(message, "warning");
  }
  showInfo(message) {
    this.showToast(message, "info");
  }
}

// Instantiate the manager to run the script
document.addEventListener("DOMContentLoaded", () => {
  new PublisherProfileManager();
});

// Add animation keyframes for toast notifications
const style = document.createElement("style");
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
