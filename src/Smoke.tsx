import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';

export const Smoke2D: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{background:'#142c42',alignItems:'center',justifyContent:'center'}}>
    <div style={{width:180,height:180,background:'#f7b44d',borderRadius:24,transform:`translateY(${frame*5-75}px) rotate(${frame*4}deg)`}} />
  </AbsoluteFill>;
};

const Cube: React.FC = () => {
  const frame = useCurrentFrame();
  return <>
    <ambientLight intensity={1.2}/>
    <directionalLight position={[3,5,4]} intensity={3}/>
    <mesh rotation={[frame/30,frame/15,0.2]}>
      <boxGeometry args={[1.5,1.5,1.5]}/>
      <meshStandardMaterial color="#f7b44d"/>
    </mesh>
  </>;
};
export const Smoke3D: React.FC = () => <AbsoluteFill style={{background:'#142c42'}}>
  <ThreeCanvas width={540} height={960} camera={{position:[0,0,5],fov:45}}>
    <color attach="background" args={['#142c42']}/>
    <Cube/>
  </ThreeCanvas>
</AbsoluteFill>;
