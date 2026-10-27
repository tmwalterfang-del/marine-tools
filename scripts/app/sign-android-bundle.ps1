param(
  [Parameter(Mandatory=$true)][string]$InputBundle,
  [Parameter(Mandatory=$true)][string]$OutputBundle,
  [Parameter(Mandatory=$true)][string]$KeyStore,
  [Parameter(Mandatory=$true)][string]$ProtectedPassword,
  [Parameter(Mandatory=$true)][string]$JavaBin,
  [string]$KeyAlias='marine-tools-upload'
)
$ErrorActionPreference='Stop'
$taskInput=(Resolve-Path -LiteralPath $InputBundle).Path
$taskOutput=[System.IO.Path]::GetFullPath($OutputBundle)
if($taskInput -eq $taskOutput){throw 'Keep the unsigned input separate from the signed output'}
if(Test-Path -LiteralPath $taskOutput){throw 'Signed output already exists; choose a new output path'}
if([System.IO.Path]::GetExtension($taskInput) -ne '.aab' -or [System.IO.Path]::GetExtension($taskOutput) -ne '.aab'){throw 'Android App Bundle .aab paths required'}
$taskJarSigner=Join-Path $JavaBin 'jarsigner.exe'
if(!(Test-Path -LiteralPath $taskJarSigner)){throw 'Java jarsigner.exe not found'}
$taskKeyStore=(Resolve-Path -LiteralPath $KeyStore).Path
$taskPasswordFile=(Resolve-Path -LiteralPath $ProtectedPassword).Path
Add-Type -AssemblyName System.Security
$taskPasswordBytes=[System.Security.Cryptography.ProtectedData]::Unprotect([System.IO.File]::ReadAllBytes($taskPasswordFile),$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser)
try {
  $env:MT_ANDROID_SIGNING_PASSWORD=[System.Text.Encoding]::UTF8.GetString($taskPasswordBytes)
  & $taskJarSigner -keystore $taskKeyStore -storetype PKCS12 -storepass:env MT_ANDROID_SIGNING_PASSWORD -keypass:env MT_ANDROID_SIGNING_PASSWORD -sigalg SHA256withRSA -digestalg SHA-256 -signedjar $taskOutput $taskInput $KeyAlias
  if($LASTEXITCODE -ne 0){throw 'AAB signing failed'}
} finally {
  Remove-Item Env:MT_ANDROID_SIGNING_PASSWORD -ErrorAction SilentlyContinue
  [Array]::Clear($taskPasswordBytes,0,$taskPasswordBytes.Length)
}
& $taskJarSigner -verify $taskOutput
if($LASTEXITCODE -ne 0){throw 'Signed AAB verification failed'}
Get-FileHash -LiteralPath $taskOutput -Algorithm SHA256
