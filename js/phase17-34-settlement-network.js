(()=>{
"use strict";
/* PHASE 17.34 — MULTIPLE SETTLEMENTS, OUTPOSTS & TERRITORY COLONIZATION */
const KEY="cheegunSettlementNetwork_v1";
const SITES=[
{id:"silverharbour",name:"SILVER HARBOUR CAMP",type:"camp",icon:"🏕",district:"WATERFRONT",cost:180,specialty:"food",desc:"A survivor camp focused on population and food security."},
{id:"intercityworks",name:"INTERCITY WORKS",type:"industrial",icon:"🏭",district:"INDUSTRIAL",cost:240,specialty:"production",desc:"An industrial outpost for salvage processing and credits."},
{id:"northrelay",name:"NORTH RELAY",type:"intel",icon:"📡",district:"NORTHSIDE",cost:210,specialty:"intel",desc:"A communications outpost extending intelligence reach."},
{id:"riverfarm",name:"RIVERSIDE SETTLEMENT",type:"resource",icon:"🌾",district:"RIVERSIDE",cost:260,specialty:"water",desc:"A resource settlement securing food and water production."},
{id:"fortsentinel",name:"FORT SENTINEL",type:"stronghold",icon:"🛡",district:"OUTER",cost:300,specialty:"defense",desc:"A defensive stronghold protecting regional supply routes."}
];
function base(){return{sites:{},active:null,claimed:0,history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function progression(){return window.CheegunProgression?.load?.()}
function build(id){const site=SITES.find(x=>x.id===id),s=load(),p=progression();if(!site||s.sites[id])return{ok:false,reason:site?"ALREADY_CLAIMED":"INVALID_SITE"};if(!p||p.credits<site.cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=site.cost;window.CheegunProgression.save(p);s.sites[id]={level:1,population:1,workers:[],threat:18,production:0,defense:8};s.claimed++;s.active=id;s.history.push({type:"COLONIZED",id,at:Date.now()});save(s);return{ok:true,site}}
function upgrade(id){const s=load(),x=s.sites[id],site=SITES.find(z=>z.id===id),p=progression();if(!x||!site)return{ok:false,reason:"NOT_CLAIMED"};if(x.level>=3)return{ok:false,reason:"MAX_TIER"};const cost=Math.round(site.cost*.6*(x.level+1));if(!p||p.credits<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=cost;window.CheegunProgression.save(p);x.level++;x.population+=2;x.defense+=8;x.threat=Math.max(0,x.threat-5);save(s);return{ok:true,level:x.level,cost}}
function assign(id,survivorId){const s=load(),x=s.sites[id];if(!x)return{ok:false,reason:"NOT_CLAIMED"};x.workers=[...new Set([...x.workers,survivorId])].slice(0,Math.max(2,x.level*3));save(s);return{ok:true}}
function output(site,x){const n=x.workers.length||x.population;const mult=x.level*n;const out={food:0,water:0,medicine:0,credits:0,intel:0,defense:0};if(site.specialty==="food")out.food=mult*2;if(site.specialty==="water")out.water=mult*2;if(site.specialty==="production")out.credits=mult*12;if(site.specialty==="intel")out.intel=Math.max(1,Math.round(mult/2));if(site.specialty==="defense")out.defense=mult*4;return out}
function tick(){const s=load();for(const site of SITES){const x=s.sites[site.id];if(!x)continue;const o=output(site,x);x.production+=(Object.values(o).reduce((a,b)=>a+b,0));const needs=window.CheegunSurvivorNeeds?.load?.();if(needs){needs.stock.food+=o.food;needs.stock.water+=o.water;needs.stock.medicine+=o.medicine;window.CheegunSurvivorNeeds.save(needs)}if(o.credits){const p=progression();p.credits+=o.credits;window.CheegunProgression.save(p)}if(o.intel)for(let i=0;i<o.intel;i++)window.CheegunRecruitment?.generate?.({source:site.name})}save(s);return summary()}
function regionalDefense(){const s=load();return Object.values(s.sites).reduce((n,x)=>n+x.defense,0)}
function summary(){const s=load();return{...s,regionalDefense:regionalDefense(),sites:SITES.map(site=>({site,state:s.sites[site.id]||null,nextUpgrade:s.sites[site.id]?Math.round(site.cost*.6*((s.sites[site.id].level)+1)):site.cost}))}}
window.CheegunSettlementNetwork={KEY,SITES,load,save,build,upgrade,assign,tick,output,regionalDefense,summary};
})();