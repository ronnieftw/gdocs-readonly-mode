// Switches Google Docs into Viewing mode via the toolbar mode switcher,
// since the /view URL alone doesn't enforce read-only for editors.

// Google Docs' toolbar uses the Closure Library, which listens for `mousedown`
// rather than `click` — a plain .click() won't open the dropdown.
function fireClick(el) {
  for (const type of ["mousedown", "mouseup", "click"]) {
    el.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true }));
  }
}

function switchToMode(targetMode) {
  const modeButton = document.querySelector(".docs-mode-switcher");
  if (!modeButton) return false;

  if (modeButton.getAttribute("aria-label") === `${targetMode} mode`) return true;

  fireClick(modeButton);

  let attempts = 0;
  const interval = setInterval(() => {
    const item = [...document.querySelectorAll(".goog-menuitem")]
      .find(el => el.textContent.trim().startsWith(targetMode));
    if (item) {
      fireClick(item);
      clearInterval(interval);
    } else if (++attempts >= 20) {
      clearInterval(interval);
    }
  }, 100);

  return true;
}

async function isEnabled() {
  const { enabled = true } = await chrome.storage.local.get("enabled");
  return enabled;
}

// On page load, poll for the toolbar and switch to Viewing if enabled
let attempts = 0;
const loadInterval = setInterval(async () => {
  if (!(await isEnabled())) {
    clearInterval(loadInterval);
    return;
  }
  if (switchToMode("Viewing") || ++attempts >= 30) {
    clearInterval(loadInterval);
  }
}, 500);

// React to toggle changes from the action button
chrome.storage.onChanged.addListener((changes) => {
  if (!changes.enabled) return;
  switchToMode(changes.enabled.newValue ? "Viewing" : "Editing");
});
