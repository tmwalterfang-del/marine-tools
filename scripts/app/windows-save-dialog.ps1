param([Parameter(Mandatory=$true)][string]$Destination)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$root=[System.Windows.Automation.AutomationElement]::RootElement
$condition=New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty,'Save Marine Tools export')
$dialog=$null
for($i=0;$i -lt 30;$i++) {
 $dialog=$root.FindFirst([System.Windows.Automation.TreeScope]::Descendants,$condition)
 if($dialog){break}
 Start-Sleep -Milliseconds 500
}
if(!$dialog){throw 'Native Save As dialog did not appear'}
$editCondition=New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty,[System.Windows.Automation.ControlType]::Edit)
$edit=$null
for($i=0;$i -lt 30 -and !$edit;$i++) {
 $edits=$dialog.FindAll([System.Windows.Automation.TreeScope]::Descendants,$editCondition)
 foreach($item in $edits){if($item.Current.AutomationId -eq '1001' -or $item.Current.Name -match 'File name'){$edit=$item;break}}
 if(!$edit){Start-Sleep -Milliseconds 500}
}
if($edit) {
 $value=$edit.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
 $value.SetValue($Destination)
 $buttonCondition=New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty,'Save')
 $button=$dialog.FindFirst([System.Windows.Automation.TreeScope]::Descendants,$buttonCondition)
 if($button){$button.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke();return}
}
# The modern shell can withhold edit controls from UIA while loading. Its
# documented English filename keyboard accelerator still exercises the OS dialog.
Add-Type -AssemblyName System.Windows.Forms
$shell=New-Object -ComObject WScript.Shell
if(!$shell.AppActivate('Save Marine Tools export')){throw 'Could not activate native Save As dialog'}
[System.Windows.Forms.SendKeys]::SendWait('%n')
Start-Sleep -Milliseconds 500
[System.Windows.Forms.SendKeys]::SendWait('^a')
$keys=[regex]::Replace($Destination,'([+^%~(){}\[\]])','{$1}')
[System.Windows.Forms.SendKeys]::SendWait($keys)
[System.Windows.Forms.SendKeys]::SendWait('{ENTER}')
