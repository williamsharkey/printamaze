/**
 * MazeJS - Client-Side Maze Generator with Themes & Shapes
 * Deterministic generation with seeded random
 */

// =============================================================================
// DEBUG SETTINGS - Configurable via debug.html panel
// =============================================================================

const DebugSettings = {
    showBounds: false,
    titleSize: 33,
    titleYOffset: -31,
    titleStroke: 4.2,
    titleOutline: 10,
    titleLetterSpacing: 1.6,
    questSize: 24,
    questYOffset: 2,
    questStroke: 3,
    questOutline: 6,
    questLineSpacing: 35,
    questLetterSpacing: 1.75,
    // START/END labels - all values relative to room dimensions
    startXOffsetPct: 0,        // X offset as % of room width (0 = centered)
    startYOffsetPct: -0.27,    // Y offset as % of room height from bottom (negative = up into room)
    startSizePct: 0.13,        // Text height as % of room width
    startStrokePct: 0.019,     // Stroke as % of room width
    startStrokeMin: 1.5,       // Minimum stroke width in pixels
    startLetterSpacing: 1.75,  // Letter spacing multiplier for START
    endXOffsetPct: 0.01,       // X offset as % of room width (0 = centered)
    endYOffsetPct: -0.3,       // Y offset as % of room height from bottom
    endSizePct: 0.15,          // Text height as % of room width (END is shorter word)
    endStrokePct: 0.027,       // Stroke as % of room width
    endStrokeMin: 0.8,         // Minimum stroke width in pixels
    endLetterSpacing: 1.65,    // Letter spacing multiplier for END
    // Character art - all values relative to room dimensions (center-anchored)
    charXOffsetPct: 0,         // X offset as % of room width (0 = centered)
    charYOffsetPct: -0.14,     // Y offset as % of room height (0 = centered)
    charSizePct: 0.56,         // Art size as % of room width
    charStrokePct: 0.024,      // Stroke as % of room width
    charStrokeMin: 1.3,        // Minimum stroke width in pixels
    // Goal art - all values relative to room dimensions (center-anchored)
    goalXOffsetPct: 0,         // X offset as % of room width (0 = centered)
    goalYOffsetPct: -0.08,     // Y offset as % of room height (0 = centered)
    goalSizePct: 0.71,         // Art size as % of room width
    goalStrokePct: 0.02,       // Stroke as % of room width
    goalStrokeMin: 1.8,        // Minimum stroke width in pixels
    titleAreaHeight: 70,
    questAreaHeight: 120,
    sideMargin: 55,
    topMargin: 15,
    bottomMargin: 15,
    decorScale: 1,
    // Minimum size in inches for each decoration type (page width = 8.5")
    // Set to 0 to always show, higher values filter out small decorations
    minCornerDecorInches: 0,   // Corner/mask area decorations
    minRoomDecorInches: 0,     // Interior room decorations (multi-cell rooms)
    minScatterDecorInches: 0.34, // Scattered decorations in paths/dead ends
    // Corner decorations (outside mask area) - stroke as % of decoration size
    cornerDecorStrokePct: 0.03,
    cornerDecorStrokeMin: 0.5,
    // Room decorations (interior rooms) - stroke as % of decoration size
    roomDecorStrokePct: 0.03,
    roomDecorStrokeMin: 0.5,
    // Scattered decorations (paths/dead ends) - stroke as % of decoration size
    scatterDecorStrokePct: 0.04,
    scatterDecorStrokeMin: 0.4
};

// Global function to apply debug settings from parent debug.html
window.applyDebugSettings = function(settings) {
    Object.assign(DebugSettings, settings);
    // Trigger re-render of all visible mazes
    if (window.refreshAllMazes) {
        window.refreshAllMazes();
    }
};

// =============================================================================
// VECTOR FONT SYSTEM - Hershey-style pen plotter font
// =============================================================================

// Each letter is defined as an array of strokes. Each stroke is an array of [x,y] points.
// Coordinates are in a 5x7 grid (width x height), scaled at render time.
const VectorFont = {
    charWidth: 5,
    charHeight: 7,

    // Letter definitions - each is array of strokes (polylines)
    glyphs: {
        'A': [[[0,7],[2.5,0],[5,7]], [[1,4.5],[4,4.5]]],
        'B': [[[0,0],[0,7],[4,7],[5,6],[5,5],[4,4],[0,4]], [[4,4],[5,3],[5,1],[4,0],[0,0]]],
        'C': [[[5,1],[4,0],[1,0],[0,1],[0,6],[1,7],[4,7],[5,6]]],
        'D': [[[0,0],[0,7],[3,7],[5,5],[5,2],[3,0],[0,0]]],
        'E': [[[5,0],[0,0],[0,7],[5,7]], [[0,3.5],[3,3.5]]],
        'F': [[[5,0],[0,0],[0,7]], [[0,3.5],[3,3.5]]],
        'G': [[[5,1],[4,0],[1,0],[0,1],[0,6],[1,7],[4,7],[5,6],[5,4],[2.5,4]]],
        'H': [[[0,0],[0,7]], [[5,0],[5,7]], [[0,3.5],[5,3.5]]],
        'I': [[[1,0],[4,0]], [[2.5,0],[2.5,7]], [[1,7],[4,7]]],
        'J': [[[2,0],[5,0]], [[3.5,0],[3.5,6],[2.5,7],[1,7],[0,6]]],
        'K': [[[0,0],[0,7]], [[5,0],[0,4],[5,7]]],
        'L': [[[0,0],[0,7],[5,7]]],
        'M': [[[0,7],[0,0],[2.5,4],[5,0],[5,7]]],
        'N': [[[0,7],[0,0],[5,7],[5,0]]],
        'O': [[[1,0],[4,0],[5,1],[5,6],[4,7],[1,7],[0,6],[0,1],[1,0]]],
        'P': [[[0,7],[0,0],[4,0],[5,1],[5,3],[4,4],[0,4]]],
        'Q': [[[1,0],[4,0],[5,1],[5,6],[4,7],[1,7],[0,6],[0,1],[1,0]], [[3,5],[5,7]]],
        'R': [[[0,7],[0,0],[4,0],[5,1],[5,3],[4,4],[0,4]], [[2.5,4],[5,7]]],
        'S': [[[5,1],[4,0],[1,0],[0,1],[0,3],[1,4],[4,4],[5,5],[5,6],[4,7],[1,7],[0,6]]],
        'T': [[[0,0],[5,0]], [[2.5,0],[2.5,7]]],
        'U': [[[0,0],[0,6],[1,7],[4,7],[5,6],[5,0]]],
        'V': [[[0,0],[2.5,7],[5,0]]],
        'W': [[[0,0],[1,7],[2.5,3],[4,7],[5,0]]],
        'X': [[[0,0],[5,7]], [[5,0],[0,7]]],
        'Y': [[[0,0],[2.5,3.5],[5,0]], [[2.5,3.5],[2.5,7]]],
        'Z': [[[0,0],[5,0],[0,7],[5,7]]],
        '0': [[[1,0],[4,0],[5,1],[5,6],[4,7],[1,7],[0,6],[0,1],[1,0]], [[0,7],[5,0]]],
        '1': [[[1,1],[2.5,0],[2.5,7]], [[1,7],[4,7]]],
        '2': [[[0,1],[1,0],[4,0],[5,1],[5,3],[0,7],[5,7]]],
        '3': [[[0,1],[1,0],[4,0],[5,1],[5,2],[4,3],[2,3]], [[4,3],[5,4],[5,6],[4,7],[1,7],[0,6]]],
        '4': [[[4,7],[4,0],[0,4.5],[5,4.5]]],
        '5': [[[5,0],[0,0],[0,3],[4,3],[5,4],[5,6],[4,7],[1,7],[0,6]]],
        '6': [[[4,0],[1,0],[0,1],[0,6],[1,7],[4,7],[5,6],[5,4],[4,3],[0,3]]],
        '7': [[[0,0],[5,0],[2,7]]],
        '8': [[[1,0],[4,0],[5,1],[5,3],[4,3.5],[1,3.5],[0,4],[0,6],[1,7],[4,7],[5,6],[5,4],[4,3.5]], [[1,3.5],[0,3],[0,1],[1,0]]],
        '9': [[[1,7],[4,7],[5,6],[5,1],[4,0],[1,0],[0,1],[0,3],[1,4],[5,4]]],
        ' ': [],
        '.': [[[2.5,6.5],[2.5,7]]],
        ',': [[[2.5,6],[2,7.5]]],
        '!': [[[2.5,0],[2.5,4.5]], [[2.5,6.5],[2.5,7]]],
        '?': [[[0,1],[1,0],[4,0],[5,1],[5,2],[4,3],[2.5,3],[2.5,4.5]], [[2.5,6.5],[2.5,7]]],
        '-': [[[1,3.5],[4,3.5]]],
        "'": [[[2.5,0],[2.5,2]]],
        ':': [[[2.5,2],[2.5,2.5]], [[2.5,5.5],[2.5,6]]],
        '/': [[[0,7],[5,0]]],
        '(': [[[3,0],[1.5,1],[1,3.5],[1.5,6],[3,7]]],
        ')': [[[2,0],[3.5,1],[4,3.5],[3.5,6],[2,7]]]
    },

    // Render text as SVG path
    renderText(text, x, y, height, color = '#000', strokeWidth = 1.0, letterSpacing = 1.0) {
        const scale = height / this.charHeight;
        const charW = this.charWidth * scale;
        const spacing = charW * 0.2 * letterSpacing;
        let paths = [];
        let curX = x;

        for (const char of text.toUpperCase()) {
            const glyph = this.glyphs[char];
            if (glyph) {
                for (const stroke of glyph) {
                    if (stroke.length > 0) {
                        const d = stroke.map((pt, i) =>
                            `${i === 0 ? 'M' : 'L'}${curX + pt[0] * scale},${y + pt[1] * scale}`
                        ).join(' ');
                        paths.push(d);
                    }
                }
            }
            curX += charW + spacing;
        }

        if (paths.length === 0) return '';
        return `<path d="${paths.join(' ')}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
    },

    // Measure text width
    measureText(text, height, letterSpacing = 1.0) {
        const scale = height / this.charHeight;
        const charW = this.charWidth * scale;
        const spacing = charW * 0.2 * letterSpacing;
        return text.length * (charW + spacing) - spacing;
    },

    // Render text centered at position
    renderCentered(text, centerX, y, height, color = '#000', strokeWidth = 1.0, letterSpacing = 1.0) {
        const width = this.measureText(text, height, letterSpacing);
        return this.renderText(text, centerX - width / 2, y, height, color, strokeWidth, letterSpacing);
    }
};

// Seeded Random Number Generator (Mulberry32)
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    nextInt(min, max) {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }

    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    choice(array) {
        return array[Math.floor(this.next() * array.length)];
    }
}

// Shape Masks
const ShapeMasks = {
    rectangle: (x, y, w, h) => true,

    circle: (x, y, w, h) => {
        const cx = (w - 1) / 2;
        const cy = (h - 1) / 2;
        const rx = w / 2;
        const ry = h / 2;
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        return dx * dx + dy * dy <= 1;
    },

    heart: (x, y, w, h) => {
        const nx = (x / (w - 1)) * 2 - 1;
        const ny = 1 - (y / (h - 1)) * 2;
        const v = nx * nx + Math.pow(ny - Math.sqrt(Math.abs(nx)), 2);
        return v <= 1;
    },

    star: (x, y, w, h) => {
        const cx = (w - 1) / 2;
        const cy = (h - 1) / 2;
        const dx = x - cx;
        const dy = y - cy;
        const angle = Math.atan2(dy, dx);
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxR = Math.min(cx, cy);
        const points = 5;
        const innerR = maxR * 0.4;
        const outerR = maxR;
        const a = ((angle + Math.PI * 2) % (Math.PI * 2 / points)) / (Math.PI / points);
        const r = a < 1 ? innerR + (outerR - innerR) * (1 - a) : innerR + (outerR - innerR) * (a - 1);
        return dist <= r;
    },

    hexagon: (x, y, w, h) => {
        const cx = (w - 1) / 2;
        const cy = (h - 1) / 2;
        const dx = Math.abs(x - cx) / cx;
        const dy = Math.abs(y - cy) / cy;
        return dx <= 1 && dy <= 1 && dx + dy * 0.5 <= 1;
    },

    diamond: (x, y, w, h) => {
        const cx = (w - 1) / 2;
        const cy = (h - 1) / 2;
        const dx = Math.abs(x - cx) / cx;
        const dy = Math.abs(y - cy) / cy;
        return dx + dy <= 1;
    },

    // Triangle pointing up
    triangle: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        const halfWidth = 0.5 * (1 - ny);
        return nx >= 0.5 - halfWidth && nx <= 0.5 + halfWidth;
    },

    // Oval (taller ellipse)
    oval: (x, y, w, h) => {
        const cx = (w - 1) / 2;
        const cy = (h - 1) / 2;
        const rx = w / 2.5;
        const ry = h / 2;
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        return dx * dx + dy * dy <= 1;
    },

    // Cross/Plus shape
    cross: (x, y, w, h) => {
        const nx = Math.abs(x - (w - 1) / 2) / ((w - 1) / 2);
        const ny = Math.abs(y - (h - 1) / 2) / ((h - 1) / 2);
        return nx <= 0.35 || ny <= 0.35;
    },

    // Arrow pointing up
    arrow: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Arrow head (top portion)
        if (ny <= 0.5) {
            const halfWidth = 0.5 * (1 - ny * 2);
            return nx >= 0.5 - halfWidth && nx <= 0.5 + halfWidth;
        }
        // Arrow shaft
        return nx >= 0.35 && nx <= 0.65;
    },

    // Crescent moon
    moon: (x, y, w, h) => {
        const cx = (w - 1) / 2;
        const cy = (h - 1) / 2;
        const r = Math.min(w, h) / 2;
        const dx1 = x - cx;
        const dy1 = y - cy;
        const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const dx2 = x - (cx + r * 0.4);
        const dy2 = y - cy;
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        return dist1 <= r && dist2 > r * 0.85;
    },

    // Cloud shape
    cloud: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Multiple overlapping circles
        const c1 = Math.pow(nx - 0.3, 2) + Math.pow(ny - 0.6, 2) <= 0.08;
        const c2 = Math.pow(nx - 0.5, 2) + Math.pow(ny - 0.5, 2) <= 0.1;
        const c3 = Math.pow(nx - 0.7, 2) + Math.pow(ny - 0.6, 2) <= 0.08;
        const c4 = Math.pow(nx - 0.4, 2) + Math.pow(ny - 0.65, 2) <= 0.06;
        const c5 = Math.pow(nx - 0.6, 2) + Math.pow(ny - 0.65, 2) <= 0.06;
        return c1 || c2 || c3 || c4 || c5;
    },

    // Christmas tree
    tree: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Trunk
        if (ny > 0.85) return nx >= 0.4 && nx <= 0.6;
        // Tree layers (3 triangles)
        const layer1 = ny <= 0.35 && nx >= 0.5 - (0.35 - ny) * 0.8 && nx <= 0.5 + (0.35 - ny) * 0.8;
        const layer2 = ny > 0.25 && ny <= 0.6 && nx >= 0.5 - (0.6 - ny) * 0.7 && nx <= 0.5 + (0.6 - ny) * 0.7;
        const layer3 = ny > 0.5 && ny <= 0.85 && nx >= 0.5 - (0.85 - ny) * 0.6 && nx <= 0.5 + (0.85 - ny) * 0.6;
        return layer1 || layer2 || layer3;
    },

    // House shape
    house: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Roof (triangle)
        if (ny <= 0.4) {
            const halfWidth = 0.5 * (ny / 0.4);
            return nx >= 0.5 - halfWidth && nx <= 0.5 + halfWidth;
        }
        // Walls
        return nx >= 0.15 && nx <= 0.85;
    },

    // Cat face
    cat: (x, y, w, h) => {
        const cx = (w - 1) / 2;
        const cy = (h - 1) / 2;
        const r = Math.min(w, h) / 2.2;
        const dx = x - cx;
        const dy = y - cy;
        // Main face (circle)
        const face = dx * dx + dy * dy <= r * r;
        // Left ear
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        const leftEar = ny < 0.3 && nx < 0.35 && nx > 0.1 && ny > nx - 0.1;
        const rightEar = ny < 0.3 && nx > 0.65 && nx < 0.9 && ny > (1 - nx) - 0.1;
        return face || leftEar || rightEar;
    },

    // Bunny
    bunny: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Head (oval)
        const head = Math.pow((nx - 0.5) / 0.35, 2) + Math.pow((ny - 0.65) / 0.3, 2) <= 1;
        // Left ear
        const leftEar = Math.pow((nx - 0.35) / 0.1, 2) + Math.pow((ny - 0.25) / 0.25, 2) <= 1;
        // Right ear
        const rightEar = Math.pow((nx - 0.65) / 0.1, 2) + Math.pow((ny - 0.25) / 0.25, 2) <= 1;
        return head || leftEar || rightEar;
    },

    // Rocket
    rocket: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Nose cone
        if (ny <= 0.2) {
            const halfWidth = 0.15 * (ny / 0.2);
            return nx >= 0.5 - halfWidth && nx <= 0.5 + halfWidth;
        }
        // Body
        if (ny <= 0.75) return nx >= 0.35 && nx <= 0.65;
        // Fins
        const leftFin = nx >= 0.15 && nx <= 0.35 && ny >= 0.75;
        const rightFin = nx >= 0.65 && nx <= 0.85 && ny >= 0.75;
        const body = nx >= 0.35 && nx <= 0.65;
        return leftFin || rightFin || body;
    },

    // Fish
    fish: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Body (ellipse)
        const body = Math.pow((nx - 0.4) / 0.35, 2) + Math.pow((ny - 0.5) / 0.3, 2) <= 1;
        // Tail
        const tail = nx >= 0.7 && Math.abs(ny - 0.5) <= (nx - 0.7) * 1.5;
        return body || tail;
    },

    // Butterfly
    butterfly: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Upper left wing
        const ul = Math.pow((nx - 0.25) / 0.25, 2) + Math.pow((ny - 0.35) / 0.3, 2) <= 1;
        // Upper right wing
        const ur = Math.pow((nx - 0.75) / 0.25, 2) + Math.pow((ny - 0.35) / 0.3, 2) <= 1;
        // Lower left wing
        const ll = Math.pow((nx - 0.3) / 0.2, 2) + Math.pow((ny - 0.7) / 0.2, 2) <= 1;
        // Lower right wing
        const lr = Math.pow((nx - 0.7) / 0.2, 2) + Math.pow((ny - 0.7) / 0.2, 2) <= 1;
        // Body
        const body = nx >= 0.45 && nx <= 0.55;
        return ul || ur || ll || lr || body;
    },

    // Castle
    castle: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Towers (top)
        const tower1 = nx >= 0.05 && nx <= 0.2 && ny <= 0.5;
        const tower2 = nx >= 0.4 && nx <= 0.6 && ny <= 0.35;
        const tower3 = nx >= 0.8 && nx <= 0.95 && ny <= 0.5;
        // Main wall
        const wall = ny >= 0.35 && ny <= 0.9 && nx >= 0.1 && nx <= 0.9;
        // Battlements
        const batt = ny <= 0.4 && ny >= 0.35 && ((nx >= 0.15 && nx <= 0.25) || (nx >= 0.35 && nx <= 0.45) || (nx >= 0.55 && nx <= 0.65) || (nx >= 0.75 && nx <= 0.85));
        return tower1 || tower2 || tower3 || wall || batt;
    },

    // Crown
    crown: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Base
        if (ny >= 0.7) return nx >= 0.15 && nx <= 0.85;
        // Points
        if (ny >= 0.3) {
            // 5 points
            const seg = (nx - 0.15) / 0.7;
            const point = seg * 5;
            const pointIdx = Math.floor(point);
            const pointPos = point - pointIdx;
            if (pointIdx % 2 === 0) {
                // Going up
                return ny >= 0.7 - pointPos * 0.4;
            } else {
                // Going down
                return ny >= 0.3 + pointPos * 0.4;
            }
        }
        return false;
    },

    // Lightning bolt
    lightning: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Top diagonal
        if (ny <= 0.45) {
            const target = 0.3 + ny * 0.6;
            return nx >= target - 0.15 && nx <= target + 0.1;
        }
        // Middle
        if (ny <= 0.55) {
            return nx >= 0.35 && nx <= 0.75;
        }
        // Bottom diagonal
        const target = 0.7 - (ny - 0.55) * 0.8;
        return nx >= target - 0.1 && nx <= target + 0.15;
    },

    // Mushroom
    mushroom: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Cap (half circle)
        if (ny <= 0.5) {
            return Math.pow((nx - 0.5) / 0.45, 2) + Math.pow((ny - 0.5) / 0.45, 2) <= 1 && ny <= 0.5;
        }
        // Stem
        return nx >= 0.35 && nx <= 0.65;
    },

    // Ghost
    ghost: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Head (half circle)
        if (ny <= 0.5) {
            return Math.pow((nx - 0.5) / 0.35, 2) + Math.pow((ny - 0.5) / 0.4, 2) <= 1;
        }
        // Body with wavy bottom
        if (ny <= 0.9) {
            return nx >= 0.15 && nx <= 0.85;
        }
        // Wavy bottom
        const wave = Math.sin(nx * Math.PI * 4) * 0.05;
        return nx >= 0.15 && nx <= 0.85 && ny <= 0.95 + wave;
    },

    // Pumpkin
    pumpkin: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Stem
        if (ny <= 0.15) {
            return nx >= 0.45 && nx <= 0.55;
        }
        // Main body (slightly squashed circle with segments)
        const body = Math.pow((nx - 0.5) / 0.45, 2) + Math.pow((ny - 0.55) / 0.4, 2) <= 1;
        return body;
    },

    // Egg
    egg: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Modified ellipse (wider at bottom)
        const widthFactor = 0.3 + ny * 0.15;
        return Math.pow((nx - 0.5) / widthFactor, 2) + Math.pow((ny - 0.5) / 0.45, 2) <= 1;
    },

    // Apple
    apple: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Stem
        if (ny <= 0.15 && nx >= 0.45 && nx <= 0.55) return true;
        // Leaf
        if (ny <= 0.25 && ny >= 0.1 && nx >= 0.55 && nx <= 0.7) return true;
        // Body (heart-ish shape inverted)
        const body = Math.pow((nx - 0.5) / 0.4, 2) + Math.pow((ny - 0.55) / 0.4, 2) <= 1;
        // Indent at top
        const indent = ny <= 0.35 && Math.pow((nx - 0.5) / 0.15, 2) + Math.pow((ny - 0.2) / 0.15, 2) <= 1;
        return body && !indent;
    },

    // Flower
    flower: (x, y, w, h) => {
        const cx = (w - 1) / 2;
        const cy = (h - 1) / 2;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxR = Math.min(cx, cy);
        // Center
        if (dist <= maxR * 0.25) return true;
        // Petals (5)
        const angle = Math.atan2(dy, dx);
        const petalAngle = ((angle + Math.PI * 2) % (Math.PI * 2 / 5)) - Math.PI / 5;
        const petalDist = Math.abs(petalAngle) / (Math.PI / 5);
        const r = maxR * 0.25 + (1 - petalDist) * maxR * 0.6;
        return dist <= r;
    },

    // Clover (4 leaf)
    clover: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Four leaves
        const tl = Math.pow((nx - 0.35) / 0.2, 2) + Math.pow((ny - 0.35) / 0.2, 2) <= 1;
        const tr = Math.pow((nx - 0.65) / 0.2, 2) + Math.pow((ny - 0.35) / 0.2, 2) <= 1;
        const bl = Math.pow((nx - 0.35) / 0.2, 2) + Math.pow((ny - 0.65) / 0.2, 2) <= 1;
        const br = Math.pow((nx - 0.65) / 0.2, 2) + Math.pow((ny - 0.65) / 0.2, 2) <= 1;
        // Stem
        const stem = nx >= 0.47 && nx <= 0.53 && ny >= 0.7;
        return tl || tr || bl || br || stem;
    },

    // Pac-Man
    pacman: (x, y, w, h) => {
        const cx = (w - 1) / 2;
        const cy = (h - 1) / 2;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const r = Math.min(cx, cy);
        const angle = Math.atan2(dy, dx);
        // Circle minus mouth wedge
        const mouth = angle > -Math.PI / 4 && angle < Math.PI / 4;
        return dist <= r && !mouth;
    },

    // Skull
    skull: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Top of skull (circle)
        const top = ny <= 0.6 && Math.pow((nx - 0.5) / 0.4, 2) + Math.pow((ny - 0.4) / 0.35, 2) <= 1;
        // Jaw
        const jaw = ny >= 0.55 && ny <= 0.85 && nx >= 0.25 && nx <= 0.75;
        // Eye holes (subtract)
        const leftEye = Math.pow((nx - 0.35) / 0.1, 2) + Math.pow((ny - 0.4) / 0.1, 2) <= 1;
        const rightEye = Math.pow((nx - 0.65) / 0.1, 2) + Math.pow((ny - 0.4) / 0.1, 2) <= 1;
        return (top || jaw) && !leftEye && !rightEye;
    },

    // Anchor
    anchor: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Ring at top
        const ring = ny <= 0.2 && Math.pow((nx - 0.5) / 0.1, 2) + Math.pow((ny - 0.1) / 0.1, 2) <= 1 && Math.pow((nx - 0.5) / 0.05, 2) + Math.pow((ny - 0.1) / 0.05, 2) > 1;
        // Vertical shaft
        const shaft = nx >= 0.47 && nx <= 0.53 && ny >= 0.15 && ny <= 0.85;
        // Cross bar
        const crossbar = ny >= 0.25 && ny <= 0.3 && nx >= 0.3 && nx <= 0.7;
        // Bottom curve
        const bottomCurve = ny >= 0.7 && Math.pow((nx - 0.5) / 0.35, 2) + Math.pow((ny - 0.7) / 0.2, 2) <= 1 && ny >= 0.75;
        // Flukes
        const leftFluke = nx >= 0.15 && nx <= 0.3 && ny >= 0.8 && ny <= 0.95;
        const rightFluke = nx >= 0.7 && nx <= 0.85 && ny >= 0.8 && ny <= 0.95;
        return ring || shaft || crossbar || bottomCurve || leftFluke || rightFluke;
    },

    // Music note
    musicNote: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Note head (oval)
        const head = Math.pow((nx - 0.35) / 0.15, 2) + Math.pow((ny - 0.75) / 0.12, 2) <= 1;
        // Stem
        const stem = nx >= 0.48 && nx <= 0.52 && ny >= 0.15 && ny <= 0.75;
        // Flag
        const flag = nx >= 0.5 && nx <= 0.7 && ny >= 0.15 && ny <= 0.4 && ny >= 0.15 + (nx - 0.5) * 0.5;
        return head || stem || flag;
    },

    // === BUILDING MASKS - Thin corridors only work at high resolution ===

    // Village: 4 small houses with very thin paths between them
    // At low resolution, paths won't be wide enough to sample
    village: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Four houses in corners
        const house1 = nx >= 0.05 && nx <= 0.35 && ny >= 0.05 && ny <= 0.35;
        const house2 = nx >= 0.65 && nx <= 0.95 && ny >= 0.05 && ny <= 0.35;
        const house3 = nx >= 0.05 && nx <= 0.35 && ny >= 0.65 && ny <= 0.95;
        const house4 = nx >= 0.65 && nx <= 0.95 && ny >= 0.65 && ny <= 0.95;
        // Thin corridors (2-3% width - only visible at high resolution)
        const corridor = 0.02;
        const hPath1 = ny >= 0.49 - corridor && ny <= 0.51 + corridor && nx >= 0.35 && nx <= 0.65; // horizontal center
        const vPath1 = nx >= 0.49 - corridor && nx <= 0.51 + corridor && ny >= 0.35 && ny <= 0.65; // vertical center
        const hPath2 = ny >= 0.19 - corridor && ny <= 0.21 + corridor && nx >= 0.35 && nx <= 0.65; // top horizontal
        const hPath3 = ny >= 0.79 - corridor && ny <= 0.81 + corridor && nx >= 0.35 && nx <= 0.65; // bottom horizontal
        return house1 || house2 || house3 || house4 || hPath1 || vPath1 || hPath2 || hPath3;
    },

    // Towers: 3 tall thin towers with hairline bridges
    towers: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Three towers
        const tower1 = nx >= 0.1 && nx <= 0.25 && ny >= 0.1 && ny <= 0.9;
        const tower2 = nx >= 0.42 && nx <= 0.58 && ny >= 0.05 && ny <= 0.95;
        const tower3 = nx >= 0.75 && nx <= 0.9 && ny >= 0.1 && ny <= 0.9;
        // Very thin bridges (1.5% - nearly invisible at low res)
        const bridge = 0.015;
        const b1 = ny >= 0.3 - bridge && ny <= 0.3 + bridge && nx >= 0.25 && nx <= 0.42;
        const b2 = ny >= 0.3 - bridge && ny <= 0.3 + bridge && nx >= 0.58 && nx <= 0.75;
        const b3 = ny >= 0.7 - bridge && ny <= 0.7 + bridge && nx >= 0.25 && nx <= 0.42;
        const b4 = ny >= 0.7 - bridge && ny <= 0.7 + bridge && nx >= 0.58 && nx <= 0.75;
        return tower1 || tower2 || tower3 || b1 || b2 || b3 || b4;
    },

    // Islands: Scattered small islands with threadlike connections
    islands: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // 6 small islands of varying sizes
        const i1 = Math.pow((nx - 0.15) / 0.12, 2) + Math.pow((ny - 0.2) / 0.12, 2) <= 1;
        const i2 = Math.pow((nx - 0.5) / 0.15, 2) + Math.pow((ny - 0.15) / 0.1, 2) <= 1;
        const i3 = Math.pow((nx - 0.85) / 0.1, 2) + Math.pow((ny - 0.25) / 0.15, 2) <= 1;
        const i4 = Math.pow((nx - 0.2) / 0.14, 2) + Math.pow((ny - 0.75) / 0.14, 2) <= 1;
        const i5 = Math.pow((nx - 0.5) / 0.18, 2) + Math.pow((ny - 0.6) / 0.12, 2) <= 1;
        const i6 = Math.pow((nx - 0.8) / 0.12, 2) + Math.pow((ny - 0.8) / 0.12, 2) <= 1;
        // Threadlike bridges (1% width - only works at very high res)
        const t = 0.01;
        const b1 = Math.abs(ny - (0.2 + (nx - 0.15) * 0.1)) <= t && nx >= 0.15 && nx <= 0.5;
        const b2 = Math.abs(ny - (0.15 + (nx - 0.5) * 0.3)) <= t && nx >= 0.5 && nx <= 0.85;
        const b3 = Math.abs(ny - (0.6 - (nx - 0.2) * 0.5)) <= t && nx >= 0.2 && nx <= 0.5;
        const b4 = Math.abs(ny - (0.6 + (nx - 0.5) * 0.65)) <= t && nx >= 0.5 && nx <= 0.8;
        return i1 || i2 || i3 || i4 || i5 || i6 || b1 || b2 || b3 || b4;
    },

    // Compound: Main building with small outbuildings, connected by thin paths
    compound: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Main central building
        const main = nx >= 0.3 && nx <= 0.7 && ny >= 0.35 && ny <= 0.75;
        // Four small outbuildings
        const out1 = nx >= 0.05 && nx <= 0.2 && ny >= 0.1 && ny <= 0.3;
        const out2 = nx >= 0.8 && nx <= 0.95 && ny >= 0.1 && ny <= 0.3;
        const out3 = nx >= 0.05 && nx <= 0.2 && ny >= 0.7 && ny <= 0.9;
        const out4 = nx >= 0.8 && nx <= 0.95 && ny >= 0.7 && ny <= 0.9;
        // Thin diagonal paths (1.5% wide)
        const t = 0.015;
        const p1 = Math.abs((ny - 0.3) - (nx - 0.2) * 0.5) <= t && nx >= 0.2 && nx <= 0.3;
        const p2 = Math.abs((ny - 0.3) + (nx - 0.8) * 0.5) <= t && nx >= 0.7 && nx <= 0.8;
        const p3 = Math.abs((ny - 0.7) + (nx - 0.2) * 0.5) <= t && nx >= 0.2 && nx <= 0.3;
        const p4 = Math.abs((ny - 0.7) - (nx - 0.8) * 0.5) <= t && nx >= 0.7 && nx <= 0.8;
        return main || out1 || out2 || out3 || out4 || p1 || p2 || p3 || p4;
    },

    // Blocks: City blocks with alleyways
    blocks: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // 9 city blocks in a 3x3 grid with thin alleys
        const alley = 0.02;
        const gapX = (nx > 0.32 - alley && nx < 0.32 + alley) || (nx > 0.67 - alley && nx < 0.67 + alley);
        const gapY = (ny > 0.32 - alley && ny < 0.32 + alley) || (ny > 0.67 - alley && ny < 0.67 + alley);
        // Include alleys only when within outer bounds
        const inBounds = nx >= 0.05 && nx <= 0.95 && ny >= 0.05 && ny <= 0.95;
        const isAlley = inBounds && (gapX || gapY);
        // Blocks are the spaces between alleys
        const isBlock = inBounds && !((nx > 0.3 && nx < 0.34) || (nx > 0.65 && nx < 0.69) ||
                                       (ny > 0.3 && ny < 0.34) || (ny > 0.65 && ny < 0.69));
        return isBlock || isAlley;
    },

    // Archipelago: Many tiny islands, some completely unreachable
    archipelago: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);
        // Many small scattered islands (some will be unreachable)
        const islands = [];
        const positions = [
            [0.1, 0.1, 0.08], [0.3, 0.08, 0.06], [0.55, 0.12, 0.09], [0.8, 0.1, 0.07],
            [0.15, 0.35, 0.1], [0.45, 0.3, 0.08], [0.75, 0.35, 0.09],
            [0.08, 0.6, 0.07], [0.35, 0.55, 0.11], [0.6, 0.58, 0.07], [0.88, 0.55, 0.08],
            [0.2, 0.85, 0.09], [0.5, 0.82, 0.08], [0.75, 0.88, 0.1]
        ];
        for (const [cx, cy, r] of positions) {
            if (Math.pow((nx - cx) / r, 2) + Math.pow((ny - cy) / r, 2) <= 1) return true;
        }
        // Only a few threadlike connections (many islands unreachable by design)
        const t = 0.012;
        const c1 = Math.abs(ny - 0.35 - (nx - 0.15) * 0.15) <= t && nx >= 0.15 && nx <= 0.45;
        const c2 = Math.abs(ny - 0.55 + (nx - 0.35) * 0.25) <= t && nx >= 0.35 && nx <= 0.6;
        const c3 = Math.abs(ny - 0.82 - (nx - 0.5) * 0.25) <= t && nx >= 0.5 && nx <= 0.75;
        return c1 || c2 || c3;
    },

    // =============================================================================
    // DOLPHIN THEME-SPECIFIC MASKS - Educational marine scenes
    // =============================================================================

    // Dolphin jumping out of water with waves
    // Educational: Shows iconic breaching behavior dolphins use for communication
    dolphinJump: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);

        // Dolphin body - curved jumping arc
        // Main body curve
        const bodyCx = 0.5, bodyCy = 0.35;
        const bodyRx = 0.25, bodyRy = 0.15;
        // Rotated ellipse for jumping angle
        const angle = -0.4; // tilted forward
        const cosA = Math.cos(angle), sinA = Math.sin(angle);
        const dxBody = nx - bodyCx, dyBody = ny - bodyCy;
        const rotX = dxBody * cosA + dyBody * sinA;
        const rotY = -dxBody * sinA + dyBody * cosA;
        const inBody = (rotX * rotX) / (bodyRx * bodyRx) + (rotY * rotY) / (bodyRy * bodyRy) <= 1;

        // Rostrum (beak)
        const rostrumStart = 0.7, rostrumWidth = 0.08;
        const inRostrum = nx >= rostrumStart && nx <= 0.85 &&
            Math.abs(ny - (0.3 + (nx - rostrumStart) * 0.3)) <= rostrumWidth * (1 - (nx - rostrumStart) / 0.15);

        // Dorsal fin
        const dorsalX = 0.45, dorsalY = 0.25;
        const inDorsal = nx >= dorsalX && nx <= dorsalX + 0.12 &&
            ny >= dorsalY - 0.15 && ny <= dorsalY &&
            ny <= dorsalY - (nx - dorsalX) * 0.8 &&
            ny >= dorsalY - 0.15 + (nx - dorsalX) * 0.5;

        // Tail fluke
        const flukeX = 0.2, flukeY = 0.45;
        const inUpperFluke = Math.pow((nx - flukeX) / 0.08, 2) + Math.pow((ny - (flukeY - 0.06)) / 0.05, 2) <= 1;
        const inLowerFluke = Math.pow((nx - flukeX) / 0.08, 2) + Math.pow((ny - (flukeY + 0.06)) / 0.05, 2) <= 1;

        // Water/waves at bottom
        const waveBase = 0.7;
        const waveAmp = 0.06;
        const waveFreq = 4;
        const waveLine = waveBase + Math.sin(nx * Math.PI * waveFreq) * waveAmp;
        const inWater = ny >= waveLine && ny <= 1;

        // Splash near dolphin entry point
        const splashCx = 0.25, splashCy = 0.6;
        const inSplash = Math.pow((nx - splashCx) / 0.1, 2) + Math.pow((ny - splashCy) / 0.15, 2) <= 1;

        return inBody || inRostrum || inDorsal || inUpperFluke || inLowerFluke || inWater || inSplash;
    },

    // Tropical ocean scene with palm trees and moon
    // Educational: Shows coastal habitat where dolphins are often spotted
    tropicalSea: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);

        // Moon in upper right
        const moonCx = 0.8, moonCy = 0.15, moonR = 0.1;
        const inMoon = Math.pow((nx - moonCx) / moonR, 2) + Math.pow((ny - moonCy) / moonR, 2) <= 1;

        // Palm tree on left island
        // Trunk
        const trunkX = 0.12;
        const inTrunk = nx >= trunkX - 0.02 && nx <= trunkX + 0.02 && ny >= 0.25 && ny <= 0.55;

        // Palm fronds (simplified)
        const frondCy = 0.22;
        const inFrond1 = ny >= 0.1 && ny <= frondCy && nx >= 0.02 && nx <= trunkX &&
            ny >= 0.1 + (nx - 0.02) * 0.5;
        const inFrond2 = ny >= 0.1 && ny <= frondCy && nx >= trunkX && nx <= 0.25 &&
            ny >= 0.1 + (0.25 - nx) * 0.6;
        const inFrond3 = ny >= 0.15 && ny <= 0.25 && nx >= 0.05 && nx <= 0.2;

        // Left island/beach
        const inLeftIsland = ny >= 0.5 && ny <= 0.65 &&
            nx <= 0.25 && Math.pow((nx - 0) / 0.25, 2) + Math.pow((ny - 0.5) / 0.15, 2) <= 1.2;

        // Right island with palm
        const inRightIsland = ny >= 0.55 && ny <= 0.68 &&
            nx >= 0.75 && Math.pow((nx - 1) / 0.25, 2) + Math.pow((ny - 0.55) / 0.13, 2) <= 1.2;

        // Right palm trunk
        const rTrunkX = 0.88;
        const inRTrunk = nx >= rTrunkX - 0.015 && nx <= rTrunkX + 0.015 && ny >= 0.35 && ny <= 0.55;
        const inRFrond = ny >= 0.28 && ny <= 0.38 && nx >= 0.78 && nx <= 0.98;

        // Ocean - main area
        const oceanTop = 0.6;
        const waveAmp = 0.03;
        const waveLine = oceanTop + Math.sin(nx * Math.PI * 3) * waveAmp;
        const inOcean = ny >= waveLine;

        // Dolphin silhouette in water
        const dCx = 0.5, dCy = 0.75;
        const inDolphin = Math.pow((nx - dCx) / 0.15, 2) + Math.pow((ny - dCy) / 0.06, 2) <= 1;
        const inDFin = nx >= dCx - 0.02 && nx <= dCx + 0.04 && ny >= dCy - 0.12 && ny <= dCy - 0.02 &&
            ny >= dCy - 0.12 + (nx - (dCx - 0.02)) * 1.5;

        return inMoon || inTrunk || inFrond1 || inFrond2 || inFrond3 || inLeftIsland ||
               inRightIsland || inRTrunk || inRFrond || inOcean || inDolphin || inDFin;
    },

    // Pod of dolphins swimming - shows social behavior
    // Educational: Dolphins are highly social, living in groups called pods
    dolphinPod: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);

        // Multiple dolphins at different positions
        const dolphins = [
            { cx: 0.25, cy: 0.3, rx: 0.12, ry: 0.06, angle: 0.2 },   // Leader
            { cx: 0.5, cy: 0.4, rx: 0.14, ry: 0.07, angle: 0.1 },    // Center
            { cx: 0.75, cy: 0.35, rx: 0.11, ry: 0.055, angle: -0.1 }, // Right
            { cx: 0.35, cy: 0.55, rx: 0.1, ry: 0.05, angle: 0.15 },  // Lower left
            { cx: 0.6, cy: 0.6, rx: 0.08, ry: 0.04, angle: 0 },      // Calf
            { cx: 0.85, cy: 0.55, rx: 0.09, ry: 0.045, angle: -0.2 } // Lower right
        ];

        for (const d of dolphins) {
            const dx = nx - d.cx, dy = ny - d.cy;
            const cosA = Math.cos(d.angle), sinA = Math.sin(d.angle);
            const rotX = dx * cosA + dy * sinA;
            const rotY = -dx * sinA + dy * cosA;
            if ((rotX * rotX) / (d.rx * d.rx) + (rotY * rotY) / (d.ry * d.ry) <= 1) return true;

            // Dorsal fins
            const finX = d.cx - d.rx * 0.2;
            const finTop = d.cy - d.ry - 0.03;
            if (nx >= finX - 0.02 && nx <= finX + 0.03 &&
                ny >= finTop && ny <= d.cy - d.ry * 0.5 &&
                ny >= finTop + (nx - finX + 0.02) * 0.8) return true;
        }

        // Wave pattern at bottom
        const waveY = 0.8 + Math.sin(nx * Math.PI * 4) * 0.03;
        if (ny >= waveY) return true;

        return false;
    },

    // Ocean waves pattern - shows marine environment
    // Educational: Dolphins use waves to help them swim efficiently
    oceanWaves: (x, y, w, h) => {
        const nx = x / (w - 1);
        const ny = y / (h - 1);

        // Multiple wave layers
        const wave1 = 0.25 + Math.sin(nx * Math.PI * 2.5 + 0.5) * 0.08;
        const wave2 = 0.45 + Math.sin(nx * Math.PI * 3 + 1) * 0.07;
        const wave3 = 0.65 + Math.sin(nx * Math.PI * 2 + 2) * 0.09;
        const wave4 = 0.85 + Math.sin(nx * Math.PI * 3.5) * 0.06;

        // Each wave is a band
        const inWave1 = ny >= wave1 - 0.06 && ny <= wave1 + 0.06;
        const inWave2 = ny >= wave2 - 0.07 && ny <= wave2 + 0.07;
        const inWave3 = ny >= wave3 - 0.08 && ny <= wave3 + 0.08;
        const inWave4 = ny >= wave4 - 0.05 && ny <= wave4 + 0.05;

        // Foam/crest areas
        const inCrest1 = ny >= wave1 - 0.03 && ny <= wave1 + 0.03;
        const inCrest2 = ny >= wave2 - 0.03 && ny <= wave2 + 0.03;

        // Bottom ocean
        const inDeep = ny >= 0.92;

        return inWave1 || inWave2 || inWave3 || inWave4 || inDeep;
    }
};

// Theme definitions with art generation
const Themes = {
    classic: {
        name: 'Classic',
        wallColor: '#333',
        pathColor: '#fff',
        bgColor: '#f5f5f5',
        solutionColor: '#4CAF50',
        startColor: '#4CAF50',
        endColor: '#FF5722',
        borderPattern: 'simple',
        decorations: ['compass', 'torch', 'key', 'coin'],
        characters: [
            { art: 'explorer', name: 'explorer' },
            { art: 'explorer', name: 'adventurer' },
            { art: 'explorer', name: 'treasure hunter' }
        ],
        goals: [
            { art: 'treasure', name: 'treasure' },
            { art: 'treasure', name: 'golden key' },
            { art: 'treasure', name: 'magic gem' }
        ]
    },
    ocean: {
        name: 'Ocean',
        wallColor: '#1e5799',
        pathColor: '#e8f4fc',
        bgColor: '#87CEEB',
        solutionColor: '#00BCD4',
        startColor: '#00BCD4',
        endColor: '#FF6B35',
        borderPattern: 'waves',
        decorations: ['fish', 'bubble', 'seaweed', 'shell'],
        characters: [
            { art: 'diver', name: 'diver' },
            { art: 'mermaid', name: 'mermaid' },
            { art: 'sailor', name: 'sailor' },
            { art: 'seaTurtle', name: 'sea turtle' }
        ],
        goals: [
            { art: 'treasureChest', name: 'treasure chest' },
            { art: 'coralPalace', name: 'coral palace' },
            { art: 'sunkenShip', name: 'sunken ship' }
        ]
    },
    space: {
        name: 'Space',
        wallColor: '#4a5568',
        pathColor: '#1a202c',
        bgColor: '#0a0a1a',
        solutionColor: '#00ff88',
        startColor: '#00ff88',
        endColor: '#ff6b6b',
        borderPattern: 'stars',
        decorations: ['star', 'planet', 'rocket', 'moon'],
        characters: [
            { art: 'astronaut', name: 'astronaut' },
            { art: 'robot', name: 'robot' },
            { art: 'alien', name: 'alien friend' }
        ],
        goals: [
            { art: 'spaceStation', name: 'space station' },
            { art: 'warpGate', name: 'warp gate' },
            { art: 'moonBase', name: 'moon base' },
            { art: 'rocketShip', name: 'rocket ship' }
        ]
    },
    garden: {
        name: 'Garden',
        wallColor: '#2d5016',
        pathColor: '#f0fff0',
        bgColor: '#90EE90',
        solutionColor: '#FF69B4',
        startColor: '#FF69B4',
        endColor: '#FFD700',
        borderPattern: 'vines',
        decorations: ['flower', 'butterfly', 'bee', 'leaf'],
        characters: [
            { art: 'bee', name: 'bee' },
            { art: 'butterfly', name: 'butterfly' },
            { art: 'ladybug', name: 'ladybug' },
            { art: 'gardener', name: 'little gardener' }
        ],
        goals: [
            { art: 'beehive', name: 'beehive' },
            { art: 'flowerGarden', name: 'flower garden' },
            { art: 'mushroomHouse', name: 'fairy house' },
            { art: 'greenhouse', name: 'greenhouse' }
        ]
    },
    candy: {
        name: 'Candy',
        wallColor: '#FF69B4',
        pathColor: '#FFF0F5',
        bgColor: '#FFE4E1',
        solutionColor: '#FF1493',
        startColor: '#FF1493',
        endColor: '#FFD700',
        borderPattern: 'candy',
        decorations: ['lollipop', 'cupcake', 'star', 'heart'],
        characters: [
            { art: 'gingerbread', name: 'gingerbread kid' },
            { art: 'candyFairy', name: 'candy fairy' }
        ],
        goals: [
            { art: 'candyCastle', name: 'candy castle' },
            { art: 'lollipopForest', name: 'lollipop forest' },
            { art: 'chocolateFountain', name: 'chocolate fountain' }
        ]
    },
    jungle: {
        name: 'Jungle',
        wallColor: '#228B22',
        pathColor: '#F5F5DC',
        bgColor: '#9ACD32',
        solutionColor: '#FF8C00',
        startColor: '#8B4513',
        endColor: '#FFD700',
        borderPattern: 'leaves',
        decorations: ['palm', 'bird', 'monkey', 'snake'],
        characters: [
            { art: 'jungleKid', name: 'explorer' },
            { art: 'babyMonkey', name: 'baby monkey' },
            { art: 'parrot', name: 'parrot' }
        ],
        goals: [
            { art: 'temple', name: 'hidden temple' },
            { art: 'waterfall', name: 'secret waterfall' },
            { art: 'treehouseVillage', name: 'treetop village' }
        ]
    },
    // === DOLPHIN EDUCATIONAL THEME ===
    // Dolphins are highly intelligent marine mammals in the family Delphinidae.
    // They use echolocation to navigate and hunt, can swim up to 20 mph,
    // and live in social groups called pods.
    dolphin: {
        name: 'Dolphin',
        wallColor: '#1a4971',       // Deep ocean blue
        pathColor: '#e6f3ff',       // Light sea foam
        bgColor: '#87CEEB',         // Sky blue (ocean surface)
        solutionColor: '#00CED1',   // Dark turquoise
        startColor: '#20B2AA',      // Light sea green
        endColor: '#FF6347',        // Tomato (like a life ring)
        borderPattern: 'dolphins',  // Custom dolphin wave border
        decorations: ['herring', 'mackerel', 'squid', 'jellyfish', 'plankton', 'bubble', 'seaweed', 'coral', 'starfish', 'waveCrest'],
        characters: [
            { art: 'bottlenoseDolphin', name: 'bottlenose dolphin' },
            { art: 'dolphinCalf', name: 'dolphin calf' },
            { art: 'orca', name: 'orca' },
            { art: 'marineTrainer', name: 'dolphin trainer' },
            { art: 'marineBiologist', name: 'marine biologist' },
            { art: 'spinnerDolphin', name: 'spinner dolphin' }
        ],
        goals: [
            { art: 'dolphinPod', name: 'dolphin pod' },
            { art: 'researchStation', name: 'research station' },
            { art: 'coralReefHabitat', name: 'coral reef' },
            { art: 'conservationCenter', name: 'marine sanctuary' },
            { art: 'openOcean', name: 'open ocean' },
            { art: 'feedingGrounds', name: 'feeding grounds' }
        ]
    }
};

// Art generators (SVG drawing instructions)
const ArtGenerators = {
    fish: (x, y, size, rng) => {
        const s = size * 0.8;
        const flip = rng.next() > 0.5 ? 1 : -1;
        return `<g transform="translate(${x},${y}) scale(${flip},1)">
            <ellipse cx="0" cy="0" rx="${s*0.4}" ry="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
            <path d="M${s*0.35},0 L${s*0.55},${-s*0.2} L${s*0.55},${s*0.2} Z" fill="none" stroke="currentColor" stroke-width="1"/>
            <circle cx="${-s*0.2}" cy="${-s*0.05}" r="${s*0.05}" fill="currentColor"/>
        </g>`;
    },

    bubble: (x, y, size, rng) => {
        const s = size * 0.3 * (0.5 + rng.next() * 0.5);
        return `<circle cx="${x}" cy="${y}" r="${s}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    seaweed: (x, y, size, rng) => {
        const s = size * 0.8;
        const curves = [];
        for (let i = 0; i < 3; i++) {
            const ox = (i - 1) * s * 0.15;
            curves.push(`M${x+ox},${y+s*0.3} Q${x+ox+s*0.1},${y} ${x+ox},${y-s*0.3}`);
        }
        return `<path d="${curves.join(' ')}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    shell: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<path d="M${x-s},${y+s*0.3} Q${x},${y-s} ${x+s},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.6},${y+s*0.1} Q${x},${y-s*0.5} ${x+s*0.6},${y+s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    star: (x, y, size, rng) => {
        const s = size * 0.3;
        const points = [];
        for (let i = 0; i < 10; i++) {
            const angle = Math.PI / 2 + i * Math.PI / 5;
            const r = i % 2 === 0 ? s : s * 0.4;
            points.push(`${x + r * Math.cos(angle)},${y - r * Math.sin(angle)}`);
        }
        return `<polygon points="${points.join(' ')}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    planet: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<circle cx="${x}" cy="${y}" r="${s}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y}" rx="${s*1.5}" ry="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1" transform="rotate(${rng.nextInt(-30,30)},${x},${y})"/>`;
    },

    rocket: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<path d="M${x},${y-s} L${x+s*0.3},${y+s*0.3} L${x+s*0.15},${y+s*0.3} L${x+s*0.15},${y+s*0.5} L${x-s*0.15},${y+s*0.5} L${x-s*0.15},${y+s*0.3} L${x-s*0.3},${y+s*0.3} Z" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    moon: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<path d="M${x+s*0.3},${y-s} A${s},${s} 0 1,0 ${x+s*0.3},${y+s} A${s*0.7},${s*0.7} 0 1,1 ${x+s*0.3},${y-s}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    flower: (x, y, size, rng) => {
        const s = size * 0.3;
        const petals = [];
        for (let i = 0; i < 5; i++) {
            const angle = i * Math.PI * 2 / 5 - Math.PI / 2;
            const px = x + Math.cos(angle) * s * 0.6;
            const py = y + Math.sin(angle) * s * 0.6;
            petals.push(`<circle cx="${px}" cy="${py}" r="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>`);
        }
        return petals.join('') + `<circle cx="${x}" cy="${y}" r="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    butterfly: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<ellipse cx="${x-s*0.4}" cy="${y-s*0.2}" rx="${s*0.35}" ry="${s*0.45}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.4}" cy="${y-s*0.2}" rx="${s*0.35}" ry="${s*0.45}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x-s*0.3}" cy="${y+s*0.3}" rx="${s*0.25}" ry="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.3}" cy="${y+s*0.3}" rx="${s*0.25}" ry="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.5}" x2="${x}" y2="${y+s*0.5}" stroke="currentColor" stroke-width="1"/>`;
    },

    bee: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.5}" ry="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.15}" y1="${y-s*0.35}" x2="${x-s*0.15}" y2="${y+s*0.35}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.15}" y1="${y-s*0.35}" x2="${x+s*0.15}" y2="${y+s*0.35}" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x-s*0.2}" cy="${y-s*0.5}" rx="${s*0.3}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.2}" cy="${y-s*0.5}" rx="${s*0.3}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    leaf: (x, y, size, rng) => {
        const s = size * 0.4;
        const angle = rng.nextInt(-30, 30);
        return `<g transform="rotate(${angle},${x},${y})">
            <path d="M${x},${y-s} Q${x+s*0.5},${y} ${x},${y+s} Q${x-s*0.5},${y} ${x},${y-s}" fill="none" stroke="currentColor" stroke-width="1"/>
            <line x1="${x}" y1="${y-s*0.8}" x2="${x}" y2="${y+s*0.8}" stroke="currentColor" stroke-width="1"/>
        </g>`;
    },

    lollipop: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<circle cx="${x}" cy="${y-s*0.3}" r="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y+s*0.2}" x2="${x}" y2="${y+s}" stroke="currentColor" stroke-width="1.3"/>
                <path d="M${x-s*0.3},${y-s*0.3} Q${x},${y-s*0.6} ${x+s*0.3},${y-s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    cupcake: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<path d="M${x-s*0.4},${y} L${x-s*0.3},${y+s*0.5} L${x+s*0.3},${y+s*0.5} L${x+s*0.4},${y}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.4},${y} Q${x-s*0.3},${y-s*0.4} ${x},${y-s*0.3} Q${x+s*0.3},${y-s*0.4} ${x+s*0.4},${y}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x}" cy="${y-s*0.5}" r="${s*0.15}" fill="currentColor"/>`;
    },

    heart: (x, y, size, rng) => {
        const s = size * 0.3;
        return `<path d="M${x},${y+s*0.3} C${x-s*0.8},${y-s*0.3} ${x-s*0.5},${y-s} ${x},${y-s*0.3} C${x+s*0.5},${y-s} ${x+s*0.8},${y-s*0.3} ${x},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    palm: (x, y, size, rng) => {
        const s = size * 0.45;
        let svg = `<line x1="${x}" y1="${y+s}" x2="${x}" y2="${y-s*0.2}" stroke="currentColor" stroke-width="1.3"/>`;
        for (let i = 0; i < 5; i++) {
            const angle = -60 + i * 30;
            svg += `<path d="M${x},${y-s*0.2} Q${x + Math.cos(angle*Math.PI/180)*s*0.8},${y-s*0.5} ${x + Math.cos(angle*Math.PI/180)*s},${y-s*0.3 + Math.sin(angle*Math.PI/180)*s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>`;
        }
        return svg;
    },

    bird: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<path d="M${x-s},${y} Q${x-s*0.3},${y-s*0.5} ${x},${y} Q${x+s*0.3},${y-s*0.5} ${x+s},${y}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    monkey: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<circle cx="${x}" cy="${y}" r="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.5}" cy="${y}" r="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.5}" cy="${y}" r="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.15}" cy="${y-s*0.1}" r="${s*0.08}" fill="currentColor"/>
                <circle cx="${x+s*0.15}" cy="${y-s*0.1}" r="${s*0.08}" fill="currentColor"/>
                <path d="M${x-s*0.15},${y+s*0.15} Q${x},${y+s*0.25} ${x+s*0.15},${y+s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    snake: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<path d="M${x-s},${y} Q${x-s*0.5},${y-s*0.3} ${x},${y} Q${x+s*0.5},${y+s*0.3} ${x+s},${y}" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <circle cx="${x+s*0.9}" cy="${y-s*0.05}" r="${s*0.08}" fill="currentColor"/>`;
    },

    // Classic theme decorations
    compass: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<circle cx="${x}" cy="${y}" r="${s}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x}" cy="${y}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.9}" x2="${x}" y2="${y-s*0.3}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y+s*0.3}" x2="${x}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.9}" y1="${y}" x2="${x-s*0.3}" y2="${y}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.3}" y1="${y}" x2="${x+s*0.9}" y2="${y}" stroke="currentColor" stroke-width="1"/>
                <polygon points="${x},${y-s*0.7} ${x-s*0.15},${y} ${x+s*0.15},${y}" fill="currentColor"/>`;
    },

    torch: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.15}" y="${y-s*0.2}" width="${s*0.3}" height="${s*0.8}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.3},${y-s*0.2} L${x},${y-s*0.8} L${x+s*0.3},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y-s*0.5}" rx="${s*0.15}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    key: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<circle cx="${x-s*0.3}" cy="${y}" r="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.3}" cy="${y}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y}" x2="${x+s*0.7}" y2="${y}" stroke="currentColor" stroke-width="1.3"/>
                <line x1="${x+s*0.4}" y1="${y}" x2="${x+s*0.4}" y2="${y+s*0.25}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.6}" y1="${y}" x2="${x+s*0.6}" y2="${y+s*0.2}" stroke="currentColor" stroke-width="1"/>`;
    },

    coin: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<circle cx="${x}" cy="${y}" r="${s}" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <circle cx="${x}" cy="${y}" r="${s*0.7}" fill="none" stroke="currentColor" stroke-width="1"/>
                <text x="${x}" y="${y+s*0.25}" font-size="${s*0.8}" text-anchor="middle" fill="currentColor" style="font-family:serif;font-weight:bold">$</text>`;
    },

    // =============================================================================
    // DOLPHIN THEME DECORATIONS - Educational marine life
    // =============================================================================

    // Herring - small schooling fish, major food source for dolphins
    // Fact: Dolphins eat 15-30 lbs of fish daily
    herring: (x, y, size, rng) => {
        const s = size * 0.35;
        const flip = rng.next() > 0.5 ? 1 : -1;
        return `<g transform="translate(${x},${y}) scale(${flip},1)">
            <ellipse cx="0" cy="0" rx="${s*0.4}" ry="${s*0.15}" fill="none" stroke="currentColor" stroke-width="0.8"/>
            <path d="M${s*0.35},0 L${s*0.55},${-s*0.12} L${s*0.55},${s*0.12} Z" fill="none" stroke="currentColor" stroke-width="0.8"/>
            <circle cx="${-s*0.25}" cy="${-s*0.02}" r="${s*0.04}" fill="currentColor"/>
            <line x1="${-s*0.05}" y1="${-s*0.1}" x2="${s*0.15}" y2="${-s*0.1}" stroke="currentColor" stroke-width="0.5"/>
        </g>`;
    },

    // Mackerel - fast swimming fish dolphins chase
    // Fact: Mackerel can swim up to 30 mph
    mackerel: (x, y, size, rng) => {
        const s = size * 0.4;
        const flip = rng.next() > 0.5 ? 1 : -1;
        return `<g transform="translate(${x},${y}) scale(${flip},1)">
            <path d="M${-s*0.45},0 Q${-s*0.2},${-s*0.2} ${s*0.2},${-s*0.1} Q${s*0.35},0 ${s*0.2},${s*0.1} Q${-s*0.2},${s*0.2} ${-s*0.45},0" fill="none" stroke="currentColor" stroke-width="1"/>
            <path d="M${s*0.2},0 L${s*0.45},${-s*0.15} L${s*0.45},${s*0.15} Z" fill="none" stroke="currentColor" stroke-width="0.8"/>
            <circle cx="${-s*0.3}" cy="${-s*0.03}" r="${s*0.05}" fill="currentColor"/>
            <path d="M${-s*0.1},${-s*0.15} L${0},${-s*0.25} L${s*0.1},${-s*0.15}" fill="none" stroke="currentColor" stroke-width="0.7"/>
            <line x1="${-s*0.1}" y1="0" x2="${s*0.05}" y2="0" stroke="currentColor" stroke-width="0.5" stroke-dasharray="2,2"/>
        </g>`;
    },

    // Squid - another favorite dolphin food
    // Fact: Some dolphins dive 1000+ feet to catch squid
    squid: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y-s*0.2}" rx="${s*0.25}" ry="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.15},${y+s*0.15} Q${x-s*0.25},${y+s*0.5} ${x-s*0.2},${y+s*0.6}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <path d="M${x},${y+s*0.15} L${x},${y+s*0.65}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <path d="M${x+s*0.15},${y+s*0.15} Q${x+s*0.25},${y+s*0.5} ${x+s*0.2},${y+s*0.6}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <circle cx="${x-s*0.1}" cy="${y-s*0.25}" r="${s*0.06}" fill="currentColor"/>
                <circle cx="${x+s*0.1}" cy="${y-s*0.25}" r="${s*0.06}" fill="currentColor"/>
                <path d="M${x-s*0.25},${y-s*0.55} L${x},${y-s*0.35} L${x+s*0.25},${y-s*0.55}" fill="none" stroke="currentColor" stroke-width="0.8"/>`;
    },

    // Jellyfish - dolphins avoid stinging tentacles
    // Fact: Some dolphins use jellyfish as toys
    jellyfish: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<path d="M${x-s*0.4},${y} Q${x-s*0.4},${y-s*0.5} ${x},${y-s*0.5} Q${x+s*0.4},${y-s*0.5} ${x+s*0.4},${y}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.3},${y} Q${x-s*0.35},${y+s*0.3} ${x-s*0.25},${y+s*0.6}" fill="none" stroke="currentColor" stroke-width="0.7"/>
                <path d="M${x-s*0.1},${y} Q${x-s*0.05},${y+s*0.4} ${x-s*0.15},${y+s*0.7}" fill="none" stroke="currentColor" stroke-width="0.7"/>
                <path d="M${x+s*0.1},${y} Q${x+s*0.05},${y+s*0.4} ${x+s*0.15},${y+s*0.7}" fill="none" stroke="currentColor" stroke-width="0.7"/>
                <path d="M${x+s*0.3},${y} Q${x+s*0.35},${y+s*0.3} ${x+s*0.25},${y+s*0.6}" fill="none" stroke="currentColor" stroke-width="0.7"/>`;
    },

    // Plankton - base of the ocean food chain
    // Fact: Plankton produces 50% of Earth's oxygen
    plankton: (x, y, size, rng) => {
        const s = size * 0.2;
        let svg = '';
        // Multiple tiny organisms
        for (let i = 0; i < 5; i++) {
            const ox = (rng.next() - 0.5) * s * 2;
            const oy = (rng.next() - 0.5) * s * 2;
            const r = s * (0.15 + rng.next() * 0.15);
            svg += `<circle cx="${x+ox}" cy="${y+oy}" r="${r}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.7"/>`;
        }
        return svg;
    },

    // Coral - dolphins live near reefs
    // Fact: Coral reefs support 25% of all marine life
    coral: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<path d="M${x},${y+s*0.4} L${x},${y} Q${x-s*0.1},${y-s*0.2} ${x-s*0.2},${y-s*0.4} M${x},${y} Q${x+s*0.1},${y-s*0.15} ${x+s*0.25},${y-s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.15},${y+s*0.4} L${x-s*0.15},${y+s*0.1} Q${x-s*0.3},${y-s*0.1} ${x-s*0.4},${y-s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.15},${y+s*0.4} L${x+s*0.15},${y+s*0.15} Q${x+s*0.3},${y} ${x+s*0.35},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.2}" cy="${y-s*0.4}" r="${s*0.08}" fill="currentColor" opacity="0.6"/>
                <circle cx="${x+s*0.25}" cy="${y-s*0.35}" r="${s*0.08}" fill="currentColor" opacity="0.6"/>
                <circle cx="${x-s*0.4}" cy="${y-s*0.25}" r="${s*0.06}" fill="currentColor" opacity="0.6"/>`;
    },

    // Wave crest - dolphins love to surf waves
    // Fact: Dolphins can ride waves to conserve energy
    waveCrest: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<path d="M${x-s*0.6},${y+s*0.1} Q${x-s*0.3},${y-s*0.2} ${x},${y+s*0.05} Q${x+s*0.3},${y+s*0.3} ${x+s*0.6},${y+s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.4},${y+s*0.25} Q${x-s*0.1},${y+s*0.1} ${x+s*0.2},${y+s*0.25}" fill="none" stroke="currentColor" stroke-width="0.7"/>`;
    }
};

// =============================================================================
// CHARACTER ART GENERATORS - Theme-specific characters for start room
// =============================================================================

const CharacterArt = {
    // Classic theme
    explorer: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.5}" r="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.4},${y-s*0.85} L${x-s*0.5},${y-s*0.5} L${x+s*0.5},${y-s*0.5} L${x+s*0.4},${y-s*0.85}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.15}" x2="${x}" y2="${y+s*0.5}" stroke="currentColor" stroke-width="1.3"/>
                <line x1="${x-s*0.35}" y1="${y+s*0.1}" x2="${x+s*0.35}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.15}" y1="${y+s*0.5}" x2="${x-s*0.25}" y2="${y+s}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.15}" y1="${y+s*0.5}" x2="${x+s*0.25}" y2="${y+s}" stroke="currentColor" stroke-width="1"/>`;
    },

    // Ocean theme
    diver: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.4}" r="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.25}" y="${y-s*0.6}" width="${s*0.5}" height="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y+s*0.2}" rx="${s*0.3}" ry="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.5}" cy="${y-s*0.2}" rx="${s*0.15}" ry="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.25},${y+s*0.6} L${x-s*0.4},${y+s} L${x-s*0.1},${y+s}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.25},${y+s*0.6} L${x+s*0.4},${y+s} L${x+s*0.1},${y+s}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    mermaid: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.6}" r="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.3},${y-s*0.8} Q${x-s*0.5},${y-s} ${x-s*0.3},${y-s*0.6}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.3},${y-s*0.8} Q${x+s*0.5},${y-s} ${x+s*0.3},${y-s*0.6}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y}" rx="${s*0.25}" ry="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x},${y+s*0.35} Q${x-s*0.2},${y+s*0.6} ${x},${y+s*0.8} Q${x+s*0.2},${y+s} ${x+s*0.4},${y+s*0.7}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.3},${y+s*0.8} L${x+s*0.5},${y+s*0.6} M${x+s*0.3},${y+s*0.8} L${x+s*0.5},${y+s}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Space theme
    astronaut: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.5}" r="${s*0.45}" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <circle cx="${x}" cy="${y-s*0.5}" r="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.35}" y="${y}" width="${s*0.7}" height="${s*0.7}" rx="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.55}" y="${y+s*0.1}" width="${s*0.2}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x+s*0.35}" y="${y+s*0.1}" width="${s*0.2}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.2}" y1="${y+s*0.7}" x2="${x-s*0.2}" y2="${y+s}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.2}" y1="${y+s*0.7}" x2="${x+s*0.2}" y2="${y+s}" stroke="currentColor" stroke-width="1"/>`;
    },

    robot: (x, y, size) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.35}" y="${y-s*0.8}" width="${s*0.7}" height="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s}" x2="${x}" y2="${y-s*0.8}" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x}" cy="${y-s*1.1}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.15}" cy="${y-s*0.6}" r="${s*0.08}" fill="currentColor"/>
                <circle cx="${x+s*0.15}" cy="${y-s*0.6}" r="${s*0.08}" fill="currentColor"/>
                <rect x="${x-s*0.3}" y="${y-s*0.25}" width="${s*0.6}" height="${s*0.6}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.3}" y1="${y}" x2="${x-s*0.5}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.3}" y1="${y}" x2="${x+s*0.5}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.15}" y1="${y+s*0.35}" x2="${x-s*0.15}" y2="${y+s*0.7}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.15}" y1="${y+s*0.35}" x2="${x+s*0.15}" y2="${y+s*0.7}" stroke="currentColor" stroke-width="1"/>`;
    },

    // Garden theme
    gardener: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.5}" r="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.45},${y-s*0.7} Q${x},${y-s} ${x+s*0.45},${y-s*0.7}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.2}" x2="${x}" y2="${y+s*0.4}" stroke="currentColor" stroke-width="1"/>
                <path d="M${x},${y} L${x+s*0.5},${y-s*0.2}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.5}" y1="${y-s*0.4}" x2="${x+s*0.5}" y2="${y+s*0.2}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.15}" y1="${y+s*0.4}" x2="${x-s*0.25}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.15}" y1="${y+s*0.4}" x2="${x+s*0.25}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>`;
    },

    // Candy theme
    gingerbread: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.55}" r="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.12}" cy="${y-s*0.6}" r="${s*0.06}" fill="currentColor"/>
                <circle cx="${x+s*0.12}" cy="${y-s*0.6}" r="${s*0.06}" fill="currentColor"/>
                <path d="M${x-s*0.1},${y-s*0.4} Q${x},${y-s*0.3} ${x+s*0.1},${y-s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y+s*0.15}" rx="${s*0.3}" ry="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x}" cy="${y}" r="${s*0.06}" fill="currentColor"/>
                <circle cx="${x}" cy="${y+s*0.2}" r="${s*0.06}" fill="currentColor"/>
                <line x1="${x-s*0.3}" y1="${y}" x2="${x-s*0.55}" y2="${y+s*0.15}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.3}" y1="${y}" x2="${x+s*0.55}" y2="${y+s*0.15}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.15}" y1="${y+s*0.5}" x2="${x-s*0.2}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.15}" y1="${y+s*0.5}" x2="${x+s*0.2}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>`;
    },

    // Jungle theme
    jungleKid: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.5}" r="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.3},${y-s*0.7} Q${x-s*0.4},${y-s*0.5} ${x-s*0.2},${y-s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.3},${y-s*0.7} Q${x+s*0.4},${y-s*0.5} ${x+s*0.2},${y-s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.2}" x2="${x}" y2="${y+s*0.4}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.3}" y1="${y}" x2="${x+s*0.3}" y2="${y}" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.3},${y} L${x-s*0.45},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.3}" y1="${y}" x2="${x+s*0.5}" y2="${y-s*0.1}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.5}" y1="${y-s*0.3}" x2="${x+s*0.5}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.12}" y1="${y+s*0.4}" x2="${x-s*0.2}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.12}" y1="${y+s*0.4}" x2="${x+s*0.2}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Ocean characters
    sailor: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.5}" r="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y-s*0.85}" rx="${s*0.35}" ry="${s*0.12}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.35}" y1="${y-s*0.85}" x2="${x+s*0.35}" y2="${y-s*0.85}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.2}" x2="${x}" y2="${y+s*0.5}" stroke="currentColor" stroke-width="1.3"/>
                <path d="M${x-s*0.35},${y-s*0.1} L${x},${y+s*0.1} L${x+s*0.35},${y-s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.15}" y1="${y+s*0.5}" x2="${x-s*0.25}" y2="${y+s}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.15}" y1="${y+s*0.5}" x2="${x+s*0.25}" y2="${y+s}" stroke="currentColor" stroke-width="1"/>`;
    },

    seaTurtle: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.6}" ry="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y}" rx="${s*0.45}" ry="${s*0.28}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.2}" y1="${y-s*0.1}" x2="${x+s*0.2}" y2="${y-s*0.1}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.2}" y1="${y+s*0.1}" x2="${x+s*0.2}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.7}" cy="${y-s*0.1}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.75}" cy="${y-s*0.15}" r="${s*0.03}" fill="currentColor"/>
                <ellipse cx="${x-s*0.5}" cy="${y-s*0.35}" rx="${s*0.2}" ry="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x-s*0.5}" cy="${y+s*0.35}" rx="${s*0.2}" ry="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.4}" cy="${y-s*0.35}" rx="${s*0.15}" ry="${s*0.08}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.4}" cy="${y+s*0.35}" rx="${s*0.15}" ry="${s*0.08}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Garden characters
    bee: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.35}" ry="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.15}" y1="${y-s*0.15}" x2="${x-s*0.15}" y2="${y+s*0.15}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.1}" y1="${y-s*0.15}" x2="${x+s*0.1}" y2="${y+s*0.15}" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.45}" cy="${y}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.5}" cy="${y-s*0.03}" r="${s*0.03}" fill="currentColor"/>
                <ellipse cx="${x-s*0.1}" cy="${y-s*0.4}" rx="${s*0.25}" ry="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.15}" cy="${y-s*0.4}" rx="${s*0.25}" ry="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.35}" y1="${y+s*0.1}" x2="${x+s*0.5}" y2="${y+s*0.25}" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.55},${y-s*0.15} Q${x+s*0.65},${y-s*0.3} ${x+s*0.5},${y-s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.55},${y-s*0.15} Q${x+s*0.7},${y-s*0.2} ${x+s*0.6},${y-s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    butterfly: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.1}" ry="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x-s*0.4}" cy="${y-s*0.2}" rx="${s*0.35}" ry="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.4}" cy="${y-s*0.2}" rx="${s*0.35}" ry="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x-s*0.35}" cy="${y+s*0.35}" rx="${s*0.25}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.35}" cy="${y+s*0.35}" rx="${s*0.25}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.4}" cy="${y-s*0.2}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.4}" cy="${y-s*0.2}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.05},${y-s*0.4} Q${x-s*0.2},${y-s*0.7} ${x-s*0.15},${y-s*0.8}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.05},${y-s*0.4} Q${x+s*0.2},${y-s*0.7} ${x+s*0.15},${y-s*0.8}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    ladybug: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.5}" ry="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.4}" x2="${x}" y2="${y+s*0.4}" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.55}" cy="${y-s*0.15}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.6}" cy="${y-s*0.18}" r="${s*0.03}" fill="currentColor"/>
                <circle cx="${x-s*0.2}" cy="${y-s*0.1}" r="${s*0.08}" fill="currentColor"/>
                <circle cx="${x+s*0.15}" cy="${y+s*0.1}" r="${s*0.08}" fill="currentColor"/>
                <circle cx="${x-s*0.25}" cy="${y+s*0.2}" r="${s*0.06}" fill="currentColor"/>
                <path d="M${x+s*0.5},${y-s*0.3} L${x+s*0.6},${y-s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.55},${y-s*0.25} L${x+s*0.7},${y-s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Jungle characters
    babyMonkey: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.4}" r="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.4}" cy="${y-s*0.4}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.4}" cy="${y-s*0.4}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.12}" cy="${y-s*0.45}" r="${s*0.05}" fill="currentColor"/>
                <circle cx="${x+s*0.12}" cy="${y-s*0.45}" r="${s*0.05}" fill="currentColor"/>
                <ellipse cx="${x}" cy="${y-s*0.25}" rx="${s*0.15}" ry="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y+s*0.2}" rx="${s*0.25}" ry="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.25},${y+s*0.1} Q${x-s*0.5},${y} ${x-s*0.55},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.25},${y+s*0.1} Q${x+s*0.5},${y} ${x+s*0.55},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x},${y+s*0.5} Q${x+s*0.3},${y+s*0.7} ${x+s*0.5},${y+s*0.5} Q${x+s*0.6},${y+s*0.3} ${x+s*0.4},${y+s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    parrot: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.3}" ry="${s*0.45}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.15}" cy="${y-s*0.55}" r="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.22}" cy="${y-s*0.58}" r="${s*0.05}" fill="currentColor"/>
                <path d="M${x+s*0.35},${y-s*0.5} L${x+s*0.55},${y-s*0.45} L${x+s*0.35},${y-s*0.55}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.05},${y-s*0.75} Q${x+s*0.1},${y-s*0.95} ${x+s*0.3},${y-s*0.85}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.05},${y-s*0.75} Q${x+s*0.2},${y-s*1} ${x+s*0.4},${y-s*0.85}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.15},${y+s*0.45} L${x-s*0.25},${y+s*0.9}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.15},${y+s*0.45} L${x+s*0.25},${y+s*0.9}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x},${y+s*0.45} Q${x-s*0.1},${y+s*0.7} ${x-s*0.3},${y+s} Q${x},${y+s*1.1} ${x+s*0.3},${y+s}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Candy characters
    candyFairy: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.5}" r="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.15},${y-s*0.7} Q${x-s*0.3},${y-s*0.9} ${x-s*0.1},${y-s*0.85}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.15},${y-s*0.7} Q${x+s*0.3},${y-s*0.9} ${x+s*0.1},${y-s*0.85}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x},${y-s*0.25} L${x},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.15},${y+s*0.4} L${x},${y-s*0.1} L${x+s*0.15},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x-s*0.45}" cy="${y-s*0.2}" rx="${s*0.3}" ry="${s*0.15}" transform="rotate(-30 ${x-s*0.45} ${y-s*0.2})" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.45}" cy="${y-s*0.2}" rx="${s*0.3}" ry="${s*0.15}" transform="rotate(30 ${x+s*0.45} ${y-s*0.2})" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y+s*0.4}" x2="${x}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x}" cy="${y+s*1}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Space characters
    alien: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y-s*0.4}" rx="${s*0.4}" ry="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x-s*0.2}" cy="${y-s*0.5}" rx="${s*0.15}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.2}" cy="${y-s*0.5}" rx="${s*0.15}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.2}" cy="${y-s*0.5}" r="${s*0.05}" fill="currentColor"/>
                <circle cx="${x+s*0.2}" cy="${y-s*0.5}" r="${s*0.05}" fill="currentColor"/>
                <ellipse cx="${x}" cy="${y+s*0.3}" rx="${s*0.2}" ry="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.2}" y1="${y+s*0.2}" x2="${x-s*0.45}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.2}" y1="${y+s*0.2}" x2="${x+s*0.45}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.1}" y1="${y+s*0.55}" x2="${x-s*0.15}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.1}" y1="${y+s*0.55}" x2="${x+s*0.15}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>`;
    },

    // =============================================================================
    // DOLPHIN THEME CHARACTERS - Educational marine mammals
    // =============================================================================

    // Bottlenose Dolphin - most well-known species
    // Fact: Brain is 40% larger than humans, uses echolocation
    bottlenoseDolphin: (x, y, size) => {
        const s = size * 0.45;
        return `<!-- Body - streamlined for speed up to 20mph -->
                <path d="M${x-s*0.8},${y} Q${x-s*0.6},${y-s*0.3} ${x},${y-s*0.2} Q${x+s*0.5},${y-s*0.15} ${x+s*0.7},${y+s*0.1}" fill="none" stroke="currentColor" stroke-width="1.2"/>
                <path d="M${x-s*0.8},${y} Q${x-s*0.5},${y+s*0.25} ${x},${y+s*0.15} Q${x+s*0.4},${y+s*0.1} ${x+s*0.7},${y+s*0.1}" fill="none" stroke="currentColor" stroke-width="1.2"/>
                <!-- Rostrum (beak) - 88 teeth for catching fish -->
                <path d="M${x+s*0.7},${y+s*0.1} Q${x+s*0.85},${y+s*0.05} ${x+s*0.95},${y+s*0.08}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.7},${y+s*0.1} Q${x+s*0.85},${y+s*0.15} ${x+s*0.95},${y+s*0.12}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Dorsal fin - unique to each dolphin like fingerprint -->
                <path d="M${x-s*0.1},${y-s*0.2} Q${x},${y-s*0.6} ${x+s*0.2},${y-s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Pectoral fin - contains bones similar to human hand -->
                <path d="M${x+s*0.2},${y+s*0.1} Q${x+s*0.1},${y+s*0.35} ${x+s*0.3},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Tail fluke - moves up/down unlike fish -->
                <path d="M${x-s*0.8},${y} Q${x-s*0.9},${y-s*0.2} ${x-s*1.05},${y-s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.8},${y} Q${x-s*0.9},${y+s*0.2} ${x-s*1.05},${y+s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Eye - dolphins sleep with one eye open -->
                <circle cx="${x+s*0.5}" cy="${y}" r="${s*0.06}" fill="currentColor"/>
                <!-- Blowhole - breathes air, not water -->
                <ellipse cx="${x+s*0.3}" cy="${y-s*0.22}" rx="${s*0.06}" ry="${s*0.03}" fill="currentColor"/>`;
    },

    // Dolphin Calf - baby dolphin
    // Fact: Calves nurse for 2-3 years, stay with mom for 3-6 years
    dolphinCalf: (x, y, size) => {
        const s = size * 0.35;
        return `<!-- Smaller, rounder body of a calf -->
                <path d="M${x-s*0.6},${y} Q${x-s*0.4},${y-s*0.35} ${x+s*0.2},${y-s*0.2} Q${x+s*0.5},${y-s*0.1} ${x+s*0.6},${y+s*0.05}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.6},${y} Q${x-s*0.3},${y+s*0.3} ${x+s*0.2},${y+s*0.2} Q${x+s*0.45},${y+s*0.1} ${x+s*0.6},${y+s*0.05}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Short rostrum -->
                <path d="M${x+s*0.6},${y+s*0.05} Q${x+s*0.75},${y} ${x+s*0.8},${y+s*0.05}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Small dorsal fin -->
                <path d="M${x},${y-s*0.2} Q${x+s*0.1},${y-s*0.45} ${x+s*0.2},${y-s*0.15}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Small pectoral fin -->
                <path d="M${x+s*0.2},${y+s*0.15} Q${x+s*0.15},${y+s*0.3} ${x+s*0.25},${y+s*0.35}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Tail -->
                <path d="M${x-s*0.6},${y} Q${x-s*0.7},${y-s*0.15} ${x-s*0.8},${y-s*0.1}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <path d="M${x-s*0.6},${y} Q${x-s*0.7},${y+s*0.15} ${x-s*0.8},${y+s*0.1}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Cute eye -->
                <circle cx="${x+s*0.4}" cy="${y-s*0.05}" r="${s*0.06}" fill="currentColor"/>`;
    },

    // Orca (Killer Whale) - largest dolphin family member
    // Fact: Orcas are dolphins! They can live 50-90 years
    orca: (x, y, size) => {
        const s = size * 0.45;
        return `<!-- Large body with distinctive black/white pattern -->
                <path d="M${x-s*0.85},${y} Q${x-s*0.6},${y-s*0.4} ${x},${y-s*0.3} Q${x+s*0.4},${y-s*0.2} ${x+s*0.65},${y}" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <path d="M${x-s*0.85},${y} Q${x-s*0.5},${y+s*0.35} ${x},${y+s*0.25} Q${x+s*0.35},${y+s*0.15} ${x+s*0.65},${y}" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <!-- Rounded head -->
                <path d="M${x+s*0.65},${y} Q${x+s*0.85},${y-s*0.05} ${x+s*0.85},${y+s*0.1} Q${x+s*0.75},${y+s*0.15} ${x+s*0.65},${y}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Tall dorsal fin - males can be 6 feet tall! -->
                <path d="M${x-s*0.15},${y-s*0.3} L${x},${y-s*0.8} Q${x+s*0.15},${y-s*0.5} ${x+s*0.15},${y-s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Eye patch - distinctive white marking -->
                <ellipse cx="${x+s*0.5}" cy="${y-s*0.08}" rx="${s*0.12}" ry="${s*0.08}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <circle cx="${x+s*0.52}" cy="${y-s*0.08}" r="${s*0.04}" fill="currentColor"/>
                <!-- Pectoral fin - paddle-shaped -->
                <path d="M${x+s*0.15},${y+s*0.2} Q${x},${y+s*0.45} ${x+s*0.2},${y+s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Tail flukes -->
                <path d="M${x-s*0.85},${y} Q${x-s*0.95},${y-s*0.25} ${x-s*1.1},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.85},${y} Q${x-s*0.95},${y+s*0.25} ${x-s*1.1},${y+s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Saddle patch behind dorsal -->
                <path d="M${x-s*0.25},${y-s*0.15} Q${x-s*0.35},${y-s*0.1} ${x-s*0.4},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="0.7"/>`;
    },

    // Marine Trainer - works with dolphins for enrichment
    // Fact: Trainers use positive reinforcement only
    marineTrainer: (x, y, size) => {
        const s = size * 0.4;
        return `<!-- Head with cap -->
                <circle cx="${x}" cy="${y-s*0.55}" r="${s*0.28}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.35},${y-s*0.65} L${x-s*0.4},${y-s*0.8} L${x+s*0.4},${y-s*0.8} L${x+s*0.35},${y-s*0.65}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.45}" y1="${y-s*0.8}" x2="${x+s*0.45}" y2="${y-s*0.8}" stroke="currentColor" stroke-width="1"/>
                <!-- Eyes and smile -->
                <circle cx="${x-s*0.1}" cy="${y-s*0.58}" r="${s*0.04}" fill="currentColor"/>
                <circle cx="${x+s*0.1}" cy="${y-s*0.58}" r="${s*0.04}" fill="currentColor"/>
                <path d="M${x-s*0.1},${y-s*0.42} Q${x},${y-s*0.35} ${x+s*0.1},${y-s*0.42}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Wetsuit body -->
                <path d="M${x-s*0.25},${y-s*0.27} L${x-s*0.3},${y+s*0.4} L${x+s*0.3},${y+s*0.4} L${x+s*0.25},${y-s*0.27}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Arms - one raised with whistle/target -->
                <line x1="${x-s*0.3}" y1="${y-s*0.1}" x2="${x-s*0.55}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.3}" y1="${y-s*0.1}" x2="${x+s*0.5}" y2="${y-s*0.4}" stroke="currentColor" stroke-width="1"/>
                <!-- Target pole for training -->
                <line x1="${x+s*0.5}" y1="${y-s*0.4}" x2="${x+s*0.5}" y2="${y-s*0.8}" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.5}" cy="${y-s*0.85}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Legs -->
                <line x1="${x-s*0.15}" y1="${y+s*0.4}" x2="${x-s*0.2}" y2="${y+s*0.85}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.15}" y1="${y+s*0.4}" x2="${x+s*0.2}" y2="${y+s*0.85}" stroke="currentColor" stroke-width="1"/>`;
    },

    // Marine Biologist - studies dolphins in the wild
    // Fact: Scientists ID dolphins by dorsal fin photos
    marineBiologist: (x, y, size) => {
        const s = size * 0.4;
        return `<!-- Head with glasses -->
                <circle cx="${x}" cy="${y-s*0.55}" r="${s*0.28}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.12}" cy="${y-s*0.58}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <circle cx="${x+s*0.12}" cy="${y-s*0.58}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <line x1="${x-s*0.02}" y1="${y-s*0.58}" x2="${x+s*0.02}" y2="${y-s*0.58}" stroke="currentColor" stroke-width="0.8"/>
                <!-- Hair -->
                <path d="M${x-s*0.25},${y-s*0.7} Q${x},${y-s*0.9} ${x+s*0.25},${y-s*0.7}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Lab coat -->
                <path d="M${x-s*0.3},${y-s*0.27} L${x-s*0.35},${y+s*0.5} L${x+s*0.35},${y+s*0.5} L${x+s*0.3},${y-s*0.27}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.27}" x2="${x}" y2="${y+s*0.3}" stroke="currentColor" stroke-width="0.8"/>
                <!-- Arms holding clipboard -->
                <line x1="${x-s*0.35}" y1="${y-s*0.05}" x2="${x-s*0.5}" y2="${y+s*0.15}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.35}" y1="${y-s*0.05}" x2="${x+s*0.45}" y2="${y+s*0.2}" stroke="currentColor" stroke-width="1"/>
                <!-- Clipboard with data -->
                <rect x="${x+s*0.35}" y="${y+s*0.05}" width="${s*0.35}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <line x1="${x+s*0.4}" y1="${y+s*0.15}" x2="${x+s*0.6}" y2="${y+s*0.15}" stroke="currentColor" stroke-width="0.5"/>
                <line x1="${x+s*0.4}" y1="${y+s*0.25}" x2="${x+s*0.55}" y2="${y+s*0.25}" stroke="currentColor" stroke-width="0.5"/>
                <!-- Legs -->
                <line x1="${x-s*0.15}" y1="${y+s*0.5}" x2="${x-s*0.2}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.15}" y1="${y+s*0.5}" x2="${x+s*0.2}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>`;
    },

    // Spinner Dolphin - known for acrobatic spins
    // Fact: Can spin 7 times in a single leap!
    spinnerDolphin: (x, y, size) => {
        const s = size * 0.4;
        // Shown mid-spin, slightly rotated
        return `<!-- Sleek body - spinners are smaller than bottlenose -->
                <path d="M${x-s*0.7},${y+s*0.2} Q${x-s*0.4},${y-s*0.3} ${x+s*0.2},${y-s*0.35} Q${x+s*0.5},${y-s*0.25} ${x+s*0.65},${y-s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.7},${y+s*0.2} Q${x-s*0.3},${y+s*0.15} ${x+s*0.2},${y-s*0.05} Q${x+s*0.45},${y-s*0.1} ${x+s*0.65},${y-s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Long thin beak -->
                <path d="M${x+s*0.65},${y-s*0.1} Q${x+s*0.8},${y-s*0.15} ${x+s*0.9},${y-s*0.12}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <path d="M${x+s*0.65},${y-s*0.1} Q${x+s*0.8},${y-s*0.05} ${x+s*0.9},${y-s*0.08}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Triangular dorsal -->
                <path d="M${x},${y-s*0.35} Q${x+s*0.05},${y-s*0.65} ${x+s*0.2},${y-s*0.3}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Pectoral -->
                <path d="M${x+s*0.25},${y-s*0.1} Q${x+s*0.2},${y+s*0.1} ${x+s*0.35},${y+s*0.15}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Tail mid-spin -->
                <path d="M${x-s*0.7},${y+s*0.2} Q${x-s*0.85},${y+s*0.35} ${x-s*0.9},${y+s*0.25}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <path d="M${x-s*0.7},${y+s*0.2} Q${x-s*0.8},${y+s*0.1} ${x-s*0.95},${y+s*0.15}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Eye -->
                <circle cx="${x+s*0.5}" cy="${y-s*0.2}" r="${s*0.05}" fill="currentColor"/>
                <!-- Spin motion lines -->
                <path d="M${x-s*0.4},${y-s*0.5} Q${x-s*0.2},${y-s*0.6} ${x},${y-s*0.55}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.5"/>
                <path d="M${x-s*0.5},${y+s*0.4} Q${x-s*0.3},${y+s*0.5} ${x-s*0.1},${y+s*0.45}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.5"/>`;
    }
};

// =============================================================================
// GOAL ART GENERATORS - Theme-specific goals for end room
// =============================================================================

const GoalArt = {
    // Classic theme
    treasure: (x, y, size) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.5}" y="${y-s*0.1}" width="${s}" height="${s*0.7}" rx="${s*0.05}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.5},${y-s*0.1} Q${x-s*0.55},${y-s*0.4} ${x-s*0.3},${y-s*0.5} L${x+s*0.3},${y-s*0.5} Q${x+s*0.55},${y-s*0.4} ${x+s*0.5},${y-s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.5}" y1="${y+s*0.15}" x2="${x+s*0.5}" y2="${y+s*0.15}" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x}" cy="${y+s*0.15}" r="${s*0.12}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Ocean theme
    treasureChest: (x, y, size) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.6}" y="${y}" width="${s*1.2}" height="${s*0.7}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.6},${y} Q${x-s*0.65},${y-s*0.3} ${x-s*0.4},${y-s*0.4} L${x+s*0.4},${y-s*0.4} Q${x+s*0.65},${y-s*0.3} ${x+s*0.6},${y}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.6}" y1="${y+s*0.25}" x2="${x+s*0.6}" y2="${y+s*0.25}" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.1}" y="${y+s*0.1}" width="${s*0.2}" height="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.3}" cy="${y-s*0.55}" r="${s*0.1}" fill="currentColor"/>
                <circle cx="${x+s*0.2}" cy="${y-s*0.6}" r="${s*0.08}" fill="currentColor"/>
                <circle cx="${x}" cy="${y-s*0.5}" r="${s*0.12}" fill="currentColor"/>`;
    },

    // Space theme
    spaceStation: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.6}" ry="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.15}" y="${y-s*0.6}" width="${s*0.3}" height="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.15}" y="${y+s*0.1}" width="${s*0.3}" height="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y-s*0.6}" rx="${s*0.2}" ry="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y+s*0.6}" rx="${s*0.2}" ry="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.8}" y="${y-s*0.08}" width="${s*0.25}" height="${s*0.16}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x+s*0.55}" y="${y-s*0.08}" width="${s*0.25}" height="${s*0.16}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Garden theme
    beehive: (x, y, size) => {
        const s = size * 0.4;
        let svg = '';
        for (let i = 0; i < 4; i++) {
            const w = s * (0.8 - i * 0.15);
            const yy = y - s * 0.5 + i * s * 0.35;
            svg += `<ellipse cx="${x}" cy="${yy}" rx="${w}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>`;
        }
        svg += `<circle cx="${x}" cy="${y+s*0.5}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>`;
        return svg;
    },

    flowerGarden: (x, y, size) => {
        const s = size * 0.35;
        let svg = '';
        const positions = [[-0.4,-0.3], [0.4,-0.2], [0,0.3], [-0.3,0.5], [0.35,0.5]];
        for (const [px, py] of positions) {
            const fx = x + px * s;
            const fy = y + py * s;
            for (let i = 0; i < 5; i++) {
                const angle = i * Math.PI * 2 / 5 - Math.PI / 2;
                const ppx = fx + Math.cos(angle) * s * 0.2;
                const ppy = fy + Math.sin(angle) * s * 0.2;
                svg += `<circle cx="${ppx}" cy="${ppy}" r="${s*0.12}" fill="none" stroke="currentColor" stroke-width="1"/>`;
            }
            svg += `<circle cx="${fx}" cy="${fy}" r="${s*0.08}" fill="currentColor"/>`;
        }
        return svg;
    },

    // Candy theme
    candyCastle: (x, y, size) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.5}" y="${y-s*0.2}" width="${s}" height="${s*0.8}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.7}" y="${y-s*0.6}" width="${s*0.35}" height="${s*0.9}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x+s*0.35}" y="${y-s*0.6}" width="${s*0.35}" height="${s*0.9}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.7},${y-s*0.6} L${x-s*0.52},${y-s*0.9} L${x-s*0.35},${y-s*0.6}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.35},${y-s*0.6} L${x+s*0.52},${y-s*0.9} L${x+s*0.7},${y-s*0.6}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.52}" cy="${y-s*0.95}" r="${s*0.08}" fill="currentColor"/>
                <circle cx="${x+s*0.52}" cy="${y-s*0.95}" r="${s*0.08}" fill="currentColor"/>
                <rect x="${x-s*0.12}" y="${y+s*0.2}" width="${s*0.24}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Jungle theme
    temple: (x, y, size) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.6}" y="${y+s*0.2}" width="${s*1.2}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.45}" y="${y-s*0.1}" width="${s*0.9}" height="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.3}" y="${y-s*0.35}" width="${s*0.6}" height="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.35},${y-s*0.35} L${x},${y-s*0.7} L${x+s*0.35},${y-s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.08}" y="${y+s*0.3}" width="${s*0.16}" height="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.6}" y1="${y+s*0.35}" x2="${x-s*0.6}" y2="${y+s*0.6}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.6}" y1="${y+s*0.35}" x2="${x+s*0.6}" y2="${y+s*0.6}" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Ocean goals
    coralPalace: (x, y, size) => {
        const s = size * 0.4;
        return `<path d="M${x-s*0.6},${y+s*0.5} L${x-s*0.6},${y-s*0.2} Q${x-s*0.5},${y-s*0.5} ${x-s*0.3},${y-s*0.4} L${x-s*0.3},${y+s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.6},${y+s*0.5} L${x+s*0.6},${y-s*0.2} Q${x+s*0.5},${y-s*0.5} ${x+s*0.3},${y-s*0.4} L${x+s*0.3},${y+s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.3},${y-s*0.4} Q${x},${y-s*0.8} ${x+s*0.3},${y-s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y-s*0.5}" rx="${s*0.15}" ry="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.1}" y="${y+s*0.1}" width="${s*0.2}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.45}" cy="${y+s*0.3}" r="${s*0.08}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.45}" cy="${y+s*0.2}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    sunkenShip: (x, y, size) => {
        const s = size * 0.4;
        return `<path d="M${x-s*0.7},${y+s*0.4} Q${x-s*0.6},${y+s*0.6} ${x},${y+s*0.5} Q${x+s*0.6},${y+s*0.4} ${x+s*0.7},${y+s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.5},${y+s*0.3} L${x-s*0.4},${y-s*0.1} L${x+s*0.3},${y-s*0.1} L${x+s*0.5},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.1}" y1="${y-s*0.1}" x2="${x-s*0.1}" y2="${y-s*0.7}" stroke="currentColor" stroke-width="1.3"/>
                <path d="M${x-s*0.1},${y-s*0.65} L${x+s*0.3},${y-s*0.45} L${x+s*0.3},${y-s*0.25} L${x-s*0.1},${y-s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.1}" y1="${y-s*0.5}" x2="${x+s*0.3}" y2="${y-s*0.35}" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.3}" cy="${y+s*0.1}" r="${s*0.08}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.15}" cy="${y+s*0.15}" r="${s*0.06}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Space goals
    warpGate: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.7}" ry="${s*0.9}" fill="none" stroke="currentColor" stroke-width="1.3"/>
                <ellipse cx="${x}" cy="${y}" rx="${s*0.55}" ry="${s*0.7}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y}" rx="${s*0.4}" ry="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y}" rx="${s*0.2}" ry="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.5}" cy="${y-s*0.6}" r="${s*0.08}" fill="currentColor"/>
                <circle cx="${x+s*0.55}" cy="${y-s*0.5}" r="${s*0.06}" fill="currentColor"/>
                <circle cx="${x+s*0.4}" cy="${y+s*0.7}" r="${s*0.07}" fill="currentColor"/>
                <circle cx="${x-s*0.45}" cy="${y+s*0.65}" r="${s*0.05}" fill="currentColor"/>`;
    },

    moonBase: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y+s*0.5}" rx="${s*0.8}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.4},${y+s*0.4} L${x-s*0.4},${y} Q${x-s*0.4},${y-s*0.3} ${x-s*0.2},${y-s*0.3} L${x+s*0.2},${y-s*0.3} Q${x+s*0.4},${y-s*0.3} ${x+s*0.4},${y} L${x+s*0.4},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x}" cy="${y-s*0.5}" r="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.3}" x2="${x}" y2="${y-s*0.7}" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.2}" cy="${y+s*0.1}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.2}" cy="${y+s*0.15}" r="${s*0.08}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.65}" y="${y+s*0.2}" width="${s*0.2}" height="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x+s*0.45}" y="${y+s*0.2}" width="${s*0.2}" height="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    rocketShip: (x, y, size) => {
        const s = size * 0.4;
        return `<path d="M${x},${y-s*0.9} Q${x-s*0.3},${y-s*0.6} ${x-s*0.3},${y+s*0.3} L${x+s*0.3},${y+s*0.3} Q${x+s*0.3},${y-s*0.6} ${x},${y-s*0.9}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x}" cy="${y-s*0.3}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.3},${y+s*0.1} L${x-s*0.5},${y+s*0.5} L${x-s*0.3},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.3},${y+s*0.1} L${x+s*0.5},${y+s*0.5} L${x+s*0.3},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.15},${y+s*0.3} L${x-s*0.2},${y+s*0.7} Q${x},${y+s*0.9} ${x+s*0.2},${y+s*0.7} L${x+s*0.15},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Garden goals
    mushroomHouse: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y-s*0.2}" rx="${s*0.6}" ry="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.25}" y="${y-s*0.1}" width="${s*0.5}" height="${s*0.7}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.25}" cy="${y-s*0.35}" r="${s*0.12}" fill="currentColor"/>
                <circle cx="${x+s*0.2}" cy="${y-s*0.25}" r="${s*0.1}" fill="currentColor"/>
                <circle cx="${x+s*0.35}" cy="${y-s*0.45}" r="${s*0.08}" fill="currentColor"/>
                <rect x="${x-s*0.1}" y="${y+s*0.25}" width="${s*0.2}" height="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.05}" cy="${y+s*0.4}" r="${s*0.04}" fill="currentColor"/>`;
    },

    greenhouse: (x, y, size) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.6}" y="${y}" width="${s*1.2}" height="${s*0.6}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.6},${y} L${x},${y-s*0.5} L${x+s*0.6},${y}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.5}" x2="${x}" y2="${y+s*0.6}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.6}" y1="${y+s*0.3}" x2="${x+s*0.6}" y2="${y+s*0.3}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.3}" y1="${y-s*0.25}" x2="${x-s*0.3}" y2="${y+s*0.6}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.3}" y1="${y-s*0.25}" x2="${x+s*0.3}" y2="${y+s*0.6}" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x-s*0.15}" cy="${y+s*0.45}" rx="${s*0.08}" ry="${s*0.12}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.15}" cy="${y+s*0.42}" rx="${s*0.1}" ry="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.45}" cy="${y+s*0.4}" rx="${s*0.08}" ry="${s*0.12}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Candy goals
    lollipopForest: (x, y, size) => {
        const s = size * 0.35;
        let svg = '';
        const positions = [[-0.5, 0], [0, -0.2], [0.5, 0.1]];
        for (let i = 0; i < positions.length; i++) {
            const [px, py] = positions[i];
            const lx = x + px * s;
            const ly = y + py * s;
            const r = s * (0.3 + i * 0.05);
            svg += `<line x1="${lx}" y1="${ly}" x2="${lx}" y2="${ly+s*0.8}" stroke="currentColor" stroke-width="1.3"/>`;
            svg += `<circle cx="${lx}" cy="${ly-r*0.3}" r="${r}" fill="none" stroke="currentColor" stroke-width="1"/>`;
            svg += `<path d="M${lx-r*0.7},${ly-r*0.3} Q${lx},${ly-r} ${lx+r*0.7},${ly-r*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>`;
        }
        return svg;
    },

    chocolateFountain: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y+s*0.5}" rx="${s*0.7}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y+s*0.2}" rx="${s*0.5}" ry="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y-s*0.1}" rx="${s*0.35}" ry="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y-s*0.35}" rx="${s*0.2}" ry="${s*0.08}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y+s*0.35}" x2="${x}" y2="${y-s*0.35}" stroke="currentColor" stroke-width="1.3"/>
                <path d="M${x-s*0.2},${y-s*0.35} Q${x-s*0.35},${y-s*0.1} ${x-s*0.5},${y+s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.2},${y-s*0.35} Q${x+s*0.35},${y-s*0.1} ${x+s*0.5},${y+s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Jungle goals
    waterfall: (x, y, size) => {
        const s = size * 0.4;
        return `<path d="M${x-s*0.6},${y-s*0.6} L${x-s*0.3},${y-s*0.5} L${x-s*0.3},${y-s*0.3} L${x+s*0.3},${y-s*0.3} L${x+s*0.3},${y-s*0.5} L${x+s*0.6},${y-s*0.6}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.2},${y-s*0.3} Q${x-s*0.25},${y} ${x-s*0.15},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x},${y-s*0.3} Q${x+s*0.05},${y+s*0.1} ${x},${y+s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.2},${y-s*0.3} Q${x+s*0.15},${y} ${x+s*0.2},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y+s*0.6}" rx="${s*0.5}" ry="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.7},${y-s*0.5} Q${x-s*0.8},${y-s*0.3} ${x-s*0.65},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.7},${y-s*0.5} Q${x+s*0.8},${y-s*0.3} ${x+s*0.65},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    treehouseVillage: (x, y, size) => {
        const s = size * 0.4;
        return `<line x1="${x-s*0.4}" y1="${y+s*0.7}" x2="${x-s*0.4}" y2="${y-s*0.3}" stroke="currentColor" stroke-width="1.3"/>
                <line x1="${x+s*0.4}" y1="${y+s*0.7}" x2="${x+s*0.4}" y2="${y-s*0.2}" stroke="currentColor" stroke-width="1.3"/>
                <rect x="${x-s*0.65}" y="${y-s*0.1}" width="${s*0.5}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.7},${y-s*0.1} L${x-s*0.4},${y-s*0.4} L${x-s*0.1},${y-s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x+s*0.15}" y="${y-s*0.2}" width="${s*0.5}" height="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.1},${y-s*0.2} L${x+s*0.4},${y-s*0.5} L${x+s*0.7},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.15},${y+s*0.1} Q${x},${y+s*0.2} ${x+s*0.15},${y+s*0.05}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.4}" y1="${y+s*0.5}" x2="${x-s*0.6}" y2="${y+s*0.7}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.4}" y1="${y+s*0.5}" x2="${x+s*0.6}" y2="${y+s*0.7}" stroke="currentColor" stroke-width="1"/>`;
    },

    // =============================================================================
    // DOLPHIN THEME GOALS - Educational destinations
    // =============================================================================

    // Dolphin Pod - dolphins live in groups
    // Fact: Pods can have 2-30 dolphins, sometimes 1000+
    dolphinPod: (x, y, size) => {
        const s = size * 0.35;
        // Multiple dolphins swimming together
        return `<!-- Lead dolphin -->
                <path d="M${x-s*0.2},${y-s*0.3} Q${x},${y-s*0.5} ${x+s*0.4},${y-s*0.4} Q${x+s*0.6},${y-s*0.35} ${x+s*0.7},${y-s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.2},${y-s*0.3} Q${x+s*0.1},${y-s*0.15} ${x+s*0.5},${y-s*0.2} Q${x+s*0.6},${y-s*0.25} ${x+s*0.7},${y-s*0.3}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <path d="M${x+s*0.3},${y-s*0.4} L${x+s*0.35},${y-s*0.55}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Second dolphin -->
                <path d="M${x-s*0.5},${y} Q${x-s*0.3},${y-s*0.15} ${x+s*0.1},${y-s*0.1} Q${x+s*0.25},${y-s*0.05} ${x+s*0.35},${y}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.5},${y} Q${x-s*0.25},${y+s*0.1} ${x+s*0.1},${y+s*0.05} Q${x+s*0.25},${y} ${x+s*0.35},${y}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <path d="M${x},${y-s*0.1} L${x+s*0.05},${y-s*0.22}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Third dolphin (calf) -->
                <path d="M${x-s*0.3},${y+s*0.35} Q${x-s*0.1},${y+s*0.2} ${x+s*0.15},${y+s*0.25}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <path d="M${x-s*0.3},${y+s*0.35} Q${x-s*0.15},${y+s*0.45} ${x+s*0.1},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <!-- Water splashes -->
                <path d="M${x+s*0.5},${y-s*0.5} Q${x+s*0.55},${y-s*0.6} ${x+s*0.65},${y-s*0.55}" fill="none" stroke="currentColor" stroke-width="0.5"/>
                <path d="M${x+s*0.2},${y-s*0.15} Q${x+s*0.25},${y-s*0.2} ${x+s*0.3},${y-s*0.18}" fill="none" stroke="currentColor" stroke-width="0.5"/>`;
    },

    // Marine Research Station - for studying dolphins
    // Fact: Photo-ID databases track individual dolphins
    researchStation: (x, y, size) => {
        const s = size * 0.4;
        return `<!-- Main building -->
                <rect x="${x-s*0.5}" y="${y-s*0.2}" width="${s*0.7}" height="${s*0.6}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Observation tower -->
                <rect x="${x+s*0.1}" y="${y-s*0.7}" width="${s*0.35}" height="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.05},${y-s*0.7} L${x+s*0.275},${y-s*0.9} L${x+s*0.5},${y-s*0.7}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Windows -->
                <rect x="${x-s*0.4}" y="${y-s*0.1}" width="${s*0.15}" height="${s*0.15}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <rect x="${x-s*0.15}" y="${y-s*0.1}" width="${s*0.15}" height="${s*0.15}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <rect x="${x+s*0.2}" y="${y-s*0.55}" width="${s*0.12}" height="${s*0.15}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Satellite dish -->
                <path d="M${x-s*0.3},${y-s*0.35} Q${x-s*0.5},${y-s*0.5} ${x-s*0.35},${y-s*0.6}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <line x1="${x-s*0.35}" y1="${y-s*0.2}" x2="${x-s*0.4}" y2="${y-s*0.45}" stroke="currentColor" stroke-width="0.8"/>
                <!-- Dock/pier -->
                <line x1="${x-s*0.5}" y1="${y+s*0.4}" x2="${x-s*0.8}" y2="${y+s*0.4}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.65}" y1="${y+s*0.4}" x2="${x-s*0.65}" y2="${y+s*0.6}" stroke="currentColor" stroke-width="0.8"/>
                <!-- Water -->
                <path d="M${x-s*0.9},${y+s*0.55} Q${x-s*0.7},${y+s*0.5} ${x-s*0.5},${y+s*0.55}" fill="none" stroke="currentColor" stroke-width="0.6"/>`;
    },

    // Coral Reef Habitat - dolphins visit reefs
    // Fact: Reefs provide shelter and food for dolphins
    coralReefHabitat: (x, y, size) => {
        const s = size * 0.4;
        return `<!-- Coral formations -->
                <path d="M${x-s*0.5},${y+s*0.5} L${x-s*0.5},${y+s*0.1} Q${x-s*0.6},${y-s*0.1} ${x-s*0.5},${y-s*0.25} Q${x-s*0.4},${y-s*0.1} ${x-s*0.5},${y+s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.35},${y+s*0.5} L${x-s*0.35},${y+s*0.2} Q${x-s*0.25},${y} ${x-s*0.3},${y-s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x},${y+s*0.5} L${x},${y+s*0.15} Q${x-s*0.1},${y-s*0.05} ${x-s*0.15},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x},${y+s*0.15} Q${x+s*0.1},${y} ${x+s*0.15},${y-s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Brain coral -->
                <ellipse cx="${x+s*0.35}" cy="${y+s*0.3}" rx="${s*0.25}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.2},${y+s*0.3} Q${x+s*0.35},${y+s*0.2} ${x+s*0.5},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <path d="M${x+s*0.25},${y+s*0.35} Q${x+s*0.35},${y+s*0.4} ${x+s*0.45},${y+s*0.35}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <!-- Small fish -->
                <ellipse cx="${x+s*0.1}" cy="${y-s*0.35}" rx="${s*0.1}" ry="${s*0.05}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <ellipse cx="${x-s*0.2}" cy="${y-s*0.4}" rx="${s*0.08}" ry="${s*0.04}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <!-- Bubbles -->
                <circle cx="${x+s*0.45}" cy="${y-s*0.2}" r="${s*0.04}" fill="none" stroke="currentColor" stroke-width="0.5"/>
                <circle cx="${x+s*0.5}" cy="${y-s*0.35}" r="${s*0.03}" fill="none" stroke="currentColor" stroke-width="0.5"/>`;
    },

    // Marine Conservation Center - protects dolphins
    // Fact: Many dolphins are rescued and rehabilitated
    conservationCenter: (x, y, size) => {
        const s = size * 0.4;
        return `<!-- Main building with pool -->
                <rect x="${x-s*0.6}" y="${y-s*0.3}" width="${s*0.8}" height="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.65},${y-s*0.3} L${x-s*0.2},${y-s*0.6} L${x+s*0.25},${y-s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Pool area -->
                <ellipse cx="${x+s*0.35}" cy="${y+s*0.2}" rx="${s*0.4}" ry="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.15},${y+s*0.15} Q${x+s*0.35},${y+s*0.05} ${x+s*0.55},${y+s*0.15}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <!-- Dolphin in pool -->
                <path d="M${x+s*0.2},${y+s*0.25} Q${x+s*0.35},${y+s*0.15} ${x+s*0.5},${y+s*0.2}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Heart symbol (care) -->
                <path d="M${x-s*0.2},${y-s*0.5} Q${x-s*0.3},${y-s*0.6} ${x-s*0.2},${y-s*0.45} Q${x-s*0.1},${y-s*0.6} ${x-s*0.2},${y-s*0.5}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Medical cross -->
                <line x1="${x-s*0.4}" y1="${y-s*0.1}" x2="${x-s*0.4}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.5}" y1="${y}" x2="${x-s*0.3}" y2="${y}" stroke="currentColor" stroke-width="1"/>`;
    },

    // Open Ocean - dolphin's natural habitat
    // Fact: Some dolphins migrate thousands of miles
    openOcean: (x, y, size) => {
        const s = size * 0.45;
        return `<!-- Horizon line -->
                <line x1="${x-s*0.8}" y1="${y-s*0.2}" x2="${x+s*0.8}" y2="${y-s*0.2}" stroke="currentColor" stroke-width="0.8"/>
                <!-- Sun/Moon -->
                <circle cx="${x+s*0.4}" cy="${y-s*0.5}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Waves -->
                <path d="M${x-s*0.8},${y} Q${x-s*0.5},${y-s*0.15} ${x-s*0.2},${y} T${x+s*0.4},${y} T${x+s*0.8},${y}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.7},${y+s*0.2} Q${x-s*0.4},${y+s*0.1} ${x-s*0.1},${y+s*0.2} T${x+s*0.5},${y+s*0.2}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <path d="M${x-s*0.6},${y+s*0.4} Q${x-s*0.3},${y+s*0.3} ${x},${y+s*0.4} T${x+s*0.6},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <!-- Dolphin jumping -->
                <path d="M${x-s*0.3},${y-s*0.1} Q${x-s*0.1},${y-s*0.5} ${x+s*0.2},${y-s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.3},${y-s*0.1} Q${x-s*0.05},${y-s*0.25} ${x+s*0.2},${y-s*0.35}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <path d="M${x},${y-s*0.4} L${x+s*0.05},${y-s*0.55}" fill="none" stroke="currentColor" stroke-width="0.8"/>
                <!-- Splash -->
                <path d="M${x-s*0.35},${y-s*0.05} Q${x-s*0.4},${y-s*0.15} ${x-s*0.3},${y-s*0.1}" fill="none" stroke="currentColor" stroke-width="0.5"/>`;
    },

    // Feeding Grounds - where dolphins hunt
    // Fact: Dolphins use teamwork to herd fish
    feedingGrounds: (x, y, size) => {
        const s = size * 0.4;
        return `<!-- School of fish being herded -->
                <ellipse cx="${x-s*0.1}" cy="${y}" rx="${s*0.08}" ry="${s*0.04}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <ellipse cx="${x+s*0.05}" cy="${y-s*0.1}" rx="${s*0.07}" ry="${s*0.035}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <ellipse cx="${x-s*0.05}" cy="${y+s*0.12}" rx="${s*0.08}" ry="${s*0.04}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <ellipse cx="${x+s*0.15}" cy="${y+s*0.05}" rx="${s*0.07}" ry="${s*0.035}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <ellipse cx="${x}" cy="${y-s*0.2}" rx="${s*0.06}" ry="${s*0.03}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <ellipse cx="${x+s*0.1}" cy="${y+s*0.2}" rx="${s*0.07}" ry="${s*0.035}" fill="none" stroke="currentColor" stroke-width="0.6"/>
                <!-- Dolphins surrounding fish -->
                <path d="M${x-s*0.6},${y-s*0.2} Q${x-s*0.45},${y-s*0.35} ${x-s*0.3},${y-s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.5},${y-s*0.3} Q${x+s*0.35},${y-s*0.4} ${x+s*0.25},${y-s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.5},${y+s*0.35} Q${x-s*0.35},${y+s*0.45} ${x-s*0.2},${y+s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.55},${y+s*0.25} Q${x+s*0.4},${y+s*0.35} ${x+s*0.3},${y+s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <!-- Bubbles from echolocation -->
                <circle cx="${x-s*0.25}" cy="${y-s*0.3}" r="${s*0.03}" fill="none" stroke="currentColor" stroke-width="0.4"/>
                <circle cx="${x+s*0.2}" cy="${y-s*0.35}" r="${s*0.025}" fill="none" stroke="currentColor" stroke-width="0.4"/>`;
    }
};

// Border pattern generators - decorative frames around the maze
const BorderPatterns = {
    simple: (width, height, padding, rng) => {
        // Simple double-line border
        const inset = 4;
        return `<rect x="${inset}" y="${inset}" width="${width - inset*2}" height="${height - inset*2}" fill="none" stroke="currentColor" stroke-width="1.3" rx="3"/>
                <rect x="${inset + 6}" y="${inset + 6}" width="${width - inset*2 - 12}" height="${height - inset*2 - 12}" fill="none" stroke="currentColor" stroke-width="1" rx="2"/>`;
    },

    waves: (width, height, padding, rng) => {
        let svg = '';
        const waveH = 6;
        const waveW = 16;
        // Top and bottom wave borders
        for (let x = 10; x < width - 10; x += waveW) {
            svg += `<path d="M${x},8 Q${x + waveW/2},${8 + waveH} ${x + waveW},8" fill="none" stroke="currentColor" stroke-width="1"/>`;
            svg += `<path d="M${x},${height-8} Q${x + waveW/2},${height-8-waveH} ${x + waveW},${height-8}" fill="none" stroke="currentColor" stroke-width="1"/>`;
        }
        // Side borders
        svg += `<line x1="6" y1="15" x2="6" y2="${height-15}" stroke="currentColor" stroke-width="1.3"/>`;
        svg += `<line x1="${width-6}" y1="15" x2="${width-6}" y2="${height-15}" stroke="currentColor" stroke-width="1.3"/>`;
        return svg;
    },

    stars: (width, height, padding, rng) => {
        let svg = `<rect x="4" y="4" width="${width-8}" height="${height-8}" fill="none" stroke="currentColor" stroke-width="1.3" rx="2"/>`;
        // Scatter small stars in corners
        for (let i = 0; i < 8; i++) {
            const x = rng.nextInt(8, 25);
            const y = rng.nextInt(8, 25);
            const s = rng.nextInt(3, 6);
            svg += `<circle cx="${x}" cy="${y}" r="${s}" fill="currentColor" opacity="0.4"/>`;
            svg += `<circle cx="${width-x}" cy="${y}" r="${s}" fill="currentColor" opacity="0.4"/>`;
            svg += `<circle cx="${x}" cy="${height-y}" r="${s}" fill="currentColor" opacity="0.4"/>`;
            svg += `<circle cx="${width-x}" cy="${height-y}" r="${s}" fill="currentColor" opacity="0.4"/>`;
        }
        return svg;
    },

    vines: (width, height, padding, rng) => {
        let svg = `<rect x="4" y="4" width="${width-8}" height="${height-8}" fill="none" stroke="currentColor" stroke-width="1.3" rx="2"/>`;
        // Left and right vines
        for (let y = 20; y < height - 20; y += 25) {
            svg += `<path d="M8,${y} Q15,${y+12} 8,${y+25}" fill="none" stroke="currentColor" stroke-width="1"/>`;
            svg += `<circle cx="12" cy="${y+8}" r="3" fill="none" stroke="currentColor" stroke-width="1"/>`;
            svg += `<path d="M${width-8},${y} Q${width-15},${y+12} ${width-8},${y+25}" fill="none" stroke="currentColor" stroke-width="1"/>`;
            svg += `<circle cx="${width-12}" cy="${y+8}" r="3" fill="none" stroke="currentColor" stroke-width="1"/>`;
        }
        return svg;
    },

    candy: (width, height, padding, rng) => {
        let svg = `<rect x="4" y="4" width="${width-8}" height="${height-8}" fill="none" stroke="currentColor" stroke-width="3" rx="8" stroke-dasharray="12,6"/>`;
        // Candy dots in corners
        for (let i = 0; i < 4; i++) {
            const x = 15 + i * 10;
            svg += `<circle cx="${x}" cy="15" r="4" fill="currentColor" opacity="0.5"/>`;
            svg += `<circle cx="${x}" cy="${height-15}" r="4" fill="currentColor" opacity="0.5"/>`;
            svg += `<circle cx="${width-x}" cy="15" r="4" fill="currentColor" opacity="0.5"/>`;
            svg += `<circle cx="${width-x}" cy="${height-15}" r="4" fill="currentColor" opacity="0.5"/>`;
        }
        return svg;
    },

    leaves: (width, height, padding, rng) => {
        let svg = `<rect x="4" y="4" width="${width-8}" height="${height-8}" fill="none" stroke="currentColor" stroke-width="1.3" rx="2"/>`;
        // Leaves in corners
        for (let i = 0; i < 6; i++) {
            const x = 12 + rng.nextInt(0, 15);
            const y = 12 + rng.nextInt(0, 15);
            const angle = rng.nextInt(0, 360);
            svg += `<g transform="translate(${x},${y}) rotate(${angle})" opacity="0.6"><path d="M0,-5 Q4,0 0,5 Q-4,0 0,-5" fill="none" stroke="currentColor" stroke-width="1"/></g>`;
            svg += `<g transform="translate(${width-x},${y}) rotate(${angle})" opacity="0.6"><path d="M0,-5 Q4,0 0,5 Q-4,0 0,-5" fill="none" stroke="currentColor" stroke-width="1"/></g>`;
            svg += `<g transform="translate(${x},${height-y}) rotate(${angle})" opacity="0.6"><path d="M0,-5 Q4,0 0,5 Q-4,0 0,-5" fill="none" stroke="currentColor" stroke-width="1"/></g>`;
            svg += `<g transform="translate(${width-x},${height-y}) rotate(${angle})" opacity="0.6"><path d="M0,-5 Q4,0 0,5 Q-4,0 0,-5" fill="none" stroke="currentColor" stroke-width="1"/></g>`;
        }
        return svg;
    },

    // Dolphin educational border - waves with small dolphin silhouettes
    dolphins: (width, height, padding, rng) => {
        let svg = '';
        // Outer frame
        svg += `<rect x="4" y="4" width="${width-8}" height="${height-8}" fill="none" stroke="currentColor" stroke-width="1.3" rx="3"/>`;

        // Top wave border with foam
        const waveW = 20;
        for (let x = 12; x < width - 20; x += waveW) {
            svg += `<path d="M${x},10 Q${x + waveW/4},6 ${x + waveW/2},10 T${x + waveW},10" fill="none" stroke="currentColor" stroke-width="1"/>`;
        }

        // Bottom wave border
        for (let x = 12; x < width - 20; x += waveW) {
            svg += `<path d="M${x},${height-10} Q${x + waveW/4},${height-14} ${x + waveW/2},${height-10} T${x + waveW},${height-10}" fill="none" stroke="currentColor" stroke-width="1"/>`;
        }

        // Small dolphin silhouettes in corners (educational - shows iconic shape)
        const drawMiniDolphin = (cx, cy, scale, flip) => {
            const f = flip ? -1 : 1;
            return `<g transform="translate(${cx},${cy}) scale(${f * scale},${scale})">
                <path d="M-8,0 Q-6,-4 0,-3 Q4,-2 7,0 Q4,2 0,1 Q-6,2 -8,0" fill="currentColor" opacity="0.5"/>
                <path d="M4,-2 Q6,-5 5,-3" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.5"/>
            </g>`;
        };

        // Add dolphins to corners
        svg += drawMiniDolphin(20, 20, 0.8, false);
        svg += drawMiniDolphin(width - 20, 20, 0.8, true);
        svg += drawMiniDolphin(20, height - 20, 0.8, false);
        svg += drawMiniDolphin(width - 20, height - 20, 0.8, true);

        // Side bubbles (educational - dolphins are mammals, breathe air)
        for (let y = 30; y < height - 30; y += 40) {
            svg += `<circle cx="8" cy="${y}" r="2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>`;
            svg += `<circle cx="12" cy="${y + 8}" r="1.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>`;
            svg += `<circle cx="${width-8}" cy="${y}" r="2" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>`;
            svg += `<circle cx="${width-12}" cy="${y + 8}" r="1.5" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.4"/>`;
        }

        return svg;
    }
};

// Cell class
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = { north: true, south: true, east: true, west: true };
        this.visited = false;
        this.blocked = false;
    }
}

// Maze class
class Maze {
    constructor(width, height, rng) {
        this.width = width;
        this.height = height;
        this.rng = rng;
        this.cells = [];
        this.startPos = null;
        this.endPos = null;
        this.solution = null;
        this.theme = Themes.classic;
        this.shape = 'rectangle';
        this.rooms = [];
        this.curvedWalls = false;

        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                row.push(new Cell(x, y));
            }
            this.cells.push(row);
        }
    }

    getCell(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.cells[y][x];
        }
        return null;
    }

    removeWall(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;

        if (dx === 1) {
            this.cells[y1][x1].walls.east = false;
            this.cells[y2][x2].walls.west = false;
        } else if (dx === -1) {
            this.cells[y1][x1].walls.west = false;
            this.cells[y2][x2].walls.east = false;
        } else if (dy === 1) {
            this.cells[y1][x1].walls.south = false;
            this.cells[y2][x2].walls.north = false;
        } else if (dy === -1) {
            this.cells[y1][x1].walls.north = false;
            this.cells[y2][x2].walls.south = false;
        }
    }

    applyShapeMask(shape) {
        this.shape = shape;
        const maskFn = ShapeMasks[shape] || ShapeMasks.rectangle;

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!maskFn(x, y, this.width, this.height)) {
                    this.cells[y][x].blocked = true;
                    this.cells[y][x].visited = true;
                }
            }
        }
    }

    // Find all connected regions of unblocked cells
    // OPTIMIZED: Uses 2D array instead of Set with string keys for 5-10x speedup
    findConnectedRegions() {
        const visited = new Array(this.height);
        for (let i = 0; i < this.height; i++) visited[i] = new Array(this.width).fill(false);

        const regions = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (visited[y][x] || this.cells[y][x].blocked) continue;

                // Flood fill to find this region - use array of coords
                const regionCells = [];
                const stack = [[x, y]];

                while (stack.length > 0) {
                    const [cx, cy] = stack.pop();
                    if (cx < 0 || cy < 0 || cx >= this.width || cy >= this.height) continue;
                    if (visited[cy][cx] || this.cells[cy][cx].blocked) continue;

                    visited[cy][cx] = true;
                    regionCells.push([cx, cy]);

                    // Check 4 neighbors - push in order that tends to fill faster
                    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
                }

                if (regionCells.length > 0) {
                    // Convert to Set for fast lookup
                    const region = new Set();
                    for (const [rx, ry] of regionCells) region.add(`${rx},${ry}`);
                    regions.push(region);
                }
            }
        }

        // Sort by size descending - largest region first
        regions.sort((a, b) => b.size - a.size);
        return regions;
    }

    findValidStartEnd(roomSize = 1) {
        // OPTIMIZATION: For rectangle shapes, skip connected regions check (all cells connected)
        let mainRegion;
        if (this.shape === 'rectangle') {
            mainRegion = new Set();
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    mainRegion.add(`${x},${y}`);
                }
            }
        } else {
            // Find connected regions - we only want start/end in the largest (main) region
            const regions = this.findConnectedRegions();
            mainRegion = regions[0] || new Set();
        }

        // Check if a position can hold a room of given size AND can connect to maze
        const canPlaceRoom = (x, y) => {
            if (x < 0 || y < 0 || x + roomSize > this.width || y + roomSize > this.height) return false;

            // All room cells must be unblocked
            for (let dy = 0; dy < roomSize; dy++) {
                for (let dx = 0; dx < roomSize; dx++) {
                    if (this.cells[y + dy][x + dx].blocked) return false;
                }
            }

            // Room must have at least one cell in the main region
            let inMainRegion = false;
            for (let dy = 0; dy < roomSize; dy++) {
                for (let dx = 0; dx < roomSize; dx++) {
                    if (mainRegion.has(`${x + dx},${y + dy}`)) {
                        inMainRegion = true;
                        break;
                    }
                }
                if (inMainRegion) break;
            }
            if (!inMainRegion) return false;

            // Room should have at least one adjacent non-blocked cell to connect to
            // For very small mazes, skip this check as rooms might fill most of the space
            if (this.width * this.height < 100) {
                return true; // Small maze - accept any valid position
            }

            // Check all cells adjacent to the room boundary
            let hasConnection = false;
            for (let i = 0; i < roomSize && !hasConnection; i++) {
                // Check north edge (y - 1)
                if (y > 0 && !this.cells[y - 1][x + i].blocked) hasConnection = true;
                // Check south edge (y + roomSize)
                if (y + roomSize < this.height && !this.cells[y + roomSize][x + i].blocked) hasConnection = true;
                // Check west edge (x - 1)
                if (x > 0 && !this.cells[y + i][x - 1].blocked) hasConnection = true;
                // Check east edge (x + roomSize)
                if (x + roomSize < this.width && !this.cells[y + i][x + roomSize].blocked) hasConnection = true;
            }

            return hasConnection;
        };

        // Check if position is on perimeter (room touches edge of shape, not just grid)
        const isOnPerimeter = (x, y) => {
            // Grid edge counts as perimeter
            if (x === 0 || y === 0 || x + roomSize >= this.width || y + roomSize >= this.height) {
                return true;
            }
            // For shaped mazes, also check if room is adjacent to blocked cells (shape edge)
            for (let i = 0; i < roomSize; i++) {
                // Check if any room edge cell has a blocked neighbor
                if (y > 0 && this.cells[y - 1][x + i].blocked) return true;  // North
                if (y + roomSize < this.height && this.cells[y + roomSize][x + i].blocked) return true;  // South
                if (x > 0 && this.cells[y + i][x - 1].blocked) return true;  // West
                if (x + roomSize < this.width && this.cells[y + i][x + roomSize].blocked) return true;  // East
            }
            return false;
        };

        // Collect ALL valid perimeter positions for rooms in main region
        const perimeterPositions = [];

        // Collect all valid perimeter positions
        for (let y = 0; y <= this.height - roomSize; y++) {
            for (let x = 0; x <= this.width - roomSize; x++) {
                if (canPlaceRoom(x, y) && isOnPerimeter(x, y)) {
                    // Determine which edge(s) this position touches
                    const edges = [];
                    if (y === 0) edges.push('top');
                    if (y + roomSize >= this.height) edges.push('bottom');
                    if (x === 0) edges.push('left');
                    if (x + roomSize >= this.width) edges.push('right');
                    perimeterPositions.push({ x, y, edges });
                }
            }
        }

        if (perimeterPositions.length < 2) {
            // Fallback: just find any two positions in main region
            for (let y = 0; y <= this.height - roomSize && !this.startPos; y++) {
                for (let x = 0; x <= this.width - roomSize && !this.startPos; x++) {
                    if (canPlaceRoom(x, y)) this.startPos = { x, y };
                }
            }
            for (let y = this.height - roomSize; y >= 0 && !this.endPos; y--) {
                for (let x = this.width - roomSize; x >= 0 && !this.endPos; x--) {
                    if (canPlaceRoom(x, y) && (x !== this.startPos?.x || y !== this.startPos?.y)) {
                        this.endPos = { x, y };
                    }
                }
            }
            return this.startPos && this.endPos;
        }

        // Shuffle positions for randomness
        const shuffled = this.rng.shuffle([...perimeterPositions]);

        // Need at least 2 positions for start and end
        if (shuffled.length < 2) {
            // Not enough room for start/end - use any valid cells as fallback
            this.startPos = shuffled[0] || null;
            this.endPos = shuffled[1] || shuffled[0] || null;
            return this.startPos && this.endPos;
        }

        // Pick start position randomly
        this.startPos = shuffled[0];

        // Pick end position - prefer one that's far from start and on different edge
        const minDistance = Math.max(this.width, this.height) * 0.4;
        let bestEnd = null;
        let bestScore = -1;

        for (let i = 1; i < shuffled.length; i++) {
            const pos = shuffled[i];
            const dist = Math.abs(pos.x - this.startPos.x) + Math.abs(pos.y - this.startPos.y);

            // Score: distance + bonus for different edges
            let score = dist;
            const startEdges = this.startPos.edges || [];
            const posEdges = pos.edges || [];
            const sharedEdges = startEdges.filter(e => posEdges.includes(e)).length;
            if (sharedEdges === 0) score += minDistance; // Bonus for different edge

            if (dist >= minDistance && score > bestScore) {
                bestScore = score;
                bestEnd = pos;
            }
        }

        // Fallback to any distant position
        if (!bestEnd) {
            for (let i = 1; i < shuffled.length; i++) {
                const pos = shuffled[i];
                const dist = Math.abs(pos.x - this.startPos.x) + Math.abs(pos.y - this.startPos.y);
                if (dist > bestScore) {
                    bestScore = dist;
                    bestEnd = pos;
                }
            }
        }

        this.endPos = bestEnd || shuffled[1];

        return this.startPos && this.endPos;
    }

    carveRoom(x, y, w, h) {
        // Remove interior walls to create open room (supports rectangular rooms)
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                if (y + dy >= this.height || x + dx >= this.width) continue;
                const cell = this.cells[y + dy][x + dx];
                if (dy > 0) {
                    cell.walls.north = false;
                    this.cells[y + dy - 1][x + dx].walls.south = false;
                }
                if (dx > 0) {
                    cell.walls.west = false;
                    this.cells[y + dy][x + dx - 1].walls.east = false;
                }
            }
        }
    }

    createEntranceExit() {
        // Calculate room size - needs to be big enough for readable art
        // Larger mazes have smaller cells, so need MORE cells for same physical size
        // Target: ~40px minimum art space, with cellSize = floor(350 / max(w,h))
        const cellSize = Math.min(18, Math.max(8, Math.floor(350 / Math.max(this.width, this.height))));
        const MIN_ART_PIXELS = 40; // Minimum pixels for readable art
        const minRoomCells = Math.ceil(MIN_ART_PIXELS / cellSize);
        // Clamp between 2 and 6 cells
        let targetRoomSize = Math.min(6, Math.max(2, minRoomCells));

        // For very small mazes, use smaller rooms to ensure they fit
        if (this.width * this.height < 100) {
            targetRoomSize = Math.min(2, targetRoomSize);
        }

        // Try progressively smaller room sizes until one fits
        let roomSize = targetRoomSize;
        let foundValid = false;
        while (roomSize >= 1 && !foundValid) {
            if (this.findValidStartEnd(roomSize)) {
                foundValid = true;
            } else {
                roomSize--;
            }
        }

        // If no valid position found at all, return without setting solution
        if (!foundValid || roomSize < 1) return;

        // Validate positions exist and are within bounds
        if (!this.startPos || !this.endPos) return;
        if (this.startPos.y + roomSize > this.height || this.startPos.x + roomSize > this.width) return;
        if (this.endPos.y + roomSize > this.height || this.endPos.x + roomSize > this.width) return;

        this.startRoomSize = roomSize;
        this.endRoomSize = roomSize;

        // Carve start and end rooms (remove interior walls only, keep exterior walls intact)
        this.carveRoom(this.startPos.x, this.startPos.y, roomSize, roomSize);
        this.carveRoom(this.endPos.x, this.endPos.y, roomSize, roomSize);

        this.solution = this.findPath(this.startPos, this.endPos);
    }

    // Connect a room to the adjacent maze passages
    connectRoomToMaze(roomX, roomY, roomSize) {
        // Find all cells adjacent to the room that are not blocked and not part of the room
        const adjacentCells = [];

        // Check cells adjacent to each edge of the room
        for (let i = 0; i < roomSize; i++) {
            // North edge - check cell above
            if (roomY > 0) {
                const cell = this.cells[roomY - 1]?.[roomX + i];
                if (cell && !cell.blocked) {
                    adjacentCells.push({ x: roomX + i, y: roomY - 1, roomX: roomX + i, roomY: roomY, dir: 'north' });
                }
            }
            // South edge - check cell below
            if (roomY + roomSize < this.height) {
                const cell = this.cells[roomY + roomSize]?.[roomX + i];
                if (cell && !cell.blocked) {
                    adjacentCells.push({ x: roomX + i, y: roomY + roomSize, roomX: roomX + i, roomY: roomY + roomSize - 1, dir: 'south' });
                }
            }
            // West edge - check cell to the left
            if (roomX > 0) {
                const cell = this.cells[roomY + i]?.[roomX - 1];
                if (cell && !cell.blocked) {
                    adjacentCells.push({ x: roomX - 1, y: roomY + i, roomX: roomX, roomY: roomY + i, dir: 'west' });
                }
            }
            // East edge - check cell to the right
            if (roomX + roomSize < this.width) {
                const cell = this.cells[roomY + i]?.[roomX + roomSize];
                if (cell && !cell.blocked) {
                    adjacentCells.push({ x: roomX + roomSize, y: roomY + i, roomX: roomX + roomSize - 1, roomY: roomY + i, dir: 'east' });
                }
            }
        }

        // Open walls to connect room to at least one adjacent maze cell
        // Open multiple connections for better maze flow
        const maxConnections = Math.min(3, adjacentCells.length);
        const shuffled = this.rng ? this.rng.shuffle([...adjacentCells]) : adjacentCells;

        for (let i = 0; i < maxConnections; i++) {
            const adj = shuffled[i];
            if (!adj) continue;

            const roomCell = this.cells[adj.roomY]?.[adj.roomX];
            const adjCell = this.cells[adj.y]?.[adj.x];
            if (!roomCell || !adjCell) continue;

            // Open the wall between room cell and adjacent cell
            if (adj.dir === 'north') {
                roomCell.walls.north = false;
                adjCell.walls.south = false;
            } else if (adj.dir === 'south') {
                roomCell.walls.south = false;
                adjCell.walls.north = false;
            } else if (adj.dir === 'west') {
                roomCell.walls.west = false;
                adjCell.walls.east = false;
            } else if (adj.dir === 'east') {
                roomCell.walls.east = false;
                adjCell.walls.west = false;
            }
        }
    }

    findPath(start, end) {
        if (!start || !end) return null;

        const visited = new Set();
        const parent = new Map();
        const queue = [start];
        visited.add(`${start.x},${start.y}`);

        while (queue.length > 0) {
            const current = queue.shift();
            const { x, y } = current;

            if (x === end.x && y === end.y) {
                const path = [];
                let node = end;
                while (node) {
                    path.unshift({ ...node });
                    const key = `${node.x},${node.y}`;
                    node = parent.get(key);
                }
                return path;
            }

            const cell = this.cells[y][x];
            const neighbors = [];

            if (!cell.walls.north && y > 0 && !this.cells[y-1][x].blocked)
                neighbors.push({ x, y: y - 1 });
            if (!cell.walls.south && y < this.height - 1 && !this.cells[y+1][x].blocked)
                neighbors.push({ x, y: y + 1 });
            if (!cell.walls.east && x < this.width - 1 && !this.cells[y][x+1].blocked)
                neighbors.push({ x: x + 1, y });
            if (!cell.walls.west && x > 0 && !this.cells[y][x-1].blocked)
                neighbors.push({ x: x - 1, y });

            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    parent.set(key, current);
                    queue.push(neighbor);
                }
            }
        }

        return null;
    }

    roomOverlaps(rx, ry, rw, rh, existingRooms, minGap = 3) {
        // Check if room overlaps with existing rooms (including gap)
        for (const room of existingRooms) {
            if (rx + rw + minGap > room.x && rx < room.x + room.w + minGap &&
                ry + rh + minGap > room.y && ry < room.y + room.h + minGap) {
                return true;
            }
        }
        // Check overlap with start/end rooms
        if (this.startPos) {
            const ss = this.startRoomSize || 2;
            if (rx + rw + minGap > this.startPos.x && rx < this.startPos.x + ss + minGap &&
                ry + rh + minGap > this.startPos.y && ry < this.startPos.y + ss + minGap) {
                return true;
            }
        }
        if (this.endPos) {
            const es = this.endRoomSize || 2;
            if (rx + rw + minGap > this.endPos.x && rx < this.endPos.x + es + minGap &&
                ry + rh + minGap > this.endPos.y && ry < this.endPos.y + es + minGap) {
                return true;
            }
        }
        return false;
    }

    addRooms() {
        if (this.width < 12 || this.height < 12) return;

        // More rooms for larger mazes
        const area = this.width * this.height;
        const numRooms = Math.min(8, Math.max(2, Math.floor(area / 150)));

        // Base room size scales with maze size
        const baseSize = Math.max(2, Math.ceil(Math.min(this.width, this.height) / 12));

        for (let i = 0; i < numRooms; i++) {
            for (let attempt = 0; attempt < 30; attempt++) {
                // Vary room dimensions (sometimes rectangular)
                const rw = baseSize + (this.rng.next() > 0.7 ? this.rng.nextInt(0, 2) : 0);
                const rh = baseSize + (this.rng.next() > 0.7 ? this.rng.nextInt(0, 2) : 0);

                const rx = this.rng.nextInt(3, this.width - rw - 3);
                const ry = this.rng.nextInt(3, this.height - rh - 3);

                // Check all cells are unblocked
                let canPlace = true;
                for (let dy = 0; dy < rh && canPlace; dy++) {
                    for (let dx = 0; dx < rw && canPlace; dx++) {
                        if (this.cells[ry + dy][rx + dx].blocked) canPlace = false;
                    }
                }

                // Check minimum gap from other rooms
                if (canPlace && this.roomOverlaps(rx, ry, rw, rh, this.rooms, 3)) {
                    canPlace = false;
                }

                if (canPlace) {
                    this.carveRoom(rx, ry, rw, rh);
                    this.rooms.push({ x: rx, y: ry, w: rw, h: rh, size: Math.max(rw, rh) });
                    break;
                }
            }
        }
    }

    // Find blocked corner regions for decorations (for non-rectangle shapes)
    // Picks random blocked points and checks if a 2-inch diameter circle fits without intersecting maze
    findCornerRegions(cellSize = 10) {
        const regions = [];
        const corners = [
            { sx: 0, sy: 0, ex: Math.floor(this.width/3), ey: Math.floor(this.height/3) },
            { sx: Math.floor(this.width*2/3), sy: 0, ex: this.width, ey: Math.floor(this.height/3) },
            { sx: 0, sy: Math.floor(this.height*2/3), ex: Math.floor(this.width/3), ey: this.height },
            { sx: Math.floor(this.width*2/3), sy: Math.floor(this.height*2/3), ex: this.width, ey: this.height }
        ];

        // 2 inch diameter = 1 inch radius. PAGE_WIDTH (850) = 8.5 inches, so 1 inch = 100 pixels
        const radiusPixels = 100; // 1 inch radius
        const radiusCells = radiusPixels / cellSize;

        for (const corner of corners) {
            // Collect all blocked cells in this corner
            const blockedCells = [];
            for (let y = corner.sy; y < corner.ey; y++) {
                for (let x = corner.sx; x < corner.ex; x++) {
                    if (this.cells[y][x].blocked) {
                        blockedCells.push({ x, y });
                    }
                }
            }

            if (blockedCells.length < 4) continue;

            // Try up to 10 random locations
            for (let attempt = 0; attempt < 10; attempt++) {
                const cell = blockedCells[Math.floor(this.rng.next() * blockedCells.length)];
                const cx = cell.x + 0.5;
                const cy = cell.y + 0.5;

                // Check if a circle of radiusCells fits without intersecting non-blocked cells
                let fits = true;
                const checkRadius = Math.ceil(radiusCells);
                for (let dy = -checkRadius; dy <= checkRadius && fits; dy++) {
                    for (let dx = -checkRadius; dx <= checkRadius && fits; dx++) {
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist > radiusCells) continue; // Outside circle

                        const checkX = Math.floor(cx + dx);
                        const checkY = Math.floor(cy + dy);

                        // Check bounds
                        if (checkX < 0 || checkX >= this.width || checkY < 0 || checkY >= this.height) {
                            continue; // Outside grid is OK (edge of maze)
                        }

                        // If any cell in the circle is NOT blocked, it intersects the maze
                        if (!this.cells[checkY][checkX].blocked) {
                            fits = false;
                        }
                    }
                }

                if (fits) {
                    // Calculate size based on how much space we have (use radius as size guide)
                    const size = Math.max(2, radiusCells * 1.5);
                    regions.push({ cx, cy, size });
                    break; // Found a valid spot for this corner
                }
            }
        }
        return regions;
    }

    // Debug mode for art placement verification
    // Returns object with svg and debug info for LLM verification
    toSVGDebug() {
        const result = {
            svg: '',
            artPlacements: [],
            cellSize: 0,
            dimensions: { w: this.width, h: this.height }
        };

        const cellSize = Math.min(18, Math.max(8, Math.floor(350 / Math.max(this.width, this.height))));
        result.cellSize = cellSize;
        const strokeWidth = Math.max(1.5, cellSize / 8);
        const mazeWidth = this.width * cellSize;
        const mazeHeight = this.height * cellSize;
        const sidePadding = 35;
        const topPadding = 40;
        const svgWidth = mazeWidth + sidePadding * 2;
        const svgHeight = mazeHeight + topPadding + 70;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" style="background:#f0f0f0">`;
        svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="#f0f0f0"/>`;

        // Cell backgrounds
        svg += `<g fill="#fff">`;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.cells[y][x].blocked) {
                    const cx = sidePadding + x * cellSize;
                    const cy = topPadding + y * cellSize;
                    svg += `<rect x="${cx}" y="${cy}" width="${cellSize}" height="${cellSize}"/>`;
                }
            }
        }
        svg += '</g>';

        // Character art debug box
        if (this.startPos) {
            const roomSize = this.startRoomSize || 2;
            const cx = sidePadding + (this.startPos.x + roomSize / 2) * cellSize;
            const cy = topPadding + (this.startPos.y + roomSize / 2) * cellSize;
            const artSize = roomSize * cellSize * 0.56;
            result.artPlacements.push({
                type: 'character',
                name: this.selectedCharacter || this.theme.character,
                cx, cy, size: artSize,
                cellX: this.startPos.x, cellY: this.startPos.y, roomSize
            });
            svg += `<rect x="${cx - artSize/2}" y="${cy - artSize/2}" width="${artSize}" height="${artSize}" fill="none" stroke="blue" stroke-width="2" stroke-dasharray="4"/>`;
            svg += `<text x="${cx}" y="${cy}" fill="blue" font-size="8" text-anchor="middle">CHAR</text>`;
        }

        // Goal art debug box
        if (this.endPos) {
            const roomSize = this.endRoomSize || 2;
            const cx = sidePadding + (this.endPos.x + roomSize / 2) * cellSize - cellSize * 0.5;
            const cy = topPadding + (this.endPos.y + roomSize / 2) * cellSize;
            const artSize = roomSize * cellSize * 0.72;
            result.artPlacements.push({
                type: 'goal',
                name: this.selectedGoal || this.theme.goal,
                cx, cy, size: artSize,
                cellX: this.endPos.x, cellY: this.endPos.y, roomSize
            });
            svg += `<rect x="${cx - artSize/2}" y="${cy - artSize/2}" width="${artSize}" height="${artSize}" fill="none" stroke="green" stroke-width="2" stroke-dasharray="4"/>`;
            svg += `<text x="${cx}" y="${cy}" fill="green" font-size="8" text-anchor="middle">GOAL</text>`;
        }

        // Room decoration debug boxes
        if (this.rooms) {
            for (const room of this.rooms) {
                const cx = sidePadding + (room.x + room.w / 2) * cellSize;
                const cy = topPadding + (room.y + room.h / 2) * cellSize;
                const artSize = Math.min(room.w, room.h) * cellSize;
                result.artPlacements.push({
                    type: 'room_decoration',
                    cx, cy, size: artSize,
                    cellX: room.x, cellY: room.y, roomW: room.w, roomH: room.h
                });
                svg += `<rect x="${cx - artSize/2}" y="${cy - artSize/2}" width="${artSize}" height="${artSize}" fill="none" stroke="orange" stroke-width="1" stroke-dasharray="2"/>`;
                svg += `<text x="${cx}" y="${cy}" fill="orange" font-size="6" text-anchor="middle">ROOM</text>`;
            }
        }

        // Walls
        svg += `<g stroke="#000" stroke-width="${strokeWidth}" stroke-linecap="round">`;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.cells[y][x];
                if (cell.blocked) continue;
                const cx = sidePadding + x * cellSize;
                const cy = topPadding + y * cellSize;
                if (cell.walls.north) svg += `<line x1="${cx}" y1="${cy}" x2="${cx + cellSize}" y2="${cy}"/>`;
                if (y === this.height - 1 && cell.walls.south) svg += `<line x1="${cx}" y1="${cy + cellSize}" x2="${cx + cellSize}" y2="${cy + cellSize}"/>`;
                if (cell.walls.west) svg += `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + cellSize}"/>`;
                if (x === this.width - 1 && cell.walls.east) svg += `<line x1="${cx + cellSize}" y1="${cy}" x2="${cx + cellSize}" y2="${cy + cellSize}"/>`;
            }
        }
        svg += '</g>';

        // START/END labels in margins (FIXED SIZE)
        const FIXED_LABEL_SIZE = 5;
        const FIXED_ARROW_SIZE = 10;

        if (this.startPos) {
            const roomSize = this.startRoomSize || 2;
            const entryCenterY = topPadding + (this.startPos.y + roomSize / 2) * cellSize;
            const startWidth = VectorFont.measureText('START', FIXED_LABEL_SIZE);
            const startX = (sidePadding - startWidth) / 2;
            const startY = entryCenterY - FIXED_ARROW_SIZE - 2;
            const arrowX = sidePadding - FIXED_ARROW_SIZE - 3;

            result.artPlacements.push({
                type: 'start_label',
                name: 'START',
                cx: startX + startWidth/2, cy: startY + FIXED_LABEL_SIZE/2,
                size: FIXED_LABEL_SIZE,
                inMargin: 'left'
            });

            // Debug box for START label
            svg += `<rect x="${startX - 2}" y="${startY - 2}" width="${startWidth + 4}" height="${FIXED_LABEL_SIZE + 4}" fill="none" stroke="purple" stroke-width="1" stroke-dasharray="2"/>`;
            svg += `<text x="${startX + startWidth/2}" y="${startY + FIXED_LABEL_SIZE/2 + 2}" fill="purple" font-size="4" text-anchor="middle">START</text>`;
            // Arrow debug
            svg += `<polyline points="${arrowX},${entryCenterY - FIXED_ARROW_SIZE/2} ${arrowX + FIXED_ARROW_SIZE},${entryCenterY} ${arrowX},${entryCenterY + FIXED_ARROW_SIZE/2}" fill="none" stroke="purple" stroke-width="1"/>`;
        }

        if (this.endPos) {
            const roomSize = this.endRoomSize || 2;
            const exitCenterY = topPadding + (this.endPos.y + roomSize / 2) * cellSize;
            const endWidth = VectorFont.measureText('END', FIXED_LABEL_SIZE);
            const endX = sidePadding + mazeWidth + (sidePadding - endWidth) / 2;
            const endY = exitCenterY + FIXED_ARROW_SIZE + FIXED_LABEL_SIZE + 2;
            const arrowX = sidePadding + mazeWidth + 3;

            result.artPlacements.push({
                type: 'end_label',
                name: 'END',
                cx: endX + endWidth/2, cy: endY + FIXED_LABEL_SIZE/2,
                size: FIXED_LABEL_SIZE,
                inMargin: 'right'
            });

            // Debug box for END label
            svg += `<rect x="${endX - 2}" y="${endY - 2}" width="${endWidth + 4}" height="${FIXED_LABEL_SIZE + 4}" fill="none" stroke="red" stroke-width="1" stroke-dasharray="2"/>`;
            svg += `<text x="${endX + endWidth/2}" y="${endY + FIXED_LABEL_SIZE/2 + 2}" fill="red" font-size="4" text-anchor="middle">END</text>`;
            // Arrow debug
            svg += `<polyline points="${arrowX},${exitCenterY - FIXED_ARROW_SIZE/2} ${arrowX + FIXED_ARROW_SIZE},${exitCenterY} ${arrowX},${exitCenterY + FIXED_ARROW_SIZE/2}" fill="none" stroke="red" stroke-width="1"/>`;
        }

        // Debug info text
        svg += `<text x="10" y="15" fill="#333" font-size="10">Debug: ${this.width}x${this.height}, cellSize=${cellSize}px, minArtCell=${cellSize >= 10 ? 'OK' : 'TOO SMALL'}</text>`;
        svg += `<text x="10" y="${svgHeight - 10}" fill="#333" font-size="8">Art: ${result.artPlacements.length} | Blue=Char, Green=Goal, Orange=Room, Purple=START, Red=END</text>`;

        svg += '</svg>';
        result.svg = svg;
        return result;
    }

    toSVG(showSolution = false, printMode = false) {
        // FIXED PAGE DIMENSIONS - all mazes render at same size (letter paper ratio)
        const PAGE_WIDTH = 850;
        const PAGE_HEIGHT = 1100;

        // Fixed margins (in page units) - use DebugSettings
        const TITLE_AREA_HEIGHT = DebugSettings.titleAreaHeight;
        const QUEST_AREA_HEIGHT = DebugSettings.questAreaHeight;
        const SIDE_MARGIN = DebugSettings.sideMargin;
        const TOP_MARGIN = DebugSettings.topMargin;
        const BOTTOM_MARGIN = DebugSettings.bottomMargin;

        // Calculate available area for maze
        const mazeAreaWidth = PAGE_WIDTH - SIDE_MARGIN * 2;
        const mazeAreaHeight = PAGE_HEIGHT - TITLE_AREA_HEIGHT - QUEST_AREA_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

        // Calculate cell size to fit maze in available area
        const cellSizeW = mazeAreaWidth / this.width;
        const cellSizeH = mazeAreaHeight / this.height;
        const cellSize = Math.min(cellSizeW, cellSizeH);

        // Actual maze dimensions (may be smaller than available area)
        const mazeWidth = this.width * cellSize;
        const mazeHeight = this.height * cellSize;

        // Center maze in available area
        const mazeOffsetX = SIDE_MARGIN + (mazeAreaWidth - mazeWidth) / 2;
        const mazeOffsetY = TOP_MARGIN + TITLE_AREA_HEIGHT + (mazeAreaHeight - mazeHeight) / 2;

        const strokeWidth = Math.max(1, cellSize / 10);

        // Minimum cell size for scattered decorations
        const MIN_CELL_SIZE_FOR_DECORATIONS = 8;
        const allowScatteredDecorations = cellSize >= MIN_CELL_SIZE_FOR_DECORATIONS;

        // Use fixed page dimensions
        const svgWidth = PAGE_WIDTH;
        const svgHeight = PAGE_HEIGHT;
        const sidePadding = mazeOffsetX;
        const topPadding = mazeOffsetY;

        // Print mode: black walls on white background
        const theme = printMode ? {
            wallColor: '#000',
            pathColor: '#fff',
            bgColor: '#fff',
            solutionColor: '#888',
            startColor: '#000',
            endColor: '#000'
        } : this.theme;

        const textColor = printMode ? '#000' : this.theme.wallColor;

        // ===========================================
        // SVG LAYER ORDER (bottom to top):
        // 1. Background fill
        // 2. Border pattern (decorative, in margin)
        // 3. Title text
        // 4. Cell backgrounds (opaque white/pathColor)
        // 5. Corner decorations (in blocked areas, OUTSIDE maze)
        // 6. Solution path (if shown)
        // 7. Character art (in start room, UNDER walls)
        // 8. Goal art (in end room, UNDER walls)
        // 9. Room decorations (UNDER walls)
        // 10. Scattered decorations (UNDER walls) - ONLY if cellSize >= 10
        // 11. WALLS (always on TOP)
        // 12. Quest text
        // 13. START/END labels
        // ===========================================

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" style="background:${theme.bgColor}">`;

        // Background
        svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="${theme.bgColor}"/>`;

        // Debug bounding boxes for layout areas
        if (DebugSettings.showBounds) {
            // Title area
            svg += `<rect x="0" y="${TOP_MARGIN}" width="${svgWidth}" height="${TITLE_AREA_HEIGHT}" fill="none" stroke="cyan" stroke-width="1" stroke-dasharray="8,4" opacity="0.5"/>`;
            // Maze area
            svg += `<rect x="${sidePadding}" y="${topPadding}" width="${mazeWidth}" height="${mazeHeight}" fill="none" stroke="yellow" stroke-width="2" stroke-dasharray="8,4" opacity="0.5"/>`;
            // Quest area
            svg += `<rect x="0" y="${svgHeight - QUEST_AREA_HEIGHT - BOTTOM_MARGIN}" width="${svgWidth}" height="${QUEST_AREA_HEIGHT}" fill="none" stroke="cyan" stroke-width="1" stroke-dasharray="8,4" opacity="0.5"/>`;
            // Side margins
            svg += `<rect x="0" y="0" width="${SIDE_MARGIN}" height="${svgHeight}" fill="rgba(100,100,255,0.1)"/>`;
            svg += `<rect x="${svgWidth - SIDE_MARGIN}" y="0" width="${SIDE_MARGIN}" height="${svgHeight}" fill="rgba(100,100,255,0.1)"/>`;
        }

        // Border pattern (gray in print mode) - full page
        if (this.theme.borderPattern && BorderPatterns[this.theme.borderPattern]) {
            const borderColor = printMode ? '#aaa' : this.theme.wallColor;
            svg += `<g color="${borderColor}">${BorderPatterns[this.theme.borderPattern](svgWidth, svgHeight, sidePadding, this.rng)}</g>`;
        }

        // Title at top (vector font) - FIXED SIZE for consistency across difficulties
        if (this.story && this.story.title) {
            const TITLE_SIZE = DebugSettings.titleSize;
            const titleLetterSpacing = DebugSettings.titleLetterSpacing;
            const maxTitleWidth = svgWidth - 60;
            let titleSize = TITLE_SIZE;
            // Only scale down if title is too wide
            let titleWidth = VectorFont.measureText(this.story.title, titleSize, titleLetterSpacing);
            while (titleWidth > maxTitleWidth && titleSize > 14) {
                titleSize -= 1;
                titleWidth = VectorFont.measureText(this.story.title, titleSize, titleLetterSpacing);
            }
            const titleY = TOP_MARGIN + TITLE_AREA_HEIGHT / 2 + titleSize / 3 + DebugSettings.titleYOffset;
            // White outline (thicker stroke) then normal stroke on top
            svg += VectorFont.renderCentered(this.story.title, svgWidth / 2, titleY, titleSize, '#fff', DebugSettings.titleOutline, titleLetterSpacing);
            svg += VectorFont.renderCentered(this.story.title, svgWidth / 2, titleY, titleSize, textColor, DebugSettings.titleStroke, titleLetterSpacing);

            // Debug bounding box for title
            if (DebugSettings.showBounds) {
                const tw = VectorFont.measureText(this.story.title, titleSize, titleLetterSpacing);
                svg += `<rect x="${svgWidth/2 - tw/2}" y="${titleY - titleSize}" width="${tw}" height="${titleSize * 1.2}" fill="none" stroke="magenta" stroke-width="1" stroke-dasharray="4"/>`;
            }
        }

        // Cell backgrounds (white for maze area) - OPTIMIZED for rectangles
        if (this.shape === 'rectangle') {
            // Single rectangle for entire maze area (much faster)
            svg += `<rect x="${sidePadding}" y="${topPadding}" width="${mazeWidth}" height="${mazeHeight}" fill="${theme.pathColor}"/>`;
        } else {
            // Individual cells for shaped mazes (need to show only unblocked cells)
            let bgPath = '';
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    if (!this.cells[y][x].blocked) {
                        const cx = sidePadding + x * cellSize;
                        const cy = topPadding + y * cellSize;
                        bgPath += `M${cx},${cy}h${cellSize}v${cellSize}h${-cellSize}z`;
                    }
                }
            }
            svg += `<path d="${bgPath}" fill="${theme.pathColor}"/>`;
        }

        // Corner decorations for non-rectangle shapes - scale via DebugSettings.decorScale
        // Skip decorations smaller than minCornerDecorInches
        const minCornerDecorPixels = DebugSettings.minCornerDecorInches * (PAGE_WIDTH / 8.5);
        if (this.shape !== 'rectangle' && this.theme.decorations && this.theme.decorations.length > 0) {
            const cornerRegions = this.findCornerRegions(cellSize);
            const artColor = printMode ? '#888' : this.theme.wallColor;
            svg += `<g style="color:${artColor}; stroke:${artColor}; fill:${artColor}">`;
            for (const region of cornerRegions) {
                const decorSize = region.size * cellSize * 0.6 * DebugSettings.decorScale;
                // Skip if decoration would be too small
                if (decorSize < minCornerDecorPixels) continue;
                const cx = sidePadding + region.cx * cellSize;
                const cy = topPadding + region.cy * cellSize;
                const artType = this.rng.choice(this.theme.decorations);
                if (ArtGenerators[artType]) {
                    const strokeWidth = Math.max(DebugSettings.cornerDecorStrokeMin, decorSize * DebugSettings.cornerDecorStrokePct);
                    let artSvg = ArtGenerators[artType](cx, cy, decorSize, this.rng);
                    artSvg = artSvg.replace(/stroke-width="([0-9.]+)"/g, () => `stroke-width="${strokeWidth}"`);
                    svg += artSvg;
                }
            }
            svg += '</g>';
        }

        // Solution path
        if (showSolution && this.solution && this.solution.length > 0) {
            let pathD = '';
            for (let i = 0; i < this.solution.length; i++) {
                const p = this.solution[i];
                const cx = sidePadding + p.x * cellSize + cellSize / 2;
                const cy = topPadding + p.y * cellSize + cellSize / 2;
                pathD += i === 0 ? `M${cx},${cy}` : ` L${cx},${cy}`;
            }
            svg += `<path d="${pathD}" fill="none" stroke="${theme.solutionColor}" stroke-width="${cellSize * 0.3}" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>`;
        }

        // Character art in start room - configurable via DebugSettings
        // All dimensions relative to room size, center-anchored
        const characterArt = this.selectedCharacter || this.theme.character;
        if (this.startPos && characterArt && CharacterArt[characterArt]) {
            const roomSize = this.startRoomSize || 2;
            const roomLeft = sidePadding + this.startPos.x * cellSize;
            const roomTop = topPadding + this.startPos.y * cellSize;
            const roomWidth = roomSize * cellSize;
            const roomHeight = roomSize * cellSize;
            const roomCenterX = roomLeft + roomWidth / 2;
            const roomCenterY = roomTop + roomHeight / 2;

            // All dimensions as percentage of room size
            const xOffset = roomWidth * DebugSettings.charXOffsetPct;
            const yOffset = roomHeight * DebugSettings.charYOffsetPct;
            const artSize = roomWidth * DebugSettings.charSizePct;
            const strokeWidth = Math.max(DebugSettings.charStrokeMin, roomWidth * DebugSettings.charStrokePct);

            const artCx = roomCenterX + xOffset;
            const artCy = roomCenterY + yOffset;
            const artColor = printMode ? '#000' : this.theme.wallColor;

            svg += `<g color="${artColor}">`;
            const charArtSvg = CharacterArt[characterArt](artCx, artCy, artSize);
            // Scale stroke widths proportionally
            svg += charArtSvg.replace(/stroke-width="([0-9.]+)"/g, (match, w) => `stroke-width="${strokeWidth}"`);
            svg += `</g>`;

            // Debug bounding box for character and start room
            if (DebugSettings.showBounds) {
                // Room boundary (solid)
                svg += `<rect x="${roomLeft}" y="${roomTop}" width="${roomWidth}" height="${roomHeight}" fill="none" stroke="blue" stroke-width="2" opacity="0.5"/>`;
                // Art boundary (dashed)
                svg += `<rect x="${artCx - artSize/2}" y="${artCy - artSize/2}" width="${artSize}" height="${artSize}" fill="none" stroke="blue" stroke-width="1" stroke-dasharray="4"/>`;
            }
        }

        // Goal art in end room - configurable via DebugSettings
        // All dimensions relative to room size, center-anchored
        const goalArt = this.selectedGoal || this.theme.goal;
        if (this.endPos && goalArt && GoalArt[goalArt]) {
            const roomSize = this.endRoomSize || 2;
            const roomLeft = sidePadding + this.endPos.x * cellSize;
            const roomTop = topPadding + this.endPos.y * cellSize;
            const roomWidth = roomSize * cellSize;
            const roomHeight = roomSize * cellSize;
            const roomCenterX = roomLeft + roomWidth / 2;
            const roomCenterY = roomTop + roomHeight / 2;

            // All dimensions as percentage of room size
            const xOffset = roomWidth * DebugSettings.goalXOffsetPct;
            const yOffset = roomHeight * DebugSettings.goalYOffsetPct;
            const artSize = roomWidth * DebugSettings.goalSizePct;
            const strokeWidth = Math.max(DebugSettings.goalStrokeMin, roomWidth * DebugSettings.goalStrokePct);

            const artCx = roomCenterX + xOffset;
            const artCy = roomCenterY + yOffset;
            const artColor = printMode ? '#000' : this.theme.wallColor;

            svg += `<g color="${artColor}">`;
            const goalArtSvg = GoalArt[goalArt](artCx, artCy, artSize);
            // Scale stroke widths proportionally
            svg += goalArtSvg.replace(/stroke-width="([0-9.]+)"/g, (match, w) => `stroke-width="${strokeWidth}"`);
            svg += `</g>`;

            // Debug bounding box for goal and end room
            if (DebugSettings.showBounds) {
                // Room boundary (solid)
                svg += `<rect x="${roomLeft}" y="${roomTop}" width="${roomWidth}" height="${roomHeight}" fill="none" stroke="green" stroke-width="2" opacity="0.5"/>`;
                // Art boundary (dashed)
                svg += `<rect x="${artCx - artSize/2}" y="${artCy - artSize/2}" width="${artSize}" height="${artSize}" fill="none" stroke="green" stroke-width="1" stroke-dasharray="4"/>`;
            }
        }

        // Room decorations (gray in print mode) - scale via DebugSettings.decorScale
        // Skip decorations smaller than minRoomDecorInches (page width = 8.5 inches = PAGE_WIDTH pixels)
        const minDecorPixels = DebugSettings.minRoomDecorInches * (PAGE_WIDTH / 8.5);
        if (this.theme.decorations && this.theme.decorations.length > 0 && this.rooms && this.rooms.length > 0) {
            const artColor = printMode ? '#888' : this.theme.wallColor;
            svg += `<g style="color:${artColor}; stroke:${artColor}; fill:${artColor}">`;
            for (const room of this.rooms) {
                const decorSize = Math.min(room.w, room.h) * cellSize * DebugSettings.decorScale;
                // Skip if decoration would be too small to be worth drawing
                if (decorSize < minDecorPixels) continue;
                const cx = sidePadding + (room.x + room.w / 2) * cellSize;
                const cy = topPadding + (room.y + room.h / 2) * cellSize;
                const artType = this.rng.choice(this.theme.decorations);
                if (ArtGenerators[artType]) {
                    const strokeWidth = Math.max(DebugSettings.roomDecorStrokeMin, decorSize * DebugSettings.roomDecorStrokePct);
                    let artSvg = ArtGenerators[artType](cx, cy, decorSize, this.rng);
                    artSvg = artSvg.replace(/stroke-width="([0-9.]+)"/g, () => `stroke-width="${strokeWidth}"`);
                    svg += artSvg;
                }
            }
            svg += '</g>';
        }

        // Scattered decorations in dead ends and along path (fills empty mazes with art)
        // SKIP if cells are too small - decorations would be illegible and clutter the maze
        const minScatterDecorPixels = DebugSettings.minScatterDecorInches * (PAGE_WIDTH / 8.5);
        if (allowScatteredDecorations && this.theme.decorations && this.theme.decorations.length > 0) {
            const artColor = printMode ? '#888' : this.theme.wallColor;
            const startRoomSize = this.startRoomSize || 2;
            const endRoomSize = this.endRoomSize || 2;

            // Find dead ends (cells with 3 walls) and some regular cells for decoration
            const decorationSpots = [];
            const solutionSet = new Set();
            if (this.solution) {
                for (const p of this.solution) {
                    solutionSet.add(`${p.x},${p.y}`);
                }
            }

            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const cell = this.cells[y][x];
                    if (cell.blocked) continue;

                    // Skip start/end rooms
                    if (this.startPos && x >= this.startPos.x && x < this.startPos.x + startRoomSize &&
                        y >= this.startPos.y && y < this.startPos.y + startRoomSize) continue;
                    if (this.endPos && x >= this.endPos.x && x < this.endPos.x + endRoomSize &&
                        y >= this.endPos.y && y < this.endPos.y + endRoomSize) continue;

                    // Skip cells in interior rooms
                    let inRoom = false;
                    if (this.rooms) {
                        for (const room of this.rooms) {
                            if (x >= room.x && x < room.x + room.w && y >= room.y && y < room.y + room.h) {
                                inRoom = true;
                                break;
                            }
                        }
                    }
                    if (inRoom) continue;

                    // Count walls
                    const wallCount = (cell.walls.north ? 1 : 0) + (cell.walls.south ? 1 : 0) +
                                     (cell.walls.east ? 1 : 0) + (cell.walls.west ? 1 : 0);

                    // Dead ends (3 walls) - always decorate
                    if (wallCount === 3) {
                        decorationSpots.push({ x, y, priority: 1 });
                    }
                    // Cells NOT on solution path - decorate some of them
                    else if (!solutionSet.has(`${x},${y}`) && this.rng.next() < 0.15) {
                        decorationSpots.push({ x, y, priority: 2 });
                    }
                }
            }

            // Limit decorations to avoid clutter (scale with maze size)
            const maxDecorations = Math.min(decorationSpots.length, Math.floor(Math.sqrt(this.width * this.height) * 1.5));
            const shuffled = this.rng.shuffle(decorationSpots);
            // Prioritize dead ends
            shuffled.sort((a, b) => a.priority - b.priority);
            const selected = shuffled.slice(0, maxDecorations);

            if (selected.length > 0) {
                svg += `<g style="color:${artColor}; stroke:${artColor}; fill:${artColor}">`;
                for (const spot of selected) {
                    const cx = sidePadding + spot.x * cellSize + cellSize / 2;
                    const cy = topPadding + spot.y * cellSize + cellSize / 2;
                    // Smaller size for scattered decorations - scale via DebugSettings.decorScale
                    const decorSize = cellSize * 0.7 * DebugSettings.decorScale;
                    // Skip if decoration would be too small
                    if (decorSize < minScatterDecorPixels) continue;
                    const artType = this.rng.choice(this.theme.decorations);
                    if (ArtGenerators[artType]) {
                        const strokeWidth = Math.max(DebugSettings.scatterDecorStrokeMin, decorSize * DebugSettings.scatterDecorStrokePct);
                        let artSvg = ArtGenerators[artType](cx, cy, decorSize, this.rng);
                        artSvg = artSvg.replace(/stroke-width="([0-9.]+)"/g, () => `stroke-width="${strokeWidth}"`);
                        svg += artSvg;
                    }
                }
                svg += '</g>';
            }
        }

        // Helper to check if a cell is inside start or end room
        const isInStartRoom = (x, y) => {
            if (!this.startPos) return false;
            const rs = this.startRoomSize || 2;
            return x >= this.startPos.x && x < this.startPos.x + rs &&
                   y >= this.startPos.y && y < this.startPos.y + rs;
        };
        const isInEndRoom = (x, y) => {
            if (!this.endPos) return false;
            const rs = this.endRoomSize || 2;
            return x >= this.endPos.x && x < this.endPos.x + rs &&
                   y >= this.endPos.y && y < this.endPos.y + rs;
        };

        // Walls - OPTIMIZED: batch into single path element for performance
        if (this.curvedWalls) {
            svg += this.renderCurvedWalls(cellSize, sidePadding, topPadding, strokeWidth, theme.wallColor);
        } else {
            // Collect all wall segments into a single path for better performance
            let pathD = '';
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const cell = this.cells[y][x];
                    if (cell.blocked) continue;

                    const inStartRoom = isInStartRoom(x, y);
                    const inEndRoom = isInEndRoom(x, y);

                    const cx = sidePadding + x * cellSize;
                    const cy = topPadding + y * cellSize;

                    const northBlocked = y > 0 && this.cells[y-1][x].blocked;
                    const southBlocked = y < this.height - 1 && this.cells[y+1][x].blocked;
                    const eastBlocked = x < this.width - 1 && this.cells[y][x+1].blocked;
                    const westBlocked = x > 0 && this.cells[y][x-1].blocked;

                    // North wall - skip only if both cells are in the same room
                    if (cell.walls.north || northBlocked) {
                        const skipNorth = (inStartRoom && isInStartRoom(x, y-1)) || (inEndRoom && isInEndRoom(x, y-1));
                        if (!skipNorth) {
                            pathD += `M${cx},${cy}L${cx + cellSize},${cy}`;
                        }
                    }
                    // South wall (only for bottom row or blocked neighbor)
                    if ((y === this.height - 1 && cell.walls.south) || southBlocked) {
                        const skipSouth = (inStartRoom && isInStartRoom(x, y+1)) || (inEndRoom && isInEndRoom(x, y+1));
                        if (!skipSouth) {
                            pathD += `M${cx},${cy + cellSize}L${cx + cellSize},${cy + cellSize}`;
                        }
                    }
                    // West wall - skip only if both cells are in the same room
                    if (cell.walls.west || westBlocked) {
                        const skipWest = (inStartRoom && isInStartRoom(x-1, y)) || (inEndRoom && isInEndRoom(x-1, y));
                        if (!skipWest) {
                            pathD += `M${cx},${cy}L${cx},${cy + cellSize}`;
                        }
                    }
                    // East wall (only for right edge or blocked neighbor)
                    if ((x === this.width - 1 && cell.walls.east) || eastBlocked) {
                        const skipEast = (inStartRoom && isInStartRoom(x+1, y)) || (inEndRoom && isInEndRoom(x+1, y));
                        if (!skipEast) {
                            pathD += `M${cx + cellSize},${cy}L${cx + cellSize},${cy + cellSize}`;
                        }
                    }
                }
            }
            svg += `<path d="${pathD}" fill="none" stroke="${theme.wallColor}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
        }

        // START label - drawn AFTER walls so it's on top
        // Position relative to room: centered at bottom, all sizing as % of room dimensions
        if (this.startPos) {
            const roomSize = this.startRoomSize || 2;
            const roomLeft = sidePadding + this.startPos.x * cellSize;
            const roomTop = topPadding + this.startPos.y * cellSize;
            const roomWidth = roomSize * cellSize;
            const roomHeight = roomSize * cellSize;
            const roomCenterX = roomLeft + roomWidth / 2;
            const roomBottom = roomTop + roomHeight;

            // All dimensions relative to room size
            const labelSize = roomWidth * DebugSettings.startSizePct;
            const labelStroke = Math.max(DebugSettings.startStrokeMin, roomWidth * DebugSettings.startStrokePct);
            const xOffset = roomWidth * DebugSettings.startXOffsetPct;
            const yOffset = roomHeight * DebugSettings.startYOffsetPct;

            // Position: center-bottom of text anchored at center-bottom of room + offsets
            const labelX = roomCenterX + xOffset;
            const labelY = roomBottom + yOffset;

            svg += VectorFont.renderCentered('START', labelX, labelY, labelSize, textColor, labelStroke, DebugSettings.startLetterSpacing);

            // Debug bounding box for START label
            if (DebugSettings.showBounds) {
                const lw = VectorFont.measureText('START', labelSize, DebugSettings.startLetterSpacing);
                svg += `<rect x="${labelX - lw/2}" y="${labelY - labelSize}" width="${lw}" height="${labelSize * 1.2}" fill="none" stroke="purple" stroke-width="1" stroke-dasharray="4"/>`;
            }
        }

        // END label - drawn AFTER walls so it's on top
        // Position relative to room: centered at bottom, all sizing as % of room dimensions
        if (this.endPos) {
            const roomSize = this.endRoomSize || 2;
            const roomLeft = sidePadding + this.endPos.x * cellSize;
            const roomTop = topPadding + this.endPos.y * cellSize;
            const roomWidth = roomSize * cellSize;
            const roomHeight = roomSize * cellSize;
            const roomCenterX = roomLeft + roomWidth / 2;
            const roomBottom = roomTop + roomHeight;

            // All dimensions relative to room size
            const labelSize = roomWidth * DebugSettings.endSizePct;
            const labelStroke = Math.max(DebugSettings.endStrokeMin, roomWidth * DebugSettings.endStrokePct);
            const xOffset = roomWidth * DebugSettings.endXOffsetPct;
            const yOffset = roomHeight * DebugSettings.endYOffsetPct;

            // Position: center-bottom of text anchored at center-bottom of room + offsets
            const labelX = roomCenterX + xOffset;
            const labelY = roomBottom + yOffset;

            svg += VectorFont.renderCentered('END', labelX, labelY, labelSize, textColor, labelStroke, DebugSettings.endLetterSpacing);

            // Debug bounding box for END label
            if (DebugSettings.showBounds) {
                const lw = VectorFont.measureText('END', labelSize, DebugSettings.endLetterSpacing);
                svg += `<rect x="${labelX - lw/2}" y="${labelY - labelSize}" width="${lw}" height="${labelSize * 1.2}" fill="none" stroke="red" stroke-width="1" stroke-dasharray="4"/>`;
            }
        }

        // Quest at bottom (vector font, word-wrapped) - configurable via DebugSettings
        if (this.story && this.story.quest) {
            const QUEST_SIZE = DebugSettings.questSize;
            const questLetterSpacing = DebugSettings.questLetterSpacing;
            const questY = svgHeight - QUEST_AREA_HEIGHT + 20 + DebugSettings.questYOffset;
            const maxWidth = svgWidth - 80;

            // Balanced word wrap - distribute text evenly across lines
            const words = this.story.quest.split(' ');
            let lines = [];

            // First, find minimum number of lines needed (greedy)
            let greedyLines = [];
            let currentLine = '';
            for (const word of words) {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                const testWidth = VectorFont.measureText(testLine, QUEST_SIZE, questLetterSpacing);
                if (testWidth > maxWidth && currentLine) {
                    greedyLines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) greedyLines.push(currentLine);

            const numLines = Math.min(greedyLines.length, 3);

            if (numLines === 1) {
                // Single line - just use it
                lines = greedyLines;
            } else {
                // Multiple lines - balance them using optimal break points
                // Calculate cumulative widths for each word position
                const cumWidths = [0];
                let runningText = '';
                for (let i = 0; i < words.length; i++) {
                    runningText = i === 0 ? words[i] : runningText + ' ' + words[i];
                    cumWidths.push(VectorFont.measureText(runningText, QUEST_SIZE, questLetterSpacing));
                }
                const totalWidth = cumWidths[words.length];
                const targetLineWidth = totalWidth / numLines;

                // Find optimal break points that minimize variance from target
                let breakPoints = [0];
                for (let line = 1; line < numLines; line++) {
                    const targetCumWidth = targetLineWidth * line;
                    // Find word index closest to target cumulative width
                    let bestIdx = breakPoints[breakPoints.length - 1] + 1;
                    let bestDiff = Infinity;
                    for (let i = breakPoints[breakPoints.length - 1] + 1; i < words.length; i++) {
                        const diff = Math.abs(cumWidths[i] - targetCumWidth);
                        if (diff < bestDiff) {
                            bestDiff = diff;
                            bestIdx = i;
                        }
                    }
                    breakPoints.push(bestIdx);
                }
                breakPoints.push(words.length);

                // Build lines from break points
                for (let i = 0; i < numLines; i++) {
                    const start = breakPoints[i];
                    const end = breakPoints[i + 1];
                    if (start < end) {
                        lines.push(words.slice(start, end).join(' '));
                    }
                }
            }

            // Render lines centered with white outline for readability (up to 3 lines)
            const lineSpacing = DebugSettings.questLineSpacing;
            for (let i = 0; i < lines.length && i < 3; i++) {
                const lineY = questY + i * lineSpacing;
                // White outline (thicker stroke) then normal stroke on top
                svg += VectorFont.renderCentered(lines[i], svgWidth / 2, lineY, QUEST_SIZE, '#fff', DebugSettings.questOutline, questLetterSpacing);
                svg += VectorFont.renderCentered(lines[i], svgWidth / 2, lineY, QUEST_SIZE, textColor, DebugSettings.questStroke, questLetterSpacing);
            }

            // Debug bounding box for quest area
            if (DebugSettings.showBounds) {
                const totalHeight = lines.length * lineSpacing;
                svg += `<rect x="${40}" y="${questY - QUEST_SIZE}" width="${svgWidth - 80}" height="${totalHeight + QUEST_SIZE}" fill="none" stroke="orange" stroke-width="1" stroke-dasharray="4"/>`;
            }
        }

        svg += '</svg>';
        return svg;
    }

    renderCurvedWalls(cellSize, sidePadding, topPadding, strokeWidth, wallColor) {
        const r = cellSize / 2; // Curve radius
        let paths = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.cells[y][x];
                if (cell.blocked) continue;

                const cx = sidePadding + x * cellSize;
                const cy = topPadding + y * cellSize;
                const midX = cx + cellSize / 2;
                const midY = cy + cellSize / 2;

                const n = cell.walls.north || (y > 0 && this.cells[y-1][x].blocked);
                const s = cell.walls.south || (y < this.height - 1 && this.cells[y+1][x].blocked) || y === this.height - 1;
                const e = cell.walls.east || (x < this.width - 1 && this.cells[y][x+1].blocked) || x === this.width - 1;
                const w = cell.walls.west || (x > 0 && this.cells[y][x-1].blocked);

                // Draw curved corners based on wall configuration
                // NW corner
                if (n && w) {
                    paths.push(`M${cx},${midY} Q${cx},${cy} ${midX},${cy}`);
                } else if (n) {
                    paths.push(`M${cx},${cy} L${midX},${cy}`);
                } else if (w) {
                    paths.push(`M${cx},${cy} L${cx},${midY}`);
                }

                // NE corner
                if (n && e) {
                    paths.push(`M${midX},${cy} Q${cx+cellSize},${cy} ${cx+cellSize},${midY}`);
                } else if (n) {
                    paths.push(`M${midX},${cy} L${cx+cellSize},${cy}`);
                } else if (e) {
                    paths.push(`M${cx+cellSize},${cy} L${cx+cellSize},${midY}`);
                }

                // SW corner
                if (s && w) {
                    paths.push(`M${cx},${midY} Q${cx},${cy+cellSize} ${midX},${cy+cellSize}`);
                } else if (s) {
                    paths.push(`M${cx},${cy+cellSize} L${midX},${cy+cellSize}`);
                } else if (w) {
                    paths.push(`M${cx},${midY} L${cx},${cy+cellSize}`);
                }

                // SE corner
                if (s && e) {
                    paths.push(`M${midX},${cy+cellSize} Q${cx+cellSize},${cy+cellSize} ${cx+cellSize},${midY}`);
                } else if (s) {
                    paths.push(`M${midX},${cy+cellSize} L${cx+cellSize},${cy+cellSize}`);
                } else if (e) {
                    paths.push(`M${cx+cellSize},${midY} L${cx+cellSize},${cy+cellSize}`);
                }
            }
        }

        return `<g stroke="${wallColor}" stroke-width="${strokeWidth}" stroke-linecap="round" fill="none">${paths.map(d => `<path d="${d}"/>`).join('')}</g>`;
    }
}

// =============================================================================
// STORY GENERATION SYSTEM
// =============================================================================

// Story templates with grammar variations
const StoryTemplates = {
    simple: [
        "Help the {character} find the {goal}!",
        "Guide the {character} to the {goal}!",
        "Can you help the {character} reach the {goal}?",
        "The {character} needs to find the {goal}!",
        "Lead the {character} through the maze to the {goal}!"
    ],
    collect: [
        "Help the {character} collect the {item1} and reach the {goal}!",
        "Guide the {character} to gather the {item1}, then find the {goal}!",
        "The {character} must find the {item1} on the way to the {goal}!"
    ],
    collectTwo: [
        "Help the {character} collect the {item1} and {item2}, then reach the {goal}!",
        "Guide the {character} to find the {item1} and {item2} before reaching the {goal}!",
        "The {character} needs the {item1} and {item2} to unlock the {goal}!"
    ],
    avoid: [
        "Help the {character} avoid the {danger} and reach the {goal}!",
        "Guide the {character} past the {danger} to find the {goal}!",
        "Watch out for the {danger}! Help the {character} reach the {goal}!"
    ],
    full: [
        "Help the {character} collect the {item1} and {item2}, avoid the {danger}, and reach the {goal}!",
        "Guide the {character} to gather the {item1} and {item2} while avoiding the {danger} on the way to the {goal}!",
        "The {character} must find the {item1} and {item2}, steer clear of the {danger}, and make it to the {goal}!"
    ]
};

// Title templates
const TitleTemplates = [
    "{adjective} {noun} Adventure",
    "The {adjective} {noun}",
    "{noun} Quest",
    "Journey to the {noun}",
    "The Secret {noun}",
    "{adjective} {noun} Mystery",
    "Escape to the {noun}",
    "The {noun} Challenge",
    "Mission: {noun}",
    "The Great {noun} Hunt"
];

// Theme-specific story vocabulary
const ThemeVocabulary = {
    classic: {
        characters: ["explorer", "adventurer", "traveler", "seeker", "brave knight", "clever mouse", "young hero", "treasure hunter", "maze runner", "curious cat", "little wizard", "friendly ghost"],
        items: ["key", "map", "compass", "torch", "rope", "coin", "magic gem", "golden ring", "silver bell", "enchanted scroll", "mystery box", "lucky charm", "glowing orb", "ancient relic"],
        dangers: ["trap", "dead end", "wrong turn", "locked gate", "falling boulder", "hidden pit", "spinning blade", "poison dart"],
        goals: ["exit", "treasure", "finish line", "golden key", "magic portal", "royal crown", "crystal throne", "wizard tower", "dragon egg", "enchanted castle", "secret garden", "diamond vault"],
        adjectives: ["Amazing", "Mystery", "Secret", "Great", "Enchanted", "Hidden", "Magical", "Legendary"],
        nouns: ["Maze", "Labyrinth", "Quest", "Adventure", "Journey", "Puzzle", "Challenge", "Escape"]
    },
    ocean: {
        characters: ["diver", "mermaid", "sailor", "sea turtle", "dolphin", "pirate captain", "submarine pilot", "octopus", "seahorse", "brave fish", "pearl diver", "ocean princess", "friendly whale", "crab explorer"],
        items: ["pearl", "shell", "starfish", "treasure map", "golden compass", "magic conch", "trident piece", "mermaid scale", "coral key", "ocean gem", "message bottle", "anchor charm", "sea crystal", "glowing jellyfish"],
        dangers: ["jellyfish", "shark", "whirlpool", "sea urchin", "giant squid", "electric eel", "sea monster", "pirate ship", "undertow", "poison fish"],
        goals: ["treasure chest", "sunken ship", "coral palace", "mermaid kingdom", "underwater cave", "pirate gold", "sea dragon lair", "neptune throne", "pearl palace", "shipwreck treasure", "ocean crystal", "atlantis gates"],
        adjectives: ["Deep", "Ocean", "Underwater", "Coral", "Sunken", "Mystic", "Tropical", "Azure"],
        nouns: ["Dive", "Sea", "Reef", "Voyage", "Depths", "Tides", "Waves", "Abyss"]
    },
    space: {
        characters: ["astronaut", "space explorer", "robot", "alien friend", "star pilot", "moon walker", "comet chaser", "galaxy ranger", "space cadet", "rocket captain", "android buddy", "cosmic cat", "nebula fairy", "planet hopper"],
        items: ["fuel cell", "oxygen tank", "star map", "crystal", "power core", "data chip", "moon rock", "comet dust", "alien artifact", "plasma orb", "gravity boots", "laser key", "cosmic compass", "stardust vial"],
        dangers: ["asteroid", "black hole", "space junk", "meteor shower", "alien trap", "solar flare", "gravity well", "space pirates", "rogue comet", "ion storm"],
        goals: ["space station", "home planet", "mother ship", "warp gate", "moon base", "alien city", "star fortress", "cosmic treasure", "galactic core", "nebula heart", "saturn rings", "mars colony"],
        adjectives: ["Cosmic", "Stellar", "Galactic", "Space", "Astro", "Lunar", "Solar", "Nebula"],
        nouns: ["Mission", "Voyage", "Station", "Galaxy", "Orbit", "Frontier", "Odyssey", "Discovery"]
    },
    garden: {
        characters: ["bee", "butterfly", "ladybug", "garden fairy", "little gardener", "friendly snail", "busy ant", "cheerful caterpillar", "wise owl", "hopping bunny", "flower sprite", "tiny mouse", "garden gnome", "dragonfly"],
        items: ["nectar", "pollen", "flower seed", "dewdrop", "golden petal", "honey", "magic acorn", "rainbow leaf", "sparkle dust", "berry basket", "watering can", "sun crystal", "moon blossom", "fairy wand"],
        dangers: ["spider", "wasp", "thorn", "raindrop", "garden snake", "hungry crow", "lawn mower", "pesky beetle", "sticky web", "frost patch"],
        goals: ["flower garden", "beehive", "fairy house", "rainbow flower", "mushroom village", "sunflower tower", "butterfly palace", "honey fountain", "rose castle", "treehouse", "daisy meadow", "enchanted pond"],
        adjectives: ["Blooming", "Garden", "Flower", "Secret", "Magical", "Sunny", "Rainbow", "Enchanted"],
        nouns: ["Garden", "Meadow", "Bloom", "Grove", "Glade", "Orchard", "Petal", "Blossom"]
    },
    candy: {
        characters: ["gingerbread kid", "candy fairy", "sugar sprite", "lollipop friend", "chocolate bunny", "gumdrop wizard", "cookie monster", "marshmallow man", "jelly bean hero", "peppermint princess", "caramel cat", "licorice lion", "cupcake kid", "donut detective"],
        items: ["gumdrop", "candy cane", "chocolate coin", "sugar crystal", "magic sprinkle", "rainbow lollipop", "golden wrapper", "fizzy pop", "jelly key", "caramel gem", "cookie crumb", "frosting star", "bubble gum", "cotton candy cloud"],
        dangers: ["sour candy", "sticky taffy", "melting chocolate", "sugar crash", "jawbreaker", "spicy cinnamon", "bitter lemon", "rock candy trap", "gooey caramel", "fizzy explosion"],
        goals: ["candy castle", "chocolate fountain", "gummy palace", "sweet shop", "ice cream mountain", "lollipop forest", "cookie kingdom", "cake tower", "soda springs", "sugar plum throne", "donut palace", "waffle wonderland"],
        adjectives: ["Sweet", "Candy", "Sugar", "Yummy", "Tasty", "Delicious", "Frosted", "Sprinkled"],
        nouns: ["Kingdom", "Factory", "Land", "Palace", "Bakery", "Wonderland", "Paradise", "Dreams"]
    },
    jungle: {
        characters: ["explorer", "baby monkey", "parrot", "jungle kid", "tree frog", "tiger cub", "sloth friend", "toucan", "jungle princess", "brave jaguar", "little elephant", "snake charmer", "gorilla guide", "lemur"],
        items: ["golden idol", "ancient map", "magic fruit", "vine rope", "jungle gem", "tribal mask", "feather crown", "crystal skull", "monkey paw", "tiger tooth", "exotic flower", "sacred stone", "jungle compass", "banana bunch"],
        dangers: ["quicksand", "snake", "spider web", "falling rock", "thorny bush", "angry bees", "crocodile", "poison frog", "venus flytrap", "stampede"],
        goals: ["hidden temple", "treetop village", "ancient ruins", "jungle treasure", "waterfall cave", "monkey kingdom", "lost city", "tiger shrine", "emerald throne", "canopy castle", "river palace", "volcano treasure"],
        adjectives: ["Wild", "Jungle", "Lost", "Ancient", "Hidden", "Tropical", "Mystic", "Untamed"],
        nouns: ["Temple", "Jungle", "Safari", "Expedition", "Adventure", "Discovery", "Treasure", "Quest"]
    },
    // =============================================================================
    // DOLPHIN EDUCATIONAL THEME - Marine mammal facts and vocabulary
    // =============================================================================
    dolphin: {
        // Characters based on real dolphin species and marine professionals
        characters: [
            "bottlenose dolphin", "spinner dolphin", "dolphin calf", "orca",
            "marine biologist", "dolphin trainer", "ocean researcher",
            "friendly porpoise", "spotted dolphin", "river dolphin"
        ],
        // Items related to dolphin research and behavior
        items: [
            "hydrophone", "tracking tag", "fish bucket", "research data",
            "echolocation click", "dorsal photo", "water sample", "plankton net",
            "GPS beacon", "underwater camera", "sonar reading", "pod map"
        ],
        // Natural challenges dolphins face
        dangers: [
            "fishing net", "boat propeller", "plastic pollution", "oil spill",
            "shark attack", "orca hunt", "strong current", "red tide"
        ],
        // Educational destinations
        goals: [
            "dolphin pod", "research station", "coral reef", "marine sanctuary",
            "feeding grounds", "open ocean", "warm lagoon", "kelp forest",
            "sea grass meadow", "dolphin nursery", "migration route", "protected bay"
        ],
        // Educational title words
        adjectives: ["Marine", "Ocean", "Dolphin", "Aquatic", "Coastal", "Pacific", "Atlantic", "Tropical"],
        nouns: ["Discovery", "Journey", "Research", "Adventure", "Expedition", "Migration", "Habitat", "Sanctuary"]
    }
};

// Enhanced sentence cache - hand-crafted improved versions
const EnhancedSentenceCache = {
    // Keyed by hash of original pattern, stores enhanced versions
    cache: new Map(),

    // Add enhanced version
    add(original, enhanced) {
        const key = this.hash(original);
        if (!this.cache.has(key)) {
            this.cache.set(key, []);
        }
        this.cache.get(key).push(enhanced);
    },

    // Get enhanced version if available
    get(original, rng) {
        const key = this.hash(original);
        if (this.cache.has(key)) {
            const options = this.cache.get(key);
            return rng.choice(options);
        }
        return null;
    },

    // Simple hash function
    hash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return hash.toString(16);
    }
};

// Pre-populate with enhanced sentences
const enhancedSentences = [
    // =========================================================================
    // OCEAN THEME
    // =========================================================================
    // Simple (Level 1-3)
    ["Help the diver find the treasure chest!",
     "Join the brave diver on an underwater adventure to discover the legendary treasure chest!"],
    ["Help the mermaid find the coral palace!",
     "Swim with the beautiful mermaid through crystal waters to her majestic coral palace!"],
    ["Help the sailor find the sunken ship!",
     "Set sail with the bold sailor to explore the mysterious sunken ship!"],
    ["Help the sea turtle find the shell!",
     "Join the wise sea turtle on a quest to find the precious ancient shell!"],

    // Collect (Level 4-5)
    ["Help the diver collect the pearl and reach the treasure chest!",
     "Dive deep with the brave diver to find the shimmering pearl and discover the legendary treasure chest!"],
    ["Help the mermaid collect the starfish and reach the coral palace!",
     "Glide through the waves with the graceful mermaid, gathering sparkly starfish on the way to the coral palace!"],
    ["Help the sailor collect the treasure map and reach the sunken ship!",
     "Navigate the seas with the clever sailor, finding the ancient treasure map that leads to the sunken ship!"],
    ["Help the sea turtle collect the shell and reach the coral palace!",
     "Paddle along with the gentle sea turtle, collecting beautiful shells on the journey to the coral palace!"],

    // Avoid (Level 4-5)
    ["Help the diver avoid the jellyfish and reach the treasure chest!",
     "Guide the careful diver around stinging jellyfish swarms to reach the glittering treasure chest!"],
    ["Help the mermaid avoid the shark and reach the coral palace!",
     "Help the swift mermaid outsmart the circling sharks on her way to the sparkling coral palace!"],
    ["Help the sailor avoid the whirlpool and reach the sunken ship!",
     "Steer the skillful sailor around dangerous whirlpools to explore the legendary sunken ship!"],
    ["Help the sea turtle avoid the jellyfish and reach the coral palace!",
     "Guide the wise sea turtle safely past the jellyfish to the beautiful coral palace!"],

    // CollectTwo (Level 6-7)
    ["Help the diver collect the pearl and starfish, then reach the treasure chest!",
     "Embark on an epic dive to gather the lustrous pearl and colorful starfish before claiming the treasure chest!"],
    ["Help the mermaid collect the shell and treasure map, then reach the sunken ship!",
     "Join the adventurous mermaid collecting precious shells and an ancient map leading to the sunken ship!"],

    // Full (Level 8-10)
    ["Help the diver collect the pearl and starfish, avoid the shark, and reach the treasure chest!",
     "Brave the deep ocean with the courageous diver, gathering pearls and starfish while evading hungry sharks to claim the treasure!"],
    ["Help the mermaid collect the shell and pearl, avoid the jellyfish, and reach the coral palace!",
     "Swim through treacherous waters with the clever mermaid, finding shells and pearls while dodging jellyfish to reach the coral palace!"],

    // =========================================================================
    // SPACE THEME
    // =========================================================================
    // Simple (Level 1-3)
    ["Help the astronaut find the space station!",
     "Blast off with the brave astronaut on a mission to reach the orbiting space station!"],
    ["Help the robot find the warp gate!",
     "Power up the friendly robot and guide it to the shimmering warp gate!"],
    ["Help the alien find the moon base!",
     "Help the curious alien navigate through space to the mysterious moon base!"],
    ["Help the space cadet find the rocket ship!",
     "Join the young space cadet on an exciting mission to find the rocket ship!"],

    // Collect (Level 4-5)
    ["Help the astronaut collect the fuel cell and reach the space station!",
     "Navigate through the cosmos with the courageous astronaut, gathering fuel cells to reach the orbiting space station!"],
    ["Help the robot collect the star crystal and reach the warp gate!",
     "Guide the determined robot through asteroid fields, collecting glowing star crystals to power the warp gate!"],
    ["Help the alien collect the moon rock and reach the moon base!",
     "Travel the stars with the friendly alien, gathering rare moon rocks on the way to the secret moon base!"],

    // Avoid (Level 4-5)
    ["Help the astronaut avoid the asteroid and reach the space station!",
     "Pilot through dangerous asteroid fields with the skilled astronaut to dock at the space station!"],
    ["Help the robot avoid the black hole and reach the warp gate!",
     "Steer the clever robot through a dangerous asteroid field to the glowing warp gate!"],
    ["Help the alien avoid the space pirate and reach the moon base!",
     "Help the quick-thinking alien dodge space pirates on the journey to the hidden moon base!"],

    // CollectTwo (Level 6-7)
    ["Help the astronaut collect the fuel cell and star crystal, then reach the space station!",
     "Embark on a cosmic mission to gather fuel cells and rare star crystals before reaching the gleaming space station!"],
    ["Help the robot collect the moon rock and space map, then reach the warp gate!",
     "Guide the resourceful robot through space, collecting moon rocks and ancient maps to activate the warp gate!"],

    // Full (Level 8-10)
    ["Help the astronaut collect the fuel cell and star crystal, avoid the black hole, and reach the space station!",
     "Navigate the treacherous void with the fearless astronaut, gathering vital supplies while avoiding deadly black holes to reach safety!"],
    ["Help the robot collect the moon rock and space map, avoid the asteroid, and reach the warp gate!",
     "Guide the brave robot through cosmic hazards, collecting precious cargo while dodging asteroids to activate the warp gate!"],

    // =========================================================================
    // GARDEN THEME
    // =========================================================================
    // Simple (Level 1-3)
    ["Help the bee find the beehive!",
     "Buzz along with the happy bee to find its cozy beehive home!"],
    ["Help the butterfly find the flower garden!",
     "Flutter with the colorful butterfly to the beautiful flower garden!"],
    ["Help the ladybug find the mushroom house!",
     "Crawl with the friendly ladybug to discover the magical mushroom house!"],
    ["Help the gardener find the greenhouse!",
     "Walk through the garden path with the cheerful gardener to reach the sunny greenhouse!"],

    // Collect (Level 4-5)
    ["Help the bee collect the nectar and reach the beehive!",
     "Buzz from flower to flower with the busy bee, gathering sweet nectar for the hive!"],
    ["Help the butterfly collect the pollen and reach the flower garden!",
     "Float through the meadow with the gentle butterfly, carrying golden pollen to the flower garden!"],
    ["Help the ladybug collect the dewdrop and reach the mushroom house!",
     "Scurry along with the thirsty ladybug, finding sparkling dewdrops on the path to the mushroom house!"],

    // Avoid (Level 4-5)
    ["Help the bee avoid the spider and reach the beehive!",
     "Help the careful bee dodge the sneaky spider webs on the flight back to the hive!"],
    ["Help the butterfly avoid the bird and reach the flower garden!",
     "Guide the nimble butterfly past hungry birds to the safety of the flower garden!"],
    ["Help the ladybug avoid the frog and reach the mushroom house!",
     "Help the clever ladybug sneak past the jumping frog to reach the cozy mushroom house!"],

    // CollectTwo (Level 6-7)
    ["Help the bee collect the nectar and pollen, then reach the beehive!",
     "Buzz along with the busy bee, gathering sweet nectar and golden pollen before returning to the cozy beehive!"],
    ["Help the butterfly collect the dewdrop and flower, then reach the flower garden!",
     "Dance through the air with the graceful butterfly, gathering dewdrops and flowers for the garden!"],

    // Full (Level 8-10)
    ["Help the bee collect the nectar and pollen, avoid the spider, and reach the beehive!",
     "Join the determined bee on a perilous journey through spider webs, gathering nectar and pollen for the hungry hive!"],
    ["Help the butterfly avoid the spider and reach the flower garden!",
     "Flutter carefully with the beautiful butterfly, dodging sneaky spiders to reach the blooming flower garden!"],

    // =========================================================================
    // JUNGLE THEME
    // =========================================================================
    // Simple (Level 1-3)
    ["Help the explorer find the hidden temple!",
     "Venture into the wild jungle with the daring explorer to discover the ancient hidden temple!"],
    ["Help the baby monkey find the treetop village!",
     "Swing through the vines with the playful baby monkey to reach the treetop village!"],
    ["Help the parrot find the waterfall!",
     "Fly through the canopy with the colorful parrot to find the thundering waterfall!"],
    ["Help the tiger cub find the jungle den!",
     "Prowl through the undergrowth with the curious tiger cub to find its cozy jungle den!"],

    // Collect (Level 4-5)
    ["Help the explorer collect the golden idol and reach the hidden temple!",
     "Venture deep into the wilderness with the daring explorer, seeking the legendary golden idol in the mysterious hidden temple!"],
    ["Help the baby monkey collect the banana and reach the treetop village!",
     "Swing branch to branch with the hungry monkey, grabbing ripe bananas on the way to the treetop village!"],
    ["Help the parrot collect the feather and reach the waterfall!",
     "Soar through the jungle with the proud parrot, collecting colorful feathers near the misty waterfall!"],

    // Avoid (Level 4-5)
    ["Help the explorer avoid the snake and reach the hidden temple!",
     "Guide the cautious explorer past slithering snakes to discover the secrets of the hidden temple!"],
    ["Help the baby monkey avoid the crocodile and reach the treetop village!",
     "Help the clever monkey swing high above the snapping crocodiles to the safety of the village!"],
    ["Help the baby monkey avoid the snake and reach the treetop village!",
     "Swing through the vines with the playful baby monkey, staying clear of slithering snakes on the way to the treetop village!"],

    // CollectTwo (Level 6-7)
    ["Help the explorer collect the golden idol and ancient map, then reach the hidden temple!",
     "Embark on an epic expedition, finding the golden idol and deciphering the ancient map to unlock the hidden temple!"],
    ["Help the baby monkey collect the banana and coconut, then reach the treetop village!",
     "Join the hungry monkey gathering tropical treats before climbing to the treetop village!"],

    // Full (Level 8-10)
    ["Help the explorer collect the golden idol and ancient map, avoid the snake, and reach the hidden temple!",
     "Brave the dangerous jungle with the fearless explorer, gathering treasures while avoiding deadly snakes to reach the temple!"],
    ["Help the baby monkey collect the banana and coconut, avoid the crocodile, and reach the treetop village!",
     "Adventure through the treetops with the brave monkey, collecting fruit while dodging crocodiles below!"],

    // =========================================================================
    // CANDY THEME
    // =========================================================================
    // Simple (Level 1-3)
    ["Help the gingerbread kid find the candy castle!",
     "Skip along the sugar-coated path with the gingerbread kid to the magnificent candy castle!"],
    ["Help the candy fairy find the lollipop forest!",
     "Fly with the sparkly candy fairy to discover the magical lollipop forest!"],
    ["Help the sugar plum find the chocolate fountain!",
     "Dance through candy land with the sweet sugar plum to the bubbling chocolate fountain!"],

    // Collect (Level 4-5)
    ["Help the gingerbread kid collect the gumdrop and reach the candy castle!",
     "Run through the frosting fields with the gingerbread kid, collecting colorful gumdrops on the way to the candy castle!"],
    ["Help the candy fairy collect the lollipop and reach the candy castle!",
     "Sprinkle magic dust with the candy fairy while collecting sparkling lollipops on the path to the magnificent candy castle!"],
    ["Help the candy fairy collect the gumdrop and reach the candy castle!",
     "Sprinkle magic dust with the candy fairy while collecting sparkling gumdrops on the path to the magnificent candy castle!"],

    // Avoid (Level 4-5)
    ["Help the gingerbread kid avoid the candy witch and reach the candy castle!",
     "Dash through the candy forest with the quick gingerbread kid, avoiding the tricky candy witch!"],
    ["Help the candy fairy avoid the sour worm and reach the lollipop forest!",
     "Fly swiftly with the clever candy fairy, dodging sour worms to reach the sweet lollipop forest!"],

    // CollectTwo (Level 6-7)
    ["Help the gingerbread kid collect the gumdrop and lollipop, then reach the candy castle!",
     "Journey through candy land with the gingerbread kid, filling pockets with gumdrops and lollipops before reaching the castle!"],
    ["Help the candy fairy collect the chocolate coin and peppermint, then reach the candy castle!",
     "Sprinkle magic as the fairy gathers golden chocolate coins and cool peppermints for the candy castle!"],

    // Full (Level 8-10)
    ["Help the gingerbread kid collect the gumdrop and lollipop, avoid the candy witch, and reach the candy castle!",
     "Race through the sugary kingdom with the brave gingerbread kid, grabbing treats while outsmarting the candy witch!"],
    ["Help the candy fairy collect the chocolate coin and peppermint, avoid the sour worm, and reach the candy castle!",
     "Embark on a sweet adventure with the candy fairy, collecting treasures while avoiding sour worms to reach the castle!"],

    // =========================================================================
    // CLASSIC THEME
    // =========================================================================
    // Simple (Level 1-3)
    ["Help the explorer find the treasure!",
     "Embark on an exciting journey with the brave explorer to discover the hidden treasure!"],
    ["Help the adventurer find the exit!",
     "Guide the determined adventurer through twisting passages to freedom!"],
    ["Help the traveler find the castle!",
     "Journey with the weary traveler through the maze to the grand castle!"],
    ["Help the knight find the dragon's lair!",
     "March with the brave knight through the labyrinth to face the dragon!"],

    // Collect (Level 4-5)
    ["Help the explorer collect the key and reach the treasure!",
     "Search with the clever explorer for the golden key that unlocks the legendary treasure!"],
    ["Help the adventurer collect the compass and reach the exit!",
     "Navigate with the resourceful adventurer, using the magic compass to find the way out!"],
    ["Help the knight collect the sword and reach the dragon's lair!",
     "Arm the courageous knight with the enchanted sword on the quest to the dragon's lair!"],

    // Avoid (Level 4-5)
    ["Help the explorer avoid the trap and reach the treasure!",
     "Guide the careful explorer around cunning traps to claim the glittering treasure!"],
    ["Help the adventurer avoid the monster and reach the exit!",
     "Lead the swift adventurer past lurking monsters to escape the maze!"],
    ["Guide the adventurer to the exit!",
     "Lead the resourceful adventurer through twisting passages to find the way out!"],

    // CollectTwo (Level 6-7)
    ["Help the explorer collect the key and map, then reach the treasure!",
     "Embark on a grand quest to find the ancient key and faded map leading to untold riches!"],
    ["Help the knight collect the sword and shield, then reach the dragon's lair!",
     "Prepare the noble knight with legendary sword and sturdy shield for the ultimate battle!"],

    // Full (Level 8-10)
    ["Help the explorer collect the key and map, avoid the trap, and reach the treasure!",
     "Navigate the perilous maze with the daring explorer, gathering clues while dodging traps to claim the treasure!"],
    ["Help the knight collect the sword and shield, avoid the monster, and reach the dragon's lair!",
     "Guide the valiant knight through monster-infested passages, arming for the epic confrontation with the dragon!"],

    // =========================================================================
    // EXACT THEME MATCHES (character+goal from Themes)
    // These match exactly what the story generator produces
    // =========================================================================

    // Classic: explorer -> treasure
    ["Help the explorer find the treasure!",
     "Join the brave explorer on a daring quest through the winding maze to find the legendary treasure!"],
    ["Help the explorer collect the key and reach the treasure!",
     "Guide the clever explorer through twisting passages, finding the golden key that unlocks the magnificent treasure!"],
    ["Help the explorer collect the map and reach the treasure!",
     "Navigate the mysterious maze with the resourceful explorer, following the ancient map to the hidden treasure!"],
    ["Help the explorer avoid the trap and reach the treasure!",
     "Lead the careful explorer around cunning traps to claim the glittering treasure!"],

    // Ocean: diver -> treasure chest
    ["Help the diver find the treasure chest!",
     "Dive into the deep blue with the courageous diver on a quest to discover the legendary treasure chest!"],
    ["Help the diver collect the pearl and reach the treasure chest!",
     "Plunge into the ocean depths with the skilled diver, gathering precious pearls on the way to the treasure chest!"],
    ["Help the diver avoid the jellyfish and reach the treasure chest!",
     "Navigate the dangerous waters with the nimble diver, dodging stinging jellyfish to find the treasure chest!"],
    ["Help the diver avoid the shark and reach the treasure chest!",
     "Swim swiftly with the brave diver, evading hungry sharks to reach the sunken treasure chest!"],

    // Space: astronaut -> space station
    ["Help the astronaut find the space station!",
     "Blast off on an epic journey with the fearless astronaut to reach the orbiting space station!"],
    ["Help the astronaut collect the fuel cell and reach the space station!",
     "Float through the cosmos with the determined astronaut, gathering vital fuel cells to dock at the space station!"],
    ["Help the astronaut avoid the asteroid and reach the space station!",
     "Navigate the asteroid field with the skilled astronaut, dodging space rocks to reach the gleaming space station!"],
    ["Help the astronaut avoid the black hole and reach the space station!",
     "Steer through the void with the brave astronaut, avoiding the pull of black holes to reach safety at the space station!"],

    // Garden: bee -> beehive
    ["Help the bee find the beehive!",
     "Buzz through the garden with the busy little bee, finding the way back to the cozy beehive!"],
    ["Help the bee collect the nectar and reach the beehive!",
     "Fly from flower to flower with the diligent bee, gathering sweet nectar to bring home to the beehive!"],
    ["Help the bee collect the pollen and reach the beehive!",
     "Dance through the meadow with the hardworking bee, collecting golden pollen for the hungry beehive!"],
    ["Help the bee avoid the spider and reach the beehive!",
     "Fly carefully with the clever bee, dodging sticky spider webs on the journey home to the beehive!"],

    // Candy: gingerbread kid -> candy castle
    ["Help the gingerbread kid find the candy castle!",
     "Skip along the sugar-coated path with the cheerful gingerbread kid to the magnificent candy castle!"],
    ["Help the gingerbread kid collect the gumdrop and reach the candy castle!",
     "Dance through candy land with the sweet gingerbread kid, collecting colorful gumdrops on the way to the candy castle!"],
    ["Help the gingerbread kid collect the candy cane and reach the candy castle!",
     "Prance through the frosting fields with the jolly gingerbread kid, grabbing striped candy canes before reaching the candy castle!"],
    ["Help the gingerbread kid avoid the sour candy and reach the candy castle!",
     "Run quickly with the clever gingerbread kid, steering clear of sour candies on the sweet path to the candy castle!"],

    // Jungle: explorer -> hidden temple
    ["Help the explorer find the hidden temple!",
     "Venture into the wild jungle with the daring explorer, hacking through vines to discover the ancient hidden temple!"],
    ["Help the explorer collect the golden idol and reach the hidden temple!",
     "Trek through the dense jungle with the brave explorer, claiming the legendary golden idol on the path to the hidden temple!"],
    ["Help the explorer collect the ancient map and reach the hidden temple!",
     "Navigate the untamed wilderness with the resourceful explorer, deciphering the ancient map to find the hidden temple!"],
    ["Help the explorer avoid the snake and reach the hidden temple!",
     "Creep through the jungle undergrowth with the alert explorer, avoiding slithering snakes on the quest to the hidden temple!"],
    ["Help the explorer avoid the quicksand and reach the hidden temple!",
     "Tread carefully with the wise explorer, skirting deadly quicksand pits to reach the mysterious hidden temple!"]
];

// Initialize enhanced cache
enhancedSentences.forEach(([original, enhanced]) => {
    EnhancedSentenceCache.add(original, enhanced);
});

// Story Generator class
class StoryGenerator {
    constructor(rng) {
        this.rng = rng;
    }

    generateTitle(themeName) {
        const vocab = ThemeVocabulary[themeName] || ThemeVocabulary.classic;
        const template = this.rng.choice(TitleTemplates);
        return template
            .replace('{adjective}', this.rng.choice(vocab.adjectives))
            .replace('{noun}', this.rng.choice(vocab.nouns));
    }

    generateQuest(themeName, difficulty = 5, selectedCharacter = null, selectedGoal = null) {
        const vocab = ThemeVocabulary[themeName] || ThemeVocabulary.classic;
        const theme = Themes[themeName] || Themes.classic;

        // Select template type based on difficulty
        // Note: Only 'simple' templates are used because they only mention
        // the character (drawn at start) and goal (drawn at end).
        // 'collect', 'collectTwo', 'avoid', and 'full' templates mention items/dangers
        // that aren't actually drawn on the maze, which confuses users.
        let templateType = 'simple';

        const templates = StoryTemplates[templateType];
        const template = this.rng.choice(templates);

        // Select vocabulary items (ensure uniqueness)
        const items = this.rng.shuffle([...vocab.items]);
        const item1 = items[0];
        const item2 = items[1] || items[0];

        // Use passed character/goal names, or fallback to theme/vocab
        const character = selectedCharacter || theme.characterName || this.rng.choice(vocab.characters);
        const goal = selectedGoal || theme.goalName || this.rng.choice(vocab.goals);

        // Fill template
        let story = template
            .replace('{character}', character)
            .replace('{item1}', item1)
            .replace('{item2}', item2)
            .replace('{danger}', this.rng.choice(vocab.dangers))
            .replace('{goal}', goal);

        // Check for enhanced version
        const enhanced = EnhancedSentenceCache.get(story, this.rng);
        const isEnhanced = !!enhanced;
        if (enhanced) {
            story = enhanced;
        }

        return {
            title: this.generateTitle(themeName),
            quest: story,
            templateType,
            isEnhanced,
            items: templateType === 'full' || templateType === 'collectTwo' ? [item1, item2] :
                   templateType === 'collect' ? [item1] : []
        };
    }

    // Generate batch of stories for review/enhancement
    generateBatch(themeName, count = 100) {
        const stories = [];
        for (let i = 0; i < count; i++) {
            const difficulty = 1 + (i % 10);
            stories.push(this.generateQuest(themeName, difficulty));
        }
        return stories;
    }
}

// =============================================================================
// COMPACT TEXT REPRESENTATION (for debugging/AI review)
// =============================================================================

// Wall encoding: 4 bits = N,S,E,W -> hex digit (0-F)
// Special markers: X=blocked, S=start room, E=end room, R=interior room
// Art items: lowercase letters (a-z)

const CompactMazeEncoder = {
    // Encode wall configuration to hex
    encodeWalls(cell) {
        let bits = 0;
        if (cell.walls.north) bits |= 8;  // 1000
        if (cell.walls.south) bits |= 4;  // 0100
        if (cell.walls.east)  bits |= 2;  // 0010
        if (cell.walls.west)  bits |= 1;  // 0001
        return bits.toString(16).toUpperCase();
    },

    // Decode hex to wall configuration
    decodeWalls(hex) {
        const bits = parseInt(hex, 16);
        return {
            north: !!(bits & 8),
            south: !!(bits & 4),
            east:  !!(bits & 2),
            west:  !!(bits & 1)
        };
    },

    // Generate compact text representation
    encode(maze) {
        const lines = [];

        // Header: dimensions, shape, theme, curved
        lines.push(`MAZE:${maze.width}x${maze.height}|${maze.shape}|${maze.theme.name}|${maze.curvedWalls ? 'C' : 'S'}`);

        // Start/End positions
        if (maze.startPos) {
            const rs = maze.startRoomSize || 2;
            lines.push(`START:${maze.startPos.x},${maze.startPos.y}|${rs}x${rs}`);
        }
        if (maze.endPos) {
            const re = maze.endRoomSize || 2;
            lines.push(`END:${maze.endPos.x},${maze.endPos.y}|${re}x${re}`);
        }

        // Interior rooms
        if (maze.rooms && maze.rooms.length > 0) {
            const roomStrs = maze.rooms.map(r => `${r.x},${r.y}:${r.w}x${r.h}`);
            lines.push(`ROOMS:${roomStrs.join(';')}`);
        }

        // Border pattern
        if (maze.theme.borderPattern) {
            lines.push(`BORDER:${maze.theme.borderPattern}`);
        }

        // Solution path length (without full path, for brevity)
        if (maze.solution) {
            lines.push(`SOLUTION:${maze.solution.length} cells`);
        }

        // Grid representation
        lines.push('GRID:');

        // Build room/start/end lookup for quick access
        const specialCells = new Map();
        if (maze.startPos) {
            const rs = maze.startRoomSize || 2;
            for (let dy = 0; dy < rs; dy++) {
                for (let dx = 0; dx < rs; dx++) {
                    specialCells.set(`${maze.startPos.x+dx},${maze.startPos.y+dy}`, 'S');
                }
            }
        }
        if (maze.endPos) {
            const re = maze.endRoomSize || 2;
            for (let dy = 0; dy < re; dy++) {
                for (let dx = 0; dx < re; dx++) {
                    specialCells.set(`${maze.endPos.x+dx},${maze.endPos.y+dy}`, 'E');
                }
            }
        }
        if (maze.rooms) {
            maze.rooms.forEach((room, i) => {
                for (let dy = 0; dy < room.h; dy++) {
                    for (let dx = 0; dx < room.w; dx++) {
                        const key = `${room.x+dx},${room.y+dy}`;
                        if (!specialCells.has(key)) {
                            specialCells.set(key, String.fromCharCode(97 + (i % 26))); // a-z
                        }
                    }
                }
            });
        }

        // Encode each row
        for (let y = 0; y < maze.height; y++) {
            let row = '';
            for (let x = 0; x < maze.width; x++) {
                const cell = maze.cells[y][x];
                const key = `${x},${y}`;

                if (cell.blocked) {
                    row += '.';
                } else if (specialCells.has(key)) {
                    row += specialCells.get(key);
                } else {
                    row += this.encodeWalls(cell);
                }
            }
            lines.push(row);
        }

        return lines.join('\n');
    },

    // Generate human-readable ASCII art maze (walls as lines)
    toASCII(maze) {
        const lines = [];

        // Top border
        let topLine = '+';
        for (let x = 0; x < maze.width; x++) {
            const cell = maze.cells[0][x];
            topLine += cell.blocked ? '...' : (cell.walls.north ? '---' : '   ');
            topLine += '+';
        }
        lines.push(topLine);

        for (let y = 0; y < maze.height; y++) {
            // Cell row
            let cellLine = '';
            let bottomLine = '+';

            for (let x = 0; x < maze.width; x++) {
                const cell = maze.cells[y][x];

                // West wall / cell content
                if (x === 0) {
                    cellLine += cell.blocked ? '.' : (cell.walls.west ? '|' : ' ');
                }

                // Cell content
                if (cell.blocked) {
                    cellLine += '...';
                } else {
                    // Check if start/end/room
                    let marker = '   ';
                    if (maze.startPos && x >= maze.startPos.x && x < maze.startPos.x + (maze.startRoomSize || 2) &&
                        y >= maze.startPos.y && y < maze.startPos.y + (maze.startRoomSize || 2)) {
                        marker = ' S ';
                    } else if (maze.endPos && x >= maze.endPos.x && x < maze.endPos.x + (maze.endRoomSize || 2) &&
                               y >= maze.endPos.y && y < maze.endPos.y + (maze.endRoomSize || 2)) {
                        marker = ' E ';
                    }
                    cellLine += marker;
                }

                // East wall
                cellLine += cell.blocked ? '.' : (cell.walls.east ? '|' : ' ');

                // Bottom wall
                bottomLine += cell.blocked ? '...' : (cell.walls.south ? '---' : '   ');
                bottomLine += '+';
            }

            lines.push(cellLine);
            lines.push(bottomLine);
        }

        return lines.join('\n');
    },

    // Summary stats for quick review
    stats(maze) {
        let blockedCount = 0;
        let totalCells = maze.width * maze.height;
        let wallCount = 0;

        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                const cell = maze.cells[y][x];
                if (cell.blocked) {
                    blockedCount++;
                } else {
                    if (cell.walls.north) wallCount++;
                    if (cell.walls.south) wallCount++;
                    if (cell.walls.east) wallCount++;
                    if (cell.walls.west) wallCount++;
                }
            }
        }

        return {
            dimensions: `${maze.width}x${maze.height}`,
            totalCells,
            activeCells: totalCells - blockedCount,
            blockedCells: blockedCount,
            shape: maze.shape,
            theme: maze.theme.name,
            curved: maze.curvedWalls,
            startRoom: maze.startPos ? `${maze.startPos.x},${maze.startPos.y} (${maze.startRoomSize}x${maze.startRoomSize})` : null,
            endRoom: maze.endPos ? `${maze.endPos.x},${maze.endPos.y} (${maze.endRoomSize}x${maze.endRoomSize})` : null,
            interiorRooms: maze.rooms.length,
            solutionLength: maze.solution ? maze.solution.length : 0,
            wallSegments: wallCount / 2 // Each wall counted twice (once per cell)
        };
    }
};

// =============================================================================
// MAZE GENERATOR
// =============================================================================

// Maze Generator
class MazeGenerator {
    constructor(seed = Date.now()) {
        this.rng = new SeededRandom(seed);
    }

    generate(width, height, algorithm = 'recursive_backtracker', shape = 'rectangle', themeName = 'classic', curved = false) {
        const PERF_TIMING = typeof window !== 'undefined' && window.MAZE_PERF_TIMING;
        const t0 = PERF_TIMING ? performance.now() : 0;

        const maze = new Maze(width, height, this.rng);
        maze.theme = Themes[themeName] || Themes.classic;
        maze.curvedWalls = curved;
        maze.shape = shape; // Store shape for later reference

        // Select random character and goal from theme arrays
        const theme = maze.theme;
        if (theme.characters && theme.characters.length > 0) {
            const charChoice = this.rng.choice(theme.characters);
            maze.selectedCharacter = charChoice.art;
            maze.selectedCharacterName = charChoice.name;
        } else {
            maze.selectedCharacter = theme.character;
            maze.selectedCharacterName = theme.characterName;
        }
        if (theme.goals && theme.goals.length > 0) {
            const goalChoice = this.rng.choice(theme.goals);
            maze.selectedGoal = goalChoice.art;
            maze.selectedGoalName = goalChoice.name;
        } else {
            maze.selectedGoal = theme.goal;
            maze.selectedGoalName = theme.goalName;
        }

        const t1 = PERF_TIMING ? performance.now() : 0;

        // Apply shape mask
        maze.applyShapeMask(shape);

        const t2 = PERF_TIMING ? performance.now() : 0;

        // Find valid start/end before generation (includes connected regions check)
        maze.findValidStartEnd();

        const t3 = PERF_TIMING ? performance.now() : 0;

        // Generate maze
        switch (algorithm) {
            case 'prims': this.prims(maze); break;
            case 'kruskals': this.kruskals(maze); break;
            default: this.recursiveBacktracker(maze);
        }

        const t4 = PERF_TIMING ? performance.now() : 0;

        // Fill disconnected regions (buildings that aren't connected to main maze)
        // OPTIMIZATION: Skip for rectangle shapes (no disconnected regions possible)
        if (shape !== 'rectangle') {
            this.fillDisconnectedRegions(maze, algorithm);
        }

        const t5 = PERF_TIMING ? performance.now() : 0;

        // Add interior rooms - larger mazes need bigger rooms since cells are smaller
        maze.addRooms();

        const t6 = PERF_TIMING ? performance.now() : 0;

        // Create entrance/exit
        maze.createEntranceExit();

        const t7 = PERF_TIMING ? performance.now() : 0;

        if (PERF_TIMING) {
            console.log(`[MAZE ${width}x${height} ${shape}] Total: ${(t7-t0).toFixed(1)}ms | ` +
                `Init: ${(t1-t0).toFixed(1)}ms, Mask: ${(t2-t1).toFixed(1)}ms, StartEnd: ${(t3-t2).toFixed(1)}ms, ` +
                `Algo: ${(t4-t3).toFixed(1)}ms, FillDisc: ${(t5-t4).toFixed(1)}ms, Rooms: ${(t6-t5).toFixed(1)}ms, Entrance: ${(t7-t6).toFixed(1)}ms`);
        }

        return maze;
    }

    getUnvisitedNeighbors(maze, x, y) {
        const neighbors = [];
        const dirs = [[0, -1], [0, 1], [1, 0], [-1, 0]];
        for (const [dx, dy] of dirs) {
            const cell = maze.getCell(x + dx, y + dy);
            if (cell && !cell.visited && !cell.blocked) {
                neighbors.push([x + dx, y + dy]);
            }
        }
        return neighbors;
    }

    findStartCell(maze) {
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                if (!maze.cells[y][x].blocked) return [x, y];
            }
        }
        return null;
    }

    recursiveBacktracker(maze) {
        const start = this.findStartCell(maze);
        if (!start) return;

        const stack = [start];
        maze.cells[start[1]][start[0]].visited = true;

        while (stack.length > 0) {
            const [x, y] = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(maze, x, y);

            if (neighbors.length > 0) {
                const [nx, ny] = this.rng.choice(neighbors);
                maze.removeWall(x, y, nx, ny);
                maze.cells[ny][nx].visited = true;
                stack.push([nx, ny]);
            } else {
                stack.pop();
            }
        }
    }

    prims(maze) {
        const start = this.findStartCell(maze);
        if (!start) return;

        const frontier = [];
        maze.cells[start[1]][start[0]].visited = true;
        this.addFrontier(maze, start[0], start[1], frontier);

        while (frontier.length > 0) {
            const idx = this.rng.nextInt(0, frontier.length - 1);
            const [x1, y1, x2, y2] = frontier.splice(idx, 1)[0];

            if (!maze.cells[y2][x2].visited) {
                maze.removeWall(x1, y1, x2, y2);
                maze.cells[y2][x2].visited = true;
                this.addFrontier(maze, x2, y2, frontier);
            }
        }
    }

    addFrontier(maze, x, y, frontier) {
        const dirs = [[0, -1], [0, 1], [1, 0], [-1, 0]];
        for (const [dx, dy] of dirs) {
            const cell = maze.getCell(x + dx, y + dy);
            if (cell && !cell.visited && !cell.blocked) {
                frontier.push([x, y, x + dx, y + dy]);
            }
        }
    }

    kruskals(maze) {
        const parent = new Map();

        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                if (!maze.cells[y][x].blocked) {
                    parent.set(`${x},${y}`, `${x},${y}`);
                    maze.cells[y][x].visited = true;
                }
            }
        }

        const find = (pos) => {
            if (parent.get(pos) !== pos) {
                parent.set(pos, find(parent.get(pos)));
            }
            return parent.get(pos);
        };

        const union = (a, b) => {
            const ra = find(a), rb = find(b);
            if (ra !== rb) {
                parent.set(rb, ra);
                return true;
            }
            return false;
        };

        const walls = [];
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                if (maze.cells[y][x].blocked) continue;
                if (x + 1 < maze.width && !maze.cells[y][x + 1].blocked)
                    walls.push([x, y, x + 1, y]);
                if (y + 1 < maze.height && !maze.cells[y + 1][x].blocked)
                    walls.push([x, y, x, y + 1]);
            }
        }

        const shuffled = this.rng.shuffle(walls);
        for (const [x1, y1, x2, y2] of shuffled) {
            if (union(`${x1},${y1}`, `${x2},${y2}`)) {
                maze.removeWall(x1, y1, x2, y2);
            }
        }
    }

    // Fill disconnected regions with maze patterns
    // This makes unreachable "buildings" look like real mazes instead of graph paper
    // OPTIMIZED: Collect all unvisited cells upfront instead of rescanning grid each time
    fillDisconnectedRegions(maze, algorithm) {
        // Collect all unvisited non-blocked cells in one pass
        const unvisitedCells = [];
        for (let y = 0; y < maze.height; y++) {
            for (let x = 0; x < maze.width; x++) {
                if (!maze.cells[y][x].blocked && !maze.cells[y][x].visited) {
                    unvisitedCells.push([x, y]);
                }
            }
        }

        // Process each disconnected region
        let idx = 0;
        while (idx < unvisitedCells.length) {
            const [x, y] = unvisitedCells[idx];
            // Skip if already visited by a previous region fill
            if (maze.cells[y][x].visited) {
                idx++;
                continue;
            }

            // Run the algorithm on this disconnected region
            switch (algorithm) {
                case 'prims': this.primsFromCell(maze, [x, y]); break;
                case 'kruskals': this.kruskalsRegion(maze, [x, y]); break;
                default: this.recursiveBacktrackerFromCell(maze, [x, y]);
            }
            idx++;
        }
    }

    recursiveBacktrackerFromCell(maze, start) {
        const stack = [start];
        maze.cells[start[1]][start[0]].visited = true;

        while (stack.length > 0) {
            const [x, y] = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(maze, x, y);

            if (neighbors.length > 0) {
                const [nx, ny] = this.rng.choice(neighbors);
                maze.removeWall(x, y, nx, ny);
                maze.cells[ny][nx].visited = true;
                stack.push([nx, ny]);
            } else {
                stack.pop();
            }
        }
    }

    primsFromCell(maze, start) {
        const frontier = [];
        maze.cells[start[1]][start[0]].visited = true;
        this.addFrontier(maze, start[0], start[1], frontier);

        while (frontier.length > 0) {
            const idx = this.rng.nextInt(0, frontier.length - 1);
            const [x1, y1, x2, y2] = frontier.splice(idx, 1)[0];

            if (!maze.cells[y2][x2].visited) {
                maze.removeWall(x1, y1, x2, y2);
                maze.cells[y2][x2].visited = true;
                this.addFrontier(maze, x2, y2, frontier);
            }
        }
    }

    kruskalsRegion(maze, start) {
        // First, flood-fill to find all cells in this disconnected region
        const regionCells = [];
        const toVisit = [start];
        const visited = new Set();
        visited.add(`${start[0]},${start[1]}`);

        while (toVisit.length > 0) {
            const [x, y] = toVisit.pop();
            regionCells.push([x, y]);
            maze.cells[y][x].visited = true;

            const dirs = [[0, -1], [0, 1], [1, 0], [-1, 0]];
            for (const [dx, dy] of dirs) {
                const nx = x + dx, ny = y + dy;
                const key = `${nx},${ny}`;
                const cell = maze.getCell(nx, ny);
                if (cell && !cell.blocked && !visited.has(key)) {
                    visited.add(key);
                    toVisit.push([nx, ny]);
                }
            }
        }

        // Now run Kruskal's on just this region
        const parent = new Map();
        for (const [x, y] of regionCells) {
            parent.set(`${x},${y}`, `${x},${y}`);
        }

        const find = (pos) => {
            if (parent.get(pos) !== pos) {
                parent.set(pos, find(parent.get(pos)));
            }
            return parent.get(pos);
        };

        const union = (a, b) => {
            const ra = find(a), rb = find(b);
            if (ra !== rb) {
                parent.set(rb, ra);
                return true;
            }
            return false;
        };

        const walls = [];
        for (const [x, y] of regionCells) {
            if (x + 1 < maze.width && !maze.cells[y][x + 1].blocked && visited.has(`${x + 1},${y}`))
                walls.push([x, y, x + 1, y]);
            if (y + 1 < maze.height && !maze.cells[y + 1][x].blocked && visited.has(`${x},${y + 1}`))
                walls.push([x, y, x, y + 1]);
        }

        const shuffled = this.rng.shuffle(walls);
        for (const [x1, y1, x2, y2] of shuffled) {
            if (union(`${x1},${y1}`, `${x2},${y2}`)) {
                maze.removeWall(x1, y1, x2, y2);
            }
        }
    }

    // Generate complete maze with story
    generateWithStory(width, height, algorithm, shape, themeName, curved, difficulty) {
        let maze = this.generate(width, height, algorithm, shape, themeName, curved);

        // If no solution found and using a complex shape, fall back to rectangle
        // This handles cases like moon/towers at small sizes where the shape is too fragmented
        if ((!maze.solution || maze.solution.length === 0) && shape !== 'rectangle') {
            maze = this.generate(width, height, algorithm, 'rectangle', themeName, curved);
            maze.originalShape = shape; // Track that we fell back
        }

        // Generate story for this maze using the selected character/goal
        const storyGen = new StoryGenerator(this.rng);
        const story = storyGen.generateQuest(themeName, difficulty, maze.selectedCharacterName, maze.selectedGoalName);

        // Store character/goal in story for filename generation
        story.character = maze.selectedCharacterName;
        story.goal = maze.selectedGoalName;

        maze.story = story;
        return maze;
    }
}

// =============================================================================
// MASK-PERCENTAGE BASED DIFFICULTY SCALING
// =============================================================================

// Pre-computed fill percentages for each mask shape
// These represent what fraction of the bounding box is actually part of the maze
// Computed by sampling each mask at a reference size (50x65)
const MASK_FILL_PERCENTAGES = {
    // Full shapes
    rectangle: 1.0,

    // Geometric shapes (fairly dense)
    circle: 0.78,
    oval: 0.78,
    hexagon: 0.82,
    diamond: 0.50,
    triangle: 0.50,

    // Organic shapes
    heart: 0.65,
    star: 0.45,
    flower: 0.55,
    clover: 0.50,
    apple: 0.70,
    egg: 0.75,

    // Objects
    cross: 0.45,
    arrow: 0.40,
    moon: 0.35,
    cloud: 0.60,
    tree: 0.55,
    house: 0.70,
    rocket: 0.45,
    castle: 0.60,
    crown: 0.55,
    lightning: 0.30,
    mushroom: 0.55,
    anchor: 0.35,
    musicNote: 0.30,

    // Animals
    cat: 0.50,
    bunny: 0.50,
    fish: 0.55,
    butterfly: 0.45,

    // Halloween/Fun
    ghost: 0.60,
    pumpkin: 0.65,
    pacman: 0.70,
    skull: 0.55,

    // Building masks (sparse, disconnected)
    village: 0.40,
    towers: 0.35,
    islands: 0.45,
    compound: 0.50,
    blocks: 0.55,
    archipelago: 0.35,

    // Dolphin theme masks
    dolphinJump: 0.40,
    tropicalSea: 0.50,
    dolphinPod: 0.45,
    oceanWaves: 0.55
};

// Base dimensions for each difficulty level (for full rectangle)
const BASE_SIZES = {
    3: { w: 5, h: 6 },
    4: { w: 7, h: 9 },
    5: { w: 10, h: 13 },
    6: { w: 13, h: 17 },
    7: { w: 17, h: 22 },
    8: { w: 21, h: 27 },
    9: { w: 27, h: 35 },
    10: { w: 33, h: 43 },
    11: { w: 39, h: 50 },
    12: { w: 45, h: 58 },
    13: { w: 51, h: 66 },
    14: { w: 57, h: 74 },
    15: { w: 63, h: 82 },
    16: { w: 69, h: 90 },
    17: { w: 75, h: 98 }
};

// Calculate mask fill percentage dynamically if not in lookup table
function getMaskFillPercentage(shape) {
    if (MASK_FILL_PERCENTAGES[shape] !== undefined) {
        return MASK_FILL_PERCENTAGES[shape];
    }

    // Calculate dynamically by sampling the mask
    const mask = ShapeMasks[shape];
    if (!mask) return 1.0;

    const sampleW = 50, sampleH = 65;
    let filled = 0;
    for (let y = 0; y < sampleH; y++) {
        for (let x = 0; x < sampleW; x++) {
            if (mask(x, y, sampleW, sampleH)) filled++;
        }
    }
    return filled / (sampleW * sampleH);
}

// Direct dimension calculation based on mask fill percentage
// No trial maze generation - just math
function findOptimalDimensions(seed, difficulty, shape, algorithm) {
    const baseSize = BASE_SIZES[difficulty];

    // For rectangle, just use base size directly
    if (shape === 'rectangle') {
        return baseSize;
    }

    // Get mask fill percentage
    const fillPct = getMaskFillPercentage(shape);

    // To get equivalent cell count, scale dimensions by 1/sqrt(fillPct)
    // This preserves the total number of maze cells approximately
    const scale = 1 / Math.sqrt(fillPct);

    // Apply scale to base dimensions, maintaining aspect ratio
    const w = Math.max(5, Math.round(baseSize.w * scale));
    const h = Math.max(6, Math.round(baseSize.h * scale));

    return { w, h };
}

// =============================================================================
// DEBUG OUTPUT HELPERS
// =============================================================================

// Generate debug output for a maze (for AI review)
function generateMazeDebugOutput(maze) {
    const lines = [];

    lines.push('=' .repeat(70));
    lines.push('MAZE DEBUG OUTPUT');
    lines.push('='.repeat(70));

    // Basic info
    lines.push('\n[CONFIGURATION]');
    lines.push(`  Seed: ${maze.seed || 'unknown'}`);
    lines.push(`  Dimensions: ${maze.width}x${maze.height}`);
    lines.push(`  Algorithm: ${maze.algorithm || 'recursive_backtracker'}`);
    lines.push(`  Shape: ${maze.shape}`);
    lines.push(`  Theme: ${maze.theme.name}`);
    lines.push(`  Curved Walls: ${maze.curvedWalls ? 'Yes' : 'No'}`);
    lines.push(`  Difficulty: ${maze.difficulty || 'unknown'}`);

    // Art references
    lines.push('\n[ARTWORK]');
    lines.push(`  Character Art: ${maze.theme.character || 'none'} ${CharacterArt[maze.theme.character] ? '✓' : '✗'}`);
    lines.push(`  Goal Art: ${maze.theme.goal || 'none'} ${GoalArt[maze.theme.goal] ? '✓' : '✗'}`);
    lines.push(`  Border Pattern: ${maze.theme.borderPattern || 'none'}`);
    lines.push(`  Decorations: ${maze.theme.decorations?.join(', ') || 'none'}`);

    // Stats
    const stats = CompactMazeEncoder.stats(maze);
    lines.push('\n[STATS]');
    lines.push(`  Total Cells: ${stats.totalCells}`);
    lines.push(`  Active Cells: ${stats.activeCells}`);
    lines.push(`  Blocked Cells: ${stats.blockedCells}`);
    lines.push(`  Wall Segments: ${stats.wallSegments}`);
    lines.push(`  Interior Rooms: ${stats.interiorRooms}`);
    lines.push(`  Solution Length: ${stats.solutionLength} cells`);

    // Rooms
    lines.push('\n[ROOMS]');
    if (maze.startPos) {
        lines.push(`  Start: (${maze.startPos.x},${maze.startPos.y}) ${maze.startRoomSize}x${maze.startRoomSize}`);
    }
    if (maze.endPos) {
        lines.push(`  End: (${maze.endPos.x},${maze.endPos.y}) ${maze.endRoomSize}x${maze.endRoomSize}`);
    }
    if (maze.rooms && maze.rooms.length > 0) {
        for (let i = 0; i < maze.rooms.length; i++) {
            const r = maze.rooms[i];
            lines.push(`  Interior ${i+1}: (${r.x},${r.y}) ${r.w}x${r.h}`);
        }
    }

    // Story if present
    if (maze.story) {
        lines.push('\n[STORY]');
        lines.push(`  Title: ${maze.story.title}`);
        lines.push(`  Quest: ${maze.story.quest}`);
        lines.push(`  Type: ${maze.story.templateType}`);
        if (maze.story.items && maze.story.items.length > 0) {
            lines.push(`  Items: ${maze.story.items.join(', ')}`);
        }
        // Check if enhanced
        const originalKey = EnhancedSentenceCache.hash(maze.story.quest);
        lines.push(`  Enhanced: ${EnhancedSentenceCache.cache.has(originalKey) ? 'Yes (cached)' : 'No (original)'}`);
    }

    // Compact encoding (for smaller mazes)
    if (maze.width <= 25 && maze.height <= 30) {
        lines.push('\n[COMPACT ENCODING]');
        lines.push(CompactMazeEncoder.encode(maze));
    }

    // ASCII art (only for small mazes)
    if (maze.width <= 15 && maze.height <= 18) {
        lines.push('\n[ASCII ART]');
        lines.push(CompactMazeEncoder.toASCII(maze));
    }

    lines.push('\n' + '='.repeat(70));

    return lines.join('\n');
}

// Comprehensive test function - generates multiple mazes and outputs summary
function runMazeTests(count = 12) {
    const results = [];
    const themes = Object.keys(Themes);
    const shapes = Object.keys(ShapeMasks);
    const algorithms = ['recursive_backtracker', 'prims', 'kruskals'];
    const difficulties = [3, 5, 7, 10];

    console.log('=' .repeat(70));
    console.log('MAZE GENERATION TEST SUITE');
    console.log('='.repeat(70));
    console.log(`Running ${count} test mazes...\n`);

    for (let i = 0; i < count; i++) {
        const seed = 1000 + i;
        const gen = new MazeGenerator(seed);
        const theme = themes[i % themes.length];
        const shape = shapes[Math.floor(i / themes.length) % shapes.length];
        const algo = algorithms[i % algorithms.length];
        const diff = difficulties[i % difficulties.length];

        // Get dimensions for difficulty
        const dims = {
            3: { w: 5, h: 6 },
            5: { w: 10, h: 13 },
            7: { w: 17, h: 22 },
            10: { w: 33, h: 43 }
        }[diff] || { w: 10, h: 13 };

        const maze = gen.generate(dims.w, dims.h, algo, shape, theme, i % 2 === 0);
        maze.seed = seed;
        maze.algorithm = algo;
        maze.difficulty = diff;

        // Generate story
        const storyGen = new StoryGenerator(new SeededRandom(seed));
        maze.story = storyGen.generateQuest(theme, diff);

        // Collect results
        const result = {
            id: i + 1,
            seed,
            theme,
            shape,
            algorithm: algo,
            difficulty: diff,
            dimensions: `${dims.w}x${dims.h}`,
            curved: i % 2 === 0,
            hasStart: !!maze.startPos,
            hasEnd: !!maze.endPos,
            hasSolution: !!maze.solution && maze.solution.length > 0,
            solutionLength: maze.solution ? maze.solution.length : 0,
            interiorRooms: maze.rooms ? maze.rooms.length : 0,
            character: maze.theme.character,
            goal: maze.theme.goal,
            charArtOk: !!CharacterArt[maze.theme.character],
            goalArtOk: !!GoalArt[maze.theme.goal],
            storyTitle: maze.story.title,
            storyQuest: maze.story.quest.substring(0, 50) + '...'
        };

        results.push(result);

        // Print compact result
        const status = result.hasStart && result.hasEnd && result.hasSolution ? '✓' : '✗';
        const artStatus = result.charArtOk && result.goalArtOk ? '✓' : '✗';
        console.log(`[${i+1}] ${status} ${result.dimensions} ${result.theme}/${result.shape} (${result.algorithm}) Art:${artStatus}`);
        console.log(`    Solution: ${result.solutionLength} cells, Rooms: ${result.interiorRooms}`);
        console.log(`    "${result.storyTitle}"`);
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('SUMMARY');
    console.log('='.repeat(70));
    const passed = results.filter(r => r.hasStart && r.hasEnd && r.hasSolution).length;
    const artOk = results.filter(r => r.charArtOk && r.goalArtOk).length;
    console.log(`Mazes Generated: ${count}`);
    console.log(`Solvable: ${passed}/${count}`);
    console.log(`Art Complete: ${artOk}/${count}`);
    console.log(`Themes Tested: ${[...new Set(results.map(r => r.theme))].join(', ')}`);
    console.log(`Shapes Tested: ${[...new Set(results.map(r => r.shape))].join(', ')}`);
    console.log(`Algorithms Tested: ${[...new Set(results.map(r => r.algorithm))].join(', ')}`);

    // List available art
    console.log('\n[AVAILABLE CHARACTER ART]');
    console.log(`  ${Object.keys(CharacterArt).join(', ')}`);
    console.log('\n[AVAILABLE GOAL ART]');
    console.log(`  ${Object.keys(GoalArt).join(', ')}`);

    return results;
}

// Quick test a single maze configuration
function testMaze(seed, theme, shape, difficulty, curved = false) {
    const gen = new MazeGenerator(seed);
    const dims = {
        3: { w: 5, h: 6 },
        4: { w: 7, h: 9 },
        5: { w: 10, h: 13 },
        6: { w: 13, h: 17 },
        7: { w: 17, h: 22 },
        8: { w: 21, h: 27 },
        9: { w: 27, h: 35 },
        10: { w: 33, h: 43 }
    }[difficulty] || { w: 10, h: 13 };

    const maze = gen.generate(dims.w, dims.h, 'recursive_backtracker', shape, theme, curved);
    maze.seed = seed;
    maze.algorithm = 'recursive_backtracker';
    maze.difficulty = difficulty;

    const storyGen = new StoryGenerator(new SeededRandom(seed));
    maze.story = storyGen.generateQuest(theme, difficulty);

    console.log(generateMazeDebugOutput(maze));
    return maze;
}

// =============================================================================
// BOUNDING BOX TESTING SYSTEM
// =============================================================================

// Layout constants - must match toSVG() exactly
const LAYOUT = {
    PAGE_WIDTH: 850,
    PAGE_HEIGHT: 1100,
    TITLE_AREA_HEIGHT: 70,
    QUEST_AREA_HEIGHT: 90,
    SIDE_MARGIN: 55,
    TOP_MARGIN: 15,
    BOTTOM_MARGIN: 15
};

// Get all layout regions as bounding boxes
function getLayoutRegions() {
    const { PAGE_WIDTH, PAGE_HEIGHT, TITLE_AREA_HEIGHT, QUEST_AREA_HEIGHT, SIDE_MARGIN, TOP_MARGIN, BOTTOM_MARGIN } = LAYOUT;

    const mazeAreaTop = TOP_MARGIN + TITLE_AREA_HEIGHT;
    const mazeAreaBottom = PAGE_HEIGHT - QUEST_AREA_HEIGHT - BOTTOM_MARGIN;

    return {
        page: { left: 0, top: 0, right: PAGE_WIDTH, bottom: PAGE_HEIGHT },
        titleArea: { left: SIDE_MARGIN, top: TOP_MARGIN, right: PAGE_WIDTH - SIDE_MARGIN, bottom: TOP_MARGIN + TITLE_AREA_HEIGHT },
        mazeArea: { left: SIDE_MARGIN, top: mazeAreaTop, right: PAGE_WIDTH - SIDE_MARGIN, bottom: mazeAreaBottom },
        questArea: { left: SIDE_MARGIN, top: mazeAreaBottom, right: PAGE_WIDTH - SIDE_MARGIN, bottom: PAGE_HEIGHT - BOTTOM_MARGIN },
        leftMargin: { left: 0, top: mazeAreaTop, right: SIDE_MARGIN, bottom: mazeAreaBottom },
        rightMargin: { left: PAGE_WIDTH - SIDE_MARGIN, top: mazeAreaTop, right: PAGE_WIDTH, bottom: mazeAreaBottom },
        topMargin: { left: SIDE_MARGIN, top: TOP_MARGIN + TITLE_AREA_HEIGHT - 15, right: PAGE_WIDTH - SIDE_MARGIN, bottom: mazeAreaTop },
        bottomMargin: { left: SIDE_MARGIN, top: mazeAreaBottom, right: PAGE_WIDTH - SIDE_MARGIN, bottom: mazeAreaBottom + 15 }
    };
}

// Find the best edge for placing a label near a room
// Returns: 'left', 'right', 'top', or 'bottom'
function findBestLabelPosition(maze, roomX, roomY, roomSize) {
    // Calculate room center in grid coordinates
    const roomCenterX = roomX + roomSize / 2;
    const roomCenterY = roomY + roomSize / 2;

    // Count unblocked cells to each edge
    function countToEdge(startX, startY, direction) {
        let count = 0;
        let x = startX, y = startY;

        while (true) {
            if (direction === 'left') x--;
            else if (direction === 'right') x++;
            else if (direction === 'top') y--;
            else if (direction === 'bottom') y++;

            // Check bounds
            if (x < 0 || x >= maze.width || y < 0 || y >= maze.height) break;

            // Check if cell is blocked (outside shape mask)
            if (maze.cells[y] && maze.cells[y][x] && maze.cells[y][x].blocked) {
                count++;
            } else {
                count++;
            }
        }
        return count;
    }

    // Calculate distances from room edge to maze edge
    const distToLeft = roomX;
    const distToRight = maze.width - (roomX + roomSize);
    const distToTop = roomY;
    const distToBottom = maze.height - (roomY + roomSize);

    // Find minimum distance (prefer horizontal for ties due to label readability)
    const distances = [
        { edge: 'left', dist: distToLeft, priority: 1 },
        { edge: 'right', dist: distToRight, priority: 2 },
        { edge: 'top', dist: distToTop, priority: 3 },
        { edge: 'bottom', dist: distToBottom, priority: 4 }
    ];

    // Sort by distance first, then by priority for ties
    distances.sort((a, b) => a.dist - b.dist || a.priority - b.priority);

    return distances[0].edge;
}

// Render an arrow pointing in any of 4 directions
function renderArrow(x, y, size, direction, color, strokeWidth) {
    const half = size / 2;
    let points;

    switch (direction) {
        case 'right':  // Arrow pointing right (→)
            points = `${x},${y - half} ${x + size},${y} ${x},${y + half}`;
            break;
        case 'left':   // Arrow pointing left (←)
            points = `${x + size},${y - half} ${x},${y} ${x + size},${y + half}`;
            break;
        case 'down':   // Arrow pointing down (↓)
            points = `${x - half},${y} ${x},${y + size} ${x + half},${y}`;
            break;
        case 'up':     // Arrow pointing up (↑)
            points = `${x - half},${y + size} ${x},${y} ${x + half},${y + size}`;
            break;
        default:
            points = `${x},${y - half} ${x + size},${y} ${x},${y + half}`; // default right
    }

    return `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// Check if two rectangles overlap (used by layout testing)
function rectsOverlap(r1, r2) {
    if (!r1 || !r2) return false;
    return !(r1.right <= r2.left || r1.left >= r2.right ||
             r1.bottom <= r2.top || r1.top >= r2.bottom);
}


// Calculate layout metrics for a maze (bounding boxes of all elements)
// Uses LAYOUT constants to match toSVG() exactly
function getLayoutMetrics(maze) {
    const { PAGE_WIDTH, PAGE_HEIGHT, TITLE_AREA_HEIGHT, QUEST_AREA_HEIGHT, SIDE_MARGIN, TOP_MARGIN, BOTTOM_MARGIN } = LAYOUT;

    // Calculate maze area (same logic as toSVG)
    const mazeAreaWidth = PAGE_WIDTH - SIDE_MARGIN * 2;
    const mazeAreaHeight = PAGE_HEIGHT - TITLE_AREA_HEIGHT - QUEST_AREA_HEIGHT - TOP_MARGIN - BOTTOM_MARGIN;

    // Cell size calculation (same as toSVG)
    const cellSize = Math.min(
        Math.floor(mazeAreaWidth / maze.width),
        Math.floor(mazeAreaHeight / maze.height)
    );
    const mazeWidth = maze.width * cellSize;
    const mazeHeight = maze.height * cellSize;

    // Center maze (same as toSVG)
    const mazeOffsetX = SIDE_MARGIN + (mazeAreaWidth - mazeWidth) / 2;
    const mazeOffsetY = TOP_MARGIN + TITLE_AREA_HEIGHT + (mazeAreaHeight - mazeHeight) / 2;

    const svgWidth = PAGE_WIDTH;
    const svgHeight = PAGE_HEIGHT;

    // Get layout regions
    const regions = getLayoutRegions();

    // Maze bounds
    const mazeBounds = {
        left: mazeOffsetX,
        top: mazeOffsetY,
        right: mazeOffsetX + mazeWidth,
        bottom: mazeOffsetY + mazeHeight
    };

    // Title bounds
    let titleBounds = null;
    if (maze.story && maze.story.title) {
        const maxTitleWidth = svgWidth - 120;
        let titleSize = Math.min(28, Math.max(16, Math.floor(mazeWidth / 10)));
        let titleWidth = VectorFont.measureText(maze.story.title, titleSize);
        while (titleWidth > maxTitleWidth && titleSize > 12) {
            titleSize -= 1;
            titleWidth = VectorFont.measureText(maze.story.title, titleSize);
        }
        const titleY = TOP_MARGIN + TITLE_AREA_HEIGHT / 2 + titleSize / 3;
        const titleX = (svgWidth - titleWidth) / 2;
        titleBounds = {
            left: titleX,
            top: titleY - titleSize,
            right: titleX + titleWidth,
            bottom: titleY,
            text: maze.story.title,
            size: titleSize
        };
    }

    // Quest bounds
    let questBounds = null;
    if (maze.story && maze.story.quest) {
        const QUEST_SIZE = 16;
        const questY = svgHeight - QUEST_AREA_HEIGHT + 20;
        const maxWidth = svgWidth - 80;

        // Calculate word wrap
        const words = maze.story.quest.split(' ');
        let lines = [];
        let currentLine = '';
        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const testWidth = VectorFont.measureText(testLine, QUEST_SIZE);
            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);

        // Find widest line and total height
        let maxLineWidth = 0;
        for (const line of lines.slice(0, 3)) {
            maxLineWidth = Math.max(maxLineWidth, VectorFont.measureText(line, QUEST_SIZE));
        }
        const numLines = Math.min(lines.length, 3);
        const lineSpacing = QUEST_SIZE + 6;
        const totalQuestHeight = numLines * lineSpacing;

        questBounds = {
            left: (svgWidth - maxLineWidth) / 2,
            top: questY,
            right: (svgWidth + maxLineWidth) / 2,
            bottom: questY + totalQuestHeight,
            lines: lines.slice(0, 3),
            size: QUEST_SIZE
        };
    }

    // START/END label bounds - text inside room, bottom aligned with room bottom
    let startBounds = null;
    let startRoomBounds = null;
    if (maze.startPos) {
        const roomSize = maze.startRoomSize || 2;
        const roomLeft = mazeOffsetX + maze.startPos.x * cellSize;
        const roomTop = mazeOffsetY + maze.startPos.y * cellSize;
        const roomWidth = roomSize * cellSize;
        const roomHeight = roomSize * cellSize;
        const roomBottom = roomTop + roomHeight;
        const roomCenterX = roomLeft + roomWidth / 2;

        // Calculate label size to fit in room (same formula as toSVG)
        const maxLabelWidth = roomWidth * 0.9;
        const labelSize = Math.min(roomHeight * 0.25, maxLabelWidth / 4);
        const labelWidth = VectorFont.measureText('START', labelSize);
        const labelY = roomBottom - 2;  // Bottom of text at room bottom minus small margin

        startRoomBounds = {
            left: roomLeft,
            top: roomTop,
            right: roomLeft + roomWidth,
            bottom: roomBottom
        };

        startBounds = {
            left: roomCenterX - labelWidth / 2,
            top: labelY - labelSize,
            right: roomCenterX + labelWidth / 2,
            bottom: labelY,
            size: labelSize,
            roomCenterX: roomCenterX,
            roomBottom: roomBottom
        };
    }

    let endBounds = null;
    let endRoomBounds = null;
    if (maze.endPos) {
        const roomSize = maze.endRoomSize || 2;
        const roomLeft = mazeOffsetX + maze.endPos.x * cellSize;
        const roomTop = mazeOffsetY + maze.endPos.y * cellSize;
        const roomWidth = roomSize * cellSize;
        const roomHeight = roomSize * cellSize;
        const roomBottom = roomTop + roomHeight;
        const roomCenterX = roomLeft + roomWidth / 2;

        // Calculate label size to fit in room (same formula as toSVG)
        const maxLabelWidth = roomWidth * 0.9;
        const labelSize = Math.min(roomHeight * 0.25, maxLabelWidth / 2.5);
        const labelWidth = VectorFont.measureText('END', labelSize);
        const labelY = roomBottom - 2;  // Bottom of text at room bottom minus small margin

        endRoomBounds = {
            left: roomLeft,
            top: roomTop,
            right: roomLeft + roomWidth,
            bottom: roomBottom
        };

        endBounds = {
            left: roomCenterX - labelWidth / 2,
            top: labelY - labelSize,
            right: roomCenterX + labelWidth / 2,
            bottom: labelY,
            size: labelSize,
            roomCenterX: roomCenterX,
            roomBottom: roomBottom
        };
    }

    return {
        svgWidth,
        svgHeight,
        cellSize,
        mazeOffsetX,
        mazeOffsetY,
        sidePadding: SIDE_MARGIN,
        topPadding: mazeOffsetY,
        bottomPadding: PAGE_HEIGHT - (mazeOffsetY + mazeHeight),
        regions,
        mazeBounds,
        titleBounds,
        questBounds,
        startBounds,
        endBounds,
        startRoomBounds,
        endRoomBounds
    };
}

// Check if rect A is fully inside rect B
function rectInside(inner, outer) {
    if (!inner || !outer) return true;
    return inner.left >= outer.left && inner.right <= outer.right &&
           inner.top >= outer.top && inner.bottom <= outer.bottom;
}

// Test bounding boxes for a single maze
function testMazeBoundingBoxes(maze) {
    const metrics = getLayoutMetrics(maze);
    const issues = [];

    // Check title within border and not overlapping maze
    if (metrics.titleBounds) {
        if (!rectInside(metrics.titleBounds, metrics.borderBounds)) {
            issues.push({
                element: 'title',
                type: 'outside_border',
                bounds: metrics.titleBounds,
                border: metrics.borderBounds,
                detail: `Title extends outside border: L${metrics.titleBounds.left.toFixed(1)} < ${metrics.borderBounds.left} or R${metrics.titleBounds.right.toFixed(1)} > ${metrics.borderBounds.right}`
            });
        }
        if (rectsOverlap(metrics.titleBounds, metrics.mazeBounds)) {
            issues.push({
                element: 'title',
                type: 'overlaps_maze',
                bounds: metrics.titleBounds,
                maze: metrics.mazeBounds,
                detail: `Title overlaps maze area`
            });
        }
    }

    // Check quest within border and not overlapping maze
    if (metrics.questBounds) {
        if (!rectInside(metrics.questBounds, metrics.borderBounds)) {
            issues.push({
                element: 'quest',
                type: 'outside_border',
                bounds: metrics.questBounds,
                border: metrics.borderBounds,
                detail: `Quest extends outside border: B${metrics.questBounds.bottom.toFixed(1)} > ${metrics.borderBounds.bottom}`
            });
        }
        if (rectsOverlap(metrics.questBounds, metrics.mazeBounds)) {
            issues.push({
                element: 'quest',
                type: 'overlaps_maze',
                bounds: metrics.questBounds,
                maze: metrics.mazeBounds,
                detail: `Quest overlaps maze area`
            });
        }
    }

    // Check START label is in the left margin (between SVG edge and maze)
    // Labels are intentionally in the margin, not inside the border bounds
    if (metrics.startBounds) {
        // START should be to the left of the maze
        if (metrics.startBounds.right > metrics.mazeBounds.left) {
            issues.push({
                element: 'start',
                type: 'overlaps_maze',
                bounds: metrics.startBounds,
                maze: metrics.mazeBounds,
                detail: `START label overlaps maze area`
            });
        }
        // START should not extend beyond SVG edges
        if (metrics.startBounds.left < 0 || metrics.startBounds.top < 0) {
            issues.push({
                element: 'start',
                type: 'outside_svg',
                bounds: metrics.startBounds,
                detail: `START extends outside SVG`
            });
        }
    }

    // Check END label is in the right margin (between maze and SVG edge)
    if (metrics.endBounds) {
        // END should be to the right of the maze
        if (metrics.endBounds.left < metrics.mazeBounds.right) {
            issues.push({
                element: 'end',
                type: 'overlaps_maze',
                bounds: metrics.endBounds,
                maze: metrics.mazeBounds,
                detail: `END label overlaps maze area`
            });
        }
        // END should not extend beyond SVG edges
        const svgWidth = metrics.mazeBounds.right + metrics.sidePadding;
        const svgHeight = metrics.mazeBounds.bottom + metrics.bottomPadding;
        if (metrics.endBounds.right > svgWidth || metrics.endBounds.bottom > svgHeight) {
            issues.push({
                element: 'end',
                type: 'outside_svg',
                bounds: metrics.endBounds,
                detail: `END extends outside SVG`
            });
        }
    }

    return {
        passed: issues.length === 0,
        issues,
        metrics
    };
}

// Test all maze configurations
function runBoundingBoxTests() {
    const themes = Object.keys(Themes);
    const shapes = Object.keys(ShapeMasks);
    const difficulties = [3, 5, 7, 10];
    const results = [];
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = [];

    console.log('='.repeat(70));
    console.log('BOUNDING BOX TEST SUITE');
    console.log('='.repeat(70));

    for (const themeName of themes) {
        for (const shape of shapes) {
            for (const difficulty of difficulties) {
                for (let seed = 1; seed <= 3; seed++) { // 3 seeds per config
                    totalTests++;
                    const gen = new MazeGenerator(seed * 1000 + difficulty);
                    const dims = {
                        3: { w: 5, h: 6 },
                        5: { w: 10, h: 13 },
                        7: { w: 17, h: 22 },
                        10: { w: 33, h: 43 }
                    }[difficulty];

                    const maze = gen.generate(dims.w, dims.h, 'recursive_backtracker', shape, themeName, false);
                    const storyGen = new StoryGenerator(new SeededRandom(seed * 1000 + difficulty));
                    maze.story = storyGen.generateQuest(themeName, difficulty);

                    const result = testMazeBoundingBoxes(maze);

                    if (result.passed) {
                        passedTests++;
                    } else {
                        failedTests.push({
                            config: `${themeName}/${shape}/L${difficulty}/S${seed}`,
                            issues: result.issues,
                            metrics: result.metrics
                        });
                    }
                }
            }
        }
    }

    console.log(`\nResults: ${passedTests}/${totalTests} passed`);

    if (failedTests.length > 0) {
        console.log(`\n${'!'.repeat(70)}`);
        console.log(`FAILURES (${failedTests.length}):`);
        console.log('!'.repeat(70));

        for (const fail of failedTests.slice(0, 20)) { // Show first 20 failures
            console.log(`\n[${fail.config}]`);
            console.log(`  SVG: ${fail.metrics.svgWidth}x${fail.metrics.svgHeight}`);
            console.log(`  Border: L${fail.metrics.borderBounds.left} T${fail.metrics.borderBounds.top} R${fail.metrics.borderBounds.right} B${fail.metrics.borderBounds.bottom}`);
            console.log(`  Maze: L${fail.metrics.mazeBounds.left} T${fail.metrics.mazeBounds.top} R${fail.metrics.mazeBounds.right} B${fail.metrics.mazeBounds.bottom}`);
            for (const issue of fail.issues) {
                console.log(`  ✗ ${issue.element}: ${issue.detail}`);
            }
        }

        if (failedTests.length > 20) {
            console.log(`\n... and ${failedTests.length - 20} more failures`);
        }
    }

    // Analyze failure patterns
    if (failedTests.length > 0) {
        console.log('\n' + '='.repeat(70));
        console.log('FAILURE ANALYSIS');
        console.log('='.repeat(70));

        const byElement = {};
        const byType = {};
        for (const fail of failedTests) {
            for (const issue of fail.issues) {
                byElement[issue.element] = (byElement[issue.element] || 0) + 1;
                byType[issue.type] = (byType[issue.type] || 0) + 1;
            }
        }

        console.log('\nBy Element:');
        for (const [elem, count] of Object.entries(byElement).sort((a, b) => b[1] - a[1])) {
            console.log(`  ${elem}: ${count} failures`);
        }

        console.log('\nBy Type:');
        for (const [type, count] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
            console.log(`  ${type}: ${count} failures`);
        }
    }

    return { totalTests, passedTests, failedTests };
}

// Generate batch of stories for review and enhancement
function generateStoryBatch(themeName, count = 100, seed = Date.now()) {
    const rng = new SeededRandom(seed);
    const storyGen = new StoryGenerator(rng);
    const stories = [];

    for (let i = 0; i < count; i++) {
        const difficulty = 1 + (i % 10);
        const story = storyGen.generateQuest(themeName, difficulty);
        stories.push({
            id: i + 1,
            difficulty,
            ...story
        });
    }

    return stories;
}

// Format stories for review (text output)
function formatStoriesForReview(stories) {
    const lines = [];
    lines.push('STORY GENERATION REVIEW');
    lines.push('=' .repeat(70));
    lines.push(`Total: ${stories.length} stories\n`);

    for (const s of stories) {
        lines.push(`[${s.id}] Difficulty ${s.difficulty} (${s.templateType})`);
        lines.push(`  Title: ${s.title}`);
        lines.push(`  Quest: ${s.quest}`);
        if (s.items.length > 0) {
            lines.push(`  Items: ${s.items.join(', ')}`);
        }
        lines.push('');
    }

    return lines.join('\n');
}

// Add enhanced sentence to cache (call this with reviewed/improved sentences)
function addEnhancedSentence(original, enhanced) {
    EnhancedSentenceCache.add(original, enhanced);
}

// Export for browser use
if (typeof window !== 'undefined') {
    window.MazeGenerator = MazeGenerator;
    window.StoryGenerator = StoryGenerator;
    window.CompactMazeEncoder = CompactMazeEncoder;
    window.generateMazeDebugOutput = generateMazeDebugOutput;
    window.generateStoryBatch = generateStoryBatch;
    window.formatStoriesForReview = formatStoriesForReview;
    window.addEnhancedSentence = addEnhancedSentence;
    window.ThemeVocabulary = ThemeVocabulary;
    window.EnhancedSentenceCache = EnhancedSentenceCache;
    window.CharacterArt = CharacterArt;
    window.GoalArt = GoalArt;
    window.Themes = Themes;
    window.ShapeMasks = ShapeMasks;
    window.runMazeTests = runMazeTests;
    window.testMaze = testMaze;
    window.getLayoutMetrics = getLayoutMetrics;
    window.testMazeBoundingBoxes = testMazeBoundingBoxes;
    window.runBoundingBoxTests = runBoundingBoxTests;
    // Layout system exports
    window.LAYOUT = LAYOUT;
    window.getLayoutRegions = getLayoutRegions;
    window.findBestLabelPosition = findBestLabelPosition;
    window.renderArrow = renderArrow;
    window.rectsOverlap = rectsOverlap;
    // Difficulty scaling exports
    window.MASK_FILL_PERCENTAGES = MASK_FILL_PERCENTAGES;
    window.BASE_SIZES = BASE_SIZES;
    window.getMaskFillPercentage = getMaskFillPercentage;
    window.findOptimalDimensions = findOptimalDimensions;
    window.SeededRandom = SeededRandom;
    // Performance timing flag - set window.MAZE_PERF_TIMING = true to enable
    window.MAZE_PERF_TIMING = false;
}
