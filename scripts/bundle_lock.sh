#!/bin/bash

set -euo pipefail

script_dir="$(cd "$(dirname "$0")" && pwd)"

exec "$script_dir/jekyll_exec.sh" bundle lock --add-platform x86_64-linux
exec "$script_dir/jekyll_exec.sh" bundle lock --add-platform aarch64-linux
