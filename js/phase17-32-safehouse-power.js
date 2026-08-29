(()=>{
"use strict";
/* PHASE 17.32 — SAFEHOUSE POWER GRID, FUEL & INFRASTRUCTURE DEPENDENCIES */
const KEY="cheegunSafehousePower_v1";
const FACILITIES=[
{id:"waterplant",name:"WATER PURIFICATION",icon:"💧",draw:2,priority:4},
{id:"medbay",name:"MEDICAL BAY",icon:"🏥",draw:2,priority:5},
{id:"workshop",name:"REPAIR WORKSHOP",icon:"🔧",draw:3,priority:2},
{id:"radio",name:"RADIO TOWER",icon:"📡",draw:2,priority:3},
{id:"watchtower",name:"WATCHTOWER",icon:"🛡",draw:1,priority:5},
{id:"generator",name:"POWER GENERATOR",icon:"⚡",draw:0,priority:1}
];
function base(){return{fuel:6,batteries:2,mode:"AUTO",allocations:{},lastTick:Date.now(),fuelBurned:0,blackouts:0,history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function buildings(){return window.CheegunSafehouseBuildings?.summary?.()}
function generators(){return buildings()?.levels?.generator||0}
function capacity(){const g=generators(),s=load();return g*8+(s.batteries*3)}
function demand(){const b=buildings(),s=load();return FACILITIES.filter(f=>(b?.levels?.[f.id]||0)>0&&f.id!=="generator").reduce((n,f)=>n+(s.allocations[f.id]===false?0:f.draw),0)}
function powered(){const b=buildings(),s=load(),cap=capacity();let remaining=cap;const list=FACILITIES.filter(f=>(b?.levels?.[f.id]||0)>0&&f.id!=="generator").sort((a,b)=>b.priority-a.priority);const result={};for(const f of list){if(s.allocations[f.id]===false){result[f.id]=false;continue}result[f.id]=remaining>=f.draw; if(result[f.id])remaining-=f.draw}return{facilities:result,capacity:cap,demand:demand(),remaining}}
function setAllocation(id,on){const s=load();s.allocations[id]=!!on;save(s);return powered()}
function buyFuel(){const p=window.CheegunProgression?.load?.(),s=load(),cost=30;if(!p||p.credits<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=cost;window.CheegunProgression.save(p);s.fuel+=1;s.history.push({type:"FUEL_PURCHASE",at:Date.now()});save(s);return{ok:true}}
function buyBattery(){const p=window.CheegunProgression?.load?.(),s=load(),cost=75;if(!p||p.credits<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=cost;window.CheegunProgression.save(p);s.batteries+=1;s.history.push({type:"BATTERY_PURCHASE",at:Date.now()});save(s);return{ok:true}}
function tick(){const s=load(),now=Date.now();if(now-s.lastTick<180000)return summary();s.lastTick=now;const p=powered(),g=generators();if(g&&s.fuel>0){const burn=Math.min(s.fuel,g);s.fuel-=burn;s.fuelBurned+=burn}else if(p.demand>0){s.blackouts++;s.history.push({type:"BLACKOUT",at:now})}save(s);return summary()}
function multiplier(buildingId){const p=powered().facilities;return p[buildingId]===false?0:1}
function status(){const p=powered(),s=load();return{...p,fuel:s.fuel,batteries:s.batteries,generators:generators(),online:generators()>0&&s.fuel>0,blackout:p.demand>0&&(!generators()||s.fuel<=0)}}
function summary(){const s=load();return{...s,status:status(),facilities:FACILITIES}}
window.CheegunSafehousePower={KEY,FACILITIES,load,save,capacity,demand,powered,setAllocation,buyFuel,buyBattery,tick,multiplier,status,summary};
})();