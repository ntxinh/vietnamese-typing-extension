console.log('Background script loaded');

let isVietUniEnabled = false;

// Load initial state from storage
chrome.storage.local.get(['isVietUniEnabled'], (result) => {
  isVietUniEnabled = result.isVietUniEnabled || false;
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleVietUni') {
    isVietUniEnabled = !isVietUniEnabled;
    // Save state to persist across service worker restarts
    chrome.storage.local.set({ isVietUniEnabled }, () => {
      // Broadcast toggle state to all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'toggleVietUni',
            enabled: isVietUniEnabled
          }).catch((error) => {
            // Ignore errors for tabs without content scripts
            if (error.message.includes('Receiving end does not exist')) {
              return;
            }
            console.error('Failed to send message to tab', tab.id, error);
          });
        });
      });
    });
    sendResponse({ success: true });
  } else if (message.action === 'getVietUniState') {
    sendResponse({ enabled: isVietUniEnabled });
  }
});
