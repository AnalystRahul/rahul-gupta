// Easter banner close
document.querySelector('.banner-close')?.addEventListener('click', function () {
  this.closest('.easter-banner').style.display = 'none';
});

// Mobile hamburger menu
const hamburger = document.getElementById('hamburger');
const mainNav   = document.getElementById('main-nav');
hamburger?.addEventListener('click', function () {
  const open = mainNav.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
});

// Close mobile nav when a link is clicked
mainNav?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});
