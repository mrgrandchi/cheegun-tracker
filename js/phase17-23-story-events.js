(()=>{
"use strict";
/* PHASE 17.23 — SURVIVOR STORY EVENTS & LEADERSHIP DECISIONS */
const KEY="cheegunStoryEvents_v1";
const TEMPLATES=[
 {id:"conflict",icon:"⚡",name:"LOYALTY DIVIDED",trigger:"Two survivors ask Craig to settle a dispute.",choices:[{id:"mediate",label:"MEDIATE THE CONFLICT",morale:4,trust:7,rel:8},{id:"command",label:"ISSUE A COMMAND DECISION",morale:-2,trust:-3,loyalty:5}]},
 {id:"missing",icon:"📻",name:"A VOICE ON THE RADIO",trigger:"A survivor believes they heard news about missing family.",choices:[{id:"search",label:"AUTHORIZE A SEARCH",morale:6,loyalty:10,mission:"recon"},{id:"deny",label:"PROTECT THE COMMUNITY",morale:-4,loyalty:-9,trust:3}]},
 {id:"volunteer",icon:"🛡",name:"DANGEROUS VOLUNTEER",trigger:"A survivor volunteers for a high-risk operation.",choices:[{id:"accept",label:"ACCEPT THE VOLUNTEER",morale:2,loyalty:6,risk:1},{id:"refuse",label:"REFUSE THE RISK",morale:3,loyalty:-3,trust:5}]},
 {id:"promotion",icon:"★",name:"NATURAL LEADER",trigger:"The community recognizes a survivor's leadership.",choices:[{id:"promote",label:"APPOINT AS LIEUTENANT",morale:7,trust:8,loyalty:12},{id:"wait",label:"WAIT AND OBSERVE",morale:0,loyalty:-2,trust:1}]}
];
function base(){return{active:null,resolved:0,history:[],nextAt:0,lieutenants:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function people(){return (window.CheegunSurvivorLegacy?.summary?.().profiles||[])}
function eligible(){return people().filter(x=>x.profile.loyalty>35)}
function generate(force=false){const s=load();if(s.active)return s.active;if(!force&&Date.now()<s.nextAt)return null;const pool=eligible();if(!pool.length)return null;const t=TEMPLATES[Math.floor(Math.random()*TEMPLATES.length)],primary=pool[Math.floor(Math.random()*pool.length)],secondary=t.id==="conflict"?pool.filter(x=>x.id!==primary.id)[Math.floor(Math.random()*Math.max(1,pool.length-1))]:null;const event={uid:"story-"+Date.now(),template:t.id,icon:t.icon,name:t.name,trigger:t.trigger,primary:primary.id,secondary:secondary?.id||null,createdAt:Date.now()};s.active=event;save(s);return event}
function resolve(choiceId){const s=load(),e=s.active;if(!e)return{ok:false,reason:"NO_ACTIVE_EVENT"};const t=TEMPLATES.find(x=>x.id===e.template),c=t?.choices.find(x=>x.id===choiceId);if(!c)return{ok:false,reason:"CHOICE_NOT_FOUND"};const ids=[e.primary,e.secondary].filter(Boolean);for(const id of ids){const p=window.CheegunSurvivorLegacy?.profile?.(id);if(p&&c.loyalty)p.loyalty=Math.max(0,Math.min(100,p.loyalty+c.loyalty))}if(c.morale)window.CheegunSurvivorCommunity?.applyMorale?.(c.morale,"LEADERSHIP_DECISION");const cs=window.CheegunSurvivorCommunity?.load?.();if(cs&&c.trust){cs.communityTrust=Math.max(0,Math.min(100,cs.communityTrust+c.trust));window.CheegunSurvivorCommunity.save(cs)}if(c.rel&&e.secondary)window.CheegunSurvivorCommunity?.changeRelationship?.(e.primary,e.secondary,c.rel);if(t.id==="promotion"&&choiceId==="promote"&&!s.lieutenants.includes(e.primary))s.lieutenants.push(e.primary);s.history.push({event:e,choice:choiceId,at:Date.now()});s.resolved++;s.active=null;s.nextAt=Date.now()+180000;save(s);return{ok:true,event:e,choice:c}}
function tick(){const s=load();if(!s.active&&Date.now()>=s.nextAt&&Math.random()<.16)generate();return summary()}
function summary(){const s=load(),lookup=id=>people().find(x=>x.id===id);return{...s,active:s.active?{...s.active,primaryPerson:lookup(s.active.primary),secondaryPerson:lookup(s.active.secondary)}:null,templates:TEMPLATES,lieutenants:s.lieutenants.map(lookup).filter(Boolean)}}
window.CheegunStoryEvents={KEY,TEMPLATES,load,save,generate,resolve,tick,summary};
})();