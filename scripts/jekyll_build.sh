#!/bin/bash

set -euo pipefail

rm Gemfile.lock

touch Gemfile.lock

# Build the Docker image
docker build -t paulg-info-jekyll -f scripts/Dockerfile.jekyll .

script_dir="$(cd "$(dirname "$0")" && pwd)"

exec "$script_dir/jekyll_exec.sh" bundle lock --add-platform x86_64-linux
exec "$script_dir/jekyll_exec.sh" bundle lock --add-platform aarch64-linux

# Build the Docker image
docker build -t paulg-info-jekyll -f scripts/Dockerfile.jekyll .
