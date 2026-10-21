(function () {
  var token = new URLSearchParams(location.hash.slice(1)).get('token');
  // Keep encrypted tokens out of history, analytics, and later referrers. No third-party scripts on this page.
  history.replaceState(null, '', location.pathname);
  var button = document.getElementById('confirm'), status = document.getElementById('status');
  var download = document.getElementById('download');
  if (!token) { button.hidden = true; status.textContent = '확인 링크가 없거나 올바르지 않습니다. 홈페이지에서 자료를 다시 신청해 주세요.'; return; }
  button.addEventListener('click', function () {
    button.disabled = true; status.textContent = '이메일 확인 중…';
    fetch('/api/resource-verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: token }) })
      .then(function (r) { return r.json(); })
      .then(function (result) {
        if (!result.ok) throw Error(result.error || '이메일 확인에 실패했습니다.');
        if (!/^\/api\/resource-download\?resource=(brochure|privacy|method)$/.test(result.downloadUrl)) throw Error('자료 링크를 확인하지 못했습니다.');
        button.hidden = true; download.href = result.downloadUrl; download.textContent = result.label + ' 다운로드';
        download.hidden = false; status.textContent = '이메일 확인이 완료되었습니다. 아래 버튼을 눌러 자료를 받아 주세요.';
        document.getElementById('intro').textContent = '감사합니다. 신청하신 교육 자료가 준비되었습니다.'; download.focus();
      })
      .catch(function (error) { status.textContent = error.message || '네트워크 연결을 확인해 주세요.'; button.disabled = false; });
  });
})();
