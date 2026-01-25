# CLAUDE.md - MazeJS Project

This file provides guidance to Claude Code when working with this repository.

## Project Overview

MazeJS is a lightweight, client-side maze generator that runs entirely in the browser. It generates algorithmic mazes with various themes, shapes, and difficulty levels. Designed for printing puzzles.

**Key insight**: This is a simplified JavaScript port of the Python-based PrintAMaze project at `~/Desktop/maze`. It focuses on fast client-side generation without AI enhancement features.

## Architecture

### Files

- `index.html` - Main application (HTML + inline CSS + JavaScript)
- `maze.js` - Core maze generation library (algorithms, themes, SVG rendering)

### Key Features

1. **Multiple Algorithms**
   - Recursive Backtracker (Winding) - long passages
   - Prim's (Branching) - shorter dead ends
   - Kruskal's (Random) - uniform distribution

2. **Shape Masks**
   - Rectangle, Circle, Heart, Star, Hexagon, Diamond

3. **Themes**
   - Classic, Ocean, Space, Garden, Candy, Jungle
   - Each has colors, decorations, border patterns

4. **Print Mode**
   - Toggle for black/white output
   - Saved to localStorage

5. **Favorites**
   - Save/load favorite mazes from localStorage
   - Stores seed + all settings

## Deployment

### Target: printamaze.com (TigerTech Hosting)

This is a static site - just HTML, CSS, and JavaScript. No server-side processing needed.

**Quick Deploy:**
```bash
# Copy files to server html directory
scp index.html maze.js printamaze.com@printamaze.com:~/html/

# Or use rsync for efficiency
rsync -avz index.html maze.js printamaze.com@printamaze.com:~/html/
```

**SSH Config (if not already set up):**
```bash
# Add to ~/.ssh/config
Host printamaze
    HostName printamaze.com
    User printamaze.com
    IdentityFile ~/.ssh/printamaze_deploy
```

**Server Credentials:**
- Host: printamaze.com
- User: printamaze.com@printamaze.com
- Web root: ~/html/

### Local Testing
```bash
# Simple HTTP server
cd ~/Desktop/mazejs
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Difficulty Scaling

Current mapping (Level -> Grid Size):
```javascript
const ageDifficulty = {
    3: { w: 5, h: 6 },    // Level 1
    4: { w: 7, h: 9 },    // Level 2
    5: { w: 9, h: 12 },   // Level 3
    6: { w: 11, h: 14 },  // Level 4
    7: { w: 13, h: 17 },  // Level 5
    8: { w: 15, h: 19 },  // Level 6
    9: { w: 17, h: 22 },  // Level 7
    10: { w: 21, h: 27 }, // Level 8
    11: { w: 25, h: 32 }, // Level 9
    12: { w: 29, h: 37 }  // Level 10
};
```

## Future Features (TODO)

### High Priority

1. **Story Mode**
   - Grammar: "Help [character] get [item] and avoid [obstacle] to reach [goal]"
   - Generate story text based on theme
   - Display story above maze

2. **Start/End Rooms**
   - Create 2x2 open spaces at start and end
   - Allow character art in start room
   - Allow goal art in end room

3. **Arrows and Labels Outside Maze**
   - Position START/END labels outside maze boundary
   - Use arrows pointing into/out of maze
   - Always black in print mode

4. **Harder Difficulty Scaling**
   - Level 10 should be more challenging
   - Current max: 29x37, target: ~45x58

### Medium Priority

5. **Interior Rooms**
   - Carve open spaces in larger mazes
   - Place themed art in rooms
   - Rooms on solution path vs off-path

6. **AI Art Generation** (from original project)
   - Photo upload -> custom theme
   - DALL-E integration for artwork

7. **More Themes**
   - Import themes from original `art_themes.py`

### Low Priority

8. **Solution Animation**
   - Animate path through maze

9. **PDF Export**
   - Multi-page PDF with multiple mazes

10. **Mobile Optimization**
    - Touch-friendly UI
    - Better responsive layout

## Comparison with Original PrintAMaze

| Feature | MazeJS | PrintAMaze (~/Desktop/maze) |
|---------|--------|----------------------------|
| Runtime | Client-side JS | Python + Flask |
| AI Art | No | Yes (DALL-E) |
| Themes | 6 built-in | 20+ with AI art |
| Shapes | 6 masks | 16x16 high-res masks |
| Rooms | Basic | Advanced interior rooms |
| Story Mode | Planned | Planned |
| Deployment | Static files | Python WSGI |

## Code Style

- Vanilla JavaScript (no frameworks)
- ES6+ features OK (modern browsers)
- Inline styles in HTML for simplicity
- Single-file approach preferred

## Testing

Open index.html in browser and verify:
1. Mazes generate with all algorithm/shape/theme combinations
2. Print mode toggles colors correctly
3. Favorites save and load properly
4. Infinite scroll loads more mazes
5. Solution overlay works

## Git Repository

- Remote: github.com/williamsharkey/mazejs (private)
- Branch: main
