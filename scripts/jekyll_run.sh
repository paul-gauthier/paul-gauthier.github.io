#!/bin/bash

# Run the Docker container with optimizations for faster builds
docker run \
       --rm \
       -v "$PWD:/site" \
       -p 4000:4000 \
       -e HISTFILE=/site/.bash_history \
       -e JEKYLL_ENV=development \
       -it \
       paulg-info-jekyll bundle exec jekyll serve --source docs --config docs/_config.yml --host 0.0.0.0 "$@"

# Additional options:
# --incremental: Only rebuilds files that changed
# --livereload: Auto-refreshes browser when content changes

