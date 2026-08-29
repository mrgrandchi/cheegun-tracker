(()=>{
"use strict";
/* PHASE 17.4 — DYNAMIC TRADER ECONOMY */
const KEY="cheegunTraderEconomy_v1",DAY=86400000;
const BASE={premium:1,scarcity:1,discount:1};
function day(){return Math.floor(Date.now()/DAY)}
function load(){try{const x=JSON.parse(localStorage.getItem(KEY)||"{}");return x.day===day()?x:rotate()}catch{return rotate()}}
function save(x){localStorage.setItem(KEY,JSON.stringify(x));return x}
function rng(seed){let x=Math.sin(seed)*10000;return x-Math.floor(x)}
function rotate(){const seed=day(),stock={};Object.keys(window.CheegunProgression?.ITEMS||{}).forEach((id,i)=>{const r=rng(seed*17+i*31);stock[id]={available:r>.16,quantity:r>.78?1:r>.42?2:4,scarcity:+(0.85+r*.55).toFixed(2),premium:+(0.9+r*.35).toFixed(2)}});return save({day:seed,stock,rep:0,lastSaleDay:null,history:[]})}
function reputation(){return window.CheegunProgression?.load?.().traderRep||0}
function repDiscount(){return Math.min(.15,reputation()*.01)}
function price(id,{mode="buy"}={}){const item=window.CheegunProgression?.ITEMS?.[id];if(!item)return null;const e=load(),s=e.stock[id]||BASE;const mult=s.scarcity*(1-repDiscount());return Math.max(1,Math.round(item.price*mult*(mode==="sell"?.48:1)))}
function canBuy(id){const e=load(),s=e.stock[id];return s?.available&&s.quantity>0}
function buy(id){if(!canBuy(id))return{ok:false,reason:"OUT_OF_STOCK"};const item=window.CheegunProgression.ITEMS[id],p=window.CheegunProgression.profile?.()||window.CheegunState.load(),cost=price(id);if((p.credits||0)<cost)return{ok:false,reason:"INSUFFICIENT_CREDITS"};const s=window.CheegunProgression.load();if(s.purchases.includes(id)&&item.type!=="consumable")return{ok:false,reason:"OWNED"};p.credits-=cost;if(item.type==="backpack"){p.ownedGear=[...(p.ownedGear||[]),id];p.equipped.backpack=id}else if(item.type==="armor"){p.ownedGear=[...(p.ownedGear||[]),id];p.equipped.armor=id}else if(item.type==="consumable")s.supplies.push(id);else p.ownedGear=[...(p.ownedGear||[]),id];s.purchases.push(id);s.totalSpent+=cost;window.CheegunState.save(p);window.CheegunProgression.save(s);const e=load();e.stock[id].quantity--;e.history.push({type:"buy",id,cost,at:Date.now()});save(e);return{ok:true,item,cost,remaining:e.stock[id].quantity}}
function sellItem(raw,index){const p=window.CheegunState.load();if(!p.stash?.length)return{ok:false,reason:"NO_STASH"};if(index<0||index>=p.stash.length)return{ok:false,reason:"INVALID_ITEM"};const item=p.stash[index],data=window.CheegunInventoryAuthority?.item(item)||{v:50};const e=load();const r=Math.min(1.25,.5+reputation()*.015);const value=Math.max(1,Math.round(data.v*r*(.9+rng(day()+index)*.2)));p.stash.splice(index,1);p.credits=(p.credits||0)+value;p.stats.totalCreditsEarned=(p.stats.totalCreditsEarned||0)+value;window.CheegunState.save(p);e.history.push({type:"sell",item,value,at:Date.now()});save(e);gainRep(1);return{ok:true,item,value}}
function gainRep(n){const s=window.CheegunProgression.load();s.traderRep=Math.min(15,(s.traderRep||0)+n);window.CheegunProgression.save(s);return s.traderRep}
function summary(){const e=load();return{day:e.day,stock:e.stock,rep:reputation(),discount:Math.round(repDiscount()*100),history:e.history.slice(-8),nextRotation:(e.day+1)*DAY,price,canBuy}}
window.CheegunTraderEconomy={KEY,load,rotate,price,canBuy,buy,sellItem,gainRep,summary};
})();