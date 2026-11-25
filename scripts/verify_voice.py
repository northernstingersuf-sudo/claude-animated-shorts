"""Objective signal and ASR checks; these do not measure human-perceived naturalness."""
import argparse
import json
import math
import re
import subprocess
import time
import wave
from pathlib import Path

def tokens(s):return re.findall(r"[a-z]+(?:'[a-z]+)?",s.lower())
def distance(a,b):
    prev=list(range(len(b)+1))
    for i,x in enumerate(a,1):
        cur=[i]
        for j,y in enumerate(b,1):cur.append(min(cur[-1]+1,prev[j]+1,prev[j-1]+(x!=y)))
        prev=cur
    return prev[-1]
def main():
    p=argparse.ArgumentParser();p.add_argument("config");p.add_argument("output");p.add_argument("--max-wer",type=float,default=.25);p.add_argument("--max-rtf",type=float,default=5);a=p.parse_args()
    import numpy as np
    from faster_whisper import WhisperModel
    out=Path(a.output);cfg=json.loads(Path(a.config).read_text());m=json.loads((out/"cues.json").read_text())
    with wave.open(str(out/"voice.wav"),"rb") as w:
        assert (w.getframerate(),w.getnchannels(),w.getsampwidth())==(48000,1,2)
        x=np.frombuffer(w.readframes(w.getnframes()),dtype="<i2").astype(float)/32768
    assert len(x)==round(cfg["duration"]*48000)
    clip=float(np.mean(np.abs(x)>=.999))
    peak=float(np.max(np.abs(x)))
    rms=[float(np.sqrt(np.mean(x[round(s*48000):round(e*48000)]**2))) for s,e in m["speech_spans"]]
    speech_seconds=sum(e-s for s,e in m["speech_spans"])
    rtf=sum(m["synthesis_seconds"])/max(.001,speech_seconds)
    t=time.perf_counter();model=WhisperModel("tiny.en",device="cpu",compute_type="int8",cpu_threads=2)
    model_load=time.perf_counter()-t;t=time.perf_counter()
    seg,_=model.transcribe(str(out/"voice.wav"),language="en",beam_size=5,condition_on_previous_text=False,vad_filter=False)
    actual=" ".join(s.text for s in seg)
    asr_sec=time.perf_counter()-t
    expected=" ".join(c["text"] for c in cfg["narration"])
    wer=distance(tokens(expected),tokens(actual))/max(1,len(tokens(expected)))
    probe=json.loads(subprocess.check_output(["ffprobe","-v","error","-show_streams","-of","json",str(out/"mix.wav")]))
    mix=probe["streams"][0]
    assert int(mix["sample_rate"])==48000 and mix["channels"]==2
    assert abs(float(mix["duration"])-cfg["duration"])<.05
    alignment=json.loads((out/"alignment-report.json").read_text())
    report={"engine":m["engine"],"voice":m.get("voice"),"expected":expected,"recognized":actual,"wer":wer,"peak":peak,"clipped_fraction":clip,"cue_rms":rms,"synthesis_rtf":rtf,"tts_load_seconds":m["engine_load_seconds"],"asr_load_seconds":model_load,"asr_seconds":asr_sec,"alignment":alignment}
    (out/"voice-quality.json").write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2))
    assert clip<.001 and peak>.02 and all(v>.005 for v in rms),"Clipping or silent voice"
    assert wer<=a.max_wer, f"WER {wer:.1%} exceeds threshold"
    assert rtf<=a.max_rtf, f"CPU synthesis too slow: RTF {rtf:.2f}"
    assert alignment["coverage"]>=.9
if __name__=="__main__":main()
