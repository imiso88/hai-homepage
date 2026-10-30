(() => {
  const hero = document.querySelector('.hero');
  const toggle = hero?.querySelector('.hero-motion-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const paused = hero.classList.toggle('is-motion-paused');
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.textContent = paused ? '배경 움직임 재생하기' : '배경 움직임 멈추기';
  });
})();
