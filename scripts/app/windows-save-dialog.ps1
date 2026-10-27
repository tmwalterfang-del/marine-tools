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
$edits=$dialog.FindAll([System.Windows.Automation.TreeScope]::Descendants,$editCondition)
$edit=$null
foreach($item in $edits){if($item.Current.AutomationId -eq '1001' -or $item.Current.Name -match 'File name'){$edit=$item;break}}
if(!$edit){throw 'File-name control unavailable in native dialog'}
$value=$edit.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern)
$value.SetValue($Destination)
$buttonCondition=New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::NameProperty,'Save')
$button=$dialog.FindFirst([System.Windows.Automation.TreeScope]::Descendants,$buttonCondition)
if(!$button){throw 'Save button unavailable'}
$invoke=$button.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern)
$invoke.Invoke()
