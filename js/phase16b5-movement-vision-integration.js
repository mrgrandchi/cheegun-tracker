(()=>{
"use strict";
/**
 * PHASE 16B.5 — MOVEMENT & VISION INTEGRATION
 * Runtime adapters for routing player movement and vision through the
 * generated-terrain authority without replacing existing prototype systems.
 */
const CFG={baseVision:120,minVision:35,blockedMessage:"IMPASSABLE WATER"};
const state={enabled:false,lastTerrain:null,lastMove:null,stats:{moves:0,blocked:0,modified:0,visionUpdates:0}};

function authority(){return window.CheegunTerrainAuthority}
function bridge(){return window.CheegunGeneratedGameplayBridge}
function resolveMove(target,baseCost=1){
 const a=authority();
 const result=(state.enabled&&a?.resolveMove)?a.resolveMove(target,baseCost):{allowed:true,cost:baseCost,source:"prototype",terrain:null};
 state.lastMove=result;state.lastTerrain=result.terrain||null;state.stats.moves++;
 if(!result.allowed)state.stats.blocked++;
 else if(result.cost!==baseCost)state.stats.modified++;
 return result;
}
function visionAt(position,base=CFG.baseVision){
 let v=base;
 if(state.enabled&&authority()?.visibility)v=authority().visibility(position,base);
 state.stats.visionUpdates++;
 return Math.max(CFG.minVision,v);
}
/**
 * Wrap an existing movement attempt. The caller supplies the actual movement
 * callback so existing animation/path logic remains untouched.
 */
function attemptMove(target,moveFn,baseCost=1){
 const r=resolveMove(target,baseCost);
 if(!r.allowed){
  document.dispatchEvent(new CustomEvent("cheegunMovementBlocked",{detail:{target,reason:"water",result:r}}));
  return {moved:false,blocked:true,result:r};
 }
 const output=typeof moveFn==="function"?moveFn(target,r):undefined;
 document.dispatchEvent(new CustomEvent("cheegunMovementResolved",{detail:{target,result:r,output}}));
 return {moved:true,blocked:false,result:r,output};
}
/**
 * Apply generated visibility to common Leaflet radius layers without assuming
 * ownership of the existing fog implementation.
 */
function applyVisionLayer(layer,position,baseRadius=CFG.baseVision){
 const radius=visionAt(position,baseRadius);
 if(layer?.setRadius)layer.setRadius(radius);
 document.dispatchEvent(new CustomEvent("cheegunVisionUpdated",{detail:{position,radius,terrain:state.lastTerrain}}));
 return radius;
}
function hudLabel(){
 if(!state.enabled)return "PROTOTYPE TERRAIN";
 const z=state.lastTerrain;
 if(!z)return "REAL TERRAIN • CLEAR";
 if(z.type==="forest")return "REAL TERRAIN • FOREST";
 if(z.type==="water")return "REAL TERRAIN • WATER";
 return "REAL TERRAIN • "+String(z.type||"ZONE").toUpperCase();
}
function enable(){
 if(!authority()){console.warn("[CHEEGUN 16B.5] Terrain authority unavailable");return false}
 authority().enable();bridge()?.enable("generatedTerrain");
 state.enabled=true;
 document.dispatchEvent(new CustomEvent("cheegunMovementVisionEnabled",{detail:{state}}));
 return true;
}
function disable(){
 authority()?.disable();bridge()?.disable("generatedTerrain");
 state.enabled=false;
 document.dispatchEvent(new CustomEvent("cheegunMovementVisionDisabled",{detail:{state}}));
 return true;
}
window.CheegunMovementVision={
 CFG,state,resolveMove,visionAt,attemptMove,applyVisionLayer,hudLabel,enable,disable
};
document.addEventListener("cheegunTerrainAuthorityEnabled",()=>{state.enabled=true});
document.addEventListener("cheegunTerrainAuthorityDisabled",()=>{state.enabled=false});
console.info("[CHEEGUN 16B.5] Movement + vision integration ready; explicit enable required.");
})();