(()=>{
"use strict";
/**
 * PHASE 16B.1 — LIVE THUNDER BAY INTEGRATION
 * Boots generated geography without replacing the proven prototype gameplay layer.
 */
const REGION={id:"thunder-bay",name:"THUNDER BAY",center:[48.414,-89.245],radius:3500};
const state={status:"IDLE",world:null,summary:null,error:null};

function emit(name,detail){document.dispatchEvent(new CustomEvent(name,{detail}));}
function banner(text,kind="info"){
 const el=document.getElementById("objective");
 if(el){el.textContent=text;el.dataset.worldStatus=kind;}
}
function mapInstance(){
 return window.cheegunMap||window.map||null;
}
async function boot(){
 const map=mapInstance();
 if(!map||!window.CheegunWorldGenerator||!window.CheegunWorldRenderer){
  state.status="WAITING";return false;
 }
 state.status="GENERATING";
 banner("GENERATING REAL-WORLD THUNDER BAY…","loading");
 try{
  const world=await CheegunWorldRenderer.generateAndRender(map,REGION);
  state.world=world;state.summary=CheegunWorldGenerator.summary(world);state.status="LIVE";
  window.cheegunGeneratedWorld=world;
  banner("REAL-WORLD GEOGRAPHY ONLINE • "+state.summary.total+" FEATURES","live");
  emit("cheegunWorldLive",{world,summary:state.summary});
  return true;
 }catch(error){
  state.error=String(error?.message||error);state.status="FALLBACK";
  console.warn("[CHEEGUN 16B.1] Generated geography unavailable. Prototype layer remains active.",error);
  banner("MAP DATA OFFLINE • PROTOTYPE GEOGRAPHY ACTIVE","fallback");
  emit("cheegunWorldFallback",{error,state});
  return false;
 }
}
function retry(){return boot();}
window.CheegunWorldIntegration={REGION,state,boot,retry};
document.addEventListener("cheegunMapReady",()=>boot(),{once:true});
setTimeout(()=>{if(state.status==="IDLE"||state.status==="WAITING")boot()},900);
})();