import fs from 'node:fs';
const config=JSON.parse(fs.readFileSync('apps/app-config.json'));
const report={version:config.version,channel:config.channel,implemented:true,storeReady:false,submitted:false,published:false,blockers:[
 'Owner developer accounts, legal/trader verification and store identities are not confirmed',
 'Production signing credentials/provisioning and cross-store Android key strategy are not confirmed',
 'Physical Android, Samsung, iPhone, iPad and Windows installation/export/accessibility acceptance is not verified',
 'App-specific public privacy policy and store questionnaires require owner approval',
 'No owner approval exists for store submission or production deployment'
],sourceConstraints:{productionIdentityVerified:config.productionIdentityVerified,windowsStoreIdentityVerified:config.windows.storeIdentityVerified,productionApiEnabled:config.productionApiEnabled,analyticsEnabled:config.analyticsEnabled,educationBundled:false}};
if(config.productionApiEnabled||config.analyticsEnabled)report.blockers.push('Online service variant requires separate authenticated staging/security acceptance');
fs.mkdirSync('app-artifacts',{recursive:true});fs.writeFileSync('app-artifacts/release-readiness.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
if(process.argv.includes('--check-store'))process.exitCode=1;
