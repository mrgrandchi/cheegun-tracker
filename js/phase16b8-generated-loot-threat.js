(()=>{
"use strict";
/** PHASE 16B.8 — GENERATED LOOT & THREAT INTEGRATION */
const CFG={lootSlots:3,maxPoiSpawns:18,spawnMinDistance:140};
const state={enabled:false,lootClaimed:new Set(),spawned:new Set(),stats:{lootGranted:0,spawned:0}};

function poiAuthority(){return window.CheegunPoiAuthority}
function itemMap(category){
 return {
  medical:["🩹 Bandage","💊 Painkillers","🩺 Medical Kit"],
  tactical:["🔦 Heavy Flashlight","📻 Radio Battery","🔪 Kitchen Knife"],
  supplies:["🥫 Canned Food","💧 Water","🔋 Battery"],
  industrial:["🔧 Tool Kit","⛽ Fuel Can","🪓 Rescue Axe"],
  civilian:["🥫 Canned Food","💧 Water","🔋 Battery"],
  mixed:["🔧 Tool Kit","🥫 Canned Food"]
 }[category]||["🥫 Canned Food","🔧 Tool Kit"];
}
function rollLoot(poi){
 const info=poiAuthority()?.classifyLoot?.(poi)||{category:"mixed",risk:2};
 const pool=itemMap(info.category),count=Math.max(1,Math.min(CFG.lootSlots,1+Math.floor(Math.random()*CFG.lootSlots)));
 const items=[];for(let i=0;i<count;i++)items.push(pool[Math.floor(Math.random()*pool.length)]);
 return {poiId:poi.id,category:info.category,risk:info.risk,items:[...new Set(items)]};
}
function grantLoot(position){
 if(!state.enabled)return {ok:false,reason:"DISABLED"};
 const result=poiAuthority()?.search?.(position);
 if(!result?.ok)return result||{ok:false,reason:"NO_POI"};
 const loot=rollLoot(result.poi);
 const inventory=typeof window.inv==="function"?window.inv():JSON.parse(localStorage.getItem("outbreak_inventory")||"[]");
 const space=Math.max(0,8-inventory.length),taken=loot.items.slice(0,space);
 if(typeof window.saveInv==="function")window.saveInv(inventory.concat(taken));
 else localStorage.setItem("outbreak_inventory",JSON.stringify(inventory.concat(taken)));
 state.lootClaimed.add(result.poi.id);state.stats.lootGranted+=taken.length;
 document.dispatchEvent(new CustomEvent("cheegunGeneratedLootGranted",{detail:{poi:result.poi,loot,taken}}));
 return {ok:true,poi:result.poi,loot,taken};
}
function threatAt(position){
 const poi=poiAuthority()?.nearest?.(position,180);
 if(!poi)return {level:0,poi:null};
 const info=poiAuthority()?.classifyLoot?.(poi)||{risk:2};
 return {level:Math.max(1,Math.min(5,info.risk||poi.threat||2)),poi};
}
function spawnCandidates(playerPosition){
 if(!state.enabled)return [];
 const tactical=window.cheegunGeneratedGameplay;
 const candidates=[...(tactical?.spawns||[])].filter(s=>!state.spawned.has(s.id));
 return candidates.filter(s=>{
  const dx=(s.position[0]-(playerPosition.lat??playerPosition[0]))*111000,dy=(s.position[1]-(playerPosition.lng??playerPosition[1]))*111000;
  const d=Math.hypot(dx,dy);return d>=CFG.spawnMinDistance&&d<=900;
 }).sort((a,b)=>b.weight-a.weight).slice(0,CFG.maxPoiSpawns);
}
function consumeSpawnCandidate(id){state.spawned.add(id);state.stats.spawned++;return id}
function enable(){if(!poiAuthority()?.state?.enabled){console.warn("[CHEEGUN 16B.8] Enable POI authority first");return false}state.enabled=true;document.dispatchEvent(new CustomEvent("cheegunLootThreatEnabled",{detail:{state}}));return true}
function disable(){state.enabled=false;return true}
window.CheegunGeneratedLootThreat={CFG,state,rollLoot,grantLoot,threatAt,spawnCandidates,consumeSpawnCandidate,enable,disable};
console.info("[CHEEGUN 16B.8] Generated loot + threat integration ready; explicit enable required.");
})();