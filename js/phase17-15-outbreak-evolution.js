(()=>{
"use strict";
/* PHASE 17.15 — DYNAMIC OUTBREAK EVOLUTION */
const KEY="cheegunOutbreakEvolution_v1";
const STAGES=[
 {id:"localized",name:"LOCALIZED OUTBREAK",minDay:1,icon:"◌",desc:"Scattered infected incidents. Most districts remain navigable.",threat:0,spawn:1,loot:1},
 {id:"migration",name:"INFECTED MIGRATION",minDay:4,icon:"↟",desc:"Infected begin moving between districts and pressure rises.",threat:12,spawn:1.18,loot:.96},
 {id:"collapse",name:"DISTRICT COLLAPSE",minDay:8,icon:"▰",desc:"Multiple zones become unstable and high-risk.",threat:28,spawn:1.38,loot:.9},
 {id:"horde",name:"HORDE CONDITIONS",minDay:15,icon:"☣",desc:"Large infected concentrations threaten expeditions and the Safehouse.",threat:48,spawn:1.7,loot:.82}
];
function base(){return{day:1,expeditions:0,stageId:"localized",events:[],districts:{},lastAdvance:0}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function stage(day=load().day){return [...STAGES].reverse().find(x=>day>=x.minDay)||STAGES[0]}
function ensure(){const s=load(),st=stage(s.day);if(s.stageId!==st.id){s.stageId=st.id;s.events.push({type:"STAGE_ADVANCE",stage:st.id,day:s.day,at:Date.now()});window.CheegunDefense?.raise?.(st.threat,"OUTBREAK_STAGE_"+st.id.toUpperCase());save(s);return{changed:true,stage:st}}return{changed:false,stage:st}}
function advanceDay(reason="EXPEDITION"){const s=load();s.day++;s.expeditions++;s.lastAdvance=Date.now();save(s);const r=ensure();return{day:load().day,...r,reason}}
function districtRisk(id,baseRisk=1){const s=load(),st=stage(s.day),extra=s.districts[id]||0;return Math.max(1,Math.round((baseRisk+extra)*st.spawn))}
function pressure(){const s=load(),st=stage(s.day);return Math.min(100,(s.day-1)*3+st.threat+(window.CheegunDefense?.status?.().threat||0)*.35)}
function hordeCheck(){const s=load(),st=stage(s.day);if(st.id!=="horde")return null;const chance=Math.min(.55,.12+(s.day-15)*.03);if(Math.random()>chance)return null;const event={type:"HORDE_EVENT",day:s.day,at:Date.now(),force:Math.round(55+Math.random()*40)};s.events.push(event);save(s);window.CheegunDefense?.raise?.(12,"HORDE_MIGRATION");return event}
function status(){const s=load(),st=stage(s.day);return{...s,stage:st,pressure:pressure(),next:STAGES.find(x=>x.minDay>s.day)||null}}
window.CheegunOutbreakEvolution={KEY,STAGES,load,save,stage,ensure,advanceDay,districtRisk,pressure,hordeCheck,status};
})();