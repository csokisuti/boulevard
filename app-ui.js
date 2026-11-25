(function () {
  const LOADING_TEXT = "Betöltés...";
  const SAVE_PATTERN = /mentés|mentése|rögzítés/i;
  const SAVE_TIMEOUT_MS = 20000;
  let activeSaveButton = null;
  let originalSaveText = "";
  let saveTimeout = null;
  let lastMessage = "";
  let loadingCheckTimer = 0;

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

  // Korábban minden DOM-változásnál (minden leütésnél) végigment az összes
  // p/td/span/div elemen és mindegyiknél layoutot kért (offsetParent).
  // Most: előbb az olcsó szövegösszehasonlítás, a layout csak találatnál kell,
  // és az ellenőrzés legfeljebb ~8-szor fut másodpercenként.
  function hasVisibleLoadingText() {
    const candidates = document.querySelectorAll("p, td, span, div");
    for (const element of candidates) {
      if (element.childElementCount !== 0) continue;
      if (element.textContent.trim() !== LOADING_TEXT) continue;
      if (element.offsetParent !== null) return true;
    }
    return false;
  }

  function refreshLoadingState() {
    const overlay = document.getElementById("appLoadingOverlay");
    if (!overlay) return;
    overlay.classList.toggle("is-hidden", !hasVisibleLoadingText());
  }

  function scheduleLoadingCheck() {
    if (loadingCheckTimer) return;
    loadingCheckTimer = setTimeout(() => {
      loadingCheckTimer = 0;
      refreshLoadingState();
    }, 120);
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
      delete activeSaveButton.dataset.appBusy;
    }

    activeSaveButton = null;
    originalSaveText = "";
    clearTimeout(saveTimeout);

    showToast(message, isError);
  }

  function handleMessageChange() {
    const message = document.getElementById("message");
    if (!message || !message.textContent.trim()) return;
    const isError = getComputedStyle(message).color === "rgb(185, 28, 28)";
    const text = message.textContent.trim();
    if (activeSaveButton) finishSave(text, isError);
    else showToast(text, isError);
  }

  document.addEventListener("DOMContentLoaded", () => {
    ensureUi();
    refreshLoadingState();

    // Betöltés-overlay: csak szöveg/elem változást figyelünk, ritkítva.
    const loadingObserver = new MutationObserver(scheduleLoadingCheck);
    loadingObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // Üzenetek (toast): csak a #message elemet figyeljük, nem az egész oldalt.
    const message = document.getElementById("message");
    if (message) {
      const messageObserver = new MutationObserver(handleMessageChange);
      messageObserver.observe(message, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["style"]
      });
    }

    document.addEventListener("click", event => {
      const button = event.target.closest("button");
      if (!button || button.disabled || !SAVE_PATTERN.test(button.textContent) || /nyomtatás|pdf/i.test(button.textContent)) return;

      if (button.dataset.appBusy === "1" || activeSaveButton) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }

      button.dataset.appBusy = "1";
      activeSaveButton = button;
      originalSaveText = button.textContent;
      const messageEl = document.getElementById("message");
      if (messageEl) {
        messageEl.textContent = "";
        lastMessage = "";
      }
      button.classList.add("is-saving");
      button.textContent = "Mentés folyamatban…";
      queueMicrotask(() => {
        if (button.dataset.appBusy === "1") button.disabled = true;
      });

      saveTimeout = setTimeout(() => finishSave(navigator.onLine ? "" : "Nincs internetkapcsolat – a mentés nem biztos, hogy megtörtént.", !navigator.onLine), SAVE_TIMEOUT_MS);
    }, true);
  });
})();
