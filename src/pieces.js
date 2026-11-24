// Piece artwork for the 2D board (vector pieces by Colin M.L. Burnett, CC BY-SA 3.0).
// Filled in at build time from assets/pieces/*.svg as data URIs.
export const PIECE_SVG = __PIECE_SVG__;

export function pieceUrl(p) {
  const key = (p === p.toUpperCase() ? 'w' : 'b') + p.toUpperCase();
  return PIECE_SVG[key];
}

/* Match old piece positions to a new board so pieces glide instead of teleporting.
 * old: [{id, piece, sq}], board: array(64). Returns {keep:[{id,sq}], add:[{piece,sq}], remove:[id]} */
export function diffPieces(old, board) {
  const keep = [], add = [], remove = [];
  const usedOld = new Set();
  const need = [];
  for (let sq = 0; sq < 64; sq++) {
    const p = board[sq];
    if (!p) continue;
    const same = old.find(o => !usedOld.has(o.id) && o.sq === sq && o.piece === p);
    if (same) { usedOld.add(same.id); keep.push({ id: same.id, sq }); }
    else need.push({ piece: p, sq });
  }
  for (const n of need) {
    let best = null, bestD = Infinity;
    for (const o of old) {
      if (usedOld.has(o.id) || o.piece !== n.piece) continue;
      if (board[o.sq] === o.piece) continue; // still occupied by same piece elsewhere
      const d = Math.abs((o.sq >> 3) - (n.sq >> 3)) + Math.abs((o.sq & 7) - (n.sq & 7));
      if (d < bestD) { bestD = d; best = o; }
    }
    if (best) { usedOld.add(best.id); keep.push({ id: best.id, sq: n.sq, moved: true }); }
    else add.push(n);
  }
  for (const o of old) if (!usedOld.has(o.id)) remove.push(o.id);
  return { keep, add, remove };
}
