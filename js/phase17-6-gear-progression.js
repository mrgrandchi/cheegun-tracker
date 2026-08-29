(()=>{
"use strict";
/* PHASE 17.6 — GEAR & EQUIPMENT PROGRESSION */
const KEY="cheegunGearProgression_v1";
const GEAR={
 "service-pistol":{slot:"weapon",name:"Service Pistol",icon:"🔫",rarity:"COMMON",tier:1,price:0,damage:18,noise:1,durability:100,desc:"Reliable sidearm."},
 "rescue-axe":{slot:"weapon",name:"Rescue Axe",icon:"🪓",rarity:"UNCOMMON",tier:2,price:750,damage:30,noise:.85,durability:120,desc:"Heavy rescue tool repurposed for survival."},
 "field-machete":{slot:"weapon",name:"Field Machete",icon:"⚔️",rarity:"RARE",tier:3,price:1450,damage:42,noise:.72,durability:140,desc:"Balanced close-quarters weapon."},
 "reinforced-pack":{slot:"backpack",name:"Reinforced Backpack",icon:"🎒",rarity:"UNCOMMON",tier:2,price:900,inventoryBonus:4,durability:150,desc:"+4 expedition slots."},
 "expedition-pack":{slot:"backpack",name:"Expedition Pack",icon:"🎒",rarity:"RARE",tier:3,price:1900,inventoryBonus:7,lootBonus:1,durability:180,desc:"+7 slots and +1 loot roll."},
 "survival-rig":{slot:"armor",name:"Survival Rig",icon:"🦺",rarity:"UNCOMMON",tier:2,price:1600,damageReduction:.18,durability:180,desc:"18% damage reduction."},
 "composite-vest":{slot:"armor",name:"Composite Vest",icon:"🛡️",rarity:"RARE",tier:3,price:2900,damageReduction:.28,noiseMultiplier:1.08,durability:220,desc:"28% protection with a noise penalty."},
 "scavenger":{slot:"utility",name:"Scavenger Kit",icon:"🔧",rarity:"UNCOMMON",tier:2,price:650,lootBonus:1,durability:80,desc:"+1 loot roll."},
 "field-radio":{slot:"utility",name:"Field Radio",icon:"📡",rarity:"RARE",tier:3,price:1250,noiseMultiplier:.9,durability:100,desc:"Improves awareness systems."}
};
function base(){return{owned:["service-pistol"],equipped:{weapon:"service-pistol",backpack:null,armor:null,utility:null},durability:{}}}
function load(){try{const stored=JSON.parse(localStorage.getItem(KEY)||"{}");return{...base(),...stored,equipped:{...base().equipped,...(stored.equipped||{})}}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function owned(){return load().owned}
function buy(id){const g=GEAR[id],p=window.CheegunState?.load?.(),s=load();if(!g)return{ok:false,reason:"UNKNOWN_GEAR"};if(s.owned.includes(id))return{ok:false,reason:"OWNED"};if((p.credits||0)<g.price)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=g.price;s.owned.push(id);s.durability[id]=g.durability;window.CheegunState.save(p);save(s);return{ok:true,gear:g}}
function equip(id){const g=GEAR[id],s=load();if(!g||!s.owned.includes(id))return{ok:false,reason:"NOT_OWNED"};s.equipped[g.slot]=id;save(s);const p=window.CheegunState?.load?.();if(p){p.equipped={...(p.equipped||{}),[g.slot]:id};window.CheegunState.save(p)}return{ok:true,gear:g}}
function unequip(slot){const s=load();s.equipped[slot]=null;save(s);return{ok:true}}
function active(){const s=load();return Object.values(s.equipped).filter(Boolean).map(id=>({id,gear:GEAR[id],durability:s.durability[id]??GEAR[id]?.durability??100})).filter(x=>x.gear)}
function modifiers(){const m={inventoryBonus:0,lootBonus:0,damageReduction:0,noiseMultiplier:1,weaponDamage:0};active().forEach(({gear:g,durability:d})=>{if(d<=0)return;m.inventoryBonus+=g.inventoryBonus||0;m.lootBonus+=g.lootBonus||0;m.damageReduction+=g.damageReduction||0;m.noiseMultiplier*=g.noiseMultiplier||1;if(g.slot==="weapon")m.weaponDamage=Math.max(m.weaponDamage,g.damage||0)});m.damageReduction=Math.min(.75,m.damageReduction);return m}
function damage(id,amount=1){const s=load(),g=GEAR[id];if(!g||!s.owned.includes(id))return null;s.durability[id]=Math.max(0,(s.durability[id]??g.durability)-amount);save(s);return s.durability[id]}
function repair(id){const g=GEAR[id],p=window.CheegunState?.load?.(),s=load();if(!g||!s.owned.includes(id))return{ok:false,reason:"NOT_OWNED"};const cur=s.durability[id]??g.durability,missing=g.durability-cur,infraDiscount=window.CheegunInfrastructure?.bonuses?.().repairDiscount||0,cost=Math.ceil(missing*2*(1-infraDiscount));if(missing<=0)return{ok:false,reason:"FULL_DURABILITY"};if((p.credits||0)<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=cost;s.durability[id]=g.durability;window.CheegunState.save(p);save(s);return{ok:true,cost,durability:g.durability}}
function summary(){const s=load();return{gear:GEAR,state:s,active:active(),modifiers:modifiers()}}
window.CheegunGear={KEY,GEAR,load,save,owned,buy,equip,unequip,active,modifiers,damage,repair,summary};
})();