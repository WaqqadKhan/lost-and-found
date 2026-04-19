$ErrorActionPreference = "SilentlyContinue"

$root = (Resolve-Path ".").Path
$rootEscaped = [Regex]::Escape($root)

$nextProcs = Get-CimInstance Win32_Process |
  Where-Object {
    $_.Name -eq "node.exe" -and
    $_.CommandLine -match "next(\.js)?\s+dev" -and
    $_.CommandLine -match $rootEscaped
  }

if ($nextProcs) {
  foreach ($proc in $nextProcs) {
    try {
      Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
      Write-Host "Stopped stale dev process PID $($proc.ProcessId)"
    } catch {
      Write-Host "Could not stop PID $($proc.ProcessId)"
    }
  }
} else {
  Write-Host "No stale Next.js dev process found for this project."
}

if (Test-Path ".next") {
  try {
    Remove-Item ".next" -Recurse -Force
    Write-Host "Cleared .next cache directory."
  } catch {
    Write-Host "Could not clear .next (likely locked). Continuing..."
  }
}

if (Test-Path ".next-app") {
  try {
    Remove-Item ".next-app" -Recurse -Force
    Write-Host "Cleared .next-app cache directory."
  } catch {
    Write-Host "Could not clear .next-app (likely locked). Continuing..."
  }
}

