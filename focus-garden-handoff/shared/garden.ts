export type Category = 'Flowers' | 'Fruits' | 'Vegetables';
export type PlantId = string;
export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
export type Plant = {id: PlantId; name: string; category: Category; sprite: number; unlockLevel: number; rarity: Rarity; minutes: number[]; cost: number; coins: number; xp: number};
const names: Record<Category, string[]> = {
 Flowers: ['Daisy','Tulip','Sunflower','Rose','Hibiscus','Cherry Blossom','Lavender','Marigold','Daffodil','Peony','Lotus','Lily','Hydrangea','Magnolia','Orchid'],
 Fruits: ['Strawberry','Blueberry','Grape','Cherry','Apple','Pear','Peach','Orange','Lemon','Kiwi','Mango','Pineapple','Watermelon','Melon','Coconut'],
 Vegetables: ['Carrot','Potato','Corn','Tomato','Cucumber','Bell Pepper','Lettuce','Broccoli','Spinach','Onion','Garlic','Pea','Radish','Pumpkin','Eggplant'],
};
export const categories = Object.keys(names) as Category[];
export const MAX_LEVEL = 45;
export const DISPLAY_SPACES = 8;
export function rarityFor(level: number): Rarity {return (['Common','Uncommon','Rare','Epic','Legendary'] as Rarity[])[Math.min(4, Math.max(0, Math.floor((level - 1) / 9)))];}
const unlockOrder: Category[] = ['Vegetables', 'Fruits', 'Flowers'];
export const plants: Plant[] = categories.flatMap((category, categoryIndex) => names[category].map((name, i) => {
 const minutes = name === 'Sunflower' ? [45,10,45] : [i === 0 ? (category === 'Vegetables' ? 20 : 15) : 20 + i * 5];
 const focus = minutes.reduce((n, m, index) => n + (index === 1 ? 0 : m), 0), cost = 5 + i * 5 + categoryIndex;
 const unlockLevel = i * 3 + unlockOrder.indexOf(category) + 1;
 return {id: name.toLowerCase().replaceAll(' ', '-'), name, category, sprite: i, unlockLevel, rarity: rarityFor(unlockLevel), minutes, cost, coins: cost + Math.round(focus * 1.1), xp: focus * 3};
}));
export type Outfit = {id: string; name: string; sprite: number; level: number; cost: number; description: string};
export const outfits: Outfit[] = [
 {id:'meadow',name:'Meadow overalls',sprite:0,level:1,cost:0,description:'A straw hat and your trusty green overalls.'},
 {id:'rain',name:'Rainy day',sprite:1,level:2,cost:40,description:'A sunshine-yellow raincoat for little showers.'},
 {id:'blossom',name:'Blossom bonnet',sprite:2,level:6,cost:85,description:'Pink petals, a flower bonnet, and garden pockets.'},
 {id:'denim',name:'Bluebird denim',sprite:3,level:12,cost:120,description:'Blue overalls and a soft little bandana.'},
 {id:'beekeeper',name:'Friendly beekeeper',sprite:4,level:24,cost:180,description:'A cozy white suit for the garden’s busiest friends.'},
 {id:'starlight',name:'Starlight gardener',sprite:5,level:36,cost:240,description:'A purple starry hat for a little garden magic.'},
];
export function getPlant(id: PlantId) {const p = plants.find(p => p.id === id); if (!p) throw new Error('Unknown seed.'); return p;}
export function getOutfit(id: string) {return outfits.find(o => o.id === id) ?? outfits[0];}
export function getLevel(xp: number) {return Math.min(MAX_LEVEL, Math.floor(xp / 100) + 1);}
export function unlockedBetween(from: number, to: number) {return plants.filter(p => p.unlockLevel > from && p.unlockLevel <= to).sort((a,b) => a.unlockLevel-b.unlockLevel);}
export function unlockedAt(level: number) {return plants.filter(p => p.unlockLevel <= level).sort((a,b) => a.unlockLevel-b.unlockLevel);}
export type Session = {plantId: PlantId; phase: number; status: 'running' | 'paused' | 'awaiting' | 'ready'; deadline: number; remaining: number; quick: boolean};
export type KeptPlant = {id: string; plantId: PlantId};
export type GardenState = {
 coins: number; xp: number; harvests: number; completed: number; focusedSeconds: number;
 inventory: Record<PlantId, number>; selectedSeed: PlantId; quick: boolean; session: Session | null; message: string;
 keptPlants: KeptPlant[]; displaySlots: (string | null)[]; ownedOutfits: string[]; outfit: string;
 levelEvent: {from: number; to: number; seeds: PlantId[]; key: number} | null;
};
export type Action = {type:'selectSeed';id:PlantId} | {type:'mode';quick:boolean} | {type:'buy';id:PlantId} |
 {type:'plant'|'tick'|'pause'|'resume'|'next';now:number} | {type:'harvest'|'keep'} |
 {type:'placeDisplay';id:string;slot:number} | {type:'clearDisplay';slot:number} |
 {type:'buyOutfit'|'equipOutfit';id:string};
export function initialState(): GardenState {
 const inventory = Object.fromEntries(plants.map(p => [p.id,0])); inventory.carrot = 2;
 return {coins:40,xp:0,harvests:0,completed:0,focusedSeconds:0,inventory,selectedSeed:'carrot',quick:true,session:null,message:'Your main plot is ready. Plant a carrot and find your focus.',keptPlants:[],displaySlots:Array(DISPLAY_SPACES).fill(null),ownedOutfits:['meadow'],outfit:'meadow',levelEvent:null};
}
export function phaseDuration(s: Session) {return getPlant(s.plantId).minutes[s.phase] * (s.quick ? 1000 : 60000);}
export function timeLeft(s: Session, now: number) {return s.status === 'running' ? Math.max(0, s.deadline-now) : s.remaining;}
export function growth(s: Session, now: number) {
 const p=getPlant(s.plantId),f=s.quick?1000:60000,total=p.minutes.reduce((n,m,i)=>n+(i===1?0:m*f),0);
 let done=p.minutes.reduce((n,m,i)=>n+(i<s.phase&&i!==1?m*f:0),0);if(s.phase!==1)done+=phaseDuration(s)-timeLeft(s,now);
 return s.status==='ready'?1:Math.max(0,Math.min(1,done/total));
}
export type GardenerActivity = 'roam' | 'study' | 'walk-to' | 'water' | 'walk-back';
export function gardenerActivity(s: Session | null, now: number): GardenerActivity {
 if(!s || s.status==='ready' || s.phase===1 || s.status==='awaiting')return 'roam';
 if(s.status==='paused')return 'study';
 const elapsed=phaseDuration(s)-timeLeft(s,now),cycle=elapsed%(s.quick?16000:60000);
 const start=s.quick?7000:42000,walk=s.quick?2000:4000,water=s.quick?3000:6000;
 if(cycle<start || cycle>=start+walk*2+water)return 'study';
 if(cycle<start+walk)return 'walk-to';if(cycle<start+walk+water)return 'water';return 'walk-back';
}
function complete(st: GardenState, keep: boolean): GardenState {
 const s=st.session;if(!s||s.status!=='ready')return st;
 const p=getPlant(s.plantId),xp=st.xp+p.xp,from=getLevel(st.xp),to=getLevel(xp),completed=st.completed+1;
 const focus=p.minutes.reduce((n,m,i)=>n+(i===1?0:m),0)*(s.quick?1:60);
 const id=`plant-${completed}`,slot=st.displaySlots.indexOf(null),displaySlots=[...st.displaySlots];
 if(keep&&slot!==-1)displaySlots[slot]=id;
 return {...st,coins:st.coins+(keep?0:p.coins),xp,completed,harvests:st.harvests+(keep?0:1),focusedSeconds:st.focusedSeconds+focus,session:null,
  keptPlants:keep?[...st.keptPlants,{id,plantId:p.id}]:st.keptPlants,displaySlots:keep?displaySlots:st.displaySlots,
  levelEvent:to>from?{from,to,seeds:unlockedBetween(from,to).map(p=>p.id),key:completed}:st.levelEvent,
  message:keep?`${p.name} kept ${slot===-1?'in your collection':'on your display farm'}! +${p.xp} XP · 0 coins.`:`${p.name} harvested! +${p.coins} coins · +${p.xp} XP.`};
}
export function gardenReducer(st: GardenState, a: Action): GardenState {
 const s=st.session;
 switch(a.type){
 case 'selectSeed':return plants.some(p=>p.id===a.id)?{...st,selectedSeed:a.id}:st;
 case 'mode':return s?st:{...st,quick:a.quick};
 case 'buy':{const p=plants.find(p=>p.id===a.id);if(!p||st.coins<p.cost||getLevel(st.xp)<p.unlockLevel)return st;return {...st,coins:st.coins-p.cost,inventory:{...st.inventory,[p.id]:st.inventory[p.id]+1},selectedSeed:p.id,message:`${p.name} seed added to your bag.`};}
 case 'plant':{const p=plants.find(p=>p.id===st.selectedSeed);if(s||!p||st.inventory[p.id]<1||getLevel(st.xp)<p.unlockLevel)return st;const duration=p.minutes[0]*(st.quick?1000:60000);return {...st,inventory:{...st.inventory,[p.id]:st.inventory[p.id]-1},session:{plantId:p.id,phase:0,status:'running',deadline:a.now+duration,remaining:duration,quick:st.quick},message:`${p.name} is growing. Let’s study together.`};}
 case 'tick':{if(!s||s.status!=='running'||a.now<s.deadline)return st;const final=s.phase===getPlant(s.plantId).minutes.length-1;return {...st,session:{...s,status:final?'ready':'awaiting',remaining:0},message:final?`${getPlant(s.plantId).name} is ready! Harvest for coins or keep it for display.`:s.phase===0?'First focus finished. Take a little break.':'Break finished. Start your second focus session.'};}
 case 'pause':{if(!s||s.status!=='running')return st;const updated=gardenReducer(st,{type:'tick',now:a.now});if(updated!==st)return updated;return {...st,session:{...s,status:'paused',remaining:timeLeft(s,a.now)},message:'Growing paused. Your plant will wait for you.'};}
 case 'resume':return s?.status==='paused'?{...st,session:{...s,status:'running',deadline:a.now+s.remaining},message:'Growing again. Welcome back.'}:st;
 case 'next':{if(!s||s.status!=='awaiting')return st;const phase=s.phase+1,duration=getPlant(s.plantId).minutes[phase]*(s.quick?1000:60000);return {...st,session:{...s,phase,status:'running',deadline:a.now+duration,remaining:duration},message:phase===1?'Rest a little. Your gardener is stretching too.':'One more focus session. You’ve got this.'};}
 case 'harvest':return complete(st,false);
 case 'keep':return complete(st,true);
 case 'placeDisplay':{if(!Number.isInteger(a.slot)||a.slot<0||a.slot>=DISPLAY_SPACES||!st.keptPlants.some(p=>p.id===a.id)||st.displaySlots[a.slot]===a.id)return st;const displaySlots=st.displaySlots.map(id=>id===a.id?null:id);displaySlots[a.slot]=a.id;return {...st,displaySlots,message:'Display farm arranged. Your plants are safe in your collection.'};}
 case 'clearDisplay':{if(!Number.isInteger(a.slot)||a.slot<0||a.slot>=DISPLAY_SPACES||!st.displaySlots[a.slot])return st;const displaySlots=[...st.displaySlots];displaySlots[a.slot]=null;return {...st,displaySlots,message:'Plant returned to your collection. No coins exchanged.'};}
 case 'buyOutfit':{const o=outfits.find(o=>o.id===a.id);if(!o||st.ownedOutfits.includes(o.id)||getLevel(st.xp)<o.level||st.coins<o.cost)return st;return {...st,coins:st.coins-o.cost,ownedOutfits:[...st.ownedOutfits,o.id],outfit:o.id,message:`${o.name} bought and equipped. Looking lovely!`};}
 case 'equipOutfit':return st.ownedOutfits.includes(a.id)&&st.outfit!==a.id?{...st,outfit:a.id,message:`${getOutfit(a.id).name} equipped.`}:st;
 }
}
