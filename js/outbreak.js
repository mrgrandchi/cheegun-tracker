(()=>{"use strict";
const $=id=>document.getElementById(id);
const WORLD=[[48.400,-89.270],[48.400,-89.220],[48.430,-89.220],[48.430,-89.270]];
const TERRAIN={open:{speed:.92,noise:18},road:{speed:1.18,noise:24},forest:{speed:.62,noise:10},building:{speed:0,noise:0,blocked:true},water:{speed:0,noise:0,blocked:true}};
const map=L.map("gameMap",{zoomControl:true,preferCanvas:true,minZoom:14,maxZoom:18,zoomSnap:.5,zoomDelta:.5}).setView([48.414,-89.245],15);
const sat=L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,attribution:"Tiles © Esri"});
const labels=L.tileLayer("https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",{maxZoom:19,opacity:.5,attribution:"© Esri"});
sat.addTo(map);labels.addTo(map);
window.cheegunMap=map;
document.dispatchEvent(new CustomEvent("cheegunMapReady",{detail:{map}}));
const icon=(c,h,s=28)=>L.divIcon({className:"",html:`<div class="${c}">${h}</div>`,iconSize:[s,s],iconAnchor:[s/2,s/2]});
const style=document.createElement("style");
style.textContent=`.survivor{width:34px;height:34px;border-radius:50%;background:#59ff87;border:3px solid #e2ffea;box-shadow:0 0 0 10px #59ff8722,0 0 26px #59ff87;display:grid;place-items:center;color:#06240e;font-weight:900}.survivor-selected{filter:drop-shadow(0 0 12px #59ff87)}.zombie{width:18px;height:18px;border-radius:50%;background:#ff4f61;border:2px solid #ffd2d6;box-shadow:0 0 13px #ff4f61;display:grid;place-items:center}.zombie.alert{background:#ff3148;box-shadow:0 0 18px #ff3148}.poi{width:30px;height:30px;border-radius:8px;background:#111e;border:1px solid #66716c;display:grid;place-items:center;font-size:15px;box-shadow:0 3px 15px #0009}.destination{width:16px;height:16px;border-radius:50%;border:2px solid #fff;background:#59ff87;box-shadow:0 0 18px #59ff87}.route-preview{stroke-dasharray:8 10;filter:drop-shadow(0 0 4px #59ff87)}.noise-pulse{animation:noisePulse 1.1s ease-out infinite}.vision-radius{stroke-dasharray:4 10;animation:visionScan 2.8s linear infinite}.safe-zone{animation:safePulse 2.4s ease-in-out infinite}@keyframes noisePulse{0%{stroke-opacity:.8;fill-opacity:.14}100%{stroke-opacity:0;fill-opacity:0}}@keyframes visionScan{to{stroke-dashoffset:-42}}@keyframes safePulse{50%{fill-opacity:.12;stroke-opacity:.9}}.leaflet-control-zoom a{background:#0b0e10!important;color:#d8dedb!important;border-color:#303936!important}.leaflet-control-attribution{font-size:8px!important}`;
document.head.appendChild(style);

const expeditionMods=window.CheegunExpeditionEffects?.expeditionStart?.({stamina:90,inventoryCapacity:8})||{inventoryBonus:0,stashBonus:0,staminaBonus:0,noiseMultiplier:1,damageReduction:0,lootBonus:0,stamina:94,inventoryCapacity:8};
let player=[48.414,-89.245],moving=false,selected=false,health=100,hunger=82,thirst=76,stamina=expeditionMods.stamina,minutes=480,activePOI=null,searching=false,gameOver=false,moveToken=0,weather="CLEAR",weatherUntil=0,lastAutosave=0;
window.cheegunExpeditionMods=expeditionMods;
const visionRadius=185,currentVision=L.circle(player,{radius:visionRadius,color:"#59ff87",weight:1,opacity:.2,fillColor:"#59ff87",fillOpacity:.02,interactive:false,className:"vision-radius"}).addTo(map);
let explored=[],fogLayer=null,destMarker=null,routeLine=null,objectiveMarker=null;
const survivor=L.marker(player,{icon:icon("survivor","▲",34),zIndexOffset:1000}).addTo(map);

const buildings=[
{id:"intercity",name:"INTERCITY SUPPLY CENTRE",type:"commercial",loot:5,danger:4,time:12,pos:[48.4148,-89.2468],shape:[[48.416,-89.249],[48.416,-89.2458],[48.4136,-89.2458],[48.4136,-89.249]]},
{id:"parking",name:"PARKING AREA",type:"vehicle",loot:2,danger:2,time:3,pos:[48.4125,-89.245],shape:[[48.4133,-89.2456],[48.4133,-89.242],[48.4116,-89.242],[48.4116,-89.2456]]},
{id:"residential",name:"RESIDENTIAL BLOCK",type:"residential",loot:3,danger:2,time:7,pos:[48.417,-89.2415],shape:[[48.4177,-89.2432],[48.4177,-89.2406],[48.4157,-89.2406],[48.4157,-89.2432]]},
{id:"clinic",name:"MEDICAL CLINIC",type:"medical",loot:5,danger:4,time:9,pos:[48.4108,-89.2405],shape:[[48.4115,-89.2415],[48.4115,-89.2395],[48.4101,-89.2395],[48.4101,-89.2415]]},
{id:"firehall",name:"FIRE HALL",type:"emergency",loot:4,danger:3,time:9,pos:[48.4188,-89.2528],shape:[[48.4200,-89.2542],[48.4200,-89.2516],[48.4178,-89.2516],[48.4178,-89.2542]]},
{id:"warehouse",name:"NORTHSIDE WAREHOUSE",type:"industrial",loot:5,danger:5,time:14,pos:[48.4212,-89.258],shape:[[48.4224,-89.2602],[48.4224,-89.2562],[48.4199,-89.2562],[48.4199,-89.2602]]},
{id:"gas",name:"HIGHWAY FUEL STOP",type:"commercial",loot:4,danger:4,time:8,pos:[48.4088,-89.237],shape:[[48.4099,-89.2388],[48.4099,-89.2356],[48.4079,-89.2356],[48.4079,-89.2388]]},
{id:"apartments",name:"RIVERSIDE APARTMENTS",type:"residential",loot:4,danger:3,time:10,pos:[48.4182,-89.239],shape:[[48.4195,-89.241],[48.4195,-89.2372],[48.4168,-89.2372],[48.4168,-89.241]]},
{id:"school",name:"EVACUATION SCHOOL",type:"emergency",loot:5,danger:4,time:12,pos:[48.407,-89.2505],shape:[[48.4084,-89.2528],[48.4084,-89.2483],[48.4055,-89.2483],[48.4055,-89.2528]]},
{id:"pharmacy",name:"PHARMACY",type:"medical",loot:5,danger:3,time:7,pos:[48.412,-89.2575],shape:[[48.413,-89.259],[48.413,-89.256],[48.411,-89.256],[48.411,-89.259]]}
];
const forests=[[[48.4195,-89.258],[48.422,-89.252],[48.419,-89.247],[48.4168,-89.251]],[[48.4085,-89.254],[48.4115,-89.251],[48.4095,-89.246],[48.4065,-89.248]],[[48.424,-89.246],[48.427,-89.241],[48.424,-89.236],[48.421,-89.24]]];
const waters=[[[48.401,-89.233],[48.43,-89.233],[48.43,-89.226],[48.401,-89.226]],[[48.406,-89.262],[48.41,-89.262],[48.41,-89.257],[48.406,-89.257]]];
const roads=[[[48.422,-89.261],[48.419,-89.255],[48.416,-89.251],[48.414,-89.247],[48.411,-89.243],[48.408,-89.238]],[[48.42,-89.251],[48.417,-89.248],[48.414,-89.245],[48.412,-89.24],[48.409,-89.236]],[[48.418,-89.257],[48.416,-89.251],[48.414,-89.245],[48.412,-89.239]],[[48.407,-89.252],[48.410,-89.249],[48.414,-89.247],[48.418,-89.245],[48.421,-89.241]],[[48.412,-89.258],[48.414,-89.253],[48.417,-89.248],[48.419,-89.243]]];
const roadSegments=roads.flatMap(path=>path.slice(1).map((p,i)=>[path[i],p]));
const fastTravelTarget=(()=>{try{return JSON.parse(localStorage.getItem("cheegunFastTravelTarget")||"null")}catch{return null}})();\nif(fastTravelTarget?.pos){player=[...fastTravelTarget.pos];localStorage.removeItem("cheegunFastTravelTarget");}\nconst found=new Set(),searched=new Set(),layers=new Map(),buildingById=new Map(buildings.map(b=>[b.id,b]));
const glyph={commercial:"🏪",vehicle:"🚗",residential:"🏠",medical:"✚",emergency:"🚒",industrial:"⚙️"};
roads.forEach(p=>L.polyline(p,{pane:"overlayPane",color:"#9fb9c7",weight:2.5,opacity:.23,dashArray:"2 8",interactive:false}).addTo(map));
forests.forEach(p=>L.polygon(p,{color:"#4d8d63",weight:1,fillColor:"#245238",fillOpacity:.11,interactive:false}).addTo(map));
waters.forEach(p=>L.polygon(p,{color:"#3d8fb4",weight:1.25,fillColor:"#163e59",fillOpacity:.34,interactive:false}).addTo(map));
buildings.forEach(b=>{const l=L.polygon(b.shape,{color:"#65706b",weight:.8,fillColor:"#17201d",fillOpacity:0,interactive:true}).addTo(map);l.on("click",()=>openPOI(b));layers.set(b.id,l);b.marker=L.marker(b.pos,{icon:icon("poi",glyph[b.type]||"⬢",30),opacity:.1,zIndexOffset:300}).addTo(map);b.marker.on("click",()=>openPOI(b));});

const objectives=[
{id:"clinic_run",name:"MEDICAL RUN",text:"SEARCH THE MEDICAL CLINIC FOR SUPPLIES",target:"clinic",reward:"MEDICAL CACHE",active:false,complete:false},
{id:"radio_check",name:"SIGNAL CHECK",text:"REACH THE FIRE HALL AND SECURE THE RADIO",target:"firehall",reward:"DISTRESS INTEL",active:false,complete:false},
{id:"evac_search",name:"EVACUATION ROUTE",text:"SEARCH THE EVACUATION SCHOOL",target:"school",reward:"EVAC MAP",active:false,complete:false}
];
let currentObjective=null;
const safehouses=[
{id:"start",name:"FIELD SAFEHOUSE",pos:[48.414,-89.245],radius:70,claimed:true,layer:null},
{id:"north",name:"NORTH SAFEHOUSE",pos:[48.4212,-89.258],radius:65,claimed:false,layer:null},
{id:"east",name:"RIVERSIDE SAFEHOUSE",pos:[48.4182,-89.239],radius:65,claimed:false,layer:null}
];
safehouses.forEach(s=>{s.layer=L.circle(s.pos,{className:"safe-zone",radius:s.radius,color:s.claimed?"#59ff87":"#607069",weight:1.5,opacity:.7,fillColor:s.claimed?"#59ff87":"#2a3430",fillOpacity:.045,interactive:false}).addTo(map);L.marker(s.pos,{icon:icon("poi","⌂",26),opacity:.7}).bindTooltip(s.name).addTo(map);});

function inside(p, poly) {
  const x = p.lat;
  const y = p.lng;
  let h = false;

  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];

    if (
      ((yi > y) !== (yj > y)) &&
      (x < (((xj - xi) * (y - yi)) / (yj - yi + 0.0000000001) + xi))
    ) {
      h = !h;
    }
  }

  return h;
}
function pointSegDist(p,a,b){const x=p.lat,y=p.lng,x1=a[0],y1=a[1],x2=b[0],y2=b[1],dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-(x1+t*dx),y-(y1+t*dy))*111000}
function nearRoad(p){return roadSegments.some(([a,b])=>pointSegDist(p,a,b)<20)}
function prototypeTerrainAt(p){if(waters.some(a=>inside(p,a)))return"water";if(buildings.some(b=>inside(p,b.shape)))return"building";if(forests.some(a=>inside(p,a)))return"forest";if(nearRoad(p))return"road";return"open"}
function terrainAt(p){
 const generated=window.CheegunTerrainAuthority?.state?.enabled?window.CheegunTerrainAuthority.classify(p):null;
 if(generated?.zone){if(generated.blocked)return"water";if(generated.zone.type==="forest")return"forest";}
 return prototypeTerrainAt(p);
}
function blocked(p){
 if(window.CheegunMovementVision?.state?.enabled){
  const r=window.CheegunMovementVision.resolveMove(p,1);if(!r.allowed)return true;
 }
 return !!TERRAIN[prototypeTerrainAt(p)]?.blocked
}
function effectiveVisionRadius(){return window.CheegunMovementVision?.state?.enabled?window.CheegunMovementVision.visionAt(L.latLng(player),visionRadius):visionRadius}
function dist(a,b){return L.latLng(a).distanceTo(L.latLng(b))}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function clearVisuals(){if(destMarker){map.removeLayer(destMarker);destMarker=null}if(routeLine){map.removeLayer(routeLine);routeLine=null}}
function lineBlocked(a,b,steps=48){for(let i=1;i<=steps;i++){const t=i/steps,p=L.latLng(a.lat+(b.lat-a.lat)*t,a.lng+(b.lng-a.lng)*t);if(blocked(p))return true}return false}
function redrawFog(){if(fogLayer)map.removeLayer(fogLayer);const b=L.latLngBounds(WORLD),sw=b.getSouthWest(),ne=b.getNorthEast(),cells=[],rows=18,cols=28,dLat=(ne.lat-sw.lat)/rows,dLng=(ne.lng-sw.lng)/cols;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const center=L.latLng(sw.lat+(r+.5)*dLat,sw.lng+(c+.5)*dLng);let v=0;for(const e of explored)v=Math.max(v,clamp(1-dist(center,e)/effectiveVisionRadius(),0,1));cells.push(L.rectangle([[sw.lat+r*dLat,sw.lng+c*dLng],[sw.lat+(r+1)*dLat,sw.lng+(c+1)*dLng]],{pane:"overlayPane",stroke:false,fillColor:"#020504",fillOpacity:v>.82?.05:v>.18?.32:.7,interactive:false}))}fogLayer=L.layerGroup(cells).addTo(map);if(typeof fogLayer.bringToFront==="function")fogLayer.bringToFront();if(typeof currentVision.bringToFront==="function")currentVision.bringToFront()}
function reveal(){const last=explored.at(-1);if(!last||dist(last,player)>52)explored.push([...player]);explored=explored.slice(-52);currentVision.setLatLng(player);currentVision.setRadius(effectiveVisionRadius());window.CheegunPoiAuthority?.update?.(L.latLng(player),map);redrawFog()}
function setBuilding(b,state){const l=layers.get(b.id),styles={UNKNOWN:{color:"#65706b",weight:.8,fillOpacity:0},DISCOVERED:{color:"#65e992",weight:1.4,fillOpacity:.05},IN_RANGE:{color:"#ffd277",weight:2,fillOpacity:.09},SEARCHING:{color:"#ffe08a",weight:2.5,fillOpacity:.12},LOOTED:{color:"#66716d",weight:1,fillOpacity:.03}};b.state=state;l?.setStyle(styles[state]);b.marker.setOpacity(state==="UNKNOWN"?.1:1)}
function updateSafehouses(){safehouses.forEach(s=>{const d=dist(player,s.pos);if(!s.claimed&&d<55){s.claimed=true;s.layer.setStyle({color:"#59ff87",fillColor:"#59ff87",fillOpacity:.08});health=clamp(health+12,0,100);thirst=clamp(thirst+10,0,100);stamina=100;log("SAFEHOUSE SECURED • "+s.name);$( "objective").textContent="SAFEHOUSE SECURED • RECOVERED"} })}
function discover(){buildings.forEach(b=>{const d=dist(player,b.pos);if(d<effectiveVisionRadius()&&!found.has(b.id)){found.add(b.id);setBuilding(b,"DISCOVERED");log("NEW LOCATION DISCOVERED • "+b.name)}if(found.has(b.id)&&d<=85&&!searched.has(b.id)){activePOI=b;setBuilding(b,"IN_RANGE");$( "objective").textContent="LOCATION IN RANGE • "+b.name}else if(found.has(b.id)&&b.state!=="LOOTED"&&d>85)setBuilding(b,"DISCOVERED")});updateSafehouses()}
const lootTables={residential:["🥫 Canned Food","💧 Water Bottle","🔪 Kitchen Knife","🩹 Bandage","🎒 Backpack"],commercial:["🥫 Canned Food","💧 Water Bottle","🎒 Backpack","🔋 Battery","🔦 Flashlight","🔧 Crowbar"],vehicle:["💧 Water Bottle","🔋 Battery","🩹 Bandage","🔦 Flashlight","🔧 Tool Kit"],medical:["🩹 Bandage","💊 Painkillers","💉 Medical Kit","🩸 Trauma Kit"],emergency:["🪓 Rescue Axe","🩹 Trauma Bandage","📻 Radio Battery","🔦 Heavy Flashlight"],industrial:["🔧 Crowbar","⚙️ Tool Kit","🧰 Repair Kit","🔋 Power Cell"]};
const weights={COMMON:.68,UNCOMMON:.23,RARE:.085,LEGENDARY:.005};
function rarity(){let r=Math.random(),c=0;for(const[k,w]of Object.entries(weights)){c+=w;if(r<=c)return k}return"COMMON"}
function loot(p){const n=Math.min(6,1+Math.floor(Math.random()*p.loot)+(expeditionMods.lootBonus||0));return Array.from({length:n},()=>{const r=rarity(),base=lootTables[p.type]||lootTables.residential;let name=base[Math.floor(Math.random()*base.length)];if(r==="RARE")name=p.type==="medical"?"🩸 Trauma Kit":p.type==="emergency"?"📡 Emergency Beacon":"🛠️ Advanced Tool Kit";if(r==="LEGENDARY")name="🗝️ Master Keycard";return{name,rarity:r}})}
function phase1710ContractObjective(){
 const c=window.CheegunContracts?.active?.();if(!c)return null;
 if(!c.targetId){const t=window.CheegunContracts.bindTarget(buildings);if(t){if(objectiveMarker)map.removeLayer(objectiveMarker);objectiveMarker=L.marker(t.pos,{icon:icon("destination","!",22),zIndexOffset:850}).bindTooltip(c.name).addTo(map);$("objective").textContent=c.icon+" CONTRACT • "+c.name+" • "+t.name;log("CONTRACT TARGET ASSIGNED • "+t.name)}}
 return window.CheegunContracts.active();
}
function openPOI(p){phase1710ContractObjective();phase1717ForwardBaseIntel(p);phase1719CheckTargetEvent(p);if(gameOver||searching)return;if(!found.has(p.id)||dist(player,p.pos)>85)return log("MOVE CLOSER TO INTERACT");if(searched.has(p.id))return log("LOCATION ALREADY SEARCHED");activePOI=p;$( "lootTitle").textContent=p.name;$( "lootMeta").textContent=p.type.toUpperCase()+" • LOOT "+p.loot+"/5 • RISK "+p.danger+"/5 • "+p.time+" MIN";$( "lootModal").classList.remove("hidden")}
function checkObjective(p){phase1716DistrictOperation(p,"CONTRACT");const contract=window.CheegunContracts?.active?.();if(contract&&contract.targetId===p.id){const r=window.CheegunContracts.complete({reason:"TARGET_SECURED"});if(r?.ok){log("CONTRACT COMPLETE • +"+r.rewards.credits+" CR • +"+r.rewards.xp+" XP");$("objective").textContent="CONTRACT COMPLETE • "+contract.name;if(objectiveMarker){map.removeLayer(objectiveMarker);objectiveMarker=null}hud();return}}if(!currentObjective||currentObjective.target!==p.id)return;currentObjective.complete=true;log("OBJECTIVE COMPLETE • "+currentObjective.name);$( "objective").textContent="OBJECTIVE COMPLETE • "+currentObjective.reward;if(objectiveMarker){map.removeLayer(objectiveMarker);objectiveMarker=null}const next=objectives.find(o=>!o.complete&&!o.active);if(next)setTimeout(()=>activateObjective(next),1200)}
function searchPOI(){const p=activePOI;if(!p||searching||gameOver)return;searching=true;setBuilding(p,"SEARCHING");$( "lootModal").classList.add("hidden");$( "objective").textContent="SEARCHING • "+p.name;emitNoise(Math.min(70,20+p.danger*8),"SEARCHING "+p.name);setTimeout(()=>{minutes+=p.time;searched.add(p.id);setBuilding(p,"LOOTED");phase1716DistrictOperation(p,"SEARCH");const items=loot(p);$( "lootResults").dataset.loot=JSON.stringify(items);$( "lootResults").innerHTML=items.map(x=>`<div class="loot-found">${x.name}<small>${x.rarity}</small></div>`).join("");$( "lootResultsModal").classList.remove("hidden");searching=false;hud();checkObjective(p);log("SEARCH COMPLETE • "+items.length+" ITEMS FOUND")},p.time*120)}
function activateObjective(o){currentObjective=o;o.active=true;const target=buildingById.get(o.target);if(!target)return;objectiveMarker=L.marker(target.pos,{icon:icon("destination","!",22),zIndexOffset:800}).bindTooltip(o.name,{permanent:false}).addTo(map);$( "objective").textContent=o.text;log("NEW OBJECTIVE • "+o.name)}
function inv(){try{return JSON.parse(localStorage.getItem("outbreak_inventory")||"[]")}catch{return[]}}
function saveInv(a){a=a.slice(0,8);localStorage.setItem("outbreak_inventory",JSON.stringify(a));$( "inventory").innerHTML=a.length?a.slice(-5).map(x=>"<span class=\"item\">"+x+"</span>").join(""):"<span>EMPTY</span>";$( "inventoryCount").textContent=a.length+" / 8"}
function phase1710StartContract(){const c=phase1710ContractObjective();if(c)log("ACTIVE CONTRACT • "+c.name+" • RISK "+c.difficulty+"/5");}\nfunction phase1714OutbreakPressure(){const danger=Math.round(Math.random()*5)+2;window.CheegunDefense?.raise?.(danger,"EXPEDITION_ACTIVITY");const d=window.CheegunDefense?.status?.();if(d?.warning)log("⚠ SAFEHOUSE THREAT RISING • READINESS "+Math.round(d.readiness))}
function phase1736RegionalThreatTick(){const before=window.CheegunRegionalThreat?.summary?.().migrations||0;const r=window.CheegunRegionalThreat?.tick?.();if(r?.migrations>before)log("☣ HORDE MIGRATION • REGIONAL THREAT MAP UPDATED");return r}
function phase1735ConvoyTick(){const r=window.CheegunSupplyConvoys?.tick?.();if(r?.convoys?.some(c=>c.status==="LOST"))log("⚠ SUPPLY CONVOY LOST • CHECK REGIONAL LOGISTICS");return r}
function phase1734SettlementTick(){return window.CheegunSettlementNetwork?.tick?.()}
function phase1733SiegeTick(){const r=window.CheegunSafehouseSieges?.tick?.();if(r?.active)log("🚨 SAFEHOUSE UNDER ATTACK • "+r.active.wave+" • RETURN TO DEFEND");else if(r?.warning)log("⚠ HORDE PRESSURE • SAFEHOUSE THREAT "+r.threat+"%");return r}
function phase1732PowerTick(){const r=window.CheegunSafehousePower?.tick?.();if(r?.status?.blackout)log("⚠ SAFEHOUSE BLACKOUT • POWER INFRASTRUCTURE OFFLINE");return r}
function phase1731BuildingsTick(){return window.CheegunSafehouseBuildings?.summary?.()}
function phase1730ProductionTick(){return window.CheegunSafehouseProduction?.summary?.()}
function phase1729NeedsTick(){const before=window.CheegunSurvivorNeeds?.summary?.().shortages||0;const r=window.CheegunSurvivorNeeds?.tick?.();if(r?.shortages>before)log("⚠ SAFEHOUSE SUPPLY SHORTAGE • RETURN TO COMMUNITY SURVIVAL");return r}
function phase1728EquipmentTick(){return window.CheegunSurvivorEquipment?.summary?.()}
function phase1727SynergyTick(){return window.CheegunSurvivorSynergy?.summary?.()}
function phase1726ProgressionTick(){return window.CheegunSurvivorProgression?.summary?.()}
function phase1725RecruitmentTick(){const before=window.CheegunRecruitment?.summary?.().candidates?.length||0;const r=window.CheegunRecruitment?.tick?.();if(r&&r.candidates.length===before&&Math.random()<.28){const c=window.CheegunRecruitment.generate({source:"EXPEDITION INTEL"});if(c)log("📡 SURVIVOR SIGNAL • "+c.name+" • RETURN TO SAFEHOUSE")}return r}
function phase1724CasualtyTick(){const before=window.CheegunCasualtySystem?.summary?.().deaths||0;const r=window.CheegunCasualtySystem?.tick?.();if(r&&r.deaths>before)log("🕯 SURVIVOR LOST • RETURN TO SAFEHOUSE MEMORIAL");return r}
function phase1723StoryTick(){const before=window.CheegunStoryEvents?.summary?.().active?.uid;const r=window.CheegunStoryEvents?.tick?.();if(!before&&r?.active)log(r.active.icon+" LEADERSHIP EVENT • "+r.active.name+" • RETURN TO SAFEHOUSE");return r}
function phase1721CommunityTick(){return window.CheegunSurvivorCommunity?.tick?.();phase1723StoryTick()}
function phase1720MissionTick(){const before=window.CheegunSurvivorMissions?.summary?.().active?.length||0;const r=window.CheegunSurvivorMissions?.tick?.();if(r&&r.active.length<before)log("SURVIVOR TEAM RETURNED • CHECK SAFEHOUSE OPERATIONS");return r}
function phase1719EmergencyTick(){const e=window.CheegunDistrictEvents?.tick?.();if(e)log(e.icon+" EMERGENCY • "+e.name+" • "+e.districtName);return e}
function phase1719CheckTargetEvent(p){const t=(()=>{try{return JSON.parse(localStorage.getItem("cheegunFastTravelTarget")||"null")}catch{return null}})();if(t?.eventId&&window.CheegunDistrictEvents?.get?.(t.eventId)){log("EMERGENCY RESPONSE ZONE • "+p.name);return t.eventId}return null}
function phase1717ForwardBaseIntel(p){const d=window.CheegunDistrictControl?.districtForPOI?.(p);if(!d)return null;const b=window.CheegunForwardBases?.bonuses?.(d.id)||{};if(b.intel)log("📡 FORWARD BASE INTEL • "+d.name+" • ACTIVE");return b}
function phase1716DistrictOperation(p,type="SEARCH"){const r=window.CheegunDistrictControl?.operation?.(p,{type});if(!r)return null;const d=r.district;log((r.liberated?"✓ DISTRICT LIBERATED • ":"DISTRICT CONTROL • ")+d.name+" • INF "+Math.round(d.infestation)+"% • CTRL "+Math.round(d.control)+"%");return r}
function phase1715EvolveOutbreak(){const r=window.CheegunOutbreakEvolution?.advanceDay?.("EXPEDITION");if(!r)return null;if(r.changed)log("☣ OUTBREAK EVOLVED • DAY "+r.day+" • "+r.stage.name);const h=window.CheegunOutbreakEvolution?.hordeCheck?.();if(h)log("⚠ HORDE MIGRATION DETECTED • SAFEHOUSE THREAT INCREASING");return r}
function phase16b10StartExpedition(){
 const mode=window.CheegunRealWorldMode;if(!mode||mode.state.started)return null;
 const result=mode.start(L.latLng(player));
 if(result?.ok){log("REAL WORLD EXPEDITION • "+result.runId.toUpperCase());phase1710StartContract();phase1714OutbreakPressure();phase1715EvolveOutbreak();window.CheegunDistrictControl?.decay?.();window.CheegunSupplyNetwork?.damageRoutes?.(8);phase1719EmergencyTick();phase1720MissionTick();window.CheegunSurvivorCommunity?.tick?.();phase1723StoryTick();phase1724CasualtyTick();phase1725RecruitmentTick();phase1726ProgressionTick();phase1727SynergyTick();phase1728EquipmentTick();phase1729NeedsTick();phase1730ProductionTick();phase1731BuildingsTick();phase1732PowerTick();phase1733SiegeTick();phase1734SettlementTick();phase1735ConvoyTick();phase1736RegionalThreatTick()}
 return result;
}
function phase171UseSupply(id){
 const r=window.CheegunExpeditionEffects?.consume?.(id);if(!r?.ok)return r;
 const e=r.effect;
 if(e.use==="heal")health=clamp(health+e.amount,0,100);
 if(e.use==="hunger")hunger=clamp(hunger+e.amount,0,100);
 if(e.use==="thirst")thirst=clamp(thirst+e.amount,0,100);
 if(e.use==="ammo")window.CheegunCombatEquipment?.addAmmo?.(e.amount);
 window.cheegunExpeditionMods=window.CheegunExpeditionEffects.modifiers();
 log(e.label);hud();return{ok:true,effect:e};
}
window.CheegunUseSupply=phase171UseSupply;
function phase171Damage(amount,source="THREAT"){
 window.CheegunCombatEquipment?.applyArmorWear?.(amount);
 const reduced=Math.max(0,Math.round(amount*(1-(expeditionMods.damageReduction||0))));
 health=clamp(health-reduced,0,100);log(source+" • "+reduced+" DAMAGE");hud();return reduced;
}
window.CheegunApplyDamage=phase171Damage;
function phase173TakeLoot(items){
 const accepted=[],rejected=[];
 for(const raw of items){const name=typeof raw==="string"?raw:raw.name;const r=window.CheegunInventoryAuthority?.add?.(name);if(r?.ok)accepted.push(name);else rejected.push(name)}
 saveInv(window.CheegunInventoryAuthority?.inv?.()||[]);
 if(rejected.length)log("PACK FULL • "+rejected.length+" ITEM(S) LEFT BEHIND");
 return{accepted,rejected};
}
window.CheegunTakeLoot=phase173TakeLoot;
function phase177CombatStatus(){
 const w=window.CheegunCombatEquipment?.weapon?.();const el=$("combatStatus");if(!el)return;
 if(!w){el.textContent="UNARMED • FIND A WEAPON";return}
 const firearm=w.gear.id==="service-pistol",a=firearm?" • AMMO "+window.CheegunCombatEquipment.ammo():"";
 el.textContent=w.gear.icon+" "+w.gear.name.toUpperCase()+" • DMG "+w.gear.damage+" • DUR "+w.durability+"/"+w.gear.durability+a;
}
function phase177Attack(){
 const r=window.CheegunCombatEquipment?.attack?.({targetHealth:100});if(!r?.ok){log("COMBAT FAILED • "+(r?.reason||"SYSTEM"));return}
 log("ATTACK • "+r.weapon.name+" • "+r.damage+" DMG • NOISE "+Math.round(r.noise)+(r.ammo!==undefined?" • AMMO "+r.ammo:""));
 if(r.durability<=0)log("WEAPON BROKEN • RETURN TO SAFEHOUSE");
 phase177CombatStatus();hud();return r;
}
window.CheegunAttack=phase177Attack;
function hud(){phase177CombatStatus();[["health",health],["hunger",hunger],["thirst",thirst],["stamina",stamina]].forEach(([k,v])=>{$(k).textContent=Math.round(v)+"%";$(k+"Bar").style.width=clamp(v,0,100)+"%"});$( "gameTime").textContent=String(Math.floor(minutes/60)%24).padStart(2,"0")+":"+String(Math.floor(minutes%60)).padStart(2,"0");survivor.getElement()?.classList.toggle("survivor-selected",selected)}
function log(m){const e=document.createElement("div");e.className="log";e.innerHTML="<b>["+$( "gameTime").textContent+"]</b> "+m;$( "gameFeed").prepend(e);while($( "gameFeed").children.length>7)$( "gameFeed").lastElementChild.remove()}
let noise={level:0,pos:null,until:0,ring:null};
function emitNoise(amount,label){const terrain=TERRAIN[terrainAt(L.latLng(player))]||TERRAIN.open;amount=amount*(terrain.noise/18);noise.level=clamp(Math.max(noise.level,amount),0,100);noise.pos=[...player];noise.until=Date.now()+Math.max(2200,amount*110);if(noise.ring)map.removeLayer(noise.ring);noise.ring=L.circle(player,{className:"noise-pulse",radius:Math.max(35,amount*3.2),color:"#ffb347",weight:1.5,fillColor:"#ff7a45",fillOpacity:.07,interactive:false}).addTo(map);log("NOISE "+Math.round(noise.level)+" • "+label)}
function updateNoise(){if(!noise.ring)return;if(Date.now()>=noise.until){map.removeLayer(noise.ring);noise.ring=null;noise.pos=null;noise.level=0;return}noise.level=Math.max(0,noise.level-.8);noise.ring.setLatLng(noise.pos).setRadius(Math.max(10,noise.level*3.2))}
const zombies=[];const zombieSpots=[[48.413,-89.249],[48.416,-89.244],[48.410,-89.247],[48.418,-89.239],[48.409,-89.238],[48.420,-89.251],[48.412,-89.240],[48.417,-89.254],[48.423,-89.256],[48.407,-89.251],[48.421,-89.241],[48.412,-89.257]];
zombieSpots.forEach((p,i)=>{const z={id:i,pos:[...p],state:"IDLE",target:null,lastSeen:0,wanderUntil:0};z.awareness=L.circle(p,{radius:50,color:"#ff4f61",weight:1,opacity:0,fillColor:"#ff4f61",fillOpacity:0,interactive:false}).addTo(map);z.marker=L.marker(p,{icon:icon("zombie","●",18),zIndexOffset:450}).addTo(map);z.marker.bindTooltip("INFECTED • IDLE",{direction:"top",opacity:.75});zombies.push(z)});
function zState(z,s){z.state=s;const d=dist(player,z.pos),vis=d<240&&["CHASE","INVESTIGATE","SEARCH"].includes(s),r=s==="CHASE"?95:s==="INVESTIGATE"?72:s==="SEARCH"?62:50;z.awareness.setLatLng(z.pos).setRadius(r).setStyle({opacity:vis?(s==="CHASE"?.42:.1):0,fillOpacity:vis?(s==="CHASE"?.06:.018):0,color:s==="CHASE"?"#ff3148":"#ff4f61"});const el=z.marker.getElement()?.querySelector(".zombie");if(el)el.classList.toggle("alert",s==="CHASE");z.marker.setTooltipContent("INFECTED • "+s)}
function canSee(a,b){return !lineBlocked(L.latLng(a),L.latLng(b),36)}
function moveZombie(z,target,speed){const dx=target[0]-z.pos[0],dy=target[1]-z.pos[1],len=Math.hypot(dx,dy)||1,wiggle=Math.sin(Date.now()/520+z.id)*.16,nx=dx/len,ny=dy/len,rx=nx*Math.cos(wiggle)-ny*Math.sin(wiggle),ry=nx*Math.sin(wiggle)+ny*Math.cos(wiggle),n=L.latLng(z.pos[0]+rx*speed,z.pos[1]+ry*speed);if(!blocked(n))z.pos=[n.lat,n.lng]}
function wanderTarget(z){for(let i=0;i<8;i++){const a=Math.random()*Math.PI*2,d=.00045+Math.random()*.00055,p=[z.pos[0]+Math.cos(a)*d,z.pos[1]+Math.sin(a)*d];if(!blocked(L.latLng(p))){z.target=p;z.wanderUntil=Date.now()+1800+Math.random()*2800;return}}}
function generatedPoiThreat(){
 const sys=window.CheegunGeneratedLootThreat;if(!sys?.state?.enabled)return null;
 return sys.threatAt(L.latLng(player));
}
function zombieAI(){if(gameOver)return;const now=Date.now();zombies.forEach(z=>{const d=dist(z.pos,player),see=d<125&&canSee(z.pos,player),hear=noise.pos&&now<noise.until&&dist(z.pos,noise.pos)<Math.max(45,noise.level*3.2);if(see){z.target=[...player];z.lastSeen=now+3500;zState(z,"CHASE");moveZombie(z,player,.000045)}else if(hear){z.target=[...noise.pos];z.lastSeen=0;zState(z,"INVESTIGATE");moveZombie(z,noise.pos,.000028)}else if(now<z.lastSeen){zState(z,"SEARCH");if(z.target)moveZombie(z,z.target,.00002)}else{zState(z,"WANDER");if(!z.target||now>z.wanderUntil||dist(z.target,z.pos)<10)wanderTarget(z);if(z.target)moveZombie(z,z.target,.000012)}z.marker.setLatLng(z.pos);if(dist(z.pos,player)<18){gameOver=true;health=0;hud();log("SURVIVOR OVERRUN • SESSION FAILED");$( "objective").textContent="☠ YOU WERE OVERRUN"}})}
function updateWeather(){const now=Date.now();if(now<weatherUntil)return;const old=weather,roll=Math.random();weather=roll<.58?"CLEAR":roll<.8?"FOG":roll<.93?"RAIN":"STORM";weatherUntil=now+180000;if(weather!==old){const effects={CLEAR:"CLEAR SKIES • STANDARD VISIBILITY",FOG:"FOG ROLLING IN • REDUCED VISIBILITY",RAIN:"RAIN • NOISE DAMPENED",STORM:"STORM • DANGEROUS CONDITIONS"};currentVision.setRadius(Math.min(weather==="FOG"?135:weather==="STORM"?150:visionRadius,effectiveVisionRadius()));log("WEATHER CHANGE • "+effects[weather])}}
function simplify(points){if(points.length<3)return points;const out=[points[0]];let a=0;for(let i=2;i<points.length;i++)if(lineBlocked(points[a],points[i])){out.push(points[i-1]);a=i-1}out.push(points.at(-1));return out}
function makeRoute(dest){const s=L.latLng(player),e=L.latLng(dest);if(!lineBlocked(s,e))return[s,e];const nodes=[s,e];[...buildings.map(b=>b.shape),...waters].forEach(poly=>poly.forEach(p=>{const q=L.latLng(p[0],p[1]);[[.00045,.00045],[.00045,-.00045],[-.00045,.00045],[-.00045,-.00045]].forEach(([a,b])=>{const c=L.latLng(q.lat+a,q.lng+b);if(!blocked(c))nodes.push(c)})}));const n=nodes.length,d=Array(n).fill(Infinity),prev=Array(n).fill(-1),used=Array(n).fill(false);d[0]=0;for(let it=0;it<n;it++){let u=-1,b=Infinity;for(let i=0;i<n;i++)if(!used[i]&&d[i]<b){b=d[i];u=i}if(u<0)break;used[u]=true;for(let v=0;v<n;v++)if(!used[v]&&u!==v&&!lineBlocked(nodes[u],nodes[v])){const alt=d[u]+nodes[u].distanceTo(nodes[v]);if(alt<d[v]){d[v]=alt;prev[v]=u}}}if(prev[1]<0)return[s,e];const path=[];for(let at=1;at!==-1;at=prev[at])path.unshift(nodes[at]);return simplify(path)}
function move(points){const token=++moveToken;moving=true;selected=false;const p=simplify(points);let seg=0;clearVisuals();const next=()=>{if(token!==moveToken)return;if(seg>=p.length-1){moving=false;log("ARRIVED AT DESTINATION");discover();reveal();hud();return}const a=L.latLng(player),b=p[++seg],d=Math.max(1,a.distanceTo(b)),terrain=terrainAt(a),cfg=TERRAIN[terrain]||TERRAIN.open;
const generatedMove=window.CheegunMovementVision?.state?.enabled?window.CheegunMovementVision.resolveMove(a,1):{allowed:true,cost:1};
if(!generatedMove.allowed){moving=false;log("ROUTE BLOCKED • IMPASSABLE WATER");return}
const terrainMultiplier=Number.isFinite(generatedMove.cost)?generatedMove.cost:1,dur=Math.max(700,d/(3*cfg.speed)*terrainMultiplier),start=performance.now();const frame=now=>{if(token!==moveToken)return;const t=clamp((now-start)/dur,0,1),q=L.latLng(a.lat+(b.lat-a.lat)*t,a.lng+(b.lng-a.lng)*t);if(blocked(q)){moving=false;log("ROUTE BLOCKED • PATH ABORTED");return}player=[q.lat,q.lng];survivor.setLatLng(player);const mins=Math.max(.005,d/dur*.0167);minutes+=mins;stamina=clamp(stamina-mins*(terrain==="forest"?.22:terrain==="road"?.08:.12),0,100);discover();reveal();hud();if(t<1)requestAnimationFrame(frame);else next()};requestAnimationFrame(frame)};next()}
survivor.on("click",e=>{L.DomEvent.stopPropagation(e);if(moving||gameOver)return;selected=!selected;$( "objective").textContent=selected?"CLICK MAP TO SET DESTINATION":"FIND SUPPLIES • SURVIVE THE DAY";log(selected?"SURVIVOR SELECTED • CLICK DESTINATION":"MOVEMENT CANCELLED");hud()});
map.on("click",e=>{if(!selected||moving||gameOver)return;if(blocked(e.latlng))return log(terrainAt(e.latlng)==="water"?"BLOCKED • WATER IS IMPASSABLE":"BLOCKED • CANNOT ENTER BUILDING");if(dist(player,e.latlng)<12)return;const p=makeRoute(e.latlng);if(p.length<2)return log("NO VALID ROUTE");clearVisuals();destMarker=L.marker(e.latlng,{icon:icon("destination","",16),zIndexOffset:700}).addTo(map);routeLine=L.polyline(p,{className:"route-preview",color:"#59ff87",weight:3,dashArray:"8 10",opacity:.8,interactive:false}).addTo(map);const m=p.reduce((s,x,i)=>i?s+L.latLng(p[i-1]).distanceTo(x):0,0);log("ROUTE CALCULATED • "+Math.round(m)+"M");$( "objective").textContent="MOVING • "+Math.round(m)+"M ROUTE";setTimeout(()=>move(p),180)});
$( "scavengeBtn").onclick=()=>activePOI?openPOI(activePOI):log("NO DISCOVERED LOCATION IN RANGE • EXPLORE");
$( "searchConfirm").onclick=searchPOI;
$( "searchCancel").onclick=()=>$( "lootModal").classList.add("hidden");
$( "takeAllBtn").onclick=()=>{const items=JSON.parse($( "lootResults").dataset.loot||"[]"),a=inv(),space=8-a.length,taken=items.slice(0,space).map(x=>x.name);saveInv(a.concat(taken));$( "lootResultsModal").classList.add("hidden");log("LOOT TRANSFERRED • "+taken.length+"/"+items.length+" ITEMS")};
$( "leaveLootBtn").onclick=()=>$( "lootResultsModal").classList.add("hidden");
$( "restBtn").onclick=()=>{if(moving||gameOver)return;emitNoise(2,"RESTING");stamina=clamp(stamina+20,0,100);minutes+=45;log("RESTED • STAMINA RECOVERED");hud()};
$( "newGameBtn").onclick=()=>{moveToken++;localStorage.removeItem("outbreak_save");location.reload()};
function saveGame(){localStorage.setItem("outbreak_save",JSON.stringify({player,health,hunger,thirst,stamina,minutes,found:[...found],searched:[...searched],claimed:safehouses.filter(s=>s.claimed).map(s=>s.id),objective:currentObjective?.id||null,completed:objectives.filter(o=>o.complete).map(o=>o.id)}))}
function loadGame(){try{const s=JSON.parse(localStorage.getItem("outbreak_save")||"null");if(!s)return false;player=s.player;survivor.setLatLng(player);health=s.health;hunger=s.hunger;thirst=s.thirst;stamina=s.stamina;minutes=s.minutes;(s.found||[]).forEach(id=>{found.add(id);const b=buildingById.get(id);if(b)setBuilding(b,"DISCOVERED")});(s.searched||[]).forEach(id=>{searched.add(id);const b=buildingById.get(id);if(b)setBuilding(b,"LOOTED")});(s.claimed||[]).forEach(id=>{const h=safehouses.find(x=>x.id===id);if(h){h.claimed=true;h.layer.setStyle({color:"#59ff87",fillColor:"#59ff87",fillOpacity:.08})}});(s.completed||[]).forEach(id=>{const o=objectives.find(x=>x.id===id);if(o)o.complete=true});const o=objectives.find(x=>x.id===s.objective&&!x.complete)||objectives.find(x=>!x.complete);if(o)activateObjective(o);return true}catch{return false}}
let last=performance.now();
function loop(now){const dt=now-last;last=now;if(!gameOver){hunger=clamp(hunger-dt/180000,0,100);thirst=clamp(thirst-dt/120000,0,100);if(hunger<20||thirst<15)health=clamp(health-dt/120000,0,100);if(health<=0){gameOver=true;$( "objective").textContent="☠ SURVIVOR LOST"}}updateNoise();updateWeather();zombieAI();if(now-lastAutosave>12000){saveGame();lastAutosave=now}requestAnimationFrame(loop)}

// PHASE 3 // SURVIVAL SYSTEMS EXTENSION
let infection=0,weapon=null,ammo=0,nightHorde=false,lastHorde=0,lastEvent=0;
const weapons={"🔪 Kitchen Knife":{name:"KITCHEN KNIFE",damage:42,noise:7,uses:999},"🪓 Rescue Axe":{name:"RESCUE AXE",damage:64,noise:15,uses:999},"🔧 Crowbar":{name:"CROWBAR",damage:52,noise:12,uses:999},"🔦 Heavy Flashlight":{name:"HEAVY FLASHLIGHT",damage:18,noise:4,uses:999},"🛠️ Advanced Tool Kit":{name:"IMPROVISED TOOL",damage:28,noise:10,uses:30}};
function phase3Inv(){return inv()}
function equipBest(){
 const a=phase3Inv(),w=a.filter(x=>weapons[x]).sort((a,b)=>weapons[b].damage-weapons[a].damage)[0];
 weapon=w||null; const s=$("combatStatus"); if(s)s.textContent=weapon?weapons[weapon].name+" • DMG "+weapons[weapon].damage:"UNARMED • FIND A WEAPON";
}
function phase3Hud(){
 const ib=$("infectionBar"),it=$("infection"),c=$("condition");
 if(ib){ib.style.width=clamp(infection,0,100)+"%";it.textContent=Math.round(infection)+"%"}
 if(c)c.textContent=infection>70?"CRITICAL":infection>35?"INFECTED":health<30?"WOUNDED":"STABLE";
 const h=Math.floor(minutes/60)%24,isNight=h>=20||h<6;
 $("day").textContent="DAY "+String(Math.floor(minutes/1440)+1).padStart(2,"0")+(isNight?" • NIGHT":"");
 document.body.classList.toggle("outbreak-night",isNight);
}
function closestThreat(){
 return zombies.filter(z=>dist(z.pos,player)<72).sort((a,b)=>dist(a.pos,player)-dist(b.pos,player))[0];
}
function killZombie(z){
 const i=zombies.indexOf(z); if(i>=0)zombies.splice(i,1);
 map.removeLayer(z.marker);map.removeLayer(z.awareness);log("INFECTED NEUTRALIZED");
}
function attack(){
 if(gameOver||moving)return;const z=closestThreat();
 if(!z)return log("NO INFECTED IN DEFENSE RANGE");
 const w=weapon&&weapons[weapon]; if(!w){emitNoise(10,"PANIC DEFENSE");health=clamp(health-8,0,100);infection=clamp(infection+4,0,100);log("UNARMED STRUGGLE • INJURED");hud();phase3Hud();return}
 stamina=clamp(stamina-9,0,100);emitNoise(w.noise,"COMBAT");const hit=.62+Math.min(.22,stamina/500),damage=w.damage*(.72+Math.random()*.55);
 if(Math.random()<hit&&damage>=32){killZombie(z);log(w.name+" • TARGET DOWN")}else{health=clamp(health-(5+Math.random()*9),0,100);infection=clamp(infection+3,0,100);log("COMBAT CONTACT • WOUND RECEIVED")}
 hud();phase3Hud();
}
function consume(){
 const a=phase3Inv();let idx=a.findIndex(x=>x.includes("Water"));let kind="water";
 if(idx<0){idx=a.findIndex(x=>x.includes("Canned Food"));kind="food"}
 if(idx<0){idx=a.findIndex(x=>/Bandage|Medical Kit|Trauma Kit/.test(x));kind="med"}
 if(idx<0){idx=a.findIndex(x=>/Painkillers/.test(x));kind="pain"}
 if(idx<0)return log("NO USABLE SURVIVAL ITEM");
 const item=a.splice(idx,1)[0];
 if(kind==="water")thirst=clamp(thirst+34,0,100);
 if(kind==="food")hunger=clamp(hunger+28,0,100);
 if(kind==="med"){health=clamp(health+26,0,100);infection=clamp(infection-10,0,100)}
 if(kind==="pain")health=clamp(health+8,0,100);
 saveInv(a);equipBest();log("USED • "+item);hud();phase3Hud();
}
const recipes=[
 {name:"IMPROVISED BANDAGE",need:["🩹 Bandage"],make:"🩹 Trauma Bandage",desc:"Improves emergency healing"},
 {name:"FIELD WEAPON",need:["🔧 Tool Kit"],make:"🛠️ Advanced Tool Kit",desc:"Makes a basic melee weapon"},
 {name:"EMERGENCY CACHE",need:["🔋 Battery","📻 Radio Battery"],make:"📡 Emergency Beacon",desc:"Useful for later extraction systems"}
];
function craft(){
 const a=phase3Inv(),box=$("craftList");box.innerHTML="";
 recipes.forEach((r,i)=>{const ok=r.need.every(x=>a.includes(x));const el=document.createElement("button");el.className="game-btn";el.style.width="100%";el.style.margin="5px 0";el.textContent=(ok?"✓ ":"LOCKED • ")+r.name+" → "+r.make;el.disabled=!ok;el.onclick=()=>{const b=phase3Inv();r.need.forEach(x=>b.splice(b.indexOf(x),1));b.push(r.make);saveInv(b);equipBest();log("CRAFTED • "+r.make);craft()};box.appendChild(el)});
 $("craftModal").classList.remove("hidden");
}
function spawnHorde(){
 if(zombies.length>28)return;
 const count=6+Math.floor(Math.random()*7);
 for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,d=.0014+Math.random()*.0022,p=[player[0]+Math.cos(a)*d,player[1]+Math.sin(a)*d];if(blocked(L.latLng(p)))continue;
 const id="h"+Date.now()+i,z={id,pos:p,state:"INVESTIGATE",target:[...player],lastSeen:0,wanderUntil:0};
 z.awareness=L.circle(p,{radius:70,color:"#ff3148",weight:1,opacity:.15,fillColor:"#ff3148",fillOpacity:.025,interactive:false}).addTo(map);
 z.marker=L.marker(p,{icon:icon("zombie","●",18),zIndexOffset:450}).addTo(map);z.marker.bindTooltip("INFECTED • HORDE",{direction:"top"});zombies.push(z);
 }
 log("⚠ HORDE EVENT • MULTIPLE INFECTED APPROACHING");$("threat").textContent="THREAT: EXTREME";emitNoise(55,"HORDE DISTURBANCE");
}
function phase16b8ThreatTick(){
 const sys=window.CheegunGeneratedLootThreat;if(!sys?.state?.enabled)return;
 const candidates=sys.spawnCandidates(L.latLng(player));
 if(!candidates.length||zombies.length>=32)return;
 const candidate=candidates[0],threat=generatedPoiThreat();
 if(!threat||threat.level<3)return;
 const p=candidate.position;if(blocked(L.latLng(p)))return;
 const id="gpoi-"+candidate.id;
 const z={id,pos:[p[0],p[1]],state:"WANDER",target:null,lastSeen:0,wanderUntil:0};
 z.awareness=L.circle(z.pos,{radius:60+threat.level*12,color:"#ff3148",weight:1,opacity:.14,fillColor:"#ff3148",fillOpacity:.02,interactive:false}).addTo(map);
 z.marker=L.marker(z.pos,{icon:icon("zombie","●",18),zIndexOffset:450}).addTo(map);z.marker.bindTooltip("INFECTED • REAL-WORLD THREAT",{direction:"top"});
 zombies.push(z);sys.consumeSpawnCandidate(candidate.id);log("THREAT CONTACT • "+threat.poi.name.toUpperCase());}
function phase3Tick(){
 if(gameOver)return;
 const hour=Math.floor(minutes/60)%24,isNight=hour>=20||hour<6;
 if(isNight&&!nightHorde){nightHorde=true;log("NIGHT FALLS • INFECTED ACTIVITY INCREASES");}
 if(!isNight&&nightHorde){nightHorde=false;$("threat").textContent="THREAT: MODERATE";log("DAYBREAK • VISIBILITY IMPROVING");}
 if(isNight&&Date.now()-lastHorde>90000){spawnHorde();lastHorde=Date.now()}
 phase16b8ThreatTick();
 if(Date.now()-lastEvent>120000&&Math.random()<.38){lastEvent=Date.now();const events=["DISTANT SCREAMS","CAR ALARM","GUNSHOT ECHO","RADIO STATIC"];const e=events[Math.floor(Math.random()*events.length)];log("WORLD EVENT • "+e);if(Math.random()<.55)emitNoise(30,e)}
 if(infection>0)infection=clamp(infection+(health<35?.08:.025),0,100);
 if(infection>55)health=clamp(health-.06,0,100);
 if(infection>=100){gameOver=true;health=0;log("INFECTION OVERWHELMED THE SURVIVOR");$("objective").textContent="☠ INFECTION TERMINAL"}
 phase3Hud();
}
document.addEventListener("keydown",e=>{if(e.code==="Space"){e.preventDefault();attack()}});
$("attackBtn")?.addEventListener("click",attack);$("consumeBtn")?.addEventListener("click",consume);$("craftBtn")?.addEventListener("click",craft);$("craftClose")?.addEventListener("click",()=>$("craftModal").classList.add("hidden"));
const _phase3Save=saveGame; saveGame=function(){_phase3Save();try{const s=JSON.parse(localStorage.getItem("outbreak_save")||"{}");s.infection=infection;s.weapon=weapon;localStorage.setItem("outbreak_save",JSON.stringify(s))}catch{}};
const _phase3Load=loadGame; loadGame=function(){const ok=_phase3Load();try{const s=JSON.parse(localStorage.getItem("outbreak_save")||"{}");infection=s.infection||0;weapon=s.weapon||null}catch{};return ok};
phase16b10StartExpedition();
document.addEventListener("cheegunWorldLive",()=>{setTimeout(()=>phase16b10StartExpedition(),50)},{once:true});
setInterval(()=>{phase3Tick();equipBest()},1000);
saveInv(inv());explored=[[...player]];const loaded=loadGame();reveal();discover();hud();if(!currentObjective)activateObjective(objectives[0]);log(loaded?"SESSION RESTORED • TACTICAL WORLD PERSISTENT":"TACTICAL WORLD LAYER 2 ONLINE");log("10 LOCATIONS • 3 OBJECTIVES • 3 SAFEHOUSES");log("12 INFECTED ACTIVE • WEATHER SYSTEM ONLINE");log("CLICK SURVIVOR TO BEGIN");requestAnimationFrame(loop);setTimeout(()=>map.invalidateSize(),250)})();