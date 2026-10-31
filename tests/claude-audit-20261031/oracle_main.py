# Independent hand-calculation oracle for main-page default cases (Claude, 2026-10-31).
import math
R=lambda x,d: round(x,d)
out=[]
def chk(card,label,mine,shown,tol):
    ok=abs(mine-shown)<=tol; out.append((card,label,mine,shown,ok))
# Fuel ROB: usable=ROB*(1-reserve) ; days = usable/rate
u=38*0.8; chk('ROB','usable m3',u,30.4,0.05); chk('ROB','days',u/4.2,7.2,0.05); chk('ROB','reserve',38*.2,7.6,.05)
for r,dd in [(3.5,8.69),(4.2,7.24),(5.0,6.08)]: chk('EndCompare',f'days@{r}',u/r,dd,.005)
chk('EndCompare','h@3.5',u/3.5*24,208+27/60,1/60)
# speed-fuel: linear between 8/3.4 and 10/5.8 at 9
chk('SpeedFuel','m3/day',3.4+(9-8)/(10-8)*(5.8-3.4),4.60,.005)
# temp corr: V15 = V*(1-a*(T-15)) ; mass = V_obs*rho_obs? displayed 25.179 t
V15=30*(1-0.00083*(20-15)); chk('FuelTemp','V15',V15,29.876,.00051)  # 29.8755 shown rounded to 3 dp
chk('FuelTemp','mass t (obs vol x obs density)',30*839.3/1000,25.179,.0005)
# transfer: 8+6=14 of 20 =70%, 6/12 h = 30 min
chk('Transfer','m3',14,14.00,.005); chk('Transfer','%',70,70.0,.05); chk('Transfer','min',30,30,0.5)
# blend
mA=20*.840; mB=10*.890; chk('Blend','tA',mA,16.80,.005); chk('Blend','tB',mB,8.90,.005)
chk('Blend','density',(mA+mB)/30*1000,856.7,.05); chk('Blend','S% mass basis',(mA*.10+mB*.50)/(mA+mB),0.239,.0005)
chk('FuelUrea','t',10*.840,8.400,.0005)
# bunkering
v=[25,31.5,28]; d=[839,841.2,840.1]; kg=sum(a*b for a,b in zip(v,d))
chk('BunkOverview','m3',sum(v),84.50,.005); chk('BunkOverview','t',kg/1000,71.00,.005); chk('BunkOverview','wdens',kg/sum(v),840.2,.05)
chk('BunkOverview','avg interval d',((31+2)+(38))/2,35.5,.05)  # Jul1->Aug3=33, Aug3->Sep10=38
# hydraulic: P = bar*L/min/600
chk('Hyd','kW',180*80/600,24.00,.005)
# affinity 1500->1200
k=1200/1500; chk('Affinity','Q',50*k,40.0,.05); chk('Affinity','H',30*k**2,19.2,.05); chk('Affinity','P',8*k**3,4.10,.005)
# pipe
A=math.pi*.1**2/4; chk('Pipe','v',30/3600/A,1.06,.005); chk('Pipe','A',A,0.0079,.00005)
chk('TankInterp','m3',9.9+(1.2-1)/(1.5-1)*(15.2-9.9),12.020,.0005)
chk('FlowTime','h',18/12,1.5,1e-9)
chk('PressHead','m',2e5/(1000*9.80665),20.39,.005)
chk('GenMargin','%',320/500*100,64.0,.05); chk('GenMargin','kW',180,180,.5)
# NOx: power mode: (b-a) MWh? 240->350 and 185->310 => 110+125=235 MWh? shown 141.3 MWh -> check hours*kW? investigate separately
# LO trend
chk('LO','overall L/1000h',41/880*1000,46.59,.005); chk('LO','latest',23/460*1000,50.00,.005); chk('LO','L/day',41/62,0.66,.005)
# electrical
P=math.sqrt(3)*400*143*.85/1000; chk('3p','kW',P,84.2,.05); chk('3p','kVA',math.sqrt(3)*400*143/1000,99.1,.05)
# voltage drop simplified 3ph: dV = sqrt3*I*L*R/1000 (R ohm/km)
dv=math.sqrt(3)*80*50*.727/1000; chk('VD','V',dv,5.04,.005); chk('VD','%',dv/400*100,1.26,.005)
usable=500*(0.8-0.2)*0.92; chk('Battery','kWh',usable,276.0,.05); chk('Battery','min',usable/100*60,166,0.5)
chk('Motor','A',75000/(math.sqrt(3)*400*.85*.92),138.4,.05)
chk('PFcorr','kVAr',300*(math.tan(math.acos(.75))-math.tan(math.acos(.95))),166.0,.05)
chk('Trafo','I1',500e3/(math.sqrt(3)*690),418.4,.05); chk('Trafo','I2',500e3/(math.sqrt(3)*400),721.7,.05)
av=(141+148+137)/3; chk('Imbalance','avg',av,142.0,.05); chk('Imbalance','%',max(abs(x-av) for x in (141,148,137))/av*100,4.23,.005)
chk('Anchor','m',math.sqrt(120**2-20**2)+80,198,0.5)
fwa=5000/(4*12); chk('FWA','mm',fwa,104.2,.05); chk('DWA','mm',fwa*(1.025-1.010)/.025,62.5,.05)
chk('AirDraft','m',25-0.8-20-1,3.20,.005)
chk('DST','h',80/8,10,1e-9); chk('Unit','km',10*1.852,18.520,.0005)
chk('Compass','true',90+2-1,91.0,.05)
# encounter period, deep water: L=g T^2/2pi ; c=L/T ; Te = T/(1+ V cos(mu) T/(c*T))... head/following: waves FROM 270, course 90 -> following seas
g=9.80665;T=8;c=g*T/(2*math.pi);V=8*1852/3600
Te=T/(1-V/c)  # following seas (waves travelling same direction as ship)
chk('Encounter','s (following)',Te,11.93,.005)
# great circle Oslofjord->Stavanger approx
def hav(a,b,Rn=3440.065):
    p1,p2=map(math.radians,(a[0],b[0]));dp=p2-p1;dl=math.radians(b[1]-a[1])
    q=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2;return Rn*2*math.atan2(math.sqrt(q),math.sqrt(1-q))
a=(59.42,10.48);b=(58.97,5.73)
chk('GC','NM',hav(a,b),148.50,.005)
y=math.sin(math.radians(b[1]-a[1]))*math.cos(math.radians(b[0]));x=math.cos(math.radians(a[0]))*math.sin(math.radians(b[0]))-math.sin(math.radians(a[0]))*math.cos(math.radians(b[0]))*math.cos(math.radians(b[1]-a[1]))
chk('GC','brg',(math.degrees(math.atan2(y,x))+360)%360,261.6,.05)
# rhumb
dpsi=math.log(math.tan(math.pi/4+math.radians(b[0])/2)/math.tan(math.pi/4+math.radians(a[0])/2));dphi=math.radians(b[0]-a[0]);q=dphi/dpsi;dl=math.radians(b[1]-a[1])
chk('Rhumb','NM',math.hypot(dphi,q*dl)*3440.065,148.53,.005); chk('Rhumb','brg',(math.degrees(math.atan2(dl,dpsi))+360)%360,259.5,.05)
chk('ETA','SOG',8.5,8.50,.005); chk('ETA','h',120/8.5,14+7/60,1/60)
# wind component: course 90, from 230, 20 kn: rel=140 -> head = 20cos140 = -15.3 (tailwind), cross 20 sin140 = 12.9 from starboard
chk('WindComp','tail',abs(20*math.cos(math.radians(140))),15.3,.05); chk('WindComp','cross',20*math.sin(math.radians(140)),12.9,.05)
x_=8*math.sin(math.radians(90))+1.2*math.sin(math.radians(30));y_=8*math.cos(math.radians(90))+1.2*math.cos(math.radians(30))
chk('SetDrift','SOG',math.hypot(x_,y_),8.66,.005); chk('SetDrift','COG',math.degrees(math.atan2(x_,y_)),83.1,.05)
# true wind: apparent from 30 deg rel on course 90 -> from 120T, 20 kn. ship vector 8 kn toward 090.
af=math.radians(120);ax,ay=-20*math.sin(af),-20*math.cos(af)  # apparent wind velocity (towards)
tx,ty=ax+8,ay+0  # true = apparent + ship velocity
chk('TrueWind','kn',math.hypot(tx,ty),13.7,.05); chk('TrueWind','from',(math.degrees(math.atan2(-tx,-ty))+360)%360,137,.5)
for s_,h,day,f in [(6,20,1.69,1.41),(8,15,4.00,2.50),(10,12,7.81,3.91)]:
    dd=4*(s_/8)**3; chk('Scenario',f'rate@{s_}',dd,day,.005); chk('Scenario',f'fuel@{s_}',dd*(120/s_)/24,f,.005)
bad=[o for o in out if not o[4]]
for o in out: print(('PASS' if o[4] else 'FAIL'),o[0],o[1],round(o[2],4),o[3])
print(len(out),'checks',len(bad),'fail')
