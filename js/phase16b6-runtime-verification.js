(()=>{
"use strict";
/** PHASE 16B.6 — RUNTIME VERIFICATION HARNESS */
function run(){
 const report={phase:"16B.6",time:new Date().toISOString(),checks:[]};
 const check=(name,pass,detail="")=>report.checks.push({name,pass:!!pass,detail});
 const map=window.cheegunMap,world=window.cheegunGeneratedWorld,tactical=window.cheegunGeneratedGameplay;
 check("Leaflet map",!!map);
 check("World generator",!!window.CheegunWorldGenerator);
 check("Generated world",!!world,world?.features?.length||0);
 check("Tactical gameplay",!!tactical,tactical?.pois?.length||0);
 check("Terrain authority",!!window.CheegunTerrainAuthority);
 check("Movement vision bridge",!!window.CheegunMovementVision);
 if(world?.region)check("Thunder Bay region",world.region.id==="thunder-bay",world.region.name);
 if(window.CheegunTerrainAuthority){
  const before=window.CheegunTerrainAuthority.state.enabled;
  const sample=world?.features?.find(f=>f.type==="water"&&f.geometry?.length)?.geometry?.[0];
  if(sample){window.CheegunTerrainAuthority.enable();const r=window.CheegunMovementVision?.resolveMove(L.latLng(sample),1);check("Generated water blocks movement",r?.allowed===false,JSON.stringify(r));}
  if(!before)window.CheegunTerrainAuthority.disable();
 }
 report.pass=report.checks.every(x=>x.pass);
 window.cheegunWorldVerification=report;
 console.table(report.checks);console.info("[CHEEGUN 16B.6]",report.pass?"PASS":"REVIEW",report);
 document.dispatchEvent(new CustomEvent("cheegunWorldVerificationComplete",{detail:report}));
 return report;
}
window.CheegunWorldVerification={run};
window.addEventListener("load",()=>setTimeout(run,1800));
})();