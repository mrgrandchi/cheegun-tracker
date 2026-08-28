(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const mapEl = $("trackingMap"), signalValue = $("signalValue"), signalBar = $("signalBar");
  const movementValue = $("movementValue"), pingValue = $("pingValue"), zoneLabel = $("zoneLabel");
  const activityFeed = $("activityFeed"), speedValue = $("speedValue"), headingValue = $("headingValue");
  const scanButton = $("scanButton"), pingButton = $("pingButton"), alertButton = $("alertButton");
  if (!mapEl || typeof L === "undefined") return;

  const thunderBay = [48.3809, -89.2477];
  const map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: true }).setView(thunderBay, 14);
  const street = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
  const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community' });
  const dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 20, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' });
  street.addTo(map);

  // These are only fictional waypoints. OSRM turns them into real road geometry.
  const waypoints = [
    [48.38145, -89.24705], [48.38015, -89.24105], [48.38295, -89.23825],
    [48.38405, -89.24220], [48.38200, -89.24510], [48.37990, -89.24620]
  ];

  const targetIcon = L.divIcon({ className: "", html: '<div class="target-marker"><span class="target-core"></span></div>', iconSize: [34,34], iconAnchor: [17,17] });
  let target = null, trail = null, route = [], routeIndex = 0, signal = 94;
  let modeIndex = 0, modeTicks = 0;
  const modes = [
    { name: "WALKING", label: "DOWNTOWN WALK", min: 3.0, max: 4.8, ticks: 18 },
    { name: "BUS STOP", label: "BUS STOP • SIMULATED", min: 0, max: 0, ticks: 8 },
    { name: "ON BUS", label: "TRANSIT CORRIDOR", min: 18, max: 36, ticks: 30 },
    { name: "WALKING", label: "WATERFRONT WALK", min: 3.1, max: 4.7, ticks: 18 },
    { name: "BUS STOP", label: "BUS STOP • SIMULATED", min: 0, max: 0, ticks: 8 },
    { name: "ON BUS", label: "RETURN TRANSIT", min: 20, max: 38, ticks: 30 }
  ];

  function addEvent(message, live = true) {
    const e = document.createElement("div"); e.className = live ? "event liveevent" : "event";
    e.innerHTML = `<b>[${live ? "LIVE" : "SYS"}]</b> ${message}`; activityFeed.prepend(e);
    while (activityFeed.children.length > 8) activityFeed.lastElementChild.remove();
  }
  function pingTime() { pingValue.textContent = new Date().toLocaleTimeString([], { hour12:false }); }
  function heading(a,b) {
    const dy=b[0]-a[0], dx=b[1]-a[1], deg=(Math.atan2(dx,dy)*180/Math.PI+360)%360;
    const dirs=["N","NE","E","SE","S","SW","W","NW"];
    return `${Math.round(deg)}° ${dirs[Math.round(deg/45)%8]}`;
  }
  function setTelemetry(a,b) {
    const m=modes[modeIndex];
    const speed=m.min===m.max?m.min:m.min+Math.random()*(m.max-m.min);
    signal=Math.max(80,Math.min(99,signal+Math.floor(Math.random()*5)-2));
    signalValue.textContent=`${signal}%`; signalBar.style.width=`${signal}%`;
    movementValue.textContent=m.name; speedValue.textContent=`${speed.toFixed(1)} KM/H`;
    headingValue.textContent=heading(a,b); zoneLabel.textContent=m.label; pingTime();
  }

  async function buildRoadRoute() {
    addEvent("Road-network route request initialized", false);
    try {
      const coords = waypoints.map(([lat,lon]) => `${lon},${lat}`).join(";");
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("routing service unavailable");
      const data = await response.json();
      if (!data.routes?.[0]?.geometry?.coordinates?.length) throw new Error("no route");
      route = data.routes[0].geometry.coordinates.map(([lon,lat]) => [lat,lon]);
      addEvent(`Road geometry acquired • ${route.length} mapped points`);
    } catch (err) {
      // Safe fallback: the app still works without the external routing service.
      route = waypoints.slice();
      addEvent("Road routing unavailable • using compact simulated fallback", false);
    }
    routeIndex=0;
    target=L.marker(route[0],{icon:targetIcon}).addTo(map);
    target.bindPopup('<div class="target-popup">CHEEGUN SIGNAL<br><span>SIMULATED TARGET</span></div>');
    trail=L.polyline([route[0]],{color:"#62ff87",weight:3,opacity:.72,dashArray:"7 8"}).addTo(map);
    map.fitBounds(L.latLngBounds(route),{padding:[35,35]});
    addEvent("Target acquired • road-following simulation active");
    move();
  }

  function move() {
    if (!route.length || !target) return;
    const current=route[routeIndex], nextIndex=(routeIndex+1)%route.length, next=route[nextIndex];
    routeIndex=nextIndex; target.setLatLng(next);
    const points=trail.getLatLngs(); points.push(next); while(points.length>20) points.shift(); trail.setLatLngs(points);
    modeTicks++;
    if(modeTicks>=modes[modeIndex].ticks){ modeIndex=(modeIndex+1)%modes.length; modeTicks=0; addEvent(`${modes[modeIndex].name} • ${modes[modeIndex].label.toLowerCase()}`); }
    setTelemetry(current,next);
  }

  function temp(btn,text,ms){const old=btn.textContent;btn.disabled=true;btn.textContent=text;setTimeout(()=>{btn.disabled=false;btn.textContent=old;},ms);}
  function setMapMode(mode){[street,satellite,dark].forEach(l=>{if(map.hasLayer(l))map.removeLayer(l)}); if(mode==="satellite")satellite.addTo(map); else if(mode==="dark")dark.addTo(map); else street.addTo(map); addEvent(`Map layer switched • ${mode}`,false);}
  document.querySelectorAll(".map-mode").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".map-mode").forEach(x=>x.classList.remove("active"));b.classList.add("active");setMapMode(b.dataset.map);}));
  scanButton.addEventListener("click",()=>{temp(scanButton,"⌛ SCANNING...",1600);addEvent("Deep scan initialized",false);setTimeout(()=>addEvent("DEEP SCAN COMPLETE • road continuity confirmed"),1600);});
  pingButton.addEventListener("click",()=>{temp(pingButton,"◉ PINGING...",1100);pingTime();if(target)target.openPopup();addEvent("OUTBOUND PING SENT • simulated signal responded");});
  alertButton.addEventListener("click",()=>{temp(alertButton,"⚠ ALERT SENT",1400);addEvent("MAXIMUM CHEEGUN ALERT • PRANK MODE ACTIVATED");});

  pingTime();
  buildRoadRoute();
  setInterval(move,2800);
})();
