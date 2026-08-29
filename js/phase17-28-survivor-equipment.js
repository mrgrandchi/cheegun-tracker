(()=>{
"use strict";
/* PHASE 17.28 — SURVIVOR EQUIPMENT, LOADOUTS & SCARCITY */
const KEY="cheegunSurvivorEquipment_v1";
const ITEMS=[
{id:"medkit",name:"MEDICAL KIT",icon:"💉",type:"medical",cost:70,bonus:{rescue:10,mission:4}},
{id:"bandage",name:"FIELD BANDAGES",icon:"🩹",type:"medical",cost:25,bonus:{rescue:4}},
{id:"rifle",name:"SERVICE RIFLE",icon:"🔫",type:"weapon",cost:120,bonus:{mission:10,defense:8}},
{id:"ammo",name:"AMMUNITION PACK",icon:"📦",type:"ammo",cost:45,bonus:{mission:5}},
{id:"toolkit",name:"FIELD TOOL KIT",icon:"🔧",type:"tool",cost:55,bonus:{repair:12,mission:5}},
{id:"radio",name:"LONG RANGE RADIO",icon:"📻",type:"utility",cost:40,bonus:{mission:6,rescue:3}},
{id:"armor",name:"PROTECTIVE VEST",icon:"🦺",type:"armor",cost:90,bonus:{mission:8,defense:6}}
];
function base(){return{stock:Object.fromEntries(ITEMS.map(x=>[x.id,0])),assigned:{},durability:{},purchased:0,consumed:0,history:[]}}
function load(){try{const x={...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")};x.stock={...base().stock,...(x.stock||{})};return x}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function item(id){return ITEMS.find(x=>x.id===id)}
function credits(){return window.CheegunProgression?.load?.()}
function buy(id){const i=item(id),s=load(),p=credits();if(!i)return{ok:false,reason:"ITEM_NOT_FOUND"};if(!p||p.credits<i.cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=i.cost;window.CheegunProgression.save(p);s.stock[id]=(s.stock[id]||0)+1;s.purchased++;s.history.push({type:"PURCHASE",id,at:Date.now()});save(s);return{ok:true,item:i}}
function assign(survivorId,itemId){const s=load(),i=item(itemId);if(!i||!s.stock[itemId])return{ok:false,reason:"ITEM_UNAVAILABLE"};const old=(s.assigned[survivorId]||[]);if(old.includes(itemId))return{ok:false,reason:"ALREADY_ASSIGNED"};s.stock[itemId]--;s.assigned[survivorId]=[...old,itemId];s.durability[survivorId]=s.durability[survivorId]||{};s.durability[survivorId][itemId]=100;s.history.push({type:"ASSIGN",survivorId,itemId,at:Date.now()});save(s);return{ok:true,item:i}}
function unassign(survivorId,itemId){const s=load(),a=s.assigned[survivorId]||[];if(!a.includes(itemId))return{ok:false,reason:"NOT_ASSIGNED"};s.assigned[survivorId]=a.filter(x=>x!==itemId);s.stock[itemId]=(s.stock[itemId]||0)+1;delete (s.durability[survivorId]||{})[itemId];save(s);return{ok:true}}
function loadout(ids=[]){const s=load(),effects={mission:0,rescue:0,defense:0,repair:0};const equipment=[];for(const id of ids)for(const itemId of s.assigned[id]||[]){const i=item(itemId);if(!i)continue;const dur=s.durability[id]?.[itemId]??100;equipment.push({survivorId:id,item:i,durability:dur});for(const[k,v]of Object.entries(i.bonus))effects[k]=(effects[k]||0)+v*(dur/100)}return{effects,equipment}}
function missionBonus(ids=[]){return loadout(ids).effects.mission||0}
function wear(ids=[],amount=8){const s=load();for(const id of ids)for(const itemId of s.assigned[id]||[]){const d=s.durability[id]?.[itemId];if(d===undefined)continue;s.durability[id][itemId]=Math.max(0,d-amount);if(s.durability[id][itemId]===0){s.assigned[id]=s.assigned[id].filter(x=>x!==itemId);s.consumed++;s.history.push({type:"BROKEN",survivorId:id,itemId,at:Date.now()})}}save(s)}
function scarcity(){const s=load();const total=Object.values(s.stock).reduce((a,b)=>a+b,0);const active=(window.CheegunSettlement?.summary?.().population||[]).filter(x=>x.status==="ACTIVE").length;return{stock:total,active,pressure:active?Math.round(Math.max(0,100-(total/Math.max(1,active*2))*100)):0}}
function summary(){const s=load(),people=(window.CheegunSurvivorProgression?.summary?.().people||[]);return{...s,catalog:ITEMS,people:people.map(p=>({...p,equipment:(s.assigned[p.survivor.id]||[]).map(item)})),scarcity:scarcity()}}
window.CheegunSurvivorEquipment={KEY,ITEMS,load,save,buy,assign,unassign,loadout,missionBonus,wear,scarcity,summary};
})();