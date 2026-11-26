import React from 'react';
import {Composition} from 'remotion';
import {BridgeShort, BRIDGE_FRAMES} from '../templates/bridge/Bridge';
import {PikeStrikes} from './videos/pike-strikes/PikeStrikes';
import {Smoke2D, Smoke3D} from './Smoke';

export const Root: React.FC = () => <>
  <Composition id="Smoke2D" component={Smoke2D} width={540} height={960} fps={30} durationInFrames={30} />
  <Composition id="Smoke3D" component={Smoke3D} width={540} height={960} fps={30} durationInFrames={30} />
  <Composition id="BridgeShort" component={BridgeShort} width={1080} height={1920} fps={30} durationInFrames={BRIDGE_FRAMES} />
  <Composition id="PikeStrikes" component={PikeStrikes} width={1080} height={1920} fps={30} durationInFrames={1800} />
</>;
