import React,{useMemo,useLayoutEffect,useRef} from 'react';
import * as T from 'three';
import {ThreeCanvas} from '@remotion/three';
import {useThree,useFrame} from '@react-three/fiber';
import {AbsoluteFill,useCurrentFrame,getInputProps} from 'remotion';
import {EffectComposer,RenderPass,EffectPass,ToneMappingEffect,ToneMappingMode} from 'postprocessing';
import {InkPass,noInkFallback} from './ink';
import {LensBlur} from './lensblur';
import {PikeWorld} from './world';
import {pose,shotAt} from './story';
const Inner:React.FC=()=>{
 const f=useCurrentFrame();const {scene,camera,gl}=useThree();
 const world=useMemo(()=>new PikeWorld(),[]);const composer=useRef<EffectComposer|null>(null);
 const lens=useMemo(()=>new LensBlur({maxCoC:20,nearScale:1.1}),[]);
 const paint=()=>{pose(world,f,camera as T.PerspectiveCamera,scene);noInkFallback(world.root);lens.focus=camera.position.distanceTo(new T.Vector3(0,2.5,0));lens.cInf=shotAt(f).blur;scene.updateMatrixWorld(true);composer.current?.render(1/30);};
 useLayoutEffect(()=>{
 gl.toneMapping=T.NoToneMapping;
 const c=new EffectComposer(gl,{multisampling:0,frameBufferType:T.HalfFloatType});
 c.addPass(new RenderPass(scene,camera));c.addPass(new InkPass(scene,camera as T.PerspectiveCamera));
 c.addPass(new EffectPass(camera,lens.pre));c.addPass(new EffectPass(camera,lens.main));
 c.addPass(new EffectPass(camera,new ToneMappingEffect({mode:ToneMappingMode.NEUTRAL})));
 const size=gl.getSize(new T.Vector2());c.setSize(size.x,size.y);composer.current=c;
 return()=>{composer.current=null;c.dispose();};
 },[camera,gl,scene,lens]);
 useFrame(paint,1);useLayoutEffect(paint);
 return <primitive object={world.root} dispose={null}/>;
};
export const PikeStrikes:React.FC=()=>{
 const props=getInputProps() as {dpr?:number};const ratio=props.dpr??1;
 return <AbsoluteFill style={{background:'#448c91'}}><div style={{width:1080*ratio,height:1920*ratio,transform:`scale(${1/ratio})`,transformOrigin:'0 0'}}><ThreeCanvas width={Math.round(1080*ratio)} height={Math.round(1920*ratio)} dpr={1} camera={{fov:40,near:.2,far:150}} gl={{antialias:false,preserveDrawingBuffer:true}}><Inner/></ThreeCanvas></div></AbsoluteFill>;
};
