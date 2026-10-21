/* 자료 신청 → 이메일 확인 링크 발송. 브라우저 저장값으로 다운로드 권한을 주지 않습니다. */
(function () {
  var FILES = {
    brochure: { label: '교육 소개서', title: '교육 소개서 (PDF · 14쪽)' },
    privacy: { label: '개인정보보호교육 커리큘럼', title: '개인정보보호교육 커리큘럼 (PDF · 8쪽)' },
    method: { label: '교육 방법론', title: '교육 방법론 (PDF · 1쪽)' }
  };
  var gate = document.getElementById('gate'), f = document.getElementById('gate-form');
  if (!gate || !f) return;
  var st = f.querySelector('.rq-status'), btn = f.querySelector('button[type=submit]');
  var fileEl = gate.querySelector('.gate-file'), sent = document.getElementById('gate-sent');
  var sentAddress = document.getElementById('gate-sent-address'), sentStatus = document.getElementById('gate-sent-status');
  var resend = document.getElementById('gate-resend'), edit = document.getElementById('gate-edit');
  var cur = 'brochure', lastFocus, busy = false, until = 0, timer;
  function status(message, good) { st.textContent = message; st.style.color = good ? 'var(--blue)' : '#c0392b'; }
  function tick() {
    var remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
    resend.disabled = busy || remaining > 0;
    resend.textContent = remaining ? remaining + '초 후 다시 보내기' : '확인 메일 다시 보내기';
    if (!remaining) clearInterval(timer);
  }
  function cooldown(seconds) { until = Date.now() + seconds * 1000; clearInterval(timer); tick(); timer = setInterval(tick, 1000); }
  function open(key) {
    if (busy) return;
    cur = FILES[key] ? key : 'brochure'; lastFocus = document.activeElement;
    fileEl.textContent = '신청 자료: ' + FILES[cur].title + ' · 이메일로 보내드리는 확인 링크에서 자료를 받을 수 있습니다.';
    status('', true); sent.hidden = true; f.hidden = false; gate.hidden = false;
    btn.disabled = false; btn.textContent = '이메일로 자료 받기';
    setTimeout(function () { f.elements.organization.focus(); }, 30);
  }
  function close() { gate.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('[data-gate]');
    if (link) { e.preventDefault(); open(link.getAttribute('data-gate')); }
  });
  gate.querySelector('.gate-close').addEventListener('click', close);
  gate.addEventListener('click', function (e) { if (e.target === gate) close(); });
  document.addEventListener('keydown', function (e) {
    if (gate.hidden) return;
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'Tab') {
      var controls = [].filter.call(gate.querySelectorAll('button,input,a[href]'), function (el) { return !el.disabled && el.getClientRects().length && el.tabIndex >= 0; });
      var first = controls[0], last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  function send() {
    if (busy) return;
    busy = true; btn.disabled = true; resend.disabled = true; edit.disabled = true;
    btn.textContent = '확인 메일 보내는 중…'; status('', true); sentStatus.textContent = '';
    var key = cur, email = f.elements.email.value.trim();
    var body = { organization: f.elements.organization.value, name: f.elements.name.value, email: email, resource: key,
      website: f.elements.website.value, consent: f.elements.consent.checked, proposal: f.elements.proposal.checked, marketing: f.elements.marketing.checked };
    fetch('/api/resource-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (response) { return response.json(); })
      .then(function (result) {
        if (!result.ok) {
          if (result.retryAfter) cooldown(result.retryAfter);
          throw Error(result.error || '확인 메일을 보내지 못했습니다. 다시 시도해 주세요.');
        }
        f.hidden = true; sent.hidden = false; sentAddress.textContent = email;
        sentStatus.textContent = '메일이 보이지 않으면 스팸함을 확인해 주세요. 링크는 30분 동안 유효합니다.';
        cooldown(result.retryAfter || 60);
        if (typeof gtag === 'function') gtag('event', 'resource_verification_sent', { file_label: FILES[key].label });
        if (!gate.hidden) document.getElementById('gate-sent-title').focus();
      })
      .catch(function (error) {
        if (sent.hidden) status(error.message || '네트워크 연결을 확인해 주세요.', false);
        else sentStatus.textContent = error.message || '네트워크 연결을 확인해 주세요.';
      })
      .finally(function () { busy = false; edit.disabled = false; btn.disabled = false; btn.textContent = '이메일로 자료 받기'; tick(); });
  }
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!f.reportValidity()) return;
    send();
  });
  resend.addEventListener('click', send);
  edit.addEventListener('click', function () {
    sent.hidden = true; f.hidden = false; status('받으실 이메일 주소를 확인한 뒤 다시 신청해 주세요.', true);
    f.elements.email.focus(); f.elements.email.select();
  });
})();
