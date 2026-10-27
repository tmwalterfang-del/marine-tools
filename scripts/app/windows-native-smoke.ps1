param([string]$RuntimeExecutable)
$ErrorActionPreference='Stop'
$root=(Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$out=Join-Path $root 'app-artifacts/windows'
New-Item -ItemType Directory -Force $out | Out-Null
$installer=Get-ChildItem (Join-Path $root 'apps/desktop/src-tauri/target/release/bundle/nsis/*.exe') | Select-Object -First 1
$target=Join-Path $env:RUNNER_TEMP 'MarineToolsNativeSmoke'
if (!$installer) { throw 'NSIS candidate missing' }
if (!$RuntimeExecutable) { $RuntimeExecutable=Join-Path $root 'apps/desktop/src-tauri/target/release/marine-tools-preview.exe' }
$app=$null
$shipping=$null
try {
 $env:WEBVIEW2_USER_DATA_FOLDER=Join-Path $env:RUNNER_TEMP 'MarineToolsShippingSmoke'
 $install=Start-Process $installer.FullName -ArgumentList @('/S',"/D=$target") -PassThru
 if (!$install.WaitForExit(180000)) { $install.Kill();throw 'Installer timed out' }
 if ($install.ExitCode -ne 0) { throw "Installer failed: $($install.ExitCode)" }
 $exe=Join-Path $target 'marine-tools-preview.exe'
 if (!(Test-Path $exe)) { throw 'Installed executable not found' }
 Get-Process 'marine-tools-preview' -ErrorAction SilentlyContinue | Stop-Process -Force
 $shipping=Start-Process $exe -PassThru
 if (!$shipping.WaitForInputIdle(30000) -or $shipping.HasExited) { throw 'Installed release window failed to initialize' }
 $shipping.Kill();$shipping.WaitForExit()
 # Instrumented binary is separate from the already packaged shipping executable.
 $env:WEBVIEW2_USER_DATA_FOLDER=Join-Path $env:RUNNER_TEMP 'MarineToolsWebViewSmoke'
 $app=Start-Process $RuntimeExecutable -PassThru
 Start-Sleep -Seconds 2
 Get-CimInstance Win32_Process | Where-Object { $_.Name -match 'marine-tools|msedgewebview2' } | Select-Object Name,ProcessId,CommandLine | ConvertTo-Json | Set-Content (Join-Path $out 'runtime-processes.json')
 node (Join-Path $PSScriptRoot 'windows-webview-smoke.cjs')
 if ($LASTEXITCODE -ne 0) { throw 'Native WebView/clipboard/save acceptance failed' }
 if (!$app.HasExited) { $app.Kill();$app.WaitForExit() }
 $uninstaller=Get-ChildItem $target -Filter '*uninstall*.exe' | Select-Object -First 1
 if (!$uninstaller) { throw 'Uninstaller missing' }
 $uninstall=Start-Process $uninstaller.FullName -ArgumentList '/S' -PassThru
 if (!$uninstall.WaitForExit(120000)) { $uninstall.Kill();throw 'Uninstall timed out' }
 if ($uninstall.ExitCode -ne 0) { throw "Uninstall failed: $($uninstall.ExitCode)" }
 for ($i=0; $i -lt 30 -and (Test-Path $exe); $i++) { Start-Sleep -Seconds 1 }
 if (Test-Path $exe) { throw 'Executable remained after uninstall' }
 @{version='0.2.0';nsisInstall='PASS';nsisWindow='PASS';nsisUninstall='PASS';nativeInteractions='Separate CI browser-arguments overlay; see ci-instrumentation.json';runtime='GitHub Windows runner, not physical Windows 10/11';msixInstall='UNVERIFIED: unsigned package'} | ConvertTo-Json | Set-Content (Join-Path $out 'install-results.json')
} finally {
 if ($app -and !$app.HasExited) { $app.Kill() }
 if ($shipping -and !$shipping.HasExited) { $shipping.Kill() }
 Remove-Item Env:WEBVIEW2_USER_DATA_FOLDER -ErrorAction SilentlyContinue
}
