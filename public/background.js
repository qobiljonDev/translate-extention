// Context menu yaratish
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-selection",
    title: "Tarjima qilish",
    contexts: ["selection"],
  });
});

// Context menu bosilganda
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "translate-selection" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: "translate-selection",
      text: info.selectionText,
    });
  }
});

// Keyboard shortcut (Ctrl+Shift+T)
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "translate-selection" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: "translate-selection",
    });
  }
});

// Popup → content script message relay
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "translate-page") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, message, sendResponse);
      }
    });
    return true; // async response
  }
});
