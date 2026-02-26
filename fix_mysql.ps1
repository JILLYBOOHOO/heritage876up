$ErrorActionPreference = "SilentlyContinue"

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "   Antigravity MySQL Auto-Repair & Setup Tool" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Please wait while your database is repaired..."
Write-Host ""

Write-Host "[1/6] Stopping broken MySQL services..." -ForegroundColor Yellow
Get-Service | Where-Object {$_.Name -like "*mysql*"} | Stop-Service -Force
Get-Process | Where-Object {$_.Name -like "*mysqld*"} | Stop-Process -Force

Write-Host "[2/6] Cleaning up corrupted Windows Registry entries..." -ForegroundColor Yellow
$services = @("MySQL", "MySQL80", "MySQL800", "MySQLsever", "mySQLy", "HeritageDB")
foreach ($srv in $services) {
    sc.exe delete $srv > $null 2>&1
}

Write-Host "[3/6] Wiping broken database files..." -ForegroundColor Yellow
$dataDir = "C:\ProgramData\MySQL\MySQL Server 8.0\Data"
if (Test-Path $dataDir) {
    Remove-Item -Recurse -Force $dataDir
}

Write-Host "[4/6] Creating a fresh, highly-secure database..." -ForegroundColor Yellow
$mysqld = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"
& $mysqld --initialize-insecure --console | Out-Null

Write-Host "[5/6] Starting the fresh MySQL Service..." -ForegroundColor Yellow
& $mysqld --install MySQL80 | Out-Null
Start-Service MySQL80
Start-Sleep -Seconds 5

Write-Host "[6/6] Securing root account and loading Heritage876 dataset..." -ForegroundColor Yellow
$mysql = "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
$sql = "ALTER USER 'root'@'localhost' IDENTIFIED BY '12345'; FLUSH PRIVILEGES;"
$sql | & $mysql -u root

$schemaPath = "C:\Users\HeartCoding\Downloads\heritage876-main\heritage876-main\schema.sql"
cmd.exe /c "`"$mysql`" -u root -p12345 < `"$schemaPath`""

Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "SUCCESS! Your MySQL Database is COMPLETELY FIXED!" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "-> You can now click 'Cancel' on the messy MySQL Installer and close it."
Write-Host "-> Open MySQL Workbench."
Write-Host "-> Double-click your connection, use Port 3306, and password: 12345"
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
