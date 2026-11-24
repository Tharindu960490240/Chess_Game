/* Chess rules engine + computer opponent.
 * Wrapped in one function so the same source can also run inside a Web Worker.
 * Board: 64 squares, index = row*8 + col, row 0 = rank 8, col 0 = file a.
 * Pieces: uppercase = white (PNBRQK), lowercase = black, null = empty.
 */
function ChessLib() {
  'use strict';
  var FILES = 'abcdefgh';
  var START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  var KNIGHT = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
  var KING = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
  var BISHOP = [[-1,-1],[-1,1],[1,-1],[1,1]];
  var ROOK = [[-1,0],[1,0],[0,-1],[0,1]];

  function colorOf(p) { return p ? (p === p.toUpperCase() ? 'w' : 'b') : null; }
  function typeOf(p) { return p ? p.toUpperCase() : null; }
  function sqName(i) { return FILES[i & 7] + (8 - (i >> 3)); }
  function sqIndex(n) { return (8 - parseInt(n[1], 10)) * 8 + FILES.indexOf(n[0]); }
  function opp(c) { return c === 'w' ? 'b' : 'w'; }

  function Chess(fen) { this.load(fen || START_FEN); }

  Chess.prototype.load = function (fen) {
    var parts = fen.trim().split(/\s+/);
    var rows = parts[0].split('/');
    if (rows.length !== 8) throw new Error('Bad FEN');
    this.board = new Array(64).fill(null);
    for (var r = 0; r < 8; r++) {
      var c = 0;
      for (var k = 0; k < rows[r].length; k++) {
        var ch = rows[r][k];
        if (/\d/.test(ch)) c += parseInt(ch, 10);
        else { this.board[r * 8 + c] = ch; c++; }
      }
    }
    this.turn = parts[1] || 'w';
    var cs = parts[2] || '-';
    this.castling = { K: cs.indexOf('K') >= 0, Q: cs.indexOf('Q') >= 0, k: cs.indexOf('k') >= 0, q: cs.indexOf('q') >= 0 };
    this.ep = parts[3] && parts[3] !== '-' ? sqIndex(parts[3]) : -1;
    this.halfmove = parseInt(parts[4] || '0', 10);
    this.fullmove = parseInt(parts[5] || '1', 10);
    this.stack = [];
    this.history = [];
    this.repetition = {};
    this.repetition[this.key()] = 1;
  };

  Chess.prototype.clone = function () {
    var c = new Chess(this.fen());
    return c;
  };

  Chess.prototype.fen = function () {
    var out = '';
    for (var r = 0; r < 8; r++) {
      var empty = 0;
      for (var c = 0; c < 8; c++) {
        var p = this.board[r * 8 + c];
        if (!p) empty++;
        else { if (empty) { out += empty; empty = 0; } out += p; }
      }
      if (empty) out += empty;
      if (r < 7) out += '/';
    }
    return out + ' ' + this.turn + ' ' + this.castleStr() + ' ' + (this.ep >= 0 ? sqName(this.ep) : '-') + ' ' + this.halfmove + ' ' + this.fullmove;
  };

  Chess.prototype.castleStr = function () {
    var s = (this.castling.K ? 'K' : '') + (this.castling.Q ? 'Q' : '') + (this.castling.k ? 'k' : '') + (this.castling.q ? 'q' : '');
    return s || '-';
  };

  /* Position key for repetition: placement + side + castling + a usable en-passant square */
  Chess.prototype.key = function () {
    var f = this.fen().split(' ');
    var ep = '-';
    if (this.ep >= 0) {
      // only counts if a pawn could actually capture en passant
      var pawn = this.turn === 'w' ? 'P' : 'p';
      var dir = this.turn === 'w' ? 8 : -8;
      var c = this.ep & 7, from1 = this.ep + dir - 1, from2 = this.ep + dir + 1;
      if ((c > 0 && this.board[from1] === pawn) || (c < 7 && this.board[from2] === pawn)) ep = f[3];
    }
    return f[0] + ' ' + f[1] + ' ' + f[2] + ' ' + ep;
  };

  Chess.prototype.kingSquare = function (color) {
    var k = color === 'w' ? 'K' : 'k';
    for (var i = 0; i < 64; i++) if (this.board[i] === k) return i;
    return -1;
  };

  /* Is square `sq` attacked by side `by`? */
  Chess.prototype.attacked = function (sq, by) {
    var b = this.board, r = sq >> 3, c = sq & 7, i, nr, nc, p;
    // pawns
    var pr = by === 'w' ? r + 1 : r - 1, pawn = by === 'w' ? 'P' : 'p';
    if (pr >= 0 && pr < 8) {
      if (c > 0 && b[pr * 8 + c - 1] === pawn) return true;
      if (c < 7 && b[pr * 8 + c + 1] === pawn) return true;
    }
    var N = by === 'w' ? 'N' : 'n', K = by === 'w' ? 'K' : 'k';
    for (i = 0; i < 8; i++) {
      nr = r + KNIGHT[i][0]; nc = c + KNIGHT[i][1];
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr * 8 + nc] === N) return true;
      nr = r + KING[i][0]; nc = c + KING[i][1];
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr * 8 + nc] === K) return true;
    }
    var Bq = by === 'w' ? 'B' : 'b', Rq = by === 'w' ? 'R' : 'r', Q = by === 'w' ? 'Q' : 'q';
    for (i = 0; i < 4; i++) {
      nr = r + BISHOP[i][0]; nc = c + BISHOP[i][1];
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        p = b[nr * 8 + nc];
        if (p) { if (p === Bq || p === Q) return true; break; }
        nr += BISHOP[i][0]; nc += BISHOP[i][1];
      }
      nr = r + ROOK[i][0]; nc = c + ROOK[i][1];
      while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
        p = b[nr * 8 + nc];
        if (p) { if (p === Rq || p === Q) return true; break; }
        nr += ROOK[i][0]; nc += ROOK[i][1];
      }
    }
    return false;
  };

  Chess.prototype.inCheck = function (color) {
    color = color || this.turn;
    return this.attacked(this.kingSquare(color), opp(color));
  };

  function mv(from, to, piece, captured, flag, promo) {
    return { from: from, to: to, piece: piece, captured: captured || null, flag: flag || '', promo: promo || null };
  }

  /* Pseudo-legal moves for side to move (onlyFrom optional) */
  Chess.prototype.pseudo = function (onlyFrom, capturesOnly) {
    var moves = [], b = this.board, us = this.turn, them = opp(us);
    for (var sq = 0; sq < 64; sq++) {
      if (onlyFrom !== undefined && onlyFrom !== null && sq !== onlyFrom) continue;
      var p = b[sq];
      if (!p || colorOf(p) !== us) continue;
      var t = typeOf(p), r = sq >> 3, c = sq & 7, i, nr, nc, to, q;
      if (t === 'P') {
        var dir = us === 'w' ? -1 : 1, startRow = us === 'w' ? 6 : 1, lastRow = us === 'w' ? 0 : 7;
        nr = r + dir;
        if (nr >= 0 && nr < 8) {
          to = nr * 8 + c;
          if (!b[to] && !capturesOnly) {
            if (nr === lastRow) ['Q', 'R', 'B', 'N'].forEach(function (pp) { moves.push(mv(sq, to, p, null, 'p', us === 'w' ? pp : pp.toLowerCase())); });
            else {
              moves.push(mv(sq, to, p));
              var to2 = (r + 2 * dir) * 8 + c;
              if (r === startRow && !b[to2]) moves.push(mv(sq, to2, p, null, 'b'));
            }
          }
          for (var dc = -1; dc <= 1; dc += 2) {
            nc = c + dc;
            if (nc < 0 || nc > 7) continue;
            to = nr * 8 + nc;
            if (b[to] && colorOf(b[to]) === them) {
              if (nr === lastRow) ['Q', 'R', 'B', 'N'].forEach(function (pp) { moves.push(mv(sq, to, p, b[to], 'p', us === 'w' ? pp : pp.toLowerCase())); });
              else moves.push(mv(sq, to, p, b[to]));
            } else if (to === this.ep) {
              moves.push(mv(sq, to, p, us === 'w' ? 'p' : 'P', 'e'));
            }
          }
        }
      } else if (t === 'N' || t === 'K') {
        var offs = t === 'N' ? KNIGHT : KING;
        for (i = 0; i < 8; i++) {
          nr = r + offs[i][0]; nc = c + offs[i][1];
          if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
          to = nr * 8 + nc; q = b[to];
          if (!q) { if (!capturesOnly) moves.push(mv(sq, to, p)); }
          else if (colorOf(q) === them) moves.push(mv(sq, to, p, q));
        }
        if (t === 'K' && !capturesOnly) this.castleMoves(sq, moves);
      } else {
        var dirs = t === 'B' ? BISHOP : t === 'R' ? ROOK : BISHOP.concat(ROOK);
        for (i = 0; i < dirs.length; i++) {
          nr = r + dirs[i][0]; nc = c + dirs[i][1];
          while (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            to = nr * 8 + nc; q = b[to];
            if (!q) { if (!capturesOnly) moves.push(mv(sq, to, p)); }
            else { if (colorOf(q) === them) moves.push(mv(sq, to, p, q)); break; }
            nr += dirs[i][0]; nc += dirs[i][1];
          }
        }
      }
    }
    return moves;
  };

  Chess.prototype.castleMoves = function (sq, moves) {
    var us = this.turn, them = opp(us), b = this.board;
    var home = us === 'w' ? 60 : 4;
    if (sq !== home || this.attacked(home, them)) return;
    var K = us === 'w' ? 'K' : 'k', Q = us === 'w' ? 'Q' : 'q', R = us === 'w' ? 'R' : 'r';
    if (this.castling[K] && b[home + 3] === R && !b[home + 1] && !b[home + 2] &&
        !this.attacked(home + 1, them) && !this.attacked(home + 2, them)) {
      moves.push(mv(home, home + 2, b[home], null, 'k'));
    }
    if (this.castling[Q] && b[home - 4] === R && !b[home - 1] && !b[home - 2] && !b[home - 3] &&
        !this.attacked(home - 1, them) && !this.attacked(home - 2, them)) {
      moves.push(mv(home, home - 2, b[home], null, 'q'));
    }
  };

  var ROOK_HOME = { 63: 'K', 56: 'Q', 7: 'k', 0: 'q' };

  Chess.prototype.make = function (m) {
    var b = this.board;
    this.stack.push({ castling: Object.assign({}, this.castling), ep: this.ep, halfmove: this.halfmove, fullmove: this.fullmove, move: m });
    b[m.to] = m.promo || m.piece;
    b[m.from] = null;
    if (m.flag === 'e') b[m.to + (this.turn === 'w' ? 8 : -8)] = null;
    if (m.flag === 'k') { b[m.to - 1] = b[m.to + 1]; b[m.to + 1] = null; }
    if (m.flag === 'q') { b[m.to + 1] = b[m.to - 2]; b[m.to - 2] = null; }
    // castling rights
    if (m.piece === 'K') { this.castling.K = this.castling.Q = false; }
    if (m.piece === 'k') { this.castling.k = this.castling.q = false; }
    if (ROOK_HOME[m.from]) this.castling[ROOK_HOME[m.from]] = false;
    if (ROOK_HOME[m.to]) this.castling[ROOK_HOME[m.to]] = false;
    this.ep = m.flag === 'b' ? (m.from + m.to) / 2 : -1;
    this.halfmove = (typeOf(m.piece) === 'P' || m.captured) ? 0 : this.halfmove + 1;
    if (this.turn === 'b') this.fullmove++;
    this.turn = opp(this.turn);
  };

  Chess.prototype.unmake = function () {
    var s = this.stack.pop();
    if (!s) return null;
    var m = s.move, b = this.board;
    this.turn = opp(this.turn);
    b[m.from] = m.piece;
    b[m.to] = null;
    if (m.flag === 'e') b[m.to + (this.turn === 'w' ? 8 : -8)] = m.captured;
    else if (m.captured) b[m.to] = m.captured;
    if (m.flag === 'k') { b[m.to + 1] = b[m.to - 1]; b[m.to - 1] = null; }
    if (m.flag === 'q') { b[m.to - 2] = b[m.to + 1]; b[m.to + 1] = null; }
    this.castling = s.castling; this.ep = s.ep; this.halfmove = s.halfmove; this.fullmove = s.fullmove;
    return m;
  };

  Chess.prototype.moves = function (from) {
    var us = this.turn, out = [], ps = this.pseudo(from);
    for (var i = 0; i < ps.length; i++) {
      this.make(ps[i]);
      if (!this.attacked(this.kingSquare(us), opp(us))) out.push(ps[i]);
      this.unmake();
    }
    return out;
  };

  Chess.prototype.san = function (m, legal) {
    var s;
    if (m.flag === 'k') s = 'O-O';
    else if (m.flag === 'q') s = 'O-O-O';
    else {
      var t = typeOf(m.piece);
      if (t === 'P') {
        s = m.captured ? FILES[m.from & 7] + 'x' + sqName(m.to) : sqName(m.to);
        if (m.promo) s += '=' + typeOf(m.promo);
      } else {
        var amb = (legal || this.moves()).filter(function (o) { return o.piece === m.piece && o.to === m.to && o.from !== m.from; });
        var dis = '';
        if (amb.length) {
          var sameFile = amb.some(function (o) { return (o.from & 7) === (m.from & 7); });
          var sameRank = amb.some(function (o) { return (o.from >> 3) === (m.from >> 3); });
          if (!sameFile) dis = FILES[m.from & 7];
          else if (!sameRank) dis = String(8 - (m.from >> 3));
          else dis = sqName(m.from);
        }
        s = t + dis + (m.captured ? 'x' : '') + sqName(m.to);
      }
    }
    this.make(m);
    if (this.inCheck()) s += this.moves().length ? '+' : '#';
    this.unmake();
    return s;
  };

  /* Play a legal move; records SAN and repetition. Returns the move or null. */
  Chess.prototype.play = function (from, to, promo) {
    var legal = this.moves();
    var cand = legal.filter(function (m) { return m.from === from && m.to === to; });
    if (!cand.length) return null;
    var m = cand[0];
    if (cand.length > 1) {
      var want = (promo || 'Q').toUpperCase();
      m = cand.filter(function (x) { return typeOf(x.promo) === want; })[0] || cand[0];
    }
    var san = this.san(m, legal);
    this.make(m);
    var k = this.key();
    this.repetition[k] = (this.repetition[k] || 0) + 1;
    var rec = Object.assign({ san: san, fen: this.fen(), key: k }, m);
    this.history.push(rec);
    return rec;
  };

  Chess.prototype.undo = function () {
    if (!this.history.length) return null;
    var rec = this.history.pop();
    this.repetition[rec.key]--;
    this.unmake();
    return rec;
  };

  Chess.prototype.insufficient = function () {
    var minors = [], others = 0;
    for (var i = 0; i < 64; i++) {
      var p = this.board[i];
      if (!p || typeOf(p) === 'K') continue;
      var t = typeOf(p);
      if (t === 'B' || t === 'N') minors.push({ t: t, c: colorOf(p), sqc: ((i >> 3) + (i & 7)) % 2 });
      else others++;
    }
    if (others) return false;
    if (minors.length <= 1) return true;
    // only bishops, all on same colour squares
    return minors.every(function (m) { return m.t === 'B' && m.sqc === minors[0].sqc; });
  };

  /* Can `color` possibly deliver mate? (used when the opponent's clock runs out) */
  Chess.prototype.hasMatingMaterial = function (color) {
    var n = 0, b = 0;
    for (var i = 0; i < 64; i++) {
      var p = this.board[i];
      if (!p || colorOf(p) !== color) continue;
      var t = typeOf(p);
      if (t === 'P' || t === 'R' || t === 'Q') return true;
      if (t === 'N') n++;
      if (t === 'B') b++;
    }
    return n + b >= 2;
  };

  Chess.prototype.status = function () {
    var legal = this.moves();
    var check = this.inCheck();
    if (!legal.length) return check ? { over: true, result: this.turn === 'w' ? '0-1' : '1-0', reason: 'checkmate', check: true }
                                     : { over: true, result: '1/2-1/2', reason: 'stalemate', check: false };
    if (this.insufficient()) return { over: true, result: '1/2-1/2', reason: 'insufficient material', check: check };
    if (this.halfmove >= 100) return { over: true, result: '1/2-1/2', reason: 'the 50-move rule', check: check };
    if (this.repetition[this.key()] >= 3) return { over: true, result: '1/2-1/2', reason: 'threefold repetition', check: check };
    return { over: false, check: check, moves: legal };
  };

  Chess.prototype.perft = function (depth) {
    if (depth === 0) return 1;
    var ms = this.moves(), n = 0;
    if (depth === 1) return ms.length;
    for (var i = 0; i < ms.length; i++) { this.make(ms[i]); n += this.perft(depth - 1); this.unmake(); }
    return n;
  };

  /* ---------------- Computer opponent ---------------- */
  var VAL = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 0 };
  // piece-square tables from white's point of view, row 0 = rank 8
  var PST = {
    P: [0,0,0,0,0,0,0,0, 50,50,50,50,50,50,50,50, 10,10,20,30,30,20,10,10, 5,5,10,25,25,10,5,5, 0,0,0,20,20,0,0,0, 5,-5,-10,0,0,-10,-5,5, 5,10,10,-20,-20,10,10,5, 0,0,0,0,0,0,0,0],
    N: [-50,-40,-30,-30,-30,-30,-40,-50, -40,-20,0,0,0,0,-20,-40, -30,0,10,15,15,10,0,-30, -30,5,15,20,20,15,5,-30, -30,0,15,20,20,15,0,-30, -30,5,10,15,15,10,5,-30, -40,-20,0,5,5,0,-20,-40, -50,-40,-30,-30,-30,-30,-40,-50],
    B: [-20,-10,-10,-10,-10,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,10,10,5,0,-10, -10,5,5,10,10,5,5,-10, -10,0,10,10,10,10,0,-10, -10,10,10,10,10,10,10,-10, -10,5,0,0,0,0,5,-10, -20,-10,-10,-10,-10,-10,-10,-20],
    R: [0,0,0,0,0,0,0,0, 5,10,10,10,10,10,10,5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, -5,0,0,0,0,0,0,-5, 0,0,0,5,5,0,0,0],
    Q: [-20,-10,-10,-5,-5,-10,-10,-20, -10,0,0,0,0,0,0,-10, -10,0,5,5,5,5,0,-10, -5,0,5,5,5,5,0,-5, 0,0,5,5,5,5,0,-5, -10,5,5,5,5,5,0,-10, -10,0,5,0,0,0,0,-10, -20,-10,-10,-5,-5,-10,-10,-20],
    K: [-30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -30,-40,-40,-50,-50,-40,-40,-30, -20,-30,-30,-40,-40,-30,-30,-20, -10,-20,-20,-20,-20,-20,-20,-10, 20,20,0,0,0,0,20,20, 20,30,10,0,0,10,30,20],
    KE: [-50,-40,-30,-20,-20,-30,-40,-50, -30,-20,-10,0,0,-10,-20,-30, -30,-10,20,30,30,20,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,30,40,40,30,-10,-30, -30,-10,20,30,30,20,-10,-30, -30,-30,0,0,0,0,-30,-30, -50,-30,-30,-30,-30,-30,-30,-50]
  };

  function evaluate(g) {
    var b = g.board, score = 0, mat = 0, i, p, t;
    for (i = 0; i < 64; i++) { p = b[i]; if (p && typeOf(p) !== 'P' && typeOf(p) !== 'K') mat += VAL[typeOf(p)]; }
    var endgame = mat <= 2600;
    for (i = 0; i < 64; i++) {
      p = b[i]; if (!p) continue;
      t = typeOf(p);
      var tbl = t === 'K' && endgame ? PST.KE : PST[t];
      if (p === t) score += VAL[t] + tbl[i];
      else score -= VAL[t] + tbl[(7 - (i >> 3)) * 8 + (i & 7)];
    }
    return g.turn === 'w' ? score : -score;
  }

  function orderMoves(ms) {
    for (var i = 0; i < ms.length; i++) {
      var m = ms[i];
      m._o = (m.captured ? 10 * VAL[typeOf(m.captured)] - VAL[typeOf(m.piece)] + 10000 : 0) + (m.promo ? 9000 : 0);
    }
    ms.sort(function (a, b) { return b._o - a._o; });
    return ms;
  }

  function search(fen, opts) {
    var g = new Chess(fen);
    var depthMax = opts.depth || 3, deadline = Date.now() + (opts.time || 1000), nodes = 0, stop = false;
    var MATE = 100000;

    function quiesce(alpha, beta, qd) {
      var stand = evaluate(g);
      if (stand >= beta) return beta;
      if (stand > alpha) alpha = stand;
      if (qd > 6) return alpha;
      var us = g.turn, ms = orderMoves(g.pseudo(null, true));
      for (var i = 0; i < ms.length; i++) {
        g.make(ms[i]);
        if (g.attacked(g.kingSquare(us), opp(us))) { g.unmake(); continue; }
        var s = -quiesce(-beta, -alpha, qd + 1);
        g.unmake();
        if (s >= beta) return beta;
        if (s > alpha) alpha = s;
      }
      return alpha;
    }

    function negamax(depth, alpha, beta, ply) {
      if ((++nodes & 1023) === 0 && Date.now() > deadline) stop = true;
      if (stop) return 0;
      if (ply > 0 && (g.halfmove >= 100 || g.insufficient())) return 0;
      if (depth <= 0) return quiesce(alpha, beta, 0);
      var us = g.turn, ms = orderMoves(g.pseudo()), any = false;
      for (var i = 0; i < ms.length; i++) {
        g.make(ms[i]);
        if (g.attacked(g.kingSquare(us), opp(us))) { g.unmake(); continue; }
        any = true;
        var s = -negamax(depth - 1, -beta, -alpha, ply + 1);
        g.unmake();
        if (stop) return 0;
        if (s >= beta) return beta;
        if (s > alpha) alpha = s;
      }
      if (!any) return g.inCheck() ? -MATE + ply : 0;
      return alpha;
    }

    var root = orderMoves(g.moves());
    if (!root.length) return null;
    var best = root[0], bestScores = [];
    for (var d = 1; d <= depthMax; d++) {
      var scored = [], alpha = -Infinity;
      for (var i = 0; i < root.length; i++) {
        g.make(root[i]);
        // with randomness, widen the window so near-best moves get exact scores
        var s = -negamax(d - 1, -Infinity, -(alpha - (opts.randomness || 0) - 1), 1);
        g.unmake();
        if (stop) break;
        scored.push({ m: root[i], s: s });
        if (s > alpha) alpha = s;
      }
      if (stop && d > 1) break;
      scored.sort(function (a, b) { return b.s - a.s; });
      bestScores = scored;
      if (scored.length) {
        best = scored[0].m;
        // re-order root by score for the next iteration
        root = scored.map(function (x) { return x.m; }).concat(root.slice(scored.length));
        if (scored[0].s > MATE - 100) break;
      }
      if (Date.now() > deadline) break;
    }
    // optional randomness for easier levels: choose among near-best moves
    if (opts.randomness && bestScores.length > 1) {
      var top = bestScores[0].s;
      var pool = bestScores.filter(function (x) { return x.s >= top - opts.randomness; });
      best = pool[Math.floor(Math.random() * pool.length)].m;
    }
    return { from: best.from, to: best.to, promo: best.promo ? typeOf(best.promo) : null, nodes: nodes };
  }

  return { Chess: Chess, search: search, sqName: sqName, sqIndex: sqIndex, colorOf: colorOf, typeOf: typeOf, START_FEN: START_FEN };
}

if (typeof module !== 'undefined' && module.exports) module.exports = ChessLib;
