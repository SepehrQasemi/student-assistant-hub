$ErrorActionPreference = "Stop"

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = 3000
$Url = "http://127.0.0.1:$Port"
$PidFile = Join-Path $RepoRoot ".student-assistant-hub-dev.pid"
$LogFile = Join-Path $RepoRoot ".student-assistant-hub-dev.log"
$ErrorLogFile = Join-Path $RepoRoot ".student-assistant-hub-dev.err.log"

function Write-Step([string]$Message) {
  Write-Host "[Student Assistant Hub] $Message"
}

function Test-CommandAvailable([string]$Name) {
  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Test-ServerResponsive([string]$TargetUrl) {
  try {
    Invoke-WebRequest -Uri $TargetUrl -UseBasicParsing -TimeoutSec 2 | Out-Null
    return $true
  }
  catch {
    return $false
  }
}

function Get-PortListener([int]$TargetPort) {
  return Get-NetTCPConnection -LocalPort $TargetPort -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
}

function Wait-ForServer([string]$TargetUrl, [int]$Attempts = 30) {
  for ($Attempt = 0; $Attempt -lt $Attempts; $Attempt += 1) {
    if (Test-ServerResponsive $TargetUrl) {
      return $true
    }

    Start-Sleep -Seconds 1
  }

  return $false
}

if (-not (Test-CommandAvailable "node")) {
  Write-Host "Node.js was not found. Install Node.js 20 or newer, then run this script again." -ForegroundColor Red
  exit 1
}

if (-not (Test-CommandAvailable "npm")) {
  Write-Host "npm was not found. Ensure Node.js and npm are installed correctly, then run this script again." -ForegroundColor Red
  exit 1
}

$Listener = Get-PortListener $Port
if ($Listener) {
  if (Test-ServerResponsive $Url) {
    Write-Step "Port $Port is already serving Student Assistant Hub. Opening the app."
    Start-Process $Url | Out-Null
    exit 0
  }

  Write-Host "Port $Port is already in use by another process. Stop that process or change the port before starting the app." -ForegroundColor Red
  exit 1
}

$NodeModulesPath = Join-Path $RepoRoot "node_modules"
if (-not (Test-Path $NodeModulesPath)) {
  Write-Step "Installing dependencies with npm install..."
  Push-Location $RepoRoot
  try {
    npm install
    if ($LASTEXITCODE -ne 0) {
      throw "npm install failed."
    }
  }
  finally {
    Pop-Location
  }
}

if (Test-Path $PidFile) {
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}

if (Test-Path $LogFile) {
  Remove-Item $LogFile -Force -ErrorAction SilentlyContinue
}

if (Test-Path $ErrorLogFile) {
  Remove-Item $ErrorLogFile -Force -ErrorAction SilentlyContinue
}

Write-Step "Starting the development server on $Url..."
$Process = Start-Process `
  -FilePath "node" `
  -ArgumentList "node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "$Port" `
  -WorkingDirectory $RepoRoot `
  -PassThru `
  -RedirectStandardOutput $LogFile `
  -RedirectStandardError $ErrorLogFile
Set-Content -Path $PidFile -Value $Process.Id -Encoding ascii

if (Wait-ForServer $Url) {
  Write-Step "Opening Student Assistant Hub in the browser."
  Start-Process $Url | Out-Null
  Write-Step "Server started. Logs: $LogFile"
  Write-Step "Stop it later with STOP_WINDOWS.ps1 if needed."
  exit 0
}

Write-Host "The development server process started but did not respond on $Url in time. Check $LogFile and $ErrorLogFile for errors." -ForegroundColor Yellow
exit 1
