(() => {
  "use strict";

  const mapEl=document.getElementById("trackingMap");
  const signalValue=document.getElementById("signalValue"),signalBar=document.getElementById("signalBar"),movementValue=document.getElementById("movementValue"),pingValue=document.getElementById("pingValue"),zoneLabel=document.getElementById("zoneLabel"),activityFeed=document.getElementById("activityFeed"),speedValue=document.getElementById("speedValue"),headingValue=document.getElementById("headingValue"),mapViewHud=document.getElementById("mapViewHud"),providerValue=document.getElementById("providerValue");
  const scanButton=document.getElementById("scanButton"),pingButton=document.getElementById("pingButton"),alertButton=document.getElementById("alertButton");
  if(!mapEl||typeof L==="undefined")return;

  const thunderBay=[48.3809,-89.2477];
  const map=L.map(mapEl,{zoomControl:true,scrollWheelZoom:true}).setView(thunderBay,13);

  const street=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
  const satellite=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'});
  const dark=L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{maxZoom:20,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'});
  street.addTo(map);

  const targetIcon=L.divIcon({className:"",html:'<div class="target-marker"><span class="target-core"></span></div>',iconSize:[34,34],iconAnchor:[17,17]});
  let target=L.marker([48.3815,-89.2470],{icon:targetIcon}).addTo(map).bindPopup('<div class="target-popup">CHEEGUN SIGNAL<br><span>SIMULATED TARGET</span></div>');
  const trail=L.polyline([], {color:"#62ff87",weight:2,opacity:.7,dashArray:"6 8"}).addTo(map);

  const zones=[
    {name:"DOWNTOWN SECTOR",lat:48.3815,lng:-89.2470},
    {name:"WATERFRONT SECTOR",lat:48.3825,lng:-89.2380},
    {name:"NORTH SECTOR",lat:48.3910,lng:-89.2470},
    {name:"WEST SECTOR",lat:48.3800,lng:-89.2650},
    {name:"CENTRAL SECTOR",lat:48.3755,lng:-89.2500}
  ];
  let signal=94,zoneIndex=0,trailPoints=[];
  const movement=["ROAMING","MOVING","PAUSED","ROAMING"];

  function addEvent(message,live=true){const e=document.createElement("div");e.className=live?"event liveevent":"event";e.innerHTML=`<b>[${live?"LIVE":"SYS"}]</b> ${message}`;activityFeed.prepend(e);while(activityFeed.children.length>7)activityFeed.lastElementChild.remove()}
  function ping(){pingValue.textContent=new Date().toLocaleTimeString([], {hour12:false})}
  function setMapMode(mode){
    [street,satellite,dark].forEach(layer=>{if(map.hasLayer(layer))map.removeLayer(layer)});
    let active=street,provider="OPENSTREETMAP",label="STREET";
    if(mode==="satellite"){active=satellite;provider="ESRI WORLD IMAGERY";label="SATELLITE"}
    if(mode==="dark"){active=dark;provider="CARTO / OSM";label="DARK"}
    active.addTo(map);mapViewHud.textContent=label;providerValue.textContent=provider;
    document.querySelectorAll(".map-mode").forEach(btn=>btn.classList.toggle("active",btn.dataset.map===mode));
    addEvent(`Map layer switched • ${label.toLowerCase()}`,false);
  }
  document.querySelectorAll(".map-mode").forEach(btn=>btn.addEventListener("click",()=>setMapMode(btn.dataset.map)));

  function moveTarget(){
    signal=Math.max(78,Math.min(99,signal+Math.floor(Math.random()*7)-3));
    const z=zones[zoneIndex++%zones.length],jitter=()=>((Math.random()-.5)*.004);
    const pos=[z.lat+jitter(),z.lng+jitter()];
    target.setLatLng(pos);trailPoints.push(pos);if(trailPoints.length>6)trailPoints.shift();trail.setLatLngs(trailPoints);
    const m=movement[Math.floor(Math.random()*movement.length)],speed=(m==="PAUSED"?0:(2.5+Math.random()*4.5)).toFixed(1),head=["N","NE","E","SE","S","SW","W","NW"][Math.floor(Math.random()*8)];
    signalValue.textContent=`${signal}%`;signalBar.style.width=`${signal}%`;movementValue.textContent=m;speedValue.textContent=`${speed} KM/H`;headingValue.textContent=`${Math.floor(Math.random()*60)+210}° ${head}`;zoneLabel.textContent=z.name;ping();
    if(Math.random()>.3)addEvent(`Triangulation updated • ${z.name.toLowerCase()}`);
  }
  function temporary(btn,text,duration){const old=btn.textContent;btn.disabled=true;btn.textContent=text;setTimeout(()=>{btn.disabled=false;btn.textContent=old},duration)}
  scanButton.addEventListener("click",()=>{temporary(scanButton,"⌛ SCANNING...",1500);addEvent("Deep scan initialized",false);setTimeout(()=>addEvent("DEEP SCAN COMPLETE • simulated signal confirmed"),1500)});
  pingButton.addEventListener("click",()=>{temporary(pingButton,"◉ PINGING...",1100);ping();target.openPopup();addEvent("OUTBOUND PING SENT • simulated signal responded")});
  alertButton.addEventListener("click",()=>{temporary(alertButton,"⚠ ALERT SENT",1400);addEvent("MAXIMUM CHEEGUN ALERT • PRANK MODE ACTIVATED")});
  map.on("zoomend",()=>addEvent(`Map zoom changed • level ${map.getZoom()}`,false));
  addEvent("Map network established • telemetry simulated",false);ping();moveTarget();setInterval(moveTarget,3500);
})();
