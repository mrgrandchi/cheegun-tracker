(()=>{
"use strict";
/* PHASE 17.36 — TERRITORY MAP, HORDE MIGRATION & REGIONAL THREAT SIMULATION */
const KEY="cheegunRegionalThreat_v1";
const DISTRICTS=[
{id:"waterfront",name:"WATERFRONT",x:22,y:67},
{id:"industrial",name:"INDUSTRIAL",x:48,y:60},
{id:"northside",name:"NORTHSIDE",x:50,y:25},
{id:"riverside",name:"RIVERSIDE",x:72,y:72},
{id:"outer",name:"OUTER CORRIDOR",x:84,y:38}
];
function base(){return{zones:Object.fromEntries(DISTRICTS.map(d=>[d.id,{threat:25,infection:18,control:0,horde:0,lastEvent:0}])),migrations:0,events:[],lastTick:Date.now()}}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"{}");const b=base();for(const d of DISTRICTS)b.zones[d.id]={...b.zones[d.id],...(x.zones?.[d.id]||{})};return{...b,...x,zones:b.zones}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function siteDistrict(){const n=window.CheegunSettlementNetwork?.summary?.();const map={};for(const x of n?.sites||[])if(x.state)map[x.site.district.toLowerCase().replace(/s+/g,"")]=x.state;return map}
function convoyPressure(){const c=window.CheegunSupplyConvoys?.summary?.();const out={};for(const x of c?.routesCatalog||[]){if(!x.state)continue;const id=x.route.to==="silverharbour"?"waterfront":x.route.to==="intercityworks"?"industrial":x.route.to==="northrelay"?"northside":x.route.to==="riverfarm"?"riverside":"outer";out[id]=(out[id]||0)+(100-x.state.condition)*.08-x.state.security*4}return out}
function migrate(s){const from=DISTRICTS.reduce((a,d)=>s.zones[d.id].horde>s.zones[a.id].horde?d:a,DISTRICTS[0]);const choices=DISTRICTS.filter(d=>d.id!==from.id);const to=choices[Math.floor(Math.random()*choices.length)];const amount=Math.max(8,Math.round(s.zones[from.id].horde*.35));s.zones[from.id].horde=Math.max(0,s.zones[from.id].horde-amount);s.zones[to.id].horde=Math.min(100,s.zones[to.id].horde+amount);s.migrations++;const e={type:"HORDE_MIGRATION",from:from.id,to:to.id,amount,at:Date.now()};s.events.push(e);s.events=s.events.slice(-20);return e}
function tick(){const s=load(),now=Date.now();if(now-s.lastTick<60000)return summary();s.lastTick=now;const settled=siteDistrict(),pressure=convoyPressure();for(const d of DISTRICTS){const z=s.zones[d.id],settledHere=settled[d.id];const growth=3+Math.random()*7+(pressure[d.id]||0);z.infection=Math.max(0,Math.min(100,z.infection+growth-(settledHere?settledHere.level*2:0)));z.threat=Math.max(0,Math.min(100,z.threat+growth*.8+(z.horde*.12)-(settledHere?settledHere.defense*.12:0)));z.control=Math.max(0,Math.min(100,z.control+(settledHere?2:0)-z.threat*.015));z.horde=Math.max(0,Math.min(100,z.horde+Math.max(0,z.infection-55)*.08));}let event=null;if(Math.random()<.28)event=migrate(s);save(s);if(event)applyEvent(event);return summary()}
function applyEvent(e){const n=window.CheegunSettlementNetwork?.summary?.();const site={waterfront:"silverharbour",industrial:"intercityworks",northside:"northrelay",riverside:"riverfarm",outer:"fortsentinel"}[e.to];if(n?.sites?.find(x=>x.site.id===site)?.state)window.CheegunSafehouseSieges?.raise?.(Math.round(e.amount*.35),"HORDE MIGRATION")}
function pacify(id,amount=12){const s=load(),z=s.zones[id];if(!z)return{ok:false,reason:"INVALID_ZONE"};z.threat=Math.max(0,z.threat-amount);z.infection=Math.max(0,z.infection-amount*.65);z.control=Math.min(100,z.control+amount*.5);save(s);return{ok:true,zone:z}}
function statusClass(v){return v>=75?"CRITICAL":v>=50?"DANGEROUS":v>=30?"UNSTABLE":"SECURE"}
function summary(){const s=load(),settled=siteDistrict();return{...s,districts:DISTRICTS.map(d=>({...d,...s.zones[d.id],status:statusClass(s.zones[d.id].threat),settled:!!settled[d.id]}))}}
window.CheegunRegionalThreat={KEY,DISTRICTS,load,save,tick,migrate,pacify,summary};
})();