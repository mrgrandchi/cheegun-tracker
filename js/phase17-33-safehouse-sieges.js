(()=>{
"use strict";
/* PHASE 17.33 — SAFEHOUSE ATTACKS, SIEGES & DEFENSIVE OPERATIONS */
const KEY="cheegunSafehouseSieges_v1";
const WAVES=["SCOUTING INFECTED","ROAMING PACK","HORDE PRESSURE","FULL SIEGE"];
function base(){return{threat:12,active:null,wins:0,losses:0,damage:0,casualties:0,history:[],warningAt:0}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function roster(){return(window.CheegunSettlement?.summary?.().population||[]).filter(p=>p.status==="ACTIVE")}
function buildingDefense(){return window.CheegunSafehouseBuildings?.stats?.().defense||0}
function guardDefense(){const pr=window.CheegunSafehouseProduction?.summary?.();return(pr?.people||[]).filter(p=>p.job?.id==="guard").reduce((n,p)=>n+12*p.efficiency,0)}
function readiness(){const power=window.CheegunSafehousePower?.status?.();const legacy=window.CheegunDefense?.status?.();return Math.round(buildingDefense()+guardDefense()+(legacy?.readiness||0)*.35+(power?.facilities?.watchtower?12:0))}
function raise(amount,source="OUTBREAK"){const s=load();s.threat=Math.min(100,s.threat+amount);s.history.push({type:"THREAT",amount,source,at:Date.now()});if(s.threat>=60&&!s.active)s.warningAt=Date.now();save(s);return summary()}
function assignDefenders(ids){const s=load();if(!s.active)return{ok:false,reason:"NO_ACTIVE_ATTACK"};s.active.defenders=[...new Set(ids)].slice(0,6);save(s);return{ok:true}}
function trigger({force=false}={}){const s=load();if(s.active)return{ok:false,reason:"ATTACK_ALREADY_ACTIVE"};if(!force&&s.threat<55)return{ok:false,reason:"THREAT_TOO_LOW"};const tier=s.threat>=90?3:s.threat>=75?2:s.threat>=60?1:0;s.active={id:"siege_"+Date.now(),wave:WAVES[tier],tier,strength:Math.round(55+s.threat*.9),defenders:[],startedAt:Date.now(),deadline:Date.now()+120000};s.history.push({type:"ATTACK",wave:s.active.wave,strength:s.active.strength,at:Date.now()});save(s);return{ok:true,attack:s.active}}
function resolve(){const s=load(),a=s.active;if(!a)return{ok:false,reason:"NO_ACTIVE_ATTACK"};const people=roster().filter(p=>a.defenders.includes(p.id));const team=people.reduce((n,p)=>n+14+(100-(p.fatigue||0))*.08,0);const power=window.CheegunSafehousePower?.status?.();const defense=readiness()+team+(power?.online?8:0);const roll=Math.round(Math.random()*35);const score=defense+roll;const victory=score>=a.strength;let casualties=0,damage=0;if(victory){s.wins++;s.threat=Math.max(5,s.threat-28)}else{damage=Math.max(5,Math.round((a.strength-score)*.65));casualties=Math.min(people.length,score<a.strength*.55?1:0);s.losses++;s.damage+=damage;s.casualties+=casualties;s.threat=Math.max(25,s.threat-12);if(casualties&&people[0]){try{const st=window.CheegunSettlement?.load?.();const p=st?.population?.find(x=>x.id===people[0].id);if(p)p.status="MISSING";window.CheegunSettlement?.save?.(st)}catch{}}}const result={ok:true,victory,score,strength:a.strength,damage,casualties,wave:a.wave};s.history.push({type:"RESOLVE",...result,at:Date.now()});s.active=null;save(s);return result}
function repair(){const s=load(),p=window.CheegunProgression?.load?.(),cost=Math.max(20,Math.ceil(s.damage*3));if(!s.damage)return{ok:false,reason:"NO_DAMAGE"};if(!p||p.credits<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=cost;window.CheegunProgression.save(p);s.damage=0;save(s);return{ok:true,cost}}
function tick(){const s=load();if(s.active&&Date.now()>s.active.deadline)return resolve();if(!s.active&&s.threat>=82&&Math.random()<.08)return trigger();return summary()}
function summary(){const s=load();return{...s,readiness:readiness(),roster:roster(),warning:s.threat>=60&&!s.active}}
window.CheegunSafehouseSieges={KEY,load,save,raise,trigger,assignDefenders,resolve,repair,tick,readiness,summary};
})();