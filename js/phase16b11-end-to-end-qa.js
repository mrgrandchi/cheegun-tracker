(()=>{
"use strict";
/**
 * PHASE 16B.11 — END-TO-END QA & BALANCING
 * Non-destructive verification of the complete Real World Expedition pipeline.
 */
const CFG={discoveryRadiusRange:[50,140],interactionRadiusRange:[20,60],extractionRadiusRange:[20,60],spawnDistanceRange:[80,1200],maxPoiCount:5000};
const state={lastReport:null,runs:0,issues:[]};

function add(report,name,pass,detail="",severity="error"){
 const row={name,pass:!!pass,detail,severity};report.checks.push(row);if(!pass)state.issues.push(row);return row;
}
function warn(report,name,detail){return add(report,name,false,detail,"warning")}
function validatePosition(p){return Array.isArray(p)&&p.length>=2&&Number.isFinite(+p[0])&&Number.isFinite(+p[1])&&Math.abs(p[0])<=90&&Math.abs(p[1])<=180}
function run(){
 state.runs++;state.issues=[];
 const report={phase:"16B.11",time:new Date().toISOString(),checks:[],metrics:{},issues:state.issues};
 const world=window.cheegunGeneratedWorld,tactical=window.cheegunGeneratedGameplay,mode=window.CheegunRealWorldMode;
 add(report,"Generated world loaded",!!world,world?.region?.name||"missing");
 add(report,"Tactical gameplay loaded",!!tactical,!!tactical);
 add(report,"Real World Mode API",!!mode);
 add(report,"Terrain pipeline",!!window.CheegunTerrainAuthority&&!!window.CheegunMovementVision);
 add(report,"POI pipeline",!!window.CheegunPoiAuthority);
 add(report,"Loot/threat pipeline",!!window.CheegunGeneratedLootThreat);
 add(report,"Extraction pipeline",!!window.CheegunExtractionAuthority);
 if(world?.region)add(report,"Thunder Bay identity",world.region.id==="thunder-bay",world.region.id);
 const pois=tactical?.pois||[],spawns=tactical?.spawns||[],extractions=tactical?.extractions||[];
 report.metrics={pois:pois.length,spawns:spawns.length,extractions:extractions.length,features:world?.features?.length||0};
 add(report,"POI count > 0",pois.length>0,String(pois.length));
 add(report,"POI count sane",pois.length<=CFG.maxPoiCount,String(pois.length));
 add(report,"Spawn candidates > 0",spawns.length>0,String(spawns.length));
 add(report,"Extraction candidates > 0",extractions.length>0,String(extractions.length));
 add(report,"POI coordinates valid",pois.every(p=>validatePosition(p.position)),pois.filter(p=>!validatePosition(p.position)).length+" invalid");
 add(report,"Spawn coordinates valid",spawns.every(p=>validatePosition(p.position)),spawns.filter(p=>!validatePosition(p.position)).length+" invalid");
 add(report,"Extraction coordinates valid",extractions.every(p=>validatePosition(p.position)),extractions.filter(p=>!validatePosition(p.position)).length+" invalid");
 const poiCfg=window.CheegunPoiAuthority?.CFG;
 if(poiCfg){
  add(report,"Discovery radius balanced",poiCfg.discoverRadius>=CFG.discoveryRadiusRange[0]&&poiCfg.discoverRadius<=CFG.discoveryRadiusRange[1],poiCfg.discoverRadius+"m");
  add(report,"Interaction radius balanced",poiCfg.interactRadius>=CFG.interactionRadiusRange[0]&&poiCfg.interactRadius<=CFG.interactionRadiusRange[1],poiCfg.interactRadius+"m");
 }
 const exCfg=window.CheegunExtractionAuthority?.CFG;
 if(exCfg)add(report,"Extraction radius balanced",exCfg.completeRadius>=CFG.extractionRadiusRange[0]&&exCfg.completeRadius<=CFG.extractionRadiusRange[1],exCfg.completeRadius+"m");
 const threatCfg=window.CheegunGeneratedLootThreat?.CFG;
 if(threatCfg)add(report,"Spawn distance balanced",threatCfg.spawnMinDistance>=CFG.spawnDistanceRange[0]&&threatCfg.spawnMinDistance<=CFG.spawnDistanceRange[1],threatCfg.spawnMinDistance+"m");
 // Verify enable/disable transaction without starting a destructive run.
 if(mode){
  const before={...mode.state};
  const enabled=mode.enable();
  add(report,"Mode transactional enable",enabled?.ok===true,enabled?.reason||"ok");
  if(enabled?.ok){
   add(report,"Terrain enabled",window.CheegunMovementVision?.state?.enabled===true);
   add(report,"POI enabled",window.CheegunPoiAuthority?.state?.enabled===true);
   add(report,"Loot/threat enabled",window.CheegunGeneratedLootThreat?.state?.enabled===true);
   add(report,"Extraction enabled",window.CheegunExtractionAuthority?.state?.enabled===true);
   mode.disable();
   add(report,"Mode rollback",mode.state.enabled===false);
  }
  if(before.enabled)mode.enable();
 }
 // Sample water behavior if available.
 const water=world?.features?.find(f=>f.type==="water"&&f.geometry?.length)?.geometry?.[0];
 if(water&&window.CheegunMovementVision){
  window.CheegunMovementVision.enable();
  const r=window.CheegunMovementVision.resolveMove({lat:water[0],lng:water[1]},1);
  add(report,"Water blocks movement",r?.allowed===false,JSON.stringify(r));
  window.CheegunMovementVision.disable();
 }else warn(report,"Water authority sample","No generated water sample available");
 report.errors=report.checks.filter(x=>!x.pass&&x.severity==="error").length;
 report.warnings=report.checks.filter(x=>!x.pass&&x.severity==="warning").length;
 report.pass=report.errors===0;
 state.lastReport=report;window.cheegunRealWorldQA=report;
 console.table(report.checks);
 console.info("[CHEEGUN 16B.11]",report.pass?"PASS":"FAIL",report);
 document.dispatchEvent(new CustomEvent("cheegunRealWorldQAComplete",{detail:report}));
 return report;
}
function summary(){
 const r=state.lastReport;if(!r)return null;
 return {pass:r.pass,errors:r.errors,warnings:r.warnings,metrics:r.metrics,issues:r.issues};
}
window.CheegunRealWorldQA={CFG,state,run,summary};
window.addEventListener("load",()=>setTimeout(run,2600));
console.info("[CHEEGUN 16B.11] End-to-end QA harness ready.");
})();