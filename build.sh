#!/bin/sh
# Copyright (c) 2026 HafzalBZ. SPDX-License-Identifier: MIT
set -eu

root_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
image_name=local/pdf-decrypt-wasm-mvp
container_name=pdf-decrypt-wasm-output

docker build --target artifacts -t "$image_name" "$root_dir"
docker create --name "$container_name" "$image_name" /bin/true >/dev/null
trap 'docker rm -f "$container_name" >/dev/null 2>&1 || true' EXIT
docker cp "$container_name:/pdf-decrypt.js" "$root_dir/web/pdf-decrypt.js"
docker cp "$container_name:/pdf-decrypt.wasm" "$root_dir/web/pdf-decrypt.wasm"
chmod 0644 "$root_dir/web/pdf-decrypt.js" "$root_dir/web/pdf-decrypt.wasm"

echo "Built web/pdf-decrypt.js and web/pdf-decrypt.wasm"
