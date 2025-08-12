# PowerShell script to clear database tables
# This script connects to SQL Server and clears the specified tables

$server = "192.168.50.210"
$database = "devdb"
$username = "sa"
$password = "test@1234"

Write-Host "Connecting to SQL Server..." -ForegroundColor Yellow
Write-Host "Server: $server" -ForegroundColor Cyan
Write-Host "Database: $database" -ForegroundColor Cyan

try {
    # Execute the SQL script
    sqlcmd -S $server -d $database -U $username -P $password -i "clear_tables.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully cleared all tables!" -ForegroundColor Green
        Write-Host "Tables cleared:" -ForegroundColor Green
        Write-Host "  - exit_bodies" -ForegroundColor Green
        Write-Host "  - storage_allocation" -ForegroundColor Green
        Write-Host "  - bodies" -ForegroundColor Green
    } else {
        Write-Host "❌ Error occurred while clearing tables" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to connect to database or execute script" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "" -ForegroundColor Red
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "1. SQL Server is running and accessible" -ForegroundColor Yellow
    Write-Host "2. sqlcmd is installed and in PATH" -ForegroundColor Yellow
    Write-Host "3. Database credentials are correct" -ForegroundColor Yellow
    Write-Host "4. Database 'devdb' exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")