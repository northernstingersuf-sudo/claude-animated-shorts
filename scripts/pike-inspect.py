"""Full decoded-frame diagnostics; complements visual review, never replaces it."""
import json,subprocess,sys
from pathlib import Path
import numpy as np
path=sys.argv[1]
raw=subprocess.check_output(['ffmpeg','-v','error','-i',path,'-vf','scale=54:96,format=rgb24','-an','-f','rawvideo','-'])
x=np.frombuffer(raw,dtype=np.uint8).reshape(-1,96,54,3)
luma=x.mean(axis=(1,2,3));delta=np.abs(np.diff(x.astype(float),axis=0)).mean(axis=(1,2,3))
run=maximum=0
for d in delta:
 run=run+1 if d==0 else 0;maximum=max(maximum,run)
r={'file':path,'decoded_frames':len(x),'min_mean_rgb':float(luma.min()),'max_mean_rgb':float(luma.max()),'largest_identical_frame_run':maximum+1,'mean_interframe_rgb_delta':float(delta.mean()),'flat_frames':np.where(x.max(axis=(1,2,3)).astype(int)-x.min(axis=(1,2,3)).astype(int)<12)[0].tolist()}
Path(path+'.qa.json').write_text(json.dumps(r,indent=2));print(json.dumps(r,indent=2))
assert not r['flat_frames'],'Flat/blank frames found'
assert maximum<12,'Twelve consecutive identical frames'
