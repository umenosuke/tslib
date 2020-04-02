#!/bin/bash
source /usr/local/nvm/nvm.sh

cd "$(dirname $(readlink -f $0))/../"
_BASE_DIR="$(pwd)"

_SRC_PATH="${1}"
_OUTPUT_PATH="${2}"

tsc -p "${_SRC_PATH}" -d --outDir "${_OUTPUT_PATH}"
