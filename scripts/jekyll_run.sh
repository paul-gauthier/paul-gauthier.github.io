#!/bin/bash

use_ngrok=false

for arg in "$@"; do
  if [ "$arg" = "--ngrok" ]; then
    use_ngrok=true
    break
  fi
done

forwarded_args=()

for arg in "$@"; do
  case "$arg" in
    --ngrok|--livereload)
      ;;
    *)
      forwarded_args+=("$arg")
      ;;
  esac
done

if $use_ngrok; then
  command -v ngrok >/dev/null 2>&1 || {
    echo "Error: --ngrok requires ngrok to be installed." >&2
    exit 1
  }

  ngrok http 4000 >/dev/null 2>&1 &
  ngrok_pid=$!
else
  ngrok_pid=
fi

get_ngrok_url() {
  curl -fsS http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c '
import json
import sys

try:
    tunnels = json.load(sys.stdin).get("tunnels", [])
except Exception:
    sys.exit(0)

https_urls = [
    tunnel.get("public_url", "")
    for tunnel in tunnels
    if tunnel.get("public_url", "").startswith("https://")
]
if https_urls:
    print(https_urls[0], end="")
    sys.exit(0)

http_urls = [
    tunnel.get("public_url", "")
    for tunnel in tunnels
    if tunnel.get("public_url", "").startswith("http://")
]
if http_urls:
    print(http_urls[0], end="")
'
}

(
  until curl -fsS http://localhost:4000 >/dev/null 2>&1; do
    sleep 0.5
  done

  if $use_ngrok; then
    until target_url="$(get_ngrok_url)"; [ -n "$target_url" ]; do
      sleep 0.5
    done
  else
    target_url=http://localhost:4000
  fi

  echo
  echo
  echo "Local site: $target_url"
  echo
  open -g "$target_url"
) &
poller_pid=$!

cleanup() {
  kill "$poller_pid" 2>/dev/null || true
  if [ -n "$ngrok_pid" ]; then
    kill "$ngrok_pid" 2>/dev/null || true
  fi
}

trap cleanup EXIT

jekyll_args=(
  --source docs
  --config docs/_config.yml
  --host 0.0.0.0
  --force_polling
)

if ! $use_ngrok; then
  jekyll_args+=(--livereload)
fi

# Run the Docker container with optimizations for faster builds
docker run \
       --rm \
       -v "$PWD:/site" \
       -p 4000:4000 \
       -p 35729:35729 \
       -e HISTFILE=/site/.bash_history \
       -e JEKYLL_ENV=development \
       -it \
       paulg-info-jekyll bundle exec jekyll serve "${jekyll_args[@]}" "${forwarded_args[@]}"

# Additional options:
# --incremental: Only rebuilds files that changed
# --livereload: Auto-refreshes browser when content changes


