/* A lazy, function-free learning catalogue built from the reviewed source. */
import fs from 'node:fs';
import vm from 'node:vm';
import {catalogue} from '../tests/lib/students-catalogue.mjs';
const w=catalogue();vm.runInNewContext(fs.readFileSync('students/learning-links-20261030.js','utf8'),{window:w});
const links=w.MT_LEARNING_LINKS.create({formulas:w.MT_FORMULAS,calculators:w.MT_CALCULATORS,study:w.MT_STUDY});
const manifest={version:1,chapters:[],calculators:w.MT_CALCULATORS.map(c=>({id:c.id,name:c.name,fields:c.fields,description:c.description,formulaIds:Object.entries(w.MT_STUDY.calculatorByFormula).filter(([,id])=>id===c.id).map(([id])=>id)}))},files=[];
function source(global,value){return '/* Generated from reviewed learning sources. */\n(function(root){"use strict";'+global+'='+JSON.stringify(value).replaceAll('<','\\u003c')+';})(typeof window==="undefined"?globalThis:window);\n';}
for(const chapter of w.MT_STUDY.chapters){const questions=w.MT_PRACTICE.filter(q=>q.chapter===chapter.number),formulas=w.MT_FORMULAS.filter(f=>chapter.formulaIds.includes(f.id)).map(f=>({id:f.id,name:f.name,formula:f.formula,note:f.note||'',category:f.category,tags:f.tags||''})),filename='learning-chapter-'+String(chapter.number).padStart(2,'0')+'-20261030.js',data={number:chapter.number,title:chapter.title,questions,formulas,resources:Object.fromEntries(questions.map(q=>[q.id,links.resources(q).map(r=>({...r,href:r.href.startsWith('#')?'./'+r.href:r.href}))]))};
 manifest.chapters.push({number:chapter.number,title:chapter.title,count:questions.length,file:filename});files.push({file:'students/'+filename,source:source('root.MT_LEARNING_CHAPTERS||={};root.MT_LEARNING_CHAPTERS['+chapter.number+']',data)});
}
files.push({file:'students/learning-catalogue-20261030.js',source:source('root.MT_LEARNING_CATALOGUE',manifest)});
for(const item of files){if(process.argv.includes('--check')){if(fs.readFileSync(item.file,'utf8')!==item.source)throw Error('Learning catalogue is stale: '+item.file);}else fs.writeFileSync(item.file,item.source);}
console.log(JSON.stringify({questions:w.MT_PRACTICE.length,chapters:manifest.chapters.length,initialBytes:files.at(-1).source.length,maxChapterBytes:Math.max(...files.slice(0,-1).map(f=>f.source.length))}));
