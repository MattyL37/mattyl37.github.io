// Shared behaviour for the sub-pages: header stars + dark mode (default on).
(function () {
  // Scattered stars in the header
  const stars = document.querySelector('.stars');
  if (stars) {
    for (let i = 0; i < 24; i++) {
      const s = document.createElement('span');
      s.className = 'star' + (Math.random() < 0.15 ? ' big' : '');
      s.style.left = Math.random() * 100 + '%';
      s.style.top = Math.random() * 100 + '%';
      s.style.opacity = (0.15 + Math.random() * 0.4).toFixed(2);
      stars.appendChild(s);
    }
  }

  // Dark mode is the default; the choice is shared with the home page
  const btn = document.getElementById('darkModeToggle');
  function setMode(dark) {
    document.body.classList.toggle('dark-mode', dark);
    if (btn) btn.textContent = dark ? 'Light Mode' : 'Dark Mode';
  }
  try { setMode(localStorage.getItem('darkMode') !== '0'); } catch (e) {}
  if (btn) {
    btn.addEventListener('click', () => {
      const dark = !document.body.classList.contains('dark-mode');
      setMode(dark);
      try { localStorage.setItem('darkMode', dark ? '1' : '0'); } catch (e) {}
    });
  }
})();
