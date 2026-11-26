"""Preserve generated narration; add original, word-timed physical sound cues."""
import json, shutil, subprocess
from pathlib import Path
import numpy as np
from scipy.signal import butter,sosfilt
out=Path('out/pike-audio'); dst=Path('src/videos/pike-strikes/timing');dst.mkdir(exist_ok=True)
w=json.loads((out/'words.json').read_text())
def word(text,after):
    return next(x['s'] for x in w if x['s']>=after and x['word'].lower().strip('.,?!:')==text)
cues={'cast':6.0,'entry':7.2,'wobble':word('wobble',12),'flash':word('flash',12),'pause':word('pauses',28),'twitch':word('twitch',36),'bend':word('bends',36),'drive':word('drives',36),'jaws':word('jaws',36),'impact':word('jaws',36)+.23}
(out/'events.json').write_text(json.dumps(cues,indent=2))
sr=48000;n=60*sr;r=np.random.default_rng(1001);bed=sosfilt(butter(2,280,fs=sr,output='sos'),r.normal(0,.015,n))
def noise(t,d,g,lo,hi):
    k=int(d*sr);x=r.normal(0,g,k)*np.sin(np.linspace(0,np.pi,k))**2
    x=sosfilt(butter(2,[lo,hi],btype='bandpass',fs=sr,output='sos'),x);a=int(t*sr);bed[a:a+k]+=x[:min(k,n-a)]
noise(cues['cast'],.55,.12,800,6500);noise(cues['entry'],.8,.18,100,4000)
for key in ['wobble','twitch']:noise(max(0,cues[key]-2/30),.28,.055,120,1200)
noise(cues['drive']-2/30,.45,.16,65,900);noise(cues['impact']-2/30,.7,.21,80,3300)
import soundfile as sf
sf.write(out/'sfx.wav',bed,sr,subtype='PCM_16')
v,_=sf.read(out/'voice.wav');m,_=sf.read(out/'music.wav');sf.write(out/'premaster.wav',v+m+bed,sr,subtype='PCM_24')
subprocess.run(['ffmpeg','-y','-v','error','-i',str(out/'premaster.wav'),'-af','loudnorm=I=-16:TP=-1.5:LRA=7','-ar','48000','-ac','2','-t','60','-c:a','pcm_s24le',str(out/'mix.wav')],check=True)
(out/'premaster.wav').unlink()
shutil.copy(out/'mix.wav','public/audio/PikeStrikes.wav')
for file in ['words.json','alignment-report.json','cues.json','events.json']:
    shutil.copy(out/file,dst/file)
for file in ['voice.wav','music.wav','sfx.wav']:
    subprocess.run(['ffmpeg','-y','-v','error','-i',str(out/file),str(Path('artifacts/pike-strikes')/(Path(file).stem+'.flac'))],check=True)
print(json.dumps(cues,indent=2))
