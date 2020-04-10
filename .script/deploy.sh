#!/bin/bash 

cd "$(dirname $(readlink -f $0))/../"
_BASE_DIR="$(pwd)"

source ./.script/_conf.sh

echo "出力先作成中...";
_OUTPUT_PATH="./.deploy/${_PRJ_NAME}/${_GIT_TAG}/${_GIT_HASH}/$(date '+%Y%m%d_%H%M%S')"
mkdir -p ${_OUTPUT_PATH}/

echo "作業ファイル削除中...";
find build/ -mindepth 1 -type f -name *.css -delete
find build/ -mindepth 1 -type f -name *.js -delete
find build/ -mindepth 1 -type f -name *.d.ts -delete
find build/ -mindepth 1 -type f -name *.map -delete
find build/ -mindepth 1 -type d -empty -delete

echo "htmlファイル移動中...";
find ./* -name '*.html' -type f -not -path '*/.deploy/*' -exec bash -c 'mkdir -p $(dirname '"${_OUTPUT_PATH}"'/{}) && cp {} '"${_OUTPUT_PATH}"'/{}' \;

echo "リソースファイル移動中...";
cp -r ./resource/ ${_OUTPUT_PATH}/

echo "トランスパイル用コンテナ起動中...";
_USER="$(id -u):$(id -g)" docker-compose -f .docker/docker-compose.yml up -d

echo "トランスパイル中...";
docker exec -it typescript_build_tslib target_data/.script/typescript_build.sh './src' './build/'
docker exec -it sass_build_tslib target_data/.script/sass_build.sh './src' './build/'

echo "cssファイル移動中...";
find ./build/ -name '*.css' -type f -not -path '*/.deploy/*' -exec bash -c 'mkdir -p $(dirname '"${_OUTPUT_PATH}"'/{}) && cp {} '"${_OUTPUT_PATH}"'/{}' \;

echo "jsファイル移動中...";
find ./build/ -name '*.js' -type f -not -path '*/.deploy/*' -exec bash -c 'mkdir -p $(dirname '"${_OUTPUT_PATH}"'/{}) && cp {} '"${_OUTPUT_PATH}"'/{}' \;

echo "ファイル圧縮中...";
find "${_OUTPUT_PATH}" -type f -exec bash -c 'gzip -c --best --no-name {} > {}.gz' \;

echo "トランスパイル用コンテナ停止...";
_USER="$(id -u):$(id -g)" docker-compose -f .docker/docker-compose.yml stop

echo "作業ファイル削除中...";
find build/ -mindepth 1 -type f -name *.css -delete
find build/ -mindepth 1 -type f -name *.js -delete
find build/ -mindepth 1 -type f -name *.d.ts -delete
find build/ -mindepth 1 -type f -name *.map -delete
find build/ -mindepth 1 -type d -empty -delete

echo "完了";
echo "出力先: ${_OUTPUT_PATH}/";
