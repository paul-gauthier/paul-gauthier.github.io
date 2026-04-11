#!/bin/bash

use_ngrok=false
jekyll_args=()

for arg in "$@"; do
  if [[ "$arg" == "--ngrok" ]]; then
    use_ngrok=true
  else
    jekyll_args+=("$arg")
  fi
done

poller_pid=""
ngrok_pid=""

cleanup() {
  if [[ -n "$poller_pid" ]]; then
    kill "$poller_pid" 2>/dev/null || true
  fi

  if [[ -n "$ngrok_pid" ]]; then
    kill "$ngrok_pid" 2>/dev/null || true
  fi
}

trap cleanup EXIT

if $use_ngrok; then
  if ! command -v ngrok >/dev/null 2>&1; then
    echo "ngrok command not found" >&2
    exit 1
  fi

  ngrok http 4000 >/dev/null 2>&1 &
  ngrok_pid=$!
fi

(
  until curl -fsS http://localhost:4000 >/dev/null 2>&1; do
    sleep 0.5
  done

  url=http://localhost:4000

  if $use_ngrok; then
    tunnel_url=""

    until [[ -n "$tunnel_url" ]]; do
      tunnel_url="$(
        curl -fsS http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c 'import json, sys; data = json.load(sys.stdin); tunnels = data.get("tunnels", []); https_urls = [t.get("public_url", "") for t in tunnels if t.get("proto") == "https"]; http_urls = [t.get("public_url", "") for t in tunnels if t.get("proto") == "http"]; print((https_urls or http_urls or [""])[0])' 2>/dev/null
      )"
      [[ -n "$tunnel_url" ]] || sleep 0.5
    done

    url="$tunnel_url"
  fi

  echo
  echo
  echo Local site: http://localhost:4000
  if $use_ngrok; then
    echo Tunnel site: "$url"
  fi
  echo
  open -g "$url"
) &
poller_pid=$!

# Run the Docker container with optimizations for faster builds
docker run \
       --rm \
       -v "$PWD:/site" \
       -p 4000:4000 \
       -p 35729:35729 \
       -e HISTFILE=/site/.bash_history \
       -e JEKYLL_ENV=development \
       -it \
       paulg-info-jekyll bundle exec jekyll serve --source docs --config docs/_config.yml --host 0.0.0.0 --force_polling --livereload "${jekyll_args[@]}"

# Additional options:
# --incremental: Only rebuilds files that changed
# --livereload: Auto-refreshes browser when content changes


