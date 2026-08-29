(()=>{
"use strict";
/* PHASE 17.13 — SAFEHOUSE CONSTRUCTION & INFRASTRUCTURE */
const KEY="cheegunInfrastructure_v1";
const BUILDINGS={
 medical:{icon:"✚",name:"MEDICAL BAY",desc:"Improves treatment and recovery.",cost:900,requires:{medic:1},tiers:[0,.08,.16,.28]},
 workshop:{icon:"⚙",name:"WORKSHOP",desc:"Reduces gear repair costs.",cost:1100,requires:{engineer:1},tiers:[0,.10,.22,.35]},
 armory:{icon:"🛡",name:"ARMORY",desc:"Improves security readiness and equipment access.",cost:1500,requires:{guard:1},tiers:[0,1,2,3]},
 storage:{icon:"▣",name:"STORAGE DEPOT",desc:"Expands Safehouse storage capacity.",cost:800,requires:{scavenger:1},tiers:[0,6,14,24]},
 radio:{icon:"📡",name:"RADIO ROOM",desc:"Improves contract and expedition intelligence.",cost:1200,requires:{trader:1},tiers:[0,1,2,3]},
 quarters:{icon:"⌂",name:"SURVIVOR QUARTERS",desc:"Expands settlement population capacity.",cost:1000,requires:{},tiers:[0,4,10,18]},
 wall:{icon:"▰",name:"DEFENSIVE WALL",desc:"Improves settlement defense.",cost:1700,requires:{guard:1},tiers:[0,1,2,3]}
};
function base(){return{buildings:{},history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function level(id){return load().buildings[id]?.level||0}
function nextCost(id){const b=BUILDINGS[id],l=level(id);return l>=3?null:Math.round(b.cost*(1+l*.65))}
function hasStaff(id){const req=BUILDINGS[id]?.requires||{},pop=window.CheegunSettlement?.summary?.().population||[];return Object.entries(req).every(([role,n])=>pop.filter(x=>x.status==="ACTIVE"&&x.role===role).length>=n)}
function upgrade(id){const b=BUILDINGS[id],p=window.CheegunState?.load?.(),s=load(),l=level(id),cost=nextCost(id);if(!b)return{ok:false,reason:"UNKNOWN_BUILDING"};if(cost===null)return{ok:false,reason:"MAX_LEVEL"};if(!hasStaff(id))return{ok:false,reason:"STAFF_REQUIREMENT"};if((p?.credits||0)<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS",cost};p.credits-=cost;s.buildings[id]={level:l+1,builtAt:Date.now()};s.history.push({id,level:l+1,cost,at:Date.now()});window.CheegunState.save(p);save(s);return{ok:true,building:b,level:l+1,cost}}
function bonuses(){const x={treatmentDiscount:0,repairDiscount:0,storage:0,population:0,contractIntel:0,defense:0,armory:0};const v=id=>BUILDINGS[id].tiers[level(id)]||0;x.treatmentDiscount=v("medical");x.repairDiscount=v("workshop");x.armory=v("armory");x.storage=v("storage");x.contractIntel=v("radio");x.population=v("quarters");x.defense=v("wall");return x}
function summary(){const s=load();return{buildings:Object.entries(BUILDINGS).map(([id,b])=>({id,...b,level:level(id),nextCost:nextCost(id),staffed:hasStaff(id)})),history:s.history.slice(-12),bonuses:bonuses()}}
window.CheegunInfrastructure={KEY,BUILDINGS,load,save,level,nextCost,hasStaff,upgrade,bonuses,summary};
})();