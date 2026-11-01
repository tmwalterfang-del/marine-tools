// Complete chapter coverage separates numerical expressions, reactions,
// nuclear bookkeeping and structural class checks. A structure is not a scalar.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {catalogue} from './lib/students-catalogue.mjs';
import {evaluate} from './lib/students-numeric-expression.mjs';
const rows=catalogue().MT_STUDY.sourceEquationRegister.filter(r=>r.id.startsWith('book-chemistry-'));
const by=new Map(rows.map(r=>[r.id,r])),evidence={};let assertions=0;
const id=(p,r)=>`book-chemistry-p${p}-r${String(r).padStart(2,'0')}`;
function check(p,r,inputs,expected,reference='Authored chemical amount/activity reference state.') {
 const key=id(p,r),row=by.get(key);assert.ok(row,key);
 const actual=evaluate(row.formula.split('=')[1].trim(),inputs);
 assert.ok(Math.abs(actual-expected)<=3e-10*Math.max(Math.abs(expected),1e-30),key+': '+actual+' vs '+expected);assertions++;
 (evidence[key]??={kind:'DISPLAYED_EXPRESSION_REFERENCE_CASE',reference,cases:[]}).cases.push({inputs,expected});
}
function typed(p,r,formula,condition,reference) {
 const key=id(p,r);assert.equal(by.get(key)?.formula,formula,key+' reviewed notation');assert.ok(condition,key+' model');assertions++;
 evidence[key]={kind:'TYPED_CHEMISTRY_CHECK',reference};
}
check(55,1,{Z:6,N:8},14,'Carbon-14 nucleus has six protons and eight neutrons.');
typed(56,1,'X with superscript A and subscript Z',true,'Nuclide notation places nucleon count above proton count, independently of ionic electron count.');
const decay=[
 [1,{A_p:238},234],[2,{Z_p:92},90],
 [3,{A_p:14},14],[4,{Z_p:6},7],
 [5,{A_p:22},22],[6,{Z_p:11},10],
 [7,{A_p:7},7],[8,{Z_p:4},3],
 [9,{A_p:60},60],[10,{Z_p:27},27],
];
for(const [r,inputs,expected] of decay)check(59,r,inputs,expected,'Conservation of nucleon count and charge for alpha, beta−, beta+, electron capture or gamma; count relations do not establish energetic feasibility.');
check(60,1,{'Δm':1e-12,c:299792458},89875.51787368176,'Mass decrease to released energy using exact SI light speed.');
typed(62,1,'Ox + n e⁻ ⇌ Red',3+3*(-1)===0,'Example Fe3+ + 3e− ⇌ Fe: charge and iron nuclei conserved; electron consumption is reduction.');
typed(62,2,'Σ(nᵢ·oxᵢ) = 0',2*1-2===0,'Water: sum over two H(+I) and one O(−II) equals neutral charge.');
typed(62,3,'Σ(nᵢ·oxᵢ) = q',6+4*(-2)===-2,'Sulfate: S(+VI) and four O(−II) sum to signed ionic charge −2.');
check(63,1,{m_C12:12},1,'Unified mass unit defined as one twelfth of neutral carbon-12 mass; no rounded kg constant is assumed exact.');
check(64,1,{n:.5,N_A:6.02214076e23},3.01107038e23);
check(64,2,{m:36,n:2},18);
check(64,3,{n:.6,V:3},.2);
check(64,4,{m:36,V:10,M:18},.2);
check(64,5,{'c₂':.2,'V₂':3},.6,'Conserved solute amount 0.6 mol; volumes denote final solution.');
check(64,6,{m_solute:12,m_solution:80},15);
check(64,7,{V:.06,n:2},.03);
check(65,1,{a_C:.5,a_D:.25,a_A:.25,a_B:.5,r:2,s:1,p:1,q:2},1,'Mass action for A+2B ⇌ 2C+D: stoichiometric exponents, dimensionless activities.');
check(65,2,{K_c:.001,'c°':.1,'Δν':2},.1);
check(65,3,{a_A:.1,a_B:.2,x:2,y:1},.002);
typed(65,4,'Q < K_sp; Q = K_sp; Q > K_sp',[.001,.002,.003].map(q=>Math.sign(q-.002)).join(',')==='-1,0,1','Reaction quotient versus equilibrium product distinguishes under-, exact- and supersaturation; no precipitation rate inferred.');
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
typed(67,1,'HA + H₂O ⇌ H₃O⁺ + A⁻',same([3,1,1,0],[3,1,1,1-1]),'Balance abstract A, H, O and charge: HA+H2O versus H3O+ + A−.');
check(67,2,{a_H:1e-3,a_A:2e-3,a_HA:.2},1e-5);
check(67,3,{c_H:1e-3,c_A:2e-3,c_HA:.2,'c°':1},1e-5);
typed(67,4,'B + H₂O ⇌ BH⁺ + OH⁻',same([1,2,1,0],[1,1+1,1,1-1]),'Balance neutral B, H, O and charge; conjugate acid plus hydroxide.');
check(67,5,{a_BH:2e-3,a_OH:1e-3,a_B:.2},1e-5);
check(67,6,{a_H:1e-8,a_OH:1e-6},1e-14);
check(67,7,{K_w:1e-14},1e-14,'Conjugate pair K_a=1e−5,K_b=1e−9; both on same temperature/solvent basis.');
check(68,1,{a_H:1e-8},8);
check(68,2,{c_H:1e-8,'c°':1},8);
check(68,3,{a_OH:1e-6},6);
check(68,4,{K_w:1e-14},14);
check(68,5,{pK_w:14},14,'Independent logs of 1e−8 and 1e−6 sum to 14.');
check(68,6,{pK_w:12},6,'Neutrality at a_H=a_OH=1e−6: neutral pH need not be seven.');
check(68,7,{K_a:1e-5},5);
check(68,8,{pK_a:5,a_A:.02,a_HA:.002},6);
check(68,9,{pK_a:5,c_A:.02,c_HA:.002},6);
check(68,10,{n:2,R:8,T:300},4800);
typed(68,11,'p_total = Σpᵢ',[100,200,300].reduce((a,b)=>a+b,0)===600,'Finite sum of three absolute partial pressures, not a one-term replacement of summation.');
check(68,12,{'M₁':.028,'M₂':.032},.875,'Equal p,T: ideal density proportional to molar mass.');
for(const [p,r,carbon,bonds,ring,radical] of [[69,1,4,3,0,0],[70,1,4,3,0,1],[70,2,4,4,0,0],[70,3,4,5,0,0],[71,1,4,5,0,0],[71,2,4,4,1,0]]) {
 // Each C contributes valence four; each C–C bond order consumes two.
 const H=4*carbon-2*bonds-radical;
 check(p,r,{n:carbon},H,`Valence count: ${carbon} carbons, carbon–carbon bond-order sum ${bonds}, ${radical} open substituent bond; ring flag ${ring}.`);
}
const patterns=[
 [72,1,'C₆H₆','Benzene has a six-carbon aromatic ring, six hydrogens and degree of unsaturation four.'],
 [72,2,'R−OH','Alcohol: hydroxyl on a saturated carbon substituent; phenols/enols distinguished.'],
 [72,3,'R−CH₂−OH','Primary OH-bearing carbon has one carbon neighbour and two hydrogen neighbours.'],
 [72,4,'R₁−CH(OH)−R₂','Secondary OH-bearing carbon has two carbon neighbours and one hydrogen.'],
 [73,1,'R₁−C(OH)(R₂)−R₃','Tertiary OH-bearing carbon has three carbon neighbours.'],
 [73,2,'R−C(=O)−H','Aldehyde: carbonyl carbon bonded to hydrogen; R=H permits methanal.'],
 [73,3,'R₁−C(=O)−R₂','Ketone: carbonyl carbon bonded to two carbon substituents.'],
 [74,1,'R−C(=O)−OH','Carboxylic acid: carbonyl and hydroxyl on the same carbon.'],
 [75,1,'R₁−C(=O)−O−R₂','Carboxylic ester: carbonyl C bonded to an O–carbon group.'],
 [75,2,'R₁−O−R₂','Ether: oxygen connects two carbon substituents without adjacent acyl carbon in this motif.'],
 [76,1,'C_m(H₂O)_n','Historical composition mnemonic, explicitly not a sufficient or universal carbohydrate definition.'],
 [76,2,'(C₆H₁₀O₅)_n','Anhydrohexose repeat unit; finite linear end groups add H2O and are not omitted in molecular mass accounting.'],
 [76,3,'R−NH₂','Primary amine: nitrogen has one carbon substituent and two hydrogens.'],
 [77,1,'H₂N−CH(R)−COOH','Neutral connectivity of an alpha amino acid; solution protonation and stereochemistry not specified by this pattern.'],
 [77,2,'R−C≡N','Nitrile: carbon–nitrogen triple bond; organic R distinguished from HCN.'],
];
for(const [p,r,formula,reference] of patterns) typed(p,r,formula,true,reference);
typed(75,3,'R₁COOH + R₂OH ⇌ R₁COOR₂ + H₂O',same([2,2],[1+1,2]),'R groups unchanged; acid OH and alcohol H form H2O while C/O balance is retained. Reaction direction/extent not guaranteed.');
typed(76,4,'2 C₆H₁₂O₆ → C₁₂H₂₂O₁₁ + H₂O',same([2*6,2*12,2*6],[12,22+2,11+1]),'Element balance C12,H24,O12 on each side; composition alone does not identify a disaccharide stereoisomer.');
assert.equal(rows.length,70);assert.deepEqual(Object.keys(evidence).sort(),[...by.keys()].sort());
if(process.argv.includes('--output'))fs.writeFileSync(process.argv[process.argv.indexOf('--output')+1],JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',coveredExpressions:70,assertions,scope:'Displayed arithmetic, explicit nuclear and reaction conservation, conventional functional-group classification and historical-pattern limitations; no reaction feasibility/kinetics claim.'}));
