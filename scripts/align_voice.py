"""WhisperX forced alignment of known script against the final dry narration stem.
Writes upstream-compatible words.json plus frame times and alignment metrics.
"""
import argparse
import json
import math
import re
import time
from pathlib import Path

def tokens(s):
    return re.findall(r"[a-z]+(?:'[a-z]+)?",s.lower())

def main():
    p=argparse.ArgumentParser()
    p.add_argument("config");p.add_argument("output");p.add_argument("--fps",type=int,default=30)
    p.add_argument("--min-coverage",type=float,default=.90)
    a=p.parse_args();out=Path(a.output);cfg=json.loads(Path(a.config).read_text());meta=json.loads((out/"cues.json").read_text())
    if cfg.get("language","en")!="en": raise ValueError("Only the commercially reviewed English alignment model is configured")
    import torch
    import whisperx
    torch.set_num_threads(2)
    t=time.perf_counter()
    model,md=whisperx.load_align_model("en","cpu",model_name="facebook/wav2vec2-base-960h")
    load=time.perf_counter()-t
    audio=whisperx.load_audio(str(out/"voice.wav"))
    cues=cfg["narration"];spans=meta["speech_spans"]
    assert len(cues)==len(spans) and cues
    segments=[{"text":c["text"],"start":float(s[0]),"end":float(s[1])} for c,s in zip(cues,spans)]
    t=time.perf_counter()
    result=whisperx.align(segments,model,md,audio,"cpu",interpolate_method="nearest",return_char_alignments=False)
    seconds=time.perf_counter()-t
    expected=sum(len(tokens(c["text"])) for c in cues)
    words=[]
    for w in result["word_segments"]:
        if "start" not in w or "end" not in w or "score" not in w:continue
        s,e=float(w["start"]),float(w["end"])
        if not (math.isfinite(s) and math.isfinite(e) and 0<=s<e<=cfg["duration"]+.001):continue
        if words and s<words[-1]["e"]-.02:raise ValueError("Nonmonotonic alignment")
        s=max(s,words[-1]["e"] if words else 0)
        if e<=s:continue
        words.append({"word":w["word"],"s":round(s,3),"e":round(e,3),"start_frame":round(s*a.fps),"end_frame":max(round(s*a.fps)+1,round(e*a.fps)),"score":w.get("score")})
    coverage=sum(len(tokens(w["word"])) for w in words)/max(1,expected)
    (out/"words.json").write_text(json.dumps(words,indent=2))
    (out/"alignment-report.json").write_text(json.dumps({"model":"facebook/wav2vec2-base-960h","engine":"whisperx","coverage":coverage,"expected_words":expected,"aligned_words":len(words),"model_load_seconds":load,"alignment_seconds":seconds,"fps":a.fps},indent=2))
    if coverage<a.min_coverage or not words:raise ValueError(f"Alignment coverage {coverage:.1%} below threshold")
    print(f"Aligned {len(words)} words; coverage={coverage:.1%}; inference={seconds:.2f}s")
if __name__=="__main__":main()
