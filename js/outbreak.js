(()=>{const $=id=>document.getElementById(id);
const map=L.map("gameMap",{zoomControl:true,preferCanvas:true}).setView([48.414,-89.245],15);
const satellite=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:"Tiles © Esri"});
const labels=L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,opacity:.7,attribution:"© Esri"});
satellite.addTo(map);labels.addTo(map);
const icon=(c,h,s=28)=>L.divIcon({className:"",html:'<div class="'+c+'">'+h+'</div>',iconSize:[s,s],iconAnchor:[s/2,s/2]});
const st=document.createElement("style");st.textContent='.survivor{width:34px;height:34px;border-radius:50%;background:#59ff87;border:3px solid #e2ffea;box-shadow:0 0 0 10px #59ff8722,0 0 26px #59ff87;display:grid;place-items:center;color:#06240e}.zombie{width:18px;height:18px;border-radius:50%;background:#ff4f61;border:2px solid #ffd2d6;box-shadow:0 0 13px #ff4f61}.poi{min-width:30px;height:30px;border-radius:8px;background:#111e;border:1px solid #77807a;display:grid;place-items:center;font-size:15px;box-shadow:0 3px 15px #0009}.destination{width:18px;height:18px;border-radius:50%;border:2px solid #fff;background:#59ff87;box-shadow:0 0 18px #59ff87}.leaflet-tile-pane{filter:saturate(.72) contrast(1.12) brightness(.68)}.leaflet-control-zoom a{background:#0b0e10!important;color:#d8dedb!important;border-color:#303936!important}.leaflet-popup-content-wrapper,.leaflet-popup-tip{background:#0b0f0e;color:#e6eee9;border:1px solid #3a4740}.noise-pulse{animation:noisePulse 1.2s ease-out infinite}.zombie-awareness{pointer-events:none}@keyframes noisePulse{0%{stroke-opacity:.95;fill-opacity:.18}100%{stroke-opacity:0;fill-opacity:0}}';document.head.appendChild(st);

let player=[48.414,-89.245],moving=false,selected=false,health=100,hunger=82,thirst=76,stamina=94,minutes=480,activePOI=null,searching=false,noiseLevel=0,noisePos=null,noiseTimer=0,gameOver=false;
const survivor=L.marker(player,{icon:icon("survivor","▲",34),zIndexOffset:1000}).addTo(map);
const visionRadius=185, explored=[[...player]], zombies=[];let destMarker,routeLine,noiseRing,fogLayer,visionCircle;
const world=[[48.400,-89.270],[48.400,-89.220],[48.430,-89.220],[48.430,-89.270]];

// --- TERRAIN / WORLD GEOMETRY ---
const buildingDefs=[
 {name:"INTERCITY SUPPLY CENTRE",type:"commercial",loot:5,danger:4,time:12,pos:[48.4148,-89.2468],shape:[[48.4160,-89.2490],[48.4160,-89.2458],[48.4136,-89.2458],[48.4136,-89.2490]]},
 {name:"PARKING AREA",type:"vehicle",loot:2,danger:2,time:3,pos:[48.4125,-89.2450],shape:[[48.4133,-89.2456],[48.4133,-89.2420],[48.4116,-89.2420],[48.4116,-89.2456]]},
 {name:"RESIDENTIAL BLOCK",type:"residential",loot:3,danger:2,time:7,pos:[48.417,-89.2415],shape:[[48.4177,-89.2432],[48.4177,-89.2406],[48.4157,-89.2406],[48.4157,-89.2432]]},
 {name:"MEDICAL CLINIC",type:"medical",loot:5,danger:4,time:9,pos:[48.4108,-89.2405],shape:[[48.4115,-89.2415],[48.4115,-89.2395],[48.4101,-89.2395],[48.4101,-89.2415]]}
];
const forestAreas=[
 [[48.4195,-89.258],[48.422,-89.252],[48.419,-89.247],[48.4168,-89.251]],
 [[48.4085,-89.254],[48.4115,-89.251],[48.4095,-89.246],[48.4065,-89.248]]
];
const waterAreas=[
 [[48.401,-89.233],[48.430,-89.233],[48.430,-89.226],[48.401,-89.226]],
 [[48.406,-89.262],[48.410,-89.262],[48.410,-89.257],[48.406,-89.257]]
];
const roadPaths=[
 [[48.422,-89.261],[48.419,-89.255],[48.416,-89.251],[48.414,-89.247],[48.411,-89.243],[48.408,-89.238]],
 [[48.420,-89.251],[48.417,-89.248],[48.414,-89.245],[48.412,-89.240],[48.409,-89.236]],
 [[48.418,-89.257],[48.416,-89.251],[48.414,-89.245],[48.412,-89.239]]
];
roadPaths.forEach(path=>L.polyline(path,{pane:"overlayPane",color:"#8ba6b5",weight:2,opacity:.28,dashArray:"2 7",interactive:false}).addTo(map));
forestAreas.forEach(a=>L.polygon(a,{className:"terrain-forest",color:"#4d8d63",weight:1,fillColor:"#245238",fillOpacity:.16,interactive:false}).addTo(map));
waterAreas.forEach(a=>L.polygon(a,{className:"terrain-water",color:"#3d8fb4",weight:1.5,fillColor:"#163e59",fillOpacity:.45,interactive:false}).addTo(map));

const found=new Set(),searched=new Set(),buildingLayers=new Map();
const poiGlyph={commercial:"🏪",vehicle:"🚗",residential:"🏠",medical:"✚"};
const tables={commercial:["🥫 Canned Food","💧 Water Bottle","🎒 Backpack","🔋 Battery","🔦 Flashlight","🔧 Crowbar"],vehicle:["💧 Water Bottle","🔋 Battery","🩹 Bandage","🔦 Flashlight"],residential:["🥫 Canned Food","💧 Water Bottle","🔪 Kitchen Knife","🩹 Bandage","🎒 Backpack"],medical:["🩹 Bandage","💉 Medical Kit","💊 Painkillers","🩸 Trauma Kit"]};
buildingDefs.forEach(p=>{const layer=L.polygon(p.shape,{className:"building-zone",color:"#68706d",weight:1,fillColor:"#17201d",fillOpacity:.5,interactive:true}).addTo(map);layer.on("click",()=>openPOI(p));buildingLayers.set(p.name,layer);p.marker=L.marker(p.pos,{icon:icon("poi",poiGlyph[p.type],30),opacity:.28}).addTo(map);p.marker.on("click",()=>openPOI(p))});

// --- FOG / VISION ---
visionCircle=L.circle(player,{radius:visionRadius,color:"#59ff87",weight:1,opacity:.28,fillColor:"#59ff87",fillOpacity:.025,interactive:false,className:"vision-radius"}).addTo(map);
function updateFog(){const holes=explored.slice(-22).map(p=>{const n=16,r=visionRadius/111000;return Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return [p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r/Math.cos(p[0]*Math.PI/180)]})});if(fogLayer)map.removeLayer(fogLayer);fogLayer=L.polygon([world,...holes],{pane:"overlayPane",stroke:false,fillColor:"#020504",fillOpacity:.72,interactive:false,fillRule:"evenodd",className:"fog-layer"}).addTo(map);fogLayer.bringToFront();visionCircle.bringToFront()}
function reveal(){const last=explored[explored.length-1];if(!last||L.latLng(last).distanceTo(player)>55)explored.push([...player]);visionCircle.setLatLng(player);updateFog()}

// --- GEOMETRY / MOVEMENT ---
function inside(p,poly){let x=p.lat,y=p.lng,hit=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let xi=poly[i][0],yi=poly[i][1],xj=poly[j][0],yj=poly[j][1];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))hit=!hit}return hit}
function blocked(p){return buildingDefs.some(b=>inside(p,b.shape))||waterAreas.some(a=>inside(p,a))}
function terrainAt(p){if(waterAreas.some(a=>inside(p,a)))return "water";if(forestAreas.some(a=>inside(p,a)))return "forest";return "open"}
function lineBlocked(a,b){for(let i=1;i<=30;i++){const x=i/30,p=L.latLng(a.lat+(b.lat-a.lat)*x,a.lng+(b.lng-a.lng)*x);if(blocked(p))return true}return false}
function detour(a,b){for(const obs of [...buildingDefs.map(x=>x.shape),...waterAreas]){const pts=obs.map(x=>L.latLng(x[0],x[1]));const cands=pts.map(p=>{const latPad=p.lat>=48.415?0.00055:-0.00055,lngPad=p.lng>=-89.245?0.00055:-0.00055;return L.latLng(p.lat+latPad,p.lng+lngPad)});for(const c of cands){if(!blocked(c)&&!lineBlocked(a,c)&&!lineBlocked(c,b))return [a,c,b]}}return [a,b]}
function route(dest){const s=L.latLng(player),e=L.latLng(dest);return lineBlocked(s,e)?detour(s,e):[s,e]}

// --- ZOMBIES / AWARENESS ---
function spawnZombies(){const spots=[[48.413,-89.249],[48.416,-89.244],[48.410,-89.247],[48.418,-89.239],[48.409,-89.238],[48.420,-89.251],[48.412,-89.240],[48.417,-89.254]];spots.forEach((p,i)=>{const z={id:i,pos:p,state:"IDLE",speed:.000018,lastSeen:0};z.awareness=L.circle(p,{className:"zombie-awareness",radius:55,color:"#ff4f61",weight:1,opacity:.16,fillColor:"#ff4f61",fillOpacity:.025,interactive:false}).addTo(map);z.marker=L.marker(p,{icon:icon("zombie","●",18),zIndexOffset:500}).addTo(map);z.marker.bindTooltip("INFECTED • IDLE",{direction:"top"});zombies.push(z)})}spawnZombies();
function updateZombieVisual(z){const r=z.state==="CHASE"?95:z.state==="INVESTIGATE"?70:z.state==="SEARCH"?62:48;z.awareness.setLatLng(z.pos).setRadius(r);z.awareness.setStyle({color:z.state==="CHASE"?"#ff3148":"#ff4f61",opacity:z.state==="CHASE"?.48:.16,fillOpacity:z.state==="CHASE"?.08:.025})}
function makeNoise(amount,label){if(gameOver)return;noiseLevel=Math.min(100,noiseLevel+amount);noisePos=[...player];noiseTimer=9000;if(noiseRing)map.removeLayer(noiseRing);noiseRing=L.circle(player,{className:"noise-pulse",radius:Math.max(42,amount*3.5),color:"#ffb347",weight:2,fillColor:"#ff7a45",fillOpacity:.12,interactive:false}).addTo(map);log("NOISE "+amount+" • "+label);$("objective").textContent="⚠ NOISE DETECTED • STAY ALERT"}
function zombieAI(){if(gameOver)return;const pl=L.latLng(player);zombies.forEach(z=>{const zp=L.latLng(z.pos),d=zp.distanceTo(pl);let target=null;if(d<18){gameOver=true;health=0;hud();log("SURVIVOR OVERRUN • SESSION FAILED");$("objective").textContent="☠ YOU WERE OVERRUN";return}if(d<85){target=player;z.state="CHASE";z.speed=.000045;z.lastSeen=5}else if(noisePos&&noiseTimer>0&&zp.distanceTo(noisePos)<Math.max(55,noiseLevel*3)){target=noisePos;z.state="INVESTIGATE";z.speed=.000028}else if(z.lastSeen>0){z.lastSeen--;z.state="SEARCH";z.speed=.00002}else{z.state="IDLE";z.speed=.000012}if(target){let t=L.latLng(target),dx=t.lat-z.pos[0],dy=t.lng-z.pos[1],len=Math.hypot(dx,dy)||1;let next=L.latLng(z.pos[0]+dx/len*z.speed,z.pos[1]+dy/len*z.speed);if(!blocked(next))z.pos=[next.lat,next.lng]}else if(Math.random()<.18){let next=L.latLng(z.pos[0]+(Math.random()-.5)*z.speed*3,z.pos[1]+(Math.random()-.5)*z.speed*3);if(!blocked(next))z.pos=[next.lat,next.lng]}z.marker.setLatLng(z.pos);z.marker.setTooltipContent("INFECTED • "+z.state);updateZombieVisual(z)})}
setInterval(()=>{if(noiseTimer>0){noiseTimer-=500;noiseLevel=Math.max(0,noiseLevel-4);if(noiseRing)noiseRing.setRadius(Math.max(10,noiseLevel*3.2))}else if(noiseRing){map.removeLayer(noiseRing);noiseRing=null;noisePos=null}zombieAI()},500);

// --- DISCOVERY / INTERACTION ---
function log(m){let e=document.createElement("div");e.className="log";e.innerHTML='<b>['+$("gameTime").textContent+']</b> '+m;$("gameFeed").prepend(e);while($("gameFeed").children.length>7)$("gameFeed").lastElementChild.remove()}
function inv(){return JSON.parse(localStorage.getItem("outbreak_inventory")||"[]")}
function saveInv(a){localStorage.setItem("outbreak_inventory",JSON.stringify(a));$("inventory").innerHTML=a.length?a.slice(-5).map(x=>'<span class="item">'+x+'</span>').join(""):"<span>EMPTY</span>";$("inventoryCount").textContent=a.length+" / 8"}
function hud(){[["health",health],["hunger",hunger],["thirst",thirst],["stamina",stamina]].forEach(([k,v])=>{$(k).textContent=Math.round(v)+"%";$(k+"Bar").style.width=v+"%"});let hh=Math.floor(minutes/60)%24,m=minutes%60;$("gameTime").textContent=String(hh).padStart(2,"0")+":"+String(m).padStart(2,"0");survivor.getElement()?.classList.toggle("survivor-selected",selected)}
function discover(){buildingDefs.forEach(p=>{const d=L.latLng(player).distanceTo(p.pos),layer=buildingLayers.get(p.name);if(!found.has(p.name)&&d<visionRadius){found.add(p.name);p.marker.setOpacity(1);layer.setStyle({color:"#65e992",weight:2,fillColor:"#3b8f5a",fillOpacity:.16});log("NEW LOCATION DISCOVERED • "+p.name);$("objective").textContent="EXPLORE • DISCOVER • FIND SUPPLIES"}if(found.has(p.name)&&d<85&&!searched.has(p.name)){activePOI=p;layer.setStyle({color:"#ffd277",weight:2,fillOpacity:.22});$("objective").textContent="LOCATION IN RANGE • "+p.name}})}
function openPOI(p){if(!found.has(p.name)||L.latLng(player).distanceTo(p.pos)>85){log("MOVE CLOSER TO INTERACT");return}if(searched.has(p.name)){log("LOCATION ALREADY SEARCHED");return}activePOI=p;$("lootTitle").textContent=p.name;$("lootMeta").textContent=p.type.toUpperCase()+" • LOOT "+p.loot+"/5 • RISK "+p.danger+"/5 • "+p.time+" MIN";$("lootModal").classList.remove("hidden")}
function searchPOI(){let p=activePOI;if(!p||searching)return;makeNoise(Math.min(70,20+p.danger*8),"SEARCHING "+p.name);searching=true;$("lootModal").classList.add("hidden");$("objective").textContent="SEARCHING • "+p.name;setTimeout(()=>{minutes+=p.time;searched.add(p.name);buildingLayers.get(p.name).setStyle({color:"#66716d",weight:1,fillColor:"#151816",fillOpacity:.22});let count=Math.min(5,1+Math.floor(Math.random()*p.loot)),loot=Array.from({length:count},()=>tables[p.type][Math.floor(Math.random()*tables[p.type].length)]);$("lootResults").dataset.loot=JSON.stringify(loot);$("lootResults").innerHTML=loot.map(x=>'<div class="loot-found">'+x+' <small>'+["COMMON","UNCOMMON","RARE"][Math.floor(Math.random()*3)]+"</small></div>").join("");$("lootResultsModal").classList.remove("hidden");log("SEARCH COMPLETE • "+loot.length+" ITEMS FOUND");searching=false;hud()},p.time*120)}

// --- MOVEMENT ---
function move(pts){makeNoise(10,"MOVEMENT");moving=true;selected=false;let i=0;function next(){if(i>=pts.length-1){moving=false;log("ARRIVED AT DESTINATION");discover();reveal();hud();return}let a=L.latLng(player),b=pts[++i],n=0,steps=Math.max(15,Math.ceil(a.distanceTo(b)/4));let t=setInterval(()=>{n++;let x=n/steps;const candidate=L.latLng(a.lat+(b.lat-a.lat)*x,a.lng+(b.lng-a.lng)*x);if(blocked(candidate)){clearInterval(t);moving=false;log("ROUTE BLOCKED • TERRAIN IMPASSABLE");return}player=[candidate.lat,candidate.lng];survivor.setLatLng(player);const terrain=terrainAt(candidate);if(terrain==="forest"&&n%3===0)return;if(n%12===0)makeNoise(6,terrain==="forest"?"BRUSH MOVEMENT":"FOOTSTEPS");minutes++;stamina=Math.max(0,stamina-terrain==="forest"?.07:.04);discover();reveal();hud();if(n>=steps){clearInterval(t);next()}},terrainAt(a)==="forest"?65:40)}next()}
survivor.on("click",e=>{L.DomEvent.stopPropagation(e);if(moving||gameOver)return;selected=!selected;log(selected?"SURVIVOR SELECTED • CLICK DESTINATION":"MOVEMENT CANCELLED");$("objective").textContent=selected?"CLICK MAP TO SET DESTINATION":"FIND SUPPLIES • SURVIVE THE DAY";hud()});
map.on("click",e=>{if(!selected||moving||gameOver)return;if(blocked(e.latlng)){log(waterAreas.some(a=>inside(e.latlng,a))?"BLOCKED • WATER IS IMPASSABLE":"BLOCKED • CANNOT ENTER BUILDING");return}let pts=route(e.latlng);if(destMarker)map.removeLayer(destMarker);if(routeLine)map.removeLayer(routeLine);destMarker=L.marker(e.latlng,{icon:icon("destination","",18)}).addTo(map);routeLine=L.polyline(pts,{className:"route-preview",color:"#59ff87",weight:3,dashArray:"7 8",opacity:.9}).addTo(map);let d=pts.reduce((a,p,i)=>i?a+L.latLng(pts[i-1]).distanceTo(p):0,0);log("ROUTE CALCULATED • "+Math.round(d)+"M");$("objective").textContent="MOVING • "+Math.round(d)+"M ROUTE";setTimeout(()=>move(pts),350)});
$("scavengeBtn").onclick=()=>activePOI?openPOI(activePOI):log("NO DISCOVERED LOCATION IN RANGE • EXPLORE");
$("searchConfirm").onclick=searchPOI;$("searchCancel").onclick=()=>$("lootModal").classList.add("hidden");
$("takeAllBtn").onclick=()=>{let a=inv(),loot=JSON.parse($("lootResults").dataset.loot||"[]"),space=8-a.length;saveInv(a.concat(loot.slice(0,space)));$("lootResultsModal").classList.add("hidden");log("LOOT TRANSFERRED TO INVENTORY")};
$("leaveLootBtn").onclick=()=>$("lootResultsModal").classList.add("hidden");
$("restBtn").onclick=()=>{if(!moving&&!gameOver){makeNoise(2,"RESTING");stamina=Math.min(100,stamina+20);minutes+=45;log("RESTED • STAMINA RECOVERED");hud()}};
$("newGameBtn").onclick=()=>location.reload();
setInterval(()=>{if(!moving){hunger=Math.max(0,hunger-.05);thirst=Math.max(0,thirst-.08);minutes++;hud()}},3000);
saveInv(inv());reveal();log("TACTICAL WORLD LAYER ONLINE");log("FOG OF WAR • VISION • TERRAIN ACTIVE");log("8 INFECTED ACTIVE IN DISTRICT");log("CLICK SURVIVOR TO BEGIN");discover();hud();setTimeout(()=>map.invalidateSize(),250)})();