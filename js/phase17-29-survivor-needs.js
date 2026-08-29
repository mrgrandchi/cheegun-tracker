(()=>{
"use strict";
/* PHASE 17.29 — SURVIVOR NEEDS, FATIGUE, FOOD & RESOURCE CONSUMPTION */
const KEY="cheegunSurvivorNeeds_v1";
const CONSUMABLES=[
 {id:"food",name:"FOOD RATIONS",icon:"🥫",cost:18},
 {id:"water",name:"WATER SUPPLY",icon:"💧",cost:12},
 {id:"medicine",name:"MEDICAL SUPPLIES",icon:"💊",cost:35}
];
function base(){return{stock:{food:8,water:8,medicine:2},lastTick:Date.now(),days:0,shortages:0,history:[]}}
function load(){try{const s={...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")};s.stock={...base().stock,...(s.stock||{})};return s}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function active(){return (window.CheegunSettlement?.summary?.().population||[]).filter(x=>x.status==="ACTIVE")}
function buy(id){const c=CONSUMABLES.find(x=>x.id===id),s=load(),p=window.CheegunProgression?.load?.();if(!c||!p)return{ok:false,reason:"INVALID_SUPPLY"};if(p.credits<c.cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=c.cost;window.CheegunProgression.save(p);s.stock[id]++;s.history.push({type:"PURCHASE",id,at:Date.now()});save(s);return{ok:true,supply:c}}
function applyMorale(amount,reason){window.CheegunSurvivorCommunity?.applyMorale?.(amount,reason)}
function consumeDay(){const s=load(),people=active(),need=people.length;const foodUsed=Math.min(s.stock.food,need),waterUsed=Math.min(s.stock.water,need);s.stock.food-=foodUsed;s.stock.water-=waterUsed;const foodShort=Math.max(0,need-foodUsed),waterShort=Math.max(0,need-waterUsed);const profiles=window.CheegunSurvivorProgression?.summary?.().people||[];for(const p of profiles){const id=p.survivor.id;const fatigue=(waterShort?12:0)+(foodShort?8:0)+6;window.CheegunSurvivorCommunity?.addFatigue?.(id,fatigue);if(p.survivor.injury&&s.stock.medicine>0)s.stock.medicine--}if(foodShort||waterShort){s.shortages++;applyMorale(-(foodShort*5+waterShort*7),"RESOURCE_SHORTAGE")}else applyMorale(2,"SUPPLIES_STABLE");s.days++;const production=window.CheegunSafehouseProduction?.produce?.({force:false});s.history.push({type:"DAILY_CONSUMPTION",need,foodUsed,waterUsed,foodShort,waterShort,at:Date.now()});save(s);return{need,foodShort,waterShort,stock:s.stock}}
function rest(id){const s=load(),p=(window.CheegunSurvivorCommunity?.summary?.().people||[]).find(x=>x.id===id);if(!p)return{ok:false,reason:"SURVIVOR_NOT_FOUND"};const reduction=18+(s.stock.food>0?6:0)+(s.stock.water>0?6:0);window.CheegunSurvivorCommunity?.addFatigue?.(id,-reduction);s.history.push({type:"REST",id,reduction,at:Date.now()});save(s);return{ok:true,reduction}}
function tick(){const s=load(),now=Date.now();if(now-s.lastTick<180000)return summary();s.lastTick=now;save(s);return consumeDay()}
function missionPenalty(ids=[]){const people=window.CheegunSurvivorCommunity?.summary?.().people||[];const fatigue=ids.map(id=>people.find(p=>p.id===id)?.fatigue||0);const avg=fatigue.length?fatigue.reduce((a,b)=>a+b,0)/fatigue.length:0;const supply=scarcity();return Math.round(avg*.18+supply.pressure*.12)}
function scarcity(){const s=load(),n=Math.max(1,active().length),stock=s.stock;const pressure=Math.round(Math.max(0,100-((stock.food+stock.water)/(n*2))*100));return{...stock,population:n,pressure}}
function summary(){const s=load();return{...s,catalog:CONSUMABLES,scarcity:scarcity(),people:(window.CheegunSurvivorCommunity?.summary?.().people||[])}}
window.CheegunSurvivorNeeds={KEY,CONSUMABLES,load,save,buy,consumeDay,rest,tick,missionPenalty,scarcity,summary};
})();