#!/bin/sh
# Copyright (c) 2026 HafzalBZ. SPDX-License-Identifier: MIT
set -eu

root_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

"$root_dir/build.sh"
mkdir -p "$root_dir/dist"
cp "$root_dir/src/index.js" "$root_dir/dist/index.js"
cp "$root_dir/src/index.d.ts" "$root_dir/dist/index.d.ts"
cp "$root_dir/src/pdf-worker.js" "$root_dir/dist/pdf-worker.js"
cp "$root_dir/web/pdf-decrypt.js" "$root_dir/dist/pdf-decrypt.js"
cp "$root_dir/web/pdf-decrypt.wasm" "$root_dir/dist/pdf-decrypt.wasm"

(
  cd "$root_dir/dist"
  files="pdf-decrypt.js pdf-decrypt.wasm index.js index.d.ts pdf-worker.js"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum $files > SHA256SUMS
  else
    shasum -a 256 $files > SHA256SUMS
  fi
)

echo "Package artifacts prepared in dist/"
