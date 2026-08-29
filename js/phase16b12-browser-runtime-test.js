(()=>{
"use strict";
/**
 * PHASE 16B.12 — BROWSER RUNTIME TEST & INTEGRATION REPAIR
 * Browser-side smoke test that validates load order, runtime globals,
 * generated-world integration, and captures uncaught failures.
 */
const state={startedAt:Date.now(),errors:[],rejections:[],lastReport:null,listenerInstalled:false};
function install(){
 if(state.listenerInstalled)return;
 state.listenerInstalled=true;
 window.addEventListener("error",e=>state.errors.push({message:e.message,source:e.filename,line:e.lineno,column:e.colno,time:Date.now()}));
 window.addEventListener("unhandledrejection",e=>state.rejections.push({reason:String(e.reason),time:Date.now()}));
}
function check(name,pass,detail="",severity="error"){return{name,pass:!!pass,detail,severity}}
function run(){
 install();
 const required={
  Leaflet:!!window.L,
  WorldGenerator:!!window.CheegunWorldGenerator,
  WorldRenderer:!!window.CheegunWorldRenderer,
  TerrainAuthority:!!window.CheegunTerrainAuthority,
  MovementVision:!!window.CheegunMovementVision,
  PoiAuthority:!!window.CheegunPoiAuthority,
  LootThreat:!!window.CheegunGeneratedLootThreat,
  ExtractionAuthority:!!window.CheegunExtractionAuthority,
  RealWorldMode:!!window.CheegunRealWorldMode,
  QA:!!window.CheegunRealWorldQA,
  OutbreakMap:!!window.cheegunMap
 };
 const checks=Object.entries(required).map(([k,v])=>check("Runtime global • "+k,v));
 checks.push(check("Generated world available",!!window.cheegunGeneratedWorld));
 checks.push(check("Generated tactical data available",!!window.cheegunGeneratedGameplay));
 checks.push(check("No uncaught runtime errors",state.errors.length===0,JSON.stringify(state.errors)));
 checks.push(check("No unhandled promise rejections",state.rejections.length===0,JSON.stringify(state.rejections)));
 const qa=window.CheegunRealWorldQA?.run?.();
 if(qa)checks.push(check("16B.11 QA gate",qa.pass===true,qa.pass?"PASS":qa.errors+" errors"));
 const report={phase:"16B.12",time:new Date().toISOString(),checks,errors:[...state.errors],rejections:[...state.rejections],qa,pass:checks.filter(x=>x.severity==="error").every(x=>x.pass)};
 state.lastReport=report;window.cheegunRuntimeTest=report;
 console.group("[CHEEGUN 16B.12] BROWSER RUNTIME TEST");
 console.table(checks);console.log(report);console.groupEnd();
 document.dispatchEvent(new CustomEvent("cheegunRuntimeTestComplete",{detail:report}));
 return report;
}
function waitAndRun(ms=12000){
 install();const started=Date.now();const poll=()=>{
  if(window.cheegunGeneratedWorld&&window.cheegunGeneratedGameplay)return run();
  if(Date.now()-started>=ms)return run();
  setTimeout(poll,250);
 };poll();
}
window.CheegunRuntimeTest={state,install,run,waitAndRun};
install();waitAndRun();
console.info("[CHEEGUN 16B.12] Browser runtime test harness armed.");
})();