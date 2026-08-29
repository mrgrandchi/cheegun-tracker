/* CHEEGUN: OUTBREAK — PHASE 16A BOOT DIAGNOSTICS */
(function () {
  "use strict";

  const status = document.getElementById("bootStatus");
  const errorBox = document.getElementById("bootError");
  const startedAt = performance.now();
  const errors = [];

  function setStatus(message) {
    if (status) status.textContent = "CHEEGUN: OUTBREAK // " + message;
  }

  function showError(title, detail) {
    errors.push({ title, detail });
    setStatus("BOOT ERROR");
    if (errorBox) {
      errorBox.textContent =
        "OUTBREAK BOOT ERROR\n\n" +
        title + "\n\n" +
        detail +
        "\n\nOpen DevTools for additional diagnostics.";
    }
    document.body.classList.remove("booted");
    console.error("[CHEEGUN BOOT]", title, detail);
  }

  window.addEventListener("error", function (event) {
    const source = event.filename || "unknown source";
    const line = event.lineno ? ":" + event.lineno : "";
    const column = event.colno ? ":" + event.colno : "";
    const message = event.message || "Unknown JavaScript error";

    showError(
      message,
      source + line + column
    );
  }, true);

  window.addEventListener("unhandledrejection", function (event) {
    const reason = event.reason instanceof Error
      ? event.reason.stack || event.reason.message
      : String(event.reason);

    showError("Unhandled Promise Rejection", reason);
  });

  window.CheegunBoot = {
    errors,
    startedAt,
    get healthy() {
      return errors.length === 0;
    }
  };

  setStatus("LOADING CORE SYSTEMS...");

  window.addEventListener("load", function () {
    if (errors.length > 0) return;

    const elapsed = Math.round(performance.now() - startedAt);
    setStatus("SYSTEMS ONLINE // " + elapsed + "ms");

    requestAnimationFrame(function () {
      document.body.classList.add("booted");
    });

    console.info("[CHEEGUN BOOT] Systems online in " + elapsed + "ms");
  });
})();