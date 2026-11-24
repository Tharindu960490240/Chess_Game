import ChessLibImport from '../js/engine.js';
import { Board3D, webglAvailable } from './board3d.js';
import { pieceUrl } from './pieces.js';
import { play as sfx, sound, unlock } from './sound.js';

const ChessLib = ChessLibImport.default || ChessLibImport;
const L = ChessLib();
const { Chess, sqName } = L;
const $ = s => document.querySelector(s);

const THEMES = {
  walnut: { name: 'Walnut', light: '#e9dcc3', dark: '#9b7350', frame: '#4a3222', label: 'rgba(240,226,200,0.85)' },
  slate: { name: 'Slate', light: '#dfe4ea', dark: '#6f7f96', frame: '#2b3442', label: 'rgba(225,232,242,0.85)' },
  tournament: { name: 'Tournament', light: '#eeeed2', dark: '#6f9452', frame: '#33402b', label: 'rgba(236,240,214,0.85)' },
  rosewood: { name: 'Rosewood', light: '#f0d9c8', dark: '#a0574d', frame: '#4a2622', label: 'rgba(245,220,205,0.85)' }
};
const LEVELS = {
  easy: { label: 'Easy', depth: 2, time: 300, randomness: 90 },
  medium: { label: 'Medium', depth: 3, time: 800, randomness: 6 },
  hard: { label: 'Hard', depth: 6, time: 1800, randomness: 0 }
};
const CLOCKS = { none: null, '3+2': [180, 2], '5+0': [300, 0], '10+0': [600, 0], '15+10': [900, 10] };
const VALUES = { P: 1, N: 3, B: 3, R: 5, Q: 9 };
const NAMES = { w: 'White', b: 'Black' };
const STORE = 'chess.save.v2';

/* ---------- persistent settings ---------- */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
};
const settings = Object.assign({ theme: 'walnut', legal: true, sound: true, autoFlip: false, }, store.get('chess.settings', {}));
sound.enabled = settings.sound;

/* ---------- state ---------- */
const S = {
  game: new Chess(),
  setup: { opponent: 'ai', level: 'medium', color: 'w', clock: 'none' },
  human: { w: true, b: false },
  positions: [],      // board snapshots, index = ply
  viewPly: null,      // null = live
  selected: null,
  targets: [],
  hint: null,
  over: null,         // {result, reason, title, detail}
  clock: null,        // {w, b, inc, running, last}
  aiReq: 0,
  thinking: false,
  orientation: 'w'
};

/* ---------- 3D board ---------- */
const boardHost = $('#board');
const host3d = document.createElement('div'); host3d.className = 'view';
boardHost.prepend(host3d);
const ctrl = { pointerDown, pointerUp };
const noop = () => {};
let view = null;
if (webglAvailable()) {
  try { view = new Board3D(host3d, ctrl, THEMES[settings.theme]); } catch (e) { view = null; }
}
if (!view) {
  // the device can't draw 3D graphics: explain instead of showing an empty board
  $('#no3d').hidden = false;
  view = { setPosition: noop, setHighlights: noop, setOrientation: noop, setTheme: noop, resetCamera: noop };
}

/* ---------- helpers ---------- */
const live = () => S.viewPly === null;
const shownPly = () => live() ? S.game.history.length : S.viewPly;
const humanTurn = () => !S.over && S.human[S.game.turn];

function snapshot() { return S.game.board.slice(); }

function kingInCheckSq(board, turn) {
  const g = new Chess(); g.board = board.slice(); g.turn = turn;
  return g.inCheck(turn) ? g.kingSquare(turn) : null;
}

function pickableSet() {
  const s = new Set();
  if (!live() || !humanTurn() || S.thinking) return s;
  for (const m of S.game.moves()) s.add(m.from);
  return s;
}

/* ---------- rendering ---------- */
function render(animate = true) {
  const ply = shownPly();
  const board = S.positions[ply];
  if (!board) return;
  const rec = ply > 0 ? S.game.history[ply - 1] : null;
  const turn = ply % 2 === 0 ? firstTurn() : opposite(firstTurn());
  view.setPosition(board, animate);
  const targets = settings.legal ? S.targets : [];
  view.setHighlights({
    lastMove: rec ? { from: rec.from, to: rec.to } : null,
    selected: S.selected,
    targets: S.selected !== null ? targets : [],
    check: kingInCheckSq(board, turn),
    hint: live() ? S.hint : null,
    pickable: pickableSet(),
    interactive: live() && humanTurn()
  });
  renderPlayers(board);
  renderStatus();
  renderMoves();
  renderButtons();
  $('#review-banner').hidden = live();
  if (!live()) $('#review-text').textContent = ply === 0 ? 'Viewing the starting position' : `Viewing move ${Math.ceil(ply / 2)}${ply % 2 ? '' : '…'} ${rec.san}`;
}

function firstTurn() { return S.startTurn || 'w'; }
function opposite(c) { return c === 'w' ? 'b' : 'w'; }

function renderPlayers(board) {
  const bottom = S.orientation, top = opposite(bottom);
  fillPlayer($('#player-top'), top, board);
  fillPlayer($('#player-bottom'), bottom, board);
}

function fillPlayer(el, color, board) {
  const name = S.setup.opponent === 'ai' ? (S.human[color] ? 'You' : `Computer · ${LEVELS[S.setup.level].label}`) : `${NAMES[color]}`;
  el.querySelector('.p-name').textContent = name;
  el.querySelector('.p-side').style.backgroundImage = `url("${pieceUrl(color === 'w' ? 'K' : 'k')}")`;
  el.querySelector('.p-side').setAttribute('aria-label', NAMES[color]);
  // captured pieces = opponent's pieces missing from the board
  const start = { P: 8, N: 2, B: 2, R: 2, Q: 1 };
  const count = { w: { P: 0, N: 0, B: 0, R: 0, Q: 0 }, b: { P: 0, N: 0, B: 0, R: 0, Q: 0 } };
  let mat = { w: 0, b: 0 };
  for (const p of board) if (p) {
    const c = p === p.toUpperCase() ? 'w' : 'b', t = p.toUpperCase();
    if (t !== 'K') { count[c][t]++; mat[c] += VALUES[t]; }
  }
  const them = opposite(color);
  let html = '';
  for (const t of ['Q', 'R', 'B', 'N', 'P']) {
    const n = Math.max(0, start[t] - count[them][t]);
    if (!n) continue;
    html += '<span class="cap-group">';
    for (let i = 0; i < n; i++) html += `<i style="background-image:url('${pieceUrl(them === 'w' ? t : t.toLowerCase())}')"></i>`;
    html += '</span>';
  }
  const diff = mat[color] - mat[them];
  if (diff > 0) html += `<b class="adv">+${diff}</b>`;
  el.querySelector('.p-captured').innerHTML = html;
  const clk = el.querySelector('.clock');
  if (S.clock) {
    clk.hidden = false;
    clk.textContent = fmtTime(S.clock[color]);
    clk.classList.toggle('running', S.clock.running && S.game.turn === color && !S.over);
    clk.classList.toggle('low', S.clock[color] < 20000);
  } else clk.hidden = true;
  el.classList.toggle('to-move', !S.over && S.game.turn === color && live());
  el.querySelector('.p-thinking').hidden = !(S.thinking && S.game.turn === color);
}

function fmtTime(ms) {
  ms = Math.max(0, ms);
  if (ms < 10000) return (ms / 1000).toFixed(1);
  const s = Math.ceil(ms / 1000), m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

function renderStatus() {
  const t = $('#status-title'), d = $('#status-detail');
  if (S.over) { t.textContent = S.over.title; d.textContent = S.over.detail; }
  else {
    const st = S.game.status();
    const who = NAMES[S.game.turn];
    if (S.thinking) t.textContent = 'Computer is thinking';
    else if (S.setup.opponent === 'ai') t.textContent = S.human[S.game.turn] ? 'Your move' : 'Computer to move';
    else t.textContent = `${who} to move`;
    d.textContent = st.check ? `${who} is in check` : (S.game.history.length ? `Move ${S.game.fullmove}` : 'Drag a piece or tap it to see its moves');
  }
  $('#status').dataset.state = S.over ? 'over' : (S.game.inCheck() ? 'check' : 'play');
}

function renderMoves() {
  const ol = $('#moves');
  const h = S.game.history;
  const cur = shownPly();
  if (!h.length) { ol.innerHTML = '<li class="empty">Moves will appear here.</li>'; return; }
  let html = '';
  const offset = firstTurn() === 'b' ? 1 : 0;
  for (let i = -offset; i < h.length; i += 2) {
    const n = Math.floor((i + offset) / 2) + S.startMove;
    const a = i >= 0 ? h[i] : null, b = h[i + 1];
    html += `<li><span class="mv-n">${n}.</span>` +
      (a ? `<button class="mv${cur === i + 1 ? ' cur' : ''}" data-ply="${i + 1}">${fig(a.san, 'w')}</button>` : '<span class="mv">…</span>') +
      (b ? `<button class="mv${cur === i + 2 ? ' cur' : ''}" data-ply="${i + 2}">${fig(b.san, 'b')}</button>` : '<span></span>') + '</li>';
  }
  if (S.over) html += `<li class="result">${S.over.result}</li>`;
  ol.innerHTML = html;
  const curEl = ol.querySelector('.cur');
  if (curEl) curEl.scrollIntoView({ block: 'nearest' });
  else ol.scrollTop = ol.scrollHeight;
}
function fig(san) { return san.replace(/^([KQRBN])/, m => ({ K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘' }[m] + ' ')); }

function renderButtons() {
  const h = S.game.history.length, ply = shownPly();
  $('#nav-first').disabled = $('#nav-prev').disabled = ply === 0;
  $('#nav-next').disabled = $('#nav-last').disabled = live() || ply >= h;
  $('#btn-undo').disabled = !h || (S.setup.opponent === 'ai' && h === 1 && !S.human[firstTurn()]);
  $('#btn-hint').disabled = !live() || !humanTurn() || S.thinking;
  $('#btn-resign').disabled = !!S.over || !h;
  if (S.over) resetResign();
}

/* ---------- input ---------- */
function select(sq) {
  S.selected = sq;
  S.targets = sq === null ? [] : S.game.moves(sq).filter((m, i, a) => a.findIndex(x => x.to === m.to) === i)
    .map(m => ({ sq: m.to, capture: !!m.captured }));
}

function pointerDown(sq) {
  unlock();
  if (!live()) { goLive(); return null; }
  if (sq < 0) { if (S.selected !== null) { select(null); render(false); } return null; }
  if (S.selected !== null && S.targets.some(t => t.sq === sq)) {
    tryMove(S.selected, sq);
    return 'moved';
  }
  if (pickableSet().has(sq)) {
    const was = S.selected === sq;
    select(sq);
    S.hint = null;
    render(false);
    return { drag: true, wasSelected: was };
  }
  if (S.selected !== null) { select(null); render(false); }
  return null;
}

function pointerUp(from, to, dragged, wasSelected) {
  if (dragged) {
    if (to >= 0 && to !== from && S.targets.some(t => t.sq === to)) { tryMove(from, to); return true; }
    render(false);
    return false;
  }
  if (to === from && wasSelected) { select(null); render(false); }
  return false;
}

function tryMove(from, to) {
  const cands = S.game.moves(from).filter(m => m.to === to);
  if (!cands.length) return false;
  if (cands[0].promo) { askPromotion(from, to); return true; }
  commit(from, to);
  return true;
}

function askPromotion(from, to) {
  const color = S.game.turn;
  const box = $('#promo');
  box.innerHTML = '';
  for (const t of ['Q', 'R', 'B', 'N']) {
    const b = document.createElement('button');
    b.className = 'promo-piece';
    b.style.backgroundImage = `url("${pieceUrl(color === 'w' ? t : t.toLowerCase())}")`;
    b.setAttribute('aria-label', { Q: 'Queen', R: 'Rook', B: 'Bishop', N: 'Knight' }[t]);
    b.onclick = () => { closePromo(); commit(from, to, t); };
    box.appendChild(b);
  }
  const cancel = document.createElement('button');
  cancel.className = 'promo-cancel'; cancel.textContent = 'Cancel';
  cancel.onclick = () => { closePromo(); select(null); render(false); };
  box.appendChild(cancel);
  $('#promo-wrap').hidden = false;
  box.querySelector('button').focus();
}
function closePromo() { $('#promo-wrap').hidden = true; }

/* ---------- making moves ---------- */
function commit(from, to, promo) {
  const rec = S.game.play(from, to, promo);
  if (!rec) return;
  S.positions.push(snapshot());
  select(null);
  S.hint = null;
  if (S.clock) {
    const mover = opposite(S.game.turn);
    if (S.clock.running) S.clock[mover] += S.clock.inc * 1000;
    S.clock.running = true; S.clock.last = performance.now();
  }
  const st = S.game.status();
  if (st.over) finish(st);
  sfx(S.over ? 'end' : st.check ? 'check' : rec.flag === 'k' || rec.flag === 'q' ? 'castle' : rec.captured ? 'capture' : 'move');
  if (settings.autoFlip && S.setup.opponent === 'human' && !S.over) setOrientation(S.game.turn);
  render(true);
  save();
  maybeAI();
}

function finish(st, special) {
  let title, detail, result;
  if (special) ({ title, detail, result } = special);
  else {
    result = st.result;
    if (st.reason === 'checkmate') { title = 'Checkmate'; detail = `${NAMES[opposite(S.game.turn)]} wins`; }
    else { title = 'Draw'; detail = `By ${st.reason}`; }
  }
  if (S.setup.opponent === 'ai' && result !== '1/2-1/2') {
    const humanColor = S.human.w ? 'w' : 'b';
    const humanWon = (result === '1-0') === (humanColor === 'w');
    detail = humanWon ? 'You win' : 'The computer wins';
    if (special && special.why) detail += ' ' + special.why;
  } else if (special && special.why) detail += ' ' + special.why;
  S.over = { title, detail, result };
  if (S.clock) S.clock.running = false;
  S.aiReq++; S.thinking = false;
  setTimeout(() => showGameOver(), 450);
}

function showGameOver() {
  if (!S.over) return;
  $('#over-title').textContent = S.over.title;
  $('#over-detail').textContent = S.over.detail;
  $('#over-result').textContent = S.over.result.replace('1/2', '½').replace('1/2', '½');
  openDialog($('#dlg-over'));
}

/* ---------- computer ---------- */
let worker = null;
try {
  const src = `const ChessLib = (${ChessLib.toString()});\nconst L = ChessLib();\nonmessage = e => postMessage({ id: e.data.id, move: L.search(e.data.fen, e.data.opts) });`;
  worker = new Worker(URL.createObjectURL(new Blob([src], { type: 'text/javascript' })));
  worker.onmessage = e => aiDone(e.data.id, e.data.move);
  worker.onerror = () => {
    // fall back to searching on the page if the worker can't run here
    worker = null;
    if (lastReq) { const r = lastReq; setTimeout(() => aiDone(r.id, L.search(r.fen, r.opts)), 0); }
  };
} catch (e) { worker = null; }

let aiStarted = 0, lastReq = null;
function requestSearch(opts, cb) {
  const id = ++S.aiReq;
  pending[id] = cb;
  const fen = S.game.fen();
  lastReq = { id, fen, opts };
  if (worker) worker.postMessage({ id, fen, opts });
  else setTimeout(() => aiDone(id, L.search(fen, opts)), 30);
  return id;
}
const pending = {};
function aiDone(id, move) {
  const cb = pending[id]; delete pending[id];
  if (cb && id === S.aiReq) cb(move);
}

function maybeAI() {
  if (S.over || S.setup.opponent !== 'ai' || S.human[S.game.turn] || !live()) return;
  S.thinking = true;
  aiStarted = performance.now();
  render(false);
  requestSearch(LEVELS[S.setup.level], move => {
    const wait = Math.max(0, 450 - (performance.now() - aiStarted));
    const id = S.aiReq;
    setTimeout(() => {
      if (id !== S.aiReq || !move) return;
      S.thinking = false;
      if (!live()) goLive(false);
      commit(move.from, move.to, move.promo);
    }, wait);
  });
}

function showHint() {
  if (!humanTurn() || !live()) return;
  $('#btn-hint').disabled = true;
  $('#status-detail').textContent = 'Looking for a good move…';
  requestSearch({ depth: 4, time: 900 }, move => {
    if (!move) return;
    S.hint = { from: move.from, to: move.to };
    render(false);
    $('#status-detail').textContent = `Try ${sqName(move.from)} → ${sqName(move.to)}`;
  });
}

/* ---------- clock ---------- */
setInterval(() => {
  const c = S.clock;
  if (!c || !c.running || S.over) return;
  const now = performance.now(), side = S.game.turn;
  c[side] -= now - c.last; c.last = now;
  if (c[side] <= 0) {
    c[side] = 0;
    const winner = opposite(side);
    const draw = !S.game.hasMatingMaterial(winner);
    finish(null, { title: draw ? 'Draw' : 'Time out', result: draw ? '1/2-1/2' : (winner === 'w' ? '1-0' : '0-1'),
      detail: draw ? `${NAMES[side]} ran out of time, but ${NAMES[winner]} can't checkmate` : `${NAMES[winner]} wins`, why: draw ? '' : 'on time' });
    sfx('end');
    render(false); save();
    return;
  }
  const bottom = S.orientation;
  const el = side === bottom ? $('#player-bottom .clock') : $('#player-top .clock');
  el.textContent = fmtTime(c[side]);
  el.classList.toggle('low', c[side] < 20000);
}, 100);

/* ---------- history navigation ---------- */
function goTo(ply) {
  const h = S.game.history.length;
  ply = Math.max(0, Math.min(h, ply));
  S.viewPly = ply === h ? null : ply;
  select(null);
  render(true);
  if (live()) maybeAI();
}
function goLive(anim = true) { S.viewPly = null; select(null); render(anim); }

function undo() {
  if (!S.game.history.length) return;
  S.aiReq++; S.thinking = false;
  S.viewPly = null;
  const ai = S.setup.opponent === 'ai';
  do {
    S.game.undo(); S.positions.pop();
  } while (ai && S.game.history.length && !S.human[S.game.turn]);
  S.over = null;
  if (S.clock) { S.clock.running = S.game.history.length > 0; S.clock.last = performance.now(); }
  select(null); S.hint = null;
  render(true); save();
  maybeAI();
}

/* ---------- resign ---------- */
let resignTimer = null;
function resetResign() { const b = $('#btn-resign'); b.classList.remove('confirm'); b.querySelector('span').textContent = 'Resign'; clearTimeout(resignTimer); }
function resign() {
  const b = $('#btn-resign');
  if (!b.classList.contains('confirm')) {
    b.classList.add('confirm'); b.querySelector('span').textContent = 'Confirm resign';
    resignTimer = setTimeout(resetResign, 3000);
    return;
  }
  resetResign();
  const loser = S.setup.opponent === 'ai' ? (S.human.w ? 'w' : 'b') : S.game.turn;
  const winner = opposite(loser);
  finish(null, { title: 'Resigned', result: winner === 'w' ? '1-0' : '0-1', detail: `${NAMES[loser]} resigned · ${NAMES[winner]} wins`, why: S.setup.opponent === 'ai' ? 'by resignation' : '' });
  sfx('end');
  render(false); save();
}

/* ---------- orientation ---------- */
function setOrientation(o) {
  S.orientation = o;
  view.setOrientation(o, true);
  render(false);
}

/* ---------- new game ---------- */
function newGame(setup, restore) {
  S.aiReq++; S.thinking = false;
  S.setup = Object.assign({}, setup);
  let color = setup.color === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : setup.color;
  S.setup.resolvedColor = restore ? setup.resolvedColor : color;
  color = S.setup.resolvedColor || 'w';
  S.human = setup.opponent === 'ai' ? { w: color === 'w', b: color === 'b' } : { w: true, b: true };
  S.game = new Chess();
  S.startTurn = 'w'; S.startMove = 1;
  S.positions = [snapshot()];
  S.viewPly = null; S.over = null; S.hint = null;
  select(null);
  const c = CLOCKS[setup.clock];
  S.clock = c ? { w: c[0] * 1000, b: c[0] * 1000, inc: c[1], running: false, last: 0 } : null;
  setOrientation(setup.opponent === 'ai' ? color : 'w');
  if (restore) {
    for (const m of restore.moves) { if (!S.game.play(m[0], m[1], m[2])) break; S.positions.push(snapshot()); }
    if (restore.clock && S.clock) Object.assign(S.clock, restore.clock, { running: false });
    if (restore.over) S.over = restore.over;
    if (S.clock && S.game.history.length && !S.over) { S.clock.running = true; S.clock.last = performance.now(); }
    if (settings.autoFlip && setup.opponent === 'human') setOrientation(S.game.turn);
  } else sfx('start');
  render(false);
  save();
  maybeAI();
}

function save() {
  store.set(STORE, {
    setup: S.setup,
    moves: S.game.history.map(m => [m.from, m.to, m.promo ? m.promo.toUpperCase() : null]),
    clock: S.clock ? { w: S.clock.w, b: S.clock.b, inc: S.clock.inc } : null,
    over: S.over
  });
}

/* ---------- PGN ---------- */
function pgn() {
  const d = new Date();
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  const nm = c => S.setup.opponent === 'ai' ? (S.human[c] ? 'Player' : `Computer (${LEVELS[S.setup.level].label})`) : NAMES[c];
  const res = S.over ? S.over.result : '*';
  let body = '';
  S.game.history.forEach((m, i) => { if (i % 2 === 0) body += `${i / 2 + 1}. `; body += m.san + ' '; });
  return `[Event "Casual game"]\n[Date "${date}"]\n[White "${nm('w')}"]\n[Black "${nm('b')}"]\n[Result "${res}"]\n\n${body}${res}\n`;
}
async function copyPgn() {
  const text = pgn();
  let ok = false;
  try { await navigator.clipboard.writeText(text); ok = true; } catch (e) {
    const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
    try { ok = document.execCommand('copy'); } catch (e2) { ok = false; }
    ta.remove();
  }
  toast(ok ? 'PGN copied to clipboard' : 'Copy failed. Your browser blocked clipboard access.');
}

let toastT;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 2200);
}

/* ---------- dialogs ---------- */
function openDialog(d) { if (!d.open) { try { d.showModal(); } catch (e) { d.setAttribute('open', ''); } } }
function closeDialog(d) { try { d.close(); } catch (e) { d.removeAttribute('open'); } }
document.querySelectorAll('dialog').forEach(d => {
  d.addEventListener('click', e => { if (e.target === d) closeDialog(d); });
  d.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => closeDialog(d)));
});

function bindSegment(name, value, onChange) {
  const group = document.querySelector(`[data-seg="${name}"]`);
  const set = v => group.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === v)));
  set(value);
  group.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    set(b.dataset.value); onChange(b.dataset.value);
  });
  return set;
}

const draft = Object.assign({}, store.get('chess.lastSetup', S.setup));
bindSegment('opponent', draft.opponent, v => { draft.opponent = v; syncSetupForm(); });
bindSegment('level', draft.level, v => { draft.level = v; });
bindSegment('color', draft.color, v => { draft.color = v; });
bindSegment('clock', draft.clock, v => { draft.clock = v; });
function syncSetupForm() { $('#ai-options').hidden = draft.opponent !== 'ai'; }
syncSetupForm();

$('#btn-new').addEventListener('click', () => openDialog($('#dlg-new')));
$('#start-game').addEventListener('click', () => {
  closeDialog($('#dlg-new'));
  store.set('chess.lastSetup', draft);
  unlock();
  newGame(draft);
});
$('#over-again').addEventListener('click', () => { closeDialog($('#dlg-over')); newGame(Object.assign({}, S.setup, { color: S.setup.color })); });
$('#over-review').addEventListener('click', () => { closeDialog($('#dlg-over')); goTo(0); });
$('#over-pgn').addEventListener('click', copyPgn);

// how to play
const PIECE_HELP = [
  ['K', 'King', 'Protect it', 'One square in any direction. It can never move onto a square that is attacked.'],
  ['Q', 'Queen', '9', 'Any number of squares in a straight line or diagonal. Your strongest piece.'],
  ['R', 'Rook', '5', 'Any number of squares straight up, down or sideways.'],
  ['B', 'Bishop', '3', 'Any number of squares diagonally, so it always stays on one colour.'],
  ['N', 'Knight', '3', 'An L shape: two squares one way, then one to the side. It jumps over pieces.'],
  ['P', 'Pawn', '1', 'One square forward, or two on its first move. It captures one square diagonally forward and never moves back.']
];
function miniBoard(t) {
  // 5x5 board, piece in the middle (pawn one row lower)
  const pr = t === 'P' ? 3 : 2, pc = 2, marks = new Set(), enemies = new Set();
  const add = (r, c) => { if (r >= 0 && r < 5 && c >= 0 && c < 5) marks.add(r * 5 + c); };
  const lines = { R: [[1,0],[-1,0],[0,1],[0,-1]], B: [[1,1],[1,-1],[-1,1],[-1,-1]] };
  lines.Q = lines.R.concat(lines.B);
  if (lines[t]) for (const [dr, dc] of lines[t]) for (let k = 1; k < 5; k++) add(pr + dr * k, pc + dc * k);
  if (t === 'K') for (const [dr, dc] of lines.Q) add(pr + dr, pc + dc);
  if (t === 'N') for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) add(pr + dr, pc + dc);
  if (t === 'P') { add(2, 2); add(1, 2); enemies.add(2 * 5 + 1); enemies.add(2 * 5 + 3); }
  let html = '';
  for (let i = 0; i < 25; i++) {
    const r = Math.floor(i / 5), c = i % 5, cls = ((r + c) % 2 ? 'd' : '');
    if (i === pr * 5 + pc) html += `<i class="${cls} p" style="background-image:url('${pieceUrl(t)}')"></i>`;
    else if (enemies.has(i)) html += `<i class="${cls} p x" style="background-image:url('${pieceUrl('p')}')"></i>`;
    else html += `<i class="${cls}${marks.has(i) ? ' m' : ''}"></i>`;
  }
  return `<div class="mini" aria-hidden="true">${html}</div>`;
}
$('#pieces-grid').innerHTML = PIECE_HELP.map(([t, name, val, text]) =>
  `<div class="pc-card">${miniBoard(t)}<div><h4>${name}<small>${val === 'Protect it' ? val : 'Worth ' + val}</small></h4><p>${text}</p></div></div>`).join('');
$('#btn-learn').addEventListener('click', () => openDialog($('#dlg-learn')));
$('#open-learn').addEventListener('click', () => { closeDialog($('#dlg-new')); openDialog($('#dlg-learn')); });
$('#dlg-learn').addEventListener('close', () => { if (!S.game.history.length && !store.get('chess.lastSetup', null)) openDialog($('#dlg-new')); });
document.querySelectorAll('.learn-nav a').forEach(a => a.addEventListener('click', e => {
  e.preventDefault();
  document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth', block: 'start' });
}));

// settings
$('#btn-settings').addEventListener('click', () => openDialog($('#dlg-settings')));
const themeBox = $('#themes');
for (const [k, t] of Object.entries(THEMES)) {
  const b = document.createElement('button');
  b.className = 'theme'; b.dataset.value = k;
  b.innerHTML = `<span class="sw" style="--l:${t.light};--d:${t.dark}"></span>${t.name}`;
  themeBox.appendChild(b);
}
bindSegment('theme', settings.theme, v => { settings.theme = v; applyTheme(); saveSettings(); });
for (const k of ['legal', 'sound', 'autoFlip']) {
  const cb = $(`#set-${k}`);
  cb.checked = settings[k];
  cb.addEventListener('change', () => {
    settings[k] = cb.checked; sound.enabled = settings.sound; saveSettings();
    if (k === 'autoFlip' && cb.checked && S.setup.opponent === 'human') setOrientation(S.game.turn);
    render(false);
  });
}
function saveSettings() { store.set('chess.settings', settings); }
function applyTheme() {
  const t = THEMES[settings.theme];
  document.documentElement.style.setProperty('--sq-light', t.light);
  document.documentElement.style.setProperty('--sq-dark', t.dark);
  view.setTheme(t);
}

// view toggle
$('#btn-camera').addEventListener('click', () => view.resetCamera());

// controls
$('#btn-flip').addEventListener('click', () => setOrientation(opposite(S.orientation)));
$('#btn-undo').addEventListener('click', undo);
$('#btn-hint').addEventListener('click', showHint);
$('#btn-resign').addEventListener('click', resign);
$('#btn-pgn').addEventListener('click', copyPgn);
$('#nav-first').addEventListener('click', () => goTo(0));
$('#nav-prev').addEventListener('click', () => goTo(shownPly() - 1));
$('#nav-next').addEventListener('click', () => goTo(shownPly() + 1));
$('#nav-last').addEventListener('click', () => goTo(S.game.history.length));
$('#review-live').addEventListener('click', () => goLive());
$('#moves').addEventListener('click', e => { const b = e.target.closest('[data-ply]'); if (b) goTo(+b.dataset.ply); });

document.addEventListener('keydown', e => {
  if (document.querySelector('dialog[open]') || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  if (!$('#promo-wrap').hidden) { if (e.key === 'Escape') { closePromo(); select(null); render(false); } return; }
  const k = e.key;
  if (k === 'ArrowLeft') { goTo(shownPly() - 1); e.preventDefault(); }
  else if (k === 'ArrowRight') { goTo(shownPly() + 1); e.preventDefault(); }
  else if (k === 'Home') goTo(0);
  else if (k === 'End') goTo(S.game.history.length);
  else if (k === 'f' || k === 'F') setOrientation(opposite(S.orientation));
  else if ((e.ctrlKey || e.metaKey) && k.toLowerCase() === 'z') { e.preventDefault(); undo(); }
  else if (k === 'Escape' && S.selected !== null) { select(null); render(false); }
});

/* ---------- boot ---------- */
applyTheme();
const saved = store.get(STORE, null);
if (saved && saved.moves && saved.moves.length && saved.setup) {
  newGame(saved.setup, saved);
  if (S.over) { /* finished game restored: leave it on screen */ }
} else {
  newGame(S.setup);
  openDialog($('#dlg-new'));
}
if (__TEST__) window.__chess = { S, get view() { return view; } };
