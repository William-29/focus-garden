import fs from 'node:fs';
import zlib from 'node:zlib';
import { pets } from '../src/game/garden.ts';
import { petArt } from '../src/game/pet-art.ts';
const font = {
 A:['01110','10001','11111','10001','10001'],B:['11110','10001','11110','10001','11110'],C:['01111','10000','10000','10000','01111'],D:['11110','10001','10001','10001','11110'],E:['11111','10000','11110','10000','11111'],F:['11111','10000','11110','10000','10000'],G:['01111','10000','10111','10001','01111'],H:['10001','10001','11111','10001','10001'],I:['111','010','010','010','111'],J:['00111','00010','00010','10010','01100'],K:['10001','10010','11100','10010','10001'],L:['10000','10000','10000','10000','11111'],M:['10001','11011','10101','10001','10001'],N:['10001','11001','10101','10011','10001'],O:['01110','10001','10001','10001','01110'],P:['11110','10001','11110','10000','10000'],Q:['01110','10001','10101','10010','01101'],R:['11110','10001','11110','10010','10001'],S:['01111','10000','01110','00001','11110'],T:['11111','00100','00100','00100','00100'],U:['10001','10001','10001','10001','01110'],V:['10001','10001','10001','01010','00100'],W:['10001','10001','10101','11011','10001'],X:['10001','01010','00100','01010','10001'],Y:['10001','01010','00100','00100','00100'],Z:['11111','00010','00100','01000','11111'],'-':['000','000','111','000','000'],0:['111','101','101','101','111'],1:['010','110','010','010','111'],2:['111','001','111','100','111'],3:['111','001','111','001','111']
};
function sheet(width,height) {
 const pixels=Buffer.alloc(width*height*4);
 function rect(x,y,w,h,color) {const hex=color.replace('#',''); const rgb=[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16)); for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++){if(xx<0||yy<0||xx>=width||yy>=height)continue;const i=(yy*width+xx)*4;pixels[i]=rgb[0];pixels[i+1]=rgb[1];pixels[i+2]=rgb[2];pixels[i+3]=255;}}
 rect(0,0,width,height,'#eff1d5');
 function label(text,x,y,s=2){for(const ch of text.toUpperCase()){const rows=font[ch];if(rows){rows.forEach((r,dy)=>[...r].forEach((p,dx)=>{if(p==='1')rect(x+dx*s,y+dy*s,s,s,'#344532');})); x+=(rows[0].length+1)*s;}else x+=4*s;}}
 function pet(pet,x,y,s,frame,view,flip=false){const art=petArt(pet,frame,view); for(const r of art.rects)rect(x+(flip?art.width-r.x-r.width:r.x)*s,y+r.y*s,r.width*s,r.height*s,r.color);}
 function save(file){const table=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});const chunk=(type,data)=>{const tag=Buffer.from(type);let crc=0xffffffff;for(const b of Buffer.concat([tag,data]))crc=table[(crc^b)&255]^(crc>>>8);const out=Buffer.alloc(data.length+12);out.writeUInt32BE(data.length);tag.copy(out,4);data.copy(out,8);out.writeUInt32BE((crc^0xffffffff)>>>0,data.length+8);return out;};const hdr=Buffer.alloc(13);hdr.writeUInt32BE(width);hdr.writeUInt32BE(height,4);hdr[8]=8;hdr[9]=6;const scan=Buffer.alloc(height*(width*4+1));for(let y=0;y<height;y++)pixels.copy(scan,y*(width*4+1)+1,y*width*4,(y+1)*width*4);fs.writeFileSync(file,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',hdr),chunk('IDAT',zlib.deflateSync(scan)),chunk('IEND',Buffer.alloc(0))]));}
 return {rect,label,pet,save};
}
fs.mkdirSync('.expo',{recursive:true});
const review=sheet(1152,616);
review.label('FOCUS GARDEN - ANIMAL REVIEW',24,16,3);
const adults=pets.filter(p=>!p.baby);
adults.forEach((p,i)=>{
 const x=(i%4)*288,y=48+Math.floor(i/4)*280;
 review.rect(x+6,y+4,276,268,i%2?'#dae6bd':'#e5ebc9');review.label(p.species,x+18,y+14);
 ['front','side','side'].forEach((v,j)=>review.pet(p,x+j*96,y+34,3,0,v,j===1));
 review.label('FRONT',x+24,y+134,1);review.label('LEFT',x+120,y+134,1);review.label('RIGHT',x+208,y+134,1);
 const baby=pets.find(b=>b.baby&&b.species===p.species);
 ['front','side','side'].forEach((v,j)=>review.pet(baby,x+j*96+12,y+156,3,0,v,j===1));
 review.label(baby.id,x+18,y+242,2);
});
review.save('.expo/pets-reference-preview.png');
const frames=sheet(896,1872);
frames.label('FRONT 0 1 2 3 - SIDE 0 1 2 3',16,10,2);
pets.forEach((p,i)=>{const y=32+i*114;frames.label(p.id,12,y,1);for(let f=0;f<8;f++){const art=petArt(p);frames.pet(p,f*112+(112-art.width*3)/2,y+12,3,f%4,f<4?'front':'side');}});
frames.save('.expo/pets-all-frames.png');
console.log('Rendered reference comparison and all 128 animation frames.');
