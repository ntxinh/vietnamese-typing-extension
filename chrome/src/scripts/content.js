let isVietUniEnabled = false;
let currentMethod = 'telex'; // Default method
let lastCtrlPress = 0;
const DOUBLE_PRESS_THRESHOLD = 300; // 300ms for double press
let vUni = null;
const initializedElements = new Set();

function convertTypingMethod(typingMethod) {
  switch (typingMethod) {
    case 'off':
      return 0;
    case 'telex':
      return 1;
    case 'vni':
      return 2;
    case 'viqr':
      return 3;
    case 'auto':
      return 4;
    default:
      return 0;
  }
}

// Initialize VietUni with the current method
function initializeVietUni() {
  if (!vUni) {
    try {
      // vUni.setMethod(int) (0=OFF, 1=TELEX, 2=VNI, 3=VIQR, 4=AUTO).
      vUni = new vietUni(convertTypingMethod(currentMethod)); // Create VietUni instance
    } catch (e) {
      console.error('Failed to initialize VietUni:', e);
    }
  } else {
    try {
      vUni.setMethod(convertTypingMethod(currentMethod)); // Update method if VietUni exists
    } catch (e) {
      console.error('Failed to set VietUni method:', e);
    }
  }
}

// Enable Vietnamese typing on all input and textarea elements
function enableVietUniTyping() {
  initializeVietUni();
  if (!vUni) return; // Skip if VietUni failed to initialize
  vUni.setMethod(convertTypingMethod(currentMethod));
  const elements = document.querySelectorAll('input[type="text"], textarea, [contenteditable="true"]');
  elements.forEach((element) => {
    if (!initializedElements.has(element)) {
      try {
        vUni.initTyper(element);
        initializedElements.add(element);
      } catch (e) {
        console.error('Failed to initialize typer for element:', e);
      }
    }
  });
  isVietUniEnabled = true;
  console.log(`VietUni typing enabled with method: ${currentMethod}`);
}

// Disable Vietnamese typing
function disableVietUniTyping() {
  vUni.setMethod(convertTypingMethod('off'));
  // initializedElements.forEach((element) => {
  //   try {
  //     // Assume VietUni has removeTyper; if not, clear by reinitializing
  //     if (vUni.removeTyper) {
  //       vUni.removeTyper(element);
  //     }
  //     element.value = element.value; // Preserve value
  //   } catch (e) {
  //     console.error('Failed to remove typer for element:', e);
  //   }
  // });
  // initializedElements.clear();
  isVietUniEnabled = false;
  console.log('VietUni typing disabled');
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleVietUni') {
    isVietUniEnabled = message.enabled;
    if (isVietUniEnabled) {
      enableVietUniTyping();
    } else {
      disableVietUniTyping();
    }
  } else if (message.action === 'setTypingMethod') {
    currentMethod = message.method;
    if (isVietUniEnabled) {
      // Reinitialize VietUni with new method
      // disableVietUniTyping();
      initializeVietUni();
      // enableVietUniTyping();
    }
    console.log(`Typing method set to: ${currentMethod}`);
  }
});

// Detect double Ctrl key press
document.addEventListener('keydown', (event) => {
  if (event.key === 'Control') {
    const now = Date.now();
    if (now - lastCtrlPress < DOUBLE_PRESS_THRESHOLD) {
      // Double Ctrl press detected, toggle state
      chrome.runtime?.sendMessage({ action: 'toggleVietUni' }).catch((error) => {
        console.error('Failed to send toggle message:', error);
      });
      lastCtrlPress = 0; // Reset to prevent multiple toggles
    } else {
      lastCtrlPress = now;
    }
  }
});

// Initialize on page load with error handling
window.addEventListener('load', () => {
  chrome.runtime?.sendMessage({ action: 'getVietUniState' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Failed to get VietUni state:', chrome.runtime.lastError);
      return;
    }
    if (response) {
      isVietUniEnabled = response.enabled || false;
      currentMethod = response.method || 'telex';
      if (isVietUniEnabled) {
        enableVietUniTyping();
      }
    }
  });
});

// Observe DOM changes for dynamically added inputs
const observer = new MutationObserver(() => {
  if (isVietUniEnabled) {
    enableVietUniTyping(); // Reapply to new inputs
  }
});
observer.observe(document.body, { childList: true, subtree: true });

// chrome.runtime.sendMessage({ action: 'ping' })
