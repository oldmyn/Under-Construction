// Simple countdown: 15 days from first load
const MS_IN_SECOND = 1000;
const MS_IN_MINUTE = MS_IN_SECOND * 60;
const MS_IN_HOUR = MS_IN_MINUTE * 60;
const MS_IN_DAY = MS_IN_HOUR * 24;

function initCountdown() {
  const target = new Date(Date.now() + 15 * MS_IN_DAY).getTime();
  const elDays = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMins = document.getElementById("cd-mins");
  const elSecs = document.getElementById("cd-secs");

  if (!elDays || !elHours || !elMins || !elSecs) return;

  const update = () => {
    const now = Date.now();
    let diff = target - now;

    if (diff <= 0) {
      elDays.textContent = "00";
      elHours.textContent = "00";
      elMins.textContent = "00";
      elSecs.textContent = "00";
      return;
    }

    const days = Math.floor(diff / MS_IN_DAY);
    diff -= days * MS_IN_DAY;
    const hours = Math.floor(diff / MS_IN_HOUR);
    diff -= hours * MS_IN_HOUR;
    const mins = Math.floor(diff / MS_IN_MINUTE);
    diff -= mins * MS_IN_MINUTE;
    const secs = Math.floor(diff / MS_IN_SECOND);

    elDays.textContent = String(days).padStart(2, "0");
    elHours.textContent = String(hours).padStart(2, "0");
    elMins.textContent = String(mins).padStart(2, "0");
    elSecs.textContent = String(secs).padStart(2, "0");
  };

  update();
  setInterval(update, 1000);
}

// Parallax: mouse + subtle scroll
function initParallax() {
  // On smaller screens, keep things stable and skip parallax
  if (window.innerWidth < 768) return;
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const layers = hero.querySelectorAll("[data-depth]");
  if (!layers.length) return;

  const bounds = hero.getBoundingClientRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;

  let mouseX = 0;
  let mouseY = 0;
  let scrollY = window.scrollY || window.pageYOffset;

  const handleMouseMove = (e) => {
    mouseX = (e.clientX - centerX) / window.innerWidth;
    mouseY = (e.clientY - centerY) / window.innerHeight;
  };

  const handleScroll = () => {
    scrollY = window.scrollY || window.pageYOffset;
  };

  const render = () => {
    layers.forEach((layer) => {
      const depth = parseFloat(layer.getAttribute("data-depth") || "0");
      const translateX = mouseX * depth * -40;
      const translateY = mouseY * depth * -26 + scrollY * depth * -0.03;
      layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });
    requestAnimationFrame(render);
  };

  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("scroll", handleScroll);
  requestAnimationFrame(render);
}

// GSAP cinematic entrances & machinery vibes
function initGSAPMotion() {
  if (typeof gsap === "undefined") return;

  if (gsap && gsap.registerPlugin && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Hero scene rise
  gsap.from(".scene", {
    duration: 1.6,
    y: 40,
    opacity: 0,
    ease: "power3.out",
  });

  // Hero text & timer
  gsap.from(".hero__tagline h1", {
    duration: 1.4,
    y: 40,
    opacity: 0,
    ease: "power3.out",
    delay: 0.2,
  });

  gsap.from(".hero__timer-block", {
    duration: 1.3,
    y: 26,
    opacity: 0,
    ease: "power3.out",
    delay: 0.3,
  });

  gsap.from(".hero__side-panel", {
    duration: 1.3,
    y: 32,
    opacity: 0,
    ease: "power3.out",
    delay: 0.4,
  });

  // Subtle ground shake loop to mimic heavy machinery
  gsap.to(".scene", {
    y: 1,
    duration: 0.35,
    repeat: -1,
    yoyo: true,
    ease: "rough({ template: power2.inOut, strength: 1, points: 10, taper: 'none', randomize: true, clamp: true })",
  });

  // Scroll cards: rise like machinery doors opening
  const cards = document.querySelectorAll(".card[data-anim='rise']");
  cards.forEach((card, index) => {
    gsap.fromTo(
      card,
      { y: 28, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: "power3.out",
        delay: index * 0.12,
        scrollTrigger: {
          trigger: card,
          start: "top 80%",
        },
      }
    );
  });

  // Micro hover weight on cards and CTA
  const interactive = document.querySelectorAll(".card, .cta-btn");
  interactive.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      gsap.to(el, { y: -4, duration: 0.18, ease: "power2.out" });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(el, { y: 0, duration: 0.2, ease: "power2.inOut" });
    });
  });
}

// Signup modal logic
function initSignupModal() {
  const modal = document.getElementById("signup-modal");
  const form = document.getElementById("signup-form");
  const closeEls = modal ? modal.querySelectorAll("[data-close-modal]") : [];
  const cta = document.querySelector(".cta-btn");

  if (!modal || !form) return;

  const openModal = () => {
    // Avoid duplicate opens
    if (modal.classList.contains("signup-modal--visible")) return;
    modal.classList.add("signup-modal--visible");
    modal.setAttribute("aria-hidden", "false");
  };

  const closeModal = () => {
    modal.classList.remove("signup-modal--visible");
    modal.setAttribute("aria-hidden", "true");
  };

  window.setTimeout(openModal, 5000);

  closeEls.forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  if (cta) {
    cta.addEventListener("click", () => {
      openModal();
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const statusEl = document.getElementById("signup-status");
    const submitBtn = form.querySelector(".signup-form__submit");
    const endpoint = FORMSPREE_ENDPOINT;

    if (submitBtn) submitBtn.disabled = true;
    if (statusEl) statusEl.textContent = "Submitting…";

    try {
      if (!endpoint || endpoint.includes("REPLACE_FORM_ID")) {
        throw new Error("Formspree endpoint not configured");
      }

      const formData = new FormData(form);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      if (res.ok) {
        if (statusEl) statusEl.textContent = "Thanks! We’ve saved your spot.";
        form.reset();
        // Close after a brief confirmation
        setTimeout(closeModal, 800);
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = (data && data.error) || "Submission failed. Please try again.";
        if (statusEl) statusEl.textContent = msg;
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = "Setup required: add your Formspree ID.";
      console.error(err);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

function setYear() {
  const el = document.getElementById("year");
  if (!el) return;
  el.textContent = String(new Date().getFullYear());
}

window.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  initParallax();
  initGSAPMotion();
  initSignupModal();
  setYear();
});
// Configure your Formspree endpoint ID here
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mjknrzzn"; // TODO: set your real Formspree form ID

