import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
const mode=process.argv[2]??'stills';if(!['stills','preview','draft','production'].includes(mode))throw Error('Invalid mode');
const dir='out/pike-strikes';mkdirSync(dir,{recursive:true});
const run=(cmd,args)=>{const r=spawnSync(cmd,args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);};
const common=['src/index.ts','PikeStrikes'];
const scale=mode==='production'?1:mode==='preview'?.25:.5;
const opts=[`--scale=${scale}`,'--gl=swangle','--timeout=180000',`--props=${JSON.stringify({dpr:scale})}`];
if(process.env.CHROME_PATH)opts.push(`--browser-executable=${process.env.CHROME_PATH}`);
if(mode==='stills'){
 for(const f of [70,195,260,410,700,930,1160,1211,1400,1690])run('npx',['--no-install','remotion','still',...common,`${dir}/frame-${f}.png`,`--frame=${f}`,...opts]);
 run('python3',['scripts/verify_stills.py',...[70,195,260,410,700,930,1160,1211,1400,1690].map(f=>`${dir}/frame-${f}.png`)]);
}else{
 const preview=mode==='preview';const start=preview?1101:0,end=preview?1280:1799;
 run('npx',['--no-install','remotion','render',...common,`${dir}/${mode}-silent.mp4`,`--frames=${start}-${end}`,'--codec=h264','--crf=20','--concurrency=1',...opts]);
 run('ffmpeg',['-y','-v','error','-i',`${dir}/${mode}-silent.mp4`,'-ss',String(start/30),'-i','public/audio/PikeStrikes.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-t',String((end-start+1)/30),`${dir}/${mode}.mp4`]);
 run('python3',['scripts/verify_video.py',`${dir}/${mode}.mp4`,'--width',String(1080*scale),'--height',String(1920*scale),'--frames',String(end-start+1),'--audio']);
}
