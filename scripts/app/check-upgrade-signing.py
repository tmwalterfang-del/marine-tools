"""Compare only public test certificates. No production signing or key export."""
import hashlib
import json
import os
import pathlib
import re
import subprocess

out = pathlib.Path('app-artifacts/android')
current = pathlib.Path('apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk')
baseline = out / 'upgrade-base.apk'
tool = pathlib.Path(os.environ['ANDROID_HOME']) / 'build-tools/36.0.0/apksigner'


def inspect(apk):
    text = subprocess.check_output([str(tool), 'verify', '--print-certs', str(apk)], text=True)
    certificates = re.findall(r'Signer #\d+ certificate SHA-256 digest: ([a-fA-F0-9]+)', text)
    assert certificates, 'No verified APK signing certificate'
    return {'sha256': hashlib.sha256(apk.read_bytes()).hexdigest(), 'certificatesSha256': certificates}


old, new = inspect(baseline), inspect(current)
assert old['certificatesSha256'] == new['certificatesSha256'], 'Upgrade test APKs have different signers'
(out / 'upgrade-signing.json').write_text(json.dumps({
    'status': 'PASS', 'baselineSource': '3c68ecda1908ec3d9e96228f0b9a813916a43ad9',
    'baselineBuildNumber': 4, 'candidateBuildNumber': 5, 'baseline': old, 'candidate': new,
    'signing': 'EPHEMERAL_CI_DEBUG_KEY_ONLY', 'productionKeyVerified': False,
    'originalDownloadedBuild4UpgradeGuaranteed': False,
}, indent=2))
print(json.dumps({'status': 'PASS', 'sameDebugCertificate': True, 'productionKeyVerified': False}))
