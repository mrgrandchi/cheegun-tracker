(()=>{
"use strict";
/* PHASE 17 — SAFEHOUSE ECONOMY & PROGRESSION */
const KEY="cheegunPhase17_v1";
const ITEMS={
 "field-medkit":{name:"Field Medkit",icon:"💉",price:220,type:"consumable",desc:"Emergency healing supply."},
 "ration-pack":{name:"Ration Pack",icon:"🥫",price:75,type:"consumable",desc:"Restores expedition supplies."},
 "water-pack":{name:"Water Pack",icon:"💧",price:60,type:"consumable",desc:"Hydration for the next run."},
 "ammo-cache":{name:"Ammo Cache",icon:"📦",price:180,type:"consumable",desc:"Reserve ammunition cache."},
 "reinforced-pack":{name:"Reinforced Backpack",icon:"🎒",price:900,type:"backpack",desc:"+4 inventory capacity."},
 "survival-rig":{name:"Survival Rig",icon:"🦺",price:1600,type:"armor",desc:"Improved field protection."},
 "scavenger":{name:"Scavenger Kit",icon:"🔧",price:650,type:"gear",desc:"Improves expedition preparedness."}
};
const PERKS={
 "field-training":{name:"Field Training",icon:"🧠",cost:1,desc:"+10 starting stamina."},
 "quiet-step":{name:"Quiet Step",icon:"👣",cost:1,desc:"Reduced movement noise."},
 "pack-rat":{name:"Pack Rat",icon:"🎒",cost:2,desc:"+2 stash slots."},
 "hard-to-kill":{name:"Hard To Kill",icon:"🛡️",cost:3,desc:"Improved survival resilience."}
};
function base(){return{prestige:0,perkPoints:0,perks:[],purchases:[],supplies:[],traderRep:0,totalSpent:0}}
function load(){try{return {...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v));return v}
function profile(){return window.CheegunState?.load?.()||null}
function xpProgress(p){let prior=0;for(let l=1;l<p.level;l++)prior+=window.CheegunState.xpForNextLevel(l);const need=window.CheegunState.xpForNextLevel(p.level);return{current:Math.max(0,p.xp-prior),need,percent:Math.min(100,Math.round(Math.max(0,p.xp-prior)/need*100))}}
function sellAll(){const p=profile();if(!p?.stash?.length)return{ok:false,reason:"NO_STASH"};const values={"Medical Kit":320,"Trauma Kit":260,"Rescue Axe":240,"Crowbar":160,"Emergency Beacon":180,"Power Cell":140,"Repair Kit":110,"Painkillers":70,"Bandage":25,"Canned Food":18,"Water Bottle":15,"Flashlight":35};let credits=0;for(const raw of p.stash){const clean=String(raw).replace(/[^a-z0-9 ]/gi,"").trim();credits+=Object.entries(values).find(([k])=>clean.includes(k))?.[1]||50}const sold=p.stash.length;p.credits=(p.credits||0)+credits;p.stats.totalCreditsEarned=(p.stats.totalCreditsEarned||0)+credits;p.stash=[];window.CheegunState.save(p);return{ok:true,sold,credits}}
function buy(id){const item=ITEMS[id],p=profile(),s=load();if(!item)return{ok:false,reason:"UNKNOWN_ITEM"};if((p.credits||0)<item.price)return{ok:false,reason:"INSUFFICIENT_CREDITS"};if(s.purchases.includes(id)&&item.type!=="consumable")return{ok:false,reason:"OWNED"};p.credits-=item.price;if(item.type==="backpack"){p.ownedGear=[...(p.ownedGear||[]),id];p.equipped.backpack=id}else if(item.type==="armor"){p.ownedGear=[...(p.ownedGear||[]),id];p.equipped.armor=id}else if(item.type==="consumable")s.supplies.push(id);else p.ownedGear=[...(p.ownedGear||[]),id];s.purchases.push(id);s.totalSpent+=item.price;window.CheegunState.save(p);save(s);return{ok:true,item,p}}
function claimPerkPoint(){const p=profile(),s=load();const earned=Math.max(0,Math.floor((p.level-1)/2)+Math.floor((p.stats.successfulExtractions||0)/5));const claimed=s.perks.length+s.perkPoints;if(earned<=claimed)return{ok:false,reason:"NONE_AVAILABLE"};s.perkPoints++;save(s);return{ok:true,perkPoints:s.perkPoints}}
function unlockPerk(id){const perk=PERKS[id],s=load();if(!perk)return{ok:false,reason:"UNKNOWN_PERK"};if(s.perks.includes(id))return{ok:false,reason:"OWNED"};if(s.perkPoints<perk.cost)return{ok:false,reason:"INSUFFICIENT_POINTS"};s.perkPoints-=perk.cost;s.perks.push(id);save(s);return{ok:true}}
function summary(){const p=profile(),s=load(),xp=xpProgress(p);return{profile:p,state:s,xp,items:ITEMS,perks:PERKS}}
window.CheegunProgression={KEY,ITEMS,PERKS,load,save,summary,sellAll,buy,claimPerkPoint,unlockPerk};
})();