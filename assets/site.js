// Shared by every page. Loaded in <head> so the theme is set before the page paints.

// Theme: follow system by default; a click overrides and is remembered.
const root = document.documentElement;
const mq = window.matchMedia('(prefers-color-scheme: dark)');
let savedTheme = null;
try { savedTheme = localStorage.getItem('theme'); } catch (e) {}
function applyTheme() {
  const active = savedTheme || (mq.matches ? 'dark' : 'light');
  if (savedTheme) root.setAttribute('data-theme', savedTheme); else root.removeAttribute('data-theme');
  root.setAttribute('data-active', active);
}
applyTheme();
mq.addEventListener('change', applyTheme);

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('themeToggle').addEventListener('click', () => {
    savedTheme = root.getAttribute('data-active') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', savedTheme); } catch (e) {}
    applyTheme();
  });

  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  // Show the name in the nav only once the big heading has scrolled out of view.
  const navName = document.getElementById('navName');
  const hero = document.getElementById('heroName');
  if (navName && hero) {
    new IntersectionObserver(([e]) => navName.classList.toggle('show', !e.isIntersecting),
      { rootMargin: '-60px 0px 0px 0px' }).observe(hero);
  } else if (navName) {
    navName.classList.add('show');
  }
});
