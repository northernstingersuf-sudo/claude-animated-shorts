import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, getInputProps} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree, useFrame} from '@react-three/fiber';
import * as T from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {EffectComposer, EffectPass, RenderPass, ToneMappingEffect, ToneMappingMode} from 'postprocessing';
import {LensBlur} from '../../../templates/bridge/lensblur';
import {AccessoriesWorld, smooth} from './world';

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const {camera, gl, scene} = useThree();
  const world = useMemo(() => new AccessoriesWorld(), []);
  const composer = useRef<EffectComposer | null>(null);
  const lens = useMemo(() => new LensBlur({maxCoC: 16, nearScale: 1}), []);
  useLayoutEffect(() => {
    const gen = new T.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = gen.fromScene(room, .04);
    scene.environment = env.texture;
    scene.environmentIntensity = .55;
    const previousTone = gl.toneMapping;
    gl.toneMapping = T.NoToneMapping;
    const c = new EffectComposer(gl, {multisampling: 0, frameBufferType: T.HalfFloatType});
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new EffectPass(camera, lens.main));
    c.addPass(new EffectPass(camera, new ToneMappingEffect({mode: ToneMappingMode.ACES_FILMIC})));
    const size = gl.getSize(new T.Vector2());
    c.setSize(size.x, size.y);
    composer.current = c;
    return () => {
      composer.current = null;
      c.dispose();
      gl.toneMapping = previousTone;
      scene.environment = null;
      env.dispose(); room.dispose(); gen.dispose();
    };
  }, [gl, scene, camera, lens]);
  const paint = () => {
    const cam = camera as T.PerspectiveCamera;
    world.update(f, cam);
    const t = f / 30;
    const focus = t >= 9.5 && t < 11.3
      ? new T.Vector3(1.4, .3, .12).lerp(new T.Vector3(-1.15, .5, -1.54), smooth((t - 10.15) / .5))
      : t >= 11.3 ? new T.Vector3(-.85, 2.4, .6) : new T.Vector3(-.53, 2.8, 0);
    lens.focus = focus.sub(cam.position).dot(cam.getWorldDirection(new T.Vector3()));
    lens.cInf = t >= 9.5 && t < 11.3 ? 55 : t >= 3.8 && t < 7.4 ? 14 : t >= 11.3 && t < 13.2 ? 12 : 0;
    scene.updateMatrixWorld(true);
    if (composer.current) composer.current.render(1 / 30);
    else gl.render(scene, camera);
  };
  useFrame(paint, 1);
  useLayoutEffect(paint, [f, world]);
  return <primitive object={world.root} dispose={null}/>;
};

export const Accessories: React.FC<{clean?: boolean}> = ({clean = false}) => {
  const f = useCurrentFrame();
  const props = getInputProps() as {draft?: boolean; silent?: boolean};
  const copy = f < 114 ? 'Just one lure today.' : f >= 408 ? "Accessories don't count." : null;
  return <AbsoluteFill style={{background: '#282e30'}}>
    <ThreeCanvas width={1080} height={1920} dpr={props.draft ? .5 : 1} shadows="soft"
      gl={{antialias: true, alpha: false, preserveDrawingBuffer: true, toneMappingExposure: 1}}
      camera={{near: .05, far: 60, fov: 33}}>
      <color attach="background" args={['#282e30']}/><Scene/>
    </ThreeCanvas>
    {!clean && copy && <div style={{position: 'absolute', left: 90, top: 260, width: 780,
      color: 'white', fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 66,
      lineHeight: '78px', letterSpacing: -1, textShadow: '0 2px 7px #0008'}}>{copy}</div>}
    {!props.silent && <Audio src={staticFile('audio/AccessoriesDontCount.wav')}/>}
  </AbsoluteFill>;
};
export const AccessoriesClean: React.FC = () => <Accessories clean/>;
