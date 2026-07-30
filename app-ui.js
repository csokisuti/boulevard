(function () {
  const LOADING_TEXT = "Betöltés...";
  const SAVE_PATTERN = /mentés|mentése|rögzítés/i;
  let activeSaveButton = null;
  let originalSaveText = "";
  let saveTimeout = null;
  let lastMessage = "";

  function ensureUi() {
    if (!document.getElementById("appLoadingOverlay")) {
      const overlay = document.createElement("div");
      overlay.id = "appLoadingOverlay";
      overlay.className = "app-loading-overlay";
      overlay.setAttribute("role", "status");
      overlay.setAttribute("aria-live", "polite");
      overlay.innerHTML = `
        <div class="coffee-loader">
          <div class="coffee-loader-icon" aria-hidden="true">☕</div>
          <strong>Betöltés folyamatban…</strong>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    if (!document.getElementById("appSaveToast")) {
      const toast = document.createElement("div");
      toast.id = "appSaveToast";
      toast.className = "app-save-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
  }

  function hasVisibleLoadingText() {
    return [...document.querySelectorAll("p, td, span, div")]
      .some(element => element.offsetParent !== null && element.textContent.trim() === LOADING_TEXT);
  }

  function refreshLoadingState() {
    const overlay = document.getElementById("appLoadingOverlay");
    if (!overlay) return;
    overlay.classList.toggle("is-hidden", !hasVisibleLoadingText());
  }

  function showToast(message, isError) {
    if (!message || message === lastMessage) return;
    lastMessage = message;
    const toast = document.getElementById("appSaveToast");
    toast.textContent = isError ? `⚠ ${message}` : `✓ ${message}`;
    toast.className = `app-save-toast is-visible ${isError ? "is-error" : "is-success"}`;
    setTimeout(() => toast.classList.remove("is-visible"), 4500);
  }

  function finishSave(message, isError) {
    if (activeSaveButton) {
      activeSaveButton.disabled = false;
      activeSaveButton.classList.remove("is-saving");
      activeSaveButton.textContent = originalSaveText;
    }

    activeSaveButton = null;
    originalSaveText = "";
    clearTimeout(saveTimeout);

    showToast(message, isError);
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureUi();
    refreshLoadingState();

    const observer = new MutationObserver(() => {
      refreshLoadingState();

      const message = document.getElementById("message");
      if (!message || !message.textContent.trim()) return;
      const isError = getComputedStyle(message).color === "rgb(185, 28, 28)";
      const text = message.textContent.trim();
      if (activeSaveButton) finishSave(text, isError);
      else showToast(text, isError);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["style"]
    });

    document.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button || button.disabled || !SAVE_PATTERN.test(button.textContent) || /nyomtatás|pdf/i.test(button.textContent)) return;

      if (activeSaveButton && activeSaveButton !== button) {
        finishSave("", false);
      }

      activeSaveButton = button;
      originalSaveText = button.textContent;
      const message = document.getElementById("message");
      if (message) {
        message.textContent = "";
        lastMessage = "";
      }
      button.classList.add("is-saving");
      button.textContent = "Mentés folyamatban…";

      saveTimeout = setTimeout(() => finishSave("", false), 20000);
    }, true);

  });
})();
