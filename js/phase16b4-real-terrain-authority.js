(()=>{
"use strict";
/**
 * PHASE 16B.4 — REAL TERRAIN AUTHORITY
 * Makes generated geographic terrain authoritative for movement cost and
 * water blocking, while preserving existing terrain as fallback.
 */
const state={enabled:false,wrapped:false,stats:{queries:0,blocked:0,modified:0},originals:{}};

function bridge(){return window.CheegunGeneratedGameplayBridge}
function terrain(latlng){return bridge()?.terrainAt?.(latlng)||null}
function classify(latlng){
 const z=terrain(latlng);
 if(!z)return {zone:null,blocked:false,cost:1,visibility:1};
 return {zone:z,blocked:z.movement==="blocked",cost:typeof z.movement==="number"?z.movement:1,visibility:z.visibility??1};
}
function movement(latlng,base=1){
 state.stats.queries++;
 const t=classify(latlng);
 if(t.blocked){state.stats.blocked++;return Infinity}
 if(t.cost!==1)state.stats.modified++;
 return base*t.cost;
}
function canEnter(latlng){return !classify(latlng).blocked}
function visibility(latlng,base=1){return base*classify(latlng).visibility}
function enable(){
 if(!bridge()){console.warn("[CHEEGUN 16B.4] Generated bridge unavailable");return false}
 bridge().enable("generatedTerrain");
 state.enabled=true;
 document.dispatchEvent(new CustomEvent("cheegunTerrainAuthorityEnabled",{detail:{state}}));
 return true;
}
function disable(){
 bridge()?.disable("generatedTerrain");state.enabled=false;
 document.dispatchEvent(new CustomEvent("cheegunTerrainAuthorityDisabled",{detail:{state}}));
 return true;
}
/**
 * Adapter for existing movement callers.
 * Consumers can call this without knowing whether generated terrain is active.
 */
function resolveMove(latlng,baseCost=1){
 if(!state.enabled)return {allowed:true,cost:baseCost,source:"prototype",terrain:null};
 const t=classify(latlng);
 if(t.blocked)return {allowed:false,cost:Infinity,source:"generated",terrain:t.zone};
 return {allowed:true,cost:baseCost*t.cost,source:"generated",terrain:t.zone};
}
window.CheegunTerrainAuthority={
 state,classify,movement,canEnter,visibility,resolveMove,enable,disable
};
document.addEventListener("cheegunGeneratedGameplayAdoptionReady",()=>console.info("[CHEEGUN 16B.4] Terrain authority ready; awaiting explicit enable."));
if(window.cheegunGeneratedGameplayBridge)console.info("[CHEEGUN 16B.4] Terrain authority loaded.");
})();