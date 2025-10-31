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
// === AMBIENT SOUND TOGGLE ===
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('soundToggle');
  const audio = document.getElementById('ambientSound');
  if (!btn || !audio) return;

  let playing = false;
  btn.addEventListener('click', () => {
    if (playing) {
      audio.pause();
      btn.textContent = '🔊';
    } else {
      audio.play();
      btn.textContent = '🔇';
    }
    playing = !playing;
  });
});




