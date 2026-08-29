(()=>{
"use strict";
/* PHASE 17.19 — DYNAMIC DISTRICT EVENTS & EMERGENCIES */
const KEY="cheegunDistrictEvents_v1";
const EVENTS=[
 {id:"distress",icon:"📡",name:"DISTRESS SIGNAL",desc:"Survivors are requesting immediate extraction.",types:["residential","commercial"],severity:2,reward:{control:10,rep:3}},
 {id:"horde",icon:"☣",name:"HORDE MIGRATION",desc:"A large infected concentration is moving through the district.",types:["all"],severity:5,reward:{control:14,rep:2}},
 {id:"fire",icon:"🔥",name:"STRUCTURE FIRE",desc:"Critical supplies are at risk inside a burning building.",types:["commercial","industrial"],severity:4,reward:{control:9,credits:220}},
 {id:"trapped",icon:"👥",name:"SURVIVORS TRAPPED",desc:"Civilians are pinned down and need rescue.",types:["residential","medical"],severity:3,reward:{control:11,rep:4}},
 {id:"convoy",icon:"🚚",name:"SUPPLY CONVOY LOST",desc:"A district supply shipment failed to arrive.",types:["all"],severity:3,reward:{integrity:18,credits:180}},
 {id:"ambush",icon:"⚠",name:"SUPPLY LINE AMBUSH",desc:"Infected activity is disrupting an active route.",types:["all"],severity:4,reward:{integrity:25,control:6}}
];
function base(){return{active:[],resolved:0,failed:0,lastGeneration:0,history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function eligible(){return window.CheegunDistrictControl?.summary?.().districts?.filter(d=>!d.secured||window.CheegunSupplyNetwork?.route?.(d.id))||[]}
function generate(force=false){const s=load(),now=Date.now();if(!force&&s.active.length>=3)return null;if(!force&&now-s.lastGeneration<45000)return null;const ds=eligible();if(!ds.length)return null;const d=ds[Math.floor(Math.random()*ds.length)],route=window.CheegunSupplyNetwork?.route?.(d.id);const candidates=EVENTS.filter(e=>(e.types.includes("all")||e.types.some(t=>d.types?.includes(t)))&&(!["convoy","ambush"].includes(e.id)||route));if(!candidates.length)return null;const e=candidates[Math.floor(Math.random()*candidates.length)];const event={uid:"evt_"+now+"_"+Math.random().toString(36).slice(2,7),...e,districtId:d.id,districtName:d.name,createdAt:now,expiresAt:now+(120000+e.severity*30000),status:"ACTIVE"};s.active.push(event);s.lastGeneration=now;s.history.push({type:"GENERATED",event:event.id,districtId:d.id,at:now});save(s);return event}
function get(uid){return load().active.find(x=>x.uid===uid)||null}
function resolve(uid,{success=true}={}){const s=load(),e=s.active.find(x=>x.uid===uid);if(!e)return{ok:false,reason:"EVENT_NOT_FOUND"};s.active=s.active.filter(x=>x.uid!==uid);e.status=success?"RESOLVED":"FAILED";if(success){s.resolved++;const dc=window.CheegunDistrictControl;if(e.reward.control&&dc){const d=dc.get(e.districtId);const p={id:"event_"+uid,type:d?.types?.[0]||"residential",pos:d?.center||[48.414,-89.245]};for(let i=0;i<Math.ceil(e.reward.control/5);i++)dc.operation(p,{type:"CLEAR"})}if(e.reward.integrity){const sn=window.CheegunSupplyNetwork?.load?.();const r=sn?.routes?.[e.districtId];if(r){r.integrity=Math.min(100,r.integrity+e.reward.integrity);window.CheegunSupplyNetwork.save(sn)}}if(e.reward.credits){const p=window.CheegunState?.load?.();if(p){p.credits=(p.credits||0)+e.reward.credits;window.CheegunState.save(p)}}if(e.reward.rep){window.CheegunFactions?.gain?.("survivors",e.reward.rep,"EMERGENCY_RESPONSE")}}else{s.failed++;if(e.id==="horde")window.CheegunDefense?.raise?.(10,"IGNORED_HORDE");if(["convoy","ambush"].includes(e.id))window.CheegunSupplyNetwork?.damageRoutes?.(20);const d=window.CheegunDistrictControl?.load?.();if(d?.districts?.[e.districtId]){d.districts[e.districtId].infestation=Math.min(100,d.districts[e.districtId].infestation+8);window.CheegunDistrictControl.save(d)}}s.history.push({type:e.status,event:e.id,districtId:e.districtId,at:Date.now()});save(s);return{ok:true,event:e}}
function expire(){const s=load(),now=Date.now();const expired=s.active.filter(e=>e.expiresAt<=now).map(e=>e.uid);for(const id of expired)resolve(id,{success:false});return expired.length}
function tick(){expire();const pressure=window.CheegunOutbreakEvolution?.pressure?.()||0;if(Math.random()<Math.min(.7,.12+pressure/180))return generate();return null}
function summary(){const s=load();return{...s,active:s.active.map(e=>({...e,minutesLeft:Math.max(0,Math.ceil((e.expiresAt-Date.now())/60000)})),catalog:EVENTS}}
window.CheegunDistrictEvents={KEY,EVENTS,load,save,generate,get,resolve,expire,tick,summary};
})();