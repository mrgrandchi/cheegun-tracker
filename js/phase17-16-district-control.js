(()=>{
"use strict";
/* PHASE 17.16 — DISTRICT CONTROL, INFESTATION & LIBERATION */
const KEY="cheegunDistrictControl_v1";
const DISTRICTS=[
 {id:"downtown",icon:"▦",name:"DOWNTOWN",center:[48.414,-89.246],types:["commercial","emergency"],base:48},
 {id:"waterfront",icon:"≈",name:"WATERFRONT",center:[48.412,-89.238],types:["commercial","vehicle"],base:34},
 {id:"northside",icon:"⚙",name:"NORTH INDUSTRIAL",center:[48.421,-89.258],types:["industrial"],base:58},
 {id:"riverside",icon:"⌂",name:"RIVERSIDE",center:[48.418,-89.240],types:["residential"],base:38},
 {id:"medical",icon:"✚",name:"MEDICAL DISTRICT",center:[48.411,-89.249],types:["medical","emergency"],base:52}
];
function base(){return{districts:Object.fromEntries(DISTRICTS.map(d=>[d.id,{infestation:d.base,control:0,secured:false,operations:0,liberatedAt:null}])),history:[]}}
function load(){try{const s={...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")};for(const d of DISTRICTS)s.districts[d.id]={...base().districts[d.id],...(s.districts[d.id]||{})};return s}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function get(id){const d=DISTRICTS.find(x=>x.id===id);const s=load();return d?{...d,...s.districts[id]}:null}
function districtForPOI(p){if(!p)return null;const candidates=DISTRICTS.filter(d=>d.types.includes(p.type));if(!candidates.length)return DISTRICTS[0];return candidates.reduce((a,b)=>Math.hypot(a.center[0]-p.pos[0],a.center[1]-p.pos[1])<Math.hypot(b.center[0]-p.pos[0],b.center[1]-p.pos[1])?a:b)}
function statusOf(x){if(x.secured)return"SECURED";if(x.infestation>=75)return"OVERRUN";if(x.infestation>=45)return"INFESTED";if(x.control>=40)return"CONTESTED";return"UNSTABLE"}
function operation(p,{type="SEARCH"}={}){const d=districtForPOI(p);if(!d)return null;const s=load(),x=s.districts[d.id];const outbreak=window.CheegunOutbreakEvolution?.status?.();const mult=outbreak?.stage?.spawn||1;const gain=Math.max(3,Math.round((type==="CLEAR"?12:type==="CONTRACT"?9:5)/mult));x.operations++;x.control=Math.min(100,x.control+gain);x.infestation=Math.max(0,x.infestation-gain*1.35);if(x.infestation<=12&&x.control>=55&&!x.secured){x.secured=true;x.liberatedAt=Date.now();window.CheegunFactions?.gain?.("survivors",3,"DISTRICT_LIBERATED");window.CheegunFactions?.gain?.("security",2,"DISTRICT_LIBERATED")}s.history.push({district:d.id,type,gain,at:Date.now()});save(s);return{district:get(d.id),liberated:x.secured&&x.liberatedAt===s.history.at(-1).at}}
function decay(){const s=load(),pressure=window.CheegunOutbreakEvolution?.pressure?.()||0;for(const d of DISTRICTS){const x=s.districts[d.id];if(x.secured)continue;const rise=Math.max(1,Math.round(pressure/40));x.infestation=Math.min(100,x.infestation+rise)}save(s);return summary()}
function summary(){const s=load();const districts=DISTRICTS.map(d=>{const x=s.districts[d.id];return{...d,...x,status:statusOf(x)}});return{districts,liberated:districts.filter(d=>d.secured).length,total:DISTRICTS.length,history:s.history.slice(-20)}}
window.CheegunDistrictControl={KEY,DISTRICTS,load,save,get,districtForPOI,statusOf,operation,decay,summary};
})();