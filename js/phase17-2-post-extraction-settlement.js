(()=>{
"use strict";
/* PHASE 17.2 — POST-EXTRACTION SETTLEMENT */
const KEY="cheegunLastRaidSettlement_v1";
function inv(){try{return JSON.parse(localStorage.getItem("outbreak_inventory")||"[]")}catch{return[]}}
function settle(exit){
 const S=window.CheegunState;if(!S)return{ok:false,reason:"STATE_UNAVAILABLE"};
 const p=S.load(),all=inv(),starter=["🔪 Kitchen Knife","🩹 Bandage","🪓 Rescue Axe","⚔ Field Machete","🔫 Service Pistol"];
 const loot=all.filter(x=>!starter.includes(x));
 const values={"🗝️ Master Keycard":1200,"💉 Medical Kit":320,"🩸 Trauma Kit":260,"🪓 Rescue Axe":240,"🔧 Crowbar":160,"📡 Emergency Beacon":180,"🔋 Power Cell":140,"🧰 Repair Kit":110,"💊 Painkillers":70,"🩹 Bandage":25,"🥫 Canned Food":18,"💧 Water Bottle":15,"🔦 Flashlight":35};
 const credits=loot.reduce((n,x)=>n+(values[x]||50),0);
 const xp=120+loot.length*50+(exit?.type==="KEYCARD"?150:exit?.type==="TIMED"?75:0);
 const beforeLevel=p.level,beforeXp=p.xp||0;
 p.stats.successfulExtractions=(p.stats.successfulExtractions||0)+1;
 p.stats.lootExtracted=(p.stats.lootExtracted||0)+loot.length;
 p.stats.totalCreditsEarned=(p.stats.totalCreditsEarned||0)+credits;
 p.credits=(p.credits||0)+credits;p.xp=beforeXp+xp;p.level=S.levelFromXp(p.xp);
 p.stash=[...(p.stash||[]),...loot].slice(-80);
 const report={operation:p.lastOperation||"thunder-bay",status:"extracted",exit:exit?.name||"EXTRACTION",exitType:exit?.type||"STANDARD",endedAt:Date.now(),loot,credits,xp,beforeLevel,level:p.level,levelUp:p.level>beforeLevel,stashCount:p.stash.length};
 p.lastRun=report;S.save(p);
 localStorage.setItem("cheegunLastRaidReport",JSON.stringify(report));
 localStorage.setItem(KEY,JSON.stringify(report));
 localStorage.removeItem("outbreak_save");
 return{ok:true,report};
}
window.CheegunSettlement={KEY,settle,last:()=>{try{return JSON.parse(localStorage.getItem(KEY)||"null")}catch{return null}}};
})();