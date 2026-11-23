#!/bin/sh
set -eu
root_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$root_dir/web"
python3 -m http.server 8080
