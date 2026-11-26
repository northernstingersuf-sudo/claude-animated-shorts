import * as T from 'three';
import {card,fishArt,fishermanArt,terrainTexture,painted} from './art';
export class PikeWorld {
 root=new T.Group(); water=new T.Group(); shore=new T.Group(); fish=new T.Group(); lure=new T.Group(); tail:T.Mesh; jaw:T.Mesh; angler:T.Mesh; rod:T.Mesh;
 plants:T.Group[]=[]; particles:T.Mesh[]=[]; minnows:T.Mesh[]=[]; line:T.Line; castLine:T.Line; castLure:T.Mesh; ripple:T.Mesh;
 constructor(){
 this.root.add(this.water,this.shore);
 this.root.add(new T.HemisphereLight('#d8f6e0','#53627b',2));const sun=new T.DirectionalLight('#ffddb0',2.2);sun.position.set(5,12,8);this.root.add(sun);
 const ground=new T.Mesh(new T.PlaneGeometry(90,80),new T.MeshLambertMaterial({map:terrainTexture(),color:'#a4af8b'}));ground.rotation.x=-Math.PI/2;ground.position.y=-.7;this.water.add(ground);
 for(let i=0;i<34;i++){
 const rock=new T.Mesh(new T.DodecahedronGeometry(.3+(i%5)*.12,1),new T.MeshLambertMaterial({map:terrainTexture(),color:i%2?'#879e9a':'#b5b298'}));rock.position.set((i*3.731)%18-9,-.45,-(i*2.371)%16);rock.scale.set(1.4,.7,1);this.water.add(rock);
 }
 for(let i=0;i<52;i++){
 const p=new T.Group();p.position.set((i*2.719)%17-8.5,-.65,(i*1.381)%10-12);
 const h=1.7+(i%7)*.38;
 for(let j=0;j<6;j++){
 const s=new T.Shape();s.moveTo(0,0);s.bezierCurveTo(-.12,h*.5,-.5,h*.75,0,h);s.bezierCurveTo(.28,h*.7,.15,h*.3,0,0);
 const leaf=new T.Mesh(new T.ShapeGeometry(s),new T.MeshLambertMaterial({color:['#668b5e','#76a278','#428079'][i%3],side:T.DoubleSide}));leaf.rotation.z=(j-2.5)*.14;leaf.rotation.y=j*.7;p.add(leaf);
 }this.plants.push(p);this.water.add(p);
 }
 // Near framing reeds are kept outside the central sight line.
 for(const x of [-4.2,4.2]){const p=this.plants[Math.round(x+5)];p.position.set(x,-1,3.8);p.scale.setScalar(1.4);}
 const body=card(fishArt('body'),6,2.4);this.tail=card(fishArt('tail'),6,2.4);this.jaw=card(fishArt('jaw'),6,2.4);this.fish.add(body,this.tail,this.jaw);this.water.add(this.fish);
 this.lure.add(card(fishArt('lure'),2.3,.92));this.water.add(this.lure);
 this.line=new T.Line(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#cee7d8',transparent:true,opacity:.65}));this.water.add(this.line);
 for(let i=0;i<100;i++){const p=new T.Mesh(new T.SphereGeometry(.011+i%3*.007,4,3),new T.MeshBasicMaterial({color:'#c5e0cc',transparent:true,opacity:.22}));p.position.set((i*1.37)%18-9,(i*1.91)%9,-(i*.79)%15);this.particles.push(p);this.water.add(p);}
 for(let i=0;i<8;i++){const m=card(fishArt('lure'),.9,.36);m.position.set(i*.8-4,4+(i%3)*.3,-7);this.minnows.push(m);this.water.add(m);}
 // Surface glints / shafts: spatial light cards, not diagnostic diagrams.
 for(let i=0;i<10;i++){const ray=new T.Mesh(new T.PlaneGeometry(1+i%3*.3,11),new T.MeshBasicMaterial({map:painted(64,256,g=>{const a=g.createLinearGradient(0,0,64,0);a.addColorStop(0,'#ffffff00');a.addColorStop(.5,'#dceccf');a.addColorStop(1,'#ffffff00');g.fillStyle=a;g.fillRect(0,0,64,256);}),color:'#dbf2c4',transparent:true,opacity:.045,depthWrite:false,side:T.DoubleSide}));ray.position.set(i*2-9,4,-5-i%3);ray.rotation.z=-.35;this.water.add(ray);}
 const surface=new T.Mesh(new T.PlaneGeometry(80,60),new T.MeshPhongMaterial({color:'#70bbac',transparent:true,opacity:.12,depthWrite:false,side:T.DoubleSide,shininess:80}));surface.rotation.x=Math.PI/2;surface.position.y=7;this.water.add(surface);
 const lake=new T.Mesh(new T.PlaneGeometry(100,100),new T.MeshPhongMaterial({color:'#66a8ba',shininess:60}));lake.rotation.x=-Math.PI/2;lake.position.y=-.8;this.shore.add(lake);
 const bank=new T.Mesh(new T.BoxGeometry(12,1,6),new T.MeshLambertMaterial({map:terrainTexture(),color:'#c6b991'}));bank.position.set(-4,-.6,0);this.shore.add(bank);
 this.angler=card(fishermanArt(),2.4,4);this.angler.position.set(-1,1.9,1);this.shore.add(this.angler);
 this.rod=new T.Mesh(new T.CylinderGeometry(.018,.03,4,8).translate(0,2,0),new T.MeshLambertMaterial({color:'#332c3d'}));this.rod.position.set(-.34,2.14,1.02);this.shore.add(this.rod);
 this.castLure=card(fishArt('lure'),1,.4);this.shore.add(this.castLure);this.castLine=new T.Line(new T.BufferGeometry(),new T.LineBasicMaterial({color:'#e6edd6'}));this.shore.add(this.castLine);this.ripple=new T.Mesh(new T.RingGeometry(.6,.62,48),new T.MeshBasicMaterial({color:'#e1e9d1',transparent:true,opacity:.7,side:T.DoubleSide}));this.ripple.rotation.x=-Math.PI/2;this.ripple.position.set(2.4,-.75,1);this.shore.add(this.ripple);
 for(let i=0;i<12;i++){const trunk=new T.Mesh(new T.CylinderGeometry(.1,.17,3,7),new T.MeshLambertMaterial({color:'#726052'}));trunk.position.set(i*2-12,1,-7);this.shore.add(trunk);const crown=new T.Mesh(new T.ConeGeometry(1.5,5,8),new T.MeshLambertMaterial({color:'#5c8b75'}));crown.position.set(i*2-12,4,-7);this.shore.add(crown);}
 }
}
