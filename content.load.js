if (
  document.querySelector(`[data-testid="account-detail-menu"]`) &&
  document.querySelector("[name='awsc-mezz-region']").content
) {
  let acc_id = document.querySelector(`[data-testid="account-detail-menu"]`)
    .innerText;
  let region = document.querySelector("[name='awsc-mezz-region']").content;
  chrome.runtime.sendMessage({
    action: 'getSource',
    source: { acc_id, region },
  });
}
