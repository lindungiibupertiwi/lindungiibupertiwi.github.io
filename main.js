/* ==========================================================
   js/main.js
   Yayasan Lindungi Ibu Pertiwi — Landing Page
   TAHAP 3 — Integrasi AOS & Interaktivitas JavaScript Vanilla

   Isi:
   1. Inisialisasi AOS (Animate On Scroll)
   2. Navbar berubah gaya saat scroll (transparan -> putih+shadow)
   3. Counter animasi angka statistik (Intersection Observer + rAF)
   4. Slider/marquee logo mitra (duplikasi otomatis untuk infinite-loop mulus)
   5. Highlight menu navbar sesuai section aktif saat scroll

   Catatan: layout masonry galeri sudah ditangani murni via CSS
   (column-count) di Tahap 2, sehingga tidak memerlukan JS tambahan.
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  initAOS();
  initNavbarScroll();
  initCounters();
  initPartnerMarquee();
  initActiveNavLink();

  /* --------------------------------------------------------
     1. AOS (Animate On Scroll)
  -------------------------------------------------------- */
  function initAOS() {
    if (typeof AOS === "undefined") return;

    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 80,
      disable: prefersReducedMotion ? true : false,
    });
  }

  /* --------------------------------------------------------
     2. NAVBAR SCROLL STATE
     Transparan di atas hero -> bg-white + shadow saat scroll > 60px
  -------------------------------------------------------- */
  function initNavbarScroll() {
    const navbar = document.getElementById("mainNavbar");
    if (!navbar) return;

    const SCROLL_THRESHOLD = 60;

    const updateNavbarState = () => {
      if (window.scrollY > SCROLL_THRESHOLD) {
        navbar.classList.add("navbar-scrolled");
      } else {
        navbar.classList.remove("navbar-scrolled");
      }
    };

    // Set state awal (misalnya jika halaman dimuat sudah dalam posisi scroll)
    updateNavbarState();

    window.addEventListener("scroll", updateNavbarState, { passive: true });
  }

  /* --------------------------------------------------------
     3. COUNTER STATISTIK
     Angka naik dari 0 -> target saat elemen masuk viewport.
     Menggunakan Intersection Observer + requestAnimationFrame.
  -------------------------------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll(".stat-number[data-count]");
    if (!counters.length) return;

    const DURATION = 1600; // ms

    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute("data-count"), 10) || 0;

      if (prefersReducedMotion) {
        el.textContent = target;
        return;
      }

      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / DURATION, 1);
        // easeOutQuad agar pergerakan melambat mendekati akhir
        const eased = 1 - (1 - progress) * (1 - progress);
        const current = Math.round(eased * target);

        el.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      };

      requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  /* --------------------------------------------------------
     4. MARQUEE LOGO MITRA
     Menduplikasi isi track agar animasi CSS (-50%) terlihat
     sebagai infinite-loop yang mulus, apa pun jumlah logonya.
  -------------------------------------------------------- */
  function initPartnerMarquee() {
    const track = document.getElementById("partnerTrack");
    if (!track) return;

    // Duplikasi seluruh set logo satu kali (total jadi 2x, animasi geser -50%)
    const originalContent = track.innerHTML;
    track.innerHTML += originalContent;

    // Pause saat hover agar user bisa melihat logo dengan jelas
    const wrap = track.closest(".partner-marquee-wrap");
    if (wrap) {
      wrap.addEventListener("mouseenter", () => {
        track.style.animationPlayState = "paused";
      });
      wrap.addEventListener("mouseleave", () => {
        track.style.animationPlayState = "running";
      });
    }
  }

  /* --------------------------------------------------------
     5. HIGHLIGHT MENU NAVBAR SESUAI SECTION AKTIF
  -------------------------------------------------------- */
  function initActiveNavLink() {
    const sections = document.querySelectorAll("main section[id], footer[id]");
    const navLinks = document.querySelectorAll("#mainNavbar .nav-link");
    if (!sections.length || !navLinks.length) return;

    const linkMap = new Map();
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        linkMap.set(href.slice(1), link);
      }
    });

    const setActive = (id) => {
      navLinks.forEach((link) => link.classList.remove("active"));
      const activeLink = linkMap.get(id);
      if (activeLink) activeLink.classList.add("active");
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
  }
});
