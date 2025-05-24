// console.log('Background script loaded');

let isVietUniEnabled = false;
let currentMethod = 'telex';

async function updateIcon(prefs) {
  try {
    const txt = { text: prefs.onOff == 1 ? 'on' : 'off' };
    const bg = {
      color: prefs.onOff == 1 ? [0, 255, 0, 255] : [255, 0, 0, 255],
    };

    await chrome?.action?.setBadgeText(txt);
    await chrome?.action?.setBadgeBackgroundColor(bg);
  } catch (e) {
    console.error('Error in updateIcon:', e);
  }
}

// Load initial state and method from storage
chrome.storage.local.get(['isVietUniEnabled', 'currentMethod'], (result) => {
  isVietUniEnabled = result.isVietUniEnabled || false;
  currentMethod = result.currentMethod || 'telex';
  updateIcon({ onOff: isVietUniEnabled ? 1 : 0 });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleVietUni') {
    isVietUniEnabled = !isVietUniEnabled;
    updateIcon({ onOff: isVietUniEnabled ? 1 : 0 });
    chrome.storage.local.set({ isVietUniEnabled }, () => {
      // Broadcast toggle state to all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'toggleVietUni',
            enabled: isVietUniEnabled
          }).catch((error) => {
            if (error.message.includes('Receiving end does not exist')) return;
            console.error('Failed to send message to tab', tab.id, error);
          });
        });
      });
    });
    sendResponse({ success: true });
  } else if (message.action === 'setTypingMethod') {
    currentMethod = message.method;
    chrome.storage.local.set({ currentMethod }, () => {
      // Broadcast method change to all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'setTypingMethod',
            method: currentMethod
          }).catch((error) => {
            if (error.message.includes('Receiving end does not exist')) return;
            console.error('Failed to send message to tab', tab.id, error);
          });
        });
      });
    });
    sendResponse({ success: true });
  } else if (message.action === 'getVietUniState') {
    sendResponse({ enabled: isVietUniEnabled, method: currentMethod });
  }
});
