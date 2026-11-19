# Sony Headphones for Steam Deck

Control Sony headphones from the Steam Deck's Quick Access menu, in Game Mode. This is a [Decky Loader](https://decky.xyz) plugin built on the native `sony-headphonesd` service from [sony-headphones-linux](https://github.com/VyomJain6904/sony-headphones-linux) by Vyom Jain.

The release zip includes everything: the panel, a small backend and a prebuilt daemon. You don't need to compile anything or use a terminal.

> **Hardware alpha:** tested on a WH-1000XM5 (firmware 2.5.1, MDR v2) with a Steam Deck on SteamOS 3.9.5. Other models supported by Sony | Sound Connect may work when they report the needed capabilities, but they aren't claimed as tested. See the [compatibility matrix](docs/COMPATIBILITY.md).

## Features

- Battery levels: main, left/right and case, depending on what the headphones report
- Bluetooth codec in use (SBC, AAC, LDAC and others)
- Noise control: Off, Noise cancelling or Ambient sound, with the ambient level and Focus on Voice
- Speak-to-Chat, DSEE, equalizer presets and headphone volume
- Connection priority: Sound quality or Stable connection
- Controls appear only when your headphones report they support them
- The control channel is released when you close the panel, so Sony's phone app can reconnect

## Install

1. Install [Decky Loader](https://decky.xyz) if you don't have it yet.
2. Download **`sony-headphones-decky-v<version>.zip`** from the [latest release](https://github.com/ChesterFritz/decky-sony-headphones/releases/latest).
3. In Game Mode, open the Quick Access menu → **Decky** → **Settings** (gear icon) → **Developer**. Turn on **Developer mode**.
4. Choose **Install Plugin from ZIP** and select the downloaded file.
5. Pair and connect your headphones in **Settings → Bluetooth**.
6. Open the Quick Access menu → **Sony Headphones**. The first time, keep the panel open for a few seconds while the control channel connects.

## Update and uninstall

- **Update:** install the newer zip the same way. It replaces the old version.
- **Uninstall:** in Decky's plugin list, open the menu next to **Sony Headphones** and choose **Uninstall**. To also delete the leftover data:

  ```sh
  rm -r ~/homebrew/data/sony-headphones ~/.local/state/sony-headphones
  ```

## How it works

The plugin's backend talks to `sony-headphonesd` through its private socket at `/run/user/1000/sony-headphones/daemon.sock`.

- If a daemon is already running (for example the systemd service described below), the plugin uses that one.
- Otherwise it starts the daemon bundled in the zip and keeps it running while Decky is loaded. It restarts the daemon if it exits, and stops it when the plugin unloads.
- The bundled daemon is copied to `~/homebrew/data/sony-headphones/bin/` and runs from there.
- Everything runs as the `deck` user. Nothing needs root after Decky's normal plugin install.

## Optional: use it in Desktop Mode too

The bundled daemon runs only while Decky is running, which is always the case in Game Mode. To also use the daemon from Desktop Mode, for scripts or the `sony-headphonesctl` command, install it as a user service. The plugin detects the running service and uses it instead of its own copy.

Build it as described in [Build from source](#build-from-source), then run these on the Deck, outside the distrobox:

```sh
./scripts/install.sh
systemctl --user enable --now sony-headphones.service
```

`install.sh` writes only to `~/.local/bin` and `~/.config/systemd/user`. The CLI then works from Konsole:

```text
sony-headphonesctl status
sony-headphonesctl noise off|anc|ambient
sony-headphonesctl ambient-level 1..20
sony-headphonesctl focus-on-voice on|off
sony-headphonesctl speak-to-chat on|off
sony-headphonesctl dsee on|off
sony-headphonesctl eq-preset <reported-preset>
sony-headphonesctl connection quality|stable
sony-headphonesctl volume 0..100
```

## Troubleshooting

- **"Waiting for service" or "sony-headphonesd is not running":** the backend retries automatically, so wait a few seconds. If it persists, check the logs in `~/homebrew/logs/sony-headphones/`, where `sony-headphonesd.log` holds the daemon's own output.
- **"Headphones are not synchronized yet":** the headphones are connected, but the control channel is still starting. Keep the panel open for a few seconds.
- **Controls never appear:** make sure the headphones are connected in **Settings → Bluetooth**, and that Sony's phone app isn't holding the control connection. Close the app or turn off Bluetooth on the phone.
- **The daemon fails with `GLIBC ... not found`:** a SteamOS update or a build from a different container doesn't match the bundled binary. Rebuild it as described below, or install a newer release.

## Build from source

SteamOS's system files are read-only and it has no build tools, so build inside an **Arch Linux** [distrobox](https://github.com/89luca89/distrobox). This is the setup the releases are made with. Distrobox shares your home folder, so the build ends up on the Deck itself.

Inside the distrobox, install the dependencies from [Development](docs/DEVELOPMENT.md), along with Node.js and `pnpm` for the panel, then run:

```sh
git clone https://github.com/ChesterFritz/decky-sony-headphones.git
cd decky-sony-headphones
./scripts/build.sh            # the daemon: build/native/sony-headphonesd

cd decky
pnpm install
pnpm build                    # the panel: dist/index.js
./scripts/package.sh          # the release zip: out/sony-headphones-decky-v<version>.zip
```

Then, on the Deck outside the distrobox, install your build into Decky:

```sh
sudo ./install.sh             # run from the decky/ folder
```

`package.sh` refuses to package a daemon that links libraries missing on the system it runs on. See [decky/README.md](decky/README.md) for plugin development details.

## Safety and limitations

The daemon runs as an unprivileged user. Its state and socket directories are private, and the public state omits the Bluetooth address. The plugin backend only forwards an allow-listed set of commands to the daemon.

The project doesn't implement firmware flashing, 360 Reality Audio, Sony account or cloud functions, location tracking, or factory reset. Read [SECURITY.md](SECURITY.md) before using real-device write commands.

## Other Linux desktops

This fork focuses on the Steam Deck. For Arch, Omarchy (including its Quattro bar widget) and other desktops, see the upstream project, [sony-headphones-linux](https://github.com/VyomJain6904/sony-headphones-linux). Its [integration guide](docs/INTEGRATION.md) covers Waybar, Polybar, KDE Plasma, GNOME Shell and more.

## Documentation

- [Compatibility evidence](docs/COMPATIBILITY.md)
- [Development and testing](docs/DEVELOPMENT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Public specification](SPEC.md)
- [Third-party sources and licenses](THIRD_PARTY.md)

## License and affiliation

MIT licensed. The daemon is from [sony-headphones-linux](https://github.com/VyomJain6904/sony-headphones-linux) by Vyom Jain, and it bundles [libmdr](https://github.com/mos9527/SonyHeadphonesClient) and [fmt](https://github.com/fmtlib/fmt), both MIT. Their licences are included in the release zip under `licenses/`.

This project is independent and unofficial, and is not affiliated with or endorsed by Sony or Valve. Sony, Sony | Sound Connect, Steam and Steam Deck are trademarks of their respective owners.
