// Page loading animation
window.addEventListener("load", function () {
  setTimeout(() => {
    document.getElementById("loadingOverlay").classList.add("fade-out");
  }, 1000);
});

// Smooth navbar scroll effect
window.addEventListener("scroll", function () {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.background = "rgba(255, 255, 255, 0.98)";
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.15)";
  } else {
    navbar.style.background = "rgba(255, 255, 255, 0.95)";
    navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
  }
});

// Animated counter for stats
function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");
  const speed = 200;

  counters.forEach((counter) => {
    const animate = () => {
      const value = +counter.getAttribute("data-count");
      const data = +counter.innerText;
      const time = value / speed;

      if (data < value) {
        counter.innerText = Math.ceil(data + time);
        setTimeout(animate, 1);
      } else {
        counter.innerText = value.toLocaleString();
      }
    };
    animate();
  });
}

// Intersection Observer for stats animation
const statsSection = document.querySelector(".stats-section");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      animateCounters();
      observer.unobserve(entry.target);
    }
  });
});

observer.observe(statsSection);

// Start Now button navigation
document.getElementById("startNowBtn").addEventListener("click", function (e) {
  e.preventDefault();

  // Add loading animation to button
  const btn = this;
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Redirecting...';
  btn.style.pointerEvents = "none";

  // Navigate to login page after short delay
  setTimeout(() => {
    window.location.href =
      "/Frontend/pages/login-and-register/login-and-register.html";
  }, 800);
});

// Add parallax effect to hero section
window.addEventListener("scroll", function () {
  const scrolled = window.pageYOffset;
  const parallax = document.querySelector(".hero-section");
  const speed = scrolled * 0.5;

  if (parallax) {
    parallax.style.transform = `translateY(${speed}px)`;
  }
});

// Add hover effects to feature cards
document.querySelectorAll(".feature-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-10px) rotateX(5deg)";
  });

  card.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0) rotateX(0)";
  });
});

// Add CSS animation classes on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const fadeInObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, observerOptions);

// Observe all feature cards
document.querySelectorAll(".feature-card").forEach((card) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(30px)";
  card.style.transition = "all 0.6s ease-out";
  fadeInObserver.observe(card);
});

// Pulse animation for the laptop icon
const pulseKeyframes = `
            @keyframes pulse {
                0% { transform: scale(1); opacity: 0.2; }
                50% { transform: scale(1.05); opacity: 0.3; }
                100% { transform: scale(1); opacity: 0.2; }
            }
        `;

const style = document.createElement("style");
style.textContent = pulseKeyframes;
document.head.appendChild(style);
