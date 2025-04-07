@echo off
REM UniAuto MCP Server - Claude Desktop Configuration Fix
REM This batch file fixes Claude Desktop MCP configuration issues

echo.
echo === UniAuto MCP Server - Claude Desktop Configuration Fix ===
echo.
echo This will fix Claude Desktop configuration to ensure it recognizes the UniAuto MCP server.
echo.

REM Get directory of this batch file and go up one level to project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

REM Fix script path
set "FIX_SCRIPT=%SCRIPT_DIR%fix-claude-desktop.js"

REM Check if the fix script exists
if not exist "%FIX_SCRIPT%" (
    echo ERROR: Could not find fix script at:
    echo %FIX_SCRIPT%
    echo.
    echo Please make sure the file exists.
    goto :END
)

echo Running Claude Desktop configuration fix...
echo.

REM Run the fix script
node "%FIX_SCRIPT%"

echo.
if %ERRORLEVEL% NEQ 0 (
    echo Fix script encountered an error.
    echo Please check the output above for details.
) else (
    echo Configuration fix completed.
    echo.
    echo IMPORTANT: If Claude Desktop is running, please restart it for changes to take effect.
)

:END
echo.
echo Press any key to exit...
pause > nul
