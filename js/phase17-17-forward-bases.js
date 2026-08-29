(()=>{
"use strict";
/* PHASE 17.17 — DISTRICT SAFEHOUSES & FORWARD OPERATING BASES */
const KEY="cheegunForwardBases_v1";
const TYPES={
 medical:{icon:"✚",name:"MEDICAL POST",desc:"Forward treatment and recovery support.",cost:700,roles:["medic"],bonus:{treatment:.12}},
 cache:{icon:"▣",name:"SUPPLY CACHE",desc:"Forward storage and expedition resupply.",cost:650,roles:["scavenger"],bonus:{stash:6}},
 watch:{icon:"◉",name:"WATCH POST",desc:"Early warning and district threat visibility.",cost:850,roles:["guard"],bonus:{intel:1}},
 workshop:{icon:"⚙",name:"FIELD WORKSHOP",desc:"Repairs equipment closer to the frontline.",cost:900,roles:["engineer"],bonus:{repair:.15}},
 relay:{icon:"📡",name:"RADIO RELAY",desc:"Extends contract intelligence into the district.",cost:800,roles:["trader"],bonus:{contracts:1}}
};
function base(){return{bases:{},history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function district(id){return window.CheegunDistrictControl?.get?.(id)}
function staffAvailable(role){return (window.CheegunSettlement?.summary?.().population||[]).filter(x=>x.status==="ACTIVE"&&x.role===role)}
function canEstablish(districtId,type){const d=district(districtId),t=TYPES[type];if(!d)return{ok:false,reason:"UNKNOWN_DISTRICT"};if(!d.secured)return{ok:false,reason:"DISTRICT_NOT_LIBERATED"};if(!t)return{ok:false,reason:"UNKNOWN_BASE_TYPE"};const s=load();if(s.bases[districtId])return{ok:false,reason:"BASE_ALREADY_ESTABLISHED"};if(!t.roles.every(r=>staffAvailable(r).length))return{ok:false,reason:"STAFF_REQUIRED"};return{ok:true,d,t}}
function establish(districtId,type){const c=canEstablish(districtId,type);if(!c.ok)return c;const p=window.CheegunState?.load?.();if((p?.credits||0)<c.t.cost)return{ok:false,reason:"INSUFFICIENT_CREDITS",cost:c.t.cost};p.credits-=c.t.cost;window.CheegunState.save(p);const s=load();s.bases[districtId]={districtId,type,level:1,establishedAt:Date.now(),assigned:null};s.history.push({type:"ESTABLISHED",districtId,base:type,at:Date.now()});save(s);return{ok:true,base:s.bases[districtId],type:c.t}}
function assign(districtId,survivorId){const s=load(),b=s.bases[districtId];if(!b)return{ok:false,reason:"NO_FORWARD_BASE"};const n=(window.CheegunSettlement?.summary?.().population||[]).find(x=>x.id===survivorId);if(!n)return{ok:false,reason:"SURVIVOR_NOT_FOUND"};const t=TYPES[b.type];if(!t.roles.includes(n.role))return{ok:false,reason:"ROLE_MISMATCH"};b.assigned=survivorId;s.history.push({type:"ASSIGNED",districtId,survivorId,at:Date.now()});save(s);return{ok:true}}
function upgrade(districtId){const s=load(),b=s.bases[districtId];if(!b)return{ok:false,reason:"NO_FORWARD_BASE"};if(b.level>=3)return{ok:false,reason:"MAX_LEVEL"};const cost=600*b.level;const p=window.CheegunState?.load?.();if((p?.credits||0)<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS",cost};p.credits-=cost;b.level++;window.CheegunState.save(p);save(s);return{ok:true,level:b.level,cost}}
function bonuses(districtId){const s=load(),b=s.bases[districtId];if(!b)return{};const raw=TYPES[b.type].bonus||{};return Object.fromEntries(Object.entries(raw).map(([k,v])=>[k,typeof v==="number"?v*b.level:v]))}
function summary(){const s=load(),ds=window.CheegunDistrictControl?.summary?.().districts||[];return{types:TYPES,bases:ds.filter(d=>d.secured).map(d=>({district:d,base:s.bases[d.id]||null,bonus:bonuses(d.id)})),history:s.history.slice(-20)}}
window.CheegunForwardBases={KEY,TYPES,load,save,canEstablish,establish,assign,upgrade,bonuses,summary};
})();