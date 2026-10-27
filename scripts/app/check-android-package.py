import pathlib,zipfile,json,xml.etree.ElementTree as ET,subprocess,os
config=json.loads(pathlib.Path('apps/app-config.json').read_text())
root=pathlib.Path('apps/mobile/android/app/build');out=pathlib.Path('app-artifacts/android');out.mkdir(parents=True,exist_ok=True)
reports=[]
for p in sorted(root.glob('outputs/**/*')):
 if p.suffix not in ('.apk','.aab'):continue
 with zipfile.ZipFile(p) as z:
  names=z.namelist();prefix='base/assets/public/' if p.suffix=='.aab' else 'assets/public/'
  assert not any(n.startswith(prefix+x+'/') for n in names for x in ['students','worker','tests','.git']),str(p)
  info=json.loads(z.read(prefix+'build-info.json'))
  assert info['version']==config['version'] and info['targets']==config['distributionTargets'] and not info['productionApiEnabled'] and not info['analyticsEnabled'] and not info['educationBundled']
  assert info['buildNumber']==config['buildNumber']
  preview=z.read(prefix+'app-preview.js').decode()
  packaged_config=json.loads(preview.split('window.MT_APP_CONFIG=',1)[1].split(';\n',1)[0])
  assert packaged_config==config,'Packaged configuration differs from reviewed configuration'
  assert z.read(prefix+'privacy-policy.js')==pathlib.Path('privacy-policy.js').read_bytes(),'Policy bytes differ from reviewed source'
  assert z.read(prefix+'app-privacy.html')==pathlib.Path('apps/store/privacy-draft.html').read_bytes()
  assert "const API='https://offline-app.invalid'" in z.read(prefix+'app.js').decode()
  assert 'native-platform.js' in z.read(prefix+'index.html').decode()
  reports.append({'file':str(p),'version':info['version'],'buildNumber':info['buildNumber'],'sourceCommit':info.get('sourceCommit'),'policyMatchesReviewedBytes':True,'protectedEducationIncluded':False,'packagedNativeLibraries':[n for n in names if n.endswith('.so')],'sha256':__import__('hashlib').sha256(p.read_bytes()).hexdigest()})
ns='{http://schemas.android.com/apk/res/android}'
manifests=[]
for p in root.glob('intermediates/merged_manifests/**/AndroidManifest.xml'):
 tree=ET.parse(p).getroot();app=tree.find('application');sdk=tree.find('uses-sdk')
 assert tree.attrib.get('package')==config.get('appId',config['previewId'])
 assert tree.attrib.get(ns+'versionCode')==str(config['buildNumber']) and tree.attrib.get(ns+'versionName')==config['version']
 assert app.attrib.get(ns+'allowBackup')=='false' and app.attrib.get(ns+'usesCleartextTraffic')=='false'
 assert sdk.attrib.get(ns+'targetSdkVersion')==str(config['android']['targetSdk']) and sdk.attrib.get(ns+'minSdkVersion')==str(config['android']['minSdk'])
 permissions=[n.attrib[ns+'name'] for n in tree.findall('uses-permission')]
 internal=config['previewId']+'.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'
 declarations={n.attrib[ns+'name']:n.attrib.get(ns+'protectionLevel') for n in tree.findall('permission')}
 if internal in permissions:assert declarations.get(internal)=='signature',declarations
 assert set(permissions)<=set(['android.permission.INTERNET','android.permission.ACCESS_NETWORK_STATE',internal]),permissions
 manifests.append({'file':str(p),'permissions':permissions,'targetSdk':config['android']['targetSdk'],'minSdk':config['android']['minSdk'],'allowBackup':False,'cleartext':False})
assert reports and manifests,'No built packages or merged manifests inspected'
(out/'package-inspection.json').write_text(json.dumps({'packages':reports,'mergedManifests':manifests,'physicalDeviceTest':'UNVERIFIED'},indent=2))
print(json.dumps({'packages':len(reports),'mergedManifests':len(manifests),'status':'PASS'}))
