import * as T from 'three';
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);
export const smooth=(t:number)=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t)};
const ease=(t:number,a:number,b:number)=>smooth((t-a)/(b-a));
const mat=(c:string,r=.45,m=0)=>new T.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const steel=mat('#9aa9b1',.22,.88), black=mat('#151b1e',.65), skin=mat('#bd8d70',.62), nail=mat('#d9b49c',.42);
function mesh(g:T.BufferGeometry,m:T.Material,p:T.Vector3,s?:T.Vector3){const o=new T.Mesh(g,m);o.position.copy(p);if(s)o.scale.copy(s);o.castShadow=true;o.receiveShadow=true;return o}
function box(parent:T.Object3D,p:number[],s:number[],m:T.Material){const o=mesh(new T.BoxGeometry(...s as [number,number,number]),m,V(...p));parent.add(o);return o}
function ball(parent:T.Object3D,p:number[],s:number[],m:T.Material){const o=mesh(new T.SphereGeometry(1,24,16),m,V(...p),V(...s));parent.add(o);return o}
function wire(parent:T.Object3D,pts:number[][],r=.018,m:T.Material=steel){const c=new T.CatmullRomCurve3(pts.map(p=>V(...p)));const o=mesh(new T.TubeGeometry(c,40,r,8,false),m,V());parent.add(o);return o}
function ring(parent:T.Object3D,p:number[],r=.075){const o=mesh(new T.TorusGeometry(r,.013,8,36),steel,V(...p));parent.add(o);return o}
function texture(kind:'bait'|'cloth'|'bench',color:string){const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d')!;ctx.fillStyle=color;ctx.fillRect(0,0,512,512);for(let y=0;y<512;y+=kind==='bait'?18:4){for(let x=0;x<512;x+=kind==='bait'?22:4){const n=((x*31+y*17)%53)/53;ctx.strokeStyle=`rgba(${kind==='bait'?'225,237,151':'165,170,162'},${.025+n*.1})`;if(kind==='bait'){ctx.beginPath();ctx.arc(x+(y%36?11:0),y,10,0,Math.PI);ctx.stroke()}else{ctx.fillStyle=`rgba(5,10,12,${n*.16})`;ctx.fillRect(x,y,2,kind==='cloth'?3:1)}}}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;return t}
function fish(color:string,length=1.6,stripes=false){const g=new T.Group();const tex=texture('bait',color);const body=new T.MeshStandardMaterial({map:tex,roughness:.31,metalness:.08});const geo=new T.LatheGeometry(new T.SplineCurve([new T.Vector2(.01,-length*.86),new T.Vector2(.06,-length*.76),new T.Vector2(.12,-length*.58),new T.Vector2(.17,-length*.35),new T.Vector2(.165,-length*.16),new T.Vector2(.10,-length*.035),new T.Vector2(.015,0)]).getPoints(80),64);const b=mesh(geo,body,V());b.scale.z=.65;g.add(b);
ball(g,[0,-length*.35,.095],[.105,length*.29,.035],mat('#e2e6b0',.4));
const tail=ball(g,[0,-length*.91,0],[.16,.15,.05],body);tail.rotation.y=.35;
for(const z of [-1,1]){ball(g,[.075,-length*.12,z*.09],[.052,.052,.014],mat('#d9ab32',.27,.45));ball(g,[.075,-length*.12,z*.104],[.025,.027,.008],mat('#080d0c',.2));wire(g,[[.11,-length*.21,z*.08],[.14,-length*.25,z*.08],[.1,-length*.29,z*.09]],.007,mat('#333e21'))}
for(let i=0;i<6;i++)if(stripes){const o=ball(g,[0,-.26-i*.13,.11],[.12,.018,.008],mat('#172220'));o.rotation.z=.3}
return g}
function treble(){const g=new T.Group();wire(g,[[0,.18,0],[0,-.12,0]],.013);for(let i=0;i<3;i++){const a=i*Math.PI*2/3;wire(g,[[0,-.1,0],[Math.cos(a)*.08,-.22,Math.sin(a)*.08],[Math.cos(a)*.16,-.18,Math.sin(a)*.16],[Math.cos(a)*.15,-.06,Math.sin(a)*.15]],.012)}ring(g,[0,.21,0],.035);return g}
function hand(){const g=new T.Group();ball(g,[.28,.16,.03],[.27,.16,.12],skin);const sleeve=mat('#292d30',.88);box(g,[.78,.27,-.03],[.72,.36,.32],sleeve);for(let i=0;i<4;i++){const finger=wire(g,[[.23,.14-i*.065,.1],[.07,.12-i*.06,.16],[-.04,.10-i*.055,.10]],.045,skin);ball(g,[-.035,.10-i*.055,.131],[.045,.043,.014],nail);finger.castShadow=true}wire(g,[[.36,.25,.08],[.12,.30,.13],[-.045,.19,.1]],.065,skin);return g}
export class AccessoriesWorld {
 root=new T.Group();hero=fish('#799b25');rig=new T.Group();passengers=new T.Group();gate=new T.Group();right=hand();left=hand();case=new T.Group();lid=new T.Group();bag=new T.Group();torso=new T.Group();tray=new T.Group();clasp=new T.Group();
 constructor(){
 const floor=mat('#34393b',.9);floor.map=texture('bench','#44494a');floor.map.repeat.set(6,6);box(this.root,[0,-.16,0],[15,.3,10],floor);box(this.root,[0,3,-4],[15,8,.2],mat('#262c2d',.96));
 // Quiet architecture: wall seams, bench apron, screw heads, nothing decorative.
 for(let x=-6;x<=6;x+=3)box(this.root,[x,2,-3.88],[.025,5,.025],mat('#202626'));
 box(this.root,[0,-.5,2.8],[12,.6,.12],mat('#24282a'));
 const tr=mat('#202a2d',.53);box(this.tray,[0,0,0],[2.6,.12,2.9],tr);for(const z of [-1.45,1.45])box(this.tray,[0,.18,z],[2.65,.36,.05],tr);for(const x of [-1.3,1.3,-.45,.45])box(this.tray,[x,.16,0],[.045,.3,2.9],tr);this.tray.position.set(-1.4,.03,-.08);this.root.add(this.tray);
 const clear=new T.MeshPhysicalMaterial({color:'#b3d9de',roughness:.18,metalness:.04,transparent:true,opacity:.15,depthWrite:false,side:T.DoubleSide});const edge=mat('#b4ced0',.2,.35);
 box(this.case,[0,.02,0],[1.94,.04,.64],clear);for(const x of [-.97,.97]){box(this.case,[x,.19,0],[.035,.38,.65],clear);box(this.case,[x,.38,0],[.022,.022,.65],edge)}for(const z of [-.32,.32]){box(this.case,[0,.19,z],[1.94,.38,.025],clear);box(this.case,[0,.38,z],[1.94,.018,.018],edge)}
 this.lid.position.set(0,.39,-.33);box(this.lid,[0,0,.33],[2,.025,.67],clear);for(const x of [-.99,.99])box(this.lid,[x,0,.33],[.018,.024,.67],edge);for(const z of [0,.66])box(this.lid,[0,0,z],[2,.024,.018],edge);this.case.add(this.lid);this.clasp.position.set(0,.28,.35);box(this.clasp,[0,0,0],[.22,.17,.045],edge);box(this.clasp,[0,0,.03],[.12,.06,.025],black);this.case.add(this.clasp);for(const x of [-.65,.65])box(this.case,[x,.38,-.34],[.19,.07,.09],edge);this.root.add(this.case);
 // Unbranded front snap and a cable with two distinct treble positions.
 ring(this.rig,[0,0,0],.075);wire(this.rig,[[0,-.075,0],[-.15,-.65,.01],[-.12,-1.28,0]],.015);for(const y of [-.65,-1.25]){const hook=treble();hook.position.set(-.12,y,.04);this.rig.add(hook)}
 wire(this.gate,[[-.055,.02,0],[.06,.15,0],[.10,.05,0]],.017);this.rig.add(this.gate);
 const orange=fish('#cb571d',1.05);orange.position.set(-.3,-1.35,.10);orange.rotation.z=-.38;this.passengers.add(orange);const stripe=fish('#94a08d',1.18,true);stripe.position.set(.36,-1.05,-.015);stripe.rotation.z=.32;this.passengers.add(stripe);const spoon=new T.Group();ball(spoon,[0,-.42,0],[.16,.43,.045],mat('#cad2d7',.18,.92));for(let i=0;i<6;i++)ball(spoon,[Math.sin(i)*.07,-.13-i*.1,.047],[.024,.024,.007],steel);ring(spoon,[0,0,0],.045);const h=treble();h.position.y=-.96;spoon.add(h);spoon.position.set(.02,-1.75,.26);spoon.rotation.z=-.18;this.passengers.add(spoon);
 for(const [x,y,z] of [[-.3,-1.35,.1],[.36,-1.05,0],[0,-1.75,.26]]){wire(this.passengers,[[-.12,-1.0,0],[x*.4,y+.2,z],[x,y,z]],.012);ring(this.passengers,[x,y,z],.055)}
 this.rig.add(this.passengers);this.root.add(this.rig,this.hero,this.right,this.left);
 // Woven olive bag, piping, zipper teeth, webbing, seam lines and buckle hardware.
 const fabric=mat('#414a31',.94);fabric.map=texture('cloth','#414a31');fabric.map.repeat.set(5,5);ball(this.bag,[0,0,0],[1.55,1.82,.5],fabric);box(this.bag,[.45,-.42,.47],[1.9,1.35,.18],fabric);for(const x of [-1.2,1.2]){box(this.bag,[x,0,.40],[.16,2.8,.12],black);for(let i=0;i<25;i++)box(this.bag,[x,-1.2+i*.10,.47],[.18,.013,.016],mat('#6c735e',.9))}
 wire(this.bag,[[-1.25,-1.30,.35],[-1.4,1.15,.25],[0,1.65,.27],[1.4,1.15,.25],[1.25,-1.3,.35]],.025,mat('#697157',.9));wire(this.bag,[[-.5,1.55,0],[-.45,2.1,0],[.45,2.1,0],[.5,1.55,0]],.075,black);
 for(let i=0;i<46;i++)box(this.bag,[-.46+i*.04,.25,.59],[.018,.04,.025],steel);const zip=ring(this.bag,[1.26,.2,.61],.08);zip.scale.y=1.6;
 box(this.bag,[.48,-.95,.65],[1.99,.18,.07],black);box(this.bag,[-.88,.77,.50],[.16,.40,.09],black);ring(this.bag,[-.88,.65,.57],.12);
 ball(this.torso,[0,1,-.5],[2.1,3,.5],mat('#272b2e',.91));this.root.add(this.torso,this.bag);
 const key=new T.DirectionalLight('#fff5e8',4.1);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=7;key.shadow.camera.bottom=-4;key.shadow.normalBias=.025;key.shadow.bias=-.0002;key.shadow.radius=4;this.root.add(key);const fill=new T.DirectionalLight('#e7eff3',1.4);fill.position.set(4,4,3);this.root.add(fill);const rim=new T.DirectionalLight('#f4fbff',3);rim.position.set(0,5,-3);this.root.add(rim,new T.HemisphereLight('#b7c6cd','#39392f',1.1));
 }
 update(f:number,cam:T.PerspectiveCamera){const t=f/30;let nose=V(-.7,3.15+.4*ease(t,.2,1.2),0);let rig=nose.clone().add(V(.17,-.14,.06));let rz=0;let hp=nose.clone();let lp=V(-3,0,0);let cp=V(1.4,.04,.12);let lid=-Math.PI*.64;let pos=V(0,3.1,8.1),look=V(-.25,2.45,0),fov=37;this.bag.visible=this.torso.visible=t>=11.3;this.tray.visible=t<11.3;this.bag.position.set(0,1.7,0);this.torso.position.set(0,2,0);this.hero.visible=true;this.left.visible=t>=3.25&&t<7.4;this.gate.rotation.z=0;
 if(t<1.8){look.y+=.22*ease(t,.35,1.15)}
 else if(t<3.8){const q=ease(t,1.8,2.65);nose=V(-.7+.85*q,3.55-.48*ease(t,2.5,2.95),0);rig=nose.clone().add(V(.17,-.14,.06));pos=V(-.25+1.0*ease(t,1.9,2.75),4.3,8.7);look=V(.25,1.55,0);fov=40;lp=V(.15,1.0+1.0*ease(t,3.25,3.6),.18)}
 else if(t<7.4){nose=V(-.7,2.95,0);rig=nose.clone().add(V(.17,-.14,.06));lp=V(-.83,2.99,-.05);if(t<5.5){const q=ease(t,4.1,4.85);pos=V(-.45,3.8,3.8-.35*q);look=V(-.58,2.85,0);fov=26;}else{const q=ease(t,5.95,6.25);nose.add(V(.35*q,.56*q,0));rig.y-=2.35*ease(t,6.25,6.85);rig.z-=1.6*ease(t,6.25,6.85);lp.y=rig.y+.18;this.gate.rotation.z=-1.0*ease(t,5.5,5.95);pos=V(-.25,4.1,5.1);look=V(-.45,2.73,0);fov=29;}}
 else if(t<11.3){const q=ease(t,7.4,8.1);nose=V(-.35+2.53*q,2.9-2.65*q,.12);rz=-Math.PI/2*q;rig=V(-1.15,.46,-1.54);lid=-Math.PI*.64*(1-ease(t,8.5,9));if(t<9.5){pos=V(1.0,7.8,.12);look=V(1.0,0,.12);fov=38;cam.up.set(0,0,-1);}else{nose=V(2.18,.25,.12);rz=-Math.PI/2;pos=V(.7,2.8,6.4);look=V(.55,.9,0);fov=35;rig.y+=1.6*ease(t,10.85,11.3);rig.z+=1.2*ease(t,10.85,11.3);hp=V(1.4-1.95*ease(t,10.15,10.8),.48+1.9*ease(t,10.15,10.8),.25);this.clasp.rotation.x=-.4*(1-ease(t,9.5,9.8));}}
 else {this.tray.visible=false;this.case.visible=t>=13.2;rig=V(-.88,2.31,.74);this.gate.rotation.z=-.8*(1-ease(t,11.65,12.3));if(t<13.2){pos=V(-.6,2.5,4.5);look=V(-.85,2.45,.5);fov=23;hp=V(-1.4+ .55*ease(t,11.3,11.65),2.4,.75);hp.x+=2*ease(t,12.5,13.0);}else{const q=ease(t,13.2,13.6);pos=V(0,3.35,5.9+2.6*q);look=V(0,1.8,0);fov=40;cp=V(.55,1.2+.6*(1-ease(t,13.2,13.9)),.85);nose=cp.clone().add(V(.78,.21,0));rz=-Math.PI/2;lid=0;hp=V(1.1,cp.y+.4,1.0);hp.x+=1.7*ease(t,13.9,14.2);const pat=ease(t,14.4,14.65)*(1-ease(t,14.75,15));hp.lerp(V(1.1,cp.y+.45,.95),pat);const step=.22*ease(t,15.1,16);this.bag.position.x=step;this.torso.position.x=step;rig.x+=step;cp.x+=step;nose.x+=step;rig.z+=.035*Math.sin((t-13.2)*7);}}
 if(t<9.5)hp=nose.clone().add(V(.04,.05,.1));this.case.position.copy(cp);this.case.visible=t<11.3||t>=13.2;this.lid.rotation.x=lid;
 this.hero.position.copy(nose);this.hero.rotation.set(0,0,rz);this.rig.position.copy(rig);this.rig.rotation.x=t<6.25?0:t<7.4?-1.42*ease(t,6.25,6.85):t<11.3?-1.42*(1-ease(t,10.85,11.3)):0;this.rig.rotation.z=t<3.8?.045*Math.sin(t*5)*Math.exp(-t*.5):t>=13.2?.025*Math.sin(t*6):0;
 this.right.position.copy(hp);this.left.position.copy(lp);this.left.rotation.z=Math.PI;this.right.visible=true;
 cam.position.copy(pos);if(!(t>=7.4&&t<9.5))cam.up.set(0,1,0);cam.fov=fov;cam.lookAt(look);cam.updateProjectionMatrix();this.root.updateMatrixWorld(true);
 }
 dispose(){this.root.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()}})}
}
