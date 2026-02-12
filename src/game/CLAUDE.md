# game/ — Snake II Game Logic

Pure game state and rendering — no Three.js or DOM dependencies (except `lcd.js` which uses Canvas 2D and `splash.js` which loads an image).

## Modules

### snake.js — Game State Machine
- `createGame()` returns the game API (update, getState, setDirection, menu nav, etc.)
- States: `splash | menu | menuLevel | playing | paused | dying | gameover`
- `update(timestamp)` drives the tick loop; returns event objects (`{event: 'ate'}`, etc.)
- Speed controlled by `SPEED_TABLE` — level 1 = 658ms/tick, level 9 = 8ms/tick
- Collision checks exclude the tail on normal moves (it will move away) but include it when growing
- Bonus food spawns every 5-7 nibbles, lasts 20 ticks, scores based on level and remaining time
- "Full" sprite bulge travels down the snake body after eating

### lcd.js — LCD Screen Renderer
- Creates a 200×134 canvas, outputs a `THREE.CanvasTexture` (NearestFilter, no mipmaps)
- Layout: 6px outer padding, 14px header (score + bonus countdown), 2px field border, 23×13 cell grid at 8px/cell
- Two text systems: `drawText()` uses a built-in 3×5 pixel font (2× scale), `drawText7()` rasterizes the Nokia `.woff2` web font and thresholds alpha for crisp 1-bit glyphs
- Draws per state: splash bitmap, menu with scrollbar, level picker with arrows, game field, pause overlay, game over

### constants.js — Shared Values
- Grid: `COLS=23`, `ROWS=13`, `CELL=8` pixels
- LCD: `LCD_W=200`, `LCD_H=134`, `BORDER=6`, `HEADER_H=14`
- Colors: `BG_COLOR=#c7cfa1` (Nokia green), `FG_COLOR=#67743c`
- Directions: `DIR_UP=0, DIR_DOWN=1, DIR_LEFT=2, DIR_RIGHT=3`
- Sprite index bases: `SPR_HEAD=0`, `SPR_HEAD_OPEN=4`, `SPR_BODY=8`, `SPR_TURN=16`, `SPR_TAIL=32`, `SPR_NIBBLE=36`
- `SPEED_TABLE`: 15 speed levels in ms (658 down to 8)

### sprites.js — Bitmap Sprite Data
- 37 small sprites (8×8, stored as byte arrays) + 6 food sprites (16×8, stored as uint16 arrays)
- `drawSprite(ctx, index, px, py)` and `drawFoodSprite(ctx, index, px, py)` render by bit-testing
- `TURN_INDEX[prevDir][newDir]` maps direction pairs to turn sprite offsets

### mazes.js — Campaign Maze Layouts
- 8 mazes (index 0 = empty/free mode, 1-7 = walled)
- Walls defined as `[x, y]` arrays, compiled to `Set<"x,y">` on first access (cached)
- `getMazeBitmap(index)` returns a 2D `Uint8Array` grid for LCD rendering
- Each maze has a starting position in `MAZE_STARTS`

### splash.js — Splash Screen
- Loads `/images/snake2_logo.png`, downscales to 84×48 using area-averaging box filter
- Thresholds at 40% opacity to produce a 1-bit bitmap
- `getSplashBitmap()` returns the bitmap (or null if not loaded)
