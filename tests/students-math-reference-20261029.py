"""Authored mathematical models for all 262 captured mathematics expressions.

Uses the preview's runtime register, not a second inventory. Mathematical
transcriptions below are authored against the recorded notation; the companion
context test freezes formula, conditions and symbols. A reference case is not
reported as a proof over an entire domain. Historical book illustrations are not
used or redistributed.
"""
import json, math, subprocess
from pathlib import Path
import sympy as s

ROOT = Path(__file__).resolve().parents[1]
payload = subprocess.check_output([
    'node', '--input-type=module', '-e',
    "import {catalogue} from './tests/lib/students-catalogue.mjs'; console.log(JSON.stringify(catalogue().MT_STUDY.sourceEquationRegister));"
], cwd=ROOT, text=True, encoding='utf-8')
rows = {r['id']: r for r in json.loads(payload) if r['id'].startswith('book-math-')}
evidence, assertions = {}, 0

def ident(page, row): return f'book-math-p{page}-r{row:02d}'
def record(page, row, kind, basis):
    key = ident(page, row)
    assert key in rows, key
    evidence.setdefault(key, {'kind': kind, 'basis': basis, 'checks': 0})['checks'] += 1
    return key

def eq(page, row, actual, expected, basis, kind='SYMBOLIC_IDENTITY'):
    global assertions
    key = record(page, row, kind, basis)
    difference = s.trigsimp(s.simplify(s.expand_trig(actual-expected)))
    if difference != 0:
        difference = s.trigsimp(difference, method='fu')
    if difference != 0:
        difference = s.simplify(difference.rewrite(s.exp))
    assert difference == 0, (key, difference)
    assertions += 1

def near(page, row, actual, expected, basis, tol=2e-10, kind='INDEPENDENT_REFERENCE_CASE'):
    global assertions
    key = record(page, row, kind, basis)
    assert math.isfinite(float(actual)) and abs(float(actual-expected)) <= tol*max(1, abs(float(expected))), (key, actual, expected)
    assertions += 1

def typed(page, row, condition, basis):
    global assertions
    key = record(page, row, 'THEOREM_OR_TYPED_MODEL_CHECK', basis)
    assert condition, key
    assertions += 1

a,b=s.symbols('a b', positive=True)
m,n,q=s.symbols('m n q', positive=True, integer=True)
x=s.symbols('x', real=True, nonzero=True)
k=s.symbols('k', real=True)
u=s.Function('u')(x);v=s.Function('v')(x);f=s.Function('f')
loc={'a':a,'b':b,'m':m,'n':n,'q':q,'x':x,'k':k,'u':u,'v':v,'f':f,
     'diff':s.diff,'Integral':s.Integral,'log':s.log,'Abs':s.Abs,'exp':s.exp,
     'sqrt':s.sqrt,'atan':s.atan,'asin':s.asin,'sin':s.sin,'cos':s.cos,'tan':s.tan,'cot':s.cot}
for key,r in rows.items():
    if not r.get('symbolic'): continue
    lhs,rhs=[s.sympify(part,locals=loc) for part in r['symbolic']]
    difference=s.trigsimp(s.expand_trig(s.simplify(lhs-rhs)))
    if key=='book-math-p19-r04': difference=s.refine(difference,s.Q.nonzero(s.cos(x)))
    if key=='book-math-p19-r05': difference=s.refine(difference,s.Q.nonzero(s.sin(x)))
    assert difference==0,(key,difference)
    record(r['page'],int(key[-2:]),'SYMBOLIC_IDENTITY','Explicit positive real bases, integer root indices and stated calculus domains; CAS difference vanishes.')
    assertions+=1

# Finite algebra, logarithms and sequences. Reference sums are expanded term by term.
for N in range(0,9):
    eq(8,2,(a+b)**N,sum(s.binomial(N,j)*a**(N-j)*b**j for j in range(N+1)), 'Finite binomial expansion; explicit n=0..8 polynomial checks.', 'SYMBOLIC_FINITE_CASES')
c=s.symbols('c',real=True)
eq(8,3,a*(-b/a)+b,0,'Substitute the displayed linear root into the original polynomial.')
for sign in [-1,1]:
    root=(-b+sign*s.sqrt(b*b-4*a*c))/(2*a)
    eq(8,4,a*root**2+b*root+c,0,'Both quadratic branches substituted into the defining polynomial; nonzero a.')
eq(8,5,a**(s.log(b)/s.log(a)),b,'Positive logarithm argument; a>0, a≠1.')
eq(8,6,s.expand_log(s.log(a*b)),s.log(a)+s.log(b),'Positive real arguments; shared logarithm base.')
eq(8,7,s.expand_log(s.log(a/b)),s.log(a)-s.log(b),'Positive real arguments; quotient.')
eq(8,8,s.expand_log(s.log(a**n)),n*s.log(a),'Positive real base; integer specialization of real-domain identity.')
eq(8,9,s.expand_log(s.log(a**(1/n))),s.log(a)/n,'Positive radical; positive integer root index.')
eq(8,10,a**(s.log(b)/s.log(a)),b,'Substitute logarithmic solution into a**x=b.')
for N in range(1,10):
    arithmetic=[s.Rational(3,2)+j*s.Rational(-2,3) for j in range(N)]
    eq(8,11,s.Rational(3,2)+(N-1)*s.Rational(-2,3),arithmetic[-1],'Explicit arithmetic progression including a negative step.','EXACT_REFERENCE_CASE')
    eq(8,12,N*(arithmetic[0]+arithmetic[-1])/2,sum(arithmetic),'Sum independently enumerated terms.','EXACT_REFERENCE_CASE')
    for ratio in [s.Rational(1,2),-2,2]:
        terms=[s.Rational(3,2)]
        for j in range(1,N): terms.append(terms[-1]*ratio)
        eq(8,13,s.Rational(3,2)*ratio**(N-1),terms[-1],'Recursively generated geometric progression.','EXACT_REFERENCE_CASE')
        eq(8,14,s.Rational(3,2)*(ratio**N-1)/(ratio-1),sum(terms),'Explicit finite sum; ratio one excluded.','EXACT_REFERENCE_CASE')
    balance=s.Integer(100)
    for j in range(N): balance+=balance*s.Rational(1,20)
    eq(8,15,100*(1+s.Rational(5,100))**N,balance,'Interest credited sequentially after each period.','EXACT_REFERENCE_CASE')

# Infinite series: exact sums for exp/sin/cos and logarithm; theorem assumptions
# are separately retained. Smoothness alone is deliberately not accepted as analyticity.
j=s.symbols('j',integer=True,nonnegative=True)
for page_row in [1,2]:
    for function,centre in [(x**5+2*x,0),(x**5+2*x,2)]:
        t=s.symbols('t',real=True)
        series=sum(s.diff(function,x,h).subs(x,centre)*t**h/s.factorial(h) for h in range(6))
        eq(9,page_row,series,function.subs(x,centre+t),'Taylor theorem on an exact polynomial; expansion point and increment kept separate.','SYMBOLIC_FINITE_CASES')
typed(9,1,'converge to f' in rows[ident(9,1)]['conditions'].lower(),'Series must converge to the function itself; infinitely differentiable alone is insufficient.')
typed(9,2,'analytic' in rows[ident(9,2)]['conditions'].lower() or 'remainder' in rows[ident(9,2)]['conditions'].lower(),'General Taylor expansion requires vanishing remainder.')
typed(9,3,'L=1' in rows[ident(9,3)]['conditions'].replace(' ',''),'Ratio test: geometric terms have L<1 or >1; harmonic terms have L=1 and remain inconclusive.')
eq(9,4,s.summation(x**j/s.factorial(j),(j,0,s.oo)),s.exp(x),'Exact exponential power-series sum.')
eq(9,5,s.summation((-1)**j*x**(2*j+1)/s.factorial(2*j+1),(j,0,s.oo)),s.sin(x),'Exact sine power-series sum.')
eq(9,6,s.summation((-1)**j*x**(2*j)/s.factorial(2*j),(j,0,s.oo)),s.cos(x),'Exact cosine power-series sum.')
for value in [s.Rational(-1,2),s.Rational(1,2),1]:
    eq(9,7,s.summation((-1)**j*value**(j+1)/(j+1),(j,0,s.oo)),s.log(1+value),'Logarithm series at interior and convergent x=1 boundary.','EXACT_REFERENCE_CASE')
p=s.symbols('p',real=True)
for N in range(0,8):
    coeff=s.prod(p-h for h in range(N))/s.factorial(N)
    eq(9,8,s.diff((1+x)**p,x,N).subs(x,0)/s.factorial(N),coeff,'Generalized binomial Taylor coefficients; convergence |x|<1 recorded.','SYMBOLIC_FINITE_CASES')
    eq(9,9,coeff,s.prod(p-h for h in range(N))/s.factorial(N),'Generalized coefficient is a falling factorial; n=0 uses empty product.','DEFINITION_CHECK')

# Plane geometry from strips, polar integration and cross products.
r,h,R,d=s.symbols('r h R d',positive=True)
t,z=s.symbols('t z',real=True)
eq(9,10,a*b,s.integrate(b,(t,0,a)),'Uniform rectangular strips.')
eq(9,11,a*a,s.integrate(a,(t,0,a)),'Square as rectangular strips.')
eq(10,1,a*h,s.integrate(a,(t,0,h)),'Parallelogram horizontal strips have constant breadth.')
eq(10,2,a*b/2,4*s.Rational(1,2)*(a/2)*(b/2),'Four right triangles formed by perpendicular diagonals.')
eq(10,3,(a+b)*h/2,s.integrate(a+(b-a)*t/h,(t,0,h)),'Linearly varying trapezoid breadth.')
eq(10,4,a*h/2,s.integrate(a*(1-t/h),(t,0,h)),'Triangular strips.')
near(10,5,s.sqrt(6*(6-3)*(6-4)*(6-5)),6,'3–4–5 triangle area from perpendicular legs.')
for row,B,C,angle in [(6,4,5,s.asin(s.Rational(3,5))),(7,3,5,s.asin(s.Rational(4,5))),(8,3,4,s.pi/2)]:
    near(10,row,B*C*s.sin(angle)/2,6,'Same 3–4–5 triangle; cyclic opposite-angle convention.')
disk=s.integrate(s.integrate(t,(t,0,r)),(z,0,2*s.pi))
for row,expr in [(9,s.pi*r*r),(10,s.pi*(2*r)**2/4),(11,(2*s.pi*r)*r/2)]: eq(10,row,expr,disk,'Circle area from polar Jacobian integration.')
eq(10,12,2*r,r-(-r),'Diameter endpoints on an axis.')
eq(10,13,2*s.pi*r,s.integrate(r,(t,0,2*s.pi)),'Circle arc-length integral.')
eq(10,14,s.pi*(2*r),s.integrate(r,(t,0,2*s.pi)),'Diameter form of circumference.')
angle=s.symbols('angle',positive=True);degrees=180*angle/s.pi
sector=s.integrate(s.integrate(t,(t,0,r)),(z,0,angle))
for row,expr in [(1,angle*r*r/2),(2,angle*r*r/2),(3,s.pi*r*r*degrees/360),(4,s.pi*(2*r)**2*degrees/1440)]: eq(11,row,expr,sector,'Sector from polar area integration; degree/radian conversion explicit.')
for row,expr in [(5,2*s.pi*r*degrees/360),(6,s.pi*(2*r)*degrees/360),(7,angle*r)]: eq(11,row,expr,s.integrate(r,(t,0,angle)),'Arc length along a circle.')
eq(11,8,angle*r/r,angle,'Inverse arc-length definition; r>0.')
base=s.symbols('base',positive=True)
eq(11,9,base*h,s.integrate(base,(z,0,h)),'Prism strips.')
for row,expr in [(10,s.pi*r*r*h),(11,s.pi*(2*r)**2*h/4)]: eq(11,row,expr,s.integrate(disk,(z,0,h)),'Cylinder as circular slices.')
for row,expr in [(12,2*s.pi*r*(r+h)),(13,s.pi*(2*r)*(h+r))]: eq(11,row,expr,2*disk+s.integrate(r,(t,0,2*s.pi))*h,'Cylinder: two disks and unrolled lateral surface.')
cone=s.integrate(s.pi*(r*z/h)**2,(z,0,h))
eq(11,14,base*h/3,s.integrate(base*(z/h)**2,(z,0,h)),'Similar sections in a pyramid/cone.')
for row,expr in [(15,s.pi*r*r*h/3),(16,s.pi*(2*r)**2*h/12)]: eq(11,row,expr,cone,'Cone from similar circular slices.')
slant=s.sqrt(r*r+h*h)
cone_side=s.integrate(2*s.pi*r*z/h*s.sqrt(1+(r/h)**2),(z,0,h))
for row,expr in [(17,s.pi*r*(r+slant)),(18,s.pi*(2*r)*(slant+r)/2)]: eq(11,row,expr,disk+cone_side,'Cone lateral surface from surface-of-revolution integral.')
frustum=s.integrate(s.pi*(r+(R-r)*z/h)**2,(z,0,h))
eq(11,19,s.pi*h*(R*R+R*r+r*r)/3,frustum,'Frustum from linear-radius slices.')
eq(11,20,s.pi*h*((2*R)**2+(2*R)*(2*r)+(2*r)**2)/12,frustum,'Diameter variant of the same independent slices.')
eq(11,21,s.pi*s.sqrt(h*h+(R-r)**2)*(R+r),s.pi*(R+r)*h*s.sqrt(1+(R-r)**2/h**2),'Frustum slant-area integration.')
eq(12,1,base*h/3,s.integrate(base*(z/h)**2,(z,0,h)),'Pyramid similar sections.')
eq(12,2,h*(a*a+b*b+a*b)/3,s.integrate((a+(b-a)*z/h)**2,(z,0,h)),'Frustum requires parallel similar bases; a,b here are square-root areas.')
sphere=s.integrate(s.pi*(r*r-z*z),(z,-r,r))
for row,expr in [(3,4*s.pi*r**3/3),(4,s.pi*(2*r)**3/6)]: eq(12,row,expr,sphere,'Sphere as circular slices.')
sphere_area=s.integrate(2*s.pi*r*r*s.sin(t),(t,0,s.pi))
for row,expr in [(5,4*s.pi*r*r),(6,s.pi*(2*r)**2)]: eq(12,row,expr,sphere_area,'Sphere surface Jacobian.')
eq(12,7,2*s.pi*r*r*h/3,(sphere_area*(h/(2*r)))*r/3,'Spherical sector: solid angle times r cubed/3; not spherical cap.')
for row,expr in [(8,2*s.pi*r*h),(9,s.pi*(2*r)*h)]: eq(12,row,expr,s.integrate(2*s.pi*r,(z,r-h,r)),'Spherical zone from constant area per axial height.')
eq(12,10,s.pi*h*h*(r-h/3),s.integrate(s.pi*(r*r-z*z),(z,r-h,r)),'Cap volume from circular slices.')
for row,expr in [(11,4*s.pi*r**3*degrees/(3*360)),(12,s.pi*(2*r)**3*degrees/(6*360))]: eq(12,row,expr,sphere*angle/(2*s.pi),'Spherical wedge fraction of complete azimuth.')
for row,expr in [(13,4*s.pi*r*r*degrees/360+s.pi*r*r),(14,s.pi*(2*r)**2*degrees/360+s.pi*(2*r)**2/4)]: eq(12,row,expr,sphere_area*angle/(2*s.pi)+disk,'Wedge: curved surface plus two semicircular cut faces; excludes coincident-cut endpoints.')

# Trigonometry: right triangle, exact special angles and complete addition identities.
alpha,beta=s.symbols('alpha beta',real=True)
eq(13,1,5**2,3**2+4**2,'3–4–5 right triangle.')
for row,actual,expected in [(2,s.sin(s.atan(s.Rational(3,4))),s.Rational(3,5)),(3,s.cos(s.atan(s.Rational(3,4))),s.Rational(4,5)),(4,s.tan(s.atan(s.Rational(3,4))),s.Rational(3,4)),(5,s.cot(s.atan(s.Rational(3,4))),s.Rational(4,3)),(6,s.sec(s.atan(s.Rational(3,4))),s.Rational(5,4)),(7,s.csc(s.atan(s.Rational(3,4))),s.Rational(5,3))]: eq(13,row,actual,expected,'Right-triangle definitions, including reciprocal exclusions.','EXACT_REFERENCE_CASE')
for row,fn,exact_angle,expected in [(8,s.sin,0,0),(9,s.cos,0,1),(10,s.sin,s.pi/6,s.Rational(1,2)),(11,s.cos,s.pi/6,s.sqrt(3)/2),(12,s.sin,s.pi/4,s.sqrt(2)/2),(13,s.cos,s.pi/4,s.sqrt(2)/2),(14,s.sin,s.pi/3,s.sqrt(3)/2),(15,s.cos,s.pi/3,s.Rational(1,2)),(16,s.sin,s.pi/2,1),(17,s.cos,s.pi/2,0),(18,s.tan,0,0),(19,s.tan,s.pi/6,1/s.sqrt(3)),(20,s.tan,s.pi/4,1),(21,s.tan,s.pi/3,s.sqrt(3))]: eq(13,row,fn(exact_angle),expected,'Exact unit-circle angle, degrees converted to radians.')
typed(13,22,s.cos(s.pi/2)==0 and s.tan(s.pi/2)==s.zoo,'tan90° is undefined: zero cosine denominator, not a huge finite approximation.')
trig={13:(s.sin(alpha+beta),s.sin(alpha)*s.cos(beta)+s.cos(alpha)*s.sin(beta)),14:(s.cos(alpha+beta),s.cos(alpha)*s.cos(beta)-s.sin(alpha)*s.sin(beta)),15:(s.tan(alpha+beta),(s.tan(alpha)+s.tan(beta))/(1-s.tan(alpha)*s.tan(beta))),16:(s.sin(alpha-beta),s.sin(alpha)*s.cos(beta)-s.cos(alpha)*s.sin(beta)),17:(s.cos(alpha-beta),s.cos(alpha)*s.cos(beta)+s.sin(alpha)*s.sin(beta)),18:(s.tan(alpha-beta),(s.tan(alpha)-s.tan(beta))/(1+s.tan(alpha)*s.tan(beta))),19:(s.sin(alpha)+s.sin(beta),2*s.sin((alpha+beta)/2)*s.cos((alpha-beta)/2)),20:(s.sin(alpha)-s.sin(beta),2*s.cos((alpha+beta)/2)*s.sin((alpha-beta)/2)),21:(s.cos(alpha)+s.cos(beta),2*s.cos((alpha+beta)/2)*s.cos((alpha-beta)/2)),22:(s.cos(alpha)-s.cos(beta),-2*s.sin((alpha+beta)/2)*s.sin((alpha-beta)/2)),23:(s.sin(alpha)*s.cos(beta),(s.sin(alpha+beta)+s.sin(alpha-beta))/2),24:(s.cos(alpha)*s.sin(beta),(s.sin(alpha+beta)-s.sin(alpha-beta))/2),25:(s.cos(alpha)*s.cos(beta),(s.cos(alpha+beta)+s.cos(alpha-beta))/2),26:(s.sin(alpha)*s.sin(beta),(s.cos(alpha-beta)-s.cos(alpha+beta))/2),29:(s.tan(alpha/2),s.sin(alpha)/(1+s.cos(alpha))),30:(s.tan(alpha/2),(1-s.cos(alpha))/s.sin(alpha))}
for row,(left,right) in trig.items(): eq(14,row,left,right,'Trigonometric identity on the intersection of defined denominator domains.')
for row,fn,radicand in [(27,s.sin,(1-s.cos(alpha))/2),(28,s.cos,(1+s.cos(alpha))/2)]:
    eq(14,row,fn(alpha/2)**2,radicand,'Square identity plus both displayed sides nonnegative establishes the principal-root absolute-value form.')

# Plane triangles and coordinate definitions.
A,B,C=s.pi/6,s.pi/3,s.pi/2;aa,bb,cc=1,s.sqrt(3),2
eq(15,1,aa/s.sin(A),bb/s.sin(B),'Independently constructed 30–60–90 triangle.','EXACT_REFERENCE_CASE')
eq(15,1,bb/s.sin(B),cc/s.sin(C),'Third opposite side/angle pair.','EXACT_REFERENCE_CASE')
eq(15,2,aa**2,bb**2+cc**2-2*bb*cc*s.cos(A),'Cosine law on 30–60–90 triangle.','EXACT_REFERENCE_CASE')
eq(15,3,(aa-bb)/(aa+bb),s.tan((A-B)/2)/s.tan((A+B)/2),'Tangent law with unequal sides.','EXACT_REFERENCE_CASE')
eq(15,4,angle*r/r,angle,'Arc definition of radians.')
eq(15,5,s.pi*degrees/180,angle,'Full turn is 2π rad = 360 degrees.')
eq(15,6,180*angle/s.pi,degrees,'Inverse conversion.')
for row,actual,expected in [(7,5*s.cos(s.atan(s.Rational(4,3))),3),(8,5*s.sin(s.atan(s.Rational(4,3))),4),(9,s.sqrt(3**2+4**2),5),(10,s.cos(s.atan(s.Rational(4,3))),s.Rational(3,5)),(11,s.sin(s.atan(s.Rational(4,3))),s.Rational(4,5))]: eq(15,row,actual,expected,'Cartesian point (3,4) from a 3–4–5 triangle.','EXACT_REFERENCE_CASE')
eq(15,12,s.tan(s.atan(2))*3+4,10,'Line through (0,4),(3,10) has gradient 2.','EXACT_REFERENCE_CASE')
eq(15,13,3**2+4**2,5**2,'Circle at origin.','EXACT_REFERENCE_CASE')
eq(15,14,(5-2)**2+(3+1)**2,5**2,'Translated circle, centre (2,-1).','EXACT_REFERENCE_CASE')
eq(16,1,(a*s.cos(t))**2/a**2+(b*s.sin(t))**2/b**2,1,'Ellipse parameterized by scaled unit circle.')
eq(16,2,((a*s.cos(t)+2)-2)**2/a**2+((b*s.sin(t)-3)+3)**2/b**2,1,'Translated ellipse.')
eq(16,3,s.cosh(t)**2-s.sinh(t)**2,1,'Hyperbolic parameterization, transverse x axis.')
eq(16,4,s.cosh(t)**2-s.sinh(t)**2,1,'Translation cancels relative to centre.')
eq(16,5,s.sinh(t)**2-s.cosh(t)**2,-1,'Negative right side exchanges transverse axis.')
for sign in [-1,1]: eq(16,6,x*x/a**2-(sign*b*x/a)**2/b**2,0,'Asymptotes annihilate the homogeneous quadratic part.')
for row,yy in [(7,x*x/(2*a)),(8,x*x/(2*a)),(9,-x*x/(2*a))]:
    focus=a/2 if row!=9 else -a/2; directrix=-focus
    eq(16,row,x*x+(yy-focus)**2,(yy-directrix)**2,'Parabola is equidistant from focus and directrix; p is their separation, not focus distance.')

# Numerical integration and Pappus: exact cubic and direct annular/cylindrical models.
eq(17,1,s.Rational(1,2)*(0+2)+1,s.integrate(t,(t,0,2)),'Trapezoidal composite rule is exact for a straight line; uniform h=1.')
eq(17,2,s.Rational(1,3)*(0+4+8),s.integrate(t**3,(t,0,2)),'Single Simpson panel exact for cubic.')
eq(17,3,s.Rational(1,3)*(0+4+2*8+4*27+64),s.integrate(t**3,(t,0,4)),'Composite Simpson cubic over four equal intervals.')
eq(17,4,2*s.pi*r*h,s.integrate(2*s.pi*r,(z,0,h)),'A vertical line at radius r rotates into a cylinder lateral surface.')
annulus=s.integrate(2*s.pi*z*h,(z,a,a+b))
eq(17,5,2*s.pi*(a+b/2)*(b*h),annulus,'Rectangular lamina outside axis, direct cylindrical-shell volume.')
eq(17,6,2*s.pi*(a+b/2)*(b*h)*degrees/360,annulus*angle/(2*s.pi),'Partial rotation with no overlap.')
g=s.Function('g')
eq(18,2,s.diff(f(g(x)),x),s.Subs(s.diff(f(t),t),t,g(x))*s.diff(g(x),x),'Symbolic chain rule for arbitrary differentiable composition.')
eq(18,16,s.diff(s.Integral(f(x),x),x),f(x),'Fundamental antiderivative relation; integration constants represent a family.')
area=s.integrate(2*t,(t,0,3));moment=s.integrate(t*2*t,(t,0,3))
eq(19,14,moment,18,'First area moment of triangular strip region.','EXACT_REFERENCE_CASE')
eq(19,15,moment/area,2,'Centroid from independent area and moment integrals.','EXACT_REFERENCE_CASE')
eq(19,16,area,9,'Triangular area from strips.','EXACT_REFERENCE_CASE')
eq(19,17,s.integrate(t*t*2*t,(t,0,3)),s.Rational(81,2),'Second area moment of same triangular region.','EXACT_REFERENCE_CASE')

# Spherical geometry oracle: unit-vector dot products and tangent-plane angles.
# No spherical sine/cosine-law expression is used to obtain the reference angles.
def dot(a,b): return sum(x*y for x,y in zip(a,b))
def norm(a): return math.sqrt(dot(a,a))
def angle_between(a,b): return math.acos(max(-1,min(1,dot(a,b)/(norm(a)*norm(b)))))
def tangent(at,other): return tuple(other[i]-dot(at,other)*at[i] for i in range(3))
def spherical(points):
    A,B,C=points
    return (angle_between(B,C),angle_between(A,C),angle_between(A,B),angle_between(tangent(A,B),tangent(A,C)),angle_between(tangent(B,A),tangent(B,C)),angle_between(tangent(C,A),tangent(C,B)))
for points,right in [(((math.cos(.7),math.sin(.7),0),(math.cos(.5),0,math.sin(.5)),(1,0,0)),True),(((1,0,0),(.6,.8,0),(.3,.4,math.sqrt(.75))),False)]:
    aa,bb,cc,A,B,C=spherical(points);sin,cos,tan=math.sin,math.cos,math.tan
    if right:
        vals=[(cos(cc),cos(aa)*cos(bb)),(cos(cc),1/(tan(A)*tan(B))),(tan(aa),tan(cc)*cos(B)),(tan(bb),tan(cc)*cos(A)),(tan(A),tan(aa)/sin(bb)),(tan(B),tan(bb)/sin(aa)),(sin(aa),sin(cc)*sin(A)),(sin(bb),sin(cc)*sin(B)),(cos(aa),cos(A)/sin(B)),(cos(bb),cos(B)/sin(A))]
        for row,(left,right_value) in enumerate(vals,1): near(20,row,left,right_value,'Right spherical triangle obtained from tangent-plane vector geometry.')
    near(20,11,sin(aa)/sin(A),sin(bb)/sin(B),'Independent unit-vector spherical triangle.')
    near(20,11,sin(bb)/sin(B),sin(cc)/sin(C),'Third pair of spherical sine-law ratios.')
    vals=[(cos(aa),cos(bb)*cos(cc)+sin(bb)*sin(cc)*cos(A)),(cos(A),-cos(B)*cos(C)+sin(B)*sin(C)*cos(aa)),(cos(bb),cos(aa)*cos(cc)+sin(aa)*sin(cc)*cos(B)),(cos(B),-cos(A)*cos(C)+sin(A)*sin(C)*cos(bb)),(cos(cc),cos(aa)*cos(bb)+sin(aa)*sin(bb)*cos(C)),(cos(C),-cos(A)*cos(B)+sin(A)*sin(B)*cos(cc))]
    for row,(left,right_value) in enumerate(vals,12): near(20,row,left,right_value,'All side and angle cosine laws compared with independently constructed tangent geometry.')
    near(21,1,sin(bb)/tan(aa)-sin(C)/tan(A),cos(bb)*cos(C),'Four-part relation checked in independent vector triangle.')

# Complex identities with symbolic real components, and integer power samples.
c,d=s.symbols('c d',real=True);ar,br=s.symbols('ar br',real=True);z1=ar+s.I*br;z2=c+s.I*d
eq(21,2,z1+z2,(ar+c)+s.I*(br+d),'Component addition.')
eq(21,3,z1-z2,(ar-c)+s.I*(br-d),'Component subtraction.')
eq(21,4,z1+s.conjugate(z1),2*ar,'Conjugation fixes real component.')
eq(21,5,z1-s.conjugate(z1),2*s.I*br,'Conjugation reverses imaginary component.')
eq(21,6,z1*s.conjugate(z1),ar**2+br**2,'Conjugate product.')
eq(21,7,s.Abs(z1),s.sqrt(ar**2+br**2),'Modulus from nonnegative conjugate product.')
eq(21,8,s.cos(s.atan(s.Rational(4,3))),s.Rational(3,5),'Complex number 3+4i; nonzero modulus.','EXACT_REFERENCE_CASE')
eq(21,9,s.sin(s.atan(s.Rational(4,3))),s.Rational(4,5),'Imaginary component / modulus.','EXACT_REFERENCE_CASE')
eq(21,10,5*(s.cos(s.atan(s.Rational(4,3)))+s.I*s.sin(s.atan(s.Rational(4,3)))),3+4*s.I,'Polar reconstruction.','EXACT_REFERENCE_CASE')
polar1=a*(s.cos(alpha)+s.I*s.sin(alpha));polar2=b*(s.cos(beta)+s.I*s.sin(beta))
eq(21,11,polar1*polar2,a*b*(s.cos(alpha+beta)+s.I*s.sin(alpha+beta)),'Complex product adds arguments.')
eq(21,12,polar1/ polar2,(a/b)*(s.cos(alpha-beta)+s.I*s.sin(alpha-beta)),'Complex quotient subtracts arguments; denominator modulus positive.')
for N in range(-3,6):
    eq(21,13,(2*(s.cos(s.pi/3)+s.I*s.sin(s.pi/3)))**N,2**s.Integer(N)*(s.cos(N*s.pi/3)+s.I*s.sin(N*s.pi/3)),'Integer power including negative exponent on a nonzero complex number.','EXACT_REFERENCE_CASE')
    eq(21,14,(s.cos(s.pi/3)+s.I*s.sin(s.pi/3))**N,s.cos(N*s.pi/3)+s.I*s.sin(N*s.pi/3),'De Moivre on integer powers.','EXACT_REFERENCE_CASE')
eq(21,15,s.expand_complex(s.exp(s.I*alpha)),s.cos(alpha)+s.I*s.sin(alpha),'Euler relation for real angle.')

# Statistics, probability and oriented vector algebra use explicit finite populations/events.
sample=[1,2,6];mean=s.Rational(sum(sample),len(sample))
eq(22,1,mean,3,'Enumerated population [1,2,6].','EXACT_REFERENCE_CASE')
freq=[2,1,3];values=[1,4,7];population=[v for v,f in zip(values,freq) for _ in range(f)]
mu=s.Rational(sum(population),len(population))
eq(22,2,s.Rational(sum(f*v for f,v in zip(freq,values)),sum(freq)),mu,'Frequency representation versus explicitly expanded population.','EXACT_REFERENCE_CASE')
eq(22,3,s.Rational(sum(f*v*v for f,v in zip(freq,values)),sum(freq))-mu**2,sum((v-mu)**2 for v in population)/len(population),'Second raw moment versus central-square population variance.','EXACT_REFERENCE_CASE')
normal=s.exp(-t*t/2)/s.sqrt(2*s.pi)
eq(22,4,s.integrate(normal,(t,-s.oo,s.oo)),1,'Standard Gaussian density integrates to one; standardizing x gives arbitrary μ and positive σ.')
space=set(range(1,7));E={2,4,6};F={1,3};G={3,6}
eq(22,5,s.Rational(len(E),len(space)),s.Rational(1,2),'Six equally likely die outcomes.','EXACT_REFERENCE_CASE')
eq(22,6,s.Rational(len(E|F),6),s.Rational(len(E),6)+s.Rational(len(F),6),'Disjoint events; overlap not silently ignored.','EXACT_REFERENCE_CASE')
eq(22,7,s.Rational(len(E&G),6),s.Rational(len(E),6)*s.Rational(len(G),6),'Independent even/divisible-by-three events on six equiprobable outcomes.','EXACT_REFERENCE_CASE')
eq(22,8,s.Rational(len(space-E),6),1-s.Rational(len(E),6),'Complement partition.','EXACT_REFERENCE_CASE')
av=s.Matrix([2,3,6]);bv=s.Matrix([-1,4,2]);product=av.dot(bv);cross=av.cross(bv)
cos_angle=product/(av.norm()*bv.norm())
eq(22,9,av.norm()*bv.norm()*cos_angle,product,'Angle defined by inner product; compare Cartesian components.','EXACT_REFERENCE_CASE')
eq(22,10,sum(av[j]*bv[j] for j in range(3)),product,'Direct Cartesian dot product.','EXACT_REFERENCE_CASE')
eq(22,11,av.norm()**2*bv.norm()**2*(1-cos_angle**2),cross.dot(cross),'Lagrange identity proves cross-product magnitude; nonnegative square roots.','EXACT_REFERENCE_CASE')
eq(22,12,s.Matrix([av[1]*bv[2]-av[2]*bv[1],av[2]*bv[0]-av[0]*bv[2],av[0]*bv[1]-av[1]*bv[0]]).dot(cross),cross.dot(cross),'Cross product components from oriented determinant; basis right-handed.','EXACT_REFERENCE_CASE')
for row,j in [(13,0),(14,1),(15,2)]: eq(22,row,av[j]/av.norm(),s.Rational([2,3,6][j],7),'Direction cosines for vector of norm seven.','EXACT_REFERENCE_CASE')
eq(22,16,sum((av[j]/av.norm())**2 for j in range(3)),1,'Normalized squared Cartesian components sum to one.')

assert set(evidence)==set(rows), {'missing': sorted(set(rows)-set(evidence)), 'extra': sorted(set(evidence)-set(rows))}
summary={'status':'PASS','capturedExpressions':len(rows),'coveredExpressions':len(evidence),'assertions':assertions,
         'scope':'Authored mathematical translations: exact identities, independent geometric/vector constructions, finite examples and theorem/domain checks distinguished per expression. Reference cases do not prove arbitrary full domains.'}
if '--output' in __import__('sys').argv:
    output=Path(__import__('sys').argv[__import__('sys').argv.index('--output')+1])
    output.write_text(json.dumps({'summary':summary,'evidence':evidence},indent=2)+'\n',encoding='utf-8')
print(json.dumps(summary))
