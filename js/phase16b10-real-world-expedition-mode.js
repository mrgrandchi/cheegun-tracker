(()=>{
"use strict";
/**
 * PHASE 16B.10 — REAL WORLD EXPEDITION MODE
 * One orchestrator for the complete generated-world gameplay pipeline.
 */
const state={enabled:false,started:false,runId:null,startedAt:null,systems:{},stats:{enables:0,starts:0,failures:0}};

const systems=[
 ["terrain",()=>window.CheegunMovementVision?.enable?.(),()=>window.CheegunMovementVision?.disable?.()],
 ["pois",()=>window.CheegunPoiAuthority?.enable?.(),()=>window.CheegunPoiAuthority?.disable?.()],
 ["lootThreat",()=>window.CheegunGeneratedLootThreat?.enable?.(),()=>window.CheegunGeneratedLootThreat?.disable?.()],
 ["extraction",()=>window.CheegunExtractionAuthority?.enable?.(),()=>window.CheegunExtractionAuthority?.disable?.()]
];

function prerequisites(){
 return {
  world:!!window.cheegunGeneratedWorld,
  tactical:!!window.cheegunGeneratedGameplay,
  terrain:!!window.CheegunMovementVision,
  pois:!!window.CheegunPoiAuthority,
  lootThreat:!!window.CheegunGeneratedLootThreat,
  extraction:!!window.CheegunExtractionAuthority
 };
}
function enable(){
 const p=prerequisites();
 if(!Object.values(p).every(Boolean)){
  state.stats.failures++;
  console.warn("[CHEEGUN REAL WORLD MODE] Missing prerequisites",p);
  return {ok:false,reason:"MISSING_PREREQUISITES",prerequisites:p};
 }
 const activated=[];
 for(const [name,on] of systems){
  try{
   const ok=on();
   state.systems[name]=ok!==false;
   if(ok===false)throw new Error(name+" refused enable");
   activated.push(name);
  }catch(error){
   state.stats.failures++;
   for(const [rollbackName,,off] of systems.filter(([n])=>activated.includes(n)).reverse()){
    try{off();state.systems[rollbackName]=false}catch{}
   }
   state.enabled=false;
   return {ok:false,reason:"ENABLE_FAILED",system:name,error:String(error)};
  }
 }
 state.enabled=true;state.stats.enables++;
 document.dispatchEvent(new CustomEvent("cheegunRealWorldModeEnabled",{detail:{state}}));
 return {ok:true,systems:{...state.systems}};
}
function disable(){
 for(const [name,,off] of [...systems].reverse()){
  try{off();state.systems[name]=false}catch{}
 }
 state.enabled=false;state.started=false;
 document.dispatchEvent(new CustomEvent("cheegunRealWorldModeDisabled",{detail:{state}}));
 return {ok:true};
}
function start(playerPosition){
 if(!state.enabled){const r=enable();if(!r.ok)return r}
 state.runId="rw-"+Date.now().toString(36);state.started=true;state.startedAt=Date.now();state.stats.starts++;
 const extraction=window.CheegunExtractionAuthority?.choose?.(playerPosition);
 window.CheegunExtractionAuthority?.render?.(window.cheegunMap);
 const result={ok:true,runId:state.runId,startedAt:state.startedAt,extraction};
 document.dispatchEvent(new CustomEvent("cheegunRealWorldExpeditionStarted",{detail:result}));
 return result;
}
function status(playerPosition){
 const elapsed=state.startedAt?Math.floor((Date.now()-state.startedAt)/1000):0;
 return {
  enabled:state.enabled,started:state.started,runId:state.runId,elapsed,
  systems:{...state.systems},
  terrain:window.CheegunTerrainAuthority?.state?.enabled||false,
  poi:{discovered:window.CheegunPoiAuthority?.state?.discovered?.size||0,searched:window.CheegunPoiAuthority?.state?.searched?.size||0},
  threat:window.CheegunGeneratedLootThreat?.state?.stats||null,
  extraction:playerPosition?window.CheegunExtractionAuthority?.status?.(playerPosition):window.CheegunExtractionAuthority?.active?.()||null
 };
}
function reset(){
 disable();
 window.CheegunPoiAuthority?.state?.discovered?.clear?.();
 window.CheegunPoiAuthority?.state?.searched?.clear?.();
 window.CheegunGeneratedLootThreat?.state?.spawned?.clear?.();
 window.CheegunExtractionAuthority&&(window.CheegunExtractionAuthority.state.completed=false);
 state.runId=null;state.startedAt=null;
 return {ok:true};
}
window.CheegunRealWorldMode={state,prerequisites,enable,disable,start,status,reset};
console.info("[CHEEGUN 16B.10] Real World Expedition Mode ready.");
})();