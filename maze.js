/**
 * MazeJS - Client-Side Maze Generator with Themes & Shapes
 * Deterministic generation with seeded random
 */

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
    renderText(text, x, y, height, color = '#000', strokeWidth = 1.5) {
        const scale = height / this.charHeight;
        const charW = this.charWidth * scale;
        const spacing = charW * 0.2;
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
    measureText(text, height) {
        const scale = height / this.charHeight;
        const charW = this.charWidth * scale;
        const spacing = charW * 0.2;
        return text.length * (charW + spacing) - spacing;
    },

    // Render text centered at position
    renderCentered(text, centerX, y, height, color = '#000', strokeWidth = 1.5) {
        const width = this.measureText(text, height);
        return this.renderText(text, centerX - width / 2, y, height, color, strokeWidth);
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
        character: 'explorer',
        characterName: 'explorer',  // Name used in stories
        goal: 'treasure',
        goalName: 'treasure'  // Name used in stories
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
        character: 'diver',
        characterName: 'diver',
        goal: 'treasureChest',
        goalName: 'treasure chest'
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
        character: 'astronaut',
        characterName: 'astronaut',
        goal: 'spaceStation',
        goalName: 'space station'
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
        character: 'bee',
        characterName: 'bee',
        goal: 'beehive',
        goalName: 'beehive'
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
        character: 'gingerbread',
        characterName: 'gingerbread kid',
        goal: 'candyCastle',
        goalName: 'candy castle'
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
        character: 'jungleKid',
        characterName: 'explorer',
        goal: 'temple',
        goalName: 'hidden temple'
    }
};

// Art generators (SVG drawing instructions)
const ArtGenerators = {
    fish: (x, y, size, rng) => {
        const s = size * 0.8;
        const flip = rng.next() > 0.5 ? 1 : -1;
        return `<g transform="translate(${x},${y}) scale(${flip},1)">
            <ellipse cx="0" cy="0" rx="${s*0.4}" ry="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <path d="M${s*0.35},0 L${s*0.55},${-s*0.2} L${s*0.55},${s*0.2} Z" fill="none" stroke="currentColor" stroke-width="1.5"/>
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
        return `<path d="${curves.join(' ')}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    },

    shell: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<path d="M${x-s},${y+s*0.3} Q${x},${y-s} ${x+s},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
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
        return `<circle cx="${x}" cy="${y}" r="${s}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x}" cy="${y}" rx="${s*1.5}" ry="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1" transform="rotate(${rng.nextInt(-30,30)},${x},${y})"/>`;
    },

    rocket: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<path d="M${x},${y-s} L${x+s*0.3},${y+s*0.3} L${x+s*0.15},${y+s*0.3} L${x+s*0.15},${y+s*0.5} L${x-s*0.15},${y+s*0.5} L${x-s*0.15},${y+s*0.3} L${x-s*0.3},${y+s*0.3} Z" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    },

    moon: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<path d="M${x+s*0.3},${y-s} A${s},${s} 0 1,0 ${x+s*0.3},${y+s} A${s*0.7},${s*0.7} 0 1,1 ${x+s*0.3},${y-s}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
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
        return petals.join('') + `<circle cx="${x}" cy="${y}" r="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    },

    butterfly: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<ellipse cx="${x-s*0.4}" cy="${y-s*0.2}" rx="${s*0.35}" ry="${s*0.45}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x+s*0.4}" cy="${y-s*0.2}" rx="${s*0.35}" ry="${s*0.45}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x-s*0.3}" cy="${y+s*0.3}" rx="${s*0.25}" ry="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.3}" cy="${y+s*0.3}" rx="${s*0.25}" ry="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.5}" x2="${x}" y2="${y+s*0.5}" stroke="currentColor" stroke-width="1.5"/>`;
    },

    bee: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.5}" ry="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.15}" y1="${y-s*0.35}" x2="${x-s*0.15}" y2="${y+s*0.35}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.15}" y1="${y-s*0.35}" x2="${x+s*0.15}" y2="${y+s*0.35}" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x-s*0.2}" cy="${y-s*0.5}" rx="${s*0.3}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.2}" cy="${y-s*0.5}" rx="${s*0.3}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    leaf: (x, y, size, rng) => {
        const s = size * 0.4;
        const angle = rng.nextInt(-30, 30);
        return `<g transform="rotate(${angle},${x},${y})">
            <path d="M${x},${y-s} Q${x+s*0.5},${y} ${x},${y+s} Q${x-s*0.5},${y} ${x},${y-s}" fill="none" stroke="currentColor" stroke-width="1.5"/>
            <line x1="${x}" y1="${y-s*0.8}" x2="${x}" y2="${y+s*0.8}" stroke="currentColor" stroke-width="1"/>
        </g>`;
    },

    lollipop: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<circle cx="${x}" cy="${y-s*0.3}" r="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x}" y1="${y+s*0.2}" x2="${x}" y2="${y+s}" stroke="currentColor" stroke-width="2"/>
                <path d="M${x-s*0.3},${y-s*0.3} Q${x},${y-s*0.6} ${x+s*0.3},${y-s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    cupcake: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<path d="M${x-s*0.4},${y} L${x-s*0.3},${y+s*0.5} L${x+s*0.3},${y+s*0.5} L${x+s*0.4},${y}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.4},${y} Q${x-s*0.3},${y-s*0.4} ${x},${y-s*0.3} Q${x+s*0.3},${y-s*0.4} ${x+s*0.4},${y}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x}" cy="${y-s*0.5}" r="${s*0.15}" fill="currentColor"/>`;
    },

    heart: (x, y, size, rng) => {
        const s = size * 0.3;
        return `<path d="M${x},${y+s*0.3} C${x-s*0.8},${y-s*0.3} ${x-s*0.5},${y-s} ${x},${y-s*0.3} C${x+s*0.5},${y-s} ${x+s*0.8},${y-s*0.3} ${x},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    },

    palm: (x, y, size, rng) => {
        const s = size * 0.45;
        let svg = `<line x1="${x}" y1="${y+s}" x2="${x}" y2="${y-s*0.2}" stroke="currentColor" stroke-width="2"/>`;
        for (let i = 0; i < 5; i++) {
            const angle = -60 + i * 30;
            svg += `<path d="M${x},${y-s*0.2} Q${x + Math.cos(angle*Math.PI/180)*s*0.8},${y-s*0.5} ${x + Math.cos(angle*Math.PI/180)*s},${y-s*0.3 + Math.sin(angle*Math.PI/180)*s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
        }
        return svg;
    },

    bird: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<path d="M${x-s},${y} Q${x-s*0.3},${y-s*0.5} ${x},${y} Q${x+s*0.3},${y-s*0.5} ${x+s},${y}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    },

    monkey: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<circle cx="${x}" cy="${y}" r="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x-s*0.5}" cy="${y}" r="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.5}" cy="${y}" r="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.15}" cy="${y-s*0.1}" r="${s*0.08}" fill="currentColor"/>
                <circle cx="${x+s*0.15}" cy="${y-s*0.1}" r="${s*0.08}" fill="currentColor"/>
                <path d="M${x-s*0.15},${y+s*0.15} Q${x},${y+s*0.25} ${x+s*0.15},${y+s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    snake: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<path d="M${x-s},${y} Q${x-s*0.5},${y-s*0.3} ${x},${y} Q${x+s*0.5},${y+s*0.3} ${x+s},${y}" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="${x+s*0.9}" cy="${y-s*0.05}" r="${s*0.08}" fill="currentColor"/>`;
    },

    // Classic theme decorations
    compass: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<circle cx="${x}" cy="${y}" r="${s}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x}" cy="${y}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.9}" x2="${x}" y2="${y-s*0.3}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x}" y1="${y+s*0.3}" x2="${x}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.9}" y1="${y}" x2="${x-s*0.3}" y2="${y}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.3}" y1="${y}" x2="${x+s*0.9}" y2="${y}" stroke="currentColor" stroke-width="1"/>
                <polygon points="${x},${y-s*0.7} ${x-s*0.15},${y} ${x+s*0.15},${y}" fill="currentColor"/>`;
    },

    torch: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.15}" y="${y-s*0.2}" width="${s*0.3}" height="${s*0.8}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.3},${y-s*0.2} L${x},${y-s*0.8} L${x+s*0.3},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x}" cy="${y-s*0.5}" rx="${s*0.15}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    key: (x, y, size, rng) => {
        const s = size * 0.4;
        return `<circle cx="${x-s*0.3}" cy="${y}" r="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x-s*0.3}" cy="${y}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y}" x2="${x+s*0.7}" y2="${y}" stroke="currentColor" stroke-width="2"/>
                <line x1="${x+s*0.4}" y1="${y}" x2="${x+s*0.4}" y2="${y+s*0.25}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.6}" y1="${y}" x2="${x+s*0.6}" y2="${y+s*0.2}" stroke="currentColor" stroke-width="1.5"/>`;
    },

    coin: (x, y, size, rng) => {
        const s = size * 0.35;
        return `<circle cx="${x}" cy="${y}" r="${s}" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="${x}" cy="${y}" r="${s*0.7}" fill="none" stroke="currentColor" stroke-width="1"/>
                <text x="${x}" y="${y+s*0.25}" font-size="${s*0.8}" text-anchor="middle" fill="currentColor" style="font-family:serif;font-weight:bold">$</text>`;
    }
};

// =============================================================================
// CHARACTER ART GENERATORS - Theme-specific characters for start room
// =============================================================================

const CharacterArt = {
    // Classic theme
    explorer: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.5}" r="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.4},${y-s*0.85} L${x-s*0.5},${y-s*0.5} L${x+s*0.5},${y-s*0.5} L${x+s*0.4},${y-s*0.85}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x}" y1="${y-s*0.15}" x2="${x}" y2="${y+s*0.5}" stroke="currentColor" stroke-width="2"/>
                <line x1="${x-s*0.35}" y1="${y+s*0.1}" x2="${x+s*0.35}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.15}" y1="${y+s*0.5}" x2="${x-s*0.25}" y2="${y+s}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.15}" y1="${y+s*0.5}" x2="${x+s*0.25}" y2="${y+s}" stroke="currentColor" stroke-width="1.5"/>`;
    },

    // Ocean theme
    diver: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.4}" r="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <rect x="${x-s*0.25}" y="${y-s*0.6}" width="${s*0.5}" height="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y+s*0.2}" rx="${s*0.3}" ry="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x+s*0.5}" cy="${y-s*0.2}" rx="${s*0.15}" ry="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.25},${y+s*0.6} L${x-s*0.4},${y+s} L${x-s*0.1},${y+s}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x+s*0.25},${y+s*0.6} L${x+s*0.4},${y+s} L${x+s*0.1},${y+s}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    },

    mermaid: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.6}" r="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.3},${y-s*0.8} Q${x-s*0.5},${y-s} ${x-s*0.3},${y-s*0.6}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.3},${y-s*0.8} Q${x+s*0.5},${y-s} ${x+s*0.3},${y-s*0.6}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y}" rx="${s*0.25}" ry="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x},${y+s*0.35} Q${x-s*0.2},${y+s*0.6} ${x},${y+s*0.8} Q${x+s*0.2},${y+s} ${x+s*0.4},${y+s*0.7}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x+s*0.3},${y+s*0.8} L${x+s*0.5},${y+s*0.6} M${x+s*0.3},${y+s*0.8} L${x+s*0.5},${y+s}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Space theme
    astronaut: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.5}" r="${s*0.45}" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="${x}" cy="${y-s*0.5}" r="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.35}" y="${y}" width="${s*0.7}" height="${s*0.7}" rx="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <rect x="${x-s*0.55}" y="${y+s*0.1}" width="${s*0.2}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x+s*0.35}" y="${y+s*0.1}" width="${s*0.2}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.2}" y1="${y+s*0.7}" x2="${x-s*0.2}" y2="${y+s}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.2}" y1="${y+s*0.7}" x2="${x+s*0.2}" y2="${y+s}" stroke="currentColor" stroke-width="1.5"/>`;
    },

    robot: (x, y, size) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.35}" y="${y-s*0.8}" width="${s*0.7}" height="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x}" y1="${y-s}" x2="${x}" y2="${y-s*0.8}" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x}" cy="${y-s*1.1}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.15}" cy="${y-s*0.6}" r="${s*0.08}" fill="currentColor"/>
                <circle cx="${x+s*0.15}" cy="${y-s*0.6}" r="${s*0.08}" fill="currentColor"/>
                <rect x="${x-s*0.3}" y="${y-s*0.25}" width="${s*0.6}" height="${s*0.6}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.3}" y1="${y}" x2="${x-s*0.5}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.3}" y1="${y}" x2="${x+s*0.5}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.15}" y1="${y+s*0.35}" x2="${x-s*0.15}" y2="${y+s*0.7}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.15}" y1="${y+s*0.35}" x2="${x+s*0.15}" y2="${y+s*0.7}" stroke="currentColor" stroke-width="1.5"/>`;
    },

    // Garden theme
    gardener: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.5}" r="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.45},${y-s*0.7} Q${x},${y-s} ${x+s*0.45},${y-s*0.7}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x}" y1="${y-s*0.2}" x2="${x}" y2="${y+s*0.4}" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x},${y} L${x+s*0.5},${y-s*0.2}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.5}" y1="${y-s*0.4}" x2="${x+s*0.5}" y2="${y+s*0.2}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.15}" y1="${y+s*0.4}" x2="${x-s*0.25}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.15}" y1="${y+s*0.4}" x2="${x+s*0.25}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1.5"/>`;
    },

    // Candy theme
    gingerbread: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.55}" r="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x-s*0.12}" cy="${y-s*0.6}" r="${s*0.06}" fill="currentColor"/>
                <circle cx="${x+s*0.12}" cy="${y-s*0.6}" r="${s*0.06}" fill="currentColor"/>
                <path d="M${x-s*0.1},${y-s*0.4} Q${x},${y-s*0.3} ${x+s*0.1},${y-s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y+s*0.15}" rx="${s*0.3}" ry="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x}" cy="${y}" r="${s*0.06}" fill="currentColor"/>
                <circle cx="${x}" cy="${y+s*0.2}" r="${s*0.06}" fill="currentColor"/>
                <line x1="${x-s*0.3}" y1="${y}" x2="${x-s*0.55}" y2="${y+s*0.15}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.3}" y1="${y}" x2="${x+s*0.55}" y2="${y+s*0.15}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.15}" y1="${y+s*0.5}" x2="${x-s*0.2}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.15}" y1="${y+s*0.5}" x2="${x+s*0.2}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1.5"/>`;
    },

    // Jungle theme
    jungleKid: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.5}" r="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.3},${y-s*0.7} Q${x-s*0.4},${y-s*0.5} ${x-s*0.2},${y-s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.3},${y-s*0.7} Q${x+s*0.4},${y-s*0.5} ${x+s*0.2},${y-s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.2}" x2="${x}" y2="${y+s*0.4}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.3}" y1="${y}" x2="${x+s*0.3}" y2="${y}" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.3},${y} L${x-s*0.45},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.3}" y1="${y}" x2="${x+s*0.5}" y2="${y-s*0.1}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.5}" y1="${y-s*0.3}" x2="${x+s*0.5}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.12}" y1="${y+s*0.4}" x2="${x-s*0.2}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.12}" y1="${y+s*0.4}" x2="${x+s*0.2}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1.5"/>`;
    },

    // Additional Ocean characters
    sailor: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.5}" r="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x}" cy="${y-s*0.85}" rx="${s*0.35}" ry="${s*0.12}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.35}" y1="${y-s*0.85}" x2="${x+s*0.35}" y2="${y-s*0.85}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y-s*0.2}" x2="${x}" y2="${y+s*0.5}" stroke="currentColor" stroke-width="2"/>
                <path d="M${x-s*0.35},${y-s*0.1} L${x},${y+s*0.1} L${x+s*0.35},${y-s*0.1}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.15}" y1="${y+s*0.5}" x2="${x-s*0.25}" y2="${y+s}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.15}" y1="${y+s*0.5}" x2="${x+s*0.25}" y2="${y+s}" stroke="currentColor" stroke-width="1.5"/>`;
    },

    seaTurtle: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.6}" ry="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x}" cy="${y}" rx="${s*0.45}" ry="${s*0.28}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.2}" y1="${y-s*0.1}" x2="${x+s*0.2}" y2="${y-s*0.1}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.2}" y1="${y+s*0.1}" x2="${x+s*0.2}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.7}" cy="${y-s*0.1}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x+s*0.75}" cy="${y-s*0.15}" r="${s*0.03}" fill="currentColor"/>
                <ellipse cx="${x-s*0.5}" cy="${y-s*0.35}" rx="${s*0.2}" ry="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x-s*0.5}" cy="${y+s*0.35}" rx="${s*0.2}" ry="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.4}" cy="${y-s*0.35}" rx="${s*0.15}" ry="${s*0.08}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.4}" cy="${y+s*0.35}" rx="${s*0.15}" ry="${s*0.08}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Garden characters
    bee: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.35}" ry="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.15}" y1="${y-s*0.15}" x2="${x-s*0.15}" y2="${y+s*0.15}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.1}" y1="${y-s*0.15}" x2="${x+s*0.1}" y2="${y+s*0.15}" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x+s*0.45}" cy="${y}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x+s*0.5}" cy="${y-s*0.03}" r="${s*0.03}" fill="currentColor"/>
                <ellipse cx="${x-s*0.1}" cy="${y-s*0.4}" rx="${s*0.25}" ry="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.15}" cy="${y-s*0.4}" rx="${s*0.25}" ry="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.35}" y1="${y+s*0.1}" x2="${x+s*0.5}" y2="${y+s*0.25}" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.55},${y-s*0.15} Q${x+s*0.65},${y-s*0.3} ${x+s*0.5},${y-s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.55},${y-s*0.15} Q${x+s*0.7},${y-s*0.2} ${x+s*0.6},${y-s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    butterfly: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.1}" ry="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x-s*0.4}" cy="${y-s*0.2}" rx="${s*0.35}" ry="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x+s*0.4}" cy="${y-s*0.2}" rx="${s*0.35}" ry="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x-s*0.35}" cy="${y+s*0.35}" rx="${s*0.25}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x+s*0.35}" cy="${y+s*0.35}" rx="${s*0.25}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x-s*0.4}" cy="${y-s*0.2}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.4}" cy="${y-s*0.2}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.05},${y-s*0.4} Q${x-s*0.2},${y-s*0.7} ${x-s*0.15},${y-s*0.8}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.05},${y-s*0.4} Q${x+s*0.2},${y-s*0.7} ${x+s*0.15},${y-s*0.8}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    ladybug: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.5}" ry="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x}" y1="${y-s*0.4}" x2="${x}" y2="${y+s*0.4}" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x+s*0.55}" cy="${y-s*0.15}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1.5"/>
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
        return `<circle cx="${x}" cy="${y-s*0.4}" r="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x-s*0.4}" cy="${y-s*0.4}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.4}" cy="${y-s*0.4}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.12}" cy="${y-s*0.45}" r="${s*0.05}" fill="currentColor"/>
                <circle cx="${x+s*0.12}" cy="${y-s*0.45}" r="${s*0.05}" fill="currentColor"/>
                <ellipse cx="${x}" cy="${y-s*0.25}" rx="${s*0.15}" ry="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y+s*0.2}" rx="${s*0.25}" ry="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.25},${y+s*0.1} Q${x-s*0.5},${y} ${x-s*0.55},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x+s*0.25},${y+s*0.1} Q${x+s*0.5},${y} ${x+s*0.55},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x},${y+s*0.5} Q${x+s*0.3},${y+s*0.7} ${x+s*0.5},${y+s*0.5} Q${x+s*0.6},${y+s*0.3} ${x+s*0.4},${y+s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    },

    parrot: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.3}" ry="${s*0.45}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x+s*0.15}" cy="${y-s*0.55}" r="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x+s*0.22}" cy="${y-s*0.58}" r="${s*0.05}" fill="currentColor"/>
                <path d="M${x+s*0.35},${y-s*0.5} L${x+s*0.55},${y-s*0.45} L${x+s*0.35},${y-s*0.55}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.05},${y-s*0.75} Q${x+s*0.1},${y-s*0.95} ${x+s*0.3},${y-s*0.85}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x+s*0.05},${y-s*0.75} Q${x+s*0.2},${y-s*1} ${x+s*0.4},${y-s*0.85}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x-s*0.15},${y+s*0.45} L${x-s*0.25},${y+s*0.9}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x+s*0.15},${y+s*0.45} L${x+s*0.25},${y+s*0.9}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x},${y+s*0.45} Q${x-s*0.1},${y+s*0.7} ${x-s*0.3},${y+s} Q${x},${y+s*1.1} ${x+s*0.3},${y+s}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    },

    // Additional Candy characters
    candyFairy: (x, y, size) => {
        const s = size * 0.4;
        return `<circle cx="${x}" cy="${y-s*0.5}" r="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.15},${y-s*0.7} Q${x-s*0.3},${y-s*0.9} ${x-s*0.1},${y-s*0.85}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.15},${y-s*0.7} Q${x+s*0.3},${y-s*0.9} ${x+s*0.1},${y-s*0.85}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x},${y-s*0.25} L${x},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.15},${y+s*0.4} L${x},${y-s*0.1} L${x+s*0.15},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x-s*0.45}" cy="${y-s*0.2}" rx="${s*0.3}" ry="${s*0.15}" transform="rotate(-30 ${x-s*0.45} ${y-s*0.2})" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x+s*0.45}" cy="${y-s*0.2}" rx="${s*0.3}" ry="${s*0.15}" transform="rotate(30 ${x+s*0.45} ${y-s*0.2})" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x}" y1="${y+s*0.4}" x2="${x}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x}" cy="${y+s*1}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Space characters
    alien: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y-s*0.4}" rx="${s*0.4}" ry="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x-s*0.2}" cy="${y-s*0.5}" rx="${s*0.15}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x+s*0.2}" cy="${y-s*0.5}" rx="${s*0.15}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x-s*0.2}" cy="${y-s*0.5}" r="${s*0.05}" fill="currentColor"/>
                <circle cx="${x+s*0.2}" cy="${y-s*0.5}" r="${s*0.05}" fill="currentColor"/>
                <ellipse cx="${x}" cy="${y+s*0.3}" rx="${s*0.2}" ry="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.2}" y1="${y+s*0.2}" x2="${x-s*0.45}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.2}" y1="${y+s*0.2}" x2="${x+s*0.45}" y2="${y+s*0.1}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.1}" y1="${y+s*0.55}" x2="${x-s*0.15}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.1}" y1="${y+s*0.55}" x2="${x+s*0.15}" y2="${y+s*0.9}" stroke="currentColor" stroke-width="1.5"/>`;
    }
};

// =============================================================================
// GOAL ART GENERATORS - Theme-specific goals for end room
// =============================================================================

const GoalArt = {
    // Classic theme
    treasure: (x, y, size) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.5}" y="${y-s*0.1}" width="${s}" height="${s*0.7}" rx="${s*0.05}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.5},${y-s*0.1} Q${x-s*0.55},${y-s*0.4} ${x-s*0.3},${y-s*0.5} L${x+s*0.3},${y-s*0.5} Q${x+s*0.55},${y-s*0.4} ${x+s*0.5},${y-s*0.1}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.5}" y1="${y+s*0.15}" x2="${x+s*0.5}" y2="${y+s*0.15}" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x}" cy="${y+s*0.15}" r="${s*0.12}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    },

    // Ocean theme
    treasureChest: (x, y, size) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.6}" y="${y}" width="${s*1.2}" height="${s*0.7}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.6},${y} Q${x-s*0.65},${y-s*0.3} ${x-s*0.4},${y-s*0.4} L${x+s*0.4},${y-s*0.4} Q${x+s*0.65},${y-s*0.3} ${x+s*0.6},${y}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.6}" y1="${y+s*0.25}" x2="${x+s*0.6}" y2="${y+s*0.25}" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.1}" y="${y+s*0.1}" width="${s*0.2}" height="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x-s*0.3}" cy="${y-s*0.55}" r="${s*0.1}" fill="currentColor"/>
                <circle cx="${x+s*0.2}" cy="${y-s*0.6}" r="${s*0.08}" fill="currentColor"/>
                <circle cx="${x}" cy="${y-s*0.5}" r="${s*0.12}" fill="currentColor"/>`;
    },

    // Space theme
    spaceStation: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.6}" ry="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <rect x="${x-s*0.15}" y="${y-s*0.6}" width="${s*0.3}" height="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <rect x="${x-s*0.15}" y="${y+s*0.1}" width="${s*0.3}" height="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1.5"/>
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
            svg += `<ellipse cx="${x}" cy="${yy}" rx="${w}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
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
        return `<rect x="${x-s*0.5}" y="${y-s*0.2}" width="${s}" height="${s*0.8}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <rect x="${x-s*0.7}" y="${y-s*0.6}" width="${s*0.35}" height="${s*0.9}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <rect x="${x+s*0.35}" y="${y-s*0.6}" width="${s*0.35}" height="${s*0.9}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.7},${y-s*0.6} L${x-s*0.52},${y-s*0.9} L${x-s*0.35},${y-s*0.6}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x+s*0.35},${y-s*0.6} L${x+s*0.52},${y-s*0.9} L${x+s*0.7},${y-s*0.6}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x-s*0.52}" cy="${y-s*0.95}" r="${s*0.08}" fill="currentColor"/>
                <circle cx="${x+s*0.52}" cy="${y-s*0.95}" r="${s*0.08}" fill="currentColor"/>
                <rect x="${x-s*0.12}" y="${y+s*0.2}" width="${s*0.24}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Jungle theme
    temple: (x, y, size) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.6}" y="${y+s*0.2}" width="${s*1.2}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <rect x="${x-s*0.45}" y="${y-s*0.1}" width="${s*0.9}" height="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <rect x="${x-s*0.3}" y="${y-s*0.35}" width="${s*0.6}" height="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.35},${y-s*0.35} L${x},${y-s*0.7} L${x+s*0.35},${y-s*0.35}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <rect x="${x-s*0.08}" y="${y+s*0.3}" width="${s*0.16}" height="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.6}" y1="${y+s*0.35}" x2="${x-s*0.6}" y2="${y+s*0.6}" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x+s*0.6}" y1="${y+s*0.35}" x2="${x+s*0.6}" y2="${y+s*0.6}" stroke="currentColor" stroke-width="1.5"/>`;
    },

    // Additional Ocean goals
    coralPalace: (x, y, size) => {
        const s = size * 0.4;
        return `<path d="M${x-s*0.6},${y+s*0.5} L${x-s*0.6},${y-s*0.2} Q${x-s*0.5},${y-s*0.5} ${x-s*0.3},${y-s*0.4} L${x-s*0.3},${y+s*0.5}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x+s*0.6},${y+s*0.5} L${x+s*0.6},${y-s*0.2} Q${x+s*0.5},${y-s*0.5} ${x+s*0.3},${y-s*0.4} L${x+s*0.3},${y+s*0.5}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.3},${y-s*0.4} Q${x},${y-s*0.8} ${x+s*0.3},${y-s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x}" cy="${y-s*0.5}" rx="${s*0.15}" ry="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.1}" y="${y+s*0.1}" width="${s*0.2}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.45}" cy="${y+s*0.3}" r="${s*0.08}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.45}" cy="${y+s*0.2}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    sunkenShip: (x, y, size) => {
        const s = size * 0.4;
        return `<path d="M${x-s*0.7},${y+s*0.4} Q${x-s*0.6},${y+s*0.6} ${x},${y+s*0.5} Q${x+s*0.6},${y+s*0.4} ${x+s*0.7},${y+s*0.5}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.5},${y+s*0.3} L${x-s*0.4},${y-s*0.1} L${x+s*0.3},${y-s*0.1} L${x+s*0.5},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x-s*0.1}" y1="${y-s*0.1}" x2="${x-s*0.1}" y2="${y-s*0.7}" stroke="currentColor" stroke-width="2"/>
                <path d="M${x-s*0.1},${y-s*0.65} L${x+s*0.3},${y-s*0.45} L${x+s*0.3},${y-s*0.25} L${x-s*0.1},${y-s*0.4}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.1}" y1="${y-s*0.5}" x2="${x+s*0.3}" y2="${y-s*0.35}" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.3}" cy="${y+s*0.1}" r="${s*0.08}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.15}" cy="${y+s*0.15}" r="${s*0.06}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Space goals
    warpGate: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y}" rx="${s*0.7}" ry="${s*0.9}" fill="none" stroke="currentColor" stroke-width="2"/>
                <ellipse cx="${x}" cy="${y}" rx="${s*0.55}" ry="${s*0.7}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x}" cy="${y}" rx="${s*0.4}" ry="${s*0.5}" fill="none" stroke="currentColor" stroke-width="1"/>
                <ellipse cx="${x}" cy="${y}" rx="${s*0.2}" ry="${s*0.25}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x-s*0.5}" cy="${y-s*0.6}" r="${s*0.08}" fill="currentColor"/>
                <circle cx="${x+s*0.55}" cy="${y-s*0.5}" r="${s*0.06}" fill="currentColor"/>
                <circle cx="${x+s*0.4}" cy="${y+s*0.7}" r="${s*0.07}" fill="currentColor"/>
                <circle cx="${x-s*0.45}" cy="${y+s*0.65}" r="${s*0.05}" fill="currentColor"/>`;
    },

    moonBase: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y+s*0.5}" rx="${s*0.8}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.4},${y+s*0.4} L${x-s*0.4},${y} Q${x-s*0.4},${y-s*0.3} ${x-s*0.2},${y-s*0.3} L${x+s*0.2},${y-s*0.3} Q${x+s*0.4},${y-s*0.3} ${x+s*0.4},${y} L${x+s*0.4},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x}" cy="${y-s*0.5}" r="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x}" y1="${y-s*0.3}" x2="${x}" y2="${y-s*0.7}" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x-s*0.2}" cy="${y+s*0.1}" r="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.2}" cy="${y+s*0.15}" r="${s*0.08}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x-s*0.65}" y="${y+s*0.2}" width="${s*0.2}" height="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>
                <rect x="${x+s*0.45}" y="${y+s*0.2}" width="${s*0.2}" height="${s*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    rocketShip: (x, y, size) => {
        const s = size * 0.4;
        return `<path d="M${x},${y-s*0.9} Q${x-s*0.3},${y-s*0.6} ${x-s*0.3},${y+s*0.3} L${x+s*0.3},${y+s*0.3} Q${x+s*0.3},${y-s*0.6} ${x},${y-s*0.9}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x}" cy="${y-s*0.3}" r="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.3},${y+s*0.1} L${x-s*0.5},${y+s*0.5} L${x-s*0.3},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x+s*0.3},${y+s*0.1} L${x+s*0.5},${y+s*0.5} L${x+s*0.3},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.15},${y+s*0.3} L${x-s*0.2},${y+s*0.7} Q${x},${y+s*0.9} ${x+s*0.2},${y+s*0.7} L${x+s*0.15},${y+s*0.3}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
    },

    // Additional Garden goals
    mushroomHouse: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y-s*0.2}" rx="${s*0.6}" ry="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <rect x="${x-s*0.25}" y="${y-s*0.1}" width="${s*0.5}" height="${s*0.7}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="${x-s*0.25}" cy="${y-s*0.35}" r="${s*0.12}" fill="currentColor"/>
                <circle cx="${x+s*0.2}" cy="${y-s*0.25}" r="${s*0.1}" fill="currentColor"/>
                <circle cx="${x+s*0.35}" cy="${y-s*0.45}" r="${s*0.08}" fill="currentColor"/>
                <rect x="${x-s*0.1}" y="${y+s*0.25}" width="${s*0.2}" height="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1"/>
                <circle cx="${x+s*0.05}" cy="${y+s*0.4}" r="${s*0.04}" fill="currentColor"/>`;
    },

    greenhouse: (x, y, size) => {
        const s = size * 0.4;
        return `<rect x="${x-s*0.6}" y="${y}" width="${s*1.2}" height="${s*0.6}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.6},${y} L${x},${y-s*0.5} L${x+s*0.6},${y}" fill="none" stroke="currentColor" stroke-width="1.5"/>
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
            svg += `<line x1="${lx}" y1="${ly}" x2="${lx}" y2="${ly+s*0.8}" stroke="currentColor" stroke-width="2"/>`;
            svg += `<circle cx="${lx}" cy="${ly-r*0.3}" r="${r}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
            svg += `<path d="M${lx-r*0.7},${ly-r*0.3} Q${lx},${ly-r} ${lx+r*0.7},${ly-r*0.3}" fill="none" stroke="currentColor" stroke-width="1"/>`;
        }
        return svg;
    },

    chocolateFountain: (x, y, size) => {
        const s = size * 0.4;
        return `<ellipse cx="${x}" cy="${y+s*0.5}" rx="${s*0.7}" ry="${s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x}" cy="${y+s*0.2}" rx="${s*0.5}" ry="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x}" cy="${y-s*0.1}" rx="${s*0.35}" ry="${s*0.1}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x}" cy="${y-s*0.35}" rx="${s*0.2}" ry="${s*0.08}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <line x1="${x}" y1="${y+s*0.35}" x2="${x}" y2="${y-s*0.35}" stroke="currentColor" stroke-width="2"/>
                <path d="M${x-s*0.2},${y-s*0.35} Q${x-s*0.35},${y-s*0.1} ${x-s*0.5},${y+s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.2},${y-s*0.35} Q${x+s*0.35},${y-s*0.1} ${x+s*0.5},${y+s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    // Additional Jungle goals
    waterfall: (x, y, size) => {
        const s = size * 0.4;
        return `<path d="M${x-s*0.6},${y-s*0.6} L${x-s*0.3},${y-s*0.5} L${x-s*0.3},${y-s*0.3} L${x+s*0.3},${y-s*0.3} L${x+s*0.3},${y-s*0.5} L${x+s*0.6},${y-s*0.6}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.2},${y-s*0.3} Q${x-s*0.25},${y} ${x-s*0.15},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x},${y-s*0.3} Q${x+s*0.05},${y+s*0.1} ${x},${y+s*0.5}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x+s*0.2},${y-s*0.3} Q${x+s*0.15},${y} ${x+s*0.2},${y+s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <ellipse cx="${x}" cy="${y+s*0.6}" rx="${s*0.5}" ry="${s*0.15}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.7},${y-s*0.5} Q${x-s*0.8},${y-s*0.3} ${x-s*0.65},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>
                <path d="M${x+s*0.7},${y-s*0.5} Q${x+s*0.8},${y-s*0.3} ${x+s*0.65},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1"/>`;
    },

    treehouseVillage: (x, y, size) => {
        const s = size * 0.4;
        return `<line x1="${x-s*0.4}" y1="${y+s*0.7}" x2="${x-s*0.4}" y2="${y-s*0.3}" stroke="currentColor" stroke-width="2"/>
                <line x1="${x+s*0.4}" y1="${y+s*0.7}" x2="${x+s*0.4}" y2="${y-s*0.2}" stroke="currentColor" stroke-width="2"/>
                <rect x="${x-s*0.65}" y="${y-s*0.1}" width="${s*0.5}" height="${s*0.4}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.7},${y-s*0.1} L${x-s*0.4},${y-s*0.4} L${x-s*0.1},${y-s*0.1}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <rect x="${x+s*0.15}" y="${y-s*0.2}" width="${s*0.5}" height="${s*0.35}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x+s*0.1},${y-s*0.2} L${x+s*0.4},${y-s*0.5} L${x+s*0.7},${y-s*0.2}" fill="none" stroke="currentColor" stroke-width="1.5"/>
                <path d="M${x-s*0.15},${y+s*0.1} Q${x},${y+s*0.2} ${x+s*0.15},${y+s*0.05}" fill="none" stroke="currentColor" stroke-width="1"/>
                <line x1="${x-s*0.4}" y1="${y+s*0.5}" x2="${x-s*0.6}" y2="${y+s*0.7}" stroke="currentColor" stroke-width="1"/>
                <line x1="${x+s*0.4}" y1="${y+s*0.5}" x2="${x+s*0.6}" y2="${y+s*0.7}" stroke="currentColor" stroke-width="1"/>`;
    }
};

// Border pattern generators - decorative frames around the maze
const BorderPatterns = {
    simple: (width, height, padding, rng) => {
        // Simple double-line border
        const inset = 4;
        return `<rect x="${inset}" y="${inset}" width="${width - inset*2}" height="${height - inset*2}" fill="none" stroke="currentColor" stroke-width="2" rx="3"/>
                <rect x="${inset + 6}" y="${inset + 6}" width="${width - inset*2 - 12}" height="${height - inset*2 - 12}" fill="none" stroke="currentColor" stroke-width="1" rx="2"/>`;
    },

    waves: (width, height, padding, rng) => {
        let svg = '';
        const waveH = 6;
        const waveW = 16;
        // Top and bottom wave borders
        for (let x = 10; x < width - 10; x += waveW) {
            svg += `<path d="M${x},8 Q${x + waveW/2},${8 + waveH} ${x + waveW},8" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
            svg += `<path d="M${x},${height-8} Q${x + waveW/2},${height-8-waveH} ${x + waveW},${height-8}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
        }
        // Side borders
        svg += `<line x1="6" y1="15" x2="6" y2="${height-15}" stroke="currentColor" stroke-width="2"/>`;
        svg += `<line x1="${width-6}" y1="15" x2="${width-6}" y2="${height-15}" stroke="currentColor" stroke-width="2"/>`;
        return svg;
    },

    stars: (width, height, padding, rng) => {
        let svg = `<rect x="4" y="4" width="${width-8}" height="${height-8}" fill="none" stroke="currentColor" stroke-width="2" rx="2"/>`;
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
        let svg = `<rect x="4" y="4" width="${width-8}" height="${height-8}" fill="none" stroke="currentColor" stroke-width="2" rx="2"/>`;
        // Left and right vines
        for (let y = 20; y < height - 20; y += 25) {
            svg += `<path d="M8,${y} Q15,${y+12} 8,${y+25}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
            svg += `<circle cx="12" cy="${y+8}" r="3" fill="none" stroke="currentColor" stroke-width="1"/>`;
            svg += `<path d="M${width-8},${y} Q${width-15},${y+12} ${width-8},${y+25}" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
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
        let svg = `<rect x="4" y="4" width="${width-8}" height="${height-8}" fill="none" stroke="currentColor" stroke-width="2" rx="2"/>`;
        // Leaves in corners
        for (let i = 0; i < 6; i++) {
            const x = 12 + rng.nextInt(0, 15);
            const y = 12 + rng.nextInt(0, 15);
            const angle = rng.nextInt(0, 360);
            svg += `<g transform="translate(${x},${y}) rotate(${angle})" opacity="0.6"><path d="M0,-5 Q4,0 0,5 Q-4,0 0,-5" fill="none" stroke="currentColor" stroke-width="1.5"/></g>`;
            svg += `<g transform="translate(${width-x},${y}) rotate(${angle})" opacity="0.6"><path d="M0,-5 Q4,0 0,5 Q-4,0 0,-5" fill="none" stroke="currentColor" stroke-width="1.5"/></g>`;
            svg += `<g transform="translate(${x},${height-y}) rotate(${angle})" opacity="0.6"><path d="M0,-5 Q4,0 0,5 Q-4,0 0,-5" fill="none" stroke="currentColor" stroke-width="1.5"/></g>`;
            svg += `<g transform="translate(${width-x},${height-y}) rotate(${angle})" opacity="0.6"><path d="M0,-5 Q4,0 0,5 Q-4,0 0,-5" fill="none" stroke="currentColor" stroke-width="1.5"/></g>`;
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

    findValidStartEnd(roomSize = 1) {
        // Collect ALL valid perimeter positions for rooms
        const perimeterPositions = [];

        // Check if a position can hold a room of given size
        const canPlaceRoom = (x, y) => {
            if (x < 0 || y < 0 || x + roomSize > this.width || y + roomSize > this.height) return false;
            for (let dy = 0; dy < roomSize; dy++) {
                for (let dx = 0; dx < roomSize; dx++) {
                    if (this.cells[y + dy][x + dx].blocked) return false;
                }
            }
            return true;
        };

        // Check if position is on perimeter (room touches edge)
        const isOnPerimeter = (x, y) => {
            return x === 0 || y === 0 || x + roomSize >= this.width || y + roomSize >= this.height;
        };

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
            // Fallback: just find any two positions
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
        // Calculate room size - keep it small (2x2 for most, 3x3 for very large)
        const minDim = Math.min(this.width, this.height);
        let roomSize = minDim >= 30 ? 3 : 2;

        if (!this.findValidStartEnd(roomSize)) return;

        this.startRoomSize = roomSize;
        this.endRoomSize = roomSize;

        // Carve start and end rooms
        this.carveRoom(this.startPos.x, this.startPos.y, roomSize, roomSize);
        this.carveRoom(this.endPos.x, this.endPos.y, roomSize, roomSize);

        // Open start entrance (west wall)
        for (let dy = 0; dy < roomSize; dy++) {
            this.cells[this.startPos.y + dy][this.startPos.x].walls.west = false;
        }

        // Open end exit (east wall)
        const endX = this.endPos.x + roomSize - 1;
        for (let dy = 0; dy < roomSize; dy++) {
            this.cells[this.endPos.y + dy][endX].walls.east = false;
        }

        this.solution = this.findPath(this.startPos, this.endPos);
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
    findCornerRegions() {
        const regions = [];
        const corners = [
            { sx: 0, sy: 0, ex: Math.floor(this.width/3), ey: Math.floor(this.height/3) },
            { sx: Math.floor(this.width*2/3), sy: 0, ex: this.width, ey: Math.floor(this.height/3) },
            { sx: 0, sy: Math.floor(this.height*2/3), ex: Math.floor(this.width/3), ey: this.height },
            { sx: Math.floor(this.width*2/3), sy: Math.floor(this.height*2/3), ex: this.width, ey: this.height }
        ];

        for (const corner of corners) {
            let blockedCount = 0;
            let totalCount = 0;
            for (let y = corner.sy; y < corner.ey; y++) {
                for (let x = corner.sx; x < corner.ex; x++) {
                    totalCount++;
                    if (this.cells[y][x].blocked) blockedCount++;
                }
            }
            // If mostly blocked, it's a corner region
            if (blockedCount > totalCount * 0.6) {
                regions.push({
                    cx: (corner.sx + corner.ex) / 2,
                    cy: (corner.sy + corner.ey) / 2,
                    size: Math.min(corner.ex - corner.sx, corner.ey - corner.sy)
                });
            }
        }
        return regions;
    }

    toSVG(showSolution = false, printMode = false) {
        const cellSize = Math.min(18, Math.max(8, Math.floor(350 / Math.max(this.width, this.height))));
        const strokeWidth = Math.max(1.5, cellSize / 8);
        const mazeWidth = this.width * cellSize;
        const mazeHeight = this.height * cellSize;

        // Calculate margins for title, quest, and START/END labels
        const titleHeight = this.story && this.story.title ? 20 : 0;
        const questHeight = this.story && this.story.quest ? 24 : 0;
        const sidePadding = 35; // Space for START/END on sides
        const topPadding = 20 + titleHeight;
        const bottomPadding = 16 + questHeight;

        const svgWidth = mazeWidth + sidePadding * 2;
        const svgHeight = mazeHeight + topPadding + bottomPadding;

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

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" style="background:${theme.bgColor}">`;

        // Background
        svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="${theme.bgColor}"/>`;

        // Border pattern (gray in print mode) - full page
        if (this.theme.borderPattern && BorderPatterns[this.theme.borderPattern]) {
            const borderColor = printMode ? '#aaa' : this.theme.wallColor;
            svg += `<g color="${borderColor}">${BorderPatterns[this.theme.borderPattern](svgWidth, svgHeight, sidePadding, this.rng)}</g>`;
        }

        // Title at top (vector font) - auto-scale to fit, white outline for readability
        if (this.story && this.story.title) {
            const maxTitleWidth = svgWidth - 32; // Leave margin from borders
            let titleSize = Math.min(14, Math.max(10, svgWidth / 25));
            // Scale down if title is too wide
            let titleWidth = VectorFont.measureText(this.story.title, titleSize);
            while (titleWidth > maxTitleWidth && titleSize > 6) {
                titleSize -= 0.5;
                titleWidth = VectorFont.measureText(this.story.title, titleSize);
            }
            // Position 0.3 line heights lower (14 + 0.3 * titleSize)
            const titleY = 14 + titleSize * 0.3;
            // White outline (thicker stroke) then normal stroke on top
            svg += VectorFont.renderCentered(this.story.title, svgWidth / 2, titleY, titleSize, '#fff', 3);
            svg += VectorFont.renderCentered(this.story.title, svgWidth / 2, titleY, titleSize, textColor, 1.2);
        }

        // Cell backgrounds (white for maze area)
        svg += `<g fill="${theme.pathColor}">`;
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

        // Corner decorations for non-rectangle shapes
        if (this.shape !== 'rectangle' && this.theme.decorations && this.theme.decorations.length > 0) {
            const cornerRegions = this.findCornerRegions();
            const artColor = printMode ? '#888' : this.theme.wallColor;
            svg += `<g style="color:${artColor}; stroke:${artColor}; fill:${artColor}">`;
            for (const region of cornerRegions) {
                const cx = sidePadding + region.cx * cellSize;
                const cy = topPadding + region.cy * cellSize;
                const artType = this.rng.choice(this.theme.decorations);
                if (ArtGenerators[artType]) {
                    svg += ArtGenerators[artType](cx, cy, region.size * cellSize * 0.6, this.rng);
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

        // Character art in start room - 30% smaller overall, thinner lines
        if (this.startPos && this.theme.character && CharacterArt[this.theme.character]) {
            const roomSize = this.startRoomSize || 2;
            const cx = sidePadding + (this.startPos.x + roomSize / 2) * cellSize;
            const cy = topPadding + (this.startPos.y + roomSize / 2) * cellSize;
            const artColor = printMode ? '#000' : this.theme.wallColor;
            // 30% smaller: 0.8 * 0.7 = 0.56, thinner strokes via transform
            const artSize = roomSize * cellSize * 0.56;
            svg += `<g color="${artColor}" style="stroke-width:0.8">${CharacterArt[this.theme.character](cx, cy, artSize)}</g>`;
        }

        // Goal art in end room - 10% smaller, half line height left
        if (this.endPos && this.theme.goal && GoalArt[this.theme.goal]) {
            const roomSize = this.endRoomSize || 2;
            // Shift half a line height (cellSize * 0.5) to the left
            const cx = sidePadding + (this.endPos.x + roomSize / 2) * cellSize - cellSize * 0.5;
            const cy = topPadding + (this.endPos.y + roomSize / 2) * cellSize;
            const artColor = printMode ? '#000' : this.theme.wallColor;
            // 10% smaller: 0.8 * 0.9 = 0.72, thinner strokes
            const artSize = roomSize * cellSize * 0.72;
            svg += `<g color="${artColor}" style="stroke-width:0.8">${GoalArt[this.theme.goal](cx, cy, artSize)}</g>`;
        }

        // Room decorations (gray in print mode)
        if (this.theme.decorations && this.theme.decorations.length > 0 && this.rooms && this.rooms.length > 0) {
            const artColor = printMode ? '#888' : this.theme.wallColor;
            svg += `<g style="color:${artColor}; stroke:${artColor}; fill:${artColor}">`;
            for (const room of this.rooms) {
                const cx = sidePadding + (room.x + room.w / 2) * cellSize;
                const cy = topPadding + (room.y + room.h / 2) * cellSize;
                const artType = this.rng.choice(this.theme.decorations);
                if (ArtGenerators[artType]) {
                    svg += ArtGenerators[artType](cx, cy, Math.min(room.w, room.h) * cellSize, this.rng);
                }
            }
            svg += '</g>';
        }

        // Walls
        if (this.curvedWalls) {
            svg += this.renderCurvedWalls(cellSize, sidePadding, topPadding, strokeWidth, theme.wallColor);
        } else {
            svg += `<g stroke="${theme.wallColor}" stroke-width="${strokeWidth}" stroke-linecap="round">`;
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const cell = this.cells[y][x];
                    if (cell.blocked) continue;

                    const cx = sidePadding + x * cellSize;
                    const cy = topPadding + y * cellSize;

                    const northBlocked = y > 0 && this.cells[y-1][x].blocked;
                    const southBlocked = y < this.height - 1 && this.cells[y+1][x].blocked;
                    const eastBlocked = x < this.width - 1 && this.cells[y][x+1].blocked;
                    const westBlocked = x > 0 && this.cells[y][x-1].blocked;

                    if (cell.walls.north || northBlocked) {
                        svg += `<line x1="${cx}" y1="${cy}" x2="${cx + cellSize}" y2="${cy}"/>`;
                    }
                    if ((y === this.height - 1 && cell.walls.south) || southBlocked) {
                        svg += `<line x1="${cx}" y1="${cy + cellSize}" x2="${cx + cellSize}" y2="${cy + cellSize}"/>`;
                    }
                    if (cell.walls.west || westBlocked) {
                        svg += `<line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + cellSize}"/>`;
                    }
                    if ((x === this.width - 1 && cell.walls.east) || eastBlocked) {
                        svg += `<line x1="${cx + cellSize}" y1="${cy}" x2="${cx + cellSize}" y2="${cy + cellSize}"/>`;
                    }
                }
            }
            svg += '</g>';
        }

        // START/END labels positioned under the character/goal art in the rooms
        // (Since start/end positions are randomized, labels go under the art, not on sides)
        const labelSize = Math.min(6, Math.max(4, cellSize * 0.4));

        if (this.startPos) {
            const roomSize = this.startRoomSize || 2;
            const cx = sidePadding + (this.startPos.x + roomSize / 2) * cellSize;
            const cy = topPadding + (this.startPos.y + roomSize / 2) * cellSize;
            // START: 40% smaller than previous (0.6 * 0.6 = 0.36), moved up 1 line height
            const startLabelSize = labelSize * 0.36;
            const artBottom = cy + roomSize * cellSize * 0.28;
            const startWidth = VectorFont.measureText('START', startLabelSize);
            // Move center up by 1 line height
            const startY = artBottom + 2 - startLabelSize * 1.0;
            svg += VectorFont.renderText('START', cx - startWidth / 2, startY, startLabelSize, textColor, 0.7);
        }

        if (this.endPos) {
            const roomSize = this.endRoomSize || 2;
            const cx = sidePadding + (this.endPos.x + roomSize / 2) * cellSize;
            const cy = topPadding + (this.endPos.y + roomSize / 2) * cellSize;
            // END: 30% smaller than previous (0.8 * 0.7 = 0.56), moved left 1 character width
            const endLabelSize = labelSize * 0.56;
            const artBottom = cy + roomSize * cellSize * 0.36;
            const endWidth = VectorFont.measureText('END', endLabelSize);
            const letterWidth = endWidth / 3; // Approximate width per letter
            // Move center left by 1 character width
            const endX = cx - endWidth / 2 - letterWidth * 1.0;
            const endY = artBottom + 2;
            svg += VectorFont.renderText('END', endX, endY, endLabelSize, textColor, 0.7);
        }

        // Quest at bottom (vector font, word-wrapped if needed) - 1.8 line heights higher
        if (this.story && this.story.quest) {
            const questSize = Math.min(8, Math.max(5, svgWidth / 50));
            // Move 1.8 line heights higher (subtract 1.8 * questSize)
            const questY = svgHeight - questHeight + 4 - questSize * 1.8;
            const maxWidth = svgWidth - 24;

            // Simple word wrap
            const words = this.story.quest.split(' ');
            let lines = [];
            let currentLine = '';

            for (const word of words) {
                const testLine = currentLine ? currentLine + ' ' + word : word;
                const testWidth = VectorFont.measureText(testLine, questSize);
                if (testWidth > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) lines.push(currentLine);

            // Render lines centered with white outline for readability
            for (let i = 0; i < lines.length && i < 2; i++) {
                const lineY = questY + i * (questSize + 3);
                // White outline (thicker stroke) then normal stroke on top
                svg += VectorFont.renderCentered(lines[i], svgWidth / 2, lineY, questSize, '#fff', 2.5);
                svg += VectorFont.renderCentered(lines[i], svgWidth / 2, lineY, questSize, textColor, 1);
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
        characters: ["explorer", "adventurer", "traveler", "seeker"],
        items: ["key", "map", "compass", "torch", "rope", "coin"],
        dangers: ["trap", "dead end", "wrong turn", "locked gate"],
        goals: ["exit", "treasure", "finish line", "golden key"],
        adjectives: ["Amazing", "Mystery", "Secret", "Great"],
        nouns: ["Maze", "Labyrinth", "Quest", "Adventure"]
    },
    ocean: {
        characters: ["diver", "mermaid", "sailor", "sea turtle", "dolphin"],
        items: ["pearl", "shell", "starfish", "treasure map", "golden compass", "magic conch"],
        dangers: ["jellyfish", "shark", "whirlpool", "sea urchin", "giant squid"],
        goals: ["treasure chest", "sunken ship", "coral palace", "mermaid kingdom"],
        adjectives: ["Deep", "Ocean", "Underwater", "Coral"],
        nouns: ["Dive", "Sea", "Reef", "Voyage"]
    },
    space: {
        characters: ["astronaut", "space explorer", "robot", "alien friend", "star pilot"],
        items: ["fuel cell", "oxygen tank", "star map", "crystal", "power core", "data chip"],
        dangers: ["asteroid", "black hole", "space junk", "meteor shower", "alien trap"],
        goals: ["space station", "home planet", "mother ship", "warp gate"],
        adjectives: ["Cosmic", "Stellar", "Galactic", "Space"],
        nouns: ["Mission", "Voyage", "Station", "Galaxy"]
    },
    garden: {
        characters: ["bee", "butterfly", "ladybug", "garden fairy", "little gardener"],
        items: ["nectar", "pollen", "flower seed", "dewdrop", "golden petal", "honey"],
        dangers: ["spider", "wasp", "thorn", "raindrop", "garden snake"],
        goals: ["flower garden", "beehive", "fairy house", "rainbow flower"],
        adjectives: ["Blooming", "Garden", "Flower", "Secret"],
        nouns: ["Garden", "Meadow", "Bloom", "Grove"]
    },
    candy: {
        characters: ["gingerbread kid", "candy fairy", "sugar sprite", "lollipop friend"],
        items: ["gumdrop", "candy cane", "chocolate coin", "sugar crystal", "magic sprinkle"],
        dangers: ["sour candy", "sticky taffy", "melting chocolate", "sugar crash"],
        goals: ["candy castle", "chocolate fountain", "gummy palace", "sweet shop"],
        adjectives: ["Sweet", "Candy", "Sugar", "Yummy"],
        nouns: ["Kingdom", "Factory", "Land", "Palace"]
    },
    jungle: {
        characters: ["explorer", "baby monkey", "parrot", "jungle kid", "tree frog"],
        items: ["golden idol", "ancient map", "magic fruit", "vine rope", "jungle gem"],
        dangers: ["quicksand", "snake", "spider web", "falling rock", "thorny bush"],
        goals: ["hidden temple", "treetop village", "ancient ruins", "jungle treasure"],
        adjectives: ["Wild", "Jungle", "Lost", "Ancient"],
        nouns: ["Temple", "Jungle", "Safari", "Expedition"]
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

    generateQuest(themeName, difficulty = 5) {
        const vocab = ThemeVocabulary[themeName] || ThemeVocabulary.classic;
        const theme = Themes[themeName] || Themes.classic;

        // Select template type based on difficulty
        let templateType;
        if (difficulty <= 3) {
            templateType = 'simple';
        } else if (difficulty <= 5) {
            templateType = this.rng.next() > 0.5 ? 'collect' : 'avoid';
        } else if (difficulty <= 7) {
            templateType = 'collectTwo';
        } else {
            templateType = 'full';
        }

        const templates = StoryTemplates[templateType];
        const template = this.rng.choice(templates);

        // Select vocabulary items (ensure uniqueness)
        const items = this.rng.shuffle([...vocab.items]);
        const item1 = items[0];
        const item2 = items[1] || items[0];

        // Use theme's character/goal names to match the artwork
        const character = theme.characterName || this.rng.choice(vocab.characters);
        const goal = theme.goalName || this.rng.choice(vocab.goals);

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
        const maze = new Maze(width, height, this.rng);
        maze.theme = Themes[themeName] || Themes.classic;
        maze.curvedWalls = curved;

        // Apply shape mask
        maze.applyShapeMask(shape);

        // Find valid start/end before generation
        maze.findValidStartEnd();

        // Generate maze
        switch (algorithm) {
            case 'prims': this.prims(maze); break;
            case 'kruskals': this.kruskals(maze); break;
            default: this.recursiveBacktracker(maze);
        }

        // Add interior rooms
        maze.addRooms();

        // Create entrance/exit
        maze.createEntranceExit();

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

    // Generate complete maze with story
    generateWithStory(width, height, algorithm, shape, themeName, curved, difficulty) {
        const maze = this.generate(width, height, algorithm, shape, themeName, curved);

        // Generate story for this maze
        const storyGen = new StoryGenerator(this.rng);
        const story = storyGen.generateQuest(themeName, difficulty);

        maze.story = story;
        return maze;
    }
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

// Calculate layout metrics for a maze (bounding boxes of all elements)
function getLayoutMetrics(maze) {
    const cellSize = Math.min(18, Math.max(8, Math.floor(350 / Math.max(maze.width, maze.height))));
    const strokeWidth = Math.max(1.5, cellSize / 8);
    const mazeWidth = maze.width * cellSize;
    const mazeHeight = maze.height * cellSize;

    const titleHeight = maze.story && maze.story.title ? 20 : 0;
    const questHeight = maze.story && maze.story.quest ? 24 : 0;
    const sidePadding = 35;
    const topPadding = 20 + titleHeight;
    const bottomPadding = 16 + questHeight;

    const svgWidth = mazeWidth + sidePadding * 2;
    const svgHeight = mazeHeight + topPadding + bottomPadding;

    // Border inner bounds (where content should stay inside)
    // Most borders have ~10-15px margin from edge
    const borderInset = 16;
    const borderBounds = {
        left: borderInset,
        top: borderInset,
        right: svgWidth - borderInset,
        bottom: svgHeight - borderInset
    };

    // Maze bounds
    const mazeBounds = {
        left: sidePadding,
        top: topPadding,
        right: sidePadding + mazeWidth,
        bottom: topPadding + mazeHeight
    };

    // Title bounds
    let titleBounds = null;
    if (maze.story && maze.story.title) {
        const maxTitleWidth = svgWidth - 32;
        let titleSize = Math.min(14, Math.max(10, svgWidth / 25));
        let titleWidth = VectorFont.measureText(maze.story.title, titleSize);
        while (titleWidth > maxTitleWidth && titleSize > 6) {
            titleSize -= 0.5;
            titleWidth = VectorFont.measureText(maze.story.title, titleSize);
        }
        const titleY = 14 + titleSize * 0.3;
        const titleX = (svgWidth - titleWidth) / 2;
        titleBounds = {
            left: titleX,
            top: titleY,
            right: titleX + titleWidth,
            bottom: titleY + titleSize,
            text: maze.story.title,
            size: titleSize
        };
    }

    // Quest bounds
    let questBounds = null;
    if (maze.story && maze.story.quest) {
        const questSize = Math.min(8, Math.max(5, svgWidth / 50));
        const questY = svgHeight - questHeight + 4 - questSize * 1.8;
        const maxWidth = svgWidth - 24;

        // Calculate word wrap
        const words = maze.story.quest.split(' ');
        let lines = [];
        let currentLine = '';
        for (const word of words) {
            const testLine = currentLine ? currentLine + ' ' + word : word;
            const testWidth = VectorFont.measureText(testLine, questSize);
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
        for (const line of lines.slice(0, 2)) {
            maxLineWidth = Math.max(maxLineWidth, VectorFont.measureText(line, questSize));
        }
        const numLines = Math.min(lines.length, 2);
        const totalQuestHeight = numLines * questSize + (numLines - 1) * 3;

        questBounds = {
            left: (svgWidth - maxLineWidth) / 2,
            top: questY,
            right: (svgWidth + maxLineWidth) / 2,
            bottom: questY + totalQuestHeight,
            lines: lines.slice(0, 2),
            size: questSize
        };
    }

    // START label bounds - 36% of base size (40% smaller than 0.6), moved up 1 line height
    let startBounds = null;
    if (maze.startPos) {
        const roomSize = maze.startRoomSize || 2;
        const cx = sidePadding + (maze.startPos.x + roomSize / 2) * cellSize;
        const cy = topPadding + (maze.startPos.y + roomSize / 2) * cellSize;
        const labelSize = Math.min(6, Math.max(4, cellSize * 0.4));
        const startLabelSize = labelSize * 0.36;
        const startWidth = VectorFont.measureText('START', startLabelSize);
        const artBottom = cy + roomSize * cellSize * 0.28;
        const startX = cx - startWidth / 2;
        const startY = artBottom + 2 - startLabelSize * 1.0;

        startBounds = {
            left: startX,
            top: startY,
            right: startX + startWidth,
            bottom: startY + startLabelSize,
            size: startLabelSize
        };
    }

    // END label bounds - 56% of base size (30% smaller than 0.8), moved left 1 character width
    let endBounds = null;
    if (maze.endPos) {
        const roomSize = maze.endRoomSize || 2;
        const cx = sidePadding + (maze.endPos.x + roomSize / 2) * cellSize;
        const cy = topPadding + (maze.endPos.y + roomSize / 2) * cellSize;
        const labelSize = Math.min(6, Math.max(4, cellSize * 0.4));
        const endLabelSize = labelSize * 0.56;
        const endWidth = VectorFont.measureText('END', endLabelSize);
        const letterWidth = endWidth / 3;
        const artBottom = cy + roomSize * cellSize * 0.36;
        const endX = cx - endWidth / 2 - letterWidth * 1.0;
        const endY = artBottom + 2;

        endBounds = {
            left: endX,
            top: endY,
            right: endX + endWidth,
            bottom: endY + endLabelSize,
            size: endLabelSize
        };
    }

    return {
        svgWidth,
        svgHeight,
        cellSize,
        sidePadding,
        topPadding,
        bottomPadding,
        borderBounds,
        mazeBounds,
        titleBounds,
        questBounds,
        startBounds,
        endBounds
    };
}

// Check if two rectangles overlap
function rectsOverlap(a, b) {
    if (!a || !b) return false;
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
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

    // Check START label within border (now inside start room, under character art)
    if (metrics.startBounds) {
        if (!rectInside(metrics.startBounds, metrics.borderBounds)) {
            issues.push({
                element: 'start',
                type: 'outside_border',
                bounds: metrics.startBounds,
                border: metrics.borderBounds,
                detail: `START extends outside border`
            });
        }
        // START label should be within or near the maze area (it's inside a room)
        if (metrics.startBounds.bottom > metrics.mazeBounds.bottom + 5) {
            issues.push({
                element: 'start',
                type: 'below_maze',
                bounds: metrics.startBounds,
                maze: metrics.mazeBounds,
                detail: `START label extends too far below maze: ${metrics.startBounds.bottom.toFixed(1)} > ${metrics.mazeBounds.bottom}`
            });
        }
    }

    // Check END label within border (now inside end room, under goal art)
    // Check END label within border (now inside end room, under goal art)
    if (metrics.endBounds) {
        if (!rectInside(metrics.endBounds, metrics.borderBounds)) {
            issues.push({
                element: 'end',
                type: 'outside_border',
                bounds: metrics.endBounds,
                border: metrics.borderBounds,
                detail: `END extends outside border`
            });
        }
        // END label should be within or near the maze area (it's inside a room)
        if (metrics.endBounds.bottom > metrics.mazeBounds.bottom + 5) {
            issues.push({
                element: 'end',
                type: 'below_maze',
                bounds: metrics.endBounds,
                maze: metrics.mazeBounds,
                detail: `END label extends too far below maze: ${metrics.endBounds.bottom.toFixed(1)} > ${metrics.mazeBounds.bottom}`
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
}
