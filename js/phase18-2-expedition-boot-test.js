(()=>{
"use strict";
/* PHASE 18.2 — EXPEDITION BROWSER BOOT TEST */
const KEY="cheegunPhase182BootTest_v1";
const started=performance.now();
const checks=[];
function check(name,pass,detail=""){checks.push({name,pass:!!pass,detail,at:Math.round(performance.now()-started)});return pass}
function visible(el){return !!el&&getComputedStyle(el).display!=="none"}
function run(){
 const mapEl=document.getElementById("gameMap");
 const boot=document.getElementById("bootStatus");
 const report={
  version:"18.2",page:location.pathname,at:Date.now(),
  checks:[
   {name:"DOM_GAME_MAP",pass:!!mapEl},
   {name:"LEAFLET_GLOBAL",pass:typeof window.L!=="undefined"},
   {name:"MAP_INSTANCE",pass:!!window.cheegunMap},
   {name:"MAP_CONTAINER_SIZED",pass:!!mapEl&&mapEl.clientWidth>0&&mapEl.clientHeight>0,detail:mapEl?mapEl.clientWidth+"x"+mapEl.clientHeight:"missing"},
   {name:"SURVIVOR_RUNTIME",pass:!!window.cheegunExpeditionMods},
   {name:"RUNTIME_AUDIT",pass:!!window.CheegunPhase18Audit},
   {name:"DEPENDENCY_AUDIT",pass:!!window.CheegunPhase181DependencyAudit},
   {name:"BOOT_OVERLAY_CLEARED",pass:!visible(boot)}
  ]
 };
 report.pass=report.checks.every(x=>x.pass);
 report.durationMs=Math.round(performance.now()-started);
 try{localStorage.setItem(KEY,JSON.stringify(report))}catch{}
 window.CheegunPhase182BootReport=report;
 console[report.pass?"info":"error"]("PHASE 18.2 EXPEDITION BOOT",report.pass?"PASS":"FAIL",report);
 document.dispatchEvent(new CustomEvent("cheegunPhase182BootComplete",{detail:report}));
 return report;
}
function waitForBoot(timeout=10000){
 const begin=Date.now();
 const timer=setInterval(()=>{
  const ready=!!window.cheegunMap&&document.getElementById("gameMap")?.clientWidth>0;
  if(ready||Date.now()-begin>timeout){clearInterval(timer);run()}
 },250);
}
window.CheegunPhase182BootTest={run,waitForBoot,latest:()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch{return null}}};
waitForBoot();
})();