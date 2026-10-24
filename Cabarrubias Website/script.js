// Mobile navigation
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.textContent = isOpen ? '✕' : '☰';
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.textContent = '☰';
  }));
}

// Highlight the section currently in view
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  }), { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(section => observer.observe(section));
}

// Real-time local clock; uses the visitor's device timezone.
const clockTime = document.getElementById('live-clock-time');
const clockDate = document.getElementById('live-clock-date');
function updateClock() {
  const now = new Date();
  if (clockTime) clockTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  if (clockDate) clockDate.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}
updateClock();
window.setInterval(updateClock, 1000);

// Clickable full-size image preview with previous/next controls.
const lightbox = document.getElementById('photo-lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const lightboxCaption = document.getElementById('lightbox-caption');
const lightboxCount = document.getElementById('lightbox-count');
const closeButton = lightbox?.querySelector('.lightbox-close');
const previousButton = lightbox?.querySelector('.lightbox-prev');
const nextButton = lightbox?.querySelector('.lightbox-next');
let photoItems = [];
let currentPhotoIndex = 0;
let previousFocus = null;

function collectPhotos() {
  photoItems = [...document.querySelectorAll('main img')].filter(img => !img.hidden && img.complete && img.naturalWidth > 0 && !img.closest('.lightbox'));
  photoItems.forEach((img, index) => {
    img.classList.add('clickable-photo');
    img.setAttribute('tabindex', '0');
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Open photo preview: ${img.alt || `Photo ${index + 1}`}`);
  });
}
function showPhoto(index) {
  if (!photoItems.length || !lightbox) return;
  currentPhotoIndex = (index + photoItems.length) % photoItems.length;
  const img = photoItems[currentPhotoIndex];
  lightboxImage.src = img.currentSrc || img.src;
  lightboxImage.alt = img.alt || 'Portfolio photo';
  lightboxCaption.textContent = img.alt || 'Portfolio photo';
  lightboxCount.textContent = `${currentPhotoIndex + 1} / ${photoItems.length}`;
}
function openLightbox(img) {
  collectPhotos();
  currentPhotoIndex = photoItems.indexOf(img);
  if (currentPhotoIndex < 0) return;
  previousFocus = img;
  showPhoto(currentPhotoIndex);
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  closeButton?.focus();
}
function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  lightboxImage.src = '';
  previousFocus?.focus?.();
}
document.addEventListener('click', event => {
  const img = event.target.closest('main img');
  if (img && !img.hidden && img.complete && img.naturalWidth > 0) openLightbox(img);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    const img = event.target.closest?.('main img.clickable-photo');
    if (img) { event.preventDefault(); openLightbox(img); }
  }
  if (!lightbox?.classList.contains('is-open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') showPhoto(currentPhotoIndex - 1);
  if (event.key === 'ArrowRight') showPhoto(currentPhotoIndex + 1);
});
closeButton?.addEventListener('click', closeLightbox);
previousButton?.addEventListener('click', () => showPhoto(currentPhotoIndex - 1));
nextButton?.addEventListener('click', () => showPhoto(currentPhotoIndex + 1));
lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
document.querySelectorAll('main img').forEach(img => {
  if (img.complete) collectPhotos();
  else img.addEventListener('load', collectPhotos, { once: true });
});
