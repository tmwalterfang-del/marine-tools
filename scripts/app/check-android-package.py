import pathlib,zipfile,json,xml.etree.ElementTree as ET,subprocess,os
root=pathlib.Path('apps/mobile/android/app/build');out=pathlib.Path('app-artifacts/android');out.mkdir(parents=True,exist_ok=True)
reports=[]
for p in sorted(root.glob('outputs/**/*')):
 if p.suffix not in ('.apk','.aab'):continue
 with zipfile.ZipFile(p) as z:
  names=z.namelist();prefix='base/assets/public/' if p.suffix=='.aab' else 'assets/public/'
  assert not any(n.startswith(prefix+x+'/') for n in names for x in ['students','worker','tests','.git']),str(p)
  info=json.loads(z.read(prefix+'build-info.json'))
  assert info['version']=='0.2.0' and not info['productionApiEnabled'] and not info['analyticsEnabled'] and not info['educationBundled']
  assert "const API='https://offline-app.invalid'" in z.read(prefix+'app.js').decode()
  assert 'native-platform.js' in z.read(prefix+'index.html').decode()
  reports.append({'file':str(p),'version':info['version'],'sourceCommit':info.get('sourceCommit'),'protectedEducationIncluded':False,'packagedNativeLibraries':[n for n in names if n.endswith('.so')],'sha256':__import__('hashlib').sha256(p.read_bytes()).hexdigest()})
ns='{http://schemas.android.com/apk/res/android}'
manifests=[]
for p in root.glob('intermediates/merged_manifests/**/AndroidManifest.xml'):
 tree=ET.parse(p).getroot();app=tree.find('application');sdk=tree.find('uses-sdk')
 assert tree.attrib.get('package')=='app.marinetools.preview'
 assert app.attrib.get(ns+'allowBackup')=='false' and app.attrib.get(ns+'usesCleartextTraffic')=='false'
 assert sdk.attrib.get(ns+'targetSdkVersion')=='36' and sdk.attrib.get(ns+'minSdkVersion')=='24'
 permissions=[n.attrib[ns+'name'] for n in tree.findall('uses-permission')]
 internal='app.marinetools.preview.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'
 declarations={n.attrib[ns+'name']:n.attrib.get(ns+'protectionLevel') for n in tree.findall('permission')}
 if internal in permissions:assert declarations.get(internal)=='signature',declarations
 assert set(permissions)<=set(['android.permission.INTERNET','android.permission.ACCESS_NETWORK_STATE',internal]),permissions
 manifests.append({'file':str(p),'permissions':permissions,'targetSdk':36,'minSdk':24,'allowBackup':False,'cleartext':False})
assert reports and manifests,'No built packages or merged manifests inspected'
(out/'package-inspection.json').write_text(json.dumps({'packages':reports,'mergedManifests':manifests,'physicalDeviceTest':'UNVERIFIED'},indent=2))
print(json.dumps({'packages':len(reports),'mergedManifests':len(manifests),'status':'PASS'}))
