if (document.querySelector(`[data-testid="account-detail-menu"]`)) {
  let acc_id = document.querySelector(`[data-testid="account-detail-menu"]`)
    .innerText;
  chrome.runtime.sendMessage({ action: 'getSource', source: acc_id });
}
