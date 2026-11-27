"""Original deterministic synthesized material Foley; no third-party samples or music."""
import wave, pathlib, json
import numpy as np
SR=48000
rng=np.random.default_rng(20261127)
a=np.zeros((SR*16,2),np.float64)
# Low room noise is continuous across every cut.
noise=rng.normal(0,1,SR*16)
noise=np.convolve(noise,np.ones(18)/18,'same')*.003
a[:,0]=noise;a[:,1]=noise*.94
cues=[(.10,'metal',.13),(.60,'metal',.12),(1.78,'metal',.055),(2.65,'plastic',.18),(4.18,'fabric',.055),(5.60,'metal',.08),(6.0,'click',.30),(6.4,'metal',.18),(8.1,'plastic',.12),(9.0,'plastic',.10),(9.8,'click',.38),(10.85,'metal',.10),(11.28,'fabric',.065),(12.3,'click',.25),(13.6,'metal',.17),(13.7,'fabric',.13),(14.7,'pat',.24),(15.25,'pat',.22),(15.55,'fabric',.10)]
for sec,kind,amp in cues:
 n=int(SR*(.22 if kind=='metal' else .14));t=np.arange(n)/SR
 if kind=='metal':s=sum(np.sin(2*np.pi*hz*t+idx*.7)*np.exp(-t*(18+idx*11))/(idx+1) for idx,hz in enumerate([2170,3197,4613,5701]))
 elif kind=='click':s=rng.normal(0,1,n)*np.exp(-t*130)+.35*np.sin(2*np.pi*1700*t)*np.exp(-t*60)
 elif kind=='plastic':s=rng.normal(0,1,n)*np.exp(-t*75)+np.sin(2*np.pi*430*t)*np.exp(-t*40)
 else:
  s=np.convolve(rng.normal(0,1,n),np.ones(40)/40,'same')*np.sin(np.pi*np.arange(n)/n)**2
  if kind=='pat':s+=np.sin(2*np.pi*110*t)*np.exp(-t*40)
 s=s/max(abs(s))*amp;start=round(sec*SR);pan=-.08 if kind=='metal' else .05
 for c,g in enumerate([1-pan,1+pan]):a[start:start+n,c]+=s*g
pathlib.Path('public/audio').mkdir(parents=True,exist_ok=True)
with wave.open('public/audio/AccessoriesDontCount.wav','wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((np.clip(a,-1,1)*32767).astype('<i2').tobytes())
pathlib.Path('production/accessories/audio-cues.json').write_text(json.dumps(cues,indent=2)+'\n')
