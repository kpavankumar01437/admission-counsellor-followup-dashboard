$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$pidFile = Join-Path $root ".mysql.pid"

if (!(Test-Path $pidFile)) {
  Write-Host "No .mysql.pid file found."
  exit 0
}

$mysqlPid = Get-Content $pidFile
Stop-Process -Id ([int]$mysqlPid) -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath $pidFile -ErrorAction SilentlyContinue
Write-Host "Stopped local MySQL process $mysqlPid."
