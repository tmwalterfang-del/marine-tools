import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import './stage-app.mjs';
const root=path.resolve(import.meta.dirname,'../app-dist');
http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}const ext=path.extname(file);res.setHeader('content-type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.webmanifest':'application/manifest+json','.png':'image/png','.webp':'image/webp'})[ext]||'application/octet-stream');res.end(fs.readFileSync(file));}).listen(4173,'127.0.0.1',()=>console.log('Marine Tools local app preview: http://127.0.0.1:4173'));
