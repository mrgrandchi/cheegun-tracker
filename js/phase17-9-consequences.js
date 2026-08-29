(()=>{
"use strict";
/* PHASE 17.9 — DEATH, INJURY & EXPEDITION FAILURE */
const KEY="cheegunExpeditionConsequences_v1";
const DEFAULT={injury:null,recoveryUntil:0,failedRuns:0,lastFailure:null,insuranceLoss:0};
function load(){try{return{...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return{...DEFAULT}}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function injuryTable(){return[
 {id:"minor",name:"MINOR INJURY",severity:1,recovery:0,creditCost:80,stamina:.9,lootLoss:.15},
 {id:"serious",name:"SERIOUS INJURY",severity:2,recovery:1,creditCost:240,stamina:.75,lootLoss:.35},
 {id:"critical",name:"CRITICAL CONDITION",severity:3,recovery:2,creditCost:600,stamina:.55,lootLoss:.55}
]}
function chooseInjury(cause="EXPEDITION_FAILURE"){const t=injuryTable();const roll=Math.random();const x=roll<.48?t[0]:roll<.84?t[1]:t[2];return{...x,cause,at:Date.now()}}
function isRecovering(){const s=load();return s.recoveryUntil>Date.now()}
function fail({cause="HEALTH_DEPLETED",inventory=null}={}){
 const s=load(),inj=chooseInjury(cause),items=inventory||(()=>{try{return JSON.parse(localStorage.getItem("outbreak_inventory")||"[]")}catch{return[]}})();
 const lose=Math.min(items.length,Math.ceil(items.length*inj.lootLoss)),lost=[...items].sort(()=>Math.random()-.5).slice(0,lose),kept=items.filter((x,i)=>!lost.includes(x)||lost.splice(lost.indexOf(x),1)&&false);
 // rebuild loss safely by count
 const remaining=[...items];lost.forEach(x=>{const i=remaining.indexOf(x);if(i>=0)remaining.splice(i,1)});
 localStorage.setItem("outbreak_inventory",JSON.stringify(remaining));
 const p=window.CheegunState?.load?.();if(p){p.health=Math.max(1,Math.round((p.health||100)*inj.stamina));p.credits=Math.max(0,(p.credits||0)-Math.min(inj.creditCost,Math.round((p.credits||0)*.25)));window.CheegunState.save(p)}
 s.injury=inj;s.failedRuns++;s.recoveryUntil=Date.now()+inj.recovery*86400000;s.lastFailure={cause,at:Date.now(),lost,kept:remaining,injury:inj.name};save(s);
 return{ok:true,injury:inj,lost,remaining,recovery:isRecovering(),profile:p}
}
function recover(){const s=load(),p=window.CheegunState?.load?.();if(!s.injury)return{ok:false,reason:"NO_INJURY"};const discount=window.CheegunFactions?.modifier?.("medical")?.treatmentDiscount||0;const cost=Math.max(0,Math.round(s.injury.creditCost*(1-discount)));if((p?.credits||0)<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS",cost};p.credits-=cost;window.CheegunState.save(p);s.injury=null;s.recoveryUntil=0;save(s);return{ok:true,cost}}
function status(){const s=load();return{...s,recovering:isRecovering(),hoursRemaining:Math.max(0,Math.ceil((s.recoveryUntil-Date.now())/3600000))}}
window.CheegunConsequences={KEY,load,save,fail,recover,status,injuryTable};
})();