#!/usr/bin/env bash

VERSION=1.0.0
IMAGE_NAME="tardate/goodgifts"
OP=${1:-build}

set -e

case ${OP} in
  build)
    echo "Building Docker image ${IMAGE_NAME}:${VERSION}"
    docker build -t ${IMAGE_NAME}:${VERSION} .
    docker tag ${IMAGE_NAME}:${VERSION} ${IMAGE_NAME}:latest
    docker image ls ${IMAGE_NAME}
    ;;
  push)
    echo "Pushing Docker image ${IMAGE_NAME}:${VERSION}"
    docker push ${IMAGE_NAME}:${VERSION}
    docker push ${IMAGE_NAME}:latest
    ;;
  run)
    echo "Running Docker container ${IMAGE_NAME}:${VERSION}"
    docker run --rm -p 4173:4173 ${IMAGE_NAME}:${VERSION}
    ;;
  *)
    echo "Unknown command: ${OP}"
    echo "Usage: ${0} [build|push|run]"
    exit 1
    ;;
esac
