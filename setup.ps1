# ================================================================
# RoboEdu - First Time Setup Script (WINDOWS / POWERSHELL)
# Usage: Buka PowerShell di folder ini, lalu jalankan:  .\setup.ps1
#
# Apa yang dilakukannya:
#   1. Copy .env.example ke .env (jika .env belum ada)
#   2. Ganti SEMUA placeholder "password_ubah_disini" dgn random secure string
#   3. Generate SESSION_SECRET random 64 karakter
#   4. Print ringkasan port + langkah selanjutnya
# ================================================================

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $ScriptDir

Write-Host "`n==============================================" -ForegroundColor Cyan
Write-Host "  RoboEdu First-Time Setup (Windows)" -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan

# -------- Langkah 1: Buat .env dari example jika belum ada --------
$envPath = Join-Path $ScriptDir ".env"
$examplePath = Join-Path $ScriptDir ".env.example"

if (-not (Test-Path $envPath)) {
    if (-not (Test-Path $examplePath)) {
        Write-Host "[FATAL] .env.example tidak ditemukan! Pastikan kamu clone lengkap." -ForegroundColor Red
        exit 1
    }
    Copy-Item $examplePath $envPath -Force
    Write-Host "[ OK ] .env dibuat dari .env.example`n" -ForegroundColor Green
} else {
    Write-Host "[INFO] .env SUDAH ADA, hanya mengganti placeholder yang belum diubah...`n" -ForegroundColor Yellow
}

# -------- Helper: Generate secure random string --------
function New-RandomString([int]$Length = 32) {
    $bytes = New-Object byte[] $Length
    [Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
    return ($bytes | ForEach-Object { $_.ToString("x2") }) -join ""
}

# -------- Langkah 2: Baca .env dan ganti placeholder --------
$envContent = Get-Content $envPath -Raw

function Replace-Placeholder($content, $pattern, $replacementValue) {
    if ($content -match [regex]::Escape($pattern)) {
        return $content -replace [regex]::Escape($pattern), $replacementValue
    }
    return $content
}

$placeholderDB    = "password_ubah_disini"
$placeholderDBR   = "rootpassword_ubah_disini"
$placeholderMinIO = "minioadmin_ubah_disini"
$placeholderMinIOS= "miniosecret_ubah_disini"
$placeholderSess  = "ganti_dengan_random_string_panjang_minimal_32_char"

$newDbPass      = "roboedu_db_" + (New-RandomString 16)
$newDbRootPass  = "roboedu_root_" + (New-RandomString 16)
$newMinioAK     = "minio_" + (New-RandomString 16)
$newMinioSK     = "minio_secret_" + (New-RandomString 24)
$newSessionSec  = New-RandomString 64

$changes = 0
if ($envContent -match [regex]::Escape($placeholderDB))    { $envContent = Replace-Placeholder $envContent $placeholderDB    $newDbPass;     $changes++ }
if ($envContent -match [regex]::Escape($placeholderDBR))   { $envContent = Replace-Placeholder $envContent $placeholderDBR   $newDbRootPass; $changes++ }
if ($envContent -match [regex]::Escape($placeholderMinIO)) { $envContent = Replace-Placeholder $envContent $placeholderMinIO $newMinioAK;   $changes++ }
if ($envContent -match [regex]::Escape($placeholderMinIOS)){ $envContent = Replace-Placeholder $envContent $placeholderMinIOS$newMinioSK;   $changes++ }
if ($envContent -match [regex]::Escape($placeholderSess))  { $envContent = Replace-Placeholder $envContent $placeholderSess  $newSessionSec;$changes++ }

Set-Content $envPath -Value $envContent -NoNewline

if ($changes -gt 0) {
    Write-Host "[ OK ] $changes credential placeholder diganti dengan random string.`n" -ForegroundColor Green
} else {
    Write-Host "[ OK ] Semua placeholder sudah di-setting (tidak ada yang diganti).`n" -ForegroundColor Green
}

# -------- Langkah 3: Print ringkasan --------
Write-Host "----------------------------------------------" -ForegroundColor Gray
Write-Host "  RINGKASAN KONFIGURASI" -ForegroundColor White
Write-Host "----------------------------------------------" -ForegroundColor Gray

Write-Host "  App URL (langsung)  : http://localhost:3001"
Write-Host "  App URL (via nginx) : http://localhost:80"
Write-Host "  MinIO Console       : http://localhost:9003"
Write-Host "  MinIO API Port      : 9002"
Write-Host ""
Write-Host "  Database (internal docker only):"
Write-Host "    Host     : mysql (bukan localhost)"
Write-Host "    Database : roboedu"
Write-Host "    Username : roboedu"
Write-Host ""

Write-Host "----------------------------------------------" -ForegroundColor Gray
Write-Host "  LANGKAH SELANJUTNYA:" -ForegroundColor White
Write-Host "----------------------------------------------" -ForegroundColor Gray
Write-Host "  1. Untuk START pertama kali (build + up):" -ForegroundColor Cyan
Write-Host "     docker compose up -d --build"
Write-Host ""
Write-Host "  2. Untuk START selanjutnya (tanpa build):" -ForegroundColor Cyan
Write-Host "     docker compose up -d"
Write-Host ""
Write-Host "  3. Cek status semua container:" -ForegroundColor Cyan
Write-Host "     docker compose ps -a"
Write-Host ""
Write-Host "  4. Melihat log app jika ada error:" -ForegroundColor Cyan
Write-Host "     docker compose logs app --tail=100"
Write-Host ""

Pop-Location
