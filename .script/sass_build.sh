#!/bin/bash

cd "$(dirname $(readlink -f $0))/../"
_BASE_DIR="$(pwd)"

_SRC_PATH="${1}"
_OUTPUT_PATH="${2}"

sass --update --style compressed "${_SRC_PATH}:${_OUTPUT_PATH}"
