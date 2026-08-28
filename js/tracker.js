(() => {
  "use strict";
  const $=id=>document.getElementById(id);
  const mapEl=$("trackingMap"),signalValue=$("signalValue"),signalBar=$("signalBar"),movementValue=$("movementValue"),pingValue=$("pingValue"),zoneLabel=$("zoneLabel"),activityFeed=$("activityFeed"),speedValue=$("speedValue"),headingValue=$("headingValue"),scanButton=$("scanButton"),pingButton=$("pingButton"),alertButton=$("alertButton"),nearestPoi=$("nearestPoi"),nearestPoiType=$("nearestPoiType"),confidenceValue=$("confidenceValue"),clock=$("systemClock"),mapViewHud=$("mapViewHud");
  if(!mapEl||typeof L==="undefined")return;
  const map=L.map(mapEl,{zoomControl:true,scrollWheelZoom:true}).setView([48.410,-89.250],12.7);
  const street=L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
  const satellite=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:'Tiles &copy; <a href="https://www.esri.com/">Esri</a>'});
  const dark=L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{maxZoom:20,attribution:'&copy; OpenStreetMap contributors &copy; CARTO'});street.addTo(map);

  // F I C T I O N A L  C T N  R O U T E  N E T W O R K
  // These are pre-authored simulation corridors, not observations of a person.
  // Route names describe broad city districts/areas only. The target has no device/GPS input.
  const network={
    "NORTH LOOP": [[48.430,-89.226],[48.439,-89.229],[48.444,-89.247],[48.438,-89.263],[48.428,-89.270],[48.420,-89.258]],
    "INTERCITY LOOP": [[48.420,-89.258],[48.414,-89.245],[48.404,-89.244],[48.397,-89.253],[48.391,-89.268],[48.398,-89.280],[48.411,-89.274],[48.420,-89.258]],
    "DOWNTOWN LOOP": [[48.420,-89.258],[48.426,-89.250],[48.431,-89.242],[48.435,-89.230],[48.429,-89.218],[48.420,-89.219],[48.413,-89.232],[48.420,-89.258]],
    "WEST LOOP": [[48.391,-89.268],[48.386,-89.284],[48.383,-89.301],[48.380,-89.316],[48.389,-89.324],[48.399,-89.313],[48.398,-89.280],[48.391,-89.268]],
    "SOUTH LOOP": [[48.398,-89.280],[48.389,-89.288],[48.378,-89.294],[48.365,-89.296],[48.356,-89.286],[48.364,-89.276],[48.381,-89.272],[48.398,-89.280]],
    "EAST / PORT LOOP": [[48.420,-89.219],[48.411,-89.211],[48.398,-89.202],[48.387,-89.205],[48.379,-89.218],[48.389,-89.231],[48.405,-89.230],[48.420,-89.219]]
  };
  const routes=Object.entries(network).map(([name,points])=>({name,points}));
  const networkLayer=L.layerGroup().addTo(map);
  routes.forEach((r,i)=>L.polyline(r.points,{color:i%2?'#65d9ff':'#62ff87',weight:2,opacity:.22,dashArray:"5 9",interactive:false}).addTo(networkLayer));

  const publicPois=[
    {name:"Waverley Resource Library",type:"PUBLIC LIBRARY",lat:48.43617,lon:-89.22369},
    {name:"Waverley Park",type:"PUBLIC PARK / LOOKOUT",lat:48.43750,lon:-89.22667},
    {name:"Connaught Square",type:"PUBLIC CIVIC SPACE",lat:48.43667,lon:-89.22392},
    {name:"Prince Arthur's Landing",type:"PUBLIC WATERFRONT",lat:48.43309,lon:-89.21718},
    {name:"Marina Park",type:"PUBLIC WATERFRONT",lat:48.43415,lon:-89.21583},
    {name:"Hillcrest Park",type:"PUBLIC VIEWPOINT",lat:48.4276,lon:-89.2390},
    {name:"Kaministiquia River Heritage Park",type:"PUBLIC RIVERSIDE",lat:48.38181,lon:-89.24300},
    {name:"Intercity Shopping Centre",type:"PUBLIC RETAIL AREA",lat:48.40381,lon:-89.24361},
    {name:"Arthur Street Marketplace",type:"PUBLIC RETAIL AREA",lat:48.38230,lon:-89.30818},
    {name:"Brodie Resource Library",type:"PUBLIC LIBRARY",lat:48.3817,lon:-89.2475},
    {name:"County Park Library",type:"PUBLIC LIBRARY",lat:48.393,lon:-89.285},
    {name:"Chancellor Paterson Library",type:"PUBLIC LIBRARY / CAMPUS",lat:48.4217,lon:-89.2617}
  ];
  const poiIcon=L.divIcon({className:"",html:'<div class="poi-marker"><span></span></div>',iconSize:[18,18],iconAnchor:[9,9]});
  const poiLayer=L.layerGroup().addTo(map);
  publicPois.forEach(p=>L.marker([p.lat,p.lon],{icon:poiIcon}).addTo(poiLayer).bindPopup(`<div class="poi-popup"><strong>◆ ${p.name}</strong><br><span>${p.type}</span><small>PUBLIC MAP REFERENCE • NOT A TARGET LOCATION</small></div>`));

  const districtCenters=[
    {name:"NORTH / WAVERLEY",lat:48.437,lon:-89.236},
    {name:"DOWNTOWN / WATERFRONT",lat:48.426,lon:-89.225},
    {name:"INTERCITY",lat:48.405,lon:-89.252},
    {name:"WEST END",lat:48.391,lon:-89.292},
    {name:"SOUTH CORE",lat:48.371,lon:-89.287},
    {name:"EAST / PORT",lat:48.399,lon:-89.214}
  ];
  const districtLayer=L.layerGroup().addTo(map);
  districtCenters.forEach(d=>L.marker([d.lat,d.lon],{icon:L.divIcon({className:"",html:`<div class="ctn-zone-marker">${d.name}</div>`,iconSize:[130,20],iconAnchor:[65,10]})}).addTo(districtLayer));

  const targetIcon=L.divIcon({className:"",html:'<div class="target-marker"><span class="target-core"></span></div>',iconSize:[34,34],iconAnchor:[17,17]});
  let target=null,trail=null,route=[],routeIndex=0,signal=94,routeIndexNetwork=0,modeIndex=0,modeTicks=0;
  const modes=[
    {name:"WALKING",label:"DISTRICT WALK",min:3,max:4.8,ticks:10},
    {name:"BUS STOP",label:"SIMULATED TRANSIT STOP",min:0,max:0,ticks:5},
    {name:"ON BUS",label:"CROSS-DISTRICT TRANSIT",min:18,max:38,ticks:18},
    {name:"WALKING",label:"LOCAL WALK",min:3,max:4.6,ticks:9},
    {name:"ON BUS",label:"INTER-DISTRICT TRANSIT",min:20,max:40,ticks:20}
  ];
  function addEvent(message,live=true){const e=document.createElement("div");e.className=live?"event liveevent":"event";e.innerHTML=`<b>[${live?"LIVE":"SYS"}]</b> ${message}`;activityFeed.prepend(e);while(activityFeed.children.length>8)activityFeed.lastElementChild.remove();}
  function pingTime(){pingValue.textContent=new Date().toLocaleTimeString([],{hour12:false});}
  function updateClock(){if(clock)clock.textContent=new Date().toLocaleTimeString([],{hour12:false});}
  function distanceKm(a,b){const R=6371,p1=a[0]*Math.PI/180,p2=b[0]*Math.PI/180,dp=(b[0]-a[0])*Math.PI/180,dl=(b[1]-a[1])*Math.PI/180,x=Math.sin(dp/2)**2+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)**2;return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));}
  function heading(a,b){const deg=(Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI+360)%360,dirs=["N","NE","E","SE","S","SW","W","NW"];return `${Math.round(deg)}° ${dirs[Math.round(deg/45)%8]}`;}
  function nearestPoi(point){let best=null,bd=Infinity;publicPois.forEach(p=>{const d=distanceKm(point,[p.lat,p.lon]);if(d<bd){bd=d;best=p;}});return best?{...best,distance:bd}:null;}
  function setTelemetry(a,b){const m=modes[modeIndex],speed=m.min===m.max?m.min:m.min+Math.random()*(m.max-m.min);signal=Math.max(80,Math.min(99,signal+Math.floor(Math.random()*5)-2));signalValue.textContent=`${signal}%`;signalBar.style.width=`${signal}%`;movementValue.textContent=m.name;speedValue.textContent=`${speed.toFixed(1)} KM/H`;headingValue.textContent=heading(a,b);zoneLabel.textContent=m.label;pingTime();if(confidenceValue)confidenceValue.textContent=`${Math.max(88,Math.min(99,signal+Math.floor(Math.random()*4)))}%`;const p=nearestPoi(b);if(p&&nearestPoi){nearestPoi.textContent=p.name;nearestPoiType.textContent=`${p.type} • ${p.distance.toFixed(2)} km away • public reference`;}}
  function createNetworkRoute(){const r=routes[routeIndexNetwork];route=r.points.slice();routeIndex=0;routeIndexNetwork=(routeIndexNetwork+1)%routes.length;addEvent(`SIM ROUTE LOADED • ${r.name}`,false);if(target)target.remove();if(trail)trail.remove();target=L.marker(route[0],{icon:targetIcon}).addTo(map);target.bindPopup('<div class="target-popup">CTN SIMULATION TARGET<br><span>NO REAL LOCATION DATA</span></div>');trail=L.polyline([route[0]],{color:"#62ff87",weight:3,opacity:.72,dashArray:"7 8"}).addTo(map);}
  function move(){if(!route.length||!target)return;const current=route[routeIndex],nextIndex=(routeIndex+1)%route.length,next=route[nextIndex];routeIndex=nextIndex;target.setLatLng(next);const pts=trail.getLatLngs();pts.push(next);while(pts.length>24)pts.shift();trail.setLatLngs(pts);modeTicks++;if(modeTicks>=modes[modeIndex].ticks){modeIndex=(modeIndex+1)%modes.length;modeTicks=0;addEvent(`${modes[modeIndex].name} • ${modes[modeIndex].label.toLowerCase()}`);if(routeIndex===0)createNetworkRoute();}setTelemetry(current,next);}
  function temp(btn,text,ms){const old=btn.textContent;btn.disabled=true;btn.textContent=text;setTimeout(()=>{btn.disabled=false;btn.textContent=old;},ms);}
  function setMapMode(mode){[street,satellite,dark].forEach(l=>{if(map.hasLayer(l))map.removeLayer(l)});if(mode==="satellite")satellite.addTo(map);else if(mode==="dark")dark.addTo(map);else street.addTo(map);if(mapViewHud)mapViewHud.textContent=mode.toUpperCase();addEvent(`Map layer switched • ${mode}`,false);}
  document.querySelectorAll(".map-mode").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".map-mode").forEach(x=>x.classList.remove("active"));b.classList.add("active");setMapMode(b.dataset.map);}));
  scanButton.addEventListener("click",()=>{temp(scanButton,"⌛ SCANNING...",1600);addEvent("Deep scan initialized",false);setTimeout(()=>addEvent(`NETWORK SCAN COMPLETE • ${routes.length} simulated corridors available`),1600);});
  pingButton.addEventListener("click",()=>{temp(pingButton,"◉ PINGING...",1100);pingTime();if(target)target.openPopup();addEvent("OUTBOUND PING SENT • simulated response");});
  alertButton.addEventListener("click",()=>{temp(alertButton,"⚠ ALERT SENT",1400);addEvent("MAXIMUM CHEEGUN ALERT • PRANK MODE ACTIVATED");});
  pingTime();updateClock();setInterval(updateClock,1000);createNetworkRoute();setInterval(move,2800);
})();
