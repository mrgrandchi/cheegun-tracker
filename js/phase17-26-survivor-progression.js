(()=>{
"use strict";
/* PHASE 17.26 — SURVIVOR SPECIALIZATION, TRAINING & PROMOTION */
const KEY="cheegunSurvivorProgression_v1";
const TRACKS={
 medic:{name:"MEDICAL SPECIALIST",icon:"✚",ability:"FIELD TRIAGE",levels:["FIRST AID","FIELD MEDIC","TRAUMA SPECIALIST","CHIEF MEDIC"]},
 scavenger:{name:"SALVAGE SPECIALIST",icon:"⌕",ability:"CACHED INTEL",levels:["RUNNER","SCAVENGER","SALVAGE EXPERT","MASTER SCOUT"]},
 guard:{name:"SECURITY SPECIALIST",icon:"⚔",ability:"HOLD THE LINE",levels:["WATCHER","GUARD","VETERAN","WARDEN"]},
 trader:{name:"LOGISTICS SPECIALIST",icon:"◈",ability:"BARGAIN NETWORK",levels:["BROKER","TRADER","QUARTERMASTER","MASTER OF SUPPLY"]},
 engineer:{name:"INFRASTRUCTURE SPECIALIST",icon:"⚙",ability:"FIELD REPAIR",levels:["TECHNICIAN","ENGINEER","BUILDER","CHIEF ENGINEER"]}
};
const TRAINING=[
 {id:"fitness",name:"FIELD CONDITIONING",icon:"◉",cost:40,xp:35,desc:"Build endurance and reduce fatigue."},
 {id:"discipline",name:"TACTICAL DRILLS",icon:"△",cost:55,xp:45,desc:"Improve mission discipline and cohesion."},
 {id:"specialist",name:"SPECIALIST TRAINING",icon:"◆",cost:75,xp:70,desc:"Accelerate role mastery."}
];
function base(){return{profiles:{},trained:0,promotions:0,totalXp:0,history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function survivor(id){return (window.CheegunSettlement?.summary?.().population||[]).find(x=>x.id===id)}
function ensure(id){const p=survivor(id),s=load();if(!p)return null;if(!s.profiles[id])s.profiles[id]={xp:0,level:1,training:0,retired:false,abilities:[]};save(s);return load().profiles[id]}
function threshold(level){return 100+level*80}
function award(id,xp,{reason="MISSION"}={}){const s=load(),p=ensure(id);if(!p)return{ok:false,reason:"SURVIVOR_NOT_FOUND"};p.xp+=Math.max(0,xp);let promoted=false;while(p.level<4&&p.xp>=threshold(p.level)){p.xp-=threshold(p.level);p.level++;promoted=true;s.promotions++;const track=TRACKS[survivor(id)?.role];const ability=track?.ability;if(ability&&!p.abilities.includes(ability))p.abilities.push(ability)}s.totalXp+=xp;s.history.push({type:"XP",id,xp,reason,at:Date.now()});save(s);return{ok:true,profile:p,promoted}}
function train(id,type){const t=TRAINING.find(x=>x.id===type),p=survivor(id);if(!t||!p)return{ok:false,reason:"INVALID_TRAINING"};const state=window.CheegunProgression?.load?.();if(!state||state.credits<t.cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};state.credits-=t.cost;window.CheegunProgression.save(state);const r=award(id,t.xp,{reason:"TRAINING_"+type.toUpperCase()});const s=load();s.profiles[id].training++;s.trained++;save(s);return{ok:true,training:t,...r}}
function missionOutcome(m,success){for(const id of m.team||[])award(id,success?32:12,{reason:success?"MISSION_SUCCESS":"MISSION_FAILURE"})}
function profile(id){const p=ensure(id),s=survivor(id);if(!p||!s)return null;const track=TRACKS[s.role]||null;return{...p,survivor:s,track,title:track?.levels[Math.min(3,p.level-1)]||"SURVIVOR",nextXp:p.level>=4?0:threshold(p.level)-p.xp}}
function modifier(ids){return ids.reduce((acc,id)=>{const p=profile(id);if(!p)return acc;acc.mission+=(p.level-1)*4;acc.fatigue-=p.training*1.5;return acc},{mission:0,fatigue:0})}
function summary(){const people=(window.CheegunSettlement?.summary?.().population||[]).filter(x=>x.status==="ACTIVE");const s=load();return{...s,tracks:TRACKS,training:TRAINING,people:people.map(x=>profile(x.id)).filter(Boolean)}}
window.CheegunSurvivorProgression={KEY,TRACKS,TRAINING,load,save,profile,award,train,missionOutcome,modifier,summary};
})();