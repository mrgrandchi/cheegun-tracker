(()=>{
"use strict";
/* PHASE 17.22 — SURVIVOR TRAITS, PERSONAL STORIES & LEGACY */
const KEY="cheegunSurvivorLegacy_v1";
const TRAITS=[
 {id:"brave",name:"BRAVE",icon:"🛡",desc:"Performs better under danger.",mission:8,morale:2},
 {id:"resourceful",name:"RESOURCEFUL",icon:"🧰",desc:"Finds value where others miss it.",mission:6,loot:12},
 {id:"compassionate",name:"COMPASSIONATE",icon:"♥",desc:"Strengthens community trust.",trust:5,morale:4},
 {id:"disciplined",name:"DISCIPLINED",icon:"◈",desc:"Accumulates fatigue more slowly.",fatigue:-5,mission:4},
 {id:"haunted",name:"HAUNTED",icon:"☾",desc:"Carries trauma from the outbreak.",morale:-3,mission:3},
 {id:"leader",name:"LEADER",icon:"★",desc:"Improves team cohesion.",trust:7,mission:5}
];
const STORIES=[
 "I survived the first week by staying quiet and moving at night.",
 "Someone I loved is still missing somewhere in the city.",
 "I promised myself I would never leave another person behind.",
 "I know these streets better than I know myself.",
 "The outbreak took everything. Building this place gives me a reason to continue.",
 "I used to think survival meant being alone. I was wrong."
];
function base(){return{profiles:{},legacy:[],nextLegacy:1,storiesUnlocked:0}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function traitFor(id){return TRAITS.find(t=>t.id===id)}
function ensure(id){const s=load();if(!s.profiles[id]){const first=TRAITS[Math.floor(Math.random()*TRAITS.length)],second=TRAITS[Math.floor(Math.random()*TRAITS.length)];s.profiles[id]={traits:[first.id,second.id===first.id?TRAITS[(TRAITS.indexOf(first)+1)%TRAITS.length].id:second.id],story:STORIES[Math.floor(Math.random()*STORIES.length)],loyalty:55,heroicActs:0,missions:0,joinedLegacy:Date.now()};s.storiesUnlocked++;save(s)}return load().profiles[id]}
function profile(id){return ensure(id)}
function modifier(ids){const all=ids.flatMap(id=>profile(id).traits.map(traitFor).filter(Boolean));return{mission:all.reduce((n,t)=>n+(t.mission||0),0),fatigue:all.reduce((n,t)=>n+(t.fatigue||0),0),trust:all.reduce((n,t)=>n+(t.trust||0),0)}}
function missionOutcome(m,success){const s=load();for(const id of m.team||[]){const p=ensure(id);p.missions++;p.loyalty=Math.max(0,Math.min(100,p.loyalty+(success?2:-4)));if(success&&Math.random()<.22)p.heroicActs++;}save(load())}
function recordDeath(id,{cause="MISSION",location="UNKNOWN"}={}){const roster=window.CheegunSettlement?.load?.();const person=roster?.population?.find(x=>x.id===id);if(!person)return{ok:false,reason:"SURVIVOR_NOT_FOUND"};person.status="DEAD";roster.lost=(roster.lost||0)+1;window.CheegunSettlement.save(roster);const p=ensure(id),s=load(),entry={id:"legacy-"+s.nextLegacy++,survivorId:id,name:person.name,role:person.role,traits:p.traits,story:p.story,heroicActs:p.heroicActs,missions:p.missions,cause,location,at:Date.now()};s.legacy.push(entry);delete s.profiles[id];save(s);window.CheegunSurvivorCommunity?.applyMorale?.(-12,"SURVIVOR_LOST");return{ok:true,entry}}
function summary(){const people=window.CheegunSettlement?.summary?.().population||[];return{traits:TRAITS,stories:STORIES,profiles:people.filter(n=>n.status==="ACTIVE").map(n=>({...n,profile:ensure(n.id)})),legacy:load().legacy}}
window.CheegunSurvivorLegacy={KEY,TRAITS,load,save,profile,modifier,missionOutcome,recordDeath,summary};
})();