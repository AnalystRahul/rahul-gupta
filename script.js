/* ============================================================
   Trinity Chambers – Main JavaScript
   ============================================================ */

/* ============================================================
   DATA LOADER — fetches data.json and injects dynamic content
   ============================================================ */
(async function () {
  let d;
  try {
    const r = await fetch('data.json?v=' + Date.now());
    if (r.ok) d = await r.json();
  } catch (e) { return; }
  if (!d) return;

  /* Announcement banner */
  if (d.announcement) {
    const banner = document.querySelector('.easter-banner');
    if (banner) {
      if (!d.announcement.active) {
        banner.style.display = 'none';
      } else if (d.announcement.html) {
        const closeBtn = banner.querySelector('.banner-close');
        banner.innerHTML = d.announcement.html;
        if (closeBtn) banner.appendChild(closeBtn);
      }
    }
  }

  /* Barristers grid */
  if (d.barristers && document.getElementById('barristers-grid')) {
    const grid      = document.getElementById('barristers-grid');
    const noResults = document.getElementById('no-results');
    grid.querySelectorAll('.barrister-card,.barristers-loading').forEach(function (c) { c.remove(); });
    d.barristers.forEach(function (b) {
      const card = document.createElement('div');
      card.className = 'barrister-card';
      card.dataset.name      = b.name;
      card.dataset.expertise = b.expertise;
      card.dataset.call      = b.callRange;
      card.dataset.kc        = String(b.kc);
      card.innerHTML =
        '<div class="barrister-img">' + b.name.charAt(0) + '</div>' +
        '<div class="barrister-info">' +
          '<div class="barrister-name">' + b.name + (b.kc ? ' KC' : '') + '</div>' +
          (b.kc ? '<span class="barrister-kc">K.C.</span>' : '') +
          '<div class="barrister-speciality">' + b.speciality + '</div>' +
          '<div class="barrister-call">Called: ' + b.yearCalled + '</div>' +
        '</div>';
      if (noResults) grid.insertBefore(card, noResults);
      else grid.appendChild(card);
    });
    window._tcBios     = {};
    window._tcChambers = {};
    d.barristers.forEach(function (b) {
      window._tcBios[b.name]     = b.bio;
      window._tcChambers[b.name] = b.chambers;
    });
  }

  /* Clerks grid */
  if (d.clerks) {
    const grid = document.querySelector('.clerks-grid');
    if (grid) {
      grid.innerHTML = d.clerks.map(function (c) {
        return '<div class="clerk-card">' +
          '<div class="clerk-avatar">' + c.initial + '</div>' +
          '<h4>' + c.name + '</h4>' +
          '<p>' + c.title + '</p>' +
          '<a href="tel:' + c.tel + '">' + c.phone + '</a>' +
          '</div>';
      }).join('');
    }
  }

  /* News items — expose for carousel */
  if (d.news && d.news.length) window._tcNewsData = d.news;

  /* ---- HOME: hero slides + testimonials ---- */
  if (d.pages && d.pages.home) {
    if (d.pages.home.heroSlides) {
      window._tcHeroSlides = d.pages.home.heroSlides;
      if (window._tcHeroRefresh) window._tcHeroRefresh();
    }
    if (d.pages.home.testimonials) {
      window._tcTestimonials = d.pages.home.testimonials;
      if (window._tcTestimonialsRefresh) window._tcTestimonialsRefresh();
    }
  }

  /* ---- ABOUT page ---- */
  if (d.pages && d.pages.about) {
    var ab = d.pages.about;
    /* Intro paragraphs */
    var aboutIntro = document.getElementById('about-intro');
    if (aboutIntro && ab.introParas) {
      aboutIntro.innerHTML = ab.introParas.map(function(p) { return '<p>' + p + '</p>'; }).join('');
    }
    /* Facilities list */
    var facList = document.getElementById('about-facilities');
    if (facList && ab.facilities) {
      facList.innerHTML = ab.facilities.map(function(f) { return '<li>' + f + '</li>'; }).join('');
    }
    /* Policies accordion */
    var acc = document.getElementById('policies-accordion');
    if (acc && ab.policies) {
      acc.innerHTML = ab.policies.map(function(p, i) {
        var id = 'policy-' + (i + 1);
        return '<div class="accordion-item">' +
          '<button class="accordion-btn" aria-expanded="false" aria-controls="' + id + '">' +
            p.title + '<span class="acc-icon">+</span>' +
          '</button>' +
          '<div class="accordion-body" id="' + id + '" role="region">' +
            '<div class="accordion-body-inner">' + p.content + '</div>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  }

  /* ---- EXPERTISE page ---- */
  if (d.pages && d.pages.expertise && d.pages.expertise.cards) {
    var expGrid = document.getElementById('expertise-cards');
    if (expGrid) {
      expGrid.innerHTML = d.pages.expertise.cards.map(function(c) {
        return '<div class="expertise-card">' +
          '<h3>' + c.title + '</h3>' +
          '<p>' + c.description + '</p>' +
          '<a href="' + (c.link || 'contact.html') + '" class="expertise-card-link">FIND A BARRISTER &rsaquo;</a>' +
        '</div>';
      }).join('');
    }
  }

  /* ---- KNOWLEDGE page ---- */
  if (d.pages && d.pages.knowledge) {
    var kn = d.pages.knowledge;
    var supEl = document.getElementById('knowledge-support-text');
    if (supEl && kn.supportingText) supEl.textContent = kn.supportingText;
    var artGrid = document.getElementById('article-grid');
    if (artGrid && kn.articles && kn.articles.length) {
      artGrid.innerHTML = kn.articles.map(function(a) {
        return '<article class="article-card" data-category="' + a.category + '">' +
          '<div class="article-img" style="background:linear-gradient(135deg,#1a2744 40%,#2abed4 100%);"></div>' +
          '<div class="article-body">' +
            '<span class="article-tag">' + a.category + '</span>' +
            '<h3>' + a.title + '</h3>' +
            '<p>' + a.excerpt + '</p>' +
            '<div class="article-meta">' + a.date + ' &bull; ' + a.author + '</div>' +
          '</div>' +
        '</article>';
      }).join('');
    }
  }
})();

/* ---- Easter banner close ---- */
document.querySelector('.easter-banner .banner-close')?.addEventListener('click', function () {
  this.closest('.easter-banner').style.display = 'none';
});

/* ---- Mobile hamburger menu ---- */
const hamburger = document.getElementById('hamburger');
const mainNav   = document.getElementById('main-nav');
const siteHeader = document.querySelector('.site-header');

function setNavTop() {
  if (mainNav && siteHeader) {
    mainNav.style.top = siteHeader.getBoundingClientRect().bottom + 'px';
  }
}

hamburger?.addEventListener('click', function () {
  const open = mainNav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(open));
  if (open) setNavTop();
});
mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});

/* ---- Highlight active nav link ---- */
(function () {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) {
      a.style.background = 'rgba(42,190,212,0.18)';
      a.style.color = '#2abed4';
    }
  });
})();

/* ============================================================
   COOKIE SETTINGS PANEL
   ============================================================ */
(function () {
  const panel     = document.getElementById('cookie-panel');
  const openBtn   = document.getElementById('cookie-btn');
  const acceptBtn = document.getElementById('cookie-accept');
  const essBtn    = document.getElementById('cookie-essential');
  const closeBtn  = document.getElementById('cookie-close');
  if (!panel || !openBtn) return;

  function openPanel()  { panel.classList.add('open'); }
  function closePanel() { panel.classList.remove('open'); }

  openBtn.addEventListener('click', openPanel);
  closeBtn?.addEventListener('click', closePanel);
  acceptBtn?.addEventListener('click', function () {
    localStorage.setItem('tc-cookies', 'all');
    closePanel();
  });
  essBtn?.addEventListener('click', function () {
    localStorage.setItem('tc-cookies', 'essential');
    closePanel();
  });

  // Auto-show on first visit
  if (!localStorage.getItem('tc-cookies')) {
    setTimeout(openPanel, 1500);
  }
})();

/* ============================================================
   HERO SLIDESHOW
   ============================================================ */
(function () {
  const heroSection = document.getElementById('hero-section');
  if (!heroSection) return;

  const badge      = document.getElementById('hero-badge');
  const title      = document.getElementById('hero-title');
  const text       = document.getElementById('hero-text');
  const btnPrimary = document.getElementById('hero-btn-primary');
  const btnSec     = document.getElementById('hero-btn-secondary');
  const exploreBtn = document.getElementById('hero-btn-explore');
  const prevBtn    = document.getElementById('hero-prev');
  const nextBtn    = document.getElementById('hero-next');
  const dots       = document.querySelectorAll('#hero-dots .dot');
  const content    = heroSection.querySelector('.hero-content');

  const slides = (window._tcHeroSlides || [
    {
      badge: 'EXPERT',
      title: 'LEGAL ADVICE &amp;<br>REPRESENTATION',
      text: 'With Chambers in Newcastle, Middlesbrough and Leeds, the experienced and approachable barristers offer the most appropriate and cost-effective representation for your needs.',
      bg: "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1400&q=80') center/cover no-repeat",
      primaryLabel: 'LEARN MORE', primaryHref: 'about.html',
      secLabel: 'GET IN TOUCH',  secHref: 'contact.html',
      exploreHref: 'expertise.html'
    },
    {
      badge: 'TRUSTED',
      title: 'BARRISTERS OF<br>THE HIGHEST CALIBRE',
      text: 'Regularly recommended in the Legal 500 and Chambers &amp; Partners, our silks and junior barristers handle cases of the highest complexity across the UK.',
      bg: "linear-gradient(135deg, #0d1a35 0%, #1a3a5c 100%)",
      primaryLabel: 'OUR BARRISTERS', primaryHref: 'barristers.html',
      secLabel: 'OUR EXPERTISE',    secHref: 'expertise.html',
      exploreHref: 'barristers.html'
    },
    {
      badge: 'ACROSS THE NORTH',
      title: 'SERVING CLIENTS<br>ACROSS THE UK',
      text: 'From complex commercial disputes and serious crime to family matters and public law, Trinity Chambers has the depth and breadth to handle your case.',
      bg: "linear-gradient(135deg, #1a2744 0%, #1a5060 100%)",
      primaryLabel: 'OUR EXPERTISE', primaryHref: 'expertise.html',
      secLabel: 'JOIN US',          secHref: 'join.html',
      exploreHref: 'knowledge.html'
    }
  ]);

  let current = 0;
  let timer;

  function goTo(idx, skipAnim) {
    if (!skipAnim) {
      content.classList.add('fade');
    }
    setTimeout(function () {
      const s = slides[idx];
      heroSection.style.background = s.bg;
      badge.textContent       = s.badge;
      title.innerHTML         = s.title;
      text.innerHTML          = s.text;
      btnPrimary.textContent  = s.primaryLabel;
      btnPrimary.href         = s.primaryHref;
      btnSec.textContent      = s.secLabel;
      btnSec.href             = s.secHref;
      if (exploreBtn) exploreBtn.href = s.exploreHref;
      dots.forEach((d, i) => d.classList.toggle('active', i === idx));
      current = idx;
      if (!skipAnim) content.classList.remove('fade');
    }, skipAnim ? 0 : 220);
  }

  function next() { goTo((current + 1) % slides.length); }
  function prev() { goTo((current - 1 + slides.length) % slides.length); }

  function startTimer() { timer = setInterval(next, 5000); }
  function resetTimer()  { clearInterval(timer); startTimer(); }

  nextBtn?.addEventListener('click', function () { next(); resetTimer(); });
  prevBtn?.addEventListener('click', function () { prev(); resetTimer(); });
  dots.forEach((d, i) => {
    d.addEventListener('click', function () { goTo(i); resetTimer(); });
  });

  goTo(0, true);
  startTimer();

  window._tcHeroRefresh = function () {
    var ns = window._tcHeroSlides;
    if (!ns) return;
    slides.splice(0, slides.length);
    ns.forEach(function (s) { slides.push(s); });
    clearInterval(timer);
    goTo(0, true);
    startTimer();
  };
})();

/* ============================================================
   HOMEPAGE SEARCH → Barristers page
   ============================================================ */
(function () {
  const btn = document.getElementById('home-search-btn');
  if (!btn) return;
  btn.addEventListener('click', function () {
    const exp  = document.getElementById('home-exp')?.value  || '';
    const call = document.getElementById('home-call')?.value || '';
    const name = document.getElementById('home-name')?.value || '';
    const kc   = document.getElementById('home-kc')?.checked ? '1' : '';
    const params = new URLSearchParams();
    if (exp)  params.set('exp',  exp);
    if (call) params.set('call', call);
    if (name) params.set('name', name);
    if (kc)   params.set('kc',   '1');
    window.location.href = 'barristers.html' + (params.toString() ? '?' + params.toString() : '');
  });
  // Also trigger on Enter in the name input
  document.getElementById('home-name')?.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') btn.click();
  });
})();

/* ============================================================
   NEWS CAROUSEL (homepage)
   ============================================================ */
(function () {
  const dots    = document.querySelectorAll('#news-dots .dot');
  if (!dots.length) return;

  const newsItems = (window._tcNewsData || [
    {
      date:    '27th Mar 2025',
      title:   "Trinity's Pupil Barristers Start Second Six of Pupillage",
      excerpt: "Trinity Chambers' current pupil barristers will shortly be accepting instructions on their own cases as they commence the second half of their pupillage.",
      href:    'knowledge.html'
    },
    {
      date:    '1st Apr 2025',
      title:   'Managing Cancer in the Workplace: A Legal Guide for Employers',
      excerpt: 'Helen Hogben examines the legal obligations employers face when an employee receives a cancer diagnosis, including reasonable adjustments and disability discrimination.',
      href:    'knowledge.html'
    },
    {
      date:    '18th Mar 2025',
      title:   'The Sentencing Council: New Guidelines for Serious Violence Offences',
      excerpt: "Michael Foster KC reviews the Sentencing Council's updated guidelines for serious violence, exploring their impact on sentencing outcomes.",
      href:    'knowledge.html'
    },
    {
      date:    '10th Mar 2025',
      title:   'Asylum Seekers and the Safety of Third Countries: Post-Rwanda Update',
      excerpt: 'Emma Thompson provides an update on the legal landscape for asylum seekers following the Supreme Court ruling and subsequent legislative changes.',
      href:    'knowledge.html'
    },
    {
      date:    '5th Mar 2025',
      title:   'Fundamental Dishonesty: Recent Developments and Practical Implications',
      excerpt: 'Thomas Clarke KC analyses recent court decisions on fundamental dishonesty under s.57 of the Criminal Justice and Courts Act 2015.',
      href:    'knowledge.html'
    },
    {
      date:    '28th Feb 2025',
      title:   'The Planning and Infrastructure Bill: Key Changes for Developers',
      excerpt: 'Robert Davies examines the most significant provisions of the Planning and Infrastructure Bill 2025 and what they mean for developers.',
      href:    'knowledge.html'
    }
  ]);

  let current = 0;
  let timer;

  const dateEl    = document.getElementById('news-date');
  const titleEl   = document.getElementById('news-title');
  const excerptEl = document.getElementById('news-excerpt');
  const linkEl    = document.getElementById('news-link');

  function goTo(idx) {
    const item = newsItems[idx];
    if (dateEl)    dateEl.textContent    = item.date;
    if (titleEl)   titleEl.textContent   = item.title;
    if (excerptEl) excerptEl.textContent = item.excerpt;
    if (linkEl)    linkEl.href           = item.href;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
    current = idx;
  }

  dots.forEach((d, i) => {
    d.addEventListener('click', function () {
      goTo(i);
      clearInterval(timer);
      timer = setInterval(() => goTo((current + 1) % newsItems.length), 4000);
    });
  });

  timer = setInterval(() => goTo((current + 1) % newsItems.length), 4000);
})();

/* ============================================================
   TESTIMONIALS CAROUSEL (homepage)
   ============================================================ */
(function () {
  const dots = document.querySelectorAll('#testimonial-dots .dot');
  if (!dots.length) return;

  const testimonials = (window._tcTestimonials || [
    {
      quote:  '"An excellent chambers and clerking service: they are always attentive and can offer a very wide range of expertise. The clients are very approachable and user-friendly, readily available and efficient with invoicing. You really feel you know where you stand with them."',
      source: 'Chambers &amp; Partners'
    },
    {
      quote:  '"Trinity Chambers is a genuinely impressive set. The clerking is excellent and the barristers are consistently of the highest calibre. Instructing them is always a pleasure — they are responsive, commercial and thoroughly prepared."',
      source: 'Legal 500, 2025'
    }
  ]);

  const quoteEl  = document.getElementById('testimonial-quote');
  const sourceEl = document.getElementById('testimonial-source');

  function goTo(idx) {
    const t = testimonials[idx];
    if (quoteEl)  quoteEl.innerHTML  = t.quote;
    if (sourceEl) sourceEl.innerHTML = t.source;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  window._tcTestimonialsRefresh = function () {
    var nt = window._tcTestimonials;
    if (!nt) return;
    testimonials.splice(0, testimonials.length);
    nt.forEach(function (t) { testimonials.push(t); });
    goTo(0);
  };
})();

/* ============================================================
   BARRISTERS PAGE – Search / Filter + URL Params + Modal
   ============================================================ */
(function () {
  const grid = document.getElementById('barristers-grid');
  if (!grid) return;

  const cards     = Array.from(grid.querySelectorAll('.barrister-card'));
  const noResults = document.getElementById('no-results');
  const countEl   = document.getElementById('results-count');
  const selExp    = document.getElementById('filter-expertise');
  const selCall   = document.getElementById('filter-call');
  const inputName = document.getElementById('filter-name');
  const chkKC     = document.getElementById('filter-kc');
  const resetBtn  = document.getElementById('reset-filters');

  /* Pre-fill from URL params (homepage search) */
  const params = new URLSearchParams(window.location.search);
  if (params.get('exp'))  selExp.value    = params.get('exp');
  if (params.get('call')) selCall.value   = params.get('call');
  if (params.get('name')) inputName.value = params.get('name');
  if (params.get('kc'))   chkKC.checked   = true;

  function filterCards() {
    const exp  = selExp.value.toLowerCase();
    const call = selCall.value;
    const name = inputName.value.toLowerCase().trim();
    const kc   = chkKC.checked;
    let visible = 0;

    cards.forEach(card => {
      const cardExp  = (card.dataset.expertise || '').toLowerCase();
      const cardCall =  card.dataset.call || '';
      const cardName = (card.dataset.name  || '').toLowerCase();
      const cardKC   =  card.dataset.kc === 'true';

      const show = (!exp  || cardExp.includes(exp))
                && (!call || cardCall === call)
                && (!name || cardName.includes(name))
                && (!kc   || cardKC);

      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    noResults.style.display = visible === 0 ? 'block' : 'none';
    if (countEl) countEl.textContent = visible + ' barrister' + (visible !== 1 ? 's' : '') + ' found';
  }

  selExp.addEventListener('change', filterCards);
  selCall.addEventListener('change', filterCards);
  inputName.addEventListener('input', filterCards);
  chkKC.addEventListener('change', filterCards);
  resetBtn?.addEventListener('click', function () {
    selExp.value = ''; selCall.value = '';
    inputName.value = ''; chkKC.checked = false;
    filterCards();
  });
  filterCards();

  /* --- Barrister Modal --- */
  const bios = {
    'Richard Blackwood': 'Richard is one of the leading silks on the Northern Circuit in Administrative and Public Law. He has appeared in the Supreme Court, Court of Appeal and High Court in numerous landmark judicial review cases. His practice covers all aspects of public law including local government, planning, education, and human rights.',
    'David Morrison':    'David is a highly regarded silk with a broad commercial practice encompassing company law, shareholder disputes, banking and finance, insolvency and professional negligence. He is known for his strategic approach and tenacious advocacy.',
    'James Henderson':   'James is recognised as one of the leading employment silks in the North of England. He acts for both employers and employees in the Employment Tribunal, EAT and appellate courts, with particular expertise in discrimination, whistleblowing and injunctive relief.',
    'Michael Foster':    'Michael is a highly experienced criminal silk with over 25 years of practice in the most serious and complex criminal cases. He is regularly instructed in murder, serious fraud, drug conspiracies and cases of national importance.',
    'Sarah Mitchell':    'Sarah is a leading criminal silk with particular expertise in cases involving serious sexual offences, historic abuse, and complex multi-defendant cases. She is known for her careful preparation and commanding court presence.',
    'Thomas Clarke':     'Thomas is one of the most experienced personal injury and clinical negligence silks on the circuit. He is regularly instructed in catastrophic injury claims and complex clinical negligence cases involving significant financial value.',
    'Helen Hogben':      'Helen has a busy employment law practice acting predominantly for claimants in cases of discrimination, whistleblowing and unfair dismissal. She is particularly known for her expertise in disability discrimination and equality law.',
    'Robert Davies':     'Robert is an experienced planning barrister regularly appearing at planning inquiries, hearings and in the High Court. He acts for developers, landowners and local planning authorities across a wide range of development types.',
    'Andrew Patterson':  'Andrew has a broad property practice covering landlord and tenant, boundary disputes, easements, covenants, co-ownership and all aspects of residential and commercial property litigation.',
    'Catherine Hughes':  'Catherine specialises in public law children cases, representing local authorities, parents and children. She is regularly instructed in complex care proceedings and cases involving non-accidental injury.',
    'Rebecca Walsh':     'Rebecca has a busy family finance practice, acting in financial remedy proceedings following divorce. She is experienced in cases involving business assets, trusts, pensions and international elements.',
    'Laura Jenkins':     'Laura is a specialist Court of Protection practitioner acting in welfare and property/financial affairs proceedings involving adults who lack mental capacity.',
    'Priya Sharma':      'Priya has developed a strong employment law practice acting for both claimants and respondents across all areas of employment law with particular expertise in race, sex and disability discrimination.',
    'Emma Thompson':     'Emma has a busy immigration practice covering asylum, human rights and deportation appeals. She is regularly instructed in complex cases before the First-tier and Upper Tribunals.',
    'Jason Patel':       'Jason acts in a wide range of immigration matters including asylum, leave to remain, deportation and nationality cases. He is known for his thorough preparation and clear written submissions.',
    'Sophie Williams':   'Sophie has a developing practice in education law, acting for schools, local authorities and parents in exclusion appeals, SEN matters and employment disputes in the education sector.'
  };
  const chambers = {
    'Richard Blackwood': 'Newcastle', 'David Morrison': 'Leeds',
    'James Henderson': 'Newcastle',   'Michael Foster': 'Newcastle',
    'Sarah Mitchell': 'Leeds',        'Thomas Clarke': 'Middlesbrough',
    'Helen Hogben': 'Newcastle',      'Robert Davies': 'Leeds',
    'Andrew Patterson': 'Newcastle',  'Catherine Hughes': 'Newcastle',
    'Rebecca Walsh': 'Leeds',         'Laura Jenkins': 'Middlesbrough',
    'Priya Sharma': 'Newcastle',      'Emma Thompson': 'Leeds',
    'Jason Patel': 'Leeds',           'Sophie Williams': 'Newcastle'
  };

  /* Create modal once */
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'barrister-modal';
  modal.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-name">
      <div class="modal-header">
        <div class="modal-avatar" id="modal-avatar">B</div>
        <div class="modal-header-info">
          <h2 id="modal-name">Barrister Name</h2>
          <span id="modal-kc-badge"></span>
        </div>
        <button class="modal-close" id="modal-close" aria-label="Close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="modal-meta">
          <div class="modal-meta-item"><strong>Speciality</strong><span id="modal-spec">—</span></div>
          <div class="modal-meta-item"><strong>Year of Call</strong><span id="modal-call">—</span></div>
          <div class="modal-meta-item"><strong>Chambers</strong><span id="modal-chambers">—</span></div>
        </div>
        <p id="modal-bio">—</p>
      </div>
      <div class="modal-footer">
        <a href="contact.html" class="btn btn-primary">CONTACT CLERKS</a>
        <a href="expertise.html" class="btn btn-dark">VIEW EXPERTISE</a>
      </div>
    </div>`;
  document.body.appendChild(modal);

  function openModal(card) {
    const name  = card.dataset.name;
    const kc    = card.dataset.kc === 'true';
    const spec  = card.querySelector('.barrister-speciality')?.textContent || '';
    const call  = card.querySelector('.barrister-call')?.textContent.replace('Called: ', '') || '';
    const init  = name.charAt(0);

    modal.querySelector('#modal-avatar').textContent   = init;
    modal.querySelector('#modal-name').textContent     = name + (kc ? ' KC' : '');
    modal.querySelector('#modal-kc-badge').innerHTML   = kc ? '<span class="barrister-kc">K.C.</span>' : '';
    modal.querySelector('#modal-spec').textContent     = spec;
    modal.querySelector('#modal-call').textContent     = call;
    modal.querySelector('#modal-chambers').textContent = (window._tcChambers || chambers)[name] || 'Newcastle';
    modal.querySelector('#modal-bio').textContent      = (window._tcBios || bios)[name] || 'Profile details available on request. Please contact our clerks for further information.';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  cards.forEach(card => card.addEventListener('click', () => openModal(card)));
  modal.querySelector('#modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
})();

/* ============================================================
   KNOWLEDGE PAGE – Category Tabs + Subscribe
   ============================================================ */
(function () {
  const tabBtns  = document.querySelectorAll('.knowledge-tabs .tab-btn');
  const articles = document.querySelectorAll('#article-grid .article-card');
  if (!tabBtns.length) return;

  function filterByTab(tab) {
    articles.forEach(art => {
      art.style.display = (tab === 'all' || art.dataset.category === tab) ? '' : 'none';
    });
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => filterByTab(btn.dataset.tab)));

  document.querySelectorAll('.category-list a[data-filter-cat]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      filterByTab(this.dataset.filterCat);
      document.querySelector('.knowledge-section')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* Subscribe */
  const subInput = document.querySelector('.knowledge-sidebar .search-input[type="email"]');
  const subBtn   = document.querySelector('.knowledge-sidebar .btn-dark');
  if (subBtn && subInput) {
    subBtn.addEventListener('click', function () {
      if (!subInput.value.trim() || !subInput.value.includes('@')) {
        subInput.style.borderColor = '#e74c3c';
        subInput.focus();
        return;
      }
      subInput.style.borderColor = '';
      let msg = subInput.parentElement.querySelector('.subscribe-success');
      if (!msg) {
        msg = document.createElement('div');
        msg.className = 'subscribe-success';
        subInput.parentElement.appendChild(msg);
      }
      msg.textContent = 'Thank you! You have been subscribed.';
      msg.style.display = 'block';
      subInput.value = '';
      subBtn.textContent = 'SUBSCRIBED';
      subBtn.disabled = true;
    });
    subInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') subBtn.click();
    });
  }
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

  /* Highlight invalid fields on blur */
  form.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('blur', function () {
      this.style.borderColor = this.value.trim() ? '' : '#e74c3c';
    });
    field.addEventListener('input', function () {
      if (this.value.trim()) this.style.borderColor = '';
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let valid = true;
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#e74c3c';
        valid = false;
      }
    });
    if (!valid) {
      form.querySelector('[required]').focus();
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'SENDING…';
    btn.disabled = true;

    setTimeout(function () {
      form.reset();
      form.querySelectorAll('input,select,textarea').forEach(f => f.style.borderColor = '');
      btn.textContent = 'SEND MESSAGE';
      btn.disabled = false;
      if (success) {
        success.style.display = 'block';
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        setTimeout(() => { success.style.display = 'none'; }, 6000);
      }
    }, 900);
  });
})();

/* ============================================================
   SMOOTH SCROLL for in-page anchor links
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function (e) {
    const id = this.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ============================================================
   ACCORDION
   ============================================================ */
(function () {
  document.querySelectorAll('.accordion-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const expanded = this.getAttribute('aria-expanded') === 'true';
      const bodyId   = this.getAttribute('aria-controls');
      const body     = bodyId ? document.getElementById(bodyId) : this.nextElementSibling;

      // Close all siblings in same list
      const list = this.closest('.accordion-list');
      if (list) {
        list.querySelectorAll('.accordion-btn').forEach(function (b) {
          if (b !== btn) {
            b.setAttribute('aria-expanded', 'false');
            const id = b.getAttribute('aria-controls');
            const sib = id ? document.getElementById(id) : b.nextElementSibling;
            if (sib) sib.style.maxHeight = '0';
          }
        });
      }

      if (expanded) {
        this.setAttribute('aria-expanded', 'false');
        if (body) body.style.maxHeight = '0';
      } else {
        this.setAttribute('aria-expanded', 'true');
        if (body) body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });
})();
