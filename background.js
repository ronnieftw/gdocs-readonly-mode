const COLOR_ICONS = {
  "16":  "icon16.png",
  "32":  "icon32.png",
  "48":  "icon48.png",
  "128": "icon128.png"
};
const GREY_ICONS = {
  "16":  "icon16-off.png",
  "32":  "icon32-off.png",
  "48":  "icon48-off.png",
  "128": "icon128-off.png"
};

async function syncIcon(enabled) {
  await chrome.action.setIcon({ path: enabled ? COLOR_ICONS : GREY_ICONS });
  await chrome.action.setTitle({
    title: enabled ? "Auto-Viewing: ON (click to disable)"
                   : "Auto-Viewing: OFF (click to enable)"
  });
}

async function init() {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  await syncIcon(enabled);
}

chrome.runtime.onStartup.addListener(init);
chrome.runtime.onInstalled.addListener(init);

chrome.action.onClicked.addListener(async () => {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  const next = !enabled;
  await chrome.storage.local.set({ enabled: next });
  await syncIcon(next);
});
