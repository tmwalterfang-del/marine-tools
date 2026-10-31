const pw=require('playwright');(async()=>{const b=await pw.chromium.launch();const routes=process.argv.slice(3);const out=[];
for(const loc of ['en','nb'])for(const w of [320,360]){const ctx=await b.newContext({viewport:{width:w,height:800},serviceWorkers:'block'});await ctx.addInitScript(l=>localStorage.setItem('mt.locale.v1',JSON.stringify(l)),loc);await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/,r=>r.abort());const p=await ctx.newPage();
for(const r of routes){await p.goto(process.argv[2]+'/'+r);await p.waitForTimeout(1000);const o=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(o>1)out.push([r,loc,w,o]);}await ctx.close();}
console.log(JSON.stringify(out));await b.close()})();
