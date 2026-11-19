# Sony Headphones: Decky plugin

This folder is the Decky Loader plugin. For installing and using it on a Steam Deck, see the [main README](../README.md).

## Layout

| Path | What it is |
| --- | --- |
| `src/index.tsx` | Quick Access panel (React, `@decky/ui`). Polls status once a second while it's visible. |
| `main.py` | Backend. Talks to `sony-headphonesd` over its socket and supervises the bundled daemon. |
| `plugin.json`, `package.json` | Decky metadata and the frontend build. |
| `scripts/package.sh` | Builds `out/sony-headphones-decky-v<version>.zip` (and a `.sha256`), with the daemon in `bin/` and licences in `licenses/`. |
| `install.sh` | Installs the packaged zip for the current version into `~/homebrew/plugins` and restarts Decky (`sudo`). |

## Backend behaviour

- **Status and commands:** both go over the daemon socket, `$XDG_RUNTIME_DIR/sony-headphones/daemon.sock`, which falls back to `/run/user/<uid>`. Status is fetched with the daemon's `status` command, not from `status.json`, which a crashed daemon leaves behind.
- **Command allow-list:** only the panel's verbs are forwarded, and each argument has to be a single safe word.
- **Bundled daemon:**
  - If nothing answers on the socket, the backend copies `bin/sony-headphonesd` to `$DECKY_PLUGIN_RUNTIME_DIR/bin/`, marks it executable and runs it. Plugin files are root-owned, and Decky's zip install drops the executable bit, which is why it's copied.
  - It restarts the daemon with a growing delay if it exits, and stops only its own daemon on unload.
  - An already-running daemon, such as the user's `sony-headphones.service`, is used and never replaced.
  - The daemon's output goes to `$DECKY_PLUGIN_LOG_DIR/sony-headphonesd.log`.
- **Panel session:** the panel sends `panel-open` while visible and `panel-close` when hidden or unloaded. This keeps the on-demand RFCOMM policy, so Sony's phone app can reconnect.

## Build and package

Build in the Arch distrobox (see the main README), then:

```sh
../scripts/build.sh           # daemon, from the repository root's scripts
pnpm install && pnpm build    # dist/index.js
./scripts/package.sh          # out/sony-headphones-decky-v<version>.zip
sudo ./install.sh             # on the Deck, outside the distrobox
```

Set `SONY_DAEMON=/path/to/sony-headphonesd` to package a different daemon build.

## Releasing

1. Bump `version` in `package.json` and add an entry to `../CHANGELOG.md`.
2. Rebuild and package as above. Don't commit `dist/` or `out/`, which are ignored.
3. Create a GitHub release tagged `decky-vX.Y.Z` and attach `out/sony-headphones-decky-vX.Y.Z.zip` and its `.sha256`.
