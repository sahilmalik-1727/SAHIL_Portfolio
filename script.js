/* ══════════════════════════════════════════════
   SAHIL — PORTFOLIO JS v6 (FIXED)
   All bugs fixed: burger, filter tabs, modal, videos
   ══════════════════════════════════════════════ */

// Wait for DOM ready
document.addEventListener('DOMContentLoaded', function () {

  /* ── 1. CUSTOM CURSOR ── */
  (function initCursor() {
    if (window.matchMedia('(max-width: 1024px)').matches) return;
    const dot  = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top  = my + 'px';
    }, { passive: true });

    (function animRing() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      requestAnimationFrame(animRing);
    })();

    document.querySelectorAll('a, button, .proj-card, .skill-pill, .ftab, .contact-card, .social-icon')
      .forEach(function (el) {
        el.addEventListener('mouseenter', function () { ring.classList.add('hovering'); });
        el.addEventListener('mouseleave', function () { ring.classList.remove('hovering'); });
      });
  })();

  /* ── 2. NAV SCROLLED + ACTIVE LINKS ── */
  (function initNav() {
    const topNav = document.getElementById('topNav');
    if (!topNav) return;

    window.addEventListener('scroll', function () {
      topNav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    const navLinks = document.querySelectorAll('.nav-link');
    const allSections = document.querySelectorAll('section[id]');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(function (link) {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
      allSections.forEach(function (sec) { observer.observe(sec); });
    }
  })();

  /* ── 3. BURGER MENU (FIXED) ── */
  (function initBurger() {
    const burger   = document.getElementById('burger');
    const navPanel = document.getElementById('navLinks');
    if (!burger || !navPanel) {
      console.warn('Burger or nav not found');
      return;
    }

    function openMenu() {
      burger.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      navPanel.classList.add('menu-open');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      navPanel.classList.remove('menu-open');
      document.body.style.overflow = '';
    }

    burger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (burger.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    // Close on nav link click
    navPanel.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // Close on resize > 768
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeMenu();
    });
  })();

  /* ── 4. REVEAL ON SCROLL ── */
  (function initReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    revealEls.forEach(function (el) { el.classList.add('animate-ready'); });

    if (!('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07 });

    revealEls.forEach(function (el) { observer.observe(el); });

    // Safety: reveal anything already in viewport
    setTimeout(function () {
      revealEls.forEach(function (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add('visible');
      });
    }, 300);
  })();

  /* ── 5. STAGGER CARD ENTRANCE ── */
  function staggerIn(wrapperSelector, cardSelector, delayStep) {
    const wrappers = document.querySelectorAll(wrapperSelector);
    if (!wrappers.length) return;

    wrappers.forEach(function (wrapper) {
      const cards = wrapper.querySelectorAll(cardSelector);
      cards.forEach(function (c) {
        c.style.opacity   = '0';
        c.style.transform = 'translateY(24px)';
        c.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, box-shadow 0.3s, background 0.3s';
      });

      if (!('IntersectionObserver' in window)) {
        cards.forEach(function (c) { c.style.opacity = '1'; c.style.transform = 'translateY(0)'; });
        return;
      }

      const obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            cards.forEach(function (c, i) {
              setTimeout(function () {
                c.style.opacity   = '1';
                c.style.transform = 'translateY(0)';
              }, i * delayStep);
            });
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.07 });

      obs.observe(wrapper);
    });
  }
  staggerIn('.card-grid', '.proj-card', 70);
  staggerIn('.skills-wrap', '.skill-pill', 55);
  staggerIn('.contact-cards', '.contact-card', 100);

  /* ── 6. FILTER TABS (FIXED) ── */
  (function initFilter() {
    const tabs   = document.querySelectorAll('.ftab');
    const blocks = document.querySelectorAll('.cat-block');

    if (!tabs.length || !blocks.length) {
      console.warn('Filter tabs or category blocks missing');
      return;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function (e) {
        e.preventDefault();

        // Toggle active tab
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');

        const filter = tab.getAttribute('data-filter');

        // Show / hide category blocks
        blocks.forEach(function (block) {
          const cat = block.getAttribute('data-cat');
          if (filter === 'all' || cat === filter) {
            block.classList.remove('hidden-cat');
          } else {
            block.classList.add('hidden-cat');
          }
        });
      });
    });
  })();

  /* ── 7. VIDEO MODAL (FIXED) ── */
  (function initVideoModal() {
    const modal    = document.getElementById('videoModal');
    const iframe   = document.getElementById('videoIframe');
    const titleEl  = document.getElementById('modalTitle');
    const descEl   = document.getElementById('modalDesc');
    const closeBtn = document.getElementById('modalClose');

    if (!modal || !iframe) {
      console.warn('Video modal elements missing');
      return;
    }

    function openModal(videoId, vTitle, vDesc) {
      if (!videoId) return;
      titleEl.textContent = vTitle || '';
      descEl.textContent  = vDesc  || '';
      iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1';
      modal.classList.add('modal-open');
      document.body.style.overflow = 'hidden';
    }
    function closeModal() {
      modal.classList.remove('modal-open');
      iframe.src = '';
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.video-card').forEach(function (card) {
      card.addEventListener('click', function (e) {
        e.preventDefault();
        const id    = card.getAttribute('data-videoid');
        const title = card.getAttribute('data-title');
        const desc  = card.getAttribute('data-desc');
        openModal(id, title, desc);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  })();

}); // DOMContentLoaded end