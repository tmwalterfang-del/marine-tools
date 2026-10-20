// Selected arithmetic/convention checks. Source structures are NOT counted as numerically proved equations.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'),w={},ctx=vm.createContext({window:w});
for(const m of read('students/index.html').matchAll(/src="([^"?]+\.js)/g)){if(m[1]==='app.js')break;vm.runInContext(read('students/'+m[1]),ctx)}
const rows=w.MT_STUDY.chemistryEquationAudit,byId=new Map(w.MT_FORMULAS.map(f=>[f.id,f]));let checks=0,numeric=0;
const ok=(v,m)=>{assert.ok(v,m);checks++},near=(a,b,m)=>{ok(Number.isFinite(a)&&Math.abs(a-b)<1e-9*Math.max(1e-24,Math.abs(b)),m);numeric++};
// Safe, deliberately narrow arithmetic grammar for the selected DISPLAYED relationships.
function evaluate(text,values){
 text=text.replaceAll('−','-').replaceAll('·','*').replaceAll('²','^2').replaceAll('³','^3');
 const tokens=text.match(/[\p{L}_][\p{L}\p{N}\p{M}_°]*|\d+(?:\.\d+)?|[+*/()^-]/gu)||[];assert.equal(tokens.join(''),text.replace(/\s/g,''));let i=0;
 const atom=()=>{const t=tokens[i++];if(t==='('){const r=expr();assert.equal(tokens[i++],')');return r}if(t==='-')return -atom();if(/^\d/.test(t||''))return Number(t);if(['log10','sqrt'].includes(t)){assert.equal(tokens[i++],'(');const r=expr();assert.equal(tokens[i++],')');return Math[t](r)}assert.ok(Object.hasOwn(values,t),'known quantity '+t);return values[t]};
 const power=()=>{let a=atom();if(tokens[i]==='^'){i++;a=a**atom()}return a};
 const product=()=>{let a=power();while(tokens[i]==='*'||tokens[i]==='/'){const op=tokens[i++],b=power();a=op==='*'?a*b:a/b}return a};
 const expr=()=>{let a=product();while(tokens[i]==='+'||tokens[i]==='-'){const op=tokens[i++],b=product();a=op==='+'?a+b:a-b}return a};
 const result=expr();assert.equal(i,tokens.length);return result;
}
function row(page,name,formula){const r=rows.find(r=>r.page===page&&r.name===name&&(!formula||r.formula===formula));assert.ok(r,'source relation '+name);return r}
function sample(page,name,values,expected,formula){near(evaluate(row(page,name,formula).formula.split('=')[1],values),expected,name)}
ok(rows.length===70,'70 chemistry relationships/patterns');ok(rows.filter(r=>r.kind==='ARITHMETIC').length===48,'48 arithmetic relationships remain distinct from 22 patterns/reactions');ok(new Set(rows.map(r=>r.id)).size===70,'unique source IDs');
for(const r of rows)ok(byId.has(r.formulaId)&&r.conditions&&r.symbols.every(s=>s.symbol&&s.meaning&&s.unit),'local source definitions '+r.id);
for(const r of rows.filter(r=>r.kind!=='ARITHMETIC'))ok(r.numericStatus==='NOT_APPLICABLE'&&r.symbolicStatus==='NOT_APPLICABLE','patterns not marked as numerical or symbolic proofs '+r.id);
sample(55,'Nucleon count',{Z:26,N:30},56);
sample(59,'Alpha decay count relation',{A_p:238},234,'A_d = A_p−4');
sample(59,'Alpha decay count relation',{Z_p:92},90,'Z_d = Z_p−2');
sample(59,'Beta-minus decay count relation',{Z_p:6},7,'Z_d = Z_p+1');
sample(59,'Beta-plus decay count relation',{Z_p:9},8,'Z_d = Z_p−1');
sample(59,'Gamma de-excitation count relation',{A_p:60},60,'A_d = A_p');
ok(rows.filter(r=>r.page===59&&r.name.startsWith('Beta')).every(r=>r.conditions.includes('neutrino')),'beta count relations retain lepton emission conditions');
sample(60,'Energy from mass decrease',{'Δm':1e-6,c:299792458},89875517873.68176);
sample(64,'Entity count from amount',{n:2,N_A:6.02214076e23},1.204428152e24);
sample(64,'Molar mass from mass and amount',{m:9,n:.5},18);
sample(64,'Amount concentration',{n:.05,V:.25},.2,'c = n/V');
sample(64,'Amount concentration',{m:5.844,V:.5,M:58.44},.2,'c = m/(V·M)');
sample(64,'Mass percentage of solution',{m_solute:5,m_solution:100},5);
sample(64,'Molar volume',{V:24,n:1},24);
sample(67,'Acid activity equilibrium constant',{a_H:.01,a_A:.02,a_HA:.5},.0004);
sample(67,'Ideal dilute concentration acid constant',{c_H:.01,c_A:.02,c_HA:.5,'c°':1},.0004);
sample(67,'Base activity equilibrium constant',{a_BH:.1,a_OH:.01,a_B:.5},.002);
sample(67,'Water activity ion product',{a_H:1e-7,a_OH:1e-7},1e-14);
sample(68,'Activity-based pH',{a_H:1e-3},3);
sample(68,'Activity-based pH',{a_H:10},-1); // No artificial 0–14 clamp.
sample(68,'Ideal dilute concentration pH',{c_H:1e-4,'c°':1},4);
sample(68,'Activity-based pOH',{a_OH:1e-5},5);
sample(68,'Water logarithm constant',{K_w:1e-12},12);
sample(68,'Neutral aqueous pH',{pK_w:12},6); // General identity; no claim of an actual T here.
sample(68,'Acid logarithm constant',{K_a:1e-5},5);
sample(68,'Activity buffer relation',{pK_a:5,a_A:.1,a_HA:.01},6);
sample(68,'Ideal dilute concentration buffer relation',{pK_a:5,c_A:.2,c_HA:.2},5);
// Valence/count examples are checked against simple independent named molecules.
sample(69,'Acyclic alkane hydrogen count',{n:1},4); // methane
sample(70,'Acyclic alkyl substituent hydrogen count',{n:2},5); // ethyl
sample(70,'Acyclic monoalkene hydrogen count',{n:2},4); // ethene
sample(70,'Acyclic monoalkyne hydrogen count',{n:2},2); // ethyne
sample(71,'Acyclic diene hydrogen count',{n:3},4); // allene
sample(71,'Monocyclic cycloalkane hydrogen count',{n:3},6); // cyclopropane
ok(row(70,'Acyclic monoalkene hydrogen count').conditions.includes('n≥2'),'alkene minimum carbon count');
ok(row(71,'Monocyclic cycloalkane hydrogen count').conditions.includes('n≥3'),'single carbon cannot form this ring');
ok(row(76,'Condensation of two hexoses').conditions.includes('does not imply every disaccharide'),'hexose example is not a universal disaccharide formula');
ok(row(76,'Hexose-derived polysaccharide repeating unit').conditions.includes('terminal-group corrections'),'finite polymer ends not silently discarded');
ok(row(68,'Ideal dilute concentration pH').formula.includes('c_H/c°'),'dimensionless argument to concentration logarithm');
ok(row(65,'Four-species mass-action relation').conditions.includes('activities'),'thermodynamic K uses activities');
ok(row(64,'Entity count from amount').sourceIssue.includes('2019'),'current mole definition distinguished from legacy text');
ok(w.MT_STUDY.sourceEquationRegister.length===671,'all current expression registers retained');
ok(read('students/app.js').includes("r.symbolicStatus==='NOT_APPLICABLE'?'Source pattern read"),'pattern status does not falsely claim a symbolic proof');
ok(read('sw.js').includes("'./students/chemistry-equation-audit-20261020.js'"),'chemistry pack cached');
console.log(JSON.stringify({status:'PASS',checks,numericReferenceCases:numeric,chemistryRelationships:rows.length,arithmeticRelationships:48,structuralPatternsAndReactions:22,scope:'Selected arithmetic and semantic guards only; chemical structures, historical tables, full domains and source exhaustiveness not certified'}));
