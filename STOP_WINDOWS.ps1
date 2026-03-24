$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$PidFile = Join-Path $RepoRoot ".student-assistant-hub-dev.pid"
$LogFile = Join-Path $RepoRoot ".student-assistant-hub-dev.log"
$ErrorLogFile = Join-Path $RepoRoot ".student-assistant-hub-dev.err.log"

function Stop-ProcessTree([int]$ProcessId) {
  $ChildProcesses = Get-CimInstance Win32_Process -Filter "ParentProcessId = $ProcessId" -ErrorAction SilentlyContinue

  foreach ($ChildProcess in $ChildProcesses) {
    Stop-ProcessTree -ProcessId $ChildProcess.ProcessId
  }

  try {
    Stop-Process -Id $ProcessId -Force -ErrorAction Stop
    Write-Host "Stopped Student Assistant Hub dev server process $ProcessId."
  }
  catch {
    Write-Host "Could not stop process $ProcessId. It may already be closed."
  }
}

if (-not (Test-Path $PidFile)) {
  Write-Host "No saved Student Assistant Hub dev-server PID was found."
  exit 0
}

$RawPid = Get-Content $PidFile -ErrorAction Stop | Select-Object -First 1
[int]$Pid = $RawPid

Stop-ProcessTree -ProcessId $Pid

Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
Remove-Item $LogFile -Force -ErrorAction SilentlyContinue
Remove-Item $ErrorLogFile -Force -ErrorAction SilentlyContinue
