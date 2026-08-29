(()=>{
"use strict";
/* PHASE 18.0 — INTEGRATION AUDIT / NON-DESTRUCTIVE RUNTIME DIAGNOSTICS */
const KEY="cheegunPhase18Audit_v1";
const REQUIRED={
game:["CheegunGeneratedLootThreat","CheegunSafehouseProduction","CheegunSafehouseBuildings","CheegunSafehousePower","CheegunSafehouseSieges","CheegunSettlementNetwork","CheegunSupplyConvoys","CheegunRegionalThreat","CheegunProgression"],
safehouse:["CheegunProgression","CheegunSettlement","CheegunSurvivorNeeds","CheegunSafehouseProduction","CheegunSafehouseBuildings","CheegunSafehousePower","CheegunSafehouseSieges","CheegunSettlementNetwork","CheegunSupplyConvoys","CheegunRegionalThreat"]
};
const errors=[];
window.addEventListener("error",e=>record("error",e.message,{file:e.filename,line:e.lineno}),true);
window.addEventListener("unhandledrejection",e=>record("rejection",String(e.reason)));
function record(type,message,meta={}){errors.push({type,message:String(message),meta,at:Date.now()});if(errors.length>50)errors.shift();persist()}
function page(){return location.pathname.includes("safehouse")?"safehouse":"game"}
function check(name){const api=window[name];return{api:name,loaded:!!api,methods:api?Object.keys(api).filter(k=>typeof api[k]==="function").length:0}}
function run(){const target=page(),checks=(REQUIRED[target]||[]).map(check);const missing=checks.filter(x=>!x.loaded).map(x=>x.api);const report={version:"18.0",page:target,at:Date.now(),ok:missing.length===0,missing,checks,errors:[...errors],localStorage:true};persist(report);window.CheegunPhase18AuditReport=report;return report}
function persist(report){try{localStorage.setItem(KEY,JSON.stringify(report||window.CheegunPhase18AuditReport||{errors,at:Date.now()}))}catch{}}
function latest(){try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch{return null}}
window.CheegunPhase18Audit={run,latest,record,check};
setTimeout(()=>{const r=run();if(!r.ok)console.warn("PHASE 18 AUDIT: missing runtime dependencies",r.missing);else console.info("PHASE 18 AUDIT: runtime dependency check passed",r)},0);
})();