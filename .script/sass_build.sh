#!/bin/bash
source /etc/profile.d/rbenv.sh

cd "$(dirname $(readlink -f $0))/../"
_BASE_DIR="$(pwd)"

_SRC_PATH="${1}"
_OUTPUT_PATH="${2}"

sass -r sass-globbing --update --style compressed -E utf-8 "${_SRC_PATH}:${_OUTPUT_PATH}"
