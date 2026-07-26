document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;

  /* ---------- hero parallax ---------- */
  if (!reduceMotion && !isTouch) {
    const heroSky = document.querySelector('.hero-sky:not(.closing-sky)');
    const heroEl = document.getElementById('hero');
    if (heroSky && heroEl) {
      heroEl.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 26;
        const y = (e.clientY / window.innerHeight - 0.5) * 26;
        heroSky.style.transform = `translate(${x}px, ${y}px)`;
      });
      heroEl.addEventListener('mouseleave', () => {
        heroSky.style.transform = 'translate(0, 0)';
      });
    }
  }

  /* ---------- cursor sparkle trail ---------- */
  if (!reduceMotion && !isTouch) {
    const sparkleColors = ['#EF93A0', '#F3B88A', '#C6AEE0', '#9ED4DC', '#9FCB94'];
    let lastSpawn = 0;
    window.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastSpawn < 55) return;
      lastSpawn = now;
      const dot = document.createElement('span');
      dot.className = 'sparkle-dot';
      dot.style.background = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 720);
    });
  }

  /* ---------- tilt effect for polaroids & stamp cards ---------- */
  function attachTilt(el, { max = 8, baseRotate = 0 } = {}) {
    if (reduceMotion || isTouch) return;
    let raf = null;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * max * 2;
      const rotateX = (0.5 - y) * max * 2;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `rotate(${baseRotate}deg) perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05) translateY(-6px)`;
      });
    });
    el.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = `rotate(${baseRotate}deg)`;
    });
  }
  document.querySelectorAll('.polaroid').forEach(el => {
    attachTilt(el, { max: 9, baseRotate: parseFloat(el.getAttribute('data-rot') || '0') });
  });
  document.querySelectorAll('.stamp-card').forEach(el => attachTilt(el, { max: 5, baseRotate: 0 }));

  /* ---------- magnetic button (wish button) ---------- */
  function attachMagnetic(el, strength = 14) {
    if (reduceMotion || isTouch) return;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${(x / rect.width) * strength}px, ${(y / rect.height) * strength}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  }

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
  const trailSvg = document.getElementById('trailSvg');
  const trailMapEl = trailSection ? trailSection.querySelector('.trail-map') : null;
  const trailTraveler = document.getElementById('trailTraveler');
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

    if (trailTraveler && trailSvg && trailMapEl && pathLength) {
      const dist = progress * pathLength;
      const pt = trailPath.getPointAtLength(dist);
      const pt2 = trailPath.getPointAtLength(Math.min(pathLength, dist + 2));
      const angle = Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * (180 / Math.PI);

      const svgRect = trailSvg.getBoundingClientRect();
      const mapRect = trailMapEl.getBoundingClientRect();
      const scaleX = svgRect.width / 200;
      const scaleY = svgRect.height / 1400;
      const left = (svgRect.left - mapRect.left) + pt.x * scaleX;
      const top = (svgRect.top - mapRect.top) + pt.y * scaleY;

      trailTraveler.style.left = `${left}px`;
      trailTraveler.style.top = `${top}px`;
      trailTraveler.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
      trailTraveler.style.opacity = (progress > 0.008 && progress < 0.995) ? '1' : '0';
    }
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

  /* ---------- floating hearts burst ---------- */
  function burstHearts(originEl) {
    const rect = originEl.getBoundingClientRect();
    const icons = ['\u{1F49B}', '\u{1FA77}', '\u2728', '\u{1F495}'];
    for (let i = 0; i < 10; i++) {
      const heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = icons[i % icons.length];
      heart.style.left = `${rect.left + rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.6}px`;
      heart.style.top = `${rect.top + rect.height * 0.25}px`;
      heart.style.setProperty('--drift', `${(Math.random() - 0.5) * 90}px`);
      heart.style.animationDelay = `${Math.random() * 0.3}s`;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 2900);
    }
  }

  /* ---------- envelope open ---------- */
  const envelope = document.getElementById('envelope');
  const envelopeLetterEl = document.getElementById('envelopeLetter');
  envelope.addEventListener('click', () => {
    const opening = !envelope.classList.contains('open');
    envelope.classList.toggle('open');
    const lines = envelopeLetterEl.querySelectorAll('.letter-line');
    if (opening) {
      if (!reduceMotion) burstHearts(envelope);
      lines.forEach((line, i) => {
        line.style.transitionDelay = `${300 + i * 140}ms`;
        requestAnimationFrame(() => line.classList.add('reveal'));
      });
    } else {
      lines.forEach(line => {
        line.style.transitionDelay = '0ms';
        line.classList.remove('reveal');
      });
    }
  });

  /* ---------- confetti wish button ---------- */
  const wishBtn = document.getElementById('wishBtn');
  attachMagnetic(wishBtn, 12);
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

  /* ---------- clear piano music (La La Land inspired) ---------- */
  let musicReady = false;
  let musicPlaying = false;
  let pianoSynth, bassSynth, melodyPart, bassPart;
  const soundToggle = document.getElementById('soundToggle');

  /* --- music button hint arrow --- */
  if (soundToggle) {
    const hint = document.createElement('div');
    hint.className = 'sound-hint';
    hint.innerHTML = '<span class="sound-hint-text">♪ tap to play</span><span class="sound-hint-arrow">↑</span>';
    soundToggle.parentElement.appendChild(hint);
    soundToggle.addEventListener('click', () => {
      hint.classList.add('sound-hint-hide');
    }, { once: true });
  }

  function updateSoundIcon() {
    if (!soundToggle) return;
    soundToggle.classList.toggle('is-playing', musicPlaying);
    soundToggle.setAttribute('aria-pressed', musicPlaying ? 'true' : 'false');
    soundToggle.title = musicPlaying ? 'Pause piano music' : 'Play piano music';
  }

  async function setupMusic() {
    if (typeof Tone === 'undefined') return false;
    try {
      /* --- effects chain: reverb + subtle delay for dreamy piano --- */
      const reverb = new Tone.Reverb({ decay: 4.5, wet: 0.4 });
      await reverb.generate();
      reverb.toDestination();

      const delay = new Tone.FeedbackDelay({ delayTime: '8n.', feedback: 0.15, wet: 0.18 });
      delay.connect(reverb);

      /* --- main piano voice: bright, clear attack --- */
      pianoSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle8' },
        envelope: { attack: 0.005, decay: 1.2, sustain: 0.15, release: 2.0 }
      });
      pianoSynth.connect(delay);
      pianoSynth.volume.value = -12;

      /* --- soft bass for warmth --- */
      bassSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.08, decay: 0.8, sustain: 0.4, release: 2.4 }
      });
      bassSynth.connect(reverb);
      bassSynth.volume.value = -22;

      /*
       * Melody inspired by the dreamy, romantic feel of
       * "Mia & Sebastian's Theme" — ascending phrases, gentle pauses,
       * longing intervals. Original composition in A major.
       */
      const melodyNotes = [
        /* Phrase 1 — ascending, hopeful */
        { time: '0:0:0', note: 'A4',  dur: '4n' },
        { time: '0:0:2', note: 'C#5', dur: '4n' },
        { time: '0:1:0', note: 'E5',  dur: '4n.' },
        { time: '0:2:0', note: 'D5',  dur: '4n' },
        { time: '0:2:2', note: 'C#5', dur: '2n' },
        { time: '0:3:2', note: 'B4',  dur: '8n' },

        /* Phrase 2 — gentle descent */
        { time: '1:0:0', note: 'A4',  dur: '4n' },
        { time: '1:0:2', note: 'B4',  dur: '4n' },
        { time: '1:1:0', note: 'C#5', dur: '4n.' },
        { time: '1:2:0', note: 'A4',  dur: '2n' },
        { time: '1:3:2', note: 'G#4', dur: '8n' },

        /* Phrase 3 — longing, wider intervals */
        { time: '2:0:0', note: 'F#4', dur: '4n' },
        { time: '2:0:2', note: 'A4',  dur: '4n' },
        { time: '2:1:0', note: 'D5',  dur: '4n.' },
        { time: '2:2:0', note: 'C#5', dur: '4n' },
        { time: '2:2:2', note: 'B4',  dur: '4n' },
        { time: '2:3:0', note: 'A4',  dur: '4n' },
        { time: '2:3:2', note: 'G#4', dur: '8n' },

        /* Phrase 4 — resolution, tender */
        { time: '3:0:0', note: 'A4',  dur: '4n.' },
        { time: '3:0:3', note: 'E5',  dur: '4n' },
        { time: '3:1:2', note: 'D5',  dur: '4n' },
        { time: '3:2:0', note: 'C#5', dur: '2n' },
        { time: '3:3:0', note: 'B4',  dur: '4n' },
        { time: '3:3:2', note: 'A4',  dur: '8n' },

        /* Phrase 5 — second theme, higher register */
        { time: '4:0:0', note: 'E5',  dur: '4n' },
        { time: '4:0:2', note: 'F#5', dur: '4n' },
        { time: '4:1:0', note: 'E5',  dur: '4n.' },
        { time: '4:2:0', note: 'D5',  dur: '4n' },
        { time: '4:2:2', note: 'C#5', dur: '2n' },

        /* Phrase 6 — echo, winding down */
        { time: '5:0:0', note: 'B4',  dur: '4n' },
        { time: '5:0:2', note: 'C#5', dur: '4n' },
        { time: '5:1:0', note: 'D5',  dur: '4n.' },
        { time: '5:2:0', note: 'C#5', dur: '4n' },
        { time: '5:2:2', note: 'B4',  dur: '4n' },
        { time: '5:3:0', note: 'A4',  dur: '2n' },

        /* Phrase 7 — reprise, gentle high */
        { time: '6:0:0', note: 'C#5', dur: '4n' },
        { time: '6:0:2', note: 'E5',  dur: '4n' },
        { time: '6:1:0', note: 'F#5', dur: '4n.' },
        { time: '6:2:0', note: 'E5',  dur: '4n' },
        { time: '6:2:2', note: 'D5',  dur: '4n' },
        { time: '6:3:0', note: 'C#5', dur: '4n' },
        { time: '6:3:2', note: 'B4',  dur: '8n' },

        /* Phrase 8 — final resolution, soft landing */
        { time: '7:0:0', note: 'A4',  dur: '4n.' },
        { time: '7:0:3', note: 'C#5', dur: '4n' },
        { time: '7:1:2', note: 'E5',  dur: '2n' },
        { time: '7:2:2', note: 'D5',  dur: '4n' },
        { time: '7:3:0', note: 'C#5', dur: '4n' },
        { time: '7:3:2', note: 'A4',  dur: '2n' },
      ];

      melodyPart = new Tone.Part((time, value) => {
        pianoSynth.triggerAttackRelease(value.note, value.dur, time);
      }, melodyNotes);
      melodyPart.loop = true;
      melodyPart.loopEnd = '8:0:0';

      /* --- bass notes following chord roots --- */
      const bassNotes = [
        { time: '0:0:0', note: 'A2',  dur: '1m' },
        { time: '1:0:0', note: 'E2',  dur: '1m' },
        { time: '2:0:0', note: 'D2',  dur: '1m' },
        { time: '3:0:0', note: 'A2',  dur: '1m' },
        { time: '4:0:0', note: 'F#2', dur: '1m' },
        { time: '5:0:0', note: 'D2',  dur: '1m' },
        { time: '6:0:0', note: 'E2',  dur: '1m' },
        { time: '7:0:0', note: 'A2',  dur: '1m' },
      ];

      bassPart = new Tone.Part((time, value) => {
        bassSynth.triggerAttackRelease(value.note, value.dur, time);
      }, bassNotes);
      bassPart.loop = true;
      bassPart.loopEnd = '8:0:0';

      Tone.Transport.bpm.value = 72;
      melodyPart.start(0);
      bassPart.start(0);

      return true;
    } catch (err) {
      console.warn('Piano music setup failed', err);
      return false;
    }
  }

  async function startMusic() {
    if (musicPlaying) return;
    if (!musicReady) {
      musicReady = await setupMusic();
      if (!musicReady) return;
    }
    try {
      await Tone.start();
      Tone.Transport.start();
      musicPlaying = true;
      updateSoundIcon();
    } catch (err) {
      console.warn('Could not start audio', err);
    }
  }

  function stopMusic() {
    if (!musicPlaying) return;
    Tone.Transport.pause();
    musicPlaying = false;
    updateSoundIcon();
  }

  function toggleMusic() {
    if (musicPlaying) stopMusic();
    else startMusic();
  }

  if (soundToggle) soundToggle.addEventListener('click', toggleMusic);
  if (scrollCue) scrollCue.addEventListener('click', () => { startMusic(); });
});
