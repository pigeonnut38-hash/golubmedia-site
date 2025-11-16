// script.js  — safe modal loader for Drive previews
(function () {
  const modal = document.getElementById('player-modal');
  const frame = document.getElementById('drive-frame');
  const body  = document.body;

  // Ako ova stranica nema modal (home/services...), izađi tiho.
  if (!modal || !frame) return;

  const isOpen = () => !modal.hasAttribute('hidden');

  function openModal(url) {
    frame.src = "";              // hard reset
    frame.src = url;             // učitaj
    modal.removeAttribute('hidden');
    body.style.overflow = 'hidden';
  }

  function closeModal() {
    frame.src = "";              // prekini stream
    modal.setAttribute('hidden', '');
    body.style.overflow = '';
  }

  // OTVARANJE: klik na .video-card sa iframe[data-src]
  document.addEventListener('click', (e) => {
    if (isOpen()) return;

    const card = e.target.closest('.video-card');
    if (!card) return;

    const lazy = card.querySelector('iframe[data-src]');
    if (!lazy) return;

    const url = lazy.getAttribute('data-src');
    if (!url) return;

    e.preventDefault();
    openModal(url);
  }, true);
  console.log('scroll reveal active');

  // ZATVARANJE: X ili klik izvan player-dialog
  modal.addEventListener('click', (e) => {
    const hitClose   = e.target.closest('.player-close');
    const outside    = !e.target.closest('.player-dialog');
    if (hitClose || outside) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeModal();
    }
  });

  // Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) closeModal();
  });
    // === THUMBNAIL + PLAY OVERLAY ZA SVAKU .video-card ===
  function extractDriveId(previewUrl) {
    // očekuje format: https://drive.google.com/file/d/FILE_ID/preview
    const m = previewUrl.match(/\/d\/([^/]+)\//);
    return m ? m[1] : null;
  }

  function makeThumbUrl(fileId, width = 1280) {
    // javni Drive thumbnail; radi za public/unlisted; za restricted neće
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${width}`;
  }

  function decorateCards() {
    document.querySelectorAll('.video-card').forEach(card => {
      // preskoči ako već dekorisano
      if (card.dataset.decorated) return;

      const lazy = card.querySelector('iframe[data-src]');
      if (!lazy) return;

      // 1) thumbnail IMG
      let thumbUrl = card.getAttribute('data-thumb');
      if (!thumbUrl) {
        const id = extractDriveId(lazy.getAttribute('data-src') || '');
        if (id) thumbUrl = makeThumbUrl(id);
      }

      const thumb = document.createElement('img');
      thumb.className = 'video-thumb';
      thumb.alt = '';
      if (thumbUrl) thumb.src = thumbUrl;

      // fallback: solid background ako thumb ne postoji ili ne može da se učita
      thumb.addEventListener('error', () => {
        thumb.removeAttribute('src');
        thumb.classList.add('thumb-fallback');
      });

      // 2) overlay sloj i play badge
      const overlay = document.createElement('div');
      overlay.className = 'video-overlay';

      const play = document.createElement('button');
      play.type = 'button';
      play.className = 'play-badge';
      play.setAttribute('aria-label', 'Play');

      overlay.appendChild(play);

      // 3) ubaci u karticu na početak da prekrije prazan iframe
      card.prepend(overlay);
      card.prepend(thumb);

      // markirano kao obrađeno
      card.dataset.decorated = '1';
    });
  }

  // pokreni kad DOM spreman
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', decorateCards);
  } else {
    decorateCards();
  }

})();
// === IMAGE MODAL (robustan) ===
document.addEventListener('DOMContentLoaded', () => {
  const imgModal = document.getElementById('img-modal');
  const modalImg = document.getElementById('modal-img');
  if (!imgModal || !modalImg) return;

  // ⬇⬇⬇ PREPRAVI OVO: dodaj .thumb-grid img u selektor
  document.addEventListener('click', (e) => {
    const thumb = e.target.closest('.clickable-img, .thumb-grid img');
    if (!thumb) return;
    modalImg.src = thumb.src;
    imgModal.removeAttribute('hidden');
  });

  imgModal.addEventListener('click', (e) => {
    const hitClose = e.target.closest('.close-img');
    const outside  = !e.target.closest('#modal-img');
    if (hitClose || outside) {
      imgModal.setAttribute('hidden', '');
      modalImg.src = '';
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !imgModal.hasAttribute('hidden')) {
      imgModal.setAttribute('hidden', '');
      modalImg.src = '';
    }
  });
});
// === SCROLL REVEAL (globalno, auto-označavanje) ===
document.addEventListener('DOMContentLoaded', () => {
  const targets = document.querySelectorAll([
    'section.section-block',
    '.service-card',
    '.niche-card',
    '.video-card',
    '.thumb-grid img',
    '.extra-card',
    '.contact-card',
    '.main-service-card'
  ].join(','));

  // dodaj .reveal ako nije već
  targets.forEach(el => el.classList.add('reveal'));

  // posmatrač
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target); // animira se jednom
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
});
// === BLUR REVEAL ===
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.video-thumb, .thumb-grid img').forEach(img => {
    if (img.complete) img.setAttribute('data-loaded', '1');
    img.addEventListener('load', () => img.setAttribute('data-loaded', '1'));
  });
});
// === SERVICES: CLICK TO EXPAND CARDS ===
document.addEventListener('DOMContentLoaded', () => {
  // radi samo na services strani
  if (!document.body.classList.contains('services')) return;

  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('click', (e) => {
      // ako nekad dodaš link unutra, da klik na link ne pali/gaši karticu
      if (e.target.tagName.toLowerCase() === 'a') return;
      card.classList.toggle('open');
    });
  });
});
// === 3D GLOW CARDS ===
document.addEventListener('DOMContentLoaded', () => {
  const advancedCards = document.querySelectorAll([
    '.service-card',
    '.main-service-card',
    '.niche-card',
    '.video-card',
    '.extra-card',
    '.contact-card',
    '.review-card',
    '.short-card',
    '.ba-card'
  ].join(','));

  advancedCards.forEach(el => el.classList.add('card-3d'));
});
// === DYNAMIC NAV UNDERLINE ===
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.querySelector('.navbar');
  const underline = document.querySelector('.nav-underline');
  const links = document.querySelectorAll('.nav-links a');

  if (!navbar || !underline || !links.length) return;

  function moveUnderline(el) {
    const rect = el.getBoundingClientRect();
    const navRect = navbar.getBoundingClientRect();
    underline.style.width = rect.width + 'px';
    underline.style.transform = `translateX(${rect.left - navRect.left}px)`;
  }

  const active = document.querySelector('.nav-links a.active') || links[0];
  moveUnderline(active);

  links.forEach(link => {
    link.addEventListener('mouseenter', () => moveUnderline(link));
  });

  navbar.addEventListener('mouseleave', () => moveUnderline(active));
});
// === FIX FOR 100vh ON MOBILE BROWSERS ===
function setVhProperty() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
// === HERO GLITCH PULSES ===
document.addEventListener('DOMContentLoaded', () => {
  const title = document.querySelector('.glitch-title');
  if (!title) return;

  // da ne dupliramo tekst ručno
  title.setAttribute('data-text', title.textContent);

  function pulseGlitch() {
    title.classList.add('glitch-active');
    setTimeout(() => {
      title.classList.remove('glitch-active');
    }, 260); // kratki burst
  }

  // inicijalni glitch
  setTimeout(pulseGlitch, 600);

  // random glitch na 3–7 sekundi
  setInterval(() => {
    if (Math.random() < 0.7) pulseGlitch();
  }, 3200 + Math.random() * 4000);
});
window.addEventListener('resize', setVhProperty);
setVhProperty();
// === CURSOR SPOTLIGHT COORDS ===
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  function updateSpot(e) {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    root.style.setProperty('--cursor-x', x + '%');
    root.style.setProperty('--cursor-y', y + '%');
  }

  window.addEventListener('mousemove', updateSpot);
});
// === BOOT SEQUENCE TERMINAL (HOME) ===
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('boot-overlay');
  const logEl   = document.getElementById('boot-log');
  const skipBtn = document.getElementById('boot-skip');

  if (!overlay || !logEl || !skipBtn) return;

  // Ako smo već videli boot ranije, preskoči.
  try {
    if (localStorage.getItem('gmBootSeen') === '1') {
      overlay.classList.add('hidden');
      setTimeout(() => overlay.remove(), 400);
      return;
    }
  } catch (e) {
    // ako nešto pukne sa localStorage, samo ignorišemo
  }

  const lines = [
    "[ OK ] Initializing GolubMedia protocol...",
    "[ OK ] Loading editing pipelines...",
    "[ OK ] Mounting client content feeds...",
    "[ OK ] Binding Python micro-bots to file system...",
    "[WARN] Detected human error sources in input videos.",
    "[ OK ] Enforcing retention-first render profiles...",
    "[ OK ] Routing attention → revenue channels...",
    "[ READY ] System online. Handing control to operator."
  ];

  let index = 0;
  let timers = [];

  function appendLine(line, delay) {
    const t = setTimeout(() => {
      logEl.textContent += line + "\n";
      logEl.scrollTop = logEl.scrollHeight;
    }, delay);
    timers.push(t);
  }

  function runSequence() {
    let totalDelay = 0;
    const stepDelay = 320;

    lines.forEach((line, i) => {
      appendLine(line, totalDelay);
      totalDelay += stepDelay + Math.random() * 180;
    });

    // posle poslednje linije, zatvori overlay
    const closeDelay = totalDelay + 600;
    const tClose = setTimeout(() => {
      closeOverlay();
    }, closeDelay);
    timers.push(tClose);
  }

  function closeOverlay() {
    overlay.classList.add('hidden');
    timers.forEach(t => clearTimeout(t));
    timers = [];
    try {
      localStorage.setItem('gmBootSeen', '1');
    } catch (e) {}
    setTimeout(() => {
      overlay.remove();
    }, 380);
  }

  skipBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeOverlay();
  });

  // na klik bilo gde u terminalu – instant close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeOverlay();
    }
  });

  runSequence();
});
// === SYSTEM STRIP TICKER (PROJECTS) ===
document.addEventListener('DOMContentLoaded', () => {
  const tickerContainers = document.querySelectorAll('.system-strip .ticker');
  tickerContainers.forEach(container => {
    const span1 = container.children[0];
    const span2 = container.children[1];
    let offset = 0;
    function tick() {
      offset -= 1;
      if (offset <= -span1.offsetWidth) {
        offset = 0;
      }
      container.style.transform = `translateX(${offset}px)`;
      requestAnimationFrame(tick);
    }
    tick();
  });
});
// === VIDEOS PROCESSED COUNTER ===
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('video-counter');
  if (!el) return;

  const target = 137;       // broj koji hoćeš da “glumi”
  const duration = 1800;    // trajanje animacije u ms
  let started = false;

  function format(n) {
    return String(n).padStart(3, '0');
  }

  function startCounter() {
    if (started) return;
    started = true;

    const startTime = performance.now();

    function tick(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.floor(progress * target);

      el.textContent = format(value);

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCounter();
          io.disconnect();
        }
      });
    }, { threshold: 0.4 });

    io.observe(el);
  } else {
    // fallback: startuje posle kratkog delay-a
    setTimeout(startCounter, 600);
  }
});
// === AUDIT BUBBLE (SERVICES + PROJECTS) ===
document.addEventListener('DOMContentLoaded', () => {
  const bubble = document.querySelector('.audit-bubble');
  if (!bubble) return;
  bubble.addEventListener('click', (e) => {
    // možeš dodati praćenje klikova ovde ako želiš
  });
});
// === GOLUBMEDIA OPS WIDGET (fixed metrics) ===
document.addEventListener("DOMContentLoaded", () => {
  const TARGET_QUEUE = 4;   // koliko videa hoćeš
  const TARGET_LOAD  = 60;  // procenat loada
  const TARGET_MODE  = "MEEEH";

  // ako već postoji ručno ubačen widget, nemoj da praviš novi
  if (document.querySelector(".ops-widget")) return;

  const widget = document.createElement("div");
  widget.className = "ops-widget";
  widget.innerHTML = `
    <div class="ops-header">
      <div class="ops-left">
        <span class="ops-dot"></span>
        <span class="ops-title">GOLUBMEDIA OPS</span>
      </div>
      <button class="ops-toggle" type="button" aria-label="Minimize widget">−</button>
    </div>
    <div class="ops-body">
      <div class="ops-row">
        <span class="ops-label">QUEUE</span>
        <span class="ops-value" data-metric="queue">0 videos</span>
      </div>
      <div class="ops-row">
        <span class="ops-label">LOAD</span>
        <span class="ops-value" data-metric="load">0%</span>
      </div>
      <div class="ops-row">
        <span class="ops-label">MODE</span>
        <span class="ops-value" data-metric="mode">${TARGET_MODE}</span>
      </div>
    </div>
  `;
  document.body.appendChild(widget);

  const queueEl = widget.querySelector('[data-metric="queue"]');
  const loadEl  = widget.querySelector('[data-metric="load"]');
  const toggle  = widget.querySelector(".ops-toggle");

  // toggle za minimizaciju
  if (toggle) {
    toggle.addEventListener("click", () => {
      widget.classList.toggle("ops-collapsed");
      toggle.textContent = widget.classList.contains("ops-collapsed") ? "+" : "−";
    });
  }

  // helper za animaciju 0 → target
  function animateValue(el, start, end, duration, formatFn) {
    const startTime = performance.now();

    function frame(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const value = Math.round(start + (end - start) * progress);
      el.textContent = formatFn(value);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    }

    requestAnimationFrame(frame);
  }

  // animacije – jednom na load
  if (queueEl) {
    animateValue(queueEl, 0, TARGET_QUEUE, 800, v => `${v} videos`);
  }

  if (loadEl) {
    animateValue(loadEl, 0, TARGET_LOAD, 800, v => `${v}%`);
  }
});




