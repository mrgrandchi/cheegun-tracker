(()=>{
"use strict";
/* PHASE 17.18 — DISTRICT SERVICES, SUPPLY LINES & FAST TRAVEL */
const KEY="cheegunSupplyNetwork_v1";
function base(){return{routes:{},travelLog:[],lastResupply:0}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function baseAt(id){return window.CheegunForwardBases?.load?.().bases?.[id]||null}
function districts(){return window.CheegunDistrictControl?.summary?.().districts||[]}
function canLink(id){const d=districts().find(x=>x.id===id),b=baseAt(id);if(!d?.secured)return{ok:false,reason:"DISTRICT_NOT_SECURED"};if(!b)return{ok:false,reason:"NO_FORWARD_BASE"};return{ok:true,d,b}}
function link(id){const c=canLink(id);if(!c.ok)return c;const s=load();if(s.routes[id])return{ok:false,reason:"ROUTE_ALREADY_ACTIVE"};const cost=450+(c.b.level-1)*150;const p=window.CheegunState?.load?.();if((p?.credits||0)<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS",cost};p.credits-=cost;window.CheegunState.save(p);s.routes[id]={districtId:id,integrity:100,linkedAt:Date.now(),cost};save(s);return{ok:true,route:s.routes[id],district:c.d}}
function route(id){return load().routes[id]||null}
function canTravel(id){const r=route(id),c=canLink(id);if(!c.ok)return c;if(!r||r.integrity<35)return{ok:false,reason:!r?"NO_SUPPLY_LINE":"ROUTE_BLOCKED"};return{ok:true,district:c.d,route:r}}
function travel(id){const c=canTravel(id);if(!c.ok)return c;const s=load();s.travelLog.push({districtId:id,at:Date.now()});s.travelLog=s.travelLog.slice(-30);save(s);localStorage.setItem("cheegunFastTravelTarget",JSON.stringify({districtId:id,pos:c.d.center,at:Date.now()}));return{ok:true,target:c.d}}
function damageRoutes(amount=8){const s=load(),pressure=window.CheegunOutbreakEvolution?.pressure?.()||0;for(const r of Object.values(s.routes))r.integrity=Math.max(0,r.integrity-Math.max(1,Math.round(amount*(pressure/100))));save(s);return summary()}
function resupply(id){const c=canTravel(id);if(!c.ok)return c;const b=baseAt(id),bonus=window.CheegunForwardBases?.bonuses?.(id)||{};const value=Math.round(20+(bonus.stash||0)*2+b.level*8);const s=load();s.lastResupply=Date.now();save(s);return{ok:true,value,base:b}}
function services(id){const b=baseAt(id),bonus=window.CheegunForwardBases?.bonuses?.(id)||{};if(!b)return{};return{fastTravel:!!route(id),resupply:b.type==="cache",treatment:b.type==="medical",repair:b.type==="workshop",intel:b.type==="watch"||b.type==="relay",...bonus}}
function summary(){const s=load();return{routes:districts().filter(d=>d.secured).map(d=>({district:d,base:baseAt(d.id),route:s.routes[d.id]||null,services:services(d.id)})),travelLog:s.travelLog.slice(-12)}}
window.CheegunSupplyNetwork={KEY,load,save,link,route,canTravel,travel,damageRoutes,resupply,services,summary};
})();