(() => {
  "use strict";

  const mapEl = document.getElementById("trackingMap");
  const signalValue = document.getElementById("signalValue");
  const signalBar = document.getElementById("signalBar");
  const movementValue = document.getElementById("movementValue");
  const pingValue = document.getElementById("pingValue");
  const zoneLabel = document.getElementById("zoneLabel");
  const activityFeed = document.getElementById("activityFeed");
  const speedValue = document.getElementById("speedValue");
  const headingValue = document.getElementById("headingValue");
  const scanButton = document.getElementById("scanButton");
  const pingButton = document.getElementById("pingButton");
  const alertButton = document.getElementById("alertButton");

  if (!mapEl || typeof L === "undefined") return;

  const thunderBay = [48.3809, -89.2477];
  const map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: true }).setView(thunderBay, 14);

  const street = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });
  const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
  });
  const dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  });
  street.addTo(map);

  // Fictional walking/transit loop kept on the developed street grid west of the river.
  // It is animation data only and never comes from a person's device or GPS.
  const route = [
    [48.38255, -89.24835], [48.38255, -89.25015], [48.38220, -89.25205],
    [48.38095, -89.25215], [48.37965, -89.25205], [48.37835, -89.25195],
    [48.37825, -89.24980], [48.37825, -89.24795], [48.37685, -89.24785],
    [48.37555, -89.24905], [48.37560, -89.25145], [48.37705, -89.25420],
    [48.37900, -89.25605], [48.38105, -89.25570], [48.38300, -89.25385],
    [48.38405, -89.25165], [48.38355, -89.24955]
  ];

  const targetIcon = L.divIcon({
    className: "",
    html: '<div class="target-marker"><span class="target-core"></span></div>',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  let targetIndex = 0;
  const target = L.marker(route[0], { icon: targetIcon }).addTo(map);
  target.bindPopup('<div class="target-popup">CHEEGUN SIGNAL<br><span>SIMULATED TARGET</span></div>');

  const trail = L.polyline([route[0]], {
    color: "#62ff87",
    weight: 3,
    opacity: 0.72,
    dashArray: "7 8"
  }).addTo(map);

  const movementSegments = [
    { name: "DOWNTOWN WALK", mode: "WALKING", min: 3.1, max: 4.8, ticks: 5 },
    { name: "BUS STOP • SIMULATED", mode: "BUS STOP", min: 0, max: 0, ticks: 4 },
    { name: "MAIN STREET TRANSIT", mode: "ON BUS", min: 18, max: 34, ticks: 7 },
    { name: "DOWNTOWN WALK", mode: "WALKING", min: 3.0, max: 4.6, ticks: 6 },
    { name: "BUS STOP • SIMULATED", mode: "BUS STOP", min: 0, max: 0, ticks: 4 },
    { name: "RETURN TRANSIT", mode: "ON BUS", min: 20, max: 38, ticks: 7 }
  ];

  let segment = 0;
  let segmentTick = 0;
  let signal = 94;
  let trailPoints = [route[0]];

  function addEvent(message, live = true) {
    const e = document.createElement("div");
    e.className = live ? "event liveevent" : "event";
    e.innerHTML = `<b>[${live ? "LIVE" : "SYS"}]</b> ${message}`;
    activityFeed.prepend(e);
    while (activityFeed.children.length > 8) activityFeed.lastElementChild.remove();
  }

  function updatePing() {
    pingValue.textContent = new Date().toLocaleTimeString([], { hour12: false });
  }

  function headingBetween(a, b) {
    const dy = b[0] - a[0];
    const dx = b[1] - a[1];
    const angle = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
    const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    return `${Math.round(angle)}° ${dirs[Math.round(angle / 45) % 8]}`;
  }

  function advanceSegment() {
    segment = (segment + 1) % movementSegments.length;
    segmentTick = 0;
    const state = movementSegments[segment];
    addEvent(`${state.mode} • ${state.name.toLowerCase()}`);
  }

  function moveAlongRoute() {
    const current = route[targetIndex];
    const nextIndex = (targetIndex + 1) % route.length;
    const next = route[nextIndex];
    targetIndex = nextIndex;
    target.setLatLng(next);

    trailPoints.push(next);
    if (trailPoints.length > 12) trailPoints.shift();
    trail.setLatLngs(trailPoints);

    segmentTick += 1;
    const state = movementSegments[segment];
    if (segmentTick >= state.ticks) advanceSegment();

    const active = movementSegments[segment];
    const speed = active.min === active.max
      ? active.min
      : active.min + Math.random() * (active.max - active.min);

    signal = Math.max(80, Math.min(99, signal + Math.floor(Math.random() * 5) - 2));
    signalValue.textContent = `${signal}%`;
    signalBar.style.width = `${signal}%`;
    movementValue.textContent = active.mode;
    speedValue.textContent = `${speed.toFixed(1)} KM/H`;
    headingValue.textContent = headingBetween(current, next);
    zoneLabel.textContent = active.name;
    updatePing();
  }

  function temporary(button, text, duration) {
    const old = button.textContent;
    button.disabled = true;
    button.textContent = text;
    window.setTimeout(() => {
      button.disabled = false;
      button.textContent = old;
    }, duration);
  }

  function setMapMode(mode) {
    [street, satellite, dark].forEach(layer => {
      if (map.hasLayer(layer)) map.removeLayer(layer);
    });
    if (mode === "satellite") satellite.addTo(map);
    else if (mode === "dark") dark.addTo(map);
    else street.addTo(map);
    addEvent(`Map layer switched • ${mode}`, false);
  }

  document.querySelectorAll(".map-mode").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".map-mode").forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      setMapMode(button.dataset.map);
    });
  });

  scanButton.addEventListener("click", () => {
    temporary(scanButton, "⌛ SCANNING...", 1600);
    addEvent("Deep scan initialized", false);
    window.setTimeout(() => addEvent("DEEP SCAN COMPLETE • route continuity confirmed"), 1600);
  });

  pingButton.addEventListener("click", () => {
    temporary(pingButton, "◉ PINGING...", 1100);
    updatePing();
    target.openPopup();
    addEvent("OUTBOUND PING SENT • simulated signal responded");
  });

  alertButton.addEventListener("click", () => {
    temporary(alertButton, "⚠ ALERT SENT", 1400);
    addEvent("MAXIMUM CHEEGUN ALERT • PRANK MODE ACTIVATED");
  });

  updatePing();
  addEvent("Route simulation initialized • street-grid path only", false);
  addEvent("Target acquired • walking/transit simulation active");
  moveAlongRoute();
  window.setInterval(moveAlongRoute, 2800);
})();
