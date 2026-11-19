#!/usr/bin/env bash
# Builds the Decky release zip: out/sony-headphones.zip, with the daemon bundled in bin/.
# Install it via Decky > Settings > Developer > Install Plugin from ZIP.
#
# Needs the frontend (pnpm build) and the daemon (../scripts/build.sh, run in an Arch
# distrobox on the Deck). Override the daemon path with SONY_DAEMON=/path/to/sony-headphonesd.
set -euo pipefail
dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
repo="$(cd -- "$dir/.." && pwd)"
daemon="${SONY_DAEMON:-$repo/build/native/sony-headphonesd}"
cd "$dir"
[ -f dist/index.js ] || { echo "dist/index.js missing; run 'pnpm install && pnpm build' first" >&2; exit 1; }
[ -x "$daemon" ] || { echo "$daemon missing; build the daemon with ../scripts/build.sh first" >&2; exit 1; }
if command -v ldd >/dev/null && ldd "$daemon" | grep -q 'not found'; then
  echo "$daemon links libraries this system lacks:" >&2
  ldd "$daemon" | grep 'not found' >&2
  exit 1
fi
stage="$(mktemp -d)"; trap 'rm -rf -- "$stage"' EXIT
root="$stage/sony-headphones"
mkdir -p "$root/dist" "$root/bin" "$root/licenses" out
install -m 644 plugin.json package.json main.py LICENSE README.md "$root/"
install -m 644 dist/index.js "$root/dist/"
install -m 755 "$daemon" "$root/bin/sony-headphonesd"
install -m 644 "$repo/licenses/libmdr-LICENSE" "$repo/licenses/fmt-LICENSE" "$repo/THIRD_PARTY.md" "$root/licenses/"
rm -f out/sony-headphones.zip
(cd "$stage" && zip -qr "$dir/out/sony-headphones.zip" sony-headphones)
echo "Wrote $dir/out/sony-headphones.zip"
