import React, {useLayoutEffect, useMemo, useRef} from 'react';
import * as THREE from 'three';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree, useFrame} from '@react-three/fiber';
import {EffectComposer, EffectPass, RenderPass} from 'postprocessing';
import {LensBlur} from '../../../templates/bridge/lensblur';

type V = [number,number,number];
const P = Math.PI;
const clamp = (n:number) => Math.max(0,Math.min(1,n));
const smooth = (n:number) => {const t=clamp(n);return t*t*(3-2*t);};
const lerp = (a:number,b:number,t:number) => a+(b-a)*t;
const mix = (a:V,b:V,t:number):V => [lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
const ease = (f:number,a:number,b:number) => smooth((f-a)/(b-a));
const keys = (f:number, values:[number,V][]):V => {
  for(let i=1;i<values.length;i++) if(f<=values[i][0]) return mix(values[i-1][1],values[i][1],ease(f,values[i-1][0],values[i][0]));
  return values[values.length-1][1];
};
export const FRAMES = 480;
export const CUTS = [0,54,114,165,222,285,339,396,480] as const;

const Metal:React.FC<{color?:string}> = ({color='#b5bfc3'}) => <meshStandardMaterial color={color} metalness={.8} roughness={.28}/>;
const Ball:React.FC<{p?:V;s:V;c:string;rough?:number}> = ({p=[0,0,0],s,c,rough=.46}) =>
  <mesh position={p} scale={s} castShadow receiveShadow><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color={c} roughness={rough}/></mesh>;
const Box:React.FC<{p:V;s:V;c:string;rough?:number}> = ({p,s,c,rough=.68}) =>
  <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshStandardMaterial color={c} roughness={rough}/></mesh>;
const Wire:React.FC<{points:V[];radius?:number;color?:string;metal?:boolean}> = ({points,radius=.016,color='#a1aaa8',metal=true}) => {
  const geo=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),24,radius,7,false),[points,radius]);
  return <mesh geometry={geo} castShadow><meshStandardMaterial color={color} metalness={metal ? .8 : .05} roughness={metal ? .28 : .8}/></mesh>;
};
const Ring:React.FC<{p?:V;r?:number;rotation?:V}> = ({p=[0,0,0],r=.065,rotation=[0,0,0]}) =>
  <mesh position={p} rotation={rotation}><torusGeometry args={[r,.014,8,28]}/><Metal/></mesh>;
const Treble:React.FC<{p:V;scale?:number}> = ({p,scale=1}) => <group position={p} scale={scale}>
  <Ring p={[0,.08,0]} r={.045}/><Wire points={[[0,.04,0],[0,-.17,0],[0,-.27,0]]} radius={.018}/>
  {[0,1,2].map(i=><group key={i} rotation={[0,i*2*P/3,0]}>
    <Wire radius={.017} points={[[0,-.12,0],[.03,-.28,0],[.12,-.36,0],[.23,-.30,0],[.26,-.15,0],[.21,-.10,0]]}/>
  </group>)}
</group>;

const SoftBait:React.FC = () => {
  const geom=useMemo(()=>{
    const profile=[[-1.52,.045],[-1.38,.075],[-1.13,.10],[-.86,.16],[-.53,.23],[-.25,.24],[-.08,.17],[0,.075]].map(([y,r])=>new THREE.Vector2(r,y));
    const g=new THREE.LatheGeometry(profile,40);
    const a=g.attributes.position;const colors=[];
    const dark=new THREE.Color('#556c22'), bright=new THREE.Color('#bec94b'), belly=new THREE.Color('#e6dfb1');
    for(let i=0;i<a.count;i++){
      const z=a.getZ(i);const y=a.getY(i);const band=Math.sin(28*y+z*10)*.06;
      const c=(z<0?dark.clone().lerp(bright,clamp(1+z*4+band)):bright.clone().lerp(belly,clamp(z*4+band)));
      colors.push(c.r,c.g,c.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return g;
  },[]);
  return <group>
    <mesh geometry={geom} scale={[1,1,.70]} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={.36}/></mesh>
    <Ball p={[.065,-1.56,.02]} s={[.21,.095,.13]} c="#a3b23c" rough={.42}/>
    <Ball p={[0,-1.42,0]} s={[.075,.19,.09]} c="#a0ae38"/>
    {[1,-1].map(sign=><group key={sign}>
      <Ball p={[.055,-.18,.152*sign]} s={[.076,.076,.023]} c="#d4b75e" rough={.3}/>
      <Ball p={[.057,-.18,.174*sign]} s={[.036,.039,.013]} c="#161a14" rough={.16}/>
      <Wire points={[[.14,-.32,.105*sign],[.19,-.39,.095*sign],[.13,-.48,.12*sign]]} color="#7e8d39" radius={.009} metal={false}/>
    </group>)}
    <Ring p={[0,.035,.035]} r={.048}/>
  </group>;
};
const Plug:React.FC=()=> <group>
  <Ball p={[0,-.31,0]} s={[.17,.37,.115]} c="#de7830" rough={.27}/>
  <Ball p={[.025,-.48,.06]} s={[.11,.20,.075]} c="#f1b455" rough={.3}/>
  <Ball p={[0,-.10,.105]} s={[.048,.052,.025]} c="#211a12" rough={.18}/>
  <mesh position={[0,-.04,.1]} rotation={[.4,0,0]}><boxGeometry args={[.21,.11,.035]}/><meshStandardMaterial color="#d4dcd6" transparent opacity={.75}/></mesh>
  <Ring/><Treble p={[0,-.64,0]} scale={.62}/>
</group>;
const Spoon:React.FC=()=> <group>
  <mesh position={[0,-.32,0]} rotation={[0,.32,.08]} scale={[.20,.40,.05]} castShadow><sphereGeometry args={[1,28,16]}/><Metal color="#d4d8d9"/></mesh>
  <Wire points={[[0,-.03,.05],[.02,-.29,.08],[0,-.62,.04]]} color="#9a9c9a" radius={.012}/>
  <Ring/><Treble p={[0,-.68,0]} scale={.65}/>
</group>;
const Striped:React.FC=()=> <group>
  <Ball p={[0,-.29,0]} s={[.15,.34,.115]} c="#686c45" rough={.31}/>
  {[-.12,-.24,-.36,-.48].map((y,i)=><Ball key={i} p={[.025,y,.09]} s={[.105,.029,.035]} c="#262c24"/>)}
  <Ball p={[0,-.12,.115]} s={[.044,.045,.018]} c="#e0c971"/>
  <Ball p={[0,-.12,.132]} s={[.025,.026,.012]} c="#171b15"/>
  <Ring/><Treble p={[0,-.60,0]} scale={.62}/>
</group>;
const Cluster:React.FC<{f:number;open:number;motion:number}> = ({f,open,motion}) => {
  const swing=Math.sin(f*.15)*motion;
  return <group>
    <Ring p={[0,-.025,.035]} r={.07}/>
    <group rotation={[0,0,open*.65]}>
      <Wire radius={.021} points={[[0,.015,0],[.09,.065,0],[.12,-.035,0],[.06,-.13,0],[0,-.085,0]]}/>
    </group>
    <Wire points={[[0,-.10,0],[.10,-.40,-.09],[.23,-.77,.05],[.17,-1.08,.02],[.24,-1.48,.02]]} color="#686e69" radius={.023}/>
    <Treble p={[.23,-.77,.05]} scale={.82}/><Treble p={[.24,-1.48,.02]} scale={.83}/>
    <Wire points={[[.23,-.74,.05],[-.21,-.82,.04],[-.54,-.91,.06]]} radius={.012} color="#747c75"/>
    <Wire points={[[.24,-1.10,.02],[.52,-1.12,.04],[.63,-1.35,.06]]} radius={.012} color="#747c75"/>
    <Wire points={[[.24,-1.48,.02],[.02,-1.68,-.03],[-.12,-1.93,.08]]} radius={.012} color="#747c75"/>
    <group position={[-.54,-.91,.06]} rotation={[.14,0,-.17+swing*.10]}><Plug/></group>
    <group position={[.63,-1.35,.06]} rotation={[.12,.22,.16+swing*.13]}><Spoon/></group>
    <group position={[-.12,-1.93,.08]} rotation={[-.13,0,-.16+swing*.09]}><Striped/></group>
  </group>;
};

const ClearPanel:React.FC<{p:V;s:V}> = ({p,s})=><mesh position={p} renderOrder={3}>
  <boxGeometry args={s}/><meshStandardMaterial color="#cfe3e6" transparent opacity={.11} roughness={.14} metalness={.12} depthWrite={false}/>
</mesh>;
const Case:React.FC<{lid:number;latch:number;contains:boolean}> = ({lid,latch,contains})=><group>
  <Box p={[0,.04,0]} s={[1.95,.08,.71]} c="#788d87" rough={.38}/>
  <ClearPanel p={[0,.17,-.37]} s={[2.00,.26,.045]}/><ClearPanel p={[0,.17,.37]} s={[2.00,.26,.045]}/>
  <ClearPanel p={[-1,.17,0]} s={[.045,.26,.76]}/><ClearPanel p={[1,.17,0]} s={[.045,.26,.76]}/>
  {[-1,1].map(i=><group key={i}><Box p={[i*.99,.29,0]} s={[.035,.035,.76]} c="#b3c1bb" rough={.28}/><Box p={[0,.29,i*.37]} s={[2,.035,.035]} c="#b3c1bb" rough={.28}/></group>)}
  {contains&&<group position={[.77,.17,0]} rotation={[0,0,-P/2]}><SoftBait/></group>}
  <group position={[0,.29,-.38]} rotation={[-lid,0,0]}>
    <ClearPanel p={[0,.025,.38]} s={[2.05,.045,.78]}/>
    {[-1,1].map(i=><group key={i}><Box p={[i*1.01,.02,.38]} s={[.032,.055,.79]} c="#b7c8c4" rough={.3}/><Box p={[0,.02,.38+i*.38]} s={[2.04,.055,.032]} c="#b7c8c4" rough={.3}/></group>)}
    <group position={[0,.02,.78]} rotation={[latch,0,0]}><Box p={[0,-.07,.02]} s={[.24,.16,.065]} c="#a2afaa" rough={.35}/></group>
  </group>
  {[-.65,.65].map(x=><Box key={x} p={[x,.29,-.40]} s={[.20,.09,.09]} c="#899c96" rough={.3}/>)}
</group>;
const Hand:React.FC<{p:V;rotation?:V;left?:boolean;grip?:number}> = ({p,rotation=[0,0,0],left=false,grip=1}) => <group position={p} rotation={rotation} scale={[left?-1:1,1,1]}>
  <Ball p={[.04,.34,-.005]} s={[.19,.31,.11]} c="#b98b69" rough={.72}/>
  <Ball p={[.055,.61,-.01]} s={[.14,.25,.105]} c="#b98b69" rough={.74}/>
  <mesh position={[.06,1.03,-.02]} castShadow><capsuleGeometry args={[.18,.72,8,16]}/><meshStandardMaterial color="#303337" roughness={.92}/></mesh>
  <mesh position={[.06,.65,-.02]}><cylinderGeometry args={[.17,.17,.09,24]}/><meshStandardMaterial color="#24282a" roughness={1}/></mesh>
  {[0,1,2,3].map(i=>{
    const x=-.11+i*.085;const len=[.26,.32,.30,.24][i];
    return <group key={i} position={[x,.20,.04]} rotation={[-.12-grip*.58,0,(i-1.5)*.06]}>
      <Ball p={[0,-len*.32,0]} s={[.043,len*.49,.043]} c="#bc906e" rough={.75}/>
      <group position={[0,-len*.57,0]} rotation={[-grip*.82,0,0]}><Ball p={[0,-len*.25,0]} s={[.039,len*.36,.04]} c="#c69b7a" rough={.69}/></group>
    </group>;
  })}
  <group position={[-.12,.30,.035]} rotation={[.12,0,-.60-grip*.25]}>
    <Ball p={[0,-.12,.025]} s={[.059,.16,.054]} c="#c39978" rough={.72}/>
    <Ball p={[0,-.22,.03]} s={[.053,.082,.052]} c="#c39978" rough={.72}/>
  </group>
</group>;
const Bench:React.FC=()=> <group>
  <Box p={[0,-.12,0]} s={[7.8,.24,4.7]} c="#4a4d4b" rough={.9}/>
  <Box p={[-3,-1.5,-1.5]} s={[.17,2.8,.17]} c="#343938"/>
  <Box p={[3,-1.5,-1.5]} s={[.17,2.8,.17]} c="#343938"/>
  <group position={[-1.30,.08,0]}>
    <Box p={[0,0,0]} s={[2.35,.10,2.75]} c="#252d2d"/>
    {[-1,1].map(i=><group key={i}>
      <Box p={[i*1.17,.13,0]} s={[.09,.31,2.84]} c="#303b3b"/>
      <Box p={[0,.13,i*1.40]} s={[2.43,.31,.09]} c="#303b3b"/>
    </group>)}
    <Box p={[-.73,.11,-.83]} s={[.06,.22,1.1]} c="#384344"/>
    <group position={[-.95,.19,-.75]} rotation={[-P/2,0,0]} scale={.60}><Striped/></group>
    <group position={[-.87,.18,.67]} rotation={[-P/2,0,.2]} scale={.50}><Spoon/></group>
  </group>
</group>;
const Bag:React.FC=()=> <group>
  <Ball p={[0,1.05,-.42]} s={[1.23,2.5,.48]} c="#2c3031" rough={.94}/>
  <Ball p={[0,-2.0,-.37]} s={[1.0,.85,.49]} c="#303637" rough={.9}/>
  <Ball p={[0,.10,.01]} s={[1.33,1.45,.50]} c="#333d2c" rough={.98}/>
  <Ball p={[.14,-.16,.42]} s={[1.02,.95,.24]} c="#404b34" rough={.96}/>
  <Wire points={[[-.98,.57,.39],[-.73,.90,.46],[0,1.07,.48],[.76,.86,.46],[.98,.51,.39]]} radius={.035} color="#242d24" metal={false}/>
  <Wire points={[[-.78,-.48,.58],[-.41,-.70,.62],[.44,-.70,.62],[.90,-.45,.55]]} radius={.023} color="#222b21" metal={false}/>
  <Box p={[-.91,.97,.51]} s={[.19,.35,.09]} c="#737b54" rough={1}/>
  <Wire points={[[-.99,1.09,.60],[-1.03,.84,.64],[-.83,.83,.64],[-.83,1.09,.60]]} radius={.041} color="#78805a" metal={false}/>
  <Box p={[.28,-.24,.75]} s={[1.94,.13,.09]} c="#596246" rough={1}/>
  {[-1,1].map(i=><group key={i} position={[i*.82,1.55,-.06]} rotation={[0,0,-i*.19]}>
    <Box p={[0,0,0]} s={[.24,1.43,.17]} c="#4c5640" rough={1}/>
  </group>)}
</group>;

function poses(f:number) {
  const release=ease(f,165,180);
  const slide=ease(f,396,417);
  const step=ease(f,453,480)*.32;
  const posBait=keys(f,[[0,[-1.14,2.93,.08]],[34,[-1.14,3.47,.08]],[54,[-1.10,3.47,.08]],[78,[.35,3.28,.08]],[100,[.35,3.12,.08]],[114,[-1.15,3.06,-.30]],[165,[-1.15,3.06,-.30]],[188,[-.99,3.59,-.30]],[222,[-.82,3.29,-.18]],[244,[2.07,.17,0]],[480,[2.07,.17,0]]]);
  const rig= f<180 ? [posBait[0]+.06,posBait[1]-.07,posBait[2]+.10] as V :
    f<339 ? keys(f,[[180,[-1.09,3.02,-.20]],[199,[-1.37,.20,-1.19]],[285,[-1.37,.20,-1.19]],[320,[-1.37,.20,-1.19]],[339,[-1.36,3.04,-1.19]]]) :
    keys(f,[[339,[4.42,1.18,.77]],[365,[4.85,.98,.80]],[382,[4.85,.98,.80]],[453,[4.85,.98,.80]],[480,[5.17,.98,.80]]]);
  const lay=ease(f,182,199)*(1-ease(f,321,339));
  if(f>=180&&f<339) rig[1]=Math.max(rig[1],.18+2.83*Math.cos(P/2*lay));
  const caseP:V=f<396?[1.30,.04,0]:[6.08+step,lerp(.78,.13,slide),.80];
  const caseRot:V=f<396?[0,0,0]:[P/2,0,0];
  const lid=(1-ease(f,255,270))*1.12;
  const latch=(1-ease(f,285,295))*.8;
  return {posBait,rig,lay,caseP,caseRot,lid,latch,step,release,slide};
}
type Cam={eye:V;at:V;lens:number;focus?:V;blur?:number;up?:V};
function cameraAt(f:number):Cam {
  if(f<54){const t=ease(f,10,35);return {eye:[-1.20,2.56,6.25],at:[-1.10,lerp(1.55,2.09,t),.05],lens:50};}
  if(f<114){const t=ease(f,57,83);return {eye:[lerp(-.65,.46,t),2.85,5.10],at:[lerp(-.18,.38,t),1.80,.0],lens:28};}
  if(f<165){const t=ease(f,123,146);return {eye:[-1.12,3.35,lerp(1.90,1.56,t)],at:[-1.09,3.03,-.20],lens:85};}
  if(f<222)return {eye:[-1.12,3.45,3.35],at:[-1.03,3.28,-.22],lens:100};
  if(f<285)return {eye:[1.08,6.45,0],at:[1.08,.08,0],up:[0,0,-1],lens:50};
  if(f<339){const focus=mix([1.30,.28,.38],[-1.37,.22,-1.19],ease(f,305,320));return {eye:[.1,2.12,7.45],at:[-.03,.35,-.28],lens:50,focus,blur:30};}
  if(f<396)return {eye:[4.88,1.20,2.85],at:[4.85,.98,.77],lens:85};
  const t=ease(f,396,408);return {eye:[5.73,1.0,lerp(3.10,5.0,t)],at:[5.67,lerp(.40,-.12,t),.55],lens:28};
}
const Scene:React.FC=()=>{
  const f=useCurrentFrame();const {camera,scene,gl}=useThree();
  const p=poses(f);const c=cameraAt(f);
  const fx=useMemo(()=>new LensBlur({maxCoC:18,nearScale:1.15}),[]);
  const composer=useRef<EffectComposer|null>(null);
  useLayoutEffect(()=>{
    const comp=new EffectComposer(gl,{multisampling:0});
    comp.addPass(new RenderPass(scene,camera));
    comp.addPass(new EffectPass(camera,fx.main));
    const size=gl.getSize(new THREE.Vector2());comp.setSize(size.x,size.y);composer.current=comp;
    return()=>{composer.current=null;comp.dispose();};
  },[camera,scene,gl,fx]);
  const paint=()=>{
    const cam=camera as THREE.PerspectiveCamera;
    cam.position.set(...c.eye);cam.up.set(...(c.up??[0,1,0]));cam.fov=2*Math.atan(36/(2*c.lens))*180/P;
    cam.lookAt(...c.at);cam.updateProjectionMatrix();cam.updateMatrixWorld();
    scene.updateMatrixWorld(true);
    if(c.focus&&composer.current){
      const dir=cam.getWorldDirection(new THREE.Vector3());
      fx.focus=Math.max(.2,new THREE.Vector3(...c.focus).sub(cam.position).dot(dir));fx.cInf=c.blur??0;
      composer.current.render(1/30);
    } else {gl.setRenderTarget(null);gl.render(scene,cam);}
  };
  useFrame(paint,1);useLayoutEffect(paint);
  const baitRotation:V=[0,0,-P/2*ease(f,222,243)];
  const right:V=f<244?[p.posBait[0]-.025,p.posBait[1]+.045,p.posBait[2]+.16]:
    f<285?keys(f,[[244,[2.05,.45,.12]],[258,[1.58,.51,.27]],[274,[1.30,.40,.46]],[285,[1.30,.33,.46]]]):
    f<339?keys(f,[[285,[1.30,.33,.46]],[295,[1.30,.30,.46]],[304,[1.30,.55,.46]],[321,[-1.37,.30,-1.19]],[339,[-1.36,3.14,-1.19]]]):
    f<396?keys(f,[[339,[4.48,1.23,.90]],[365,[4.85,1.04,.94]],[383,[4.95,1.11,.99]],[396,[5.4,.90,1.0]]]):
    keys(f,[[396,[6.08,.90,1.0]],[417,[6.08,.28,1.0]],[430,[6.64,.48,1.0]],[441,[6.30,.20,1.0]],[448,[6.30,.20,1.0]],[453,[6.60,.68,1.0]],[480,[6.96,.68,1.0]]]);
  const left:V=f<114?keys(f,[[0,[-2.50,.10,.12]],[100,[-2.50,.10,.12]],[114,[.00,.42,.14]]]):
    f<222?keys(f,[[114,[-1.40,2.88,.03]],[165,[-1.26,2.92,.02]],[185,[-1.17,2.87,.02]],[200,[-1.45,.25,-.88]],[222,[-2.3,.10,-.3]]]):
    f<339?[-2.9,.2,-.6]:[4.80,.7,.95];
  return <>
    <color attach="background" args={['#323635']}/>
    <ambientLight intensity={.64}/>
    <hemisphereLight args={['#e5e9e5','#555a52',1.05]}/>
    <directionalLight position={[-3,7,4]} intensity={2.6} color="#fff1df" castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7} shadow-bias={-.0006}/>
    <directionalLight position={[4,4,1]} intensity={.75} color="#e0ebed"/>
    <directionalLight position={[1,3,-4]} intensity={1.55} color="#edf0e5"/>
    <Box p={[1,-3.1,0]} s={[24,.15,20]} c="#343837"/>
    <Box p={[1,2,-3.6]} s={[24,10,.18]} c="#424644"/>
    {f<339&&<Bench/>}
    {f>=339&&<group position={[5.78+p.step,0,0]}><Bag/></group>}
    {f<244&&<group position={p.posBait} rotation={baitRotation}><SoftBait/></group>}
    <group position={p.rig} rotation={[-P/2*p.lay,0,0]}>
      <Cluster f={f} open={p.release*(1-ease(f,345,368))} motion={f<114 ? .7 : f>408 ? .3 : .12}/>
    </group>
    {f<339||f>=396?<group position={p.caseP} rotation={p.caseRot}><Case lid={p.lid} latch={p.latch} contains={f>=244}/></group>:null}
    {f>=339&&<Wire points={[[4.85+p.step,1.05,.69],[4.85+p.step,1.14,.79],[4.85+p.step,.98,.80]]} radius={.025} color="#aaaeb0"/>}
    <Hand p={right} rotation={f>=396?[0,0,-.28]:f>=222&&f<339?[-.60,0,-.28]:[.06,0,-.14]} grip={f>=244&&f<321 ? .2 : 1}/>
    {((f>=100&&f<222)||(f>=339&&f<382))&&<Hand p={left} rotation={[.10,0,1.0]} left grip={f<165 ? .4 : 1}/>}
  </>;
};
const Reel:React.FC<{clean:boolean}>=({clean})=>{
  const f=useCurrentFrame();const copy=f<114?'Just one lure today.':f>=408?"Accessories don't count.":null;
  return <AbsoluteFill style={{background:'#323635'}}>
    <ThreeCanvas width={1080} height={1920} shadows gl={{antialias:true,preserveDrawingBuffer:true,toneMappingExposure:1.05}} camera={{fov:40,near:.05,far:80}}>
      <Scene/>
    </ThreeCanvas>
    {!clean&&copy&&<div style={{position:'absolute',left:90,top:260,width:780,fontFamily:'Inter,Arial,sans-serif',fontWeight:700,fontSize:66,lineHeight:'78px',letterSpacing:'-1px',color:'#fff',textShadow:'0px 1px 3px rgba(0,0,0,.45)'}}>{copy}</div>}
  </AbsoluteFill>;
};
export const AccessoriesDontCount3D:React.FC=()=> <Reel clean={false}/>;
export const AccessoriesDontCount3DClean:React.FC=()=> <Reel clean/>;
