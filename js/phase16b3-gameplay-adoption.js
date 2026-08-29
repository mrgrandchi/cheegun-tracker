(()=>{
"use strict";
/**
 * PHASE 16B.3 — GENERATED GAMEPLAY ADOPTION
 * Safely adapts generated geography into existing game systems.
 * Feature flags default OFF so prototype gameplay remains authoritative.
 */
const FLAGS={
 generatedRouting:false,
 generatedPois:false,
 generatedTerrain:false,
 generatedSpawns:false,
 generatedExtractions:false
};
const state={status:"IDLE",tactical:null,adopted:{},error:null};

function terrainAt(latlng,tactical=state.tactical){
 if(!tactical?.terrain)return null;
 const p=[latlng.lat??latlng[0],latlng.lng??latlng[1]];
 // Lightweight bounds check; precise polygon collision can replace this later.
 for(const z of tactical.terrain){
  const g=z.geometry||[];if(!g.length)continue;
  const lats=g.map(x=>x[0]),lngs=g.map(x=>x[1]);
  if(p[0]>=Math.min(...lats)&&p[0]<=Math.max(...lats)&&p[1]>=Math.min(...lngs)&&p[1]<=Math.max(...lngs))return z;
 }
 return null;
}
function nearestPoi(latlng,max=0.0012,tactical=state.tactical){
 const p=[latlng.lat??latlng[0],latlng.lng??latlng[1]];let best=null,d=max;
 for(const poi of tactical?.pois||[]){const x=Math.hypot(p[0]-poi.position[0],p[1]-poi.position[1]);if(x<d){best=poi;d=x}}
 return best;
}
function nearestExtraction(latlng,max=0.003,tactical=state.tactical){
 const p=[latlng.lat??latlng[0],latlng.lng??latlng[1]];let best=null,d=max;
 for(const e of tactical?.extractions||[]){const x=Math.hypot(p[0]-e.position[0],p[1]-e.position[1]);if(x<d){best=e;d=x}}
 return best;
}
function selectSpawns(count=12,tactical=state.tactical){
 const pool=[...(tactical?.spawns||[])].sort((a,b)=>b.weight-a.weight);
 return pool.slice(0,count);
}
function routeHint(from,to,tactical=state.tactical){
 // Nearest generated road nodes provide an incremental routing hook without
 // replacing the existing movement implementation.
 const nodes=tactical?.roads?.nodes||[];
 const a=[from.lat??from[0],from.lng??from[1]],b=[to.lat??to[0],to.lng??to[1]];
 const nearest=p=>nodes.reduce((best,n)=>!best||Math.hypot(p[0]-n.position[0],p[1]-n.position[1])<Math.hypot(p[0]-best.position[0],p[1]-best.position[1])?n:best,null);
 return {from:nearest(a),to:nearest(b),available:nodes.length>0};
}
function movementCost(latlng,base=1){
 if(!FLAGS.generatedTerrain)return base;
 const z=terrainAt(latlng);return z?base*z.movement:base;
}
function registerApi(){
 window.CheegunGeneratedGameplayBridge={
  FLAGS,state,terrainAt,nearestPoi,nearestExtraction,selectSpawns,routeHint,movementCost,
  enable(name){if(name in FLAGS)FLAGS[name]=true;return {...FLAGS}},
  disable(name){if(name in FLAGS)FLAGS[name]=false;return {...FLAGS}},
  status(){return {status:state.status,flags:{...FLAGS},summary:window.CheegunGeneratedGameplay?.summary?.(state.tactical)}}
 };
}
function adopt(tactical){
 state.tactical=tactical;state.status="READY";
 registerApi();
 document.dispatchEvent(new CustomEvent("cheegunGeneratedGameplayAdoptionReady",{detail:{tactical,bridge:window.CheegunGeneratedGameplayBridge}}));
 console.info("[CHEEGUN 16B.3] Generated gameplay bridge ready. Feature flags remain OFF.",window.CheegunGeneratedGameplayBridge.status());
}
document.addEventListener("cheegunGeneratedGameplayReady",e=>adopt(e.detail));
if(window.cheegunGeneratedGameplay)adopt(window.cheegunGeneratedGameplay);
else registerApi();
})();