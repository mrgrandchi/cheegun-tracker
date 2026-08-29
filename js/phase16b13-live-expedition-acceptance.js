(()=>{
"use strict";
/**
 * PHASE 16B.13 — LIVE EXPEDITION ACCEPTANCE TEST
 * Executes a controlled, reversible end-to-end gameplay probe in the browser.
 */
const state={running:false,lastReport:null,runs:0};
const row=(name,pass,detail="",severity="error")=>({name,pass:!!pass,detail,severity});
function pos(x){return {lat:x[0],lng:x[1]}}
function restoreInventory(snapshot){
 if(snapshot===null)localStorage.removeItem("outbreak_inventory");
 else localStorage.setItem("outbreak_inventory",snapshot);
}
function run(){
 if(state.running)return {ok:false,reason:"RUNNING"};
 state.running=true;state.runs++;
 const checks=[],report={phase:"16B.13",time:new Date().toISOString(),checks,pass:false,errors:0,warnings:0};
 const mode=window.CheegunRealWorldMode,poiAuth=window.CheegunPoiAuthority,loot=window.CheegunGeneratedLootThreat,extract=window.CheegunExtractionAuthority;
 const tactical=window.cheegunGeneratedGameplay;
 const invSnapshot=localStorage.getItem("outbreak_inventory");
 try{
  checks.push(row("Prerequisites",!!mode&&!!poiAuth&&!!loot&&!!extract&&!!tactical));
  if(!checks[0].pass)throw new Error("Required real-world systems missing");
  mode.reset();
  const enabled=mode.enable();
  checks.push(row("Enable Real World Mode",enabled?.ok===true,enabled?.reason||"ok"));
  const poi=(tactical.pois||[])[0];
  checks.push(row("Generated POI sample",!!poi,poi?.name||"none"));
  if(poi){
   const p=pos(poi.position);
   const found=poiAuth.discover(p);
   checks.push(row("Discover generated POI",poiAuth.state.discovered.has(poi.id),found.length+" discovered"));
   const nearest=poiAuth.nearest(p,999);
   checks.push(row("Locate nearest POI",nearest?.id===poi.id,nearest?.name||"none"));
   // Exercise loot pipeline and restore persistent inventory afterwards.
   const granted=loot.grantLoot(p);
   checks.push(row("Generated POI search + loot",granted?.ok===true,(granted?.taken||[]).join(", ")||granted?.reason||"none"));
  }
  const startPos=poi?pos(poi.position):pos((tactical.extractions||[])[0]?.position||[0,0]);
  const started=mode.start(startPos);
  checks.push(row("Start expedition",started?.ok===true,started?.runId||started?.reason||"none"));
  const active=extract.active();
  checks.push(row("Assign extraction",!!active,active?.name||active?.id||"none"));
  if(active){
   const epos=pos(active.position);
   const before=extract.status(epos);
   checks.push(row("Reach extraction zone",before?.withinZone===true,Math.round(before?.distance||0)+"m"));
   const completed=extract.complete(epos);
   checks.push(row("Complete extraction",completed?.ok===true,completed?.reason||"ok"));
  }
  const status=mode.status(startPos);
  checks.push(row("Mode status coherent",status?.enabled===true&&status?.started===true,status?.runId||"missing"));
 }catch(error){
  checks.push(row("Acceptance harness execution",false,String(error)));
 }finally{
  restoreInventory(invSnapshot);
  try{mode?.reset?.()}catch{}
  state.running=false;
 }
 report.errors=checks.filter(x=>!x.pass&&x.severity==="error").length;
 report.warnings=checks.filter(x=>!x.pass&&x.severity==="warning").length;
 report.pass=report.errors===0;
 state.lastReport=report;window.cheegunLiveAcceptance=report;
 console.group("[CHEEGUN 16B.13] LIVE EXPEDITION ACCEPTANCE");
 console.table(checks);console.log(report);console.groupEnd();
 document.dispatchEvent(new CustomEvent("cheegunLiveAcceptanceComplete",{detail:report}));
 return report;
}
function summary(){return state.lastReport?{pass:state.lastReport.pass,errors:state.lastReport.errors,warnings:state.lastReport.warnings}:null}
window.CheegunLiveAcceptance={state,run,summary};
function scheduleAcceptance(){const started=Date.now();const poll=()=>{if(window.cheegunGeneratedWorld&&window.cheegunGeneratedGameplay)return run();if(Date.now()-started<15000)return setTimeout(poll,300);return run()};poll()}\nwindow.addEventListener("load",()=>setTimeout(scheduleAcceptance,1000));\ndocument.addEventListener("cheegunWorldLive",()=>setTimeout(scheduleAcceptance,250),{once:true});
console.info("[CHEEGUN 16B.13] Live expedition acceptance harness armed.");
})();