"""Decky backend: bridges the Quick Access panel to sony-headphonesd.

Talks to the daemon's private Unix socket directly (same one-line protocol
sony-headphonesctl uses), including for status, so a dead daemon is never shown as live.
Runs as the Decky user (no "root" flag), so the daemon's 0700 dirs are reachable.

The release zip bundles the daemon in bin/. If no daemon is already answering (for
example a user-installed sony-headphones.service), the backend runs the bundled copy
for as long as the plugin is loaded, restarting it if it exits.
"""

import asyncio
import hashlib
import json
import os
import re
import shutil
import socket

import decky

_WORD = re.compile(r"^[A-Za-z0-9_.-]{1,64}$")
_ALLOWED_VERBS = {
    "panel-open", "panel-close", "refresh",
    "noise", "ambient-level", "focus-on-voice", "speak-to-chat", "dsee",
    "eq-preset", "connection", "volume",
}


def _socket_path() -> str:
    # The daemon runs as a systemd --user service, so XDG_RUNTIME_DIR is /run/user/<uid>.
    # Decky's environment usually lacks XDG_RUNTIME_DIR, so derive it from our uid.
    runtime = os.environ.get("XDG_RUNTIME_DIR") or f"/run/user/{os.getuid()}"
    return os.path.join(runtime, "sony-headphones", "daemon.sock")


def _request(words: list[str]) -> str:
    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as sock:
        sock.settimeout(3.0)
        sock.connect(_socket_path())
        sock.sendall((" ".join(words) + "\n").encode())
        sock.shutdown(socket.SHUT_WR)
        chunks = []
        while True:
            chunk = sock.recv(8192)
            if not chunk:
                break
            chunks.append(chunk)
    return b"".join(chunks).decode(errors="replace").strip()


def _daemon_alive() -> bool:
    try:
        return _request(["status"]).startswith("ok ")
    except OSError:
        return False


def _decky_path(name: str, fallback: str) -> str:
    return getattr(decky, name, None) or fallback


_PLUGIN_DIR = _decky_path("DECKY_PLUGIN_DIR", os.path.dirname(os.path.abspath(__file__)))
_RUNTIME_DIR = _decky_path("DECKY_PLUGIN_RUNTIME_DIR", os.path.join(_PLUGIN_DIR, "runtime"))
_LOG_DIR = _decky_path("DECKY_PLUGIN_LOG_DIR", _RUNTIME_DIR)
_DAEMON = "sony-headphonesd"
_LOG_LIMIT = 1024 * 1024


def _sha256(path: str) -> str:
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for block in iter(lambda: handle.read(1 << 20), b""):
            digest.update(block)
    return digest.hexdigest()


def _prepare_daemon() -> str | None:
    """Copy the bundled daemon somewhere the Decky user owns and mark it executable.

    Plugin files are root-owned and Decky's zip install may drop the executable bit,
    so the bundled file itself can't be relied on to run.
    """
    bundled = os.path.join(_PLUGIN_DIR, "bin", _DAEMON)
    if not os.path.isfile(bundled):
        return None
    target_dir = os.path.join(_RUNTIME_DIR, "bin")
    target = os.path.join(target_dir, _DAEMON)
    if not os.path.isfile(target) or _sha256(target) != _sha256(bundled):
        os.makedirs(target_dir, mode=0o700, exist_ok=True)
        temporary = target + ".new"
        shutil.copyfile(bundled, temporary)
        os.chmod(temporary, 0o755)
        os.replace(temporary, target)
    return target


def _daemon_env() -> dict:
    env = dict(os.environ)
    env["HOME"] = _decky_path("DECKY_USER_HOME", os.path.expanduser("~"))
    env["XDG_RUNTIME_DIR"] = os.path.dirname(os.path.dirname(_socket_path()))
    return env


def _open_log():
    os.makedirs(_LOG_DIR, exist_ok=True)
    path = os.path.join(_LOG_DIR, "sony-headphonesd.log")
    mode = "wb" if os.path.exists(path) and os.path.getsize(path) > _LOG_LIMIT else "ab"
    return open(path, mode)


def _send_blocking(words: list[str]) -> dict:
    response = _request(words)
    if response == "ok" or response.startswith("ok "):
        return {"ok": True, "error": ""}
    if response.startswith("error "):
        return {"ok": False, "error": response[6:]}
    return {"ok": False, "error": "Malformed daemon response"}


def _status_blocking() -> dict:
    # Ask the daemon directly rather than reading status.json: a crashed daemon leaves
    # that file behind, which would keep showing a stale "Connected" state.
    response = _request(["status"])
    if response.startswith("ok "):
        return {"ok": True, "status": json.loads(response[3:]), "error": ""}
    if response.startswith("error "):
        return {"ok": False, "status": None, "error": response[6:]}
    return {"ok": False, "status": None, "error": "Malformed daemon response"}


class Plugin:
    _supervisor: asyncio.Task | None = None
    _process: asyncio.subprocess.Process | None = None

    async def status(self) -> dict:
        try:
            return await asyncio.to_thread(_status_blocking)
        except (FileNotFoundError, ConnectionRefusedError):
            return {"ok": False, "status": None, "error": "sony-headphonesd is not running"}
        except ValueError as exc:
            return {"ok": False, "status": None, "error": f"Invalid status from daemon: {exc}"}
        except OSError as exc:
            return {"ok": False, "status": None,
                    "error": f"Could not contact sony-headphonesd: {exc}"}

    async def command(self, words: list) -> dict:
        if (not isinstance(words, list) or not 1 <= len(words) <= 2
                or not all(isinstance(w, str) and _WORD.match(w) for w in words)
                or words[0] not in _ALLOWED_VERBS):
            return {"ok": False, "error": "Rejected command"}
        try:
            return await asyncio.to_thread(_send_blocking, [str(w) for w in words])
        except (FileNotFoundError, ConnectionRefusedError):
            return {"ok": False, "error": "sony-headphonesd is not running"}
        except OSError as exc:
            return {"ok": False, "error": f"Could not contact sony-headphonesd: {exc}"}

    async def _supervise(self):
        delay = 2
        while True:
            if await asyncio.to_thread(_daemon_alive):
                # Another daemon (e.g. the user's systemd service) is serving; don't compete.
                delay = 2
                await asyncio.sleep(10)
                continue
            try:
                daemon = await asyncio.to_thread(_prepare_daemon)
            except OSError as exc:
                decky.logger.error("Could not prepare the bundled daemon: %s", exc)
                daemon = None
            if daemon is None:
                decky.logger.warning("No daemon is running and none is bundled; waiting")
                await asyncio.sleep(30)
                continue
            with _open_log() as log:
                self._process = await asyncio.create_subprocess_exec(
                    daemon, stdin=asyncio.subprocess.DEVNULL, stdout=log, stderr=log,
                    env=_daemon_env(), start_new_session=True)
            decky.logger.info("Started bundled %s (pid %d)", _DAEMON, self._process.pid)
            code = await self._process.wait()
            self._process = None
            decky.logger.warning("Bundled %s exited with code %s; retrying in %ds",
                                 _DAEMON, code, delay)
            await asyncio.sleep(delay)
            delay = min(delay * 2, 60)

    async def _main(self):
        decky.logger.info("Sony Headphones backend loaded; socket %s", _socket_path())
        self._supervisor = asyncio.create_task(self._supervise())

    async def _unload(self):
        # Never leave the control session pinned open, so Sony's phone app can reconnect.
        try:
            await asyncio.to_thread(_send_blocking, ["panel-close"])
        except OSError:
            pass
        if self._supervisor:
            self._supervisor.cancel()
            self._supervisor = None
        process, self._process = self._process, None
        if process and process.returncode is None:
            # Only the daemon this plugin started is stopped; a systemd service is left alone.
            process.terminate()
            try:
                await asyncio.wait_for(process.wait(), 5)
            except asyncio.TimeoutError:
                process.kill()
                await process.wait()

    async def _uninstall(self):
        pass
