(()=>{
"use strict";
/* PHASE 17.10 — DYNAMIC CONTRACTS & EXPEDITION OBJECTIVES */
const KEY="cheegunContracts_v1";
const CONTRACTS=[
 {type:"medical",icon:"✚",name:"MEDICAL RUN",desc:"Recover medical supplies from a high-risk location.",targetTypes:["medical"],difficulty:2,credits:420,xp:280,rep:2,bonus:"Medical Cache"},
 {type:"signal",icon:"📡",name:"SIGNAL RECOVERY",desc:"Reach emergency infrastructure and recover communications equipment.",targetTypes:["emergency"],difficulty:3,credits:650,xp:420,rep:3,bonus:"Distress Intel"},
 {type:"salvage",icon:"⚙",name:"SALVAGE OPERATION",desc:"Secure valuable industrial equipment.",targetTypes:["industrial","vehicle"],difficulty:2,credits:500,xp:340,rep:2,bonus:"Rare Parts"},
 {type:"supply",icon:"📦",name:"SUPPLY RECOVERY",desc:"Recover essential provisions from commercial zones.",targetTypes:["commercial","residential"],difficulty:1,credits:300,xp:220,rep:1,bonus:"Supply Crate"},
 {type:"clear",icon:"⚔",name:"THREAT CLEARANCE",desc:"Neutralize a dangerous infected concentration.",targetTypes:["emergency","industrial"],difficulty:4,credits:850,xp:560,rep:4,bonus:"Combat Cache"}
];
function base(){return{board:null,active:null,completed:[],failed:[],rep:0,lastRefresh:0}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function generate(seed=Date.now()){const pool=[...CONTRACTS].sort(()=>Math.random()-.5).slice(0,3).map((c,i)=>({...c,id:c.type+"-"+seed+"-"+i,status:"AVAILABLE",expires:seed+86400000}));const s=load();s.board=pool;s.lastRefresh=seed;save(s);return pool}
function board(){const s=load();if(!s.board||!s.board.length||Date.now()-s.lastRefresh>86400000)return generate();return s.board}
function accept(id){const s=load(),c=board().find(x=>x.id===id);if(!c)return{ok:false,reason:"CONTRACT_NOT_FOUND"};if(s.active)return{ok:false,reason:"ACTIVE_CONTRACT_EXISTS"};s.active={...c,status:"ACTIVE",acceptedAt:Date.now(),progress:0,targetId:null};save(s);return{ok:true,contract:s.active}}
function bindTarget(buildings=[]){const s=load();if(!s.active)return null;const candidates=buildings.filter(b=>s.active.targetTypes.includes(b.type));if(!candidates.length)return null;const target=candidates.sort((a,b)=>(b.danger||0)-(a.danger||0))[0];s.active.targetId=target.id;save(s);return target}
function active(){return load().active}
function complete({reason="OBJECTIVE_COMPLETE"}={}){const s=load(),c=s.active;if(!c)return{ok:false,reason:"NO_ACTIVE_CONTRACT"};const p=window.CheegunState?.load?.();if(p){p.credits=(p.credits||0)+c.credits;p.xp=(p.xp||0)+c.xp;p.traderRep=(p.traderRep||0)+c.rep;window.CheegunState.save(p)}s.rep+=c.rep;s.completed.push({...c,status:"COMPLETE",completedAt:Date.now(),reason});s.active=null;save(s);return{ok:true,contract:c,rewards:{credits:c.credits,xp:c.xp,rep:c.rep}}}
function fail(reason="EXPEDITION_FAILED"){const s=load();if(!s.active)return{ok:false,reason:"NO_ACTIVE_CONTRACT"};s.failed.push({...s.active,status:"FAILED",failedAt:Date.now(),reason});s.active=null;save(s);return{ok:true}}
function summary(){const s=load();return{...s,board:board(),completedCount:s.completed.length,failedCount:s.failed.length}}
window.CheegunContracts={KEY,CONTRACTS,load,save,generate,board,accept,bindTarget,active,complete,fail,summary};
})();