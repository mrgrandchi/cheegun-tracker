(() => {
  "use strict";

  const $ = id => document.getElementById(id);
  const mapEl = $("trackingMap"), signalValue = $("signalValue"), signalBar = $("signalBar");
  const movementValue = $("movementValue"), pingValue = $("pingValue"), zoneLabel = $("zoneLabel");
  const activityFeed = $("activityFeed"), speedValue = $("speedValue"), headingValue = $("headingValue");
  const scanButton = $("scanButton"), pingButton = $("pingButton"), alertButton = $("alertButton");
  const nearestPoi = $("nearestPoi"), nearestPoiType = $("nearestPoiType"), confidenceValue = $("confidenceValue"), clock = $("systemClock"), mapViewHud = $("mapViewHud");
  if (!mapEl || typeof L === "undefined") return;

  const thunderBay = [48.3809, -89.2477];
  const map = L.map(mapEl, { zoomControl: true, scrollWheelZoom: true }).setView(thunderBay, 14);
  const street = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' });
  const satellite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 19, attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a> — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community' });
  const dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", { maxZoom: 20, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' });
  street.addTo(map);

  // Public Thunder Bay landmarks/areas used only as visual map context.
  // CTN does not claim that Cheegun is at any of these places.
  const publicPois = [
    { name: "Prince Arthur's Landing", type: "PUBLIC WATERFRONT", lat: 48.4350, lon: -89.2190, icon: "◆" },
    { name: "Hillcrest Park", type: "PUBLIC VIEWPOINT", lat: 48.4276, lon: -89.2390, icon: "◇" },
    { name: "Kaministiquia River Heritage Park", type: "PUBLIC RIVERSIDE", lat: 48.3839, lon: -89.2494, icon: "≈" },
    { name: "Intercity Shopping Centre", type: "PUBLIC RETAIL AREA", lat: 48.4130, lon: -89.2620, icon: "□" },
    { name: "Arthur Street Marketplace", type: "PUBLIC RETAIL AREA", lat: 48.3850, lon: -89.2750, icon: "□" },
    { name: "Waverley Park", type: "PUBLIC PARK / LOOKOUT", lat: 48.4302, lon: -89.2470, icon: "△" }
  ];

  const poiIcon = L.divIcon({ className: "", html: '<div class="poi-marker"><span></span></div>', iconSize: [18,18], iconAnchor: [9,9] });
  const poiLayer = L.layerGroup().addTo(map);
  publicPois.forEach(p => {
    const marker = L.marker([p.lat, p.lon], { icon: poiIcon, keyboard: true }).addTo(poiLayer);
    marker.bindPopup(`<div class="poi-popup"><strong>${p.icon} ${p.name}</strong><br><span>${p.type}</span><small>PUBLIC MAP REFERENCE • NOT A TARGET LOCATION</small></div>`);
  });

  // CTN-only fictional zones. These are labels/visual zones, not observations of a person.
  const ctnZones = [
    { name: "WATERFRONT SIMULATION ZONE", lat: 48.4340, lon: -89.2240 },
    { name: "RIVERSIDE SIMULATION ZONE", lat: 48.3850, lon: -89.2475 },
    { name: "INTERCITY SIMULATION ZONE", lat: 48.4100, lon: -89.2600 }
  ];
  const ctnIcon = L.divIcon({ className: "", html: '<div class="ctn-zone-marker">CTN</div>', iconSize: [30,20], iconAnchor: [15,10] });
  ctnZones.forEach(z => {
    const m = L.marker([z.lat, z.lon], { icon: ctnIcon, interactive: true }).addTo(map);
    m.bindPopup(`<div class="poi-popup"><strong>◉ ${z.name}</strong><br><span>FICTIONAL CTN DESIGNATION</span><small>SIMULATION ONLY</small></div>`);
  });

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
  function updateClock() { if (clock) clock.textContent = new Date().toLocaleTimeString([], { hour12:false }); }
  function heading(a,b) {
    const dy=b[0]-a[0], dx=b[1]-a[1], deg=(Math.atan2(dx,dy)*180/Math.PI+360)%360;
    const dirs=["N","NE","E","SE","S","SW","W","NW"];
    return `${Math.round(deg)}° ${dirs[Math.round(deg/45)%8]}`;
  }
  function distanceKm(a,b) {
    const R=6371, p1=a[0]*Math.PI/180, p2=b[0]*Math.PI/180, dp=(b[0]-a[0])*Math.PI/180, dl=(b[1]-a[1])*Math.PI/180;
    const x=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;
    return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
  }
  function nearestPublicPoi(point) {
    let best=null, bestDistance=Infinity;
    publicPois.forEach(p=>{const d=distanceKm(point,[p.lat,p.lon]);if(d<bestDistance){bestDistance=d;best=p;}});
    return best ? { ...best, distance:bestDistance } : null;
  }
  function setTelemetry(a,b) {
    const m=modes[modeIndex], speed=m.min===m.max?m.min:m.min+Math.random()*(m.max-m.min);
    signal=Math.max(80,Math.min(99,signal+Math.floor(Math.random()*5)-2));
    signalValue.textContent=`${signal}%`; signalBar.style.width=`${signal}%`;
    movementValue.textContent=m.name; speedValue.textContent=`${speed.toFixed(1)} KM/H`;
    headingValue.textContent=heading(a,b); zoneLabel.textContent=m.label; pingTime();
    if (confidenceValue) confidenceValue.textContent=`${Math.max(88,Math.min(99,signal+Math.floor(Math.random()*4)))}%`;
    const poi=nearestPublicPoi(b);
    if (poi && nearestPoi) { nearestPoi.textContent=poi.name; nearestPoiType.textContent=`${poi.type} • ${poi.distance.toFixed(2)} km away • public reference`; }
  }

  async function buildRoadRoute() {
    addEvent("Road-network route request initialized", false);
    try {
      const coords = [[48.38145,-89.24705],[48.38015,-89.24105],[48.38295,-89.23825],[48.38405,-89.24220],[48.38200,-89.24510],[48.37990,-89.24620]].map(([lat,lon])=>`${lon},${lat}`).join(";");
      const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
      const response = await fetch(url); if (!response.ok) throw new Error("routing service unavailable");
      const data = await response.json(); if (!data.routes?.[0]?.geometry?.coordinates?.length) throw new Error("no route");
      route=data.routes[0].geometry.coordinates.map(([lon,lat])=>[lat,lon]); addEvent(`Road geometry acquired • ${route.length} mapped points`);
    } catch (err) {
      route=[[48.38145,-89.24705],[48.38015,-89.24105],[48.38295,-89.23825],[48.38405,-89.24220],[48.38200,-89.24510],[48.37990,-89.24620]];
      addEvent("Road routing unavailable • using compact simulated fallback", false);
    }
    routeIndex=0; target=L.marker(route[0],{icon:targetIcon}).addTo(map);
    target.bindPopup('<div class="target-popup">CHEEGUN SIGNAL<br><span>SIMULATED TARGET</span></div>');
    trail=L.polyline([route[0]],{color:"#62ff87",weight:3,opacity:.72,dashArray:"7 8"}).addTo(map);
    map.fitBounds(L.latLngBounds(route),{padding:[35,35]});
    addEvent("Target acquired • road-following simulation active"); move();
  }
  function move() {
    if (!route.length || !target) return;
    const current=route[routeIndex], nextIndex=(routeIndex+1)%route.length, next=route[nextIndex]; routeIndex=nextIndex; target.setLatLng(next);
    const points=trail.getLatLngs(); points.push(next); while(points.length>20) points.shift(); trail.setLatLngs(points);
    modeTicks++; if(modeTicks>=modes[modeIndex].ticks){modeIndex=(modeIndex+1)%modes.length;modeTicks=0;addEvent(`${modes[modeIndex].name} • ${modes[modeIndex].label.toLowerCase()}`);}
    setTelemetry(current,next);
  }
  function temp(btn,text,ms){const old=btn.textContent;btn.disabled=true;btn.textContent=text;setTimeout(()=>{btn.disabled=false;btn.textContent=old;},ms);}
  function setMapMode(mode){[street,satellite,dark].forEach(l=>{if(map.hasLayer(l))map.removeLayer(l)});if(mode==="satellite")satellite.addTo(map);else if(mode==="dark")dark.addTo(map);else street.addTo(map);if(mapViewHud)mapViewHud.textContent=mode.toUpperCase();addEvent(`Map layer switched • ${mode}`,false);}
  document.querySelectorAll(".map-mode").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".map-mode").forEach(x=>x.classList.remove("active"));b.classList.add("active");setMapMode(b.dataset.map);}));
  scanButton.addEventListener("click",()=>{temp(scanButton,"⌛ SCANNING...",1600);addEvent("Deep scan initialized",false);setTimeout(()=>addEvent("DEEP SCAN COMPLETE • public POI layer synchronized"),1600);});
  pingButton.addEventListener("click",()=>{temp(pingButton,"◉ PINGING...",1100);pingTime();if(target)target.openPopup();addEvent("OUTBOUND PING SENT • simulated signal responded");});
  alertButton.addEventListener("click",()=>{temp(alertButton,"⚠ ALERT SENT",1400);addEvent("MAXIMUM CHEEGUN ALERT • PRANK MODE ACTIVATED");});
  map.on("popupopen", e=>{if(e.popup?.getContent?.()?.includes?.("PUBLIC MAP REFERENCE")) addEvent("Public landmark selected • no target data associated",false);});

  pingTime(); updateClock(); setInterval(updateClock,1000); buildRoadRoute(); setInterval(move,2800);
})();
