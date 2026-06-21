// Central config for WhatsApp details (easy to update later).
const CONFIG = {
  whatsappNumber: "7985499394",
  defaultOrderMessage: "Hello Swastik Dairy, I want to order fresh milk."
};

const siteHeader = document.querySelector(".site-header");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
const navLinks = document.querySelectorAll(".nav-link");
const langButtons = document.querySelectorAll(".lang-btn");
const i18nElements = document.querySelectorAll(".i18n");
const orderForm = document.getElementById("orderForm");
const heroWhatsappBtn = document.getElementById("heroWhatsappBtn");
const footerWhatsappLink = document.getElementById("footerWhatsappLink");
const visitWhatsappLink = document.getElementById("visitWhatsappLink");

const reviewForm = document.getElementById("reviewForm");
const reviewTrack = document.getElementById("reviewTrack");
const reviewDots = document.getElementById("reviewDots");
const reviewPrev = document.getElementById("reviewPrev");
const reviewNext = document.getElementById("reviewNext");
const reviewNotice = document.getElementById("reviewNotice");
const reviewEmpty = document.getElementById("reviewEmpty");

const galleryImages = Array.from(document.querySelectorAll(".gallery-media"));
const galleryLightbox = document.getElementById("galleryLightbox");
const lightboxBackdrop = document.getElementById("lightboxBackdrop");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");

const reviews = [
  {
    name: "Anita Sharma",
    rating: 5,
    message: "Milk quality is excellent and delivery is always on time."
  },
  {
    name: "Rakesh Verma",
    rating: 4,
    message: "Fresh milk every morning. Clean and reliable service."
  },
  {
    name: "Pooja Singh",
    rating: 3,
    message: "Good service overall and supportive staff."
  }
];

let reviewIndex = 0;
let reviewAutoTimer = null;
let lightboxIndex = 0;

function setLanguage(lang) {
  i18nElements.forEach((element) => {
    const text = element.getAttribute(`data-${lang}`);
    if (text) {
      element.textContent = text;
    }
  });

  document.documentElement.lang = lang;

  langButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });

  localStorage.setItem("swastik_lang", lang);
}

function getCurrentLang() {
  return document.documentElement.lang === "hi" ? "hi" : "en";
}

function getOrderMessage(data, lang) {
  if (lang === "hi") {
    return `नमस्ते स्वास्तिक डेयरी,
मुझे दूध का ऑर्डर देना है।

नाम: ${data.name}
फोन: ${data.phone}
मात्रा: ${data.quantity} लीटर
पता: ${data.address}
अतिरिक्त जानकारी: ${data.notes || "कोई नहीं"}`;
  }

  return `Hello Swastik Dairy,
I would like to place a milk order request.

Name: ${data.name}
Phone: ${data.phone}
Quantity: ${data.quantity} liters
Address: ${data.address}
Additional Notes: ${data.notes || "None"}`;
}

function updateStaticWhatsappLinks() {
  const encodedText = encodeURIComponent(CONFIG.defaultOrderMessage);
  const withTextUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodedText}`;
  const plainUrl = `https://wa.me/${CONFIG.whatsappNumber}`;

  if (heroWhatsappBtn) {
    heroWhatsappBtn.href = withTextUrl;
  }

  if (footerWhatsappLink) {
    footerWhatsappLink.href = plainUrl;
    footerWhatsappLink.textContent = `WhatsApp: ${CONFIG.whatsappNumber}`;
  }

  if (visitWhatsappLink) {
    visitWhatsappLink.href = withTextUrl;
    visitWhatsappLink.textContent = CONFIG.whatsappNumber;
  }
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getReviewText(type) {
  const lang = getCurrentLang();
  const textMap = {
    en: {
      empty: "No top-rated reviews yet. Be the first to submit one.",
      shown: "Thank you! Your review is now visible in testimonials.",
      hidden: "Thank you! We currently display reviews with 4 or 5 stars."
    },
    hi: {
      empty: "अभी कोई उच्च रेटिंग समीक्षा नहीं है। आप पहली समीक्षा भेजें।",
      shown: "धन्यवाद! आपकी समीक्षा अब प्रशंसापत्र में दिखाई दे रही है।",
      hidden: "धन्यवाद! अभी हम 4 या 5 स्टार वाली समीक्षाएँ दिखाते हैं।"
    }
  };

  return textMap[lang][type];
}

function getTopReviews() {
  return reviews.filter((review) => review.rating >= 4);
}

function getStarRatingText(rating) {
  const filled = String.fromCharCode(9733).repeat(rating);
  const empty = String.fromCharCode(9734).repeat(5 - rating);
  return filled + empty;
}

function renderReviewDots(total) {
  if (!reviewDots) {
    return;
  }

  reviewDots.innerHTML = "";

  for (let i = 0; i < total; i += 1) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `review-dot ${i === reviewIndex ? "active" : ""}`.trim();
    dot.setAttribute("aria-label", `Go to review ${i + 1}`);

    dot.addEventListener("click", () => {
      reviewIndex = i;
      renderReviewSlider();
      restartReviewAutoSlide();
    });

    reviewDots.appendChild(dot);
  }
}

function renderReviewSlider() {
  if (!reviewTrack || !reviewEmpty || !reviewDots) {
    return;
  }

  const topReviews = getTopReviews();

  if (topReviews.length === 0) {
    reviewTrack.innerHTML = "";
    reviewDots.innerHTML = "";
    reviewEmpty.hidden = false;
    reviewEmpty.textContent = getReviewText("empty");
    if (reviewPrev) {
      reviewPrev.disabled = true;
    }
    if (reviewNext) {
      reviewNext.disabled = true;
    }
    return;
  }

  reviewIndex = (reviewIndex + topReviews.length) % topReviews.length;
  const activeReview = topReviews[reviewIndex];

  reviewTrack.innerHTML = `
    <article class="review-card">
      <p class="review-stars" aria-label="${activeReview.rating} out of 5 stars">
        ${getStarRatingText(activeReview.rating)}
      </p>
      <h4 class="review-name">${escapeHtml(activeReview.name)}</h4>
      <p class="review-message">${escapeHtml(activeReview.message)}</p>
    </article>
  `;

  reviewEmpty.hidden = true;
  renderReviewDots(topReviews.length);

  const disableControls = topReviews.length <= 1;
  if (reviewPrev) {
    reviewPrev.disabled = disableControls;
  }
  if (reviewNext) {
    reviewNext.disabled = disableControls;
  }
}

function moveReview(step) {
  const topReviews = getTopReviews();
  if (topReviews.length <= 1) {
    return;
  }

  reviewIndex = (reviewIndex + step + topReviews.length) % topReviews.length;
  renderReviewSlider();
}

function stopReviewAutoSlide() {
  if (reviewAutoTimer) {
    window.clearInterval(reviewAutoTimer);
    reviewAutoTimer = null;
  }
}

function startReviewAutoSlide() {
  stopReviewAutoSlide();

  const topReviews = getTopReviews();
  if (topReviews.length <= 1) {
    return;
  }

  reviewAutoTimer = window.setInterval(() => {
    moveReview(1);
  }, 5000);
}

function restartReviewAutoSlide() {
  stopReviewAutoSlide();
  startReviewAutoSlide();
}

function closeMobileMenu() {
  if (!mainNav || !menuToggle) {
    return;
  }

  mainNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  if (siteHeader) {
    siteHeader.classList.remove("menu-open");
  }
  document.body.classList.remove("nav-open");
}

function openLightbox(index) {
  if (!galleryLightbox || !lightboxImage || !lightboxCaption || galleryImages.length === 0) {
    return;
  }

  lightboxIndex = (index + galleryImages.length) % galleryImages.length;
  const source = galleryImages[lightboxIndex];
  lightboxImage.src = source.currentSrc || source.src;
  lightboxImage.alt = source.alt;
  lightboxCaption.textContent = source.alt;
  galleryLightbox.classList.add("open");
  galleryLightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!galleryLightbox || !lightboxImage) {
    return;
  }

  galleryLightbox.classList.remove("open");
  galleryLightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  document.body.style.overflow = "";
}

function moveLightbox(step) {
  openLightbox(lightboxIndex + step);
}

function initRevealAnimations() {
  const revealTargets = document.querySelectorAll("main .section, .card");

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  revealTargets.forEach((item) => item.classList.add("reveal"));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealTargets.forEach((item) => observer.observe(item));
}

// Mobile menu handling
if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    if (siteHeader) {
      siteHeader.classList.toggle("menu-open", isOpen);
    }
    document.body.classList.toggle("nav-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });
}

document.addEventListener("click", (event) => {
  if (!mainNav || !menuToggle || window.innerWidth >= 769) {
    return;
  }

  const clickedInside = mainNav.contains(event.target) || menuToggle.contains(event.target);
  if (!clickedInside) {
    closeMobileMenu();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth >= 769) {
    closeMobileMenu();
  }
});

// Gallery lightbox handling
if (galleryImages.length > 0) {
  galleryImages.forEach((image, index) => {
    image.setAttribute("tabindex", "0");
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", "Open gallery image preview");

    image.addEventListener("click", () => openLightbox(index));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });
}

if (lightboxClose) {
  lightboxClose.addEventListener("click", closeLightbox);
}

if (lightboxBackdrop) {
  lightboxBackdrop.addEventListener("click", closeLightbox);
}

if (lightboxPrev) {
  lightboxPrev.addEventListener("click", () => moveLightbox(-1));
}

if (lightboxNext) {
  lightboxNext.addEventListener("click", () => moveLightbox(1));
}

document.addEventListener("keydown", (event) => {
  if (!galleryLightbox || !galleryLightbox.classList.contains("open")) {
    return;
  }

  if (event.key === "Escape") {
    closeLightbox();
  } else if (event.key === "ArrowLeft") {
    moveLightbox(-1);
  } else if (event.key === "ArrowRight") {
    moveLightbox(1);
  }
});

// Language switcher
langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const lang = button.dataset.lang || "en";
    setLanguage(lang);
    updateStaticWhatsappLinks();
    renderReviewSlider();
  });
});

// Order request form -> opens WhatsApp with message.
if (orderForm) {
  orderForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(orderForm);
    const data = {
      name: formData.get("name")?.toString().trim(),
      phone: formData.get("phone")?.toString().trim(),
      quantity: formData.get("quantity")?.toString().trim(),
      address: formData.get("address")?.toString().trim(),
      notes: formData.get("notes")?.toString().trim()
    };

    const lang = getCurrentLang();
    const message = getOrderMessage(data, lang);
    const whatsappUrl = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener");
  });
}

if (reviewPrev) {
  reviewPrev.addEventListener("click", () => {
    moveReview(-1);
    restartReviewAutoSlide();
  });
}

if (reviewNext) {
  reviewNext.addEventListener("click", () => {
    moveReview(1);
    restartReviewAutoSlide();
  });
}

if (reviewTrack) {
  reviewTrack.addEventListener("mouseenter", stopReviewAutoSlide);
  reviewTrack.addEventListener("mouseleave", startReviewAutoSlide);
}

if (reviewForm) {
  reviewForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(reviewForm);
    const name = formData.get("reviewerName")?.toString().trim() || "";
    const rating = Number(formData.get("reviewRating"));
    const message = formData.get("reviewMessage")?.toString().trim() || "";

    if (!name || !message || !rating || rating < 1 || rating > 5) {
      return;
    }

    reviews.unshift({ name, rating, message });
    reviewForm.reset();

    if (reviewNotice) {
      reviewNotice.textContent = rating >= 4 ? getReviewText("shown") : getReviewText("hidden");
    }

    reviewIndex = 0;
    renderReviewSlider();
    restartReviewAutoSlide();
  });
}

// Active nav indicator on scroll
const sections = document.querySelectorAll("main section[id]");
window.addEventListener("scroll", () => {
  let current = "";
  const fromTop = window.scrollY + 140;

  sections.forEach((section) => {
    if (section.offsetTop <= fromTop && section.offsetTop + section.offsetHeight > fromTop) {
      current = section.getAttribute("id") || "";
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
});

// Initialize language + links on first load.
const savedLang = localStorage.getItem("swastik_lang");
const initialLang = savedLang === "hi" ? "hi" : "en";
setLanguage(initialLang);
updateStaticWhatsappLinks();
renderReviewSlider();
startReviewAutoSlide();
initRevealAnimations();
