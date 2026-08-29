(()=>{
"use strict";
/** Leaflet adapter for generated real-world features. */
const LAYERS={};
function style(f){
 if(f.type==="road")return {color:"#77808a",weight:2,opacity:.7};
 if(f.type==="water")return {color:"#356d9c",weight:1,fillColor:"#356d9c",fillOpacity:.35};
 if(f.type==="forest")return {color:"#355f3b",weight:1,fillColor:"#355f3b",fillOpacity:.22};
 if(f.type==="industrial")return {color:"#8a6c42",weight:1,fillOpacity:.12};
 return {color:"#666",weight:1,fillOpacity:.08};
}
function render(world,map){
 if(!window.L||!map||!world)return null;
 clear(map);
 const g=L.layerGroup().addTo(map);LAYERS.generated=g;
 world.features.forEach(f=>{
  if(!f.geometry||f.geometry.length<2)return;
  const opts=style(f);
  if(f.type==="road")L.polyline(f.geometry,opts).bindTooltip(f.name).addTo(g);
  else L.polygon(f.geometry,opts).bindTooltip(f.name+" • THREAT "+f.threat).addTo(g);
 });
 document.dispatchEvent(new CustomEvent("cheegunWorldRendered",{detail:{world,layer:g}}));
 return g;
}
function clear(map){if(LAYERS.generated&&map)map.removeLayer(LAYERS.generated);delete LAYERS.generated}
async function generateAndRender(map,region){
 const world=await window.CheegunWorldGenerator.load(region);
 render(world,map);
 return world;
}
window.CheegunWorldRenderer={render,clear,generateAndRender};
})();