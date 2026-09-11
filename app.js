// open entrainer
// One file, no dependencies. Two oscillators a beat apart, pink noise under
// them, a three phase plan for the beat, and a canvas that draws the plan.

const STORAGE_KEY = "open-entrainer";
const MAP_RANGE_HZ = 45; // half width of the canvas in hertz of beat
const BANDS = [
  [4, "Delta"],
  [8, "Theta"],
  [13, "Alpha"],
  [30, "Beta"],
  [Infinity, "Gamma"],
];

const $ = (id) => document.getElementById(id);

const ui = {
  map: $("map"),
  state: $("state"),
  clock: $("clock"),
  band: $("band"),
  beat: $("beat"),
  freqL: $("freq-l"),
  freqR: $("freq-r"),
  play: $("btn-play"),
  pause: $("btn-pause"),
  stop: $("btn-stop"),
  tIn: $("t-in"),
  tHold: $("t-hold"),
  tOut: $("t-out"),
  tEnd: $("t-end"),
  total: $("total"),
  dStart: $("d-start"),
  dTarget: $("d-target"),
  dEnd: $("d-end"),
  base: $("base"),
  volTone: $("vol-tone"),
  volNoise: $("vol-noise"),
  valStart: $("val-start"),
  valTarget: $("val-target"),
  valEnd: $("val-end"),
  valBase: $("val-base"),
  valTone: $("val-tone"),
  valNoise: $("val-noise"),
};

const plan = { tIn: 0, tHold: 0, tOut: 0, total: 0, start: 40, target: 4.4, end: 10 };
const session = { playing: false, paused: false, elapsed: 0, lastFrame: 0, frame: 0 };
const audio = { ctx: null, oscL: null, oscR: null, gainL: null, gainR: null, noise: null, noiseGain: null };
const ctx = ui.map.getContext("2d");
let mapW = 0;
let mapH = 0;

// Plan

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Logarithmic interpolation with soft ends: equal ratios feel like equal
// steps, and the cubic ease removes the corners at both ends.
function glide(a, b, t) {
  const sa = Math.max(0.1, a);
  const sb = Math.max(0.1, b);
  return sa * Math.pow(sb / sa, easeInOutCubic(Math.min(1, Math.max(0, t))));
}

function beatAt(t) {
  if (t <= plan.tIn) return glide(plan.start, plan.target, t / plan.tIn);
  if (t <= plan.tIn + plan.tHold) return plan.target;
  if (t <= plan.total) return glide(plan.target, plan.end, (t - plan.tIn - plan.tHold) / plan.tOut);
  return plan.end;
}

function bandOf(hz) {
  return BANDS.find(([limit]) => hz < limit)[1];
}

// Settings

const FIELDS = ["tIn", "tHold", "tOut", "dStart", "dTarget", "dEnd", "base", "volTone", "volNoise"];

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    for (const key of FIELDS) {
      if (typeof saved[key] === "number") ui[key].value = saved[key];
    }
  } catch {
    // Storage may be unavailable; the defaults in the HTML are fine.
  }
}

function save() {
  try {
    const out = {};
    for (const key of FIELDS) out[key] = parseFloat(ui[key].value);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(out));
  } catch {
    // Ignore; the session works without persistence.
  }
}

function minutes(input, fallback) {
  const v = parseInt(input.value, 10);
  return Number.isFinite(v) && v >= 1 ? v : fallback;
}

function readPlan() {
  plan.tIn = minutes(ui.tIn, 1) * 60;
  plan.tHold = minutes(ui.tHold, 1) * 60;
  plan.tOut = minutes(ui.tOut, 1) * 60;
  plan.total = plan.tIn + plan.tHold + plan.tOut;
  plan.start = parseFloat(ui.dStart.value);
  plan.target = parseFloat(ui.dTarget.value);
  plan.end = parseFloat(ui.dEnd.value);
}

function render() {
  ui.valStart.textContent = `${plan.start.toFixed(1)} Hz`;
  ui.valTarget.textContent = `${plan.target.toFixed(1)} Hz`;
  ui.valEnd.textContent = `${plan.end.toFixed(1)} Hz`;
  ui.valBase.textContent = `${ui.base.value} Hz`;
  ui.valTone.textContent = `${ui.volTone.value}%`;
  ui.valNoise.textContent = `${ui.volNoise.value}%`;
  ui.total.textContent = `${Math.round(plan.total / 60)} min`;
  renderClock();
  if (!session.playing && !session.paused) renderBeat(beatAt(0));
}

function renderClock() {
  const m = Math.floor(session.elapsed / 60);
  const s = Math.floor(session.elapsed % 60);
  const tm = Math.round(plan.total / 60);
  ui.clock.textContent = `${pad(m)}:${pad(s)} / ${pad(tm)}:00`;
}

function renderBeat(hz) {
  const base = parseInt(ui.base.value, 10);
  ui.band.textContent = bandOf(hz);
  ui.beat.textContent = `${hz.toFixed(1)} Hz`;
  ui.freqL.textContent = (base - hz / 2).toFixed(1);
  ui.freqR.textContent = (base + hz / 2).toFixed(1);
}

function pad(n) {
  return String(n).padStart(2, "0");
}

// End time: shown as the clock time the session would finish if started now;
// editing it stretches or shrinks the hold to land there.

function showEndTime() {
  const end = new Date(Date.now() + plan.total * 1000);
  ui.tEnd.value = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
}

function applyEndTime() {
  if (!ui.tEnd.value) return;
  const [h, m] = ui.tEnd.value.split(":").map(Number);
  const now = new Date();
  const end = new Date();
  end.setHours(h, m, 0, 0);
  if (end <= now) end.setDate(end.getDate() + 1);
  const totalMin = Math.round((end - now) / 60000);
  const hold = totalMin - minutes(ui.tIn, 1) - minutes(ui.tOut, 1);
  ui.tHold.value = Math.max(1, hold);
  update(false);
}

function update(recomputeEnd = true) {
  readPlan();
  render();
  if (recomputeEnd) showEndTime();
  applyVolumes();
  draw();
  save();
}

// Audio

function pinkNoiseBuffer(ac, seconds) {
  // Paul Kellet's filter: white noise through seven leaky integrators gives a
  // spectrum that falls at 3 dB per octave, which is pink.
  const n = ac.sampleRate * seconds;
  const buffer = ac.createBuffer(1, n, ac.sampleRate);
  const data = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < n; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

function startAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  const ac = new AC();
  const merger = ac.createChannelMerger(2);
  merger.connect(ac.destination);

  audio.oscL = ac.createOscillator();
  audio.oscR = ac.createOscillator();
  audio.gainL = ac.createGain();
  audio.gainR = ac.createGain();
  audio.gainL.gain.value = 0;
  audio.gainR.gain.value = 0;
  audio.oscL.connect(audio.gainL).connect(merger, 0, 0);
  audio.oscR.connect(audio.gainR).connect(merger, 0, 1);

  audio.noise = ac.createBufferSource();
  audio.noise.buffer = pinkNoiseBuffer(ac, 5);
  audio.noise.loop = true;
  audio.noiseGain = ac.createGain();
  audio.noiseGain.gain.value = 0;
  audio.noise.connect(audio.noiseGain);
  audio.noiseGain.connect(merger, 0, 0);
  audio.noiseGain.connect(merger, 0, 1);

  audio.ctx = ac;
  setFrequencies(beatAt(session.elapsed), 0);
  audio.oscL.start();
  audio.oscR.start();
  audio.noise.start();
  applyVolumes();
}

function stopAudio() {
  if (!audio.ctx) return;
  const ac = audio.ctx;
  audio.ctx = null;
  const t = ac.currentTime;
  for (const g of [audio.gainL, audio.gainR, audio.noiseGain]) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(g.gain.value, t);
    g.gain.linearRampToValueAtTime(0, t + 0.3);
  }
  setTimeout(() => ac.close(), 400);
}

function applyVolumes() {
  if (!audio.ctx) return;
  const t = audio.ctx.currentTime;
  const tone = (parseInt(ui.volTone.value, 10) / 100) * 0.5;
  const noise = (parseInt(ui.volNoise.value, 10) / 100) * 0.25;
  audio.gainL.gain.setTargetAtTime(tone, t, 0.1);
  audio.gainR.gain.setTargetAtTime(tone, t, 0.1);
  audio.noiseGain.gain.setTargetAtTime(noise, t, 0.1);
}

function setFrequencies(hz, smoothing = 0.05) {
  if (!audio.ctx) return;
  const base = parseInt(ui.base.value, 10);
  const t = audio.ctx.currentTime;
  if (smoothing === 0) {
    audio.oscL.frequency.setValueAtTime(base - hz / 2, t);
    audio.oscR.frequency.setValueAtTime(base + hz / 2, t);
  } else {
    audio.oscL.frequency.setTargetAtTime(base - hz / 2, t, smoothing);
    audio.oscR.frequency.setTargetAtTime(base + hz / 2, t, smoothing);
  }
}

// Transport

function setState(label) {
  ui.state.textContent = label;
  ui.play.disabled = session.playing;
  ui.pause.disabled = !session.playing;
  ui.stop.disabled = !session.playing && !session.paused;
  ui.play.textContent = session.paused ? "Resume" : "Start";
}

function play() {
  if (session.playing) return;
  if (!session.paused) {
    session.elapsed = 0;
    showEndTime();
  }
  if (!audio.ctx) startAudio();
  else if (audio.ctx.state === "suspended") audio.ctx.resume();
  session.playing = true;
  session.paused = false;
  session.lastFrame = performance.now();
  setState("Running");
  session.frame = requestAnimationFrame(loop);
}

function pause() {
  if (!session.playing) return;
  session.playing = false;
  session.paused = true;
  cancelAnimationFrame(session.frame);
  if (audio.ctx) audio.ctx.suspend();
  setState("Paused");
}

function stop(label = "Ready") {
  session.playing = false;
  session.paused = false;
  session.elapsed = 0;
  cancelAnimationFrame(session.frame);
  stopAudio();
  setState(label);
  render();
  draw();
}

function loop(now) {
  if (!session.playing) return;
  session.elapsed += (now - session.lastFrame) / 1000;
  session.lastFrame = now;
  if (session.elapsed >= plan.total) {
    stop("Finished");
    return;
  }
  const hz = beatAt(session.elapsed);
  setFrequencies(hz);
  renderBeat(hz);
  renderClock();
  draw();
  session.frame = requestAnimationFrame(loop);
}

// Map: time runs top to bottom, the beat is the width of a band around the
// center line. Band boundaries sit as faint vertical lines with hertz labels
// along the bottom, so the trace can be read without color.

function colors() {
  const s = getComputedStyle(ui.map);
  return {
    bg: s.backgroundColor,
    text: s.color,
    border: s.borderTopColor,
    muted: s.outlineColor,
  };
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  mapW = ui.map.clientWidth;
  mapH = ui.map.clientHeight;
  ui.map.width = Math.round(mapW * dpr);
  ui.map.height = Math.round(mapH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

function draw() {
  if (!mapW || !mapH) return;
  const c = colors();
  const pxPerHz = mapW / (MAP_RANGE_HZ * 2);
  const cx = mapW / 2;

  ctx.fillStyle = c.bg;
  ctx.fillRect(0, 0, mapW, mapH);

  // Band boundaries, mirrored around the center.
  ctx.strokeStyle = c.border;
  ctx.lineWidth = 1;
  for (const [limit] of BANDS) {
    if (!Number.isFinite(limit)) continue;
    const dx = (limit / 2) * pxPerHz;
    for (const x of [cx - dx, cx + dx]) {
      ctx.beginPath();
      ctx.moveTo(Math.round(x) + 0.5, 0);
      ctx.lineTo(Math.round(x) + 0.5, mapH);
      ctx.stroke();
    }
  }

  // Phase boundaries, dashed.
  ctx.strokeStyle = c.muted;
  ctx.setLineDash([4, 4]);
  for (const t of [plan.tIn, plan.tIn + plan.tHold]) {
    const y = Math.round((t / plan.total) * mapH) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(mapW, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // The beat: a filled band between the two tones, with its edges drawn.
  ctx.fillStyle = c.border;
  ctx.beginPath();
  for (let y = 0; y <= mapH; y++) {
    const dx = (beatAt((y / mapH) * plan.total) / 2) * pxPerHz;
    ctx.lineTo(cx - dx, y);
  }
  for (let y = mapH; y >= 0; y--) {
    const dx = (beatAt((y / mapH) * plan.total) / 2) * pxPerHz;
    ctx.lineTo(cx + dx, y);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = c.text;
  ctx.lineWidth = 1.5;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    for (let y = 0; y <= mapH; y++) {
      const dx = (beatAt((y / mapH) * plan.total) / 2) * pxPerHz;
      ctx.lineTo(cx + side * dx, y);
    }
    ctx.stroke();
  }

  // Progress: a line across the map at the current time.
  if (session.playing || session.paused) {
    const y = Math.round((session.elapsed / plan.total) * mapH) + 0.5;
    ctx.strokeStyle = c.text;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(mapW, y);
    ctx.stroke();
  }

  // Band boundary labels in hertz of beat, right side, drawn last so the
  // band fill cannot cover them.
  ctx.font = "11px system-ui, sans-serif";
  ctx.fillStyle = c.muted;
  ctx.textBaseline = "bottom";
  ctx.textAlign = "left";
  for (const [limit] of BANDS) {
    if (!Number.isFinite(limit)) continue;
    const x = cx + (limit / 2) * pxPerHz + 3;
    ctx.fillText(limit === 30 ? "30 Hz" : String(limit), x, mapH - 5);
  }
}

// Events

for (const key of FIELDS) {
  ui[key].addEventListener("input", () => update(true));
}
ui.tEnd.addEventListener("change", applyEndTime);
ui.play.addEventListener("click", play);
ui.pause.addEventListener("click", pause);
ui.stop.addEventListener("click", () => stop());

window.addEventListener("keydown", (e) => {
  if (e.code !== "Space") return;
  if (/^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName)) return;
  e.preventDefault();
  session.playing ? pause() : play();
});

window.addEventListener("resize", resize);
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);

load();
readPlan();
setState("Ready");
resize();
update(true);
