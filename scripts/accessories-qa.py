"""Verify the actual delivered streams, overlay boundaries, matching audio and shot frames."""
import hashlib,json,pathlib,subprocess,sys
import numpy as np
from PIL import Image,ImageDraw
out=pathlib.Path('out/accessories');qa=out/'qa';qa.mkdir(exist_ok=True)
def run(*args):return subprocess.check_output(args)
files=[out/'AccessoriesDontCount.mp4',out/'AccessoriesDontCountClean.mp4']
results={}
for file in files:
 p=json.loads(run('ffprobe','-v','error','-count_frames','-show_streams','-show_format','-of','json',str(file)))
 v=next(s for s in p['streams'] if s['codec_type']=='video');a=next(s for s in p['streams'] if s['codec_type']=='audio')
 assert (v['width'],v['height'],int(v['nb_read_frames']),v['avg_frame_rate'])==(1080,1920,480,'30/1'),v
 assert a['codec_name']=='aac' and a['sample_rate']=='48000' and a['channels']==2,a
 assert all(v[k]=='bt709' for k in ['color_space','color_transfer','color_primaries']),v
 assert abs(float(p['format']['duration'])-16)<.04,p['format']
 check=run(sys.executable,'scripts/verify_video.py',str(file),'--width','1080','--height','1920','--frames','480','--audio').decode().strip()
 packet_hash=run('ffmpeg','-v','error','-i',str(file),'-map','0:a:0','-c:a','copy','-f','hash','-hash','sha256','-').decode().strip()
 results[file.name]={'probe':p,'verification':check,'audio_packet_hash':packet_hash,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()}
 print(check)
assert results[files[0].name]['audio_packet_hash']==results[files[1].name]['audio_packet_hash'],'Audio differs between masters'
# Exact text in/out frame checks, against the clean counterpart.
frames=[0,113,114,407,408,479]
expr='+'.join(f'eq(n\\,{f})' for f in frames)
counts=[]
for file in files:
 raw=run('ffmpeg','-v','error','-i',str(file),'-vf',f'select={expr},crop=780:170:90:260','-fps_mode','vfr','-pix_fmt','rgb24','-f','rawvideo','-')
 arr=np.frombuffer(raw,np.uint8).reshape(len(frames),170,780,3)
 counts.append(((arr>225).all(-1)).sum((1,2)))
added=counts[0].astype(np.int64)-counts[1].astype(np.int64)
for f,n in zip(frames,added):assert n>1000 if f in [0,113,408,479] else abs(n)<500,(f,int(n))
results['overlay_boundary_checks']={str(f):int(n) for f,n in zip(frames,added)}
# Extract actual encoded frames, not source scene screenshots.
key=[0,35,85,145,169,188,219,245,285,320,365,407,440,479]
for file,prefix in [(files[0],'final'),(files[1],'clean')]:
 expr='+'.join(f'eq(n\\,{f})' for f in key)
 run('ffmpeg','-y','-v','error','-i',str(file),'-vf',f'select={expr},scale=540:960','-fps_mode','vfr',str(qa/f'{prefix}-%02d.png'))
 sheet=Image.new('RGB',(7*216,2*384))
 for i,f in enumerate(key):
  im=Image.open(qa/f'{prefix}-{i+1:02d}.png');im=im.resize((216,384));sheet.paste(im,((i%7)*216,(i//7)*384));ImageDraw.Draw(sheet).text(((i%7)*216+5,(i//7)*384+5),str(f),fill='red')
 sheet.save(qa/f'{prefix}-shots.jpg',quality=92)
results['status']='PASS'
(qa/'verification.json').write_text(json.dumps(results,indent=2)+'\n')
print('PASS: matching encoded AAC; exact overlay boundary frames; extracted final and clean shot sheets')
