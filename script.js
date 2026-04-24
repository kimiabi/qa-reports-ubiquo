/* ================================================================
   QA LANDING — script.js
   Funcionalidades:
   - Navbar: sombra + clase active al hacer scroll
   - Fade-in: IntersectionObserver para .fade-in
   - Contadores animados: data-target
   - Barras de crecimiento: animación con IO
   - Donut chart: generado dinámicamente con conic-gradient
   - Scroll top button
================================================================ */

/* ── 1. Navbar scroll ──────────────────────────────────────── */
(function initNavbar() {
  const nav     = document.getElementById('topnav');
  const btnTop  = document.getElementById('btnTop');

  window.addEventListener('scroll', () => {
    const y = window.scrollY;

    // Sombra en navbar
    nav.classList.toggle('scrolled', y > 40);

    // Botón scroll-top
    btnTop.classList.toggle('visible', y > 400);

    // Resaltar sección activa
    highlightActiveSection();
  }, { passive: true });

  btnTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ── 2. Resaltar sección activa en el nav ─────────────────── */
function highlightActiveSection() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');
  let current   = '';

  sections.forEach(sec => {
    const top = sec.getBoundingClientRect().top;
    if (top <= 80) current = sec.id;
  });

  navLinks.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === `#${current}`);
  });
}

/* ── 3. IntersectionObserver — fade-in ────────────────────── */
(function initFadeIn() {
  const targets = document.querySelectorAll('.fade-in');
  if (!targets.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(t => io.observe(t));
})();

/* ── 4. Contadores animados ───────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-target]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      animateCounter(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1400; // ms
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('es');
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('es');
    }
    requestAnimationFrame(step);
  }
})();

/* ── 5. Gráfico de crecimiento SVG — S10 ─────────────────── */
(function initGrowthChart() {
  const wrap = document.getElementById('growthBars');
  if (!wrap) return;

  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      // Disparar la animación SVG (beginElement en el trigger)
      const trigger = wrap.querySelector('#growthAnim');
      if (trigger && trigger.beginElement) trigger.beginElement();

      // Hacer aparecer los puntos con sus delays naturales (definidos en style)
      wrap.querySelectorAll('.growth-dots circle').forEach(c => {
        c.style.animationPlayState = 'running';
      });

      io.disconnect();
    }
  }, { threshold: 0.3 });

  // Pausar la animación de los puntos hasta que entren en viewport
  wrap.querySelectorAll('.growth-dots circle').forEach(c => {
    c.style.animationPlayState = 'paused';
  });

  io.observe(wrap);
})();

/* ── 6. Donut chart CSS dinámico ──────────────────────────── */
(function initDonut() {
  const donut = document.getElementById('donut');
  if (!donut) return;

  // Datos: [valor, color]
  const segments = [
    { value: 17, color: '#e879f9', label: 'Crítica' },
    { value: 12, color: '#f97316', label: 'Alta'    },
    { value: 14, color: '#fbbf24', label: 'Media'   },
    { value:  4, color: '#4ade80', label: 'Baja'    },
  ];

  const total = segments.reduce((s, x) => s + x.value, 0);
  let deg = 0;

  // Construir conic-gradient
  const stops = segments.map(seg => {
    const angle = (seg.value / total) * 360;
    const stop  = `${seg.color} ${deg.toFixed(1)}deg ${(deg + angle).toFixed(1)}deg`;
    deg += angle;
    return stop;
  });

  // Aplicar con pequeños gaps entre segmentos (1.5°)
  let gapDeg = 0;
  const stopsGap = segments.map((seg, i) => {
    const angle     = (seg.value / total) * 360;
    const gapSize   = 2; // grados de gap
    const start     = gapDeg + gapSize / 2;
    const end       = gapDeg + angle - gapSize / 2;
    const darkStart = gapDeg;
    const darkEnd   = start;
    gapDeg += angle;

    return [
      `var(--bg) ${darkStart.toFixed(1)}deg ${darkEnd.toFixed(1)}deg`,
      `${seg.color} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`,
    ].join(', ');
  });

  donut.style.background = `conic-gradient(${stopsGap.join(', ')})`;

  // Animar el donut (rotate de 0 a 360 al entrar en viewport)
  const io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      donut.style.transition = 'transform 1.2s cubic-bezier(.25,.46,.45,.94)';
      donut.style.transform  = 'rotate(0deg)';
      io.disconnect();
    }
  }, { threshold: 0.4 });

  // Empezar rotado
  donut.style.transform = 'rotate(-90deg)';
  io.observe(donut);
})();

/* ── 7. Scroll suave en los links del nav ─────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 52; // altura del navbar
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ── 8. Efecto parallax suave en el bot imagen ─────────────── */
(function initBotParallax() {
  const bot = document.getElementById('botImg');
  if (!bot) return;

  document.addEventListener('mousemove', (e) => {
    const cx = window.innerWidth  / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;   // -1 a 1
    const dy = (e.clientY - cy) / cy;
    bot.style.transform = `translateY(var(--float-y, 0px)) rotate(${dx * 2}deg) translateX(${dx * 6}px)`;
  }, { passive: true });
})();

/* ── 9. Hover glow sutil en cards ─────────────────────────── */
(function initCardGlow() {
  // Añadir movimiento de luz por posición del mouse dentro de cada card
  document.querySelectorAll('.card, .metric-card, .res-card, .reading-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1);
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1);
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(0,212,255,.05), var(--card-bg) 60%)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });
})();

/* ── 10. KPI strip hero — animar al cargar ────────────────── */
(function initHeroKpis() {
  // Los contadores del hero se animan al cargarse la página
  setTimeout(() => {
    document.querySelectorAll('.kpi-chip-val[data-target]').forEach(el => {
      const target   = parseInt(el.dataset.target, 10);
      const duration = 1800;
      const start    = performance.now();

      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString('es');
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target.toLocaleString('es');
      }
      requestAnimationFrame(step);
    });
  }, 300);
})();
