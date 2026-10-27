const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),pw=require('playwright');
const engine=process.argv[2]||'chromium',root=process.cwd(),out=path.resolve('qa-education-'+engine,'single-scroll');
const ids=['lifting','trim','tank','pump','crank','faults','cargo','stability','controls','engine','mollier','rlc','heat','current','finance'];
let server,browser,checks=0;const errors=[];
const ok=(value,label)=>{assert.ok(value,label);checks++;};
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}
  res.setHeader('content-type',file.endsWith('.js')?'application/javascript':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(fs.readFileSync(file));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 browser=await pw[engine].launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900},serviceWorkers:'block'});
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
 await page.goto(base+'/students/interactive.html#trim');
 async function choose(id){await page.evaluate(id=>location.hash=id,id);await page.waitForFunction(id=>document.getElementById('module-quick').value===id,id);}
 async function active(){const el=await page.locator('#frames iframe:not([hidden])').elementHandle();const frame=await el.contentFrame();await frame.waitForSelector('#workspace-content');return {el,frame};}
 async function fitted(label){
  await page.evaluate(()=>window.__qaStableFrame=null);
  await page.waitForFunction(()=>{const f=document.querySelector('#frames iframe:not([hidden])');if(!f?.dataset.contentSized)return false;const d=f.contentDocument;return d.scrollingElement.scrollHeight<=d.scrollingElement.clientHeight+2;});
  // Natural-height and chart-fit observers can require several animation frames
  // after a presentation toggle; require convergence before measuring stability.
  await page.waitForFunction(()=>{const f=document.querySelector('#frames iframe:not([hidden])'),h=f.getBoundingClientRect().height,state=window.__qaStableFrame;if(!state||Math.abs(state.height-h)>1){window.__qaStableFrame={height:h,count:0};return false}return ++state.count>=10;});
  const {el,frame}=await active();
  // Content changes must settle rather than growing on every layout frame.
  const sizes=await page.evaluate(async()=>{const f=document.querySelector('#frames iframe:not([hidden])'),values=[];for(let i=0;i<8;i++){await new Promise(r=>requestAnimationFrame(r));values.push(f.getBoundingClientRect().height);}return values;});
  ok(Math.max(...sizes)-Math.min(...sizes)<=2,'Stable content height: '+label+' '+JSON.stringify(sizes));
  const m=await frame.evaluate(()=>({viewport:innerHeight,content:document.scrollingElement.scrollHeight,scroll:scrollY,width:document.documentElement.clientWidth,fullWidth:document.documentElement.scrollWidth,overflow:getComputedStyle(document.documentElement).overflowY,gutter:innerWidth-document.documentElement.clientWidth}));
  ok(m.content<=m.viewport+2&&m.scroll===0,'No inner vertical scroll: '+label);
  ok(m.fullWidth<=m.width+2,'No page-wide horizontal overflow: '+label);
  ok(m.overflow==='hidden'&&m.gutter===0&&await el.getAttribute('scrolling')==='no','No visible module scrollbar or gutter: '+label);
  return {el,frame};
 }
 await page.setViewportSize({width:1920,height:1080});
 let wide=await fitted('wide/full screen');
 const full=await page.locator('#frames iframe:not([hidden])').evaluate(f=>f.getBoundingClientRect().width);
 ok(full>=1920*.94,'Module uses at least 94 percent of a wide screen');
 ok(!await page.locator('#module-picker').isVisible(),'Module list starts collapsed');
 ok(await page.locator('#module-quick').isVisible(),'Top module selector remains available on desktop');
 const columns=await wide.frame.evaluate(()=>{const input=document.querySelector('.teaching-inputs').getBoundingClientRect(),result=document.querySelector('.teaching-results').getBoundingClientRect();return result.left>=input.right-1;});
 ok(columns,'Desktop inputs and results use side-by-side columns');
 await page.locator('#toggle-module-list').click();await fitted('wide/list open');
 ok(await page.locator('#module-picker').isVisible(),'Optional subject list opens');
 ok(await page.locator('#frames iframe:not([hidden])').evaluate(f=>f.getBoundingClientRect().width)<full-200,'Optional list shares horizontal space');
 await page.locator('#toggle-module-list').click();await fitted('wide/list closed');
 ok(Math.abs(await page.locator('#frames iframe:not([hidden])').evaluate(f=>f.getBoundingClientRect().width)-full)<=2,'Closing list returns the full width');
 await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'workspace-1920.png'),fullPage:true});
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:width===390?844:900});
  for(const id of ids){
   await choose(id);
   await fitted(width+'/'+id+'/normal');
   await page.locator('#presentation-toggle').click();
   await fitted(width+'/'+id+'/presentation');
   await page.locator('#presentation-toggle').click();
   await fitted(width+'/'+id+'/restored');
  }
  await choose('trim');
  let {frame}=await fitted(width+'/trim/inputs');
  const disclosure=frame.locator('details.teaching-inputs').first();
  await disclosure.evaluate(d=>d.open=false);await fitted(width+'/trim/collapsed');
  const collapsed=await page.locator('#frames iframe:not([hidden])').evaluate(f=>f.clientHeight);
  const closedInputs=await disclosure.evaluate(d=>d.getBoundingClientRect().height);
  await disclosure.evaluate(d=>d.open=true);await fitted(width+'/trim/expanded');
  ok(await disclosure.evaluate(d=>d.getBoundingClientRect().height)>closedInputs+50,'Expanded inputs remain visible '+width);
  const expanded=await page.locator('#frames iframe:not([hidden])').evaluate(f=>f.clientHeight);
  // On desktop the result column can already be taller than the input column.
  // Opening inputs then needs no extra page height; stacked mobile inputs do.
  ok(width===390?expanded>collapsed+50:expanded>=collapsed-2,'Content height accommodates expanded inputs '+width);
  const input=frame.locator('#experiment input[type=number]').first();await input.fill('1200');await input.dispatchEvent('input');
  await choose('heat');await fitted(width+'/heat');
  await choose('trim');({frame}=await fitted(width+'/trim/return'));
  ok(await frame.locator('#experiment input[type=number]').first().inputValue()==='1200','Switching preserves input '+width);
  // Inject an ordinary in-flow paragraph to exercise asynchronous growth and
  // removal independently of any particular calculator's field count.
  const initial=await page.locator('#frames iframe:not([hidden])').evaluate(f=>f.clientHeight);
  await frame.evaluate(()=>{const p=document.createElement('p');p.id='qa-size-probe';p.style.height='450px';p.textContent='QA dynamic content';document.querySelector('main').append(p);});
  await fitted(width+'/dynamic content');
  ok(await page.locator('#frames iframe:not([hidden])').evaluate(f=>f.clientHeight)>initial+400,'Dynamic content grows frame '+width);
  await frame.evaluate(()=>document.getElementById('qa-size-probe').remove());await fitted(width+'/removed content');
  ok(Math.abs(await page.locator('#frames iframe:not([hidden])').evaluate(f=>f.clientHeight)-initial)<=2,'Removing content shrinks frame '+width);
  await page.evaluate(()=>{const f=document.querySelector('#frames iframe:not([hidden])');scrollTo(0,f.getBoundingClientRect().top+scrollY-140);});
  const before=await page.evaluate(()=>scrollY),box=await page.locator('#frames iframe:not([hidden])').boundingBox();
  await page.mouse.move(box.x+box.width/2,220);await page.mouse.wheel(0,350);
  await page.waitForFunction(y=>scrollY>y+30,before);
  ok(await frame.evaluate(()=>scrollY===0),'Wheel over module scrolls only the outer page '+width);
  await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,'workspace-'+width+'.png'),fullPage:true});
 }
 ok(errors.length===0,'No browser exceptions: '+errors.join('; '));
 const result={engine,status:'PASS',checks,modules:15,widths:[1920,1440,390],errors};
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();server?.close()});
