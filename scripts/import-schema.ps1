$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$mysql = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
$schema = Join-Path $root "backend\db\schema.sql"

if (!(Test-Path $mysql)) {
  throw "mysql.exe not found. Install MySQL with: winget install Oracle.MySQL"
}

if (!(Test-Path $schema)) {
  throw "Schema file not found at $schema"
}

Get-Content $schema | & $mysql --protocol=tcp -h 127.0.0.1 -u root
& $mysql --protocol=tcp -h 127.0.0.1 -u root -e "USE admission_dashboard; SHOW TABLES; SELECT id,email,role FROM counsellors; SELECT COUNT(*) AS lead_count FROM leads;"
