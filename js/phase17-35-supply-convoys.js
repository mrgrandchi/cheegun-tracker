(()=>{
"use strict";
/* PHASE 17.35 — SUPPLY ROUTES, CONVOYS & REGIONAL LOGISTICS */
const KEY="cheegunSupplyConvoys_v1";
const ROUTES=[
{id:"safehouse_silver",from:"safehouse",to:"silverharbour",name:"FIELD SAFEHOUSE → SILVER HARBOUR",distance:14,cost:18},
{id:"safehouse_intercity",from:"safehouse",to:"intercityworks",name:"FIELD SAFEHOUSE → INTERCITY WORKS",distance:9,cost:14},
{id:"safehouse_relay",from:"safehouse",to:"northrelay",name:"FIELD SAFEHOUSE → NORTH RELAY",distance:18,cost:24},
{id:"safehouse_river",from:"safehouse",to:"riverfarm",name:"FIELD SAFEHOUSE → RIVERSIDE",distance:12,cost:16},
{id:"safehouse_fort",from:"safehouse",to:"fortsentinel",name:"FIELD SAFEHOUSE → FORT SENTINEL",distance:22,cost:28}
];
function base(){return{routes:{},convoys:[],delivered:0,lost:0,ambushes:0,history:[]}}
function load(){try{return{...base(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return base()}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function network(){return window.CheegunSettlementNetwork?.load?.()}
function route(id){return ROUTES.find(r=>r.id===id)}
function openRoute(id){const r=route(id),s=load(),n=network(),p=window.CheegunProgression?.load?.();if(!r||s.routes[id])return{ok:false,reason:r?"ROUTE_ALREADY_OPEN":"INVALID_ROUTE"};if(!n?.sites?.[r.to])return{ok:false,reason:"DESTINATION_NOT_COLONIZED"};if(!p||p.credits<r.cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=r.cost;window.CheegunProgression.save(p);s.routes[id]={condition:100,level:1,security:0};s.history.push({type:"ROUTE_OPENED",id,at:Date.now()});save(s);return{ok:true,route:r}}
function cargoFrom(type,amount){const needs=window.CheegunSurvivorNeeds?.load?.(),p=window.CheegunProgression?.load?.();if(type==="credits"){if(!p||p.credits<amount)return false;p.credits-=amount;window.CheegunProgression.save(p);return true}if(!needs||needs.stock[type]<amount)return false;needs.stock[type]-=amount;window.CheegunSurvivorNeeds.save(needs);return true}
function deliverCargo(type,amount){const needs=window.CheegunSurvivorNeeds?.load?.(),p=window.CheegunProgression?.load?.();if(type==="credits"){p.credits+=amount;window.CheegunProgression.save(p);return}if(needs){needs.stock[type]=(needs.stock[type]||0)+amount;window.CheegunSurvivorNeeds.save(needs)}}
function dispatch(routeId,cargo="food",amount=4,escort=0){const r=route(routeId),s=load(),rs=s.routes[routeId];if(!r||!rs)return{ok:false,reason:"ROUTE_NOT_OPEN"};amount=Math.max(1,Math.min(20,Number(amount)||1));if(!cargoFrom(cargo,amount))return{ok:false,reason:"INSUFFICIENT_CARGO"};const convoy={id:"convoy_"+Date.now(),routeId,cargo,amount,escort:Math.max(0,Number(escort)||0),departedAt:Date.now(),eta:Date.now()+Math.max(30000,r.distance*2200),status:"EN_ROUTE"};s.convoys.push(convoy);s.history.push({type:"DISPATCH",...convoy});save(s);return{ok:true,convoy}}
function resolve(convoy,s){const r=route(convoy.routeId),rs=s.routes[convoy.routeId];const threat=window.CheegunSettlementNetwork?.load?.()?.sites?.[r.to]?.threat||20;const risk=Math.max(5,Math.round((100-rs.condition)*.35+threat*.45-rs.security*6-convoy.escort*8));const ambush=Math.random()*100<risk;if(ambush){s.ambushes++;const survive=Math.random()*100<(45+convoy.escort*12+rs.security*9);if(!survive){convoy.status="LOST";s.lost++;rs.condition=Math.max(0,rs.condition-12);return}convoy.amount=Math.max(1,Math.floor(convoy.amount*.55));rs.condition=Math.max(0,rs.condition-6);convoy.status="DAMAGED"}deliverCargo(convoy.cargo,convoy.amount);if(convoy.status==="EN_ROUTE")convoy.status="DELIVERED";s.delivered++;rs.condition=Math.max(0,rs.condition-2)}
function tick(){const s=load(),now=Date.now();for(const c of s.convoys.filter(x=>x.status==="EN_ROUTE"))if(now>=c.eta)resolve(c,s);save(s);return summary()}
function repair(id){const s=load(),rs=s.routes[id],p=window.CheegunProgression?.load?.(),cost=20;if(!rs)return{ok:false,reason:"ROUTE_NOT_OPEN"};if(!p||p.credits<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=cost;window.CheegunProgression.save(p);rs.condition=Math.min(100,rs.condition+30);save(s);return{ok:true}}
function secure(id){const s=load(),rs=s.routes[id],p=window.CheegunProgression?.load?.(),cost=55;if(!rs)return{ok:false,reason:"ROUTE_NOT_OPEN"};if(!p||p.credits<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};p.credits-=cost;window.CheegunProgression.save(p);rs.security=Math.min(5,rs.security+1);save(s);return{ok:true}}
function summary(){const s=load();return{...s,routesCatalog:ROUTES.map(r=>({route:r,state:s.routes[r.id]||null}))}}
window.CheegunSupplyConvoys={KEY,ROUTES,load,save,openRoute,dispatch,tick,repair,secure,summary};
})();