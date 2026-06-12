$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$mysqlHome = "C:\Program Files\MySQL\MySQL Server 8.4"
$mysqlBin = Join-Path $mysqlHome "bin"
$mysqld = Join-Path $mysqlBin "mysqld.exe"
$mysqladmin = Join-Path $mysqlBin "mysqladmin.exe"
$dataDir = Join-Path $root ".mysql-data"
$configDir = Join-Path $root ".mysql-config"
$ini = Join-Path $configDir "my.ini"
$pidFile = Join-Path $root ".mysql.pid"

if (!(Test-Path $mysqld)) {
  throw "MySQL Server 8.4 was not found at $mysqlHome. Install it with: winget install Oracle.MySQL"
}

New-Item -ItemType Directory -Force -Path $dataDir, $configDir | Out-Null

@"
[mysqld]
basedir=C:/Program Files/MySQL/MySQL Server 8.4
datadir=C:/Users/kpava/Downloads/OPENAIHACKATHON/admission-dashboard/.mysql-data
port=3306
bind-address=127.0.0.1
mysqlx=0
lc-messages-dir=C:/Program Files/MySQL/MySQL Server 8.4/share
"@ | Set-Content -Path $ini -Encoding ASCII

if (!(Test-Path (Join-Path $dataDir "auto.cnf"))) {
  & $mysqld --defaults-file="$ini" --initialize-insecure --console
  if ($LASTEXITCODE -ne 0) {
    throw "MySQL initialization failed."
  }
}

if (Test-Path $pidFile) {
  $existingPid = Get-Content $pidFile
  $existing = Get-Process -Id ([int]$existingPid) -ErrorAction SilentlyContinue
  if ($existing) {
    Write-Host "MySQL already appears to be running with PID $existingPid."
    exit 0
  }
}

$listening = Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
if ($listening) {
  Write-Host "Port 3306 is already listening. MySQL may already be running."
  exit 0
}

for ($attempt = 1; $attempt -le 5; $attempt++) {
  $proc = Start-Process -FilePath $mysqld -ArgumentList "--defaults-file=$ini" -WindowStyle Hidden -PassThru
  Set-Content -Path $pidFile -Value $proc.Id
  Start-Sleep -Seconds 7

  $running = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
  if ($running) {
    & $mysqladmin --protocol=tcp -h 127.0.0.1 -u root ping | Out-Null
    if ($LASTEXITCODE -eq 0) {
      Write-Host "MySQL started on 127.0.0.1:3306 with PID $($proc.Id)."
      exit 0
    }
  }

  Write-Host "MySQL start attempt $attempt failed; retrying if possible."
}

throw "MySQL did not start after 5 attempts. Check .mysql-data/*.err."
