/* ============================================================
   Trinity Chambers – Main JavaScript
   ============================================================ */

// ---- Easter banner close ----
document.querySelector('.banner-close')?.addEventListener('click', function () {
  this.closest('.easter-banner').style.display = 'none';
});

// ---- Mobile hamburger menu ----
const hamburger = document.getElementById('hamburger');
const mainNav   = document.getElementById('main-nav');
hamburger?.addEventListener('click', function () {
  const open = mainNav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});
mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});

// ---- Highlight active nav link ----
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(a => {
    if (a.getAttribute('href') === page) {
      a.style.background = 'rgba(42,190,212,0.2)';
      a.style.color = '#2abed4';
    }
  });
})();

/* ============================================================
   BARRISTERS PAGE – Search & Filter
   ============================================================ */
(function () {
  const grid        = document.getElementById('barristers-grid');
  if (!grid) return;

  const cards       = Array.from(grid.querySelectorAll('.barrister-card'));
  const noResults   = document.getElementById('no-results');
  const countEl     = document.getElementById('results-count');
  const selExp      = document.getElementById('filter-expertise');
  const selCall     = document.getElementById('filter-call');
  const inputName   = document.getElementById('filter-name');
  const chkKC       = document.getElementById('filter-kc');
  const resetBtn    = document.getElementById('reset-filters');

  function filterCards() {
    const exp  = selExp.value.toLowerCase();
    const call = selCall.value;
    const name = inputName.value.toLowerCase().trim();
    const kc   = chkKC.checked;
    let visible = 0;

    cards.forEach(card => {
      const cardExp  = (card.dataset.expertise || '').toLowerCase();
      const cardCall = card.dataset.call || '';
      const cardName = (card.dataset.name || '').toLowerCase();
      const cardKC   = card.dataset.kc === 'true';

      const matchExp  = !exp  || cardExp.includes(exp);
      const matchCall = !call || cardCall === call;
      const matchName = !name || cardName.includes(name);
      const matchKC   = !kc   || cardKC;

      const show = matchExp && matchCall && matchName && matchKC;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    noResults.style.display = visible === 0 ? 'block' : 'none';
    if (countEl) {
      countEl.textContent = visible + ' barrister' + (visible !== 1 ? 's' : '') + ' found';
    }
  }

  selExp.addEventListener('change', filterCards);
  selCall.addEventListener('change', filterCards);
  inputName.addEventListener('input', filterCards);
  chkKC.addEventListener('change', filterCards);

  resetBtn?.addEventListener('click', function () {
    selExp.value = '';
    selCall.value = '';
    inputName.value = '';
    chkKC.checked = false;
    filterCards();
  });

  // Show initial count
  filterCards();
})();

/* ============================================================
   KNOWLEDGE PAGE – Category Tabs
   ============================================================ */
(function () {
  const tabBtns    = document.querySelectorAll('.knowledge-tabs .tab-btn');
  const articles   = document.querySelectorAll('#article-grid .article-card');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      tabBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const tab = this.dataset.tab;

      articles.forEach(art => {
        const cat = art.dataset.category || '';
        art.style.display = (tab === 'all' || cat === tab) ? '' : 'none';
      });
    });
  });

  // Sidebar category links
  document.querySelectorAll('.category-list a[data-filter-cat]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const cat = this.dataset.filterCat;
      tabBtns.forEach(b => {
        b.classList.toggle('active', b.dataset.tab === cat);
      });
      articles.forEach(art => {
        art.style.display = (art.dataset.category === cat) ? '' : 'none';
      });
      document.querySelector('.knowledge-section')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
})();

/* ============================================================
   JOIN US PAGE – Tabs
   ============================================================ */
(function () {
  const joinBtns = document.querySelectorAll('[data-join-tab]');
  if (!joinBtns.length) return;

  joinBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      joinBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      document.querySelectorAll('.join-content').forEach(c => c.classList.remove('active'));
      const target = document.getElementById('tab-' + this.dataset.joinTab);
      if (target) target.classList.add('active');
    });
  });
})();

/* ============================================================
   CONTACT PAGE – Form Submission
   ============================================================ */
(function () {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic validation
    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(field => {
      field.style.borderColor = '';
      if (!field.value.trim()) {
        field.style.borderColor = '#e74c3c';
        valid = false;
      }
    });
    if (!valid) return;

    // Simulate submission
    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'SENDING…';
    btn.disabled = true;

    setTimeout(() => {
      form.reset();
      btn.textContent = 'SEND MESSAGE';
      btn.disabled = false;
      success.style.display = 'block';
      setTimeout(() => { success.style.display = 'none'; }, 6000);
    }, 1000);
  });
})();

/* ============================================================
   SMOOTH SCROLL for anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
