(()=>{
"use strict";
/* PHASE 17.1 — EXPEDITION EFFECTS BRIDGE */
const effects={
 "field-medkit":{type:"consumable",use:"heal",amount:45,label:"FIELD MEDKIT • +45 HEALTH"},
 "ration-pack":{type:"consumable",use:"hunger",amount:35,label:"RATION PACK • +35 HUNGER"},
 "water-pack":{type:"consumable",use:"thirst",amount:40,label:"WATER PACK • +40 THIRST"},
 "ammo-cache":{type:"consumable",use:"ammo",amount:24,label:"AMMO CACHE • +24 AMMO"},
 "reinforced-pack":{type:"gear",inventoryBonus:4,label:"REINFORCED PACK • +4 CAPACITY"},
 "survival-rig":{type:"gear",damageReduction:.18,label:"SURVIVAL RIG • 18% DAMAGE REDUCTION"},
 "scavenger":{type:"gear",lootBonus:1,label:"SCAVENGER KIT • +1 LOOT ROLL"},
 "field-training":{type:"perk",staminaBonus:10,label:"FIELD TRAINING • +10 STAMINA"},
 "quiet-step":{type:"perk",noiseMultiplier:.72,label:"QUIET STEP • -28% NOISE"},
 "pack-rat":{type:"perk",stashBonus:2,label:"PACK RAT • +2 STASH CAPACITY"},
 "hard-to-kill":{type:"perk",damageReduction:.12,label:"HARD TO KILL • 12% DAMAGE REDUCTION"}
};
function state(){return window.CheegunProgression?.summary?.()||{profile:window.CheegunState?.load?.(),state:{}}}
function active(){
 const s=state(),p=s.profile||{},x=s.state||{}, ids=[...(x.supplies||[]),...(x.perks||[])];
 if(p.equipped?.backpack)ids.push(p.equipped.backpack);
 if(p.equipped?.armor)ids.push(p.equipped.armor);
 if((p.ownedGear||[]).includes("scavenger"))ids.push("scavenger");
 return ids.map(id=>({id,effect:effects[id]})).filter(x=>x.effect);
}
function modifiers(){
 const m={inventoryBonus:0,stashBonus:0,staminaBonus:0,noiseMultiplier:1,damageReduction:0,lootBonus:0};
 active().forEach(({effect:e})=>{
  m.inventoryBonus+=e.inventoryBonus||0;m.stashBonus+=e.stashBonus||0;m.staminaBonus+=e.staminaBonus||0;
  m.lootBonus+=e.lootBonus||0;m.noiseMultiplier*=e.noiseMultiplier||1;m.damageReduction=Math.min(.75,m.damageReduction+(e.damageReduction||0));
 });return m;
}
function consume(id){
 const s=state(),x=s.state||{},e=effects[id];if(!e||e.type!=="consumable")return{ok:false,reason:"NOT_CONSUMABLE"};
 const i=(x.supplies||[]).indexOf(id);if(i<0)return{ok:false,reason:"NOT_OWNED"};
 x.supplies.splice(i,1);window.CheegunProgression.save(x);return{ok:true,id,effect:e};
}
function expeditionStart(base={stamina:100,inventoryCapacity:8}){
 const m=modifiers();return{...m,stamina:Math.min(100,base.stamina+m.staminaBonus),inventoryCapacity:base.inventoryCapacity+m.inventoryBonus,items:active().map(x=>x.id)};
}
window.CheegunExpeditionEffects={effects,state,active,modifiers,consume,expeditionStart};
})();