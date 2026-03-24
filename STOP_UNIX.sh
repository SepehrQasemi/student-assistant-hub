#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PID_FILE="${REPO_ROOT}/.student-assistant-hub-dev.pid"
LOG_FILE="${REPO_ROOT}/.student-assistant-hub-dev.log"
PORT=3000

server_responsive() {
  curl --silent --fail --max-time 2 "http://127.0.0.1:${PORT}" >/dev/null 2>&1
}

stop_by_port() {
  if command -v lsof >/dev/null 2>&1; then
    local target_pid
    target_pid="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN | head -n 1 || true)"
    if [ -n "$target_pid" ]; then
      kill "$target_pid" >/dev/null 2>&1 || true
    fi
  fi

  if command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -NoLogo -NoProfile -Command "Get-NetTCPConnection -LocalPort $PORT -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1" \
      | tr -d '\r' \
      | while read -r windows_pid; do
          if [ -n "$windows_pid" ]; then
            taskkill.exe //PID "$windows_pid" //T //F >/dev/null 2>&1 || true
          fi
        done
  fi
}

if [ ! -f "$PID_FILE" ]; then
  printf 'No saved Student Assistant Hub dev-server PID was found.\n'
  exit 0
fi

PID="$(head -n 1 "$PID_FILE")"

if kill "$PID" >/dev/null 2>&1; then
  printf 'Stopped Student Assistant Hub dev server process %s.\n' "$PID"
else
  printf 'Could not stop process %s. It may already be closed.\n' "$PID"
fi

if server_responsive; then
  stop_by_port
fi

rm -f "$PID_FILE"
rm -f "$LOG_FILE"
