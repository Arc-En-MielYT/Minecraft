import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = 'src/main/resources';
const mod = 'mineralia';
const write = (name, data) => {
  const file = path.join(root, name); fs.mkdirSync(path.dirname(file), {recursive:true});
  fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data, null, 2) + '\n');
};
const ores = [
  {id:'tin', raw:'raw_tin', stone:[140,151,158], deep:[83,91,102], chance:9, size:9, y0:-16, y1:64},
  {id:'silver', raw:'raw_silver', stone:[205,211,220], deep:[151,158,173], chance:6, size:7, y0:-48, y1:32},
  {id:'ruby', raw:'ruby', stone:[204,45,62], deep:[151,34,54], chance:3, size:5, y0:-64, y1:16},
  {id:'sapphire', raw:'sapphire', stone:[50,123,218], deep:[38,82,158], chance:3, size:5, y0:-64, y1:16}
];

function crc32(buf) { let c=~0; for (const b of buf) { c^=b; for(let k=0;k<8;k++) c=(c>>>1)^((c&1)?0xedb88320:0); } return (c^~0)>>>0; }
function chunk(type, data) { const t=Buffer.from(type), body=Buffer.concat([t,data]), out=Buffer.alloc(12+data.length); out.writeUInt32BE(data.length,0); body.copy(out,4); out.writeUInt32BE(crc32(body),8+data.length); return out; }
function png(pixels) { const rows=[]; for(let y=0;y<16;y++){ const row=Buffer.alloc(1+16*4); for(let x=0;x<16;x++) for(let c=0;c<4;c++) row[1+x*4+c]=pixels[y*16+x][c]; rows.push(row); } const ih=Buffer.alloc(13); ih.writeUInt32BE(16,0); ih.writeUInt32BE(16,4); ih[8]=8; ih[9]=6; return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(Buffer.concat(rows))),chunk('IEND',Buffer.alloc(0))]); }
function texture(name, painter) { const p=Array.from({length:256},()=>[0,0,0,255]); for(let y=0;y<16;y++) for(let x=0;x<16;x++) p[y*16+x]=painter(x,y); const f=path.join(root,'assets',mod,'textures',name+'.png'); fs.mkdirSync(path.dirname(f),{recursive:true}); fs.writeFileSync(f,png(p)); }
function noise(x,y,seed) { let n=(x*374761393+y*668265263+seed*1442695041)|0; n=(n^(n>>>13))*1274126177; return ((n^(n>>>16))>>>0)%100; }
const stonePalette=[[107,107,107],[119,119,119],[128,128,128],[96,96,96],[137,137,137]];
const deepPalette=[[72,72,78],[80,80,86],[88,88,94],[65,65,72],[96,96,102]];
for(let oi=0;oi<ores.length;oi++) {
 const o=ores[oi], cluster=Array(256).fill(false), seed=oi+4;
 for(let y=2;y<14;y+=4) for(let x=2;x<14;x+=4) if(noise(x,y,seed)<42) for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=1;dx++) if(noise(x+dx,y+dy,seed+9)<75) cluster[(y+dy)*16+x+dx]=true;
 for(const [deep,suffix,palette] of [[false,'',stonePalette],[true,'deepslate_',deepPalette]]) {
   const prefix=deep?'deepslate_':'';
   texture('block/'+prefix+o.id+'_ore',(x,y)=> cluster[y*16+x] ? [...o[deep?'deep':'stone'],255] : [...palette[noise(x,y,seed)%palette.length],255]);
   write(`assets/${mod}/blockstates/${prefix}${o.id}_ore.json`,{variants:{'':{model:`${mod}:block/${prefix}${o.id}_ore`}}});
   write(`assets/${mod}/models/block/${prefix}${o.id}_ore.json`,{parent:'minecraft:block/cube_all',textures:{all:`${mod}:block/${prefix}${o.id}_ore`}});
   write(`assets/${mod}/models/item/${prefix}${o.id}_ore.json`,{parent:`${mod}:block/${prefix}${o.id}_ore`});
   write(`data/${mod}/loot_table/blocks/${prefix}${o.id}_ore.json`,{
     type:'minecraft:block',pools:[{rolls:1,entries:[
       {type:'minecraft:item',name:`${mod}:${prefix}${o.id}_ore`,conditions:[{condition:'minecraft:match_tool',predicate:{enchantments:[{enchantments:'minecraft:silk_touch',levels:{min:1}}]}}]},
       {type:'minecraft:item',name:`${mod}:${o.raw}`,conditions:[{condition:'minecraft:inverted',term:{condition:'minecraft:match_tool',predicate:{enchantments:[{enchantments:'minecraft:silk_touch',levels:{min:1}}]}}}],functions:[{function:'minecraft:explosion_decay'},{function:'minecraft:apply_bonus',enchantment:'minecraft:fortune',formula:'minecraft:ore_drops'}]}
     ]}]
   });
 }
 write(`data/${mod}/worldgen/configured_feature/ore_${o.id}.json`,{type:'minecraft:ore',config:{size:o.size,discard_chance_on_air_exposure:0.0,targets:[
   {target:{predicate_type:'minecraft:tag_match',tag:'minecraft:stone_ore_replaceables'},state:{Name:`${mod}:${o.id}_ore`}},
   {target:{predicate_type:'minecraft:tag_match',tag:'minecraft:deepslate_ore_replaceables'},state:{Name:`${mod}:deepslate_${o.id}_ore`}}
 ]}});
 write(`data/${mod}/worldgen/placed_feature/ore_${o.id}.json`,{feature:`${mod}:ore_${o.id}`,placement:[
   {type:'minecraft:count',count:o.chance},{type:'minecraft:in_square'},
   {type:'minecraft:height_range',height:{type:'minecraft:uniform',min_inclusive:{absolute:o.y0},max_inclusive:{absolute:o.y1}}},
   {type:'minecraft:biome'}
 ]});
 write(`data/neoforge/biome_modifier/add_ore_${o.id}.json`,{type:'neoforge:add_features',biomes:'#minecraft:is_overworld',features:`${mod}:ore_${o.id}`,step:'underground_ores'});
}
const blocks=['tin_block','silver_block','raw_tin_block','raw_silver_block'];
for(const id of blocks) {
 const raw=id.startsWith('raw_');
 texture('block/'+id,(x,y)=> { const v=raw ? [128,82,57] : id.startsWith('silver')?[171,181,193]:[174,137,76]; const line=(x%8===0||y%8===0)?-18:((x+y)%7===0?10:0); return [...v.map(c=>Math.max(0,Math.min(255,c+line))),255]; });
 write(`assets/${mod}/blockstates/${id}.json`,{variants:{'':{model:`${mod}:block/${id}`}}});
 write(`assets/${mod}/models/block/${id}.json`,{parent:'minecraft:block/cube_all',textures:{all:`${mod}:block/${id}`}});
 write(`assets/${mod}/models/item/${id}.json`,{parent:`${mod}:block/${id}`});
 write(`data/${mod}/loot_table/blocks/${id}.json`,{type:'minecraft:block',pools:[{rolls:1,entries:[{type:'minecraft:item',name:`${mod}:${id}`}]}]});
}
const allOreBlocks = ores.flatMap(o=>[`${o.id}_ore`,`deepslate_${o.id}_ore`]);
write(`data/minecraft/tags/block/mineable/pickaxe.json`, {replace:false,values:allOreBlocks.map(id=>`${mod}:${id}`).concat(blocks.map(id=>`${mod}:${id}`))});
write(`data/minecraft/tags/block/needs_stone_tool.json`, {replace:false,values:['tin_ore','deepslate_tin_ore','silver_ore','deepslate_silver_ore','tin_block','silver_block','raw_tin_block','raw_silver_block'].map(id=>`${mod}:${id}`)});
write(`data/minecraft/tags/block/needs_iron_tool.json`, {replace:false,values:['ruby_ore','deepslate_ruby_ore','sapphire_ore','deepslate_sapphire_ore'].map(id=>`${mod}:${id}`)});
const items={raw_tin:[167,133,83],tin_ingot:[208,177,111],raw_silver:[151,153,160],silver_ingot:[219,224,232],ruby:[225,58,74],sapphire:[63,145,239]};
for(const [id,color] of Object.entries(items)) {
 texture('item/'+id,(x,y)=> { const inside=(x>=4&&x<=11&&y>=2&&y<=13); if(!inside) return [0,0,0,0]; const edge=x===4||x===11||y===2||y===13; const shine=x<7&&y<6; return edge?[Math.max(0,color[0]-60),Math.max(0,color[1]-60),Math.max(0,color[2]-60),255]:shine?[Math.min(255,color[0]+35),Math.min(255,color[1]+35),Math.min(255,color[2]+35),255]:[...color,255]; });
 write(`assets/${mod}/models/item/${id}.json`,{parent:'minecraft:item/generated',textures:{layer0:`${mod}:item/${id}`}});
}
for (const [raw, ingot] of [['raw_tin','tin_ingot'],['raw_silver','silver_ingot']]) {
  for (const [kind,time] of [['smelting',200],['blasting',100]]) {
    write(`data/${mod}/recipe/${ingot}_from_${kind}_${raw}.json`, {
      type:`minecraft:${kind}`, ingredient:{item:`${mod}:${raw}`}, result:{id:`${mod}:${ingot}`}, experience:0.7, cookingtime:time
    });
  }
}
for (const [material, ingot] of [['tin','tin_ingot'],['silver','silver_ingot']]) {
  const block = `${material}_block`;
  write(`data/${mod}/recipe/${block}.json`, {type:'minecraft:crafting_shaped',pattern:['XXX','XXX','XXX'],key:{X:{item:`${mod}:${ingot}`}},result:{id:`${mod}:${block}`}});
  write(`data/${mod}/recipe/${material}_ingots_from_block.json`, {type:'minecraft:crafting_shapeless',ingredients:[{item:`${mod}:${block}`}],result:{id:`${mod}:${ingot}`,count:9}});
}
for (const [raw, block] of [['raw_tin','raw_tin_block'],['raw_silver','raw_silver_block']]) {
  write(`data/${mod}/recipe/${block}.json`, {type:'minecraft:crafting_shaped',pattern:['XXX','XXX','XXX'],key:{X:{item:`${mod}:${raw}`}},result:{id:`${mod}:${block}`}});
  write(`data/${mod}/recipe/${raw}_from_block.json`, {type:'minecraft:crafting_shapeless',ingredients:[{item:`${mod}:${block}`}],result:{id:`${mod}:${raw}`,count:9}});
}
