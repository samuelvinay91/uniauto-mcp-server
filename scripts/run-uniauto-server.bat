@echo off
REM UniAuto MCP Server Launcher
REM This batch file runs the main server for Claude Desktop integration

echo.
echo === UniAuto MCP Server - Main Server Launcher ===
echo.
echo This will run the complete MCP server for Claude Desktop integration.
echo.

REM Get directory of this batch file and go up one level to project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

REM Server script path
set "SERVER_SCRIPT=%PROJECT_ROOT%\src\index.js"

REM Check if the server script exists
if not exist "%SERVER_SCRIPT%" (
    echo ERROR: Could not find server script at:
    echo %SERVER_SCRIPT%
    echo.
    echo Please make sure the file exists.
    goto :END
)

echo Starting UniAuto MCP server in MCP mode...
echo.
echo The server will keep running in this window. 
echo Press Ctrl+C to stop the server when finished.
echo.

REM Set environment variables for proper MCP communication
set "MCP_ENABLED=true"
set "LOG_TO_STDERR=true"

REM Run the main server with MCP flag
node "%SERVER_SCRIPT%" --mcp-server

:END
echo.
echo Press any key to exit...
pause > nul
