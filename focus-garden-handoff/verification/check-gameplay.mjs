import assert from 'node:assert/strict';
import {plants,outfits,MAX_LEVEL,gardenReducer as r,initialState,getLevel,growth,timeLeft,unlockedBetween,unlockedAt,gardenerActivity,DISPLAY_SPACES} from '../shared/garden.ts';
let checks=0;const test=(value,message)=>{assert.ok(value,message);checks++;};
test(MAX_LEVEL===45&&plants.length===45&&new Set(plants.map(p=>p.id)).size===45,'45 unique seeds across 45 levels');
for(let level=1;level<=45;level++){
 const next=unlockedBetween(level-1,level);test(next.length===1,`Exactly one seed at level ${level}`);
 test(next[0].category===['Vegetables','Fruits','Flowers'][(level-1)%3],`Correct category cycle at level ${level}`);
 test(unlockedAt(level).length===level,`Exactly ${level} unlocked seeds`);
}
test(getLevel(0)===1&&getLevel(100)===2&&getLevel(4400)===45&&getLevel(10000)===45,'Level threshold and cap');
let s=initialState();test(s.selectedSeed==='carrot'&&s.inventory.carrot===2&&s.coins===40,'Only unlocked starter supplies');
test(r(s,{type:'buy',id:'strawberry'})===s,'Level 2 seed stays locked at level 1');
test(r({...s,selectedSeed:'daisy',inventory:{...s.inventory,daisy:1}},{type:'plant',now:0}).session===null,'Locked seed cannot be planted');
const ready=(st,id='carrot',now=0)=>{let x=r(st,{type:'selectSeed',id});x=r(x,{type:'plant',now});assert.ok(x.session);for(let guard=0;guard<5&&x.session.status!=='ready';guard++){x=r(x,{type:'tick',now:x.session.deadline});if(x.session.status==='awaiting')x=r(x,{type:'next',now:x.session.deadline});}return x;};
s=ready(s);test(r(s,{type:'plant',now:0})===s,'Only one growing plant');
s=r(s,{type:'keep'});test(s.coins===40&&s.xp===60&&s.harvests===0&&s.completed===1,'Display pays XP and no coins');
test(s.keptPlants.length===1&&s.displaySlots[0]===s.keptPlants[0].id&&!s.session,'Kept plant is displayed and growing plot clears');
test(r(s,{type:'keep'})===s&&r(s,{type:'harvest'})===s,'Completion rewards cannot be duplicated');
s=r(ready(s),{type:'harvest'});test(s.coins===69&&s.xp===120&&s.harvests===1&&s.completed===2&&s.focusedSeconds===40,'Harvest pays coins and XP; both choices count actual focus');
test(s.levelEvent.from===1&&s.levelEvent.to===2&&s.levelEvent.seeds.join()==='strawberry','Level 2 unlocks only Strawberry');
test(r(s,{type:'buy',id:'daisy'})===s,'Level 3 flower still locked');
const before=s.coins;s=r(s,{type:'buyOutfit',id:'rain'});test(s.coins===before-40&&s.outfit==='rain'&&s.ownedOutfits.includes('rain'),'Unlocked outfit buys and equips');
test(r(s,{type:'buyOutfit',id:'rain'})===s,'Owned outfit cannot be charged twice');
s=r(s,{type:'equipOutfit',id:'meadow'});test(s.outfit==='meadow','Owned outfit can be switched for free');
test(r(s,{type:'equipOutfit',id:'blossom'})===s&&r(s,{type:'buyOutfit',id:'blossom'})===s,'Unowned and locked outfits rejected');
test(r({...s,coins:0},{type:'buyOutfit',id:'blossom'}) .coins===0,'Outfits cannot overdraw coins');
let xp=s.xp,coins=s.coins,id=s.keptPlants[0].id;
s=r(s,{type:'placeDisplay',id,slot:7});test(s.displaySlots[0]===null&&s.displaySlots[7]===id&&s.keptPlants.length===1,'Move display without duplicate or loss');
s=r(s,{type:'clearDisplay',slot:7});test(s.displaySlots[7]===null&&s.keptPlants.length===1,'Storing keeps plant in collection');
test(s.xp===xp&&s.coins===coins,'Arranging displays earns no rewards');
test(r(s,{type:'placeDisplay',id,slot:8})===s&&r(s,{type:'placeDisplay',id:'unknown',slot:0})===s,'Invalid display operations rejected');
s={...s,coins:1000};for(let i=0;i<DISPLAY_SPACES+2;i++){s=r(s,{type:'buy',id:'carrot'});s=r(ready(s),{type:'keep'});}
test(s.displaySlots.every(Boolean)&&s.keptPlants.length===11,'Full display farm stores additional kept plants');
const replaced=s.displaySlots[0];s=r(s,{type:'placeDisplay',id:s.keptPlants.at(-1).id,slot:0});test(!s.displaySlots.includes(replaced)&&s.keptPlants.some(p=>p.id===replaced),'Replacing a display returns previous plant to collection');
s=initialState();s=r(s,{type:'plant',now:0});test(r(s,{type:'harvest'})===s&&r(s,{type:'keep'})===s,'No early harvest or keeping');test(r(s,{type:'mode',quick:false})===s,'Mode fixed while growing');
test(gardenerActivity(null,0)==='roam'&&gardenerActivity(s.session,0)==='study','Idle walks; active focus studies');
test(gardenerActivity(s.session,7500)==='walk-to'&&gardenerActivity(s.session,10000)==='water'&&gardenerActivity(s.session,13000)==='walk-back'&&gardenerActivity(s.session,15000)==='study','Character leaves desk, waters and returns');
s=r(s,{type:'pause',now:5000});test(timeLeft(s.session,999999)===15000&&gardenerActivity(s.session,999999)==='study','Pause preserves time and desk activity');
s=r(s,{type:'resume',now:100000});test(s.session.deadline===115000,'Resume preserves remaining time');
s=r(initialState(),{type:'mode',quick:false});s=r(s,{type:'plant',now:10});test(s.session.deadline===1200010,'Real focus lasts 20 minutes');
s={...initialState(),xp:800,coins:500};s=r(s,{type:'buy',id:'sunflower'});s=r(s,{type:'plant',now:0});s=r(s,{type:'tick',now:45000});test(s.session.status==='awaiting'&&growth(s.session,45000)===.5,'Split session requires break at half growth');
s=r(s,{type:'next',now:45000});test(s.session.phase===1&&s.session.deadline===55000&&growth(s.session,50000)===.5&&gardenerActivity(s.session,50000)==='roam','Break gives no growth and gardener stretches');
s=r(s,{type:'tick',now:55000});s=r(s,{type:'next',now:55000});test(s.session.phase===2&&s.session.deadline===100000,'Second focus required');
s=r(s,{type:'tick',now:100000});s=r(s,{type:'keep'});test(s.focusedSeconds===90&&s.xp===1070&&s.coins===485,'Split display: focus only stats, XP, zero coin reward');
test(s.levelEvent.seeds.length===2&&s.levelEvent.seeds.join()==='tomato,cherry','Multiple-level jump gives one seed per crossed level');
for(const o of outfits){let st={...initialState(),xp:(o.level-1)*100,coins:500};if(o.cost){st=r(st,{type:'buyOutfit',id:o.id});test(st.ownedOutfits.includes(o.id)&&st.outfit===o.id,'Every outfit purchasable at its level');}}
console.log(`${checks} gameplay checks passed: all 45 unlock levels, display/harvest rewards, display collection, outfits, focus phases, pause/resume, and gardener activities.`);
