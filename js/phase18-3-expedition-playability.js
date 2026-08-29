(()=>{
"use strict";
/**
 * PHASE 18.3 — EXPEDITION PLAYABILITY & RUNTIME VALIDATION
 * Observes real player actions instead of fabricating test passes.
 */
const state={
 version:"18.3",startedAt:0,runId:null,
 actions:{movement:0,discoveries:0,searches:0,kills:0,survivalUses:0},
 last:{event:null,at:0},history:[]
};
const checks=[
 ["Boot","runtime"],
 ["Expedition","expedition"],
 ["Movement","movement"],
 ["Discovery","discovery"],
 ["Scavenge","search"],
 ["Combat","combat"]
];
function now(){return Date.now()}
function mark(type,detail={}){
 state.last={event:type,at:now(),detail};
 state.history.unshift({type,at:state.last.at,detail});
 state.history=state.history.slice(0,40);
 render();
}
function runtime(){return window.CheegunOutbreakRuntime?.status?.()||null}
function snapshot(){
 const r=runtime();
 const expedition=window.CheegunRealWorldMode?.status?.(window.CheegunOutbreakRuntime?.playerPosition?.())||null;
 return {
  version:state.version,
  running:!!r&&!r.gameOver,
  runId:state.runId||expedition?.runId||null,
  elapsed:state.startedAt?Math.floor((now()-state.startedAt)/1000):0,
  actions:{...state.actions},
  checks:{
   runtime:!!r,
   expedition:!!expedition?.started,
   movement:state.actions.movement>0,
   discovery:state.actions.discoveries>0,
   search:state.actions.searches>0,
   combat:state.actions.kills>0
  },
  player:r?{health:Math.round(r.health),hunger:Math.round(r.hunger),thirst:Math.round(r.thirst),stamina:Math.round(r.stamina),infection:Math.round(r.infection),inventory:r.inventory,zombies:r.zombies}:null
 };
}
function score(s=snapshot()){
 return Object.values(s.checks).filter(Boolean).length+"/"+Object.keys(s.checks).length;
}
let card=null;
function ensureUI(){
 if(card||!document.querySelector(".hud"))return;
 card=document.createElement("section");
 card.className="hud-card phase18-runtime";
 card.innerHTML='<div class="hud-label">EXPEDITION RUNTIME <span id="phase18RuntimeState">WAITING</span></div><div id="phase18RuntimeChecks" style="font:11px/1.8 monospace;color:#9da8a2"></div><button id="phase18ValidateBtn" class="game-btn" style="width:100%;margin-top:8px">✓ VALIDATE EXPEDITION LOOP</button>';
 document.querySelector(".hud").appendChild(card);
 document.getElementById("phase18ValidateBtn").onclick=()=>{
  const s=snapshot();
  console.group("[CHEEGUN 18.3] Expedition Playability");
  console.table(Object.entries(s.checks).map(([name,pass])=>({name,pass,observed:pass?"YES":"NOT YET"})));
  console.log("snapshot",s);
  console.groupEnd();
  mark("validation",{score:score(s),checks:s.checks});
 };
 render();
}
function render(){
 if(!card)return;
 const s=snapshot(), stateEl=document.getElementById("phase18RuntimeState"), checksEl=document.getElementById("phase18RuntimeChecks");
 if(stateEl)stateEl.textContent=s.running?"LIVE • "+score(s):"WAITING";
 if(checksEl)checksEl.innerHTML=checks.map(([label,key])=>{
  const pass=s.checks[key];return '<div>'+ (pass?"✓":"○") +" "+label+"</div>";
 }).join("")+'<div style="margin-top:5px;color:#69736e">MOV '+s.actions.movement+" • DISC "+s.actions.discoveries+" • LOOT "+s.actions.searches+" • KILLS "+s.actions.kills+"</div>";
}
function start(detail={}){
 if(state.startedAt)return;
 state.startedAt=now();state.runId=detail.runId||window.CheegunRealWorldMode?.state?.runId||null;
 mark("expedition-start",detail);
}
document.addEventListener("cheegunOutbreakRuntimeReady",()=>{ensureUI();mark("runtime-ready")});
document.addEventListener("cheegunExpeditionRuntimeStarted",e=>{start(e.detail||{});ensureUI()});
document.addEventListener("cheegunMovementArrived",e=>{state.actions.movement++;mark("movement",e.detail)});
document.addEventListener("cheegunPoiDiscovered",e=>{state.actions.discoveries++;mark("discovery",e.detail)});
document.addEventListener("cheegunPoiSearched",e=>{state.actions.searches++;mark("search",e.detail)});
document.addEventListener("cheegunCombatKill",e=>{state.actions.kills++;mark("combat",e.detail)});
document.addEventListener("click",e=>{
 if(e.target?.id==="consumeBtn"||e.target?.id==="restBtn"){state.actions.survivalUses++;mark("survival-use",{control:e.target.id})}
});
function boot(){
 ensureUI();
 const r=runtime();
 if(r){mark("runtime-ready");const ex=window.CheegunRealWorldMode?.status?.(window.CheegunOutbreakRuntime?.playerPosition?.());if(ex?.started)start({runId:ex.runId});}
}
window.CheegunPhase183={
 state,snapshot,score,
 validate:()=>{const s=snapshot();return{ok:s.running,score:score(s),snapshot:s}},
 reset:()=>{Object.assign(state.actions,{movement:0,discoveries:0,searches:0,kills:0,survivalUses:0});state.history=[];state.startedAt=now();render()}
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,0));else setTimeout(boot,0);
console.info("[CHEEGUN 18.3] Expedition playability runtime armed.");
})();