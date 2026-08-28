(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const signalValue = $("signalValue");
  const signalHud = $("signalHud");
  const signalBar = $("signalBar");
  const movementValue = $("movementValue");
  const modeHud = $("modeHud");
  const globalMode = $("globalMode");
  const pingValue = $("pingValue");
  const batteryValue = $("batteryValue");
  const batteryBar = $("batteryBar");
  const speedValue = $("speedValue");
  const headingValue = $("headingValue");
  const directionValue = $("directionValue");
  const zoneLabel = $("zoneLabel");
  const mapTarget = $("mapTarget");
  const activityFeed = $("activityFeed");
  const clock = $("clock");
  const scanButton = $("scanButton");
  const pingButton = $("pingButton");
  const radarButton = $("radarButton");
  const alertButton = $("alertButton");

  if (!signalValue || !mapTarget || !activityFeed) return;

  let signal = 94;
  let battery = 83;
  let zoneIndex = 0;
  let radarOn = false;

  const zones = [
    { label: "SIGNAL ZONE", x: 55, y: 48 },
    { label: "NORTH SECTOR", x: 45, y: 34 },
    { label: "WATERFRONT", x: 67, y: 61 },
    { label: "DOWNTOWN", x: 34, y: 51 },
    { label: "WEST SECTOR", x: 27, y: 39 }
  ];
  const movements = ["ROAMING", "MOVING", "PAUSED", "ROAMING"];
  const directions = ["WEST-SOUTHWEST", "NORTHWEST", "EAST", "SOUTHWEST", "NORTH"];

  function addEvent(message, live = true) {
    const event = document.createElement("div");
    event.className = live ? "event liveevent" : "event";
    event.innerHTML = `<b>[${live ? "LIVE" : "SYS"}]</b> ${message}`;
    activityFeed.prepend(event);
    while (activityFeed.children.length > 7) activityFeed.lastElementChild.remove();
  }

  function updateClock() {
    clock.textContent = new Date().toLocaleTimeString([], { hour12: false });
  }

  function updateTelemetry() {
    signal = Math.max(76, Math.min(99, signal + Math.floor(Math.random() * 7) - 3));
    battery = Math.max(61, battery - (Math.random() > 0.72 ? 1 : 0));
    const movement = movements[Math.floor(Math.random() * movements.length)];
    const speed = movement === "PAUSED" ? 0 : (2.4 + Math.random() * 4.8).toFixed(1);
    const heading = Math.floor(Math.random() * 360);
    const zone = zones[zoneIndex % zones.length];
    zoneIndex += 1;

    signalValue.textContent = `${signal}%`;
    signalHud.textContent = `${signal}%`;
    signalBar.style.width = `${signal}%`;
    movementValue.textContent = movement;
    modeHud.textContent = movement;
    globalMode.textContent = movement;
    speedValue.textContent = `${speed} KM/H`;
    headingValue.textContent = `${heading}°`;
    directionValue.textContent = directions[Math.floor(Math.random() * directions.length)];
    batteryValue.textContent = `${battery}%`;
    batteryBar.style.width = `${battery}%`;
    zoneLabel.textContent = zone.label;
    mapTarget.style.left = `${zone.x}%`;
    mapTarget.style.top = `${zone.y}%`;
    pingValue.textContent = new Date().toLocaleTimeString([], { hour12: false });

    if (Math.random() > 0.35) addEvent(`Signal triangulated • ${zone.label.toLowerCase()}`);
  }

  function temporary(button, text, duration) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = text;
    window.setTimeout(() => { button.disabled = false; button.textContent = original; }, duration);
  }

  scanButton.addEventListener("click", () => {
    temporary(scanButton, "⌛ SCANNING...", 1600);
    addEvent("Deep scan initialized", false);
    window.setTimeout(() => addEvent("DEEP SCAN COMPLETE • anomalous Cheegun activity detected"), 1600);
  });

  pingButton.addEventListener("click", () => {
    temporary(pingButton, "◉ PINGING...", 1100);
    pingValue.textContent = new Date().toLocaleTimeString([], { hour12: false });
    addEvent("OUTBOUND PING SENT • simulated signal responded");
  });

  radarButton.addEventListener("click", () => {
    radarOn = !radarOn;
    radarButton.textContent = radarOn ? "◎ RADAR ACTIVE" : "◎ ACTIVATE RADAR";
    addEvent(radarOn ? "RADAR SWEEP ACTIVE • scanning local simulation" : "RADAR SWEEP PAUSED", false);
  });

  alertButton.addEventListener("click", () => {
    temporary(alertButton, "⚠ ALERT SENT", 1400);
    addEvent("MAXIMUM CHEEGUN ALERT • PRANK MODE ACTIVATED");
  });

  updateClock();
  window.setInterval(updateClock, 1000);
  addEvent("Tracker boot complete • telemetry simulated", false);
  addEvent("Thunder Bay vector layer initialized", false);
  updateTelemetry();
  window.setInterval(updateTelemetry, 2600);
})();