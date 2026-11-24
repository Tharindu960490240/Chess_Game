# Chess

A complete chess game for the browser with a real 3D board, full rules and a computer opponent.

## Play

Open `index.html` in a browser. Or open `dist/index.html`, a single file with everything built in that you can host anywhere or email.

- **Move:** drag a piece, or tap it and tap a highlighted square.
- **Camera:** drag empty space to orbit, scroll or pinch to zoom, use the reset button to re-centre.
- **Keyboard:** ← → step through moves, Home and End jump, F flips the board, Ctrl+Z takes back a move, Esc cancels a selection.

## Features

- All the rules: castling, en passant, promotion with a piece picker, check, checkmate, stalemate, insufficient material, the 50-move rule and threefold repetition.
- Play a friend on the same device or the computer at Easy, Medium or Hard. The computer thinks in a background worker, so the page never freezes.
- Optional clocks (3+2, 5, 10, 15+10) with increments and time-out handling.
- Move list in standard notation. Click any move to review the position, take moves back, ask for a hint, flip the board, resign, or copy the game as PGN.
- Four board themes, legal-move dots, last-move and check highlights, sound effects, and an option to turn the board after each move.
- Your game and settings are saved in the browser, so a reload picks up where you left off.
- Works on phones and tablets (touch drag) and respects reduced-motion settings. Needs a browser with WebGL (any current Chrome, Edge, Firefox or Safari).

## Project layout

```
index.html        page markup
css/style.css     styles
js/engine.js      rules engine and computer opponent (no dependencies)
js/app.js         built bundle that index.html loads
src/              source for the interface (main.js, board3d.js, sound.js, pieces.js)
assets/pieces/    piece icons (SVG) for the promotion picker and captured pieces
tests/            rules tests (perft counts against known positions)
dist/index.html   single-file build
```

## Develop

```
npm install
npm run build   # rebuilds js/app.js and dist/index.html from src/
npm test        # runs the rules tests
```

## Credits

Piece icons by Colin M.L. Burnett, licensed CC BY-SA 3.0. 3D rendering uses three.js (MIT).
