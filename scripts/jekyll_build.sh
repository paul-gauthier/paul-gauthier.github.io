#!/bin/bash

# Build the Docker image
docker build -t paulg-info-jekyll -f scripts/Dockerfile.jekyll .
