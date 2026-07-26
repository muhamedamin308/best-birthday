document.addEventListener('DOMContentLoaded', () => {

  /* ---------- ambient particles ---------- */
  const particleLayer = document.getElementById('particles');
  const particleColors = ['#EF93A0', '#F3B88A', '#C6AEE0', '#9ED4DC'];
  const particleCount = window.innerWidth < 640 ? 10 : 18;
  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('span');
    p.className = 'particle';
    const size = 4 + Math.random() * 7;
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = particleColors[i % particleColors.length];
    p.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 120}px`);
    p.style.animationDuration = `${14 + Math.random() * 16}s`;
    p.style.animationDelay = `${-Math.random() * 20}s`;
    particleLayer.appendChild(p);
  }

  /* ---------- scroll-reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        const siblingsDelay = Array.from(entry.target.parentElement.children).indexOf(entry.target);
        entry.target.style.transitionDelay = `${Math.min(siblingsDelay, 5) * 90}ms`;
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- stat counters ---------- */
  const statNums = document.querySelectorAll('.stat-num');
  const animateCount = (el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const duration = 1400;
    const start = performance.now();
    const isYear = el.hasAttribute('data-nocommas');
    const startVal = isYear ? target - 40 : 0;
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(startVal + (target - startVal) * eased);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  statNums.forEach(el => statObserver.observe(el));

  /* ---------- compass needle follows scroll ---------- */
  const needle = document.getElementById('compassNeedle');
  const updateCompass = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? window.scrollY / docHeight : 0;
    const angle = progress * 360;
    if (needle) needle.style.transform = `rotate(${angle}deg)`;
  };

  /* ---------- trail path draw-on-scroll ---------- */
  const trailPath = document.getElementById('trailPath');
  const trailSection = document.getElementById('trail');
  let pathLength = 0;
  if (trailPath) {
    pathLength = trailPath.getTotalLength();
    trailPath.style.strokeDasharray = `${pathLength}`;
    trailPath.style.strokeDashoffset = `${pathLength}`;
  }
  const updateTrail = () => {
    if (!trailPath || !trailSection) return;
    const rect = trailSection.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.5;
    const scrolled = -rect.top + window.innerHeight * 0.35;
    const progress = Math.max(0, Math.min(1, scrolled / total));
    trailPath.style.strokeDashoffset = `${pathLength * (1 - progress)}`;
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateCompass();
        updateTrail();
        ticking = false;
      });
      ticking = true;
    }
  });
  updateCompass();
  updateTrail();

  /* ---------- scroll cue ---------- */
  const scrollCue = document.getElementById('scrollCue');
  if (scrollCue) {
    scrollCue.addEventListener('click', () => {
      document.getElementById('intro').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ---------- lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  document.querySelectorAll('.polaroid').forEach(btn => {
    btn.addEventListener('click', () => {
      lightboxImg.src = btn.getAttribute('data-full');
      lightboxImg.alt = btn.querySelector('img').alt;
      lightbox.classList.add('open');
    });
  });
  const closeLightbox = () => lightbox.classList.remove('open');
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ---------- envelope open ---------- */
  const envelope = document.getElementById('envelope');
  envelope.addEventListener('click', () => {
    envelope.classList.toggle('open');
  });

  /* ---------- confetti wish button ---------- */
  const wishBtn = document.getElementById('wishBtn');
  const fire = (opts) => {
    if (typeof confetti === 'function') {
      confetti(Object.assign({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.65 },
        colors: ['#EF93A0', '#F3B88A', '#C6AEE0', '#9ED4DC', '#3B2A33']
      }, opts));
    }
  };
  wishBtn.addEventListener('click', () => {
    fire({ particleCount: 120, spread: 100, origin: { y: 0.6 } });
    setTimeout(() => fire({ particleCount: 60, angle: 60, origin: { x: 0 } }), 200);
    setTimeout(() => fire({ particleCount: 60, angle: 120, origin: { x: 1 } }), 350);
  });
});
