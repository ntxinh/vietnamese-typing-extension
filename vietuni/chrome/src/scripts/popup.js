document.addEventListener('DOMContentLoaded', () => {
  const methodSelect = document.getElementById('typingMethod');
  const toggleButton = document.getElementById('toggleButton');

  // Load initial state
  chrome.runtime.sendMessage({ action: 'getVietUniState' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Failed to get VietUni state:', chrome.runtime.lastError);
      return;
    }
    if (response) {
      methodSelect.value = response.method || 'telex';
      toggleButton.textContent = response.enabled ? 'Disable' : 'Enable';
    }
  });

  // Handle method change
  methodSelect.addEventListener('change', () => {
    const method = methodSelect.value;
    chrome.runtime.sendMessage({ action: 'setTypingMethod', method }).catch((error) => {
      console.error('Failed to set typing method:', error);
    });
  });

  // Handle toggle button click
  toggleButton.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'toggleVietUni' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to toggle VietUni:', chrome.runtime.lastError);
        return;
      }
      if (response && response.success) {
        toggleButton.textContent = isVietUniEnabled ? 'Disable' : 'Enable';
      }
    });
  });

  // Listen for state changes to update button text
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'toggleVietUni') {
      toggleButton.textContent = message.enabled ? 'Disable' : 'Enable';
    }
  });
});
