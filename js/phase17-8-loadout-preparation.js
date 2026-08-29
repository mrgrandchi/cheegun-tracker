(()=>{
"use strict";
/* PHASE 17.8 — LOADOUT PREPARATION & DEPLOYMENT AUTHORITY */
const KEY="cheegunDeploymentLoadout_v1";
const DEFAULT={supplies:[],preparedAt:null,deployedAt:null};
function load(){try{return{...DEFAULT,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return{...DEFAULT}}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function gear(){return window.CheegunGear?.summary?.()||{state:{equipped:{},owned:[]},gear:{}}}
function capacity(){return window.CheegunInventoryAuthority?.capacity?.()||8}
function supplyCatalog(){return Object.entries(window.CheegunProgression?.ITEMS||{}).filter(([,x])=>x.type==="consumable").map(([id,x])=>({id,...x}))}
function supplies(){return load().supplies}
function setSupplies(ids){const valid=(ids||[]).filter(id=>supplyCatalog().some(x=>x.id===id)).slice(0,Math.min(4,capacity()));const s=load();s.supplies=valid;s.preparedAt=Date.now();save(s);return s}
function toggleSupply(id){const s=load(),has=s.supplies.includes(id);s.supplies=has?s.supplies.filter(x=>x!==id):[...s.supplies,id].slice(0,4);s.preparedAt=Date.now();save(s);return s}
function validate(){const g=gear(),eq=g.state.equipped||{},issues=[];if(!eq.weapon)issues.push("NO_WEAPON");const active=window.CheegunGear?.active?.()||[];active.forEach(x=>{if(x.durability<=0)issues.push("BROKEN_"+x.gear.slot.toUpperCase())});if(supplies().length>4)issues.push("SUPPLY_LIMIT");return{ok:issues.length===0,issues,equipped:eq,supplies:supplies(),capacity:capacity(),modifiers:window.CheegunGear?.modifiers?.()||{}}}
function prepare(){const v=validate(),s=load();if(!v.ok)return{ok:false,...v};s.preparedAt=Date.now();save(s);return{ok:true,...v}}
function deploy(){const r=prepare();if(!r.ok)return r;const s=load();s.deployedAt=Date.now();save(s);localStorage.setItem("cheegunActiveLoadout",JSON.stringify({weapon:r.equipped.weapon,armor:r.equipped.armor,backpack:r.equipped.backpack,utility:r.equipped.utility,supplies:r.supplies}));return{ok:true,...r}}
function summary(){return{state:load(),validation:validate(),catalog:supplyCatalog()}}
window.CheegunLoadoutPreparation={KEY,load,save,supplies,setSupplies,toggleSupply,validate,prepare,deploy,summary};
})();