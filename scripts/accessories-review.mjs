import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill,renderMedia} from '@remotion/renderer';
import fs from 'node:fs';
const url=await bundle({entryPoint:'src/index.ts'});
const browser=await openBrowser('chrome',{browserExecutable:process.env.RENDER_BROWSER,chromiumOptions:{gl:'swangle'}});
const inputProps={draft:true};
const comp=await selectComposition({serveUrl:url,id:'AccessoriesDontCount',puppeteerInstance:browser,inputProps});
const dir='out/accessories';fs.mkdirSync(dir,{recursive:true});
for(const frame of [0,35,85,145,169,188,219,245,285,320,365,407,440,479]){await renderStill({serveUrl:url,composition:comp,puppeteerInstance:browser,output:`${dir}/frame-${frame}.png`,frame,scale:.5,inputProps,chromiumOptions:{gl:'swangle'}});console.log(`Still ${frame}`)}
await renderMedia({serveUrl:url,composition:comp,puppeteerInstance:browser,outputLocation:`${dir}/draft.mp4`,codec:'h264',scale:.5,inputProps,concurrency:1,chromiumOptions:{gl:'swangle'},onProgress:({progress})=>{if(Math.round(progress*100)%10===0)process.stdout.write('.')}});
await browser.close();console.log('\nDraft complete');
