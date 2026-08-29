(()=>{
"use strict";
/* PHASE 17.7 — WEAPON COMBAT & DURABILITY INTEGRATION */
const KEY="cheegunCombatRuntime_v1";
function state(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}}
function save(s){localStorage.setItem(KEY,JSON.stringify(s));return s}
function weapon(){const x=window.CheegunGear?.active?.().find(x=>x.gear.slot==="weapon");return x||null}
function ammo(){const s=state();return s.ammo??24}
function setAmmo(n){const s=state();s.ammo=Math.max(0,n);save(s);return s.ammo}
function loadAmmo(){const s=state();if(s.ammo==null){s.ammo=24;save(s)}return s.ammo}
function attack({targetHealth=100}={}){
 const w=weapon();if(!w)return{ok:false,reason:"NO_WEAPON"};
 if(w.durability<=0)return{ok:false,reason:"WEAPON_BROKEN",weapon:w};
 const firearm=w.gear.id==="service-pistol";let a=loadAmmo();
 if(firearm&&a<=0)return{ok:false,reason:"NO_AMMO",weapon:w};
 const damage=w.gear.damage||8,noise=(firearm?82:28)*(w.gear.noise||1)*(window.cheegunExpeditionMods?.noiseMultiplier||1);
 if(firearm)setAmmo(a-1);
 const wear=firearm?1:2;const durability=window.CheegunGear.damage(w.id,wear);
 if(typeof window.emitNoise==="function")window.emitNoise(noise,"COMBAT • "+w.gear.name);
 return{ok:true,weapon:w.gear,damage,noise,ammo:firearm?ammo():a,durability,targetHealth:Math.max(0,targetHealth-damage),killed:targetHealth-damage<=0};
}
function applyArmorWear(amount){const a=window.CheegunGear?.active?.().find(x=>x.gear.slot==="armor");if(!a)return null;return window.CheegunGear.damage(a.id,Math.max(1,Math.ceil(amount/8)))}
function reload(amount=24){const w=weapon();if(!w||w.gear.id!=="service-pistol")return{ok:false,reason:"NO_FIREARM"};const s=state(),reserve=s.reserveAmmo??0;if(reserve<=0)return{ok:false,reason:"NO_RESERVE_AMMO"};const used=Math.min(amount,reserve);s.reserveAmmo-=used;s.ammo=(s.ammo??0)+used;save(s);return{ok:true,ammo:s.ammo,reserve:s.reserveAmmo}}
function addAmmo(n){const s=state();s.reserveAmmo=(s.reserveAmmo??0)+n;save(s);return s.reserveAmmo}
window.CheegunCombatEquipment={KEY,state,weapon,ammo,setAmmo,loadAmmo,attack,applyArmorWear,reload,addAmmo};
})();