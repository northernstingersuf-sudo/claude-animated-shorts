import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderMedia} from '@remotion/renderer';
import fs from 'node:fs';
import crypto from 'node:crypto';
const mode=process.argv[2]||'draft';
if(!['draft','production'].includes(mode))throw Error('Use draft or production');
if(mode==='production'){
 const gate=JSON.parse(fs.readFileSync('production/accessories/preview-review.json','utf8'));
 for(const file of ['src/videos/accessories/world.ts','src/videos/accessories/Accessories.tsx']){
  const hash=crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if(gate.sources[file]!==hash)throw Error(`Review stale: ${file}`);
 }
 if(gate.status!=='approved')throw Error('Preview review required');
}
const browserExecutable=process.env.RENDER_BROWSER;
const browser=await openBrowser('chrome',{browserExecutable,chromiumOptions:{gl:'swangle'}});
try{
 const serveUrl=await bundle({entryPoint:'src/index.ts'});
 const dir='out/accessories';fs.mkdirSync(dir,{recursive:true});
 const ids=mode==='production'?['AccessoriesDontCount','AccessoriesDontCountClean']:['AccessoriesDontCount'];
 for(const id of ids){
  const inputProps={draft:mode==='draft'};
  const composition=await selectComposition({serveUrl,id,puppeteerInstance:browser,inputProps});
  let last=-1;
  await renderMedia({serveUrl,composition,puppeteerInstance:browser,inputProps,outputLocation:`${dir}/${mode==='draft'?'draft':id}.mp4`,codec:'h264',crf:18,audioCodec:'aac',audioBitrate:'256k',sampleRate:48000,colorSpace:'bt709',scale:mode==='draft'?.5:1,concurrency:2,chromiumOptions:{gl:'swangle'},onProgress:({progress})=>{const p=Math.floor(progress*20)*5;if(p!==last){last=p;console.log(`${id}: ${p}%`)}}});
 }
}finally{await browser.close()}
