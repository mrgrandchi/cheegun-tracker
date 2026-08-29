(()=>{
"use strict";
/* PHASE 18.1 — STATIC DEPENDENCY & SCRIPT-ORDER AUDIT */
const MANIFEST={
"phase17-30-safehouse-production.js":{provides:["CheegunSafehouseProduction"],requires:["CheegunSettlement","CheegunSurvivorNeeds","CheegunProgression"]},
"phase17-31-safehouse-buildings.js":{provides:["CheegunSafehouseBuildings"],requires:["CheegunProgression"]},
"phase17-32-safehouse-power.js":{provides:["CheegunSafehousePower"],requires:["CheegunSafehouseBuildings","CheegunProgression"]},
"phase17-33-safehouse-sieges.js":{provides:["CheegunSafehouseSieges"],requires:["CheegunSettlement","CheegunSafehouseBuildings","CheegunSafehouseProduction","CheegunSafehousePower","CheegunProgression"]},
"phase17-34-settlement-network.js":{provides:["CheegunSettlementNetwork"],requires:["CheegunProgression","CheegunSurvivorNeeds"]},
"phase17-35-supply-convoys.js":{provides:["CheegunSupplyConvoys"],requires:["CheegunSettlementNetwork","CheegunSurvivorNeeds","CheegunProgression"]},
"phase17-36-regional-threat-map.js":{provides:["CheegunRegionalThreat"],requires:["CheegunSettlementNetwork","CheegunSupplyConvoys","CheegunSafehouseSieges"]},
"outbreak.js":{provides:["OutbreakRuntime"],requires:["CheegunSafehouseSieges","CheegunSettlementNetwork","CheegunSupplyConvoys","CheegunRegionalThreat"]}
};
function scripts(){return [...document.scripts].map(s=>s.src.split("/").pop()).filter(Boolean)}
function audit(){const order=scripts(),issues=[],seen=new Set();for(const file of order){const m=MANIFEST[file];if(!m)continue;for(const dep of m.requires)if(!seen.has(dep)&&!window[dep])issues.push({severity:"WARN",file,dependency:dep,reason:"DEPENDENCY_LOADED_LATER_OR_LAZY"});for(const p of m.provides)seen.add(p)}const report={version:"18.1",at:Date.now(),order,issues,manifest:MANIFEST,critical:issues.filter(x=>x.severity==="CRITICAL"),warnings:issues.filter(x=>x.severity==="WARN")};window.CheegunPhase181DependencyReport=report;try{localStorage.setItem("cheegunPhase181DependencyAudit_v1",JSON.stringify(report))}catch{};return report}
function runtime(){const r=audit();const live=[];for(const [file,m] of Object.entries(MANIFEST))for(const dep of m.requires)if(!window[dep])live.push({file,dependency:dep});return{...r,liveMissing:live,ok:live.length===0}}
window.CheegunPhase181DependencyAudit={MANIFEST,audit,runtime,scripts};
setTimeout(()=>{const r=runtime();console.info("PHASE 18.1 DEPENDENCY AUDIT",r.ok?"PASS":"FAIL",r)},25);
})();