const manifest = {"name":"Sony Headphones"};
const API_VERSION = 2;
const internalAPIConnection = window.__DECKY_SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_deckyLoaderAPIInit;
if (!internalAPIConnection) {
    throw new Error('[@decky/api]: Failed to connect to the loader as as the loader API was not initialized. This is likely a bug in Decky Loader.');
}
let api;
try {
    api = internalAPIConnection.connect(API_VERSION, manifest.name);
}
catch {
    api = internalAPIConnection.connect(1, manifest.name);
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version 1. Some features may not work.`);
}
if (api._version != API_VERSION) {
    console.warn(`[@decky/api] Requested API version ${API_VERSION} but the running loader only supports version ${api._version}. Some features may not work.`);
}
const callable = api.callable;
const useQuickAccessVisible = api.useQuickAccessVisible;
const definePlugin = (fn) => {
    return (...args) => {
        return fn(...args);
    };
};

var DefaultContext = {
  color: undefined,
  size: undefined,
  className: undefined,
  style: undefined,
  attr: undefined
};
var IconContext = SP_REACT.createContext && /*#__PURE__*/SP_REACT.createContext(DefaultContext);

var _excluded = ["attr", "size", "title"];
function _objectWithoutProperties(e, t) { if (null == e) return {}; var o, r, i = _objectWithoutPropertiesLoose(e, t); if (Object.getOwnPropertySymbols) { var n = Object.getOwnPropertySymbols(e); for (r = 0; r < n.length; r++) o = n[r], -1 === t.indexOf(o) && {}.propertyIsEnumerable.call(e, o) && (i[o] = e[o]); } return i; }
function _objectWithoutPropertiesLoose(r, e) { if (null == r) return {}; var t = {}; for (var n in r) if ({}.hasOwnProperty.call(r, n)) { if (-1 !== e.indexOf(n)) continue; t[n] = r[n]; } return t; }
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), true).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function Tree2Element(tree) {
  return tree && tree.map((node, i) => /*#__PURE__*/SP_REACT.createElement(node.tag, _objectSpread({
    key: i
  }, node.attr), Tree2Element(node.child)));
}
function GenIcon(data) {
  return props => /*#__PURE__*/SP_REACT.createElement(IconBase, _extends({
    attr: _objectSpread({}, data.attr)
  }, props), Tree2Element(data.child));
}
function IconBase(props) {
  var elem = conf => {
    var attr = props.attr,
      size = props.size,
      title = props.title,
      svgProps = _objectWithoutProperties(props, _excluded);
    var computedSize = size || conf.size || "1em";
    var className;
    if (conf.className) className = conf.className;
    if (props.className) className = (className ? className + " " : "") + props.className;
    return /*#__PURE__*/SP_REACT.createElement("svg", _extends({
      stroke: "currentColor",
      fill: "currentColor",
      strokeWidth: "0"
    }, conf.attr, attr, svgProps, {
      className: className,
      style: _objectSpread(_objectSpread({
        color: props.color || conf.color
      }, conf.style), props.style),
      height: computedSize,
      width: computedSize,
      xmlns: "http://www.w3.org/2000/svg"
    }), title && /*#__PURE__*/SP_REACT.createElement("title", null, title), props.children);
  };
  return IconContext !== undefined ? /*#__PURE__*/SP_REACT.createElement(IconContext.Consumer, null, conf => elem(conf)) : elem(DefaultContext);
}

// THIS FILE IS AUTO GENERATED
function FaHeadphones (props) {
  return GenIcon({"attr":{"viewBox":"0 0 512 512"},"child":[{"tag":"path","attr":{"d":"M256 32C114.52 32 0 146.496 0 288v48a32 32 0 0 0 17.689 28.622l14.383 7.191C34.083 431.903 83.421 480 144 480h24c13.255 0 24-10.745 24-24V280c0-13.255-10.745-24-24-24h-24c-31.342 0-59.671 12.879-80 33.627V288c0-105.869 86.131-192 192-192s192 86.131 192 192v1.627C427.671 268.879 399.342 256 368 256h-24c-13.255 0-24 10.745-24 24v176c0 13.255 10.745 24 24 24h24c60.579 0 109.917-48.098 111.928-108.187l14.382-7.191A32 32 0 0 0 512 336v-48c0-141.479-114.496-256-256-256z"},"child":[]}]})(props);
}

const getStatus = callable("status");
const sendCommand = callable("command");
// ---- Labels (mirrors the upstream Model.js) ----------------------------------
const PHASES = {
    discovering: "Discovering", connecting: "Connecting", syncing: "Synchronizing",
    ready: "Connected", error: "Connection error",
};
const PRESETS = {
    off: "Off", rock: "Rock", pop: "Pop", jazz: "Jazz", dance: "Dance", edm: "EDM",
    r_and_b_hip_hop: "R&B / Hip-Hop", acoustic: "Acoustic", bright: "Bright", excited: "Excited",
    mellow: "Mellow", relaxed: "Relaxed", vocal: "Vocal", treble: "Treble Boost", bass: "Bass Boost",
    speech: "Speech", heavy: "Heavy", clear: "Clear", hard: "Hard", soft: "Soft", gaming: "Gaming",
    fps_1: "FPS 1", fps_2: "FPS 2", fps_3: "FPS 3", custom: "Custom",
    user_1: "User 1", user_2: "User 2", user_3: "User 3", user_4: "User 4", user_5: "User 5",
};
const CODECS = {
    sbc: "SBC", aac: "AAC", ldac: "LDAC", aptx: "aptX", aptx_hd: "aptX HD", lc3: "LC3",
};
function batteryText(b) {
    const level = b.level < 0 ? "--" : `${b.level}%`;
    if (b.charging === "yes")
        return `${level} · Charging`;
    if (b.charging === "complete")
        return `${level} · Charged`;
    return level;
}
// ---- Hooks -------------------------------------------------------------------
const POLL_MS = 1000;
const SETTLE_MS = 1500; // keep a just-set slider value until the device echoes it
/** Holds the control session open and polls status only while the QAM is visible. */
function useHeadphones(active) {
    const [status, setStatus] = SP_REACT.useState(null);
    const [error, setError] = SP_REACT.useState("");
    SP_REACT.useEffect(() => {
        if (!active)
            return;
        let cancelled = false;
        let timer;
        const poll = async () => {
            try {
                const res = await getStatus();
                if (cancelled)
                    return;
                setStatus(res.status);
                setError(res.ok ? "" : res.error);
            }
            catch (e) {
                if (!cancelled)
                    setError(String(e));
            }
            if (!cancelled)
                timer = setTimeout(poll, POLL_MS);
        };
        sendCommand(["panel-open"]).then((res) => {
            if (!cancelled && !res.ok)
                setError(res.error);
        });
        poll();
        return () => {
            cancelled = true;
            if (timer)
                clearTimeout(timer);
            // Release RFCOMM (after the daemon's idle delay) so Sony's phone app can reconnect.
            sendCommand(["panel-close"]);
        };
    }, [active]);
    return { status, error, setError };
}
/** A slider value that follows the device but doesn't snap back mid-adjustment. */
function useSettledValue(remote, send) {
    const [local, setLocal] = SP_REACT.useState(null);
    const sendTimer = SP_REACT.useRef(undefined);
    const settleTimer = SP_REACT.useRef(undefined);
    SP_REACT.useEffect(() => () => {
        clearTimeout(sendTimer.current);
        clearTimeout(settleTimer.current);
    }, []);
    const onChange = SP_REACT.useCallback((v) => {
        setLocal(v);
        clearTimeout(sendTimer.current);
        clearTimeout(settleTimer.current);
        sendTimer.current = setTimeout(() => {
            send(v);
            settleTimer.current = setTimeout(() => setLocal(null), SETTLE_MS);
        }, 200);
    }, [send]);
    return [local ?? remote, onChange];
}
// ---- UI ----------------------------------------------------------------------
function Controls({ status, run }) {
    const caps = status.capabilities;
    const [ambient, setAmbient] = useSettledValue(status.noise.ambient_level, SP_REACT.useCallback((v) => run(["ambient-level", String(v)]), [run]));
    const [volume, setVolume] = useSettledValue(status.playback.volume, SP_REACT.useCallback((v) => run(["volume", String(v)]), [run]));
    const noiseOptions = [
        { data: "off", label: "Off" },
        ...(caps.noise_cancelling ? [{ data: "anc", label: "Noise cancelling" }] : []),
        ...(caps.ambient_sound ? [{ data: "ambient", label: "Ambient sound" }] : []),
    ];
    const presets = status.equalizer.available_presets;
    const batteries = ["main", "left", "right", "case"]
        .filter((k) => status.battery[k].present)
        .map((k) => ({ key: k, label: { main: "Battery", left: "Left", right: "Right", case: "Case" }[k] }));
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: "Status", children: [batteries.map(({ key, label }) => (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: label, focusable: false, children: batteryText(status.battery[key]) }) }, key))), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: "Codec", focusable: false, children: CODECS[status.device.codec] ?? "Unknown" }) })] }), (caps.noise_cancelling || caps.ambient_sound) && (SP_JSX.jsxs(DFL.PanelSection, { title: "Noise control", children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Mode", rgOptions: noiseOptions, selectedOption: status.noise.mode, onChange: (o) => run(["noise", o.data]) }) }), caps.ambient_sound && status.noise.mode === "ambient" && (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Ambient level", value: ambient, min: 1, max: 20, step: 1, showValue: true, onChange: setAmbient }) }), SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Focus on voice", checked: status.noise.focus_on_voice, onChange: (on) => run(["focus-on-voice", on ? "on" : "off"]) }) })] })), caps.speak_to_chat && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "Speak-to-Chat", checked: status.speak_to_chat.enabled, onChange: (on) => run(["speak-to-chat", on ? "on" : "off"]) }) }))] })), (presets.length > 0 || caps.equalizer || caps.dsee || caps.playback_volume) && (SP_JSX.jsxs(DFL.PanelSection, { title: "Sound", children: [caps.playback_volume && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.SliderField, { label: "Headphone volume", value: volume, min: 0, max: 100, step: 1, showValue: true, onChange: setVolume }) })), presets.length === 0 && caps.equalizer && status.equalizer.preset !== "unknown" && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: "Equalizer", focusable: false, children: PRESETS[status.equalizer.preset] ?? status.equalizer.preset }) })), presets.length > 0 && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Equalizer", rgOptions: presets.map((p) => ({ data: p, label: PRESETS[p] ?? p })), selectedOption: status.equalizer.preset, onChange: (o) => run(["eq-preset", o.data]) }) })), caps.dsee && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ToggleField, { label: "DSEE", checked: status.equalizer.dsee_enabled, onChange: (on) => run(["dsee", on ? "on" : "off"]) }) }))] })), caps.connection_mode && (SP_JSX.jsx(DFL.PanelSection, { title: "Connection", children: SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.DropdownItem, { label: "Priority", rgOptions: [
                            { data: "quality", label: "Sound quality" },
                            { data: "stable", label: "Stable connection" },
                        ], selectedOption: status.connection.priority, onChange: (o) => run(["connection", o.data]) }) }) }))] }));
}
function Content() {
    const visible = useQuickAccessVisible();
    const { status, error, setError } = useHeadphones(visible);
    const run = SP_REACT.useCallback((words) => {
        sendCommand(words).then((res) => setError(res.ok ? "" : res.error));
    }, [setError]);
    const ready = status?.connected && status.phase === "ready";
    const title = status?.device.model || status?.device.name || "Sony Headphones";
    const shownError = error || status?.last_error || "";
    return (SP_JSX.jsxs(SP_JSX.Fragment, { children: [SP_JSX.jsxs(DFL.PanelSection, { title: title, children: [SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.Field, { label: "State", focusable: false, children: status ? PHASES[status.phase] ?? "Idle" : "Waiting for service" }) }), shownError && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { color: "#ff8a80", fontSize: "12px", padding: "4px 0", wordBreak: "break-word" }, children: shownError }) })), !ready && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx("div", { style: { fontSize: "12px", opacity: 0.7, padding: "4px 0" }, children: "Connect your headphones over Bluetooth, then keep this panel open while the control channel initializes." }) })), ready && (SP_JSX.jsx(DFL.PanelSectionRow, { children: SP_JSX.jsx(DFL.ButtonItem, { layout: "below", onClick: () => run(["refresh"]), children: "Refresh" }) }))] }), ready && status && SP_JSX.jsx(Controls, { status: status, run: run })] }));
}
var index = definePlugin(() => ({
    name: "Sony Headphones",
    titleView: SP_JSX.jsx("div", { className: DFL.staticClasses.Title, children: "Sony Headphones" }),
    content: SP_JSX.jsx(Content, {}),
    icon: SP_JSX.jsx(FaHeadphones, {}),
    onDismount() {
        sendCommand(["panel-close"]);
    },
}));

export { index as default };
//# sourceMappingURL=index.js.map
