#!/bin/sh
# Copyright (c) 2026 HafzalBZ. SPDX-License-Identifier: MIT
set -eu

root_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

for file in \
  dist/index.js \
  dist/index.d.ts \
  dist/node.js \
  dist/node.d.ts \
  dist/vite.js \
  dist/vite.d.ts \
  dist/pdf-worker.js \
  dist/pdf-decrypt.js \
  dist/pdf-decrypt.wasm \
  dist/SHA256SUMS
do
  if [ ! -f "$root_dir/$file" ]; then
    echo "Missing $file. Run npm run build before publishing." >&2
    exit 1
  fi
done

(
  cd "$root_dir/dist"
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum -c SHA256SUMS
  else
    shasum -a 256 -c SHA256SUMS
  fi
)
