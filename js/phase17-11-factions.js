(()=>{
"use strict";
/* PHASE 17.11 — FACTIONS, REPUTATION & SAFEHOUSE RELATIONSHIPS */
const KEY="cheegunFactions_v1";
const FACTIONS={
 medical:{id:"medical",icon:"✚",name:"LAKEHEAD MEDICAL RELIEF",desc:"Volunteer medics keeping emergency treatment alive.",contracts:["medical"],rewards:"Treatment discounts • medical stock",thresholds:[0,5,15,30]},
 traders:{id:"traders",icon:"◈",name:"NORTHERN TRADE NETWORK",desc:"Scavengers and merchants controlling vital supply routes.",contracts:["salvage","supply"],rewards:"Market discounts • rare gear",thresholds:[0,8,20,40]},
 survivors:{id:"survivors",icon:"◉",name:"THUNDER BAY SURVIVORS",desc:"Civilian groups defending shelters and evacuation routes.",contracts:["rescue","supply"],rewards:"Survivor intel • safehouse support",thresholds:[0,6,18,35]},
 security:{id:"security",icon:"⚔",name:"NORTHERN SECURITY CELL",desc:"Former responders containing infected threats.",contracts:["clear","signal"],rewards:"Combat contracts • weapon access",thresholds:[0,10,25,50]}
};
const RANKS=["UNKNOWN","KNOWN","TRUSTED","ALLIED"];
function base(){return{rep:{medical:0,traders:0,survivors:0,security:0},history:[],relationships:{}}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function factionForContract(type){return Object.values(FACTIONS).filter(f=>f.contracts.includes(type)).map(f=>f.id)}
function rank(id,points=null){const f=FACTIONS[id],p=points??(load().rep[id]||0);let r=0;f.thresholds.forEach((t,i)=>{if(p>=t)r=i});return{index:r,name:RANKS[r],next:f.thresholds[r+1]??null}}
function gain(id,n,reason="ACTION"){const s=load();if(!FACTIONS[id])return null;s.rep[id]=Math.max(0,(s.rep[id]||0)+n);s.history.push({id,n,reason,at:Date.now()});s.history=s.history.slice(-80);save(s);return{points:s.rep[id],rank:rank(id,s.rep[id])}}
function applyContract(contract,outcome="COMPLETE"){if(!contract)return[];const ids=factionForContract(contract.type),amount=outcome==="COMPLETE"?contract.rep||1:-1;return ids.map(id=>({id,...gain(id,amount,outcome+" • "+contract.name)}))}
function modifier(id){const r=rank(id).index;const map={medical:{treatmentDiscount:r*.12,medicalStock:r},traders:{discount:r*.04,rareStock:r},survivors:{intel:r,safehouseRecovery:r*.05},security:{combatCache:r,weaponAccess:r}};return map[id]||{}}
function summary(){const s=load();return{factions:Object.values(FACTIONS).map(f=>({...f,points:s.rep[f.id]||0,rank:rank(f.id),modifier:modifier(f.id)})),history:s.history.slice(-12)}}
window.CheegunFactions={KEY,FACTIONS,load,save,rank,gain,applyContract,factionForContract,modifier,summary};
})();