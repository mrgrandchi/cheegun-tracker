(()=>{
"use strict";
/* PHASE 17.25 — DYNAMIC SURVIVOR RECRUITMENT & POPULATION */
const KEY="cheegunRecruitment_v1";
const FIRST=["ASH","LENA","OWEN","MIA","NOAH","SAGE","CALEB","IVY","JUNE","RYAN","LEAH","ISAAC","RAVEN","BEN","ARIA","MASON"];
const BACKGROUNDS=[
 "Former paramedic who kept a small group alive through the first weeks.",
 "Local resident searching for relatives and a place to belong.",
 "Trades worker with practical skills and a distrust of large groups.",
 "Former volunteer who believes rebuilding matters as much as survival.",
 "Traveller stranded when the outbreak closed the roads.",
 "Parent separated from family and determined not to lose hope."
];
const ROLES=["medic","scavenger","guard","trader","engineer"];
function base(){return{candidates:[],accepted:0,rejected:0,expired:0,nextId:1,lastSpawn:0,history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function settlement(){return window.CheegunSettlement?.summary?.()}
function capacityAvailable(){const x=settlement();return x?x.active<x.capacity:false}
function uniqueName(){const used=new Set((settlement()?.population||[]).map(x=>x.name));const options=FIRST.filter(n=>!used.has(n));return options[Math.floor(Math.random()*options.length)]||("SURVIVOR "+Math.floor(Math.random()*999))}
function generate({force=false,source="CITY ENCOUNTER"}={}){const s=load();if(!force&&Date.now()-s.lastSpawn<90000)return null;if(!capacityAvailable())return null;if(s.candidates.length>=3)return null;const role=ROLES[Math.floor(Math.random()*ROLES.length)],risk=20+Math.floor(Math.random()*61),id="candidate-"+s.nextId++;const c={id,name:uniqueName(),role,source,background:BACKGROUNDS[Math.floor(Math.random()*BACKGROUNDS.length)],trust:35+Math.floor(Math.random()*51),risk,group:Math.random()<.18?"FAMILY GROUP":null,createdAt:Date.now(),expiresAt:Date.now()+600000};s.candidates.push(c);s.lastSpawn=Date.now();s.history.push({type:"FOUND",id,at:Date.now()});save(s);return c}
function accept(id){const s=load(),c=s.candidates.find(x=>x.id===id);if(!c)return{ok:false,reason:"CANDIDATE_NOT_FOUND"};if(!capacityAvailable())return{ok:false,reason:"SAFEHOUSE_AT_CAPACITY"};const r=window.CheegunSettlement?.recruit?.({name:c.name,role:c.role,source:c.source});if(!r?.ok)return r||{ok:false,reason:"SETTLEMENT_UNAVAILABLE"};s.candidates=s.candidates.filter(x=>x.id!==id);s.accepted++;s.history.push({type:"ACCEPTED",candidate:c,survivorId:r.survivor.id,at:Date.now()});save(s);window.CheegunSurvivorCommunity?.applyMorale?.(4,"NEW_SURVIVOR_JOINED");return{ok:true,candidate:c,survivor:r.survivor}}
function reject(id,{reason="COMMAND_DECISION"}={}){const s=load(),c=s.candidates.find(x=>x.id===id);if(!c)return{ok:false,reason:"CANDIDATE_NOT_FOUND"};s.candidates=s.candidates.filter(x=>x.id!==id);s.rejected++;s.history.push({type:"REJECTED",candidate:c,reason,at:Date.now()});save(s);return{ok:true,candidate:c}}
function tick(){const s=load(),now=Date.now();for(const c of [...s.candidates])if(now>c.expiresAt){s.candidates=s.candidates.filter(x=>x.id!==c.id);s.expired++;s.history.push({type:"LEFT_CITY",candidate:c,at:now})}save(s);return summary()}
function demographics(){const p=(settlement()?.population||[]).filter(x=>x.status==="ACTIVE"),roles={};for(const r of ROLES)roles[r]=p.filter(x=>x.role===r).length;return{active:p.length,capacity:settlement()?.capacity||0,roles}}
function summary(){const s=load(),d=demographics();return{...s,candidates:s.candidates.map(c=>({...c,minutesLeft:Math.max(0,Math.ceil((c.expiresAt-Date.now())/60000))})),demographics:d,capacityAvailable:capacityAvailable()}}
window.CheegunRecruitment={KEY,FIRST,BACKGROUNDS,ROLES,load,save,generate,accept,reject,tick,demographics,summary};
})();