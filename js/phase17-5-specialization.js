(()=>{
"use strict";
/* PHASE 17.5 — CHARACTER SPECIALIZATION */
const KEY="cheegunSpecialization_v1";
const TREES={
 scavenger:{name:"SCAVENGER",icon:"🎒",desc:"Loot efficiency and carrying capacity.",nodes:[
  {id:"keen-eye",name:"Keen Eye",cost:1,level:2,desc:"+1 loot roll.",effect:{lootBonus:1}},
  {id:"light-pack",name:"Light Pack",cost:1,level:3,desc:"+2 inventory slots.",effect:{inventoryBonus:2}},
  {id:"valuable-finds",name:"Valuable Finds",cost:2,level:5,desc:"+20% loot value.",effect:{sellBonus:.2}},
  {id:"salvager",name:"Salvager",cost:3,level:8,desc:"+2 loot rolls.",effect:{lootBonus:2}}
 ]},
 fighter:{name:"FIGHTER",icon:"⚔️",desc:"Combat endurance and resilience.",nodes:[
  {id:"steady-hand",name:"Steady Hand",cost:1,level:2,desc:"+10 stamina.",effect:{staminaBonus:10}},
  {id:"iron-will",name:"Iron Will",cost:2,level:4,desc:"8% damage reduction.",effect:{damageReduction:.08}},
  {id:"combat-ready",name:"Combat Ready",cost:2,level:6,desc:"+20 starting stamina.",effect:{staminaBonus:20}},
  {id:"last-stand",name:"Last Stand",cost:3,level:9,desc:"12% damage reduction.",effect:{damageReduction:.12}}
 ]},
 survivalist:{name:"SURVIVALIST",icon:"🌲",desc:"Stealth and resource endurance.",nodes:[
  {id:"trail-sense",name:"Trail Sense",cost:1,level:2,desc:"-10% noise.",effect:{noiseMultiplier:.9}},
  {id:"rationing",name:"Rationing",cost:1,level:3,desc:"Improved resource conservation.",effect:{resourceBonus:.15}},
  {id:"ghost-step",name:"Ghost Step",cost:2,level:6,desc:"-20% noise.",effect:{noiseMultiplier:.8}},
  {id:"fieldcraft",name:"Fieldcraft",cost:3,level:9,desc:"+15 starting stamina.",effect:{staminaBonus:15}}
 ]},
 leader:{name:"LEADER",icon:"🪶",desc:"Progression, trade and future survivor systems.",nodes:[
  {id:"negotiator",name:"Negotiator",cost:1,level:3,desc:"+5% trader discount.",effect:{discountBonus:.05}},
  {id:"quartermaster",name:"Quartermaster",cost:2,level:5,desc:"+5 stash slots.",effect:{stashBonus:5}},
  {id:"influence",name:"Influence",cost:2,level:7,desc:"+25% trader reputation gains.",effect:{repBonus:.25}},
  {id:"commander",name:"Commander",cost:3,level:10,desc:"Unlocks future survivor leadership bonuses.",effect:{leadership:true}}
 ]}
};
function base(){return{points:0,claimed:0,unlocked:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(v){localStorage.setItem(KEY,JSON.stringify(v));return v}
function profile(){return window.CheegunState?.load?.()||{level:1}}
function availableEarned(){return Math.max(0,Math.floor((profile().level-1)/1))}
function refreshPoints(){const s=load(),earned=availableEarned(),spent=s.unlocked.reduce((n,id)=>n+(find(id)?.cost||0),0);s.points=Math.max(0,earned-spent);s.claimed=earned;save(s);return s}
function find(id){for(const [tree,t] of Object.entries(TREES)){const node=t.nodes.find(n=>n.id===id);if(node)return{...node,tree}}return null}
function unlock(id){const s=refreshPoints(),n=find(id),p=profile();if(!n)return{ok:false,reason:"UNKNOWN_NODE"};if(s.unlocked.includes(id))return{ok:false,reason:"UNLOCKED"};if(p.level<n.level)return{ok:false,reason:"REQUIRES_LEVEL_"+n.level};if(s.points<n.cost)return{ok:false,reason:"INSUFFICIENT_SKILL_POINTS"};s.points-=n.cost;s.unlocked.push(id);save(s);return{ok:true,node:n,points:s.points}}
function modifiers(){const m={inventoryBonus:0,lootBonus:0,staminaBonus:0,noiseMultiplier:1,damageReduction:0,stashBonus:0,sellBonus:0,discountBonus:0,repBonus:0,leadership:false,resourceBonus:0};load().unlocked.map(find).filter(Boolean).forEach(n=>{for(const[k,v]of Object.entries(n.effect)){if(k==="noiseMultiplier")m[k]*=v;else if(k==="leadership")m[k]=v;else m[k]=(m[k]||0)+v}});return m}
function summary(){const s=refreshPoints();return{trees:TREES,state:s,profile:profile(),modifiers:modifiers()}}
window.CheegunSpecialization={KEY,TREES,load,save,find,unlock,modifiers,summary};
})();