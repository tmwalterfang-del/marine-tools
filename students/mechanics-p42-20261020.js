/* Mechanical strength-of-materials review: printed p. 42, photographed in the
 user-provided book ZIP. Formula facts restated independently; no published artwork
 or prose reused. Simplified relationships must retain their load assumptions. */
(function(){'use strict';
const rows=[["axial-stress","Axial normal stress","σ = F/A","Mechanics","Uniform axial stress for a concentrically loaded prismatic member; compression and tension use chosen sign convention.",[["σ","Average axial normal stress","Pa"],["F","Axial force magnitude","N"],["A","Loaded cross-sectional area","m²"]]],["strain","Axial engineering strain","ε = ΔL/L₀","Mechanics","Small axial engineering strain; initial gauge length L₀>0.",[["ε","Engineering strain","dimensionless"],["ΔL","Length change","m"],["L₀","Initial gauge length","m"]]],["hooke","Uniaxial Hooke law","σ = Eε","Mechanics","Linear elastic homogeneous solid, within proportional limit.",[["σ","Axial normal stress","Pa"],["E","Young's modulus","Pa"],["ε","Axial engineering strain","dimensionless"]]],["elastic-extension","Axial elastic bar elongation","ΔL = FL/(EA)","Mechanics","Prismatic linear-elastic bar under constant axial force with uniform E and area A; bending neglected.",[["ΔL","Axial elongation","m"],["F","Axial force","N"],["L","Original bar length","m"],["E","Young's modulus","Pa"],["A","Cross-sectional area","m²"]]],["avg-shear","Average direct shear stress","τ = F/Aₛ","Mechanics","Direct shear approximation; shear force F shared by considered shear area Aₛ.",[["τ","Average direct shear stress","Pa"],["F","Shearing force","N"],["Aₛ","Loaded shear area","m²"]]],["pin-bearing","Average pin bearing pressure","pᵦ = F/(n·d·t)","Mechanics","Simplified projected bearing stress in n equally loaded plates/shear-bearing faces; joint geometry and load path must be checked.",[["pᵦ","Average projected bearing pressure","Pa"],["F","Load to be transferred","N"],["n","Number of equally loaded projected bearing faces","count"],["d","Pin diameter","m"],["t","Plate thickness","m"]]],["pin-shear","Average shear stress in round pin","τ = 4F/(nπd²)","Mechanics","Uniform-load pin in n equivalent shear planes; ignores bending/stress concentration.",[["τ","Average pin shear stress","Pa"],["F","Total shear load","N"],["n","Number of load-carrying shear planes","count"],["d","Circular pin diameter","m"]]]];
const F=window.MT_FORMULAS,S=window.MT_STUDY;
if(!Array.isArray(F)||!S?.details)throw Error('Load student catalogue before mechanics');
const ids=new Set(F.map(f=>f.id));
S.photoReview=S.photoReview||{};
for(const [key,name,formula,category,note,vars] of rows){
 const id='mechanics-p42-'+key;if(ids.has(id))throw Error('Duplicate '+id);
 ids.add(id);F.push({id,name,formula,category,note,tags:'mechanics material strength axial stress shear Hooke joints'});
 S.details[id]={symbols:vars.map(([symbol,meaning,unit])=>({symbol,meaning,unit}))};
 S.photoReview[id]={page:42,status:'Printed source photograph read for formula symbol and unit context; independent structural model assumptions noted; dimensional tests pending.'};
}
S.mechanicsPage42={sourcePrintedPage:42,formulaIds:rows.map(r=>'mechanics-p42-'+r[0]),
status:'Formulas visually reviewed from user image; source diagrams/tables not reproduced. Other mechanics pages remain unreviewed.'};
})();