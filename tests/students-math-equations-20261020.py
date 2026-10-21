"""Recheck explicitly modelled identities from the authored math pack with SymPy.
Install test dependency: python3 -m pip install sympy==1.14.0
These checks are not certification of all source expressions or full real domains.
"""
import json,re
from pathlib import Path
import sympy as s
text=(Path(__file__).resolve().parents[1]/'students/math-equation-audit-20261020.js').read_text()
rows=json.loads(re.search(r'const entries=(\[.*?\]);\nconst byId',text,re.S).group(1))
a,b=s.symbols('a b',positive=True);m,n,q=s.symbols('m n q',positive=True,integer=True)
x=s.symbols('x',real=True,nonzero=True);k=s.symbols('k',real=True);u=s.Function('u')(x);v=s.Function('v')(x);f=s.Function('f')
loc={'a':a,'b':b,'m':m,'n':n,'q':q,'x':x,'k':k,'u':u,'v':v,'f':f,'diff':s.diff,'Integral':s.Integral,'log':s.log,'Abs':s.Abs,'exp':s.exp,'sqrt':s.sqrt,'atan':s.atan,'asin':s.asin,'sin':s.sin,'cos':s.cos,'tan':s.tan,'cot':s.cot}
proofs=0;numeric=0
for r in rows:
 if not r['symbolic']:continue
 lhs,rhs=[s.sympify(v,locals=loc) for v in r['symbolic']]
 difference=s.trigsimp(s.expand_trig(s.simplify(lhs-rhs)))
 if r['id']=='book-math-p19-r04':difference=s.refine(difference,s.Q.nonzero(s.cos(x)))
 if r['id']=='book-math-p19-r05':difference=s.refine(difference,s.Q.nonzero(s.sin(x)))
 assert difference==0,(r['id'],difference)
 proofs+=1
 for sample in r['numericChecks']:
  d=sample['inputs'];subst={a:s.Rational(d['a']),b:s.Rational(d['b']),m:d['m'],n:d['n'],q:d['q'],x:s.Rational(2,5),k:2}
  left=float(lhs.subs(subst));right=float(rhs.subs(subst))
  assert abs(left-right)<=1e-9*max(1,abs(left),abs(right)),r['id']
  numeric+=1
assert proofs==65 and numeric==177,(proofs,numeric)
print(json.dumps({'status':'PASS','symbolicIdentities':proofs,'numericSamples':numeric,'totalCapturedExpressions':len(rows),'scope':'CAS assumptions: positive a,b; positive integer m,n,q; nonzero real x; logarithmic/trig exclusions as stated. Remaining expressions and full domains not certified.'}))
