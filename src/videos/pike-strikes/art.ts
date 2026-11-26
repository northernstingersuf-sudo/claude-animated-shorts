import * as T from 'three';
import {NOINK} from '../../../templates/bridge/ink';
const ink='#291e32';
export function painted(w:number,h:number,draw:(g:CanvasRenderingContext2D)=>void){
 const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d')!;draw(g);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;
}
function shape(g:CanvasRenderingContext2D,d:string,color:string,lw=7){g.fillStyle=color;g.strokeStyle=ink;g.lineWidth=lw;g.lineJoin='round';const p=new Path2D(d);g.fill(p);g.stroke(p);}
export function fishArt(part:'body'|'tail'|'jaw'|'lure'){
 return painted(1200,480,g=>{
 if(part==='body'){
 // Long duckbill, posterior dorsal/anal fins, olive flank with light oval markings.
 shape(g,'M250 190 Q230 128 270 88 Q340 100 392 163 L430 194 Z','#82985c');
 shape(g,'M270 289 L307 363 Q354 367 399 300 Z','#c09b64');
 shape(g,'M210 227 C340 132 595 142 800 181 Q904 192 963 220 L1110 235 Q1140 244 1108 256 L952 266 Q901 301 790 306 C575 347 329 307 210 260 Z','#7e9659');
 g.save();new Path2D();g.clip(new Path2D('M210 227 C340 132 595 142 800 181 Q904 192 963 220 L1110 235 Q1140 244 1108 256 L952 266 Q901 301 790 306 C575 347 329 307 210 260 Z'));
 const grad=g.createLinearGradient(0,150,0,330);grad.addColorStop(0,'#415b48');grad.addColorStop(.5,'#8ca262');grad.addColorStop(1,'#eee1a8');g.fillStyle=grad;g.fillRect(200,140,930,210);
 for(let i=0;i<115;i++){const x=270+(i*83)%620,y=188+(i*43)%104;g.fillStyle=i%3?'#d7d69a':'#aebc7a';g.beginPath();g.ellipse(x,y,10+i%6,4+i%3,-.25,0,7);g.fill();}
 g.restore();g.strokeStyle='#4f634d';g.lineWidth=3;g.beginPath();g.moveTo(280,250);g.quadraticCurveTo(580,234,904,253);g.stroke();
 shape(g,'M751 272 Q701 302 718 330 Q752 333 790 282 Z','#a5ad73',4);
 g.strokeStyle=ink;g.lineWidth=5;g.beginPath();g.moveTo(901,201);g.quadraticCurveTo(861,249,901,290);g.stroke();
 g.fillStyle='#e3bf55';g.beginPath();g.ellipse(961,222,20,17,0,0,7);g.fill();g.stroke();g.fillStyle=ink;g.beginPath();g.ellipse(966,222,8,12,0,0,7);g.fill();
 g.beginPath();g.moveTo(1020,251);g.lineTo(1113,249);g.stroke();
 }else if(part==='tail'){
 shape(g,'M244 229 Q158 188 52 121 L89 239 L49 357 Q159 315 244 258 Z','#9a9e65');
 g.strokeStyle='#566952';g.lineWidth=3;for(let i=0;i<7;i++){g.beginPath();g.moveTo(232,244);g.lineTo(65+i%2*20,144+i*30);g.stroke();}
 }else if(part==='jaw'){
 shape(g,'M900 266 Q977 281 1112 259 Q1085 291 952 294 Z','#c4c395',4);
 for(let x=971;x<1100;x+=23)shape(g,`M${x} 277 l8 -13 l5 12 Z`,'#f7eed1',2);
 }else{
 shape(g,'M420 246 Q466 172 636 213 L708 237 L638 262 Q503 294 420 246 Z','#d8cdb3');
 shape(g,'M450 218 Q536 168 637 214 L632 235 L458 242 Z','#d88b51',4);
 shape(g,'M420 246 L359 204 L372 254 L349 286 Z','#c6804b',4);
 g.fillStyle=ink;g.beginPath();g.arc(636,230,8,0,7);g.fill();g.strokeStyle=ink;g.lineWidth=4;g.beginPath();g.moveTo(530,278);g.lineTo(530,315);g.bezierCurveTo(553,338,568,308,551,300);g.stroke();
 }
 });
}
export const fishermanArt=()=>painted(600,1000,g=>{
 g.lineCap='round';g.lineJoin='round';g.strokeStyle=ink;g.lineWidth=20;
 g.beginPath();g.moveTo(258,630);g.lineTo(235,935);g.lineTo(192,946);g.moveTo(326,630);g.lineTo(370,935);g.lineTo(417,941);g.stroke();
 shape(g,'M239 420 Q205 464 218 650 Q286 683 353 641 L342 434 Z','#ce924c',10);
 shape(g,'M222 230 Q245 161 330 188 Q407 209 391 298 Q382 366 315 381 Q244 371 227 310 Z','#f4dfc1',9);
 shape(g,'M212 229 Q232 163 304 171 Q369 171 379 222 L429 237 Q344 256 212 247 Z','#546f62',8);
 g.fillStyle=ink;for(const x of [329,363]){g.beginPath();g.ellipse(x,283,5,10,0,0,7);g.fill();}
 g.lineWidth=5;g.beginPath();g.moveTo(327,327);g.quadraticCurveTo(346,337,362,322);g.stroke();
 g.lineWidth=15;g.beginPath();g.moveTo(330,450);g.lineTo(402,505);g.lineTo(466,440);g.moveTo(238,451);g.lineTo(283,516);g.lineTo(453,461);g.stroke();
 // Tiny original stinger emblem, no text or logo interruption.
 shape(g,'M270 468 l30 0 l-17 24 l17 0 l-31 42 l9 -31 l-17 0 Z','#eee0aa',3);
});
export function card(texture:T.Texture,w:number,h:number){const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshLambertMaterial({map:texture,transparent:true,alphaTest:.03,side:T.DoubleSide}));m.layers.set(NOINK);return m;}
export function terrainTexture(){return painted(1024,1024,g=>{g.fillStyle='#8a9a7b';g.fillRect(0,0,1024,1024);for(let i=0;i<900;i++){g.fillStyle=i%2?'#a8b08a':'#718976';g.globalAlpha=.25;g.beginPath();g.ellipse(i*137%1024,i*73%1024,8+i%40,3+i%10,i,0,7);g.fill();}g.globalAlpha=1;});}

// Painted dorsal drawing for steep cameras. Side drawings remain the primary model.
export const dorsalPike = () => painted(1200, 340, g => {
 const body = 'M200 163 C352 118 547 103 718 112 Q854 109 932 133 Q988 141 1115 151 Q1154 170 1115 189 Q988 199 932 207 Q854 231 718 228 C547 237 352 222 200 177 Z';
 shape(g, 'M211 162 Q141 152 61 102 L96 167 L62 239 Q156 193 213 177 Z', '#8b9868');
 for (const d of [
  'M770 123 Q715 71 651 68 Q663 108 699 130 Z',
  'M770 217 Q715 269 651 272 Q663 232 699 210 Z',
 ]) shape(g, d, '#87955e');
 shape(g, body, '#70874e');
 g.save();
 g.clip(new Path2D(body));
 const paint = g.createLinearGradient(0, 110, 0, 235);
 paint.addColorStop(0, '#9fa66b');
 paint.addColorStop(.46, '#4a6540');
 paint.addColorStop(1, '#a9ad70');
 g.fillStyle = paint;
 g.fillRect(190, 100, 960, 140);
 for (let i = 0; i < 95; i++) {
  g.fillStyle = i % 3 ? '#b8bc7e' : '#92a363';
  g.beginPath();
  g.ellipse(250 + i * 83 % 686, 113 + i * 59 % 114, 8 + i % 6, 3 + i % 3, .12, 0, 7);
  g.fill();
 }
 g.restore();
 for (const y of [139, 201]) {
  g.fillStyle = '#d2a947';
  g.strokeStyle = ink;
  g.lineWidth = 4;
  g.beginPath();
  g.ellipse(962, y, 18, 9, 0, 0, 7);
  g.fill();
  g.stroke();
  g.fillStyle = ink;
  g.fillRect(963, y - 4, 6, 8);
 }
});

export const minnowArt = () => painted(240, 110, g => {
 shape(g, 'M60 56 L21 27 L30 56 L19 82 Z', '#77988c', 4);
 shape(g, 'M47 54 Q103 13 178 36 Q228 51 200 63 Q116 103 47 54 Z', '#abc0a4', 4);
 g.strokeStyle = '#41796f';
 g.lineWidth = 4;
 g.beginPath();
 g.moveTo(59, 53);
 g.quadraticCurveTo(129, 41, 187, 50);
 g.stroke();
 g.fillStyle = ink;
 g.beginPath();
 g.arc(184, 47, 5, 0, 7);
 g.fill();
});
