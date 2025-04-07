@echo off
REM UniAuto MCP Server - Claude Desktop Setup Launcher
REM This batch file provides an easy way to set up Claude Desktop with UniAuto

echo.
echo === UniAuto MCP Server - Claude Desktop Setup ===
echo.
echo This will configure Claude Desktop to use the UniAuto MCP server.
echo.

REM Try to run the Node.js setup script first
echo Running Node.js setup script...
echo.

REM Get directory of this batch file and go up one level to project root
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."
cd /d "%PROJECT_ROOT%"

REM Executable script path
set "NODE_SCRIPT=%SCRIPT_DIR%setup-claude-desktop.js"

REM Run the Node.js script if it exists
if exist "%NODE_SCRIPT%" (
    node "%NODE_SCRIPT%"
    if errorlevel 1 (
        echo.
        echo Node.js script encountered an error. Trying PowerShell setup...
        echo.
        goto TRY_POWERSHELL
    ) else (
        goto SCRIPT_SUCCESS
    )
) else (
    echo ERROR: Could not find setup script at:
    echo %NODE_SCRIPT%
    echo.
    goto TRY_POWERSHELL
)

:TRY_POWERSHELL
echo Attempting alternative setup method with PowerShell...
echo.

set "PS_SCRIPT=%SCRIPT_DIR%setup-claude-desktop.ps1"

REM Check if the PowerShell script exists
if exist "%PS_SCRIPT%" (
    powershell -ExecutionPolicy Bypass -File "%PS_SCRIPT%"
    if errorlevel 1 (
        echo.
        echo PowerShell setup encountered an error.
        echo.
        goto SCRIPT_FAILURE
    ) else (
        goto SCRIPT_SUCCESS
    )
) else (
    echo ERROR: Could not find PowerShell script at:
    echo %PS_SCRIPT%
    echo.
    goto SCRIPT_FAILURE
)

:SCRIPT_SUCCESS
echo.
echo Setup completed successfully!
echo.
echo You can now:
echo 1. Start the UniAuto MCP server with 'npm start'
echo 2. Open Claude Desktop and try the example prompts
echo 3. Test the connection with 'node scripts/test-claude-desktop.js'
echo.
goto END

:SCRIPT_FAILURE
echo.
echo Setup failed. Please try manual setup:
echo 1. Edit the .env file to include your Claude API key
echo 2. Edit %APPDATA%\Claude\claude_desktop_config.json to add the MCP server
echo 3. See docs/claude-desktop-mcp-setup.md for detailed instructions
echo.

:END
echo Press any key to exit...
pause > nul
