@echo off
REM UniAuto MCP Server Minimal Server Launcher
REM This batch file runs the minimal server for Claude Desktop testing

echo.
echo === UniAuto MCP Server - Minimal Server Launcher ===
echo.
echo This will run the simplified MCP server for Claude Desktop testing.
echo.

REM Get directory of this batch file and go up one level to project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

REM Server script path
set "SERVER_SCRIPT=%PROJECT_ROOT%\src\minimal-server.js"

REM Check if the server script exists
if not exist "%SERVER_SCRIPT%" (
    echo ERROR: Could not find minimal server script at:
    echo %SERVER_SCRIPT%
    echo.
    echo Please make sure the file exists.
    goto :END
)

echo Starting minimal MCP server...
echo.
echo The server will keep running in this window. 
echo Press Ctrl+C to stop the server when finished.
echo.

REM Run the minimal server
node "%SERVER_SCRIPT%"

:END
echo.
echo Press any key to exit...
pause > nul
