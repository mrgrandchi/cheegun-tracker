(()=>{
"use strict";
/* PHASE 17.12 — SURVIVOR RECRUITMENT & SAFEHOUSE POPULATION */
const KEY="cheegunSettlement_v1";
const ROLES={
 medic:{icon:"✚",name:"MEDIC",desc:"Reduces treatment costs and improves recovery.",unlock:0},
 scavenger:{icon:"⌕",name:"SCAVENGER",desc:"Improves recovered supplies and loot intelligence.",unlock:0},
 guard:{icon:"⚔",name:"GUARD",desc:"Protects the settlement and supports security.",unlock:0},
 trader:{icon:"◈",name:"TRADER",desc:"Improves market access and settlement income.",unlock:0},
 engineer:{icon:"⚙",name:"ENGINEER",desc:"Supports repairs and future infrastructure.",unlock:0}
};
function base(){return{population:[],rescued:0,lost:0,nextId:1,history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function names(){return["MAYA","ELIAS","NORA","JACK","RIVER","ANNA","MARCUS","SKYE","DANIEL","ROSE","KAI","TESSA"]}
function recruit({name=null,role="unassigned",source="EXPEDITION"}={}){const s=load(),id="survivor-"+s.nextId++;const n={id,name:name||names()[Math.floor(Math.random()*names().length)],role,source,recruitedAt:Date.now(),status:"ACTIVE"};s.population.push(n);s.rescued++;s.history.push({type:"RECRUITED",id,at:Date.now()});save(s);window.CheegunFactions?.gain?.("survivors",1,"SURVIVOR_RESCUED");return{ok:true,survivor:n}}
function assign(id,role){const s=load(),n=s.population.find(x=>x.id===id);if(!n)return{ok:false,reason:"SURVIVOR_NOT_FOUND"};if(!ROLES[role])return{ok:false,reason:"ROLE_NOT_FOUND"};n.role=role;save(s);return{ok:true,survivor:n}}
function bonuses(){const s=load(),count=r=>s.population.filter(x=>x.status==="ACTIVE"&&x.role===r).length;return{medic:count("medic")*.08,scavenger:count("scavenger")*.05,guard:count("guard"),trader:count("trader")*.03,engineer:count("engineer")*.08}}
function capacity(){const p=load().population.length;return 4+Math.floor(p/3)*2}
function summary(){const s=load();return{...s,roles:ROLES,bonuses:bonuses(),capacity:capacity(),active:s.population.filter(x=>x.status==="ACTIVE").length}}
window.CheegunSettlement={KEY,ROLES,load,save,recruit,assign,bonuses,capacity,summary};
})();