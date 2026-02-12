# game/ — Snake II Game Logic

Pure game state and rendering — no Three.js or DOM dependencies (except `lcd.js` which uses Canvas 2D and `splash.js` which loads an image).

## Modules

### snake.js — Game State Machine
- `createGame()` returns the game API (update, getState, setDirection, menu nav, etc.)
- States: `splash | menu | menuLevel | leaderboard | playing | paused | dying | gameover`
- `update(timestamp)` drives the tick loop; returns event objects (`{event: 'ate'}`, etc.)
- Speed controlled by `SPEED_TABLE` — level 1 = 658ms/tick, level 9 = 8ms/tick
- Collision checks exclude the tail on normal moves (it will move away) but include it when growing
- Bonus food spawns every 5-7 nibbles, lasts 20 ticks, scores based on level and remaining time
- "Full" sprite bulge travels down the snake body after eating
- Leaderboard cached in closure; only reads localStorage at init and after saving

### lcd.js — LCD Screen Renderer
- Creates a 200x134 canvas, outputs a `THREE.CanvasTexture` (NearestFilter, no mipmaps)
- Layout: 6px outer padding, 14px header (score + bonus countdown), 2px field border, 23x13 cell grid at 8px/cell
- Draws per state: splash bitmap, menu with scrollbar, level picker with arrows, leaderboard, game field, pause overlay, game over

### fonts.js — Text Rendering
- **3x5 bitmap font**: Hand-coded pixel data for 0-9, A-Z, space, colon, dash, >, ! — drawn at 2x scale via `drawText()` / `drawTextCentered()`
- **Nokia font rasterizer**: Renders NokjaOriginalSmallBold.woff2 at 24px to an offscreen canvas, thresholds alpha to produce crisp 1-bit glyphs — drawn via `drawText7()` / `measureText7()`
- Glyph widths cached per character for the rasterized font

### constants.js — Shared Values
- Grid: `COLS=23`, `ROWS=13`, `CELL=8` pixels
- LCD: `LCD_W=200`, `LCD_H=134`, `BORDER=6`, `HEADER_H=14`
- Colors: `BG_COLOR=#c7cfa1` (Nokia green), `FG_COLOR=#67743c`
- Directions: `DIR_UP=0, DIR_DOWN=1, DIR_LEFT=2, DIR_RIGHT=3` with `DIR_DX`, `DIR_DY`, `DIR_OPPOSITE` lookup arrays
- Sprite index bases: `SPR_HEAD=0`, `SPR_HEAD_OPEN=4`, `SPR_BODY=8`, `SPR_BODY_FULL=12`, `SPR_TURN=16`, `SPR_TURN_FULL=24`, `SPR_TAIL=32`, `SPR_NIBBLE=36`
- `SPEED_TABLE`: 15 speed levels in ms (658 down to 8)

### sprites.js — Bitmap Sprite Data
- 37 small sprites (8x8, stored as byte arrays) + 6 food sprites (16x8, stored as uint16 arrays)
- `drawSprite(ctx, index, px, py)` and `drawFoodSprite(ctx, index, px, py)` render by bit-testing
- `TURN_INDEX[prevDir][newDir]` maps direction pairs to turn sprite offsets

### dispatch.js — Action Router
- `dispatchAction(game, action)` routes actions (`up/down/left/right/ok/back`) to game methods based on current state
- Shared between keyboard input and phone button clicks
- Returns event objects (e.g. `{ event: 'start' }`) or null

### events.js — Event Handler
- `createEventHandler(sounds, isAudioEnabled)` bridges game events to sound effects
- Maps: `moved → move()`, `ate → eat()`, `bonusAte → eatBonus()`, `died → die()`, `start → start()`, `levelUp → levelUp()`

### leaderboard.js — High Score Storage
- `loadLeaderboard()` / `saveToLeaderboard(score)` — top 5 scores in localStorage
- Key: `snake2-top-scores`, sorted descending, graceful fallback on errors

### mazes.js — Campaign Maze Layouts
- 8 mazes (index 0 = empty/free mode, 1-7 = walled)
- Walls defined as `[x, y]` arrays, compiled to `Set<"x,y">` on first access (cached)
- `getMazeBitmap(index)` returns a 2D `Uint8Array` grid for LCD rendering
- Each maze has a starting position in `MAZE_STARTS`

### splash.js — Splash Screen
- Loads `/images/snake2_logo.png`, downscales to 84x48 using area-averaging box filter
- Thresholds at 40% opacity to produce a 1-bit bitmap
- `getSplashBitmap()` returns the bitmap (or null if not loaded)
