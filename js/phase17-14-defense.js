(()=>{
"use strict";
/* PHASE 17.14 — SAFEHOUSE DEFENSE & INFECTED THREAT */
const KEY="cheegunDefense_v1";
function base(){return{threat:18,attacksWon:0,attacksLost:0,damage:0,lastAttack:0,history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function readiness(){const infra=window.CheegunInfrastructure?.bonuses?.()||{},settle=window.CheegunSettlement?.bonuses?.()||{};const guards=settle.guard||0,wall=infra.defense||0,armory=infra.armory||0;return Math.min(100,20+guards*14+wall*12+armory*8)}
function pressure(){const s=load();return Math.min(100,Math.max(0,s.threat+(s.damage*.05)-readiness()*.12))}
function raise(n,reason="OUTBREAK_ACTIVITY"){const s=load();s.threat=Math.min(100,s.threat+n);s.history.push({type:"THREAT",n,reason,at:Date.now()});save(s);return status()}
function attack(force=null){const s=load(),r=readiness(),p=pressure(),enemy=force??Math.round(18+p*.8+Math.random()*22),roll=r+Math.random()*35;const won=roll>=enemy;const severity=Math.max(0,Math.round(enemy-roll));if(won){s.attacksWon++;s.threat=Math.max(5,s.threat-8);s.history.push({type:"DEFENSE_SUCCESS",enemy,at:Date.now()})}else{s.attacksLost++;s.damage=Math.min(100,s.damage+Math.max(6,severity));s.threat=Math.min(100,s.threat+10);s.history.push({type:"DEFENSE_FAILURE",enemy,severity,at:Date.now()});const pop=window.CheegunSettlement?.load?.();if(pop?.population?.length&&Math.random()<.25){const active=pop.population.filter(x=>x.status==="ACTIVE");const victim=active[Math.floor(Math.random()*active.length)];if(victim){victim.status="INJURED";pop.history.push({type:"ATTACK_INJURY",id:victim.id,at:Date.now()});window.CheegunSettlement.save(pop)}}}s.lastAttack=Date.now();save(s);return{won,enemy,readiness:r,pressure:pressure(),damage:s.damage}}
function repair(){const s=load(),p=window.CheegunState?.load?.();if(!s.damage)return{ok:false,reason:"NO_DAMAGE"};const cost=Math.ceil(s.damage*18);if((p?.credits||0)<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS",cost};p.credits-=cost;s.damage=0;window.CheegunState.save(p);save(s);return{ok:true,cost}}
function status(){const s=load();return{...s,readiness:readiness(),pressure:pressure(),warning:s.threat>=55||pressure()>=50}}
window.CheegunDefense={KEY,load,save,readiness,pressure,raise,attack,repair,status};
})();