(()=>{
"use strict";
/**
 * PHASE 16B.2 — GENERATED GEOGRAPHY → GAMEPLAY
 * Converts normalized OSM features into tactical roads, POIs, terrain zones,
 * threat-weighted zombie spawn candidates, and extraction candidates.
 *
 * This layer is additive. Existing prototype systems remain authoritative until
 * each generated output is explicitly consumed by gameplay.
 */
const CFG={
 maxPois:160,maxRoads:240,maxSpawns:80,maxExtractions:8,
 poiRadius:18,spawnSpacing:0.00065,extractionMinDistance:0.018
};
const state={status:"IDLE",world:null,tactical:null,overlays:null,error:null};

function centroid(points){
 const n=points?.length||0;if(!n)return null;
 let a=0,b=0;for(const p of points){a+=p[0];b+=p[1]}return[a/n,b/n];
}
function dist(a,b){const x=a[0]-b[0],y=a[1]-b[1];return Math.sqrt(x*x+y*y)}
function farEnough(p,list,min){return list.every(x=>dist(p,x.position||x)>=min)}
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0)/4294967295}
function buildingKind(f){
 const t=f.tags||{};
 if(t.amenity==="hospital"||t.healthcare)return "medical";
 if(t.amenity==="police"||t.amenity==="fire_station")return "security";
 if(t.shop||t.amenity==="fuel")return "supplies";
 if(t.building==="industrial"||t.landuse==="industrial")return "industrial";
 if(t.building==="apartments"||t.building==="house")return "residential";
 return f.loot==="none"?"unknown":f.loot;
}
function poiFrom(f){
 const position=centroid(f.geometry);if(!position)return null;
 const kind=buildingKind(f), threat=Math.max(1,Math.min(5,f.threat||2));
 return {id:"poi-"+f.id,name:f.name,type:kind,position,threat,loot:f.loot||kind,searchable:true,sourceFeature:f.id};
}
function buildRoadGraph(features){
 const roads=features.filter(f=>f.type==="road"&&f.geometry?.length>1).slice(0,CFG.maxRoads);
 const nodes=new Map(),edges=[];
 const key=p=>p[0].toFixed(5)+","+p[1].toFixed(5);
 roads.forEach(r=>{for(let i=0;i<r.geometry.length;i++){
   const p=r.geometry[i],k=key(p);if(!nodes.has(k))nodes.set(k,{id:k,position:p});
   if(i){const q=r.geometry[i-1],qk=key(q);edges.push({a:qk,b:k,cost:dist(p,q),road:r.id});}
 }});
 return {nodes:[...nodes.values()],edges};
}
function tacticalize(world){
 const fs=world.features||[];
 const pois=fs.filter(f=>f.type==="building"||f.tags?.amenity).map(poiFrom).filter(Boolean).slice(0,CFG.maxPois);
 const terrain=fs.filter(f=>["water","forest","residential","industrial"].includes(f.type)).map(f=>({id:"zone-"+f.id,type:f.type,geometry:f.geometry,movement:f.type==="water"?"blocked":f.type==="forest"?1.8:1,visibility:f.type==="forest"?0.65:1,sourceFeature:f.id}));
 const roads=buildRoadGraph(fs);
 const spawns=[];
 [...pois].sort((a,b)=>b.threat-a.threat).forEach(p=>{
   const weight=(p.threat/5)*.7+hash(p.id)*.3;
   if(weight>.42&&spawns.length<CFG.maxSpawns&&farEnough(p.position,spawns,CFG.spawnSpacing))
     spawns.push({id:"spawn-"+p.id,position:p.position,threat:p.threat,weight,reason:p.type});
 });
 const center=world.region?.center||[48.414,-89.245], candidates=[];
 fs.filter(f=>f.type==="road"&&f.geometry?.length).forEach(f=>{
   const p=f.geometry[f.geometry.length-1];if(p&&dist(p,center)>CFG.extractionMinDistance)candidates.push({id:"extract-"+f.id,position:p,road:f.id});
 });
 const extractions=[];for(const c of candidates){if(extractions.length>=CFG.maxExtractions)break;if(farEnough(c.position,extractions,CFG.extractionMinDistance/3))extractions.push({...c,type:"generated",active:true});}
 return {version:"16B.2",region:world.region,generatedAt:Date.now(),roads,pois,terrain,spawns,extractions};
}
function render(tactical,map){
 if(!window.L||!map)return null;
 clear(map);const g=L.layerGroup().addTo(map);state.overlays=g;
 tactical.pois.forEach(p=>L.circleMarker(p.position,{radius:4,weight:1,opacity:.75,fillOpacity:.25}).bindTooltip(p.name+" • "+p.type+" • T"+p.threat).addTo(g));
 tactical.extractions.forEach(e=>L.circle(e.position,{radius:90,weight:2,dashArray:"6 6",fillOpacity:.06}).bindTooltip("GENERATED EXTRACTION").addTo(g));
 return g;
}
function clear(map){if(state.overlays&&map)map.removeLayer(state.overlays);state.overlays=null}
function publish(tactical){window.cheegunGeneratedGameplay=tactical;document.dispatchEvent(new CustomEvent("cheegunGeneratedGameplayReady",{detail:tactical}));}
function summary(t){return{pois:t.pois.length,roadNodes:t.roads.nodes.length,roadEdges:t.roads.edges.length,terrainZones:t.terrain.length,zombieSpawnCandidates:t.spawns.length,extractionCandidates:t.extractions.length}}
async function boot(world=window.cheegunGeneratedWorld,map=window.cheegunMap){
 if(!world){state.status="WAITING";return null}
 state.status="BUILDING";try{const tactical=tacticalize(world);state.world=world;state.tactical=tactical;publish(tactical);if(map)render(tactical,map);state.status="LIVE";console.info("[CHEEGUN 16B.2]",summary(tactical));return tactical}catch(e){state.error=String(e?.message||e);state.status="FALLBACK";console.warn("[CHEEGUN 16B.2] generated gameplay unavailable",e);return null}
}
window.CheegunGeneratedGameplay={CFG,state,tacticalize,render,clear,summary,boot};
document.addEventListener("cheegunWorldLive",e=>boot(e.detail.world,window.cheegunMap));
if(window.cheegunGeneratedWorld)setTimeout(()=>boot(),0);
})();