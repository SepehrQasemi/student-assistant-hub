#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT=3000
URL="http://127.0.0.1:${PORT}"
PID_FILE="${REPO_ROOT}/.student-assistant-hub-dev.pid"
LOG_FILE="${REPO_ROOT}/.student-assistant-hub-dev.log"

echo_step() {
  printf '[Student Assistant Hub] %s\n' "$1"
}

server_responsive() {
  curl --silent --fail --max-time 2 "$URL" >/dev/null 2>&1
}

port_in_use() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1
    return $?
  fi

  if command -v ss >/dev/null 2>&1; then
    ss -ltn "( sport = :$PORT )" | tail -n +2 | grep -q .
    return $?
  fi

  return 1
}

open_browser() {
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" >/dev/null 2>&1 || true
    return
  fi

  if command -v open >/dev/null 2>&1; then
    open "$URL" >/dev/null 2>&1 || true
  fi
}

if ! command -v node >/dev/null 2>&1; then
  printf 'Node.js was not found. Install Node.js 20 or newer, then run this script again.\n' >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  printf 'npm was not found. Ensure Node.js and npm are installed correctly, then run this script again.\n' >&2
  exit 1
fi

if port_in_use; then
  if server_responsive; then
    echo_step "Port ${PORT} is already serving Student Assistant Hub. Opening the app."
    open_browser
    exit 0
  fi

  printf 'Port %s is already in use by another process. Stop that process or change the port before starting the app.\n' "$PORT" >&2
  exit 1
fi

if [ ! -d "${REPO_ROOT}/node_modules" ]; then
  echo_step "Installing dependencies with npm install..."
  (cd "$REPO_ROOT" && npm install)
fi

rm -f "$PID_FILE"

echo_step "Starting the development server on ${URL}..."
(cd "$REPO_ROOT" && nohup node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port "$PORT" >"$LOG_FILE" 2>&1 & echo $! >"$PID_FILE")

for _ in $(seq 1 30); do
  if server_responsive; then
    echo_step "Opening Student Assistant Hub in the browser."
    open_browser
    echo_step "Server started. Logs: ${LOG_FILE}"
    exit 0
  fi

  sleep 1
done

printf 'The development server process started but did not respond on %s in time. Check %s for errors.\n' "$URL" "$LOG_FILE" >&2
exit 1
