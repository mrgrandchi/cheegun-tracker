(()=>{
"use strict";
/* PHASE 17.21 — SURVIVOR RELATIONSHIPS, MORALE & COMMUNITY */
const KEY="cheegunSurvivorCommunity_v1";
const EVENTS=[
 {id:"meal",icon:"🍲",name:"COMMUNITY MEAL",morale:8,trust:3,cost:60},
 {id:"memorial",icon:"🕯",name:"MEMORIAL NIGHT",morale:5,trust:6,cost:40},
 {id:"argument",icon:"⚡",name:"SURVIVOR CONFLICT",morale:-7,trust:-8,cost:0},
 {id:"celebration",icon:"🎉",name:"SMALL VICTORY",morale:10,trust:5,cost:0}
];
function base(){return{morale:62,communityTrust:55,fatigue:{},injuries:{},relationships:{},events:[],deaths:0,conflicts:0,lastTick:0}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function roster(){return window.CheegunSettlement?.summary?.().population||[]}
function clamp(v){return Math.max(0,Math.min(100,v))}
function key(a,b){return[a,b].sort().join("|")}
function relationship(a,b){const s=load(),k=key(a,b);return s.relationships[k]??50}
function changeRelationship(a,b,delta){const s=load(),k=key(a,b);s.relationships[k]=clamp((s.relationships[k]??50)+delta);save(s);return s.relationships[k]}
function applyMorale(delta,reason=""){const s=load();s.morale=clamp(s.morale+delta);s.events.push({type:"MORALE",delta,reason,at:Date.now()});s.events=s.events.slice(-40);save(s);return s.morale}
function communityEvent(id){const e=EVENTS.find(x=>x.id===id);if(!e)return{ok:false,reason:"EVENT_NOT_FOUND"};const p=window.CheegunState?.load?.();if(e.cost&&(p?.credits||0)<e.cost)return{ok:false,reason:"INSUFFICIENT_CREDITS",cost:e.cost};if(e.cost){p.credits-=e.cost;window.CheegunState.save(p)}const s=load();s.morale=clamp(s.morale+e.morale);s.communityTrust=clamp(s.communityTrust+e.trust);s.events.push({type:"COMMUNITY_EVENT",event:id,at:Date.now()});save(s);return{ok:true,event:e,morale:s.morale,trust:s.communityTrust}}
function missionOutcome(m,success){const s=load();for(const id of m.team||[]){s.fatigue[id]=clamp((s.fatigue[id]||0)+(success?8:15));if(!success&&Math.random()<.18)s.injuries[id]={severity:1+Math.floor(Math.random()*3),at:Date.now(),cause:m.name}}for(let i=0;i<(m.team||[]).length;i++)for(let j=i+1;j<(m.team||[]).length;j++){const k=key(m.team[i],m.team[j]);s.relationships[k]=clamp((s.relationships[k]??50)+(success?4:-6))}s.morale=clamp(s.morale+(success?2:-5));save(s)}
function rest(id){const s=load();s.fatigue[id]=Math.max(0,(s.fatigue[id]||0)-30);if(s.injuries[id])delete s.injuries[id];save(s);return{ok:true}}
function tick(){const s=load(),now=Date.now();if(now-s.lastTick<60000)return summary();s.lastTick=now;for(const n of roster()){if(s.fatigue[n.id]>0)s.fatigue[n.id]=Math.max(0,s.fatigue[n.id]-3)}if(Math.random()<.22&&roster().length>=2){const a=roster()[Math.floor(Math.random()*roster().length)],b=roster()[Math.floor(Math.random()*roster().length)];if(a&&b&&a.id!==b.id&&relationship(a.id,b.id)<28){s.conflicts++;s.morale=clamp(s.morale-4);s.events.push({type:"CONFLICT",a:a.id,b:b.id,at:now})}}save(s);return summary()}
function leadership(){const s=load();return{morale:s.morale,trust:s.communityTrust,effect:Math.round(((s.morale+s.communityTrust)/2-50)/10)}}
function summary(){const s=load(),people=roster();return{...s,people:people.map(n=>({...n,fatigue:s.fatigue[n.id]||0,injury:s.injuries[n.id]||null})),leadership:leadership(),catalog:EVENTS}}
window.CheegunSurvivorCommunity={KEY,EVENTS,load,save,relationship,changeRelationship,applyMorale,communityEvent,missionOutcome,rest,tick,leadership,summary};
})();