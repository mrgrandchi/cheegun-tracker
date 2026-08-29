(()=>{
"use strict";
/* PHASE 17.31 — SAFEHOUSE BUILDINGS, UPGRADES & CONSTRUCTION TIERS */
const KEY="cheegunSafehouseBuildings_v1";
const BUILDINGS=[
{id:"shelter",name:"SURVIVOR SHELTER",icon:"🏕",cost:90,max:3,base:{capacity:4},desc:"Expands survivor capacity and reduces overcrowding."},
{id:"storage",name:"FOOD STORAGE",icon:"🥫",cost:75,max:3,base:{foodCap:12},desc:"Increases sustainable food reserves."},
{id:"waterplant",name:"WATER PURIFICATION",icon:"💧",cost:110,max:3,base:{waterCap:12},desc:"Improves water security and reduces shortage pressure."},
{id:"medbay",name:"MEDICAL BAY",icon:"🏥",cost:140,max:3,base:{medicineCap:6,recovery:8},desc:"Improves medical capacity and survivor recovery."},
{id:"workshop",name:"REPAIR WORKSHOP",icon:"🔧",cost:125,max:3,base:{production:12,repair:10},desc:"Improves industrial output and equipment recovery."},
{id:"radio",name:"RADIO TOWER",icon:"📡",cost:160,max:3,base:{intel:1,recruit:8},desc:"Expands intelligence and recruitment reach."},
{id:"watchtower",name:"WATCHTOWER",icon:"🛡",cost:150,max:3,base:{defense:15},desc:"Raises Safehouse defensive readiness."},
{id:"generator",name:"POWER GENERATOR",icon:"⚡",cost:180,max:3,base:{production:10,defense:5},desc:"Powers advanced Safehouse operations."}
];
function base(){return{levels:Object.fromEntries(BUILDINGS.map(b=>[b.id,0])),built:0,history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function building(id){return BUILDINGS.find(b=>b.id===id)}
function nextCost(b,lvl){return Math.round(b.cost*(1+lvl*.65))}
function stats(){const s=load(),out={capacity:0,foodCap:0,waterCap:0,medicineCap:0,recovery:0,production:0,repair:0,intel:0,recruit:0,defense:0,power:0};for(const b of BUILDINGS){const l=s.levels[b.id]||0;for(const[k,v]of Object.entries(b.base))out[k]=(out[k]||0)+v*l;if(b.id==="generator")out.power+=l}return out}
function build(id){const b=building(id),s=load(),p=window.CheegunProgression?.load?.();if(!b||!p)return{ok:false,reason:"INVALID_BUILDING"};const lvl=s.levels[id]||0;if(lvl>=b.max)return{ok:false,reason:"MAX_TIER"};const cost=nextCost(b,lvl);if(p.credits<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=cost;window.CheegunProgression.save(p);s.levels[id]=lvl+1;s.built++;s.history.push({type:lvl?"UPGRADE":"CONSTRUCT",id,level:lvl+1,cost,at:Date.now()});save(s);return{ok:true,building:b,level:lvl+1,cost,stats:stats()}}
function productionMultiplier(jobId){const st=stats();let bonus=1+(st.production/100);if(jobId==="workshop")bonus+=st.repair/100;if(jobId==="intel")bonus+=st.intel*.1;if(jobId==="guard")bonus+=st.defense/150;return bonus}
function summary(){const s=load(),st=stats();return{...s,catalog:BUILDINGS,stats:st,buildings:BUILDINGS.map(b=>({building:b,level:s.levels[b.id]||0,nextCost:nextCost(b,s.levels[b.id]||0),maxed:(s.levels[b.id]||0)>=b.max}))}}
window.CheegunSafehouseBuildings={KEY,BUILDINGS,load,save,stats,build,nextCost,productionMultiplier,summary};
})();