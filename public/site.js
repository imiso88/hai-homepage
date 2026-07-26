// 휴먼AI융합교육원 · 공통 스크립트
(function () {
  // 모바일 네비 토글 (aria-expanded로 열림 상태 안내)
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    if (!links.id) links.id = 'primary-nav';
    toggle.setAttribute('aria-controls', links.id);
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // 스크롤 등장 애니메이션 (IntersectionObserver 미지원/실패 시 콘텐츠는 그대로 표시)
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    reveals.forEach(function (el) { el.classList.add('pre'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  // 카운터 애니메이션 (숫자는 HTML 원문에도 존재; JS는 시각효과만)
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-target'));
    if (isNaN(target)) return;
    var dur = 1400, start = null;
    var suffix = el.getAttribute('data-suffix') || '';
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var val = Math.floor(target * (0.2 + 0.8 * (1 - Math.pow(1 - p, 3))));
      el.textContent = val.toLocaleString('ko-KR') + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString('ko-KR') + suffix;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-target]').forEach(function (el) { cio.observe(el); });
  }

  // FAQ 아코디언
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      var ans = item.querySelector('.faq-a');
      var isOpen = item.classList.contains('open');
      item.classList.toggle('open');
      ans.style.maxHeight = isOpen ? null : ans.scrollHeight + 'px';
    });
  });

  // 문의폼 데모 제출
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var msg = document.getElementById('form-msg');
      if (msg) { msg.style.display = 'block'; form.reset(); msg.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  }

  // MC 사진 슬라이더 (data-imgs="파일1,파일2..." 지정 시 그 파일 사용, 없으면 mc-photo1~N.jpg 자동 감지)
  document.querySelectorAll('.mc-slider').forEach(function (box) {
    var explicit = box.getAttribute('data-imgs');
    if (explicit) {
      var list = explicit.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
      buildSlider(box, list, 5);
      return;
    }
    var total = parseInt(box.getAttribute('data-count') || '5', 10);
    var found = [], checked = 0;
    for (var i = 1; i <= total; i++) probe(i);
    function probe(n) {
      var im = new Image();
      im.onload = function () { found.push(n); tick(); };
      im.onerror = function () { tick(); };
      im.src = 'mc-photo' + n + '.jpg';
    }
    function tick() {
      if (++checked === total) {
        found.sort(function (a, b) { return a - b; });
        buildSlider(box, found.map(function (n) { return 'mc-photo' + n + '.jpg'; }), total);
      }
    }
  });

  function buildSlider(box, srcs, total) {
    if (!srcs.length) {
      box.innerHTML = '<div class="ph">영화제 MC·GV 현장 사진을<br>mc-photo1.jpg ~ mc-photo' + (total || 5) + '.jpg 로 넣으면 여기에 표시됩니다</div>';
      return;
    }
    var idx = 0, timer = null;
    box.innerHTML = '';
    srcs.forEach(function (src, i) {
      var s = document.createElement('div'); s.className = 'slide' + (i === 0 ? ' on' : '');
      var im = document.createElement('img'); im.src = src; im.alt = 'AI영화제 MC·GV 현장'; im.loading = 'lazy';
      s.appendChild(im); box.appendChild(s);
    });
    if (srcs.length > 1) {
      var prev = mkBtn('prev', '‹'), next = mkBtn('next', '›');
      var dots = document.createElement('div'); dots.className = 'dots';
      srcs.forEach(function (_, i) {
        var d = document.createElement('span');
        if (i === 0) d.className = 'on';
        d.setAttribute('role', 'button');
        d.setAttribute('tabindex', '0');
        d.setAttribute('aria-label', (i + 1) + '번째 사진 보기');
        d.onclick = function () { go(i); };
        d.onkeydown = function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(i); } };
        dots.appendChild(d);
      });
      box.appendChild(prev); box.appendChild(next); box.appendChild(dots);
      prev.onclick = function () { go(idx - 1); }; next.onclick = function () { go(idx + 1); };
      timer = setInterval(function () { go(idx + 1); }, 4500);
      box.addEventListener('mouseenter', function () { if (timer) { clearInterval(timer); timer = null; } });
    }
    function mkBtn(cls, t) { var b = document.createElement('button'); b.type = 'button'; b.className = 'nav ' + cls; b.textContent = t; b.setAttribute('aria-label', cls === 'prev' ? '이전 사진' : '다음 사진'); return b; }
    function go(n) {
      var slides = box.querySelectorAll('.slide'), ds = box.querySelectorAll('.dots span');
      idx = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('on', i === idx); });
      ds.forEach(function (d, i) { d.classList.toggle('on', i === idx); });
    }
  }
})();
