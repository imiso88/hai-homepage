(function () {
  var token = new URLSearchParams(location.hash.slice(1)).get('token');
  var proposal = new URLSearchParams(location.search).get('proposal') === '1';
  // Keep encrypted tokens out of history, analytics, and later referrers. No third-party scripts on this page.
  history.replaceState(null, '', location.pathname);
  var button = document.getElementById('confirm'), status = document.getElementById('status');
  var download = document.getElementById('download');
  if (proposal) {
    document.querySelector('h1').textContent = '이메일을 확인하고 제안서 신청을 완료하세요';
    document.getElementById('intro').textContent = '아래 버튼을 누르면 확인된 이메일로 제안서 신청이 접수됩니다.';
    button.textContent = '이메일 확인하고 제안서 신청하기';
    document.getElementById('verify-expiry').textContent = '링크는 신청 후 30분 동안 유효합니다.';
    document.getElementById('verify-retry').href = '/proposal-request.html';
    document.getElementById('verify-retry').textContent = '제안서 다시 신청하기 · 입력 내용 수정';
  }
  if (!token) { button.hidden = true; status.textContent = '확인 링크가 없거나 올바르지 않습니다. 홈페이지에서 자료를 다시 신청해 주세요.'; return; }
  button.addEventListener('click', function () {
    button.disabled = true; status.textContent = '이메일 확인 중…';
    fetch('/api/resource-verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token }) })
      .then(function (r) { return r.json(); })
      .then(function (result) {
        if (!result.ok) throw Error(result.error || '이메일 확인에 실패했습니다.');
        if (result.kind === 'proposal') {
          button.hidden = true;
          status.textContent = '이메일 확인과 제안서 신청이 완료되었습니다. 확인하신 이메일로 회신드리겠습니다.';
          return;
        }
        if (!/^\/api\/resource-download\?resource=(brochure|privacy|method)$/.test(result.downloadUrl)) throw Error('자료 링크를 확인하지 못했습니다.');
        button.hidden = true; download.href = result.downloadUrl; download.textContent = result.label + ' 다운로드';
        download.hidden = false; status.textContent = '이메일 확인이 완료되었습니다. 아래 버튼을 눌러 자료를 받아 주세요.';
        document.getElementById('intro').textContent = '감사합니다. 신청하신 교육 자료가 준비되었습니다.'; download.focus();
      })
      .catch(function (error) { status.textContent = error.message || '네트워크 연결을 확인해 주세요.'; button.disabled = false; });
  });
})();
