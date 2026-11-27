import React from 'react';
import {AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';

export const ACCESSORIES_FRAMES = 480;
export const ACCESSORIES_FPS = 30;
const ASSETS = 'accessories-dont-count';
export const SHOTS = [
  {id: 'F01', from: 0, to: 54},
  {id: 'F02', from: 54, to: 114},
  {id: 'F03', from: 114, to: 165},
  {id: 'F04', from: 165, to: 222},
  {id: 'F05', from: 222, to: 285},
  {id: 'F06', from: 285, to: 339},
  {id: 'F07', from: 339, to: 396},
  {id: 'F08', from: 396, to: 480},
] as const;

const Reel: React.FC<{clean: boolean}> = ({clean}) => {
  const frame = useCurrentFrame();
  const text = frame < 114 ? 'Just one lure today.' :
    frame >= 408 ? "Accessories don't count." : null;
  return <AbsoluteFill style={{backgroundColor: '#000'}}>
    {SHOTS.map(({id, from, to}) =>
      <Sequence key={id} name={id} from={from} durationInFrames={to - from}>
        <OffthreadVideo src={staticFile(`${ASSETS}/${id}.mp4`)}
          muted style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      </Sequence>
    )}
    <Audio src={staticFile(`${ASSETS}/mix.wav`)} />
    {!clean && text && <div style={{
      position: 'absolute', top: 260, left: 90, width: 780,
      color: '#fff', fontFamily: 'Inter, Arial, sans-serif',
      fontWeight: 700, fontSize: 66, lineHeight: '78px', letterSpacing: '-1px',
      textAlign: 'left', textShadow: '0 1px 2px rgba(0,0,0,.35)',
    }}>{text}</div>}
  </AbsoluteFill>;
};

export const AccessoriesDontCount: React.FC = () => <Reel clean={false} />;
export const AccessoriesDontCountClean: React.FC = () => <Reel clean />;
