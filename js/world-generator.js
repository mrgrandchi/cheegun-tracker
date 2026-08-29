(()=>{
"use strict";

/**
 * PHASE 16B — CHEEGUN WORLD GENERATOR
 * Converts OpenStreetMap/Overpass features into normalized tactical game data.
 * Safe fallback: existing hand-authored map remains active if remote data fails.
 */
const DEFAULT={id:"thunder-bay",name:"THUNDER BAY",center:[48.414,-89.245],radius:3500};
const cacheKey=id=>"cheegun_world_"+id+"_v1";

function classify(tags={}){
 const natural=tags.natural, landuse=tags.landuse, highway=tags.highway, building=tags.building, amenity=tags.amenity;
 if(natural==="water"||natural==="bay"||tags.waterway) return "water";
 if(natural==="wood"||landuse==="forest") return "forest";
 if(highway) return "road";
 if(building||amenity) return "building";
 if(landuse==="residential") return "residential";
 if(landuse==="industrial") return "industrial";
 return "other";
}
function points(e){
 if(Array.isArray(e.geometry)) return e.geometry.map(p=>[p.lat,p.lon]);
 if(typeof e.lat==="number") return [[e.lat,e.lon]];
 return [];
}
function threat(tags,type){
 if(type==="water")return 0;
 if(tags.amenity==="hospital")return 5;
 if(tags.amenity==="police")return 4;
 if(tags.industrial||tags.landuse==="industrial")return 3;
 if(type==="forest")return 3;
 if(type==="building")return 2;
 return 1;
}
function loot(tags,type){
 if(tags.amenity==="hospital")return "medical";
 if(tags.amenity==="police")return "tactical";
 if(tags.shop==="supermarket"||tags.amenity==="fuel")return "supplies";
 if(type==="industrial")return "industrial";
 if(type==="residential"||type==="building")return "civilian";
 return "none";
}
function normalize(elements){
 return elements.map((e,i)=>{
  const tags=e.tags||{}, type=classify(tags), geometry=points(e);
  if(!geometry.length)return null;
  return {id:"osm-"+(e.type||"x")+"-"+e.id+"-"+i,type,name:tags.name||tags.amenity||tags.building||tags.highway||"UNNAMED",tags,geometry,threat:threat(tags,type),loot:loot(tags,type)};
 }).filter(Boolean);
}
function query(region){
 const [lat,lon]=region.center, r=region.radius;
 return `[out:json][timeout:25];(
 way(around:${r},${lat},${lon})["highway"];
 way(around:${r},${lat},${lon})["building"];
 relation(around:${r},${lat},${lon})["building"];
 way(around:${r},${lat},${lon})["natural"="water"];
 way(around:${r},${lat},${lon})["waterway"];
 way(around:${r},${lat},${lon})["natural"="wood"];
 way(around:${r},${lat},${lon})["landuse"~"forest|residential|industrial"];
 node(around:${r},${lat},${lon})["amenity"];
);out geom;`;
}

function fallbackWorld(region=DEFAULT,reason="REMOTE_UNAVAILABLE"){
 const [lat,lng]=region.center;
 const f=(id,type,name,tags,geometry)=>({id:"fallback-"+id,type,name,tags,geometry,threat:threat(tags,type),loot:loot(tags,type)});
 const features=[
  f("road-1","road","Thunder Bay Corridor",{highway:"primary"},[[lat-.010,lng-.015],[lat-.004,lng-.006],[lat,lng],[lat+.006,lng+.008]]),
  f("road-2","road","Intercity Route",{highway:"secondary"},[[lat-.006,lng+.010],[lat-.002,lng+.004],[lat+.004,lng-.004],[lat+.010,lng-.012]]),
  f("road-3","road","North Link",{highway:"tertiary"},[[lat-.012,lng-.004],[lat-.004,lng-.001],[lat+.004,lng+.002],[lat+.012,lng+.006]]),
  f("medical","building","Medical District",{amenity:"hospital"},[[lat-.004,lng+.003],[lat-.004,lng+.005],[lat-.002,lng+.005],[lat-.002,lng+.003]]),
  f("industrial","building","Industrial Works",{building:"industrial",landuse:"industrial"},[[lat+.003,lng-.008],[lat+.003,lng-.005],[lat+.006,lng-.005],[lat+.006,lng-.008]]),
  f("supplies","building","Supply Centre",{shop:"supermarket",building:"commercial"},[[lat,lng-.004],[lat,lng-.001],[lat+.002,lng-.001],[lat+.002,lng-.004]]),
  f("water","water","Water Barrier",{natural:"water"},[[lat-.014,lng+.014],[lat+.014,lng+.014],[lat+.014,lng+.019],[lat-.014,lng+.019]]),
  f("forest","forest","Northern Forest",{natural:"wood"},[[lat+.007,lng-.014],[lat+.013,lng-.010],[lat+.010,lng-.004],[lat+.005,lng-.009]])
 ];
 const world={version:1,region,generatedAt:Date.now(),source:"Built-in Thunder Bay fallback geometry",fallback:true,reason,features};
 try{localStorage.setItem(cacheKey(region.id),JSON.stringify(world))}catch{}
 document.dispatchEvent(new CustomEvent("cheegunWorldGenerated",{detail:world}));
 return world;
}

async function load(region=DEFAULT,{force=false}={}){
 const key=cacheKey(region.id);
 if(!force){try{const c=JSON.parse(localStorage.getItem(key)||"null");if(c?.features?.length)return c}catch{}}
 const body=query(region);
 const endpoints=["https://overpass-api.de/api/interpreter","https://overpass.kumi.systems/api/interpreter"];
 let last;
 for(const endpoint of endpoints){
  try{
   const res=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"text/plain;charset=UTF-8"},body});
   if(!res.ok)throw new Error("HTTP "+res.status);
   const json=await res.json();
   const world={version:1,region,generatedAt:Date.now(),source:"OpenStreetMap via Overpass",features:normalize(json.elements||[])};
   localStorage.setItem(key,JSON.stringify(world));
   document.dispatchEvent(new CustomEvent("cheegunWorldGenerated",{detail:world}));
   return world;
  }catch(err){last=err}
 }
 console.warn("[CHEEGUN WORLD] Remote Overpass unavailable; using built-in Thunder Bay fallback.",last);
 return fallbackWorld(region,String(last?.message||"REMOTE_UNAVAILABLE"));
}
function summary(world){
 const s={total:world.features.length,roads:0,buildings:0,water:0,forest:0,residential:0,industrial:0};
 world.features.forEach(f=>{if(f.type==="road")s.roads++;else if(f.type==="building")s.buildings++;else if(f.type==="water")s.water++;else if(f.type==="forest")s.forest++;else if(f.type==="residential")s.residential++;else if(f.type==="industrial")s.industrial++});
 return s;
}
window.CheegunWorldGenerator={DEFAULT,load,normalize,summary,cacheKey,fallbackWorld};
})();