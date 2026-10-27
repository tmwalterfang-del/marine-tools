$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '../..')).Path
$config = Get-Content (Join-Path $root 'apps/app-config.json') -Raw | ConvertFrom-Json
$out = Join-Path $root 'app-artifacts/windows'
$stage = Join-Path $out 'package'
if (Test-Path $stage) { Remove-Item -Recurse -Force $stage }
New-Item -ItemType Directory -Force $stage | Out-Null
$binary = Join-Path $root 'apps/desktop/src-tauri/target/release/marine-tools-preview.exe'
if (!(Test-Path $binary)) { throw 'Build the desktop executable first.' }
Copy-Item $binary (Join-Path $stage 'MarineTools.exe') -Force
Get-ChildItem (Split-Path $binary) -Filter '*.dll' | Copy-Item -Destination $stage -Force
$assets = Join-Path $stage 'Assets'
New-Item -ItemType Directory -Force $assets | Out-Null
$icons = Join-Path $root 'apps/desktop/src-tauri/icons'
Copy-Item (Join-Path $icons 'Square44x44Logo.png') (Join-Path $assets 'Square44x44Logo.png') -Force
Copy-Item (Join-Path $icons 'Square150x150Logo.png') (Join-Path $assets 'Square150x150Logo.png') -Force
Copy-Item (Join-Path $icons 'StoreLogo.png') (Join-Path $assets 'StoreLogo.png') -Force
$identity = $config.windows.identity
$publisher = $config.windows.publisher
if ($env:MT_WINDOWS_STORE_IDENTITY) {
 if ($env:MT_WINDOWS_IDENTITY_CONFIRMED -ne 'true') { throw 'Store identity requires explicit console confirmation.' }
 $identity = $env:MT_WINDOWS_STORE_IDENTITY
 $publisher = $env:MT_WINDOWS_STORE_PUBLISHER
 if (!$publisher) { throw 'Partner Center publisher identity is required.' }
}
$identityXml = [System.Security.SecurityElement]::Escape($identity)
$publisherXml = [System.Security.SecurityElement]::Escape($publisher)
$version = "$($config.version).0"
$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10" xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10" xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities" IgnorableNamespaces="uap rescap">
 <Identity Name="$identityXml" Publisher="$publisherXml" Version="$version" ProcessorArchitecture="x64"/>
 <Properties><DisplayName>Marine Tools Preview</DisplayName><PublisherDisplayName>Walterfang Design</PublisherDisplayName><Logo>Assets\StoreLogo.png</Logo></Properties>
 <Dependencies><TargetDeviceFamily Name="Windows.Desktop" MinVersion="$($config.windows.minimumVersion)" MaxVersionTested="10.0.26100.0"/></Dependencies>
 <Resources><Resource Language="en-us"/></Resources>
 <Applications><Application Id="MarineTools" Executable="MarineTools.exe" EntryPoint="Windows.FullTrustApplication"><uap:VisualElements DisplayName="Marine Tools Preview" Description="Local maritime calculators" BackgroundColor="#061C2F" Square150x150Logo="Assets\Square150x150Logo.png" Square44x44Logo="Assets\Square44x44Logo.png"/></Application></Applications>
 <Capabilities><rescap:Capability Name="runFullTrust"/></Capabilities>
</Package>
"@
$manifest | Set-Content (Join-Path $stage 'AppxManifest.xml') -Encoding utf8
$sdkPath = Join-Path ([Environment]::GetFolderPath('ProgramFilesX86')) 'Windows Kits/10/bin/*/x64/makeappx.exe'
$makeappx = Get-ChildItem $sdkPath | Sort-Object FullName -Descending | Select-Object -First 1
if (!$makeappx) { throw 'Windows SDK MakeAppx.exe is required.' }
$package = Join-Path $out "MarineToolsPreview_$($config.version)_x64_unsigned.msix"
& $makeappx.FullName pack /d $stage /p $package /o
if ($LASTEXITCODE -ne 0) { throw "MakeAppx failed: $LASTEXITCODE" }
@{version=$config.version;package=(Split-Path $package -Leaf);signed=$false;storeIdentityVerified=($env:MT_WINDOWS_IDENTITY_CONFIRMED -eq 'true');webView2Runtime='Required; use installed Evergreen runtime';installation='UNVERIFIED until signed and installed on target Windows device'} | ConvertTo-Json | Set-Content (Join-Path $out 'package-status.json')
Write-Host "Created unsigned MSIX: $package"
