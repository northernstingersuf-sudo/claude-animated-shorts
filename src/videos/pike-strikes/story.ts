import * as T from 'three';
import type {PikeWorld} from './world';
import words from './timing/words.json';
import events from './timing/events.json';
const before=(s:number)=>Math.round(s*30)-2;
export const EVENTS=Object.fromEntries(Object.entries(events).map(([k,v])=>[k,before(v)])) as Record<keyof typeof events,number>;
const at=(word:string,after:number)=>before(words.find(w=>w.s>=after&&w.word.toLowerCase().replace(/[^a-z]/g,'')===word)!.s);
export const SHOTS=[
 {name:'The hidden hunter',a:0,b:171,z:16,x:0,y:3,blur:12},
 {name:'One cast',a:171,b:246,z:15,x:0,y:3,blur:8},
 {name:'Through the surface',a:246,b:381,z:15,x:0,y:3,blur:5},
 {name:'Wobble and flash',a:381,b:621,z:11,x:1,y:3,blur:14},
 {name:'A world of water motion',a:621,b:861,z:12,x:-.1,y:2.6,blur:12},
 {name:'Following is not biting',a:861,b:1101,z:14,x:.6,y:3,blur:9},
 {name:'Load and launch',a:1101,b:1341,z:13,x:.5,y:2.8,blur:10},
 {name:'What can a strike tell us?',a:1341,b:1581,z:16,x:1,y:3.2,blur:6},
 {name:'Clues, not commands',a:1581,b:1800,z:15,x:.5,y:3,blur:10},
];
export const shotAt=(f:number)=>SHOTS.find(s=>f>=s.a&&f<s.b)??SHOTS[8];
const smooth=(a:number,b:number,x:number)=>{const t=T.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*t*(t*(t*6-15)+10);};
export function pose(w:PikeWorld,f:number,c:T.PerspectiveCamera,scene:T.Scene){
 const s=shotAt(f),t=f/30,u=(f-s.a)/(s.b-s.a);const above=s.a===171;
 w.shore.visible=above;w.water.visible=!above;
 scene.background=new T.Color(above?'#8bbce1':'#3a858d');scene.fog=new T.Fog(above?'#b7d9de':'#3a858d',10,40);
 c.position.set(s.x+.12*u,s.y+.05*u,s.z-.6*u);c.lookAt(s.x,2.5,0);c.rotation.z=above?-.025:s.a===1101?-.03:0;c.layers.enableAll();c.updateProjectionMatrix();
 w.angler.rotation.z=-.025+Math.sin(smooth(174,188,f)*Math.PI)*.08;w.rod.rotation.z=.3-smooth(174,188,f)*1.3;
 const tip=new T.Vector3(-Math.sin(w.rod.rotation.z)*4,Math.cos(w.rod.rotation.z)*4,0).add(w.rod.position);const flight=smooth(188,216,f);
 w.castLure.position.copy(tip).lerp(new T.Vector3(2.4,-.7,1),flight);w.castLure.position.y+=Math.sin(flight*Math.PI)*1.4;w.castLure.visible=f>=188&&f<216;w.castLine.visible=f>=188;
 w.castLine.geometry.dispose();w.castLine.geometry=new T.BufferGeometry().setFromPoints([tip,w.castLure.position]);w.ripple.visible=f>=216;w.ripple.scale.setScalar(.2+Math.max(0,f-216)*.055);
 w.fish.scale.setScalar(.8);w.fish.position.set(-.9,2.3+Math.sin(t*1.4)*.035,0);
 w.fish.rotation.z=.01*Math.sin(t);w.tail.rotation.z=Math.sin(t*3)*.018;
 const bend=smooth(EVENTS.bend-5,EVENTS.bend+10,f)*(1-smooth(EVENTS.drive,EVENTS.jaws,f));
 w.tail.rotation.z-=bend*.19;w.fish.rotation.z-=bend*.045;
 // Nine-frame acceleration; restrained mouth opening, not a crocodile snap.
 const launch=smooth(EVENTS.jaws-5,EVENTS.jaws+4,f);
 const settle=smooth(1290,1340,f);
 w.fish.position.x+=launch*.85-settle*.4;w.fish.position.y+=launch*.16;
 w.tail.rotation.z+=launch*(1-settle)*Math.sin((f-EVENTS.jaws)*1.2)*.06;
 w.jaw.rotation.z=-smooth(EVENTS.jaws-4,EVENTS.jaws+1,f)*.018*(1-smooth(EVENTS.jaws+5,EVENTS.jaws+13,f));
 const paused=f>=EVENTS.pause&&f<EVENTS.twitch;
 const wobble=f>=EVENTS.wobble;
 const lx=1.9+.18*Math.sin(t*.5);
 w.lure.position.set(lx,2.5+(paused?0:Math.sin(t*5)*.08),.15);
 w.lure.rotation.z=paused?-.04:Math.sin(t*7)*.13;
 if(f>=EVENTS.twitch&&f<EVENTS.twitch+15){w.lure.position.x+=.35*smooth(EVENTS.twitch,EVENTS.twitch+6,f);w.lure.rotation.z+=.16*Math.sin((f-EVENTS.twitch)*.3);}
 w.lure.visible=f< EVENTsContact || f>=1581;
 if(f>=1581)w.lure.position.set(2,3.3,.2);
 if(f<171)w.lure.position.y=2.9;
 if(f>=246&&f<381){w.lure.position.y=6-smooth(246,330,f)*3.4;}
 if(wobble&&f>=EVENTS.flash-2&&f<EVENTS.flash+8)w.lure.rotation.y=Math.sin((f-EVENTS.flash+2)*Math.PI/10)*.8;
 const points=[new T.Vector3(w.lure.position.x,7,0),new T.Vector3(w.lure.position.x+.2,(7+w.lure.position.y)/2,0),new T.Vector3(w.lure.position.x+.2,w.lure.position.y,.15)];
 w.line.geometry.dispose();w.line.geometry=new T.BufferGeometry().setFromPoints(points);w.line.visible=w.lure.visible;
 w.plants.forEach((p,i)=>{const wake=f>EVENTS.drive&&f<EVENTS.drive+50?Math.sin((f-EVENTS.drive)*.12)*.055:0;p.rotation.z=Math.sin(t*.8+i)*.025+wake;});
 w.particles.forEach((p,i)=>{p.position.y=((i*1.91+t*.035)%9)-.5;p.position.x=(i*1.37)%18-9+Math.sin(t*.4+i)*.06;});
 w.minnows.forEach((m,i)=>{m.position.x=((i*.8+t*.15)%12)-6;m.rotation.z=Math.sin(t*3+i)*.025;});
 const turn=at('turns',29);w.fish.rotation.y=smooth(turn-6,turn+12,f)*.08;
 if(f>=246&&f<276){c.position.y=6.3-smooth(246,276,f)*3.3;c.lookAt(0,2.5,0);}
}
const EVENTsContact=EVENTS.jaws+7;
