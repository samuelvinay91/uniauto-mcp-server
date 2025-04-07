# UniAuto MCP Server - Claude Desktop Setup for Windows
# This script configures Claude Desktop to work with UniAuto MCP Server

# Function to show colored output
function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)][string]$Message,
        [Parameter(Mandatory=$false)][string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

# Display welcome message
Write-ColorOutput "`n=== UniAuto MCP Server - Claude Desktop Setup (Windows) ===`n" "Cyan"
Write-ColorOutput "This script will configure Claude Desktop to use the UniAuto MCP server." "Cyan"

# Get the current directory path
$currentDir = Get-Location

# Define Claude Desktop config path for Windows
$claudeConfigPath = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"

# Check if .env file exists
$envPath = Join-Path $currentDir ".env"
if (-not (Test-Path $envPath)) {
    Write-ColorOutput "Warning: .env file not found. Creating one from .env.sample..." "Yellow"
    
    $envSamplePath = Join-Path $currentDir ".env.sample"
    $envExamplePath = Join-Path $currentDir ".env.example"
    
    if (Test-Path $envSamplePath) {
        Copy-Item $envSamplePath $envPath
    }
    elseif (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
    }
    else {
        Write-ColorOutput "Error: No .env.sample or .env.example file found. Please create a .env file manually." "Red"
        exit 1
    }
}

# Get user input
Write-ColorOutput "`nPlease provide the following information:" "White"
$apiKey = Read-Host "Enter your Claude API key"
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-ColorOutput "API key cannot be empty. Exiting." "Red"
    exit 1
}

$port = Read-Host "Enter the port for UniAuto MCP server (default: 3001)"
if ([string]::IsNullOrWhiteSpace($port)) {
    $port = "3001"
}
if ($port -notmatch '^\d+$') {
    Write-ColorOutput "Port must be a number. Using default: 3001" "Yellow"
    $port = "3001"
}

$model = Read-Host "Enter the Claude model to use (default: claude-3-7-sonnet-20240229)"
if ([string]::IsNullOrWhiteSpace($model)) {
    $model = "claude-3-7-sonnet-20240229"
}

# Update .env file with user input
$envContent = Get-Content $envPath -Raw
$envContent = $envContent -replace "CLAUDE_API_KEY=.*", "CLAUDE_API_KEY=$apiKey"
$envContent = $envContent -replace "CLAUDE_MODEL=.*", "CLAUDE_MODEL=$model"
$envContent = $envContent -replace "PORT=.*", "PORT=$port"
Set-Content -Path $envPath -Value $envContent

Write-ColorOutput "`n.env file updated successfully." "Green"

# Create or update Claude Desktop config
$claudeConfig = @{}
if (Test-Path $claudeConfigPath) {
    try {
        $claudeConfig = Get-Content $claudeConfigPath -Raw | ConvertFrom-Json
        $claudeConfig = $claudeConfig | ConvertTo-PSObject
        Write-ColorOutput "Found existing Claude Desktop configuration." "Green"
    } catch {
        Write-ColorOutput "Error parsing existing Claude Desktop configuration. Creating new configuration." "Yellow"
        $claudeConfig = @{}
    }
} else {
    Write-ColorOutput "Claude Desktop configuration file not found. Creating new configuration." "Yellow"
    # Ensure directory exists
    New-Item -ItemType Directory -Force -Path (Split-Path $claudeConfigPath) | Out-Null
}

# Ensure mcpServers object exists
if (-not $claudeConfig.mcpServers) {
    $claudeConfig | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue @{}
}

# Convert to PowerShell object if needed
if ($claudeConfig.mcpServers -isnot [PSCustomObject]) {
    $mcpServers = New-Object PSObject
    $claudeConfig.mcpServers = $mcpServers
}

# Add or update UniAuto MCP server configuration
$indexJsPath = Join-Path $currentDir "src\index.js"
$indexJsPath = $indexJsPath.Replace("\", "\\")

$uniautoConfig = @{
    command = "node"
    args = @($indexJsPath)
    env = @{
        CLAUDE_API_KEY = $apiKey
        CLAUDE_MODEL = $model
        PORT = $port
        NODE_ENV = "development"
    }
    disabled = $false
    autoApprove = @()
}

# Update the configuration
if (-not $claudeConfig.mcpServers.PSObject.Properties.Name -contains "uniauto") {
    $claudeConfig.mcpServers | Add-Member -NotePropertyName "uniauto" -NotePropertyValue $uniautoConfig
} else {
    $claudeConfig.mcpServers.uniauto = $uniautoConfig
}

# Write updated config to file
$claudeConfig | ConvertTo-Json -Depth 10 | Set-Content -Path $claudeConfigPath

Write-ColorOutput "`nClaude Desktop configuration updated at: $claudeConfigPath" "Green"

Write-ColorOutput "`nSetup complete! You can now:" "Green"
Write-ColorOutput "1. Start the UniAuto MCP server with 'npm start'" "White"
Write-ColorOutput "2. Open Claude Desktop and try the example prompts from the documentation" "White"
Write-ColorOutput "3. Run the test script with 'node scripts/test-claude-desktop.js'" "White"

# Provide guidance for testing
Write-ColorOutput "`nExample prompt for Claude Desktop:" "Cyan"
Write-ColorOutput "Using UniAuto, please navigate to example.com and tell me what the page title is." "White"

# Function to convert PSObject to standard PowerShell object
function ConvertTo-PSObject {
    param(
        [Parameter(Mandatory=$true,ValueFromPipeline=$true)]
        $InputObject
    )
    
    process {
        if ($InputObject -is [PSCustomObject]) {
            $result = New-Object PSObject
            
            foreach ($property in $InputObject.PSObject.Properties) {
                if ($property.Value -is [PSCustomObject] -or $property.Value -is [Object[]]) {
                    $converted = ConvertTo-PSObject -InputObject $property.Value
                    $result | Add-Member -NotePropertyName $property.Name -NotePropertyValue $converted
                } else {
                    $result | Add-Member -NotePropertyName $property.Name -NotePropertyValue $property.Value
                }
            }
            
            return $result
        } elseif ($InputObject -is [Object[]]) {
            $result = @()
            
            foreach ($item in $InputObject) {
                if ($item -is [PSCustomObject] -or $item -is [Object[]]) {
                    $converted = ConvertTo-PSObject -InputObject $item
                    $result += $converted
                } else {
                    $result += $item
                }
            }
            
            return $result
        } else {
            return $InputObject
        }
    }
}
