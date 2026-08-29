(()=>{
"use strict";
/* PHASE 17.30 — SAFEHOUSE JOBS, PRODUCTION & RESOURCE GENERATION */
const KEY="cheegunSafehouseProduction_v1";
const JOBS=[
{id:"food",name:"FOOD PRODUCTION",icon:"🥫",roles:["scavenger","trader"],output:{food:3},desc:"Forage, recover and organize community food."},
{id:"water",name:"WATER COLLECTION",icon:"💧",roles:["scavenger","engineer"],output:{water:3},desc:"Secure, filter and store clean water."},
{id:"medical",name:"MEDICAL STATION",icon:"💊",roles:["medic"],output:{medicine:1},desc:"Recover supplies and support injured survivors."},
{id:"workshop",name:"WORKSHOP",icon:"🔧",roles:["engineer"],output:{credits:18},desc:"Repair salvage and generate trade value."},
{id:"guard",name:"GUARD DUTY",icon:"🛡",roles:["guard"],output:{defense:8},desc:"Maintain Safehouse readiness and security."},
{id:"intel",name:"RADIO & INTELLIGENCE",icon:"📡",roles:["trader","scavenger"],output:{intel:1},desc:"Generate recruitment and mission intelligence."}
];
function base(){return{assignments:{},daysWorked:0,produced:{food:0,water:0,medicine:0,credits:0,intel:0,defense:0},history:[],lastProductionDay:-1}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function active(){return(window.CheegunSettlement?.summary?.().population||[]).filter(x=>x.status==="ACTIVE")}
function job(id){return JOBS.find(x=>x.id===id)}
function assign(survivorId,jobId){const j=job(jobId),p=active().find(x=>x.id===survivorId);if(!j||!p)return{ok:false,reason:"INVALID_ASSIGNMENT"};const s=load();s.assignments[survivorId]=jobId;s.history.push({type:"ASSIGN",survivorId,jobId,at:Date.now()});save(s);return{ok:true,job:j}}
function unassign(survivorId){const s=load();delete s.assignments[survivorId];save(s);return{ok:true}}
function roleMultiplier(p,j){return j.roles.includes(p.role)?1.5:0.75}
function produce({force=false}={}){const s=load(),day=window.CheegunSurvivorNeeds?.summary?.().days||0;if(!force&&s.lastProductionDay===day)return{ok:false,reason:"ALREADY_PRODUCED"};const totals={food:0,water:0,medicine:0,credits:0,intel:0,defense:0};for(const p of active()){const j=job(s.assignments[p.id]);if(!j)continue;const mult=roleMultiplier(p,j);for(const[k,v]of Object.entries(j.output))totals[k]+=Math.max(1,Math.round(v*mult))}const needs=window.CheegunSurvivorNeeds?.load?.();if(needs){needs.stock.food+=totals.food;needs.stock.water+=totals.water;needs.stock.medicine+=totals.medicine;window.CheegunSurvivorNeeds.save(needs)}if(totals.credits){const pr=window.CheegunProgression?.load?.();if(pr){pr.credits+=totals.credits;window.CheegunProgression.save(pr)}}if(totals.intel)for(let i=0;i<totals.intel;i++)window.CheegunRecruitment?.generate?.({source:"SAFEHOUSE INTELLIGENCE"});s.produced=Object.fromEntries(Object.keys(s.produced).map(k=>[k,s.produced[k]+(totals[k]||0)]));s.daysWorked++;s.lastProductionDay=day;s.history.push({type:"PRODUCTION",day,totals,at:Date.now()});save(s);return{ok:true,totals}}
function summary(){const s=load(),people=active();return{...s,jobs:JOBS,people:people.map(p=>({survivor:p,job:job(s.assignments[p.id])||null,efficiency:(job(s.assignments[p.id])?roleMultiplier(p,job(s.assignments[p.id])):0)})),assigned:Object.keys(s.assignments).length}}
window.CheegunSafehouseProduction={KEY,JOBS,load,save,assign,unassign,produce,summary};
})();