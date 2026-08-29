(()=>{
"use strict";
/* PHASE 17.3 — CAPACITY, WEIGHT & STASH AUTHORITY */
const ITEM_DATA={
 "🥫 Canned Food":{w:1,v:18},"💧 Water Bottle":{w:1,v:15},"🔪 Kitchen Knife":{w:1,v:20},"🩹 Bandage":{w:.5,v:25},
 "🎒 Backpack":{w:2,v:80},"🔋 Battery":{w:.5,v:30},"🔦 Flashlight":{w:1,v:35},"🔧 Crowbar":{w:3,v:160},
 "🔧 Tool Kit":{w:2,v:70},"💊 Painkillers":{w:.5,v:70},"💉 Medical Kit":{w:2,v:320},"🩸 Trauma Kit":{w:2,v:260},
 "🪓 Rescue Axe":{w:4,v:240},"🩹 Trauma Bandage":{w:.5,v:55},"📻 Radio Battery":{w:.5,v:40},"🔦 Heavy Flashlight":{w:2,v:60},
 "⚙️ Tool Kit":{w:2,v:65},"🧰 Repair Kit":{w:3,v:110},"🔋 Power Cell":{w:2,v:140},"🛠️ Advanced Tool Kit":{w:3,v:250},"🗝️ Master Keycard":{w:.1,v:1200}
};
function item(name){return ITEM_DATA[name]||{w:1,v:50}}
function inv(){try{return JSON.parse(localStorage.getItem("outbreak_inventory")||"[]")}catch{return[]}}
function mods(){return window.CheegunExpeditionEffects?.modifiers?.()||{inventoryBonus:0,stashBonus:0}}
function capacity(){return 8+(mods().inventoryBonus||0)}
function weight(a=inv()){return Math.round(a.reduce((n,x)=>n+item(x).w,0)*10)/10}
function stashCapacity(){return 80+(mods().stashBonus||0)}
function canAdd(name,a=inv()){const next=[...a,name];return{ok:next.length<=capacity(),reason:next.length>capacity()?"CAPACITY_FULL":null,count:next.length,capacity:capacity(),weight:weight(next)}}
function add(name){const a=inv(),r=canAdd(name,a);if(!r.ok)return r;a.push(name);localStorage.setItem("outbreak_inventory",JSON.stringify(a));return{...r,ok:true,inventory:a}}
function drop(index){const a=inv();if(index<0||index>=a.length)return{ok:false,reason:"INVALID_ITEM"};const [removed]=a.splice(index,1);localStorage.setItem("outbreak_inventory",JSON.stringify(a));return{ok:true,removed,inventory:a}}
function stashTransfer(items){const S=window.CheegunState;if(!S)return{ok:false,reason:"STATE_UNAVAILABLE"};const p=S.load(),cap=stashCapacity(),room=Math.max(0,cap-(p.stash||[]).length),accepted=items.slice(0,room),overflow=items.slice(room);p.stash=[...(p.stash||[]),...accepted];S.save(p);return{ok:true,accepted,overflow,capacity:cap}}
window.CheegunInventoryAuthority={ITEM_DATA,item,inv,capacity,weight,stashCapacity,canAdd,add,drop,stashTransfer};
})();