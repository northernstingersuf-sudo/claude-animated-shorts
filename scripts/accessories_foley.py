"""Original deterministic Foley synthesis for the animated adaptation; no samples or score."""
import math, random, wave, array, sys
from pathlib import Path
SR=48000
N=16*SR
rng=random.Random(4242)
buf=[0.0]*N
lp=0.0
for i in range(N):
    lp=.987*lp+.013*rng.uniform(-1,1)
    buf[i]=.022*lp+.0018*math.sin(2*math.pi*83*i/SR)

def contact(t,kind,amp=1.0):
    settings={
      "ring":(.20,.048,[1240,1970,2830,4170],.095),
      "clip":(.085,.018,[920,1620,2950],.16),
      "plastic":(.12,.031,[290,690,1170],.12),
      "soft":(.16,.045,[105,220,410],.075),
      "fabric":(.32,.12,[130,290],.037),
      "step":(.23,.062,[68,117,195],.12),
    }
    dur,decay,freqs,gain=settings[kind]
    start=round(t*SR); prev=0.
    phases=[rng.uniform(0,math.tau) for _ in freqs]
    for j in range(min(round(dur*SR),N-start)):
        x=j/SR
        noise=rng.uniform(-1,1); prev=.78*prev+.22*noise
        tone=sum(math.sin(math.tau*fr*x+ph)*math.exp(-x*(1+k*.26)/decay) for k,(fr,ph) in enumerate(zip(freqs,phases)))/len(freqs)
        env=min(1,x/.002)*math.exp(-x/decay)
        v=(tone*.7+prev*env*.65)*gain*amp
        buf[start+j]+=v
for t,kind,amp in [
(.10,"ring",.72),(.60,"ring",.88),(1.12,"ring",.38),(2.65,"plastic",1.0),
(4.55,"soft",.38),(5.98,"clip",1.2),(6.35,"ring",1.0),(6.42,"ring",.55),
(6.49,"ring",.35),(8.10,"soft",.75),(9.00,"plastic",.60),(9.80,"clip",1.2),
(10.86,"ring",.48),(12.30,"clip",1.0),(13.57,"ring",.85),(13.65,"ring",.62),
(13.73,"fabric",.95),(14.70,"soft",.80),(15.30,"step",.65),(15.57,"ring",.25),
(15.80,"fabric",.55)]:
    contact(t,kind,amp)
peak=max(abs(v) for v in buf)
gain=min(.85/max(peak,1e-9),3.0)
samples=array.array("h")
for i,v in enumerate(buf):
    fade=min(1.,(N-i)/480.)
    x=int(max(-32767,min(32767,v*gain*32767*fade)))
    samples.extend((x,x))
if sys.byteorder!="little": samples.byteswap()
out=Path(sys.argv[1] if len(sys.argv)>1 else "out/accessories-foley.wav")
out.parent.mkdir(parents=True,exist_ok=True)
with wave.open(str(out),"wb") as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(samples.tobytes())
print(f"Created {out} (16 s, 48 kHz stereo). Synthetic Foley; listening and loudness review pending.")
