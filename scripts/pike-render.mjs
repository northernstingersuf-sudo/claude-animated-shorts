import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
const mode=process.argv[2]??'stills';if(!['stills','preview','draft','production'].includes(mode))throw Error('Invalid mode');
const dir='out/pike-strikes';mkdirSync(dir,{recursive:true});
const run=(cmd,args)=>{const r=spawnSync(cmd,args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status??1);};
const common=['src/index.ts','PikeStrikes'];
const scale=mode==='production'?1:mode==='draft'?(2/15):mode==='preview'?.25:.5;
const opts=[`--scale=${scale}`,'--gl=swangle','--timeout=180000',`--props=${JSON.stringify({dpr:scale})}`];
if(process.env.CHROME_PATH)opts.push(`--browser-executable=${process.env.CHROME_PATH}`);
if(mode==='stills'){
 const defaults = [24, 116, 182, 219, 232, 311, 410, 461, 555, 663, 756, 901, 954, 1036, 1119, 1173, 1198, 1215, 1264, 1395, 1525, 1758];
 const frames = process.argv.length > 3 ? process.argv.slice(3).map(Number) : defaults;
 const inputProps = {dpr: scale};
 const chromiumOptions = {gl: 'swangle'};
 const browserExecutable = process.env.CHROME_PATH;
 const browser = await openBrowser('chrome', {browserExecutable, chromiumOptions});
 try {
  const serveUrl = await bundle({entryPoint: common[0]});
  const shared = {serveUrl, inputProps, chromiumOptions, puppeteerInstance: browser, timeoutInMilliseconds: 180000};
  const composition = await selectComposition({...shared, id: common[1]});
  for (const frame of frames) {
   const output = `${dir}/frame-${frame}.png`;
   await renderStill({...shared, composition, scale, frame, output});
   console.log(`Rendered ${output}`);
  }
 } finally {
  await browser.close({silent: true});
 }
 run('python3',['scripts/verify_stills.py',...frames.map(f=>`${dir}/frame-${f}.png`)]);
}else{
 const preview=mode==='preview';const start=preview?1101:0,end=preview?1280:1799;
 run('npx',['--no-install','remotion','render',...common,`${dir}/${mode}-silent.mp4`,`--frames=${start}-${end}`,'--codec=h264','--crf=20','--concurrency=1',...opts]);
 run('ffmpeg',['-y','-v','error','-i',`${dir}/${mode}-silent.mp4`,'-ss',String(start/30),'-i','public/audio/PikeStrikes.wav','-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-t',String((end-start+1)/30),`${dir}/${mode}.mp4`]);
 run('python3',['scripts/verify_video.py',`${dir}/${mode}.mp4`,'--width',String(1080*scale),'--height',String(1920*scale),'--frames',String(end-start+1),'--audio']);
}
