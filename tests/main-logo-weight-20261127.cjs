/* Page weight guard: visible logo images use the small assets/logo-144.webp (≈10 KB) instead of the 49 KB icon-192.png,
 * the file exists, stays small, is square, and is in the offline shell. Favicons/manifest/structured data may keep icon-192. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const pages=['index.html','app.js','regulatory.html','workspace.html','privacy/index.html','professionals/index.html','education/one-page.html'].concat(fs.readdirSync(path.join(root,'students')).filter(f=>f.endsWith('.html')).map(f=>'students/'+f)).filter(f=>fs.existsSync(path.join(root,f)));
const heavy=pages.flatMap(f=>(fs.readFileSync(path.join(root,f),'utf8').match(/<img\b[^>]*icon-(192|512)\.png[^>]*>/g)||[]).map(m=>f+': '+m.slice(0,80)));
assert.deepEqual(heavy,[],'no visible <img> uses the large PNG icons');
const logo=path.join(root,'assets/logo-144.webp'),buf=fs.readFileSync(logo);
assert.ok(buf.length<20*1024,'logo-144.webp stays under 20 KB');
assert.equal(buf.toString('ascii',0,4),'RIFF','logo is a RIFF container');assert.equal(buf.toString('ascii',8,12),'WEBP','logo is WebP');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');assert.ok(sw.includes("'./assets/logo-144.webp'"),'logo is in the offline shell');
const uses=pages.reduce((n,f)=>n+(fs.readFileSync(path.join(root,f),'utf8').match(/logo-144\.webp/g)||[]).length,0);assert.ok(uses>=8,'small logo used across pages');
console.log(`logo weight: ${uses} logo images use logo-144.webp (${Math.round(buf.length/1024)} KB), none use icon-192.png; in offline shell`);
