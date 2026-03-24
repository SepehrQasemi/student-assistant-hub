@echo off
setlocal
set SCRIPT_DIR=%~dp0

powershell -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%RUN_ME_WINDOWS.ps1"
set EXIT_CODE=%ERRORLEVEL%

if not "%EXIT_CODE%"=="0" (
  echo.
  echo Student Assistant Hub could not be started. See the PowerShell output above.
)

exit /b %EXIT_CODE%
