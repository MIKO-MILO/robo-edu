#!/usr/bin/env bash
# ================================================================
# RoboEdu - First Time Setup Script (MACOS / LINUX)
# Usage: cd ke folder ini, lalu jalankan:  chmod +x setup.sh && ./setup.sh
#
# Apa yang dilakukannya (sama seperti setup.ps1):
#   1. Copy .env.example ke .env (jika .env belum ada)
#   2. Ganti SEMUA placeholder "password_ubah_disini" dgn random secure string
#   3. Generate SESSION_SECRET random 64 karakter
#   4. Print ringkasan port + langkah selanjutnya
# ================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo ""
echo -e "\033[36m==============================================\033[0m"
echo -e "\033[36m  RoboEdu First-Time Setup (macOS / Linux)\033[0m"
echo -e "\033[36m==============================================\033[0m"
echo ""

# -------- Langkah 1: Buat .env dari example jika belum ada --------
ENV_FILE="$SCRIPT_DIR/.env"
EXAMPLE_FILE="$SCRIPT_DIR/.env.example"

if [[ ! -f "$ENV_FILE" ]]; then
    if [[ ! -f "$EXAMPLE_FILE" ]]; then
        echo -e "\033[31m[FATAL] .env.example tidak ditemukan! Pastikan kamu clone lengkap.\033[0m"
        exit 1
    fi
    cp "$EXAMPLE_FILE" "$ENV_FILE"
    echo -e "\033[32m[ OK ] .env dibuat dari .env.example\033[0m"
    echo ""
else
    echo -e "\033[33m[INFO] .env SUDAH ADA, hanya mengganti placeholder yang belum diubah...\033[0m"
    echo ""
fi

# -------- Helper: Generate secure random string --------
rand_str() {
    local len="${1:-32}"
    if command -v openssl &>/dev/null; then
        openssl rand -hex "$len"
    else
        # fallback via /dev/urandom
        LC_ALL=C tr -dc 'a-f0-9' < /dev/urandom | head -c "$(( len * 2 ))"
    fi
}

# -------- Langkah 2: Ganti placeholder --------
P_DB="password_ubah_disini"
P_DBR="rootpassword_ubah_disini"
P_MIO="minioadmin_ubah_disini"
P_MIOS="miniosecret_ubah_disini"
P_SES="ganti_dengan_random_string_panjang_minimal_32_char"

NEW_DB="roboedu_db_$(rand_str 16)"
NEW_DBR="roboedu_root_$(rand_str 16)"
NEW_MAK="minio_$(rand_str 16)"
NEW_MSK="minio_secret_$(rand_str 24)"
NEW_SES="$(rand_str 64)"

changes=0

escape_sed() { printf '%s\n' "$1" | sed -e 's/[][\\/.^$*(){|?+]/\\&/g'; }

replace() {
    local pattern="$1" value="$2"
    if grep -qF "$pattern" "$ENV_FILE"; then
        local e_pat e_val
        e_pat="$(escape_sed "$pattern")"
        e_val="$(escape_sed "$value")"
        sed -i.bak "s/${e_pat}/${e_val}/g" "$ENV_FILE" && rm -f "${ENV_FILE}.bak"
        return 0
    fi
    return 1
}

replace "$P_DB"    "$NEW_DB"  && ((changes++)) || true
replace "$P_DBR"   "$NEW_DBR" && ((changes++)) || true
replace "$P_MIO"   "$NEW_MAK" && ((changes++)) || true
replace "$P_MIOS"  "$NEW_MSK" && ((changes++)) || true
replace "$P_SES"   "$NEW_SES" && ((changes++)) || true

if [[ $changes -gt 0 ]]; then
    echo -e "\033[32m[ OK ] $changes credential placeholder diganti dengan random string.\033[0m"
    echo ""
else
    echo -e "\033[32m[ OK ] Semua placeholder sudah di-setting (tidak ada yang diganti).\033[0m"
    echo ""
fi

# -------- Langkah 3: Ringkasan --------
echo -e "\033[90m----------------------------------------------\033[0m"
echo -e "\033[1m  RINGKASAN KONFIGURASI\033[0m"
echo -e "\033[90m----------------------------------------------\033[0m"

echo "  App URL (langsung)  : http://localhost:3001"
echo "  App URL (via nginx) : http://localhost:80"
echo "  MinIO Console       : http://localhost:9003"
echo "  MinIO API Port      : 9002"
echo ""
echo "  Database (internal docker only):"
echo "    Host     : mysql (bukan localhost)"
echo "    Database : roboedu"
echo "    Username : roboedu"
echo ""

echo -e "\033[90m----------------------------------------------\033[0m"
echo -e "\033[1m  LANGKAH SELANJUTNYA:\033[0m"
echo -e "\033[90m----------------------------------------------\033[0m"
echo -e "\033[36m  1. Untuk START pertama kali (build + up):\033[0m"
echo "     docker compose up -d --build"
echo ""
echo -e "\033[36m  2. Untuk START selanjutnya (tanpa build):\033[0m"
echo "     docker compose up -d"
echo ""
echo -e "\033[36m  3. Cek status semua container:\033[0m"
echo "     docker compose ps -a"
echo ""
echo -e "\033[36m  4. Melihat log app jika ada error:\033[0m"
echo "     docker compose logs app --tail=100"
echo ""
