# CLAUDE.md - PrintAMaze Project

This file provides guidance to Claude Code when working with this repository.

## Project Overview

PrintAMaze is a lightweight, client-side maze generator that runs entirely in the browser at **printamaze.com**. It generates algorithmic mazes with various themes, shapes, and difficulty levels. Designed for printing puzzles.

**Key insight**: This is the production codebase deployed at printamaze.com. Originally a simplified JavaScript port of the Python-based maze project at `~/Desktop/maze`, it now stands as the primary project. Focuses on fast client-side generation without AI enhancement features.

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
   - 41 shapes: Rectangle, Circle, Heart, Star, Hexagon, Diamond, Triangle, Oval, Cross, Arrow, Moon, Cloud, Tree, House, Cat, Bunny, Rocket, Fish, Butterfly, Castle, Crown, Lightning, Mushroom, Ghost, Pumpkin, Egg, Apple, Flower, Clover, Pacman, Skull, Anchor, MusicNote, Village, Towers, Islands, Compound, Blocks, Archipelago, DolphinJump, TropicalSea, DolphinPod, OceanWaves

3. **Themes**
   - Classic, Ocean, Space, Garden, Candy, Jungle, Dolphin
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
cd ~/Desktop/printamaze  # (local dir may still be named mazejs)
python3 -m http.server 8000
# Visit http://localhost:8000
```

## Difficulty Scaling

Current mapping (internal difficulty 3-17 -> Level 1-15 displayed):
```javascript
const DIFFICULTY_SIZES = {
    3: { w: 5, h: 6 },     // Level 1 - very easy
    4: { w: 7, h: 9 },     // Level 2
    5: { w: 10, h: 13 },   // Level 3
    6: { w: 13, h: 17 },   // Level 4
    7: { w: 17, h: 22 },   // Level 5
    8: { w: 21, h: 27 },   // Level 6
    9: { w: 27, h: 35 },   // Level 7
    10: { w: 33, h: 43 },  // Level 8
    11: { w: 39, h: 50 },  // Level 9
    12: { w: 45, h: 58 },  // Level 10
    13: { w: 51, h: 66 },  // Level 11
    14: { w: 57, h: 74 },  // Level 12
    15: { w: 63, h: 82 },  // Level 13
    16: { w: 69, h: 90 },  // Level 14
    17: { w: 75, h: 98 }   // Level 15 - expert
};
```

## Story Generation System

Each maze generates a themed story with title and quest description.

### Story Templates (scale by difficulty)
- **Levels 1-3 (simple)**: "Help the {character} find the {goal}!"
- **Levels 4-5 (collect)**: "Help the {character} collect the {item} and reach the {goal}!"
- **Levels 6-7 (collectTwo)**: "Help the {character} find the {item1} and {item2}..."
- **Levels 8-10 (full)**: Full quest with items AND dangers to avoid

### Theme Vocabulary
Each theme has character, item, danger, goal, and title word pools:
```javascript
ThemeVocabulary.ocean = {
    characters: ["diver", "mermaid", "sailor", "sea turtle"],
    items: ["pearl", "shell", "starfish", "treasure map"],
    dangers: ["jellyfish", "shark", "whirlpool"],
    goals: ["treasure chest", "sunken ship", "coral palace"],
    adjectives: ["Deep", "Ocean", "Underwater"],
    nouns: ["Dive", "Sea", "Reef", "Voyage"]
}
```

### Enhanced Sentence Cache
Hand-crafted improved versions of generated sentences are cached:
```javascript
// Original: "Help the diver collect the pearl and reach the treasure chest!"
// Enhanced: "Dive deep with the brave diver to find the shimmering pearl..."
addEnhancedSentence(original, enhanced);
```

## Compact Debug Representation

Click the gear icon on any maze card to view the debug output.

### Encoding Format
```
MAZE:7x9|circle|Ocean|S     # dimensions|shape|theme|S=straight/C=curved
START:1,3|2x2               # position|room size
END:4,5|2x2
ROOMS:3,1:2x2;5,3:3x2       # interior rooms
BORDER:waves
SOLUTION:18 cells

GRID:
..B9B..                     # . = blocked
.BASSB.                     # Hex = wall config (N=8,S=4,E=2,W=1)
9SSaaA9                     # S = start room
SSSEA99                     # E = end room
9SEEE9.                     # a,b,c = interior rooms
```

### Wall Encoding (hex digit)
- Bit 3 (8): North wall
- Bit 2 (4): South wall
- Bit 1 (2): East wall
- Bit 0 (1): West wall
- Example: `B` = 1011 = North + East + West walls

### JavaScript API
```javascript
// Generate debug output for AI review
const debug = generateMazeDebugOutput(maze);

// Generate batch of stories for enhancement
const stories = generateStoryBatch('ocean', 100, seed);

// Format for review
console.log(formatStoriesForReview(stories));

// Add enhanced sentence to cache
addEnhancedSentence(original, enhanced);
```

## Future Features (TODO)

### Completed

1. ~~**Story Mode**~~ DONE
   - ~~Grammar template: "Help [character] get [X] and [Y] and avoid [Z] to reach [goal]"~~
   - ~~Theme-based story generation for all 6 themes~~
   - ~~Display story text prominently above the maze~~
   - ~~Quest description below maze~~
   - ~~Difficulty-scaled templates (simple -> full quest)~~
   - ~~Enhanced sentence cache for improved grammar~~

2. ~~**Start/End Rooms**~~ DONE
   - ~~Create 2x2 open spaces at start and end~~
   - ~~Room size scales with maze size~~
   - Allow character art in start room (future)
   - Allow goal art in end room (future)

3. ~~**Arrows and Labels Outside Maze**~~ DONE
   - ~~Position START/END labels outside maze boundary~~
   - ~~Use arrows pointing into/out of maze~~
   - ~~Always black in print mode~~

4. ~~**Harder Difficulty Scaling**~~ DONE
   - ~~Level 10 now 45x58 (was 29x37)~~

5. ~~**Interior Rooms**~~ DONE
   - ~~Carve open spaces in larger mazes~~
   - ~~Variable room sizes (rectangular support)~~
   - ~~3-cell minimum gap between rooms~~
   - Place themed art in rooms (partial - decorations added)

6. ~~**Debug Representation**~~ DONE
   - ~~Compact hex-encoded wall format~~
   - ~~ASCII art output for small mazes~~
   - ~~Stats summary (dimensions, rooms, solution length)~~

### Medium Priority

7. **Curved Walls Mode**
   - Basic implementation done
   - Need UI toggle to enable
   - Refinement for T-junctions

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

## Comparison with Python Maze Project

| Feature | PrintAMaze (this repo) | Python maze (~/Desktop/maze) |
|---------|------------------------|------------------------------|
| Runtime | Client-side JS | Python + Flask |
| AI Art | No | Yes (DALL-E) |
| Themes | 7 built-in | 20+ with AI art |
| Shapes | 41 masks | 16x16 high-res masks |
| Difficulty | 15 levels | 13 levels (age-based) |
| Rooms | Variable size, 3-cell gap | Advanced interior rooms |
| Story Mode | Yes (template-based) | Planned |
| Debug Output | Yes (compact hex) | No |
| Deployment | Static files (TigerTech) | Python WSGI |

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
6. Story titles appear above mazes
7. Quest descriptions appear below mazes
8. Debug button (gear icon) shows compact representation
9. Print output includes title and quest

### Console Testing
```javascript
// Generate batch of stories for review
const stories = generateStoryBatch('ocean', 100);
console.log(formatStoriesForReview(stories));

// Get debug output for a maze
const maze = window.mazeCache[1];
console.log(generateMazeDebugOutput(maze));

// Check compact encoding
console.log(CompactMazeEncoder.encode(maze));
```

## Git Repository

- Remote: github.com/williamsharkey/printamaze (renamed from mazejs)
- Branch: main
