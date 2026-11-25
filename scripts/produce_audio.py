"""Generate narration with an explicit engine, original score and timed SFX.
Usage: python scripts/produce_audio.py audio/example.json out/audio
Requires FFmpeg and the selected voice engine. Run align_voice.py afterwards.
"""
import argparse
import json
import math
import random
import subprocess
import wave
from array import array
from pathlib import Path
from voice_engines import VoiceEngine

SR=48000
def cmd(*args):
    subprocess.run(args,check=True)
def write(path,samples):
    with wave.open(str(path),"wb") as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
        a=array("h",(int(max(-1,min(1,x))*32767) for x in samples))
        w.writeframes(a.tobytes())
def read(path):
    with wave.open(str(path),"rb") as w:
        assert (w.getnchannels(),w.getsampwidth(),w.getframerate())==(1,2,SR)
        a=array("h");a.frombytes(w.readframes(w.getnframes()))
    return [x/32768 for x in a]
def add(dst,src,start,gain=1):
    k=round(start*SR)
    for i,x in enumerate(src):
        if 0<=k+i<len(dst):dst[k+i]+=gain*x
def tone(freq,dur,amp=.3):
    return [amp*(math.sin(2*math.pi*freq*i/SR)+.18*math.sin(4*math.pi*freq*i/SR))*min(1,i/(.012*SR))*math.exp(-3*i/(dur*SR)) for i in range(round(dur*SR))]
def atempo(factor):
    filters=[]
    while factor>2:filters.append("atempo=2");factor/=2
    while factor<.5:filters.append("atempo=0.5");factor*=2
    filters.append(f"atempo={factor:.8f}")
    return ",".join(filters)
def main():
    p=argparse.ArgumentParser();p.add_argument("config");p.add_argument("output");p.add_argument("--engine",choices=["kokoro","voicestudio","espeak"],default="kokoro");a=p.parse_args()
    c=json.loads(Path(a.config).read_text());out=Path(a.output);out.mkdir(parents=True,exist_ok=True)
    duration=float(c["duration"]);assert 0<duration<=120
    n=round(duration*SR);voice=[0.0]*n;music=[0.0]*n;sfx=[0.0]*n
    engine=VoiceEngine(a.engine,c)
    spans=[];last=0;times=[];factors=[]
    for i,cue in enumerate(c.get("narration",[])):
        start,end=float(cue["start"]),float(cue["end"]);assert last<=start<end<=duration
        last=end;slot=end-start
        raw=out/f"voice-{i}-raw.wav";pcm=out/f"voice-{i}-pcm.wav";fit=out/f"voice-{i}-fit.wav"
        times.append(engine.synthesize(cue["text"],raw))
        cmd("ffmpeg","-y","-v","error","-i",str(raw),"-ar",str(SR),"-ac","1","-c:a","pcm_s16le",str(pcm))
        data=read(pcm);factor=max(1,len(data)/SR/slot*1.04)
        factors.append(factor)
        if factor>1.5:raise ValueError(f"Cue {i} too long for its slot: {factor:.2f}x")
        if factor>1:
            cmd("ffmpeg","-y","-v","error","-i",str(pcm),"-af",atempo(factor),"-ar",str(SR),"-ac","1","-c:a","pcm_s16le",str(fit));data=read(fit)
        if len(data)>round(slot*SR):raise ValueError(f"Cue {i} exceeds slot")
        add(voice,data,start,.8);spans.append((start,start+len(data)/SR))
        for path in (raw,pcm,fit):path.unlink(missing_ok=True)
    score=c.get("music",{});beat=60/float(score.get("bpm",120));gain=float(score.get("gain",.1));assert .25<=beat<=2 and 0<=gain<=.4
    # Original, short repeating instrumental motif; no third-party recording.
    notes=[48,55,60,64,50,57,62,65,53,60,65,69,55,62,67,71]
    for i in range(math.ceil(duration/beat)):
        t=i*beat;freq=440*2**((notes[i%len(notes)]-69)/12)
        add(music,tone(freq,min(.7,beat*.95),gain),t)
        if i%2==0:add(music,tone(freq/2,min(.8,beat*1.5),gain*.55),t)
    for j,e in enumerate(c.get("effects",[])):
        t=float(e["time"]);assert 0<=t<duration
        r=random.Random(1831+j);kind=e["type"]
        if kind=="step":
            sig=[.13*(math.sin(2*math.pi*72*k/SR)+.35*r.uniform(-1,1))*math.exp(-k/(.055*SR)) for k in range(round(.23*SR))]
        elif kind=="whoosh":
            sig=[.11*r.uniform(-1,1)*math.sin(math.pi*k/(.4*SR))**2 for k in range(round(.4*SR))]
        elif kind=="splash":
            sig=[.16*r.uniform(-1,1)*math.exp(-k/(.17*SR)) for k in range(round(.75*SR))]
        else:raise ValueError(f"Unknown effect {kind}")
        add(sfx,sig,t)
    for s,e in spans:
        for i in range(max(0,round((s-.06)*SR)),min(n,round((e+.12)*SR))):
            t=i/SR;weight=min(1,max(0,(t-s+.06)/.06),max(0,(e+.12-t)/.12))
            music[i]*=1-.5*weight
    mix=[v+m+s for v,m,s in zip(voice,music,sfx)]
    for name,stem in (("voice",voice),("music",music),("sfx",sfx),("pre-master",mix)):write(out/(name+".wav"),stem)
    cmd("ffmpeg","-y","-v","error","-i",str(out/"pre-master.wav"),"-af","loudnorm=I=-16:TP=-1.5:LRA=7","-ar",str(SR),"-ac","2","-t",str(duration),"-c:a","pcm_s24le",str(out/"mix.wav"))
    (out/"pre-master.wav").unlink()
    (out/"cues.json").write_text(json.dumps({"duration":duration,"speech_spans":spans,"alignment":"cue-level; run align_voice.py for word timings","engine":a.engine,"voice":c.get("kokoro_voice","am_michael") if a.engine=="kokoro" else (engine.voice_id if a.engine=="voicestudio" else c.get("voice","en-gb")),"engine_load_seconds":engine.load_seconds,"synthesis_seconds":times,"tempo_factors":factors,"effects":c.get("effects",[])},indent=2))
    print(f"Generated {duration}s narrated mix with {len(spans)} cues")
if __name__=="__main__":main()
