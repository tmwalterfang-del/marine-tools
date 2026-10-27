param([int]$Width=0,[int]$Height=0,[string]$OutputFile)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type @'
using System;
using System.Runtime.InteropServices;
public class MarineWindowBounds {
 [StructLayout(LayoutKind.Sequential)] public struct RECT { public int Left, Top, Right, Bottom; }
 [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
 [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr h,int x,int y,int w,int t,bool repaint);
}
'@
$app=Get-Process 'marine-tools-preview' | Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } | Select-Object -First 1
if (!$app) { throw 'Visible app window not found' }
$handle=$app.MainWindowHandle
$work=[System.Windows.Forms.Screen]::FromHandle($handle).WorkingArea
if ($Width -gt 0 -and $Height -gt 0) {
 $w=[Math]::Min($Width,$work.Width-24);$h=[Math]::Min($Height,$work.Height-24)
 if (![MarineWindowBounds]::MoveWindow($handle,$work.Left+12,$work.Top+12,$w,$h,$true)) { throw 'Native window resize failed' }
 Start-Sleep -Milliseconds 300
}
$rect=New-Object MarineWindowBounds+RECT
if (![MarineWindowBounds]::GetWindowRect($handle,[ref]$rect)) { throw 'Native window bounds unavailable' }
if ($rect.Left -lt $work.Left-1 -or $rect.Top -lt $work.Top-1 -or $rect.Right -gt $work.Right+1 -or $rect.Bottom -gt $work.Bottom+1) {
 throw "App window outside working area: $($rect.Left),$($rect.Top),$($rect.Right),$($rect.Bottom) / $work"
}
$result=@{window=@{left=$rect.Left;top=$rect.Top;right=$rect.Right;bottom=$rect.Bottom};workArea=@{left=$work.Left;top=$work.Top;right=$work.Right;bottom=$work.Bottom};coordinateContext='Both Win32 and Forms queried from the same PowerShell process; not a physical-DPI acceptance claim'}
$json=$result | ConvertTo-Json -Depth 4
if ($OutputFile) { $json | Set-Content $OutputFile }
Write-Output $json
