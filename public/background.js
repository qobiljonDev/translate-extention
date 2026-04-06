// Sahifa tarjima holati (tabId -> boolean)
const pageTranslatedTabs = {};

// Context menu yaratish
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-selection",
    title: "Tarjima qilish",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "translate-page",
    title: "Sahifani tarjima qilish",
    contexts: ["page"],
  });
});

// Menu ochilganda holatga qarab yangilash
function updatePageMenu(tabId) {
  const isTranslated = pageTranslatedTabs[tabId];
  chrome.contextMenus.update("translate-page", {
    title: isTranslated ? "Asl holatga qaytarish" : "Sahifani tarjima qilish",
  });
}

// Context menu bosilganda
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "translate-selection" && tab?.id) {
    chrome.tabs
      .sendMessage(tab.id, {
        action: "translate-selection",
        text: info.selectionText,
      })
      .catch(() => {});
  }
  if (info.menuItemId === "translate-page" && tab?.id) {
    const isTranslated = pageTranslatedTabs[tab.id];
    if (isTranslated) {
      chrome.tabs
        .sendMessage(tab.id, { action: "restore-page" })
        .catch(() => {});
      pageTranslatedTabs[tab.id] = false;
    } else {
      chrome.tabs
        .sendMessage(tab.id, { action: "translate-page" })
        .catch(() => {});
      pageTranslatedTabs[tab.id] = true;
    }
    updatePageMenu(tab.id);
  }
});

// Tab almashganda menu yangilash
chrome.tabs.onActivated.addListener(({ tabId }) => {
  updatePageMenu(tabId);
});

// Tab yopilganda tozalash
chrome.tabs.onRemoved.addListener((tabId) => {
  delete pageTranslatedTabs[tabId];
});

// Sahifa yangilanganda holatni tozalash
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    pageTranslatedTabs[tabId] = false;
  }
});

// Keyboard shortcut (Ctrl+Shift+T)
chrome.commands.onCommand.addListener(async (command, tab) => {
  if (command === "translate-selection" && tab?.id) {
    chrome.tabs
      .sendMessage(tab.id, {
        action: "translate-selection",
      })
      .catch(() => {});
  }
});

// Popup → content script message relay
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "translate-page" || message.action === "restore-page") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        const tabId = tabs[0].id;
        chrome.tabs
          .sendMessage(tabId, message)
          .then((res) => {
            if (message.action === "translate-page") pageTranslatedTabs[tabId] = true;
            if (message.action === "restore-page") pageTranslatedTabs[tabId] = false;
            sendResponse(res);
          })
          .catch(() => {
            sendResponse({ status: "error", reason: "Content script yuklanmagan" });
          });
      }
    });
    return true;
  }
});
