const L=require('../js/engine.js')();
const cases=[
 [L.START_FEN,[20,400,8902,197281]],
 ['r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1',[48,2039,97862]],
 ['8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1',[14,191,2812,43238]],
 ['r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1',[6,264,9467]],
 ['rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8',[44,1486,62379]],
];
let ok=true;
for(const [f,exp] of cases){const g=new L.Chess(f);exp.forEach((e,i)=>{const n=g.perft(i+1);if(n!==e){ok=false;console.log('FAIL',f,i+1,n,e)}});}
console.log('perft',ok?'ALL PASS':'FAILED');
// SAN, mate, stalemate, repetition
let g=new L.Chess();const sq=L.sqIndex;
for(const [a,b] of [['f2','f3'],['e7','e5'],['g2','g4'],['d8','h4']]) g.play(sq(a),sq(b));
console.log(g.history.map(h=>h.san).join(' '), JSON.stringify(g.status()));
g=new L.Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');console.log('stalemate',g.status().reason);
g=new L.Chess();for(let i=0;i<2;i++)for(const [a,b] of [['g1','f3'],['g8','f6'],['f3','g1'],['f6','g8']])g.play(sq(a),sq(b));console.log('rep',g.status().reason);
g=new L.Chess('4k3/P7/8/8/8/8/8/4K3 w - - 0 1');console.log(g.play(sq('a7'),sq('a8'),'N').san);
