(()=>{
"use strict";
/* PHASE 17.20 — SURVIVOR MISSIONS & AUTONOMOUS TEAMS */
const KEY="cheegunSurvivorMissions_v1";
const MISSIONS={
 emergency:{icon:"🚨",name:"EMERGENCY RESPONSE",duration:2,roles:["guard","medic"],reward:"Resolve district emergency"},
 supply:{icon:"🚚",name:"SUPPLY RUN",duration:3,roles:["scavenger","guard"],reward:"Restore route integrity and supplies"},
 recon:{icon:"📡",name:"DISTRICT RECON",duration:2,roles:["guard","scavenger"],reward:"Gain control and intelligence"},
 salvage:{icon:"⚙",name:"SALVAGE OPERATION",duration:4,roles:["engineer","scavenger"],reward:"Recover credits and materials"},
 trade:{icon:"◈",name:"TRADE MISSION",duration:3,roles:["trader","guard"],reward:"Generate settlement credits"}
};
function base(){return{active:[],completed:0,failed:0,nextId:1,history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function survivors(){return window.CheegunSettlement?.summary?.().population||[]}
function available(){const busy=new Set(load().active.flatMap(m=>m.team));return survivors().filter(x=>x.status==="ACTIVE"&&!busy.has(x.id))}
function teamScore(team,roles){let score=0;for(const r of roles)if(team.some(n=>n.role===r))score+=45;score+=Math.max(0,team.length-roles.length)*8;return Math.min(92,score)}
function start(type,{districtId=null,eventId=null,team=[]}={}){const m=MISSIONS[type];if(!m)return{ok:false,reason:"UNKNOWN_MISSION"};const roster=survivors(),members=team.map(id=>roster.find(n=>n.id===id)).filter(Boolean);if(members.length<2)return{ok:false,reason:"TEAM_TOO_SMALL"};if(members.some(n=>!available().some(a=>a.id===n.id)))return{ok:false,reason:"SURVIVOR_UNAVAILABLE"};if(!m.roles.every(r=>members.some(n=>n.role===r)))return{ok:false,reason:"SPECIALIST_REQUIRED"};const s=load(),id="mission-"+s.nextId++,chance=teamScore(members,m.roles);const mission={id,type,icon:m.icon,name:m.name,districtId,eventId,team:members.map(n=>n.id),startedAt:Date.now(),endsAt:Date.now()+m.duration*60000,chance,status:"ACTIVE"};s.active.push(mission);s.history.push({type:"STARTED",id,mission:type,at:Date.now()});save(s);return{ok:true,mission}}
function finish(id,force=null){const s=load(),m=s.active.find(x=>x.id===id);if(!m)return{ok:false,reason:"MISSION_NOT_FOUND"};if(force===null&&Date.now()<m.endsAt)return{ok:false,reason:"MISSION_IN_PROGRESS"};s.active=s.active.filter(x=>x.id!==id);const success=force===null?Math.random()*100<m.chance:!!force;m.status=success?"SUCCESS":"FAILED";if(success){s.completed++;applySuccess(m)}else{s.failed++;applyFailure(m);window.CheegunCasualtySystem?.missionFailure?.(m)}window.CheegunSurvivorCommunity?.missionOutcome?.(m,success);window.CheegunSurvivorLegacy?.missionOutcome?.(m,success);window.CheegunSurvivorProgression?.missionOutcome?.(m,success);s.history.push({type:m.status,id,mission:m.type,at:Date.now()});save(s);return{ok:true,success,mission:m}}
function applySuccess(m){const p=window.CheegunState?.load?.();if(m.type==="emergency"&&m.eventId)window.CheegunDistrictEvents?.resolve?.(m.eventId,{success:true});if(m.type==="supply"&&m.districtId){const sn=window.CheegunSupplyNetwork?.load?.(),r=sn?.routes?.[m.districtId];if(r){r.integrity=Math.min(100,r.integrity+20);window.CheegunSupplyNetwork.save(sn)}}if(["recon","salvage"].includes(m.type)&&m.districtId){const d=window.CheegunDistrictControl?.get?.(m.districtId),poi={id:"mission_"+m.id,type:d?.types?.[0]||"residential",pos:d?.center||[48.414,-89.245]};window.CheegunDistrictControl?.operation?.(poi,{type:"CLEAR"})}if(p){const credits={supply:90,recon:120,salvage:260,trade:220,emergency:80}[m.type]||75;p.credits=(p.credits||0)+credits;window.CheegunState.save(p)}}
function applyFailure(m){if(m.type==="emergency"&&m.eventId)window.CheegunDistrictEvents?.resolve?.(m.eventId,{success:false});if(m.districtId){const s=window.CheegunDistrictControl?.load?.();if(s?.districts?.[m.districtId]){s.districts[m.districtId].infestation=Math.min(100,s.districts[m.districtId].infestation+5);window.CheegunDistrictControl.save(s)}}}
function tick(){const s=load();for(const m of [...s.active])if(Date.now()>=m.endsAt)finish(m.id);return summary()}
function summary(){const s=load();return{...s,available:available(),catalog:MISSIONS,active:s.active.map(m=>({...m,minutesLeft:Math.max(0,Math.ceil((m.endsAt-Date.now())/60000)),teamMembers:m.team.map(id=>survivors().find(n=>n.id===id)).filter(Boolean)}))}}
window.CheegunSurvivorMissions={KEY,MISSIONS,load,save,available,start,finish,tick,summary};
})();