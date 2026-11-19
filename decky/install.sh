#!/usr/bin/env bash
# Installs the packaged plugin (out/sony-headphones-decky-v<version>.zip) into Decky Loader.
# Run ./scripts/package.sh first, then: sudo ./install.sh
set -euo pipefail
src="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
version="$(python3 -I -c 'import json,sys; print(json.load(open(sys.argv[1]))["version"])' "$src/package.json")"
zip="$src/out/sony-headphones-decky-v$version.zip"
dest="/home/deck/homebrew/plugins/sony-headphones"
[ "$(id -u)" -eq 0 ] || { echo "Run with sudo: sudo $0" >&2; exit 1; }
[ -f "$zip" ] || { echo "$zip missing; run ./scripts/package.sh first" >&2; exit 1; }
stage="$(mktemp -d)"; trap 'rm -rf -- "$stage"' EXIT
python3 -I -m zipfile -e "$zip" "$stage"
rm -rf -- "$dest"
cp -r -- "$stage/sony-headphones" "$dest"
chmod -R u=rwX,go=rX -- "$dest"
chmod 755 -- "$dest/bin/sony-headphonesd"
systemctl restart plugin_loader
echo "Installed to $dest and restarted Decky Loader."
