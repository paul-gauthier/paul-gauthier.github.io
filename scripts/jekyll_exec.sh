#!/bin/bash

set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"
repo_root="$(cd "$script_dir/.." && pwd)"

docker run \
       --rm \
       -v "$repo_root:/site" \
       -w /site \
       -u "$(id -u):$(id -g)" \
       -e HOME=/tmp \
       -e BUNDLE_APP_CONFIG=/tmp/.bundle \
       -it \
       paulg-info-jekyll \
       "$@"
