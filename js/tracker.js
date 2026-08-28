(() => {
  "use strict";

  const signalValue = document.getElementById("signalValue");
  const signalHud = document.getElementById("signalHud");
  const signalBar = document.getElementById("signalBar");
  const movementValue = document.getElementById("movementValue");
  const modeHud = document.getElementById("modeHud");
  const pingValue = document.getElementById("pingValue");
  const zoneLabel = document.getElementById("zoneLabel");
  const mapTarget = document.querySelector(".map-target");
  const activityFeed = document.getElementById("activityFeed");

  const scanButton = document.getElementById("scanButton");
  const pingButton = document.getElementById("pingButton");
  const alertButton = document.getElementById("alertButton");

  if (!signalValue || !signalHud || !signalBar || !movementValue || !modeHud || !pingValue || !zoneLabel || !mapTarget || !activityFeed) {
    return;
  }

  let signal = 94;
  let zoneIndex = 0;
  let busy = false;

  const zones = [
    { label: "SIGNAL ZONE", x: 55, y: 50 },
    { label: "NORTH SECTOR", x: 45, y: 36 },
    { label: "WATERFRONT", x: 68, y: 62 },
    { label: "DOWNTOWN", x: 34, y: 53 },
    { label: "WEST SECTOR", x: 27, y: 39 }
  ];

  const movementStates = ["ROAMING", "MOVING", "PAUSED", "ROAMING"];

  function addEvent(message, live = true) {
    const event = document.createElement("div");
    event.className = live ? "event liveevent" : "event";
    event.innerHTML = `<b>[${live ? "LIVE" : "SYS"}]</b> ${message}`;
    activityFeed.prepend(event);
    while (activityFeed.children.length > 6) {
      activityFeed.lastElementChild.remove();
    }
  }

  function updatePing() {
    pingValue.textContent = new Date().toLocaleTimeString([], { hour12: false });
  }

  function updateTelemetry() {
    signal = Math.max(78, Math.min(99, signal + Math.floor(Math.random() * 7) - 3));
    const movement = movementStates[Math.floor(Math.random() * movementStates.length)];
    const zone = zones[zoneIndex % zones.length];
    zoneIndex += 1;

    signalValue.textContent = `${signal}%`;
    signalHud.textContent = `${signal}%`;
    signalBar.style.width = `${signal}%`;
    movementValue.textContent = movement;
    modeHud.textContent = movement;
    zoneLabel.textContent = zone.label;
    mapTarget.style.left = `${zone.x}%`;
    mapTarget.style.top = `${zone.y}%`;
    updatePing();

    if (Math.random() > 0.45) {
      addEvent(`Signal triangulated • ${zone.label.toLowerCase()}`);
    }
  }

  function temporaryButtonState(button, text, duration = 1200) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = text;
    window.setTimeout(() => {
      button.disabled = false;
      button.textContent = original;
    }, duration);
  }

  scanButton.addEventListener("click", () => {
    if (busy) return;
    busy = true;
    temporaryButtonState(scanButton, "⌛ SCANNING...", 1500);
    addEvent("Deep scan initialized", false);
    window.setTimeout(() => {
      addEvent("DEEP SCAN COMPLETE • anomalous Cheegun activity detected");
      busy = false;
    }, 1500);
  });

  pingButton.addEventListener("click", () => {
    if (busy) return;
    temporaryButtonState(pingButton, "◉ PINGING...", 1100);
    updatePing();
    addEvent("OUTBOUND PING SENT • simulated signal responded");
  });

  alertButton.addEventListener("click", () => {
    temporaryButtonState(alertButton, "⚠ ALERT SENT", 1400);
    addEvent("MAXIMUM CHEEGUN ALERT • PRANK MODE ACTIVATED");
  });

  updatePing();
  addEvent("Tracker boot complete • telemetry simulated", false);
  window.setInterval(updateTelemetry, 2600);
})();
