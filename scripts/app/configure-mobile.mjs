import fs from 'node:fs';
import path from 'node:path';
import plist from 'plist';
import xcode from 'xcode';
const root=path.resolve(import.meta.dirname,'../..'),config=JSON.parse(fs.readFileSync(path.join(root,'apps/app-config.json')));
export function configureMobile(platform){
 const base=path.join(root,'apps/mobile',platform);
 if(platform==='android'){
  const manifest=path.join(base,'app/src/main/AndroidManifest.xml');
  let text=fs.readFileSync(manifest,'utf8').replace('android:allowBackup="true"','android:allowBackup="false"');
  if(!text.includes('android:usesCleartextTraffic'))text=text.replace('<application','<application android:usesCleartextTraffic="false"');
  if(!text.includes(config.urlScheme))text=text.replace('</activity>','<intent-filter><action android:name="android.intent.action.VIEW"/><category android:name="android.intent.category.DEFAULT"/><category android:name="android.intent.category.BROWSABLE"/><data android:scheme="'+config.urlScheme+'" android:host="tool"/></intent-filter></activity>');
  fs.writeFileSync(manifest,text);
  const variables=path.join(base,'variables.gradle');fs.writeFileSync(variables,fs.readFileSync(variables,'utf8').replace(/minSdkVersion = \d+/,'minSdkVersion = '+config.android.minSdk).replace(/targetSdkVersion = \d+/,'targetSdkVersion = '+config.android.targetSdk));
  const gradle=path.join(base,'app/build.gradle');text=fs.readFileSync(gradle,'utf8').replace(/versionCode \d+/,'versionCode '+config.buildNumber).replace(/versionName "[^"]+"/,'versionName "'+config.version+'"');
  if(!text.includes('marine-release.gradle'))text+="\napply from: 'marine-release.gradle'\n";
  fs.writeFileSync(gradle,text);fs.copyFileSync(path.join(root,'apps/mobile/config/release.gradle'),path.join(base,'app/marine-release.gradle'));
  fs.writeFileSync(path.join(base,'app/src/main/res/xml/file_paths.xml'),'<?xml version="1.0" encoding="utf-8"?><paths xmlns:android="http://schemas.android.com/apk/res/android"><cache-path name="marine_exports" path="marine-exports/"/></paths>');
  const colors=path.join(base,'app/src/main/res/values/colors.xml');let colorsText=fs.existsSync(colors)?fs.readFileSync(colors,'utf8'):'<?xml version="1.0" encoding="utf-8"?><resources></resources>';
  if(!colorsText.includes('marine_splash'))colorsText=colorsText.replace('</resources>','<color name="marine_splash">#061C2F</color></resources>');fs.writeFileSync(colors,colorsText);
  const styles=path.join(base,'app/src/main/res/values/styles.xml');text=fs.readFileSync(styles,'utf8').replace(/(<item name="windowSplashScreenBackground">)[^<]+/,'$1@color/marine_splash');if(!text.includes('windowSplashScreenBackground'))text=text.replace('<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">','<style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen"><item name="windowSplashScreenBackground">@color/marine_splash</item>');
  fs.writeFileSync(styles,text);
  for(const folder of fs.readdirSync(path.join(base,'app/src/main/res'))){const splash=path.join(base,'app/src/main/res',folder,'splash.png');if(fs.existsSync(splash))fs.copyFileSync(path.join(root,'assets/icon-512.png'),splash)}
 }else if(platform==='ios'){
  const app=path.join(base,'App/App'),infoFile=path.join(app,'Info.plist'),info=plist.parse(fs.readFileSync(infoFile,'utf8'));
  info.CFBundleDisplayName=config.name;info.CFBundleShortVersionString=config.version;info.CFBundleVersion=String(config.buildNumber);
  info.CFBundleURLTypes=[{CFBundleURLName:config.previewId,CFBundleURLSchemes:[config.urlScheme]}];info.ITSAppUsesNonExemptEncryption=false;
  fs.writeFileSync(infoFile,plist.build(info));fs.copyFileSync(path.join(root,'apps/mobile/config/PrivacyInfo.xcprivacy'),path.join(app,'PrivacyInfo.xcprivacy'));
  const projectFile=path.join(base,'App/App.xcodeproj/project.pbxproj'),project=xcode.project(projectFile);project.parseSync();
  const group=project.findPBXGroupKey({path:'App'}),target=project.getFirstTarget().uuid;
  if(!project.hasFile('PrivacyInfo.xcprivacy')){if(!project.pbxGroupByName('Resources'))project.addPbxGroup([],'Resources','Resources');project.addResourceFile('PrivacyInfo.xcprivacy',{target},group);}
  let projectText=project.writeSync().replace(/MARKETING_VERSION = [^;]+;/g,'MARKETING_VERSION = '+config.version+';').replace(/CURRENT_PROJECT_VERSION = [^;]+;/g,'CURRENT_PROJECT_VERSION = '+config.buildNumber+';');
  projectText=projectText.replace(/IPHONEOS_DEPLOYMENT_TARGET = [^;]+;/g,'IPHONEOS_DEPLOYMENT_TARGET = '+config.ios.minimumVersion+';').replace(/TARGETED_DEVICE_FAMILY = [^;]+;/g,'TARGETED_DEVICE_FAMILY = \"'+config.ios.family+'\";');
  fs.writeFileSync(projectFile,projectText);
  const sceneFile=path.join(app,'SceneDelegate.swift');let scene=fs.readFileSync(sceneFile,'utf8');if(!scene.includes('MarineNativeSmoke.start')){scene=scene.replace('window?.makeKeyAndVisible()','window?.makeKeyAndVisible()\n#if DEBUG\n        MarineNativeSmoke.start(window?.rootViewController as? CAPBridgeViewController)\n#endif');scene+='\n'+fs.readFileSync(path.join(root,'apps/mobile/config/NativeSmoke.swift'),'utf8');fs.writeFileSync(sceneFile,scene);}
  const splash=path.join(app,'Assets.xcassets/Splash.imageset');for(const name of fs.readdirSync(splash).filter(n=>n.endsWith('.png')))fs.copyFileSync(path.join(root,'assets/icon-512.png'),path.join(splash,name));
 }
}
