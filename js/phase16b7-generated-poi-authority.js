(()=>{
"use strict";
/**
 * PHASE 16B.7 — GENERATED POI AUTHORITY
 * Promotes generated real-world buildings/amenities into discoverable,
 * searchable gameplay POIs while preserving prototype buildings as fallback.
 */
const CFG={discoverRadius:95,interactRadius:38,maxVisible:220};
const state={enabled:false,discovered:new Set(),searched:new Set(),markers:null,lastPoi:null,stats:{discovered:0,searched:0,rendered:0}};

function bridge(){return window.CheegunGeneratedGameplayBridge}
function tactical(){return window.cheegunGeneratedGameplay}
function distance(a,b){
 const x=(a.lat??a[0])-(b.lat??b[0]),y=(a.lng??a[1])-(b.lng??b[1]);
 return Math.hypot(x,y)*111000;
}
function classifyLoot(poi){
 const type=poi.type||"unknown";
 const table={
  medical:{category:"medical",items:["medkit","bandage","painkillers"],risk:5},
  security:{category:"tactical",items:["ammo","armor","radio"],risk:4},
  supplies:{category:"supplies",items:["food","water","tools"],risk:3},
  industrial:{category:"industrial",items:["tools","scrap","fuel"],risk:3},
  residential:{category:"civilian",items:["food","clothing","household"],risk:2},
  unknown:{category:"mixed",items:["scrap","food"],risk:2}
 };
 return table[type]||table.unknown;
}
function nearby(position,radius=CFG.discoverRadius){
 if(!state.enabled)return [];
 return (tactical()?.pois||[]).filter(p=>distance(position,p.position)<=radius);
}
function discover(position){
 if(!state.enabled)return [];
 const hits=nearby(position);
 const fresh=[];
 for(const poi of hits){
  if(!state.discovered.has(poi.id)){
   state.discovered.add(poi.id);fresh.push(poi);
   document.dispatchEvent(new CustomEvent("cheegunPoiDiscovered",{detail:{poi,loot:classifyLoot(poi)}}));
  }
 }
 state.stats.discovered=state.discovered.size;
 return fresh;
}
function nearest(position,radius=CFG.interactRadius){
 if(!state.enabled)return null;
 let best=null,bestD=radius;
 for(const poi of tactical()?.pois||[]){
  const d=distance(position,poi.position);
  if(d<bestD){best=poi;bestD=d}
 }
 return best;
}
function canSearch(position){
 const poi=nearest(position);return !!poi&&!state.searched.has(poi.id);
}
function search(position){
 const poi=nearest(position);
 if(!poi)return {ok:false,reason:"NO_POI"};
 if(state.searched.has(poi.id))return {ok:false,reason:"ALREADY_SEARCHED",poi};
 state.searched.add(poi.id);state.lastPoi=poi;state.stats.searched=state.searched.size;
 const loot=classifyLoot(poi);
 const result={ok:true,poi,loot};
 document.dispatchEvent(new CustomEvent("cheegunGeneratedPoiSearched",{detail:result}));
 return result;
}
function render(map=window.cheegunMap){
 if(!state.enabled||!window.L||!map)return null;
 clear(map);
 const layer=L.layerGroup().addTo(map);state.markers=layer;
 for(const poi of (tactical()?.pois||[]).slice(0,CFG.maxVisible)){
  if(!state.discovered.has(poi.id))continue;
  const searched=state.searched.has(poi.id);
  L.circleMarker(poi.position,{radius:searched?3:5,weight:1,opacity:.9,fillOpacity:searched?.2:.65})
   .bindTooltip((searched?"SEARCHED • ":"")+poi.name+" • "+classifyLoot(poi).category)
   .addTo(layer);state.stats.rendered++;
 }
 return layer;
}
function clear(map=window.cheegunMap){if(state.markers&&map)map.removeLayer(state.markers);state.markers=null}
function update(position,map=window.cheegunMap){
 const found=discover(position);if(found.length)render(map);
 return {found,nearest:nearest(position),canSearch:canSearch(position)};
}
function enable(){
 if(!tactical()){console.warn("[CHEEGUN 16B.7] Tactical POIs unavailable");return false}
 bridge()?.enable("generatedPois");state.enabled=true;
 document.dispatchEvent(new CustomEvent("cheegunPoiAuthorityEnabled",{detail:{state}}));
 return true;
}
function disable(){bridge()?.disable("generatedPois");clear();state.enabled=false;return true}
window.CheegunPoiAuthority={CFG,state,classifyLoot,nearby,discover,nearest,canSearch,search,render,clear,update,enable,disable};
console.info("[CHEEGUN 16B.7] Generated POI authority ready; explicit enable required.");
})();