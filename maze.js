/**
 * MazeJS - Client-Side Maze Generator with Themes & Shapes
 * Deterministic generation with seeded random
 */

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
        decorations: []
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
        decorations: ['fish', 'bubble', 'seaweed', 'shell']
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
        decorations: ['star', 'planet', 'rocket', 'moon']
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
        decorations: ['flower', 'butterfly', 'bee', 'leaf']
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
        decorations: ['lollipop', 'cupcake', 'star', 'heart']
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
        decorations: ['palm', 'bird', 'monkey', 'snake']
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
        // Find position for start room (top-left area, on perimeter)
        for (let y = 0; y <= this.height - roomSize; y++) {
            for (let x = 0; x <= this.width - roomSize; x++) {
                let allClear = true;
                for (let dy = 0; dy < roomSize && allClear; dy++) {
                    for (let dx = 0; dx < roomSize && allClear; dx++) {
                        if (this.cells[y + dy][x + dx].blocked) allClear = false;
                    }
                }
                if (allClear) {
                    this.startPos = { x, y };
                    break;
                }
            }
            if (this.startPos) break;
        }

        // Find position for end room (bottom-right area)
        for (let y = this.height - roomSize; y >= 0; y--) {
            for (let x = this.width - roomSize; x >= 0; x--) {
                let allClear = true;
                for (let dy = 0; dy < roomSize && allClear; dy++) {
                    for (let dx = 0; dx < roomSize && allClear; dx++) {
                        if (this.cells[y + dy][x + dx].blocked) allClear = false;
                    }
                }
                if (allClear) {
                    this.endPos = { x, y };
                    break;
                }
            }
            if (this.endPos) break;
        }

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
        // Calculate room size based on maze dimensions - larger for bigger mazes
        const minDim = Math.min(this.width, this.height);
        let roomSize = Math.max(2, Math.ceil(minDim / 10));
        // Cap at reasonable size
        roomSize = Math.min(roomSize, Math.floor(minDim / 4));

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
        const padding = 50; // More padding for labels
        const strokeWidth = Math.max(1.5, cellSize / 8);
        const mazeWidth = this.width * cellSize;
        const mazeHeight = this.height * cellSize;
        const svgWidth = mazeWidth + padding * 2;
        const svgHeight = mazeHeight + padding * 2;

        // Print mode: black walls on white background
        const theme = printMode ? {
            wallColor: '#000',
            pathColor: '#fff',
            bgColor: '#fff',
            solutionColor: '#888',
            startColor: '#000',
            endColor: '#000'
        } : this.theme;

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" style="background:${theme.bgColor}">`;

        // Background
        svg += `<rect width="${svgWidth}" height="${svgHeight}" fill="${theme.bgColor}"/>`;

        // Border pattern (gray in print mode)
        if (this.theme.borderPattern && BorderPatterns[this.theme.borderPattern]) {
            const borderColor = printMode ? '#aaa' : this.theme.wallColor;
            svg += `<g color="${borderColor}">${BorderPatterns[this.theme.borderPattern](svgWidth, svgHeight, padding, this.rng)}</g>`;
        }

        // Cell backgrounds (white for maze area)
        svg += `<g fill="${theme.pathColor}">`;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (!this.cells[y][x].blocked) {
                    const cx = padding + x * cellSize;
                    const cy = padding + y * cellSize;
                    svg += `<rect x="${cx}" y="${cy}" width="${cellSize}" height="${cellSize}"/>`;
                }
            }
        }
        svg += '</g>';

        // Corner decorations for non-rectangle shapes
        if (this.shape !== 'rectangle' && this.theme.decorations && this.theme.decorations.length > 0) {
            const cornerRegions = this.findCornerRegions();
            const artColor = printMode ? '#888' : this.theme.wallColor;
            svg += `<g color="${artColor}">`;
            for (const region of cornerRegions) {
                const cx = padding + region.cx * cellSize;
                const cy = padding + region.cy * cellSize;
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
                const cx = padding + p.x * cellSize + cellSize / 2;
                const cy = padding + p.y * cellSize + cellSize / 2;
                pathD += i === 0 ? `M${cx},${cy}` : ` L${cx},${cy}`;
            }
            svg += `<path d="${pathD}" fill="none" stroke="${theme.solutionColor}" stroke-width="${cellSize * 0.3}" stroke-linecap="round" stroke-linejoin="round" opacity="0.6"/>`;
        }

        // Room decorations (gray in print mode)
        if (this.theme.decorations && this.theme.decorations.length > 0) {
            const artColor = printMode ? '#888' : this.theme.wallColor;
            svg += `<g color="${artColor}">`;
            for (const room of this.rooms) {
                const cx = padding + (room.x + room.w / 2) * cellSize;
                const cy = padding + (room.y + room.h / 2) * cellSize;
                const artType = this.rng.choice(this.theme.decorations);
                if (ArtGenerators[artType]) {
                    svg += ArtGenerators[artType](cx, cy, Math.min(room.w, room.h) * cellSize, this.rng);
                }
            }
            svg += '</g>';
        }

        // Walls
        if (this.curvedWalls) {
            svg += this.renderCurvedWalls(cellSize, padding, strokeWidth, theme.wallColor);
        } else {
            svg += `<g stroke="${theme.wallColor}" stroke-width="${strokeWidth}" stroke-linecap="round">`;
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    const cell = this.cells[y][x];
                    if (cell.blocked) continue;

                    const cx = padding + x * cellSize;
                    const cy = padding + y * cellSize;

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

        // Start/End markers - always black, labels outside maze
        const markerColor = '#000';
        const fontSize = Math.max(10, Math.floor(padding * 0.35));
        const arrowSize = Math.max(8, Math.floor(padding * 0.25));

        if (this.startPos) {
            const roomSize = this.startRoomSize || 2;
            const roomCenterY = padding + (this.startPos.y + roomSize / 2) * cellSize;

            // Arrow pointing into maze from outside (west side)
            const arrowX = padding - arrowSize - 6;
            const arrowY = roomCenterY;
            svg += `<polygon points="${arrowX},${arrowY - arrowSize/2} ${arrowX},${arrowY + arrowSize/2} ${arrowX + arrowSize},${arrowY}" fill="${markerColor}"/>`;
            svg += `<text x="${arrowX - 6}" y="${arrowY + fontSize/3}" text-anchor="end" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" fill="${markerColor}">START</text>`;
        }

        if (this.endPos) {
            const roomSize = this.endRoomSize || 2;
            const roomCenterY = padding + (this.endPos.y + roomSize / 2) * cellSize;

            // Arrow pointing out of maze to outside (east side)
            const arrowX = padding + this.width * cellSize + 6;
            const arrowY = roomCenterY;
            svg += `<polygon points="${arrowX},${arrowY - arrowSize/2} ${arrowX},${arrowY + arrowSize/2} ${arrowX + arrowSize},${arrowY}" fill="${markerColor}"/>`;
            svg += `<text x="${arrowX + arrowSize + 6}" y="${arrowY + fontSize/3}" text-anchor="start" font-family="sans-serif" font-size="${fontSize}" font-weight="bold" fill="${markerColor}">END</text>`;
        }

        svg += '</svg>';
        return svg;
    }

    renderCurvedWalls(cellSize, padding, strokeWidth, wallColor) {
        const r = cellSize / 2; // Curve radius
        let paths = [];

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.cells[y][x];
                if (cell.blocked) continue;

                const cx = padding + x * cellSize;
                const cy = padding + y * cellSize;
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
}
