/* ══════════════════════════════════════════════
   SAHIL MALIK — PORTFOLIO JS v4
   Fixed: reveal observer, burger menu, all interactions
   ══════════════════════════════════════════════ */

/* ─────────────────────────────────────
   1. PARTICLES — 220, cyan, mouse repel
   ───────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const RGB = '56,217,245';
  const COUNT = 220;
  const REPEL_R = 145;
  const LINK_D  = 95;

  let W, H;
  const mouse = { x: -9999, y: -9999 };
  const particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });

  class Dot {
    constructor(init) { this.spawn(init); }
    spawn(init) {
      this.x    = Math.random() * W;
      this.y    = init ? Math.random() * H : -10;
      this.vx   = (Math.random() - 0.5) * 0.36;
      this.vy   = Math.random() * 0.42 + 0.09;
      this.size = Math.random() * 1.6 + 0.4;
      this.a0   = Math.random() * 0.5 + 0.1;
      this.a    = this.a0;
      this.isNode = Math.random() < 0.1;
      if (this.isNode) { this.size = Math.random() * 2.8 + 2; this.a0 = Math.random() * 0.36 + 0.22; }
    }
    update() {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < REPEL_R) {
        const force = (REPEL_R - d) / REPEL_R;
        const angle = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * force * 5.5 * 0.085;
        this.vy += Math.sin(angle) * force * 5.5 * 0.085;
        this.a   = Math.min(1, this.a0 + force * 0.75);
      } else {
        this.vx *= 0.965;
        this.vy  = this.vy * 0.965 + (Math.random() * 0.42 + 0.09) * 0.035;
        this.a  += (this.a0 - this.a) * 0.05;
      }
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -12) this.x = W + 12;
      if (this.x > W + 12) this.x = -12;
      if (this.y > H + 12) this.spawn(false);
    }
    draw() {
      if (this.isNode) {
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4.5);
        g.addColorStop(0,   `rgba(${RGB},${this.a})`);
        g.addColorStop(0.4, `rgba(${RGB},${this.a * 0.3})`);
        g.addColorStop(1,   `rgba(${RGB},0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4.5, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${RGB},${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < COUNT; i++) particles.push(new Dot(true));

  function drawLinks() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < LINK_D) {
          ctx.strokeStyle = `rgba(${RGB},${(1 - d / LINK_D) * 0.12})`;
          ctx.lineWidth   = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
  }

  function loop() {
    ctx.clearRect(0, 0, W, H);
    drawLinks();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();


/* ─────────────────────────────────────
   2. CUSTOM CURSOR
   ───────────────────────────────────── */
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  }, { passive: true });

  (function animRing() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .bento-card, .skill-pill, .proj-card, .strip-card, .doc-card, .ftab')
    .forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
})();


/* ─────────────────────────────────────
   3. NAV — scrolled state + active links
   ───────────────────────────────────── */
(function initNav() {
  const topNav = document.getElementById('topNav');

  // Scrolled state
  window.addEventListener('scroll', () => {
    topNav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Active link on scroll — using IntersectionObserver correctly
  const navLinks   = document.querySelectorAll('.nav-link');
  const allSections = document.querySelectorAll('section[id]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

  allSections.forEach(sec => observer.observe(sec));
})();


/* ─────────────────────────────────────
   4. BURGER MENU — FIXED
   ───────────────────────────────────── */
(function initBurger() {
  const burger   = document.getElementById('burger');
  const navPanel = document.getElementById('navLinks');

  if (!burger || !navPanel) return;

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

  burger.addEventListener('click', () => {
    if (burger.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when any nav link is clicked
  navPanel.querySelectorAll('.nav-link, .nav-resume-btn').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
})();


/* ─────────────────────────────────────
   5. REVEAL ON SCROLL — FIXED
   The key fix: we first mark elements with 'animate-ready'
   (making them invisible), THEN observe. If observer never
   fires, sections stay visible (fallback safety).
   ───────────────────────────────────── */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');

  // Add animate-ready class so CSS opacity:0 kicks in
  revealEls.forEach(el => el.classList.add('animate-ready'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // stop watching once revealed
      }
    });
  }, { threshold: 0.07 });

  revealEls.forEach(el => observer.observe(el));

  // Safety fallback: if page is scrolled past a section already, reveal it
  setTimeout(() => {
    revealEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        el.classList.add('visible');
      }
    });
  }, 300);
})();


/* ─────────────────────────────────────
   6. STAGGERED CARD ENTRANCE
   ───────────────────────────────────── */
function staggerIn(wrapperSelector, cardSelector, delayStep) {
  const wrapper = document.querySelector(wrapperSelector);
  if (!wrapper) return;
  const cards = wrapper.querySelectorAll(cardSelector);
  cards.forEach(c => {
    c.style.opacity   = '0';
    c.style.transform = 'translateY(24px)';
    c.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.3s, box-shadow 0.3s, background 0.3s';
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        cards.forEach((c, i) => {
          setTimeout(() => {
            c.style.opacity   = '1';
            c.style.transform = 'translateY(0)';
          }, i * delayStep);
        });
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.07 });

  obs.observe(wrapper);
}

staggerIn('.bento-grid',    '.bento-card',  70);
staggerIn('.skills-wrap',   '.skill-pill',  55);
staggerIn('.featured-grid', '.proj-card',   80);
staggerIn('.docs-grid',     '.doc-card',    65);


/* ─────────────────────────────────────
   7. GALLERY FILTER TABS
   ───────────────────────────────────── */
(function initFilter() {
  const tabs = document.querySelectorAll('.ftab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;

      // Filter featured cards
      document.querySelectorAll('.proj-card').forEach(card => {
        const type = card.dataset.type || '';
        const show = filter === 'all' || type === filter;
        card.classList.toggle('hidden-item', !show);
      });

      // Filter strip cards
      document.querySelectorAll('.strip-card').forEach(card => {
        const type = card.dataset.type || '';
        const show = filter === 'all' || type === filter;
        card.classList.toggle('hidden-item', !show);
      });

      // Filter doc cards
      document.querySelectorAll('.doc-card').forEach(card => {
        const show = filter === 'all' || filter === 'pdf';
        card.classList.toggle('hidden-item', !show);
      });

      // Doc quote: show with 'all' or 'pdf'
      const docQuote = document.querySelector('.doc-quote');
      if (docQuote) {
        docQuote.style.display = (filter === 'all' || filter === 'pdf') ? '' : 'none';
      }
    });
  });
})();


/* ─────────────────────────────────────
   8. STRIP SCROLL ARROWS
   ───────────────────────────────────── */
(function initStrip() {
  const strip = document.getElementById('projStrip');
  const prev  = document.getElementById('stripPrev');
  const next  = document.getElementById('stripNext');
  if (!strip || !prev || !next) return;
  next.addEventListener('click', () => strip.scrollBy({ left:  460, behavior: 'smooth' }));
  prev.addEventListener('click', () => strip.scrollBy({ left: -460, behavior: 'smooth' }));
})();


/* ─────────────────────────────────────
   9. VIDEO MODAL
   ───────────────────────────────────── */
(function initVideoModal() {
  const modal   = document.getElementById('videoModal');
  const iframe  = document.getElementById('videoIframe');
  const title   = document.getElementById('modalTitle');
  const desc    = document.getElementById('modalDesc');
  const closeBtn = document.getElementById('modalClose');
  if (!modal) return;

  function openModal(videoId, videoTitle, videoDesc) {
    title.textContent = videoTitle || '';
    desc.textContent  = videoDesc  || '';
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    modal.classList.add('modal-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('modal-open');
    iframe.src = '';
    document.body.style.overflow = '';
  }

  // Open on any video card click
  document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => {
      openModal(card.dataset.videoid, card.dataset.title, card.dataset.desc);
    });
  });

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
})();


/* ─────────────────────────────────────
   10. CONTACT FORM VALIDATION
   ───────────────────────────────────── */
(function initForm() {
  const form     = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const popupBg  = document.getElementById('popupBg');
  const popupBox = document.getElementById('popupBox');
  const popupMsg = document.getElementById('popupMsg');
  const closeBtn = document.getElementById('popupClose');
  const audio    = document.getElementById('successAudio');
  if (!form) return;

  const fields = form.querySelectorAll('input[required], textarea[required]');

  // Clear error on input
  fields.forEach(f => {
    f.addEventListener('input', () => {
      f.classList.remove('error');
      const err = f.parentNode.querySelector('.err-msg');
      if (err) err.remove();
    });
  });

  function showError(field, message) {
    field.classList.add('error');
    const old = field.parentNode.querySelector('.err-msg');
    if (old) old.remove();
    const el = document.createElement('span');
    el.className   = 'err-msg';
    el.textContent = message;
    field.parentNode.appendChild(el);
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function openPopup(msg) {
    popupMsg.textContent = msg;
    popupBg.style.display = 'flex';
    setTimeout(() => popupBox.classList.add('pop'), 40);
  }

  function closePopup() {
    popupBox.classList.remove('pop');
    setTimeout(() => { popupBg.style.display = 'none'; }, 340);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    // Clear old errors
    form.querySelectorAll('.err-msg').forEach(m => m.remove());
    fields.forEach(f => f.classList.remove('error'));

    let valid = true;
    fields.forEach(f => {
      if (!f.value.trim()) {
        showError(f, 'This field is required.');
        valid = false;
      } else if (f.type === 'email' && !validEmail(f.value.trim())) {
        showError(f, 'Please enter a valid email address.');
        valid = false;
      }
    });

    if (!valid) return;

    // Success
    const firstName = form.firstName.value.trim();
    const email     = form.email.value.trim();
    openPopup(`Thank you, ${firstName}! We'll be in touch at ${email} soon.`);
    audio?.play().catch(() => {});

    submitBtn.classList.add('sent');
    submitBtn.querySelector('.btn-label').textContent = 'Message Sent!';
    submitBtn.querySelector('.btn-arr').textContent   = '✓';
    submitBtn.disabled = true;

    setTimeout(() => {
      closePopup();
      form.reset();
      submitBtn.classList.remove('sent');
      submitBtn.querySelector('.btn-label').textContent = 'Send Message';
      submitBtn.querySelector('.btn-arr').textContent   = '→';
      submitBtn.disabled = false;
    }, 4500);
  });

  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  if (popupBg)  popupBg.addEventListener('click', e => { if (e.target === popupBg) closePopup(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });
})();