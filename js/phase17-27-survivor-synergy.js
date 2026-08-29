(()=>{
"use strict";
/* PHASE 17.27 — SURVIVOR ABILITIES & TACTICAL SYNERGY */
const KEY="cheegunSurvivorSynergy_v1";
const SYNERGIES=[
 {id:"medical_guard",name:"RESCUE CELL",icon:"✚⚔",roles:["medic","guard"],bonus:10,desc:"Medical and security specialists stabilize dangerous operations.",effect:"rescue"},
 {id:"scavenger_engineer",name:"SALVAGE CREW",icon:"⌕⚙",roles:["scavenger","engineer"],bonus:9,desc:"Scouts and builders improve salvage and field repairs.",effect:"loot"},
 {id:"trader_scavenger",name:"SUPPLY HUNTERS",icon:"◈⌕",roles:["trader","scavenger"],bonus:8,desc:"Market intelligence improves supply recovery.",effect:"economy"},
 {id:"guard_engineer",name:"HARDENED DEFENSE",icon:"⚔⚙",roles:["guard","engineer"],bonus:12,desc:"Security and infrastructure specialists reinforce defensive positions.",effect:"defense"},
 {id:"medic_leader",name:"COMMAND & CARE",icon:"✚★",roles:["medic"],trait:"leader",bonus:11,desc:"A trusted leader paired with medical expertise improves team cohesion.",effect:"morale"}
];
const ABILITY={
 "FIELD TRIAGE":{effect:"rescue",bonus:14,desc:"Improves rescue survival probability."},
 "CACHED INTEL":{effect:"loot",bonus:12,desc:"Improves intelligence and high-value loot discovery."},
 "HOLD THE LINE":{effect:"defense",bonus:14,desc:"Improves Safehouse defense readiness."},
 "BARGAIN NETWORK":{effect:"economy",bonus:10,desc:"Improves trade efficiency."},
 "FIELD REPAIR":{effect:"repair",bonus:15,desc:"Improves infrastructure recovery."}
};
function base(){return{activations:0,history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function teamProfiles(ids=[]){return ids.map(id=>window.CheegunSurvivorProgression?.profile?.(id)).filter(Boolean)}
function traits(id){return window.CheegunSurvivorLegacy?.profile?.(id)?.traits||[]}
function evaluate(ids=[]){const team=teamProfiles(ids),roles=new Set(team.map(x=>x.survivor.role)),abilities=team.flatMap(x=>x.abilities||[]),synergies=[];for(const x of SYNERGIES){const rolesOk=x.roles.every(r=>roles.has(r));const traitOk=!x.trait||team.some(p=>traits(p.survivor.id).includes(x.trait));if(rolesOk&&traitOk)synergies.push(x)}const effects={mission:0,rescue:0,loot:0,economy:0,defense:0,repair:0,morale:0};for(const a of abilities){const d=ABILITY[a];if(d)effects[d.effect]=(effects[d.effect]||0)+d.bonus}for(const s of synergies){effects[s.effect]=(effects[s.effect]||0)+s.bonus;effects.mission+=Math.round(s.bonus*.45)}effects.mission+=Math.min(18,(team.reduce((n,p)=>n+p.level-1,0))*2);return{team,abilities,synergies,effects,score:Object.values(effects).reduce((a,b)=>a+b,0)}}
function missionBonus(m){return evaluate(m.team||[]).effects.mission}
function rescueBonus(){const missing=window.CheegunCasualtySystem?.summary?.().missing||[];const ids=missing.map(x=>x.id);return evaluate(ids).effects.rescue}
function applySafehouse(){const active=window.CheegunSurvivorProgression?.summary?.().people||[];const abilities=active.flatMap(p=>p.abilities||[]),e={defense:abilities.includes("HOLD THE LINE")?8:0,repair:abilities.includes("FIELD REPAIR")?8:0,economy:abilities.includes("BARGAIN NETWORK")?6:0};return e}
function record(context,ids=[]){const s=load(),e=evaluate(ids);s.activations++;s.history.push({context,ids,effects:e.effects,synergies:e.synergies.map(x=>x.id),at:Date.now()});save(s);return e}
function summary(){const p=window.CheegunSurvivorProgression?.summary?.().people||[];const all=evaluate(p.map(x=>x.survivor.id));return{...load(),catalog:SYNERGIES,abilities:ABILITY,active:all}}
window.CheegunSurvivorSynergy={KEY,SYNERGIES,ABILITY,load,save,evaluate,missionBonus,rescueBonus,applySafehouse,record,summary};
})();