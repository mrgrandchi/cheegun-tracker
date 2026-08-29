(()=>{
"use strict";
/**
 * PHASE 16B.9 — GENERATED EXTRACTION AUTHORITY
 * Promotes geographically generated extraction candidates into the expedition
 * objective while retaining existing extraction logic as fallback.
 */
const CFG={activateRadius:140,completeRadius:32,minExtractMinutes:3};
const state={enabled:false,activeId:null,activatedAt:null,completed:false,stats:{activated:0,completed:0}};

function tactical(){return window.cheegunGeneratedGameplay}
function bridge(){return window.CheegunGeneratedGameplayBridge}
function dist(a,b){
 const x=(a.lat??a[0])-(b.lat??b[0]),y=(a.lng??a[1])-(b.lng??b[1]);
 return Math.hypot(x,y)*111000;
}
function candidates(){return tactical()?.extractions||[]}
function active(){return candidates().find(x=>x.id===state.activeId)||null}
function choose(playerPosition){
 if(!state.enabled)return null;
 const list=candidates();if(!list.length)return null;
 // Prefer a geographically meaningful distant extraction.
 const sorted=list.map(e=>({e,d:dist(playerPosition,e.position)}))
  .filter(x=>x.d>=CFG.activateRadius)
  .sort((a,b)=>b.d-a.d);
 const chosen=(sorted[0]||list.map(e=>({e,d:dist(playerPosition,e.position)})).sort((a,b)=>b.d-a.d)[0])?.e||null;
 if(chosen){state.activeId=chosen.id;state.activatedAt=Date.now();state.completed=false;state.stats.activated++;
  document.dispatchEvent(new CustomEvent("cheegunExtractionAssigned",{detail:{extraction:chosen}}));}
 return chosen;
}
function status(playerPosition){
 const e=active();if(!e)return {active:false,reason:"NO_EXTRACTION"};
 const d=dist(playerPosition,e.position),elapsed=state.activatedAt?(Date.now()-state.activatedAt)/60000:0;
 return {active:true,extraction:e,distance:d,withinZone:d<=CFG.completeRadius,elapsed,ready:d<=CFG.completeRadius&&elapsed>=CFG.minExtractMinutes,completed:state.completed};
}
function complete(playerPosition){
 const s=status(playerPosition);
 if(!s.active)return {ok:false,reason:"NO_EXTRACTION"};
 if(s.completed)return {ok:false,reason:"ALREADY_EXTRACTED"};
 if(!s.withinZone)return {ok:false,reason:"NOT_AT_EXTRACTION",distance:s.distance};
 // Keep extraction time requirement advisory for now so the existing expedition
 // loop remains usable while generated candidate geometry is verified.
 state.completed=true;state.stats.completed++;
 const result={ok:true,extraction:s.extraction,distance:s.distance};
 document.dispatchEvent(new CustomEvent("cheegunGeneratedExtractionComplete",{detail:result}));
 return result;
}
function markerIcon(){return window.L?.divIcon({className:"generated-extraction-marker",html:"<div style='font-size:24px;filter:drop-shadow(0 0 5px #5ff)'>✈</div>",iconSize:[28,28],iconAnchor:[14,14]})}
function render(map=window.cheegunMap){
 if(!state.enabled||!map||!window.L)return null;
 if(window.cheegunGeneratedExtractionLayer)map.removeLayer(window.cheegunGeneratedExtractionLayer);
 const layer=L.layerGroup().addTo(map);window.cheegunGeneratedExtractionLayer=layer;
 for(const e of candidates()){
  const activeNow=e.id===state.activeId;
  L.marker(e.position,{icon:markerIcon(),opacity:activeNow?1:.45})
   .bindTooltip((activeNow?"ACTIVE EXTRACTION • ":"EXTRACTION CANDIDATE • ")+(e.name||e.id))
   .addTo(layer);
 }
 return layer;
}
function clear(map=window.cheegunMap){if(window.cheegunGeneratedExtractionLayer&&map)map.removeLayer(window.cheegunGeneratedExtractionLayer);window.cheegunGeneratedExtractionLayer=null}
function enable(){if(!candidates().length){console.warn("[CHEEGUN 16B.9] Generated extractions unavailable");return false}bridge()?.enable("generatedExtractions");state.enabled=true;document.dispatchEvent(new CustomEvent("cheegunExtractionAuthorityEnabled",{detail:{state}}));return true}
function disable(){bridge()?.disable("generatedExtractions");clear();state.enabled=false;state.activeId=null;return true}
window.CheegunExtractionAuthority={CFG,state,candidates,active,choose,status,complete,render,clear,enable,disable};
console.info("[CHEEGUN 16B.9] Generated extraction authority ready; explicit enable required.");
})();