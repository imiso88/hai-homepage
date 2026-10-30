(() => {
  const hero = document.querySelector('.hero');
  const toggle = hero?.querySelector('.hero-motion-toggle');
  if (!toggle) return;
  const syncButton = () => {
    const paused = hero.classList.contains('is-motion-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? '배경 움직임 재생하기' : '배경 움직임 멈추기';
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const respectMotionPreference = () => {
    hero.classList.remove('is-motion-enabled');
    hero.classList.toggle('is-motion-paused', reducedMotion.matches);
    syncButton();
  };
  respectMotionPreference();
  reducedMotion.addEventListener('change', respectMotionPreference);
  toggle.addEventListener('click', () => {
    hero.classList.add('is-motion-enabled');
    hero.classList.toggle('is-motion-paused');
    syncButton();
  });
})();
