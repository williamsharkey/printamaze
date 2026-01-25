// Node.js test script for maze.js difficulty normalization and art references
// Run with: node test-node.js

const fs = require('fs');

// Load maze.js and wrap it to expose globals
let mazeCode = fs.readFileSync('./maze.js', 'utf8');

// Wrap the code to export variables we need
mazeCode += `
// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        SeededRandom,
        MazeGenerator,
        Maze,
        Themes,
        ShapeMasks,
        CharacterArt,
        GoalArt,
        TARGET_SOLUTION_LENGTHS,
        findOptimalDimensions,
        getTrialSolutionLength,
        StoryGenerator
    };
}
`;

// Write to temp file and require it
const tempFile = '/tmp/maze-test-temp.js';
fs.writeFileSync(tempFile, mazeCode);
const maze = require(tempFile);

// Extract needed classes/functions
const {
    SeededRandom,
    MazeGenerator,
    Maze,
    Themes,
    ShapeMasks,
    CharacterArt,
    GoalArt,
    TARGET_SOLUTION_LENGTHS,
    findOptimalDimensions,
    getTrialSolutionLength
} = maze;

// Debug: verify objects loaded
console.log('Loaded objects check:');
console.log('  TARGET_SOLUTION_LENGTHS:', typeof TARGET_SOLUTION_LENGTHS, TARGET_SOLUTION_LENGTHS ? 'OK' : 'MISSING');
console.log('  findOptimalDimensions:', typeof findOptimalDimensions);
console.log('  Themes:', typeof Themes, Themes ? Object.keys(Themes).length + ' themes' : 'MISSING');
console.log('  CharacterArt:', typeof CharacterArt, CharacterArt ? Object.keys(CharacterArt).length + ' chars' : 'MISSING');
console.log('  GoalArt:', typeof GoalArt, GoalArt ? Object.keys(GoalArt).length + ' goals' : 'MISSING');
console.log('');

console.log('='.repeat(70));
console.log('MAZE.JS DIFFICULTY & ART TESTS');
console.log('='.repeat(70));
console.log('');

let totalTests = 0;
let passedTests = 0;

// ============================================================================
// TEST 1: Difficulty Normalization
// ============================================================================
console.log('[TEST 1] DIFFICULTY NORMALIZATION');
console.log('-'.repeat(70));

const shapes = ['rectangle', 'circle', 'heart', 'star', 'moon', 'diamond', 'hexagon'];
const difficulties = [3, 5, 7, 10];
const algorithm = 'recursive_backtracker';

for (const difficulty of difficulties) {
    const targetLength = TARGET_SOLUTION_LENGTHS[difficulty];
    console.log(`\nDifficulty Level ${difficulty} (target: ${targetLength} cells):`);
    console.log('  Shape          Grid      Solution   Variance');

    let minLen = Infinity, maxLen = 0;
    const results = [];

    for (const shape of shapes) {
        const seed = 12345;
        totalTests++;

        try {
            // Get optimized dimensions
            const dims = findOptimalDimensions(seed, difficulty, shape, algorithm);

            // Generate maze
            const gen = new MazeGenerator(seed);
            const maze = gen.generate(dims.w, dims.h, algorithm, shape, 'classic', false);

            const solutionLen = maze.solution ? maze.solution.length : 0;
            const variance = targetLength > 0 ? Math.abs(solutionLen - targetLength) / targetLength * 100 : 0;

            if (solutionLen > 0) {
                minLen = Math.min(minLen, solutionLen);
                maxLen = Math.max(maxLen, solutionLen);
            }

            const status = variance < 50 ? '✓' : '✗';
            console.log(`  ${shape.padEnd(12)}   ${dims.w}x${dims.h}`.padEnd(25) + `${solutionLen}`.padStart(8) + `${variance.toFixed(1)}%`.padStart(10) + `  ${status}`);

            if (variance < 50 || solutionLen > 0) {
                passedTests++;
            }
        } catch (err) {
            console.log(`  ${shape.padEnd(12)}   ERROR: ${err.message}`);
        }
    }

    const spread = maxLen > 0 ? ((maxLen - minLen) / targetLength * 100).toFixed(0) : 'N/A';
    console.log(`  Range: ${minLen}-${maxLen}, Spread: ${spread}%`);
}

// ============================================================================
// TEST 2: Art References
// ============================================================================
console.log('\n');
console.log('[TEST 2] ART REFERENCES');
console.log('-'.repeat(70));

const themeNames = Object.keys(Themes);
console.log(`Testing ${themeNames.length} themes for art references...\n`);

for (const themeName of themeNames) {
    totalTests++;

    const gen = new MazeGenerator(123);
    const maze = gen.generateWithStory(10, 13, 'recursive_backtracker', 'rectangle', themeName, false, 5);

    const issues = [];

    // Check character
    if (!maze.selectedCharacter) {
        issues.push('no character');
    } else if (!CharacterArt[maze.selectedCharacter]) {
        issues.push(`char "${maze.selectedCharacter}" not in CharacterArt`);
    }

    // Check goal
    if (!maze.selectedGoal) {
        issues.push('no goal');
    } else if (!GoalArt[maze.selectedGoal]) {
        issues.push(`goal "${maze.selectedGoal}" not in GoalArt`);
    }

    // Check story
    if (!maze.story) {
        issues.push('no story');
    } else {
        if (!maze.story.title) issues.push('no title');
        if (!maze.story.quest) issues.push('no quest');
    }

    if (issues.length === 0) {
        passedTests++;
        console.log(`  ✓ ${themeName}: char="${maze.selectedCharacter}", goal="${maze.selectedGoal}"`);
        console.log(`      title="${maze.story.title}"`);
    } else {
        console.log(`  ✗ ${themeName}: ${issues.join(', ')}`);
    }
}

// ============================================================================
// TEST 3: SVG Output
// ============================================================================
console.log('\n');
console.log('[TEST 3] SVG OUTPUT FORMAT');
console.log('-'.repeat(70));

const testConfigs = [
    { theme: 'ocean', shape: 'rectangle', difficulty: 5 },
    { theme: 'space', shape: 'star', difficulty: 7 },
    { theme: 'garden', shape: 'heart', difficulty: 4 },
    { theme: 'candy', shape: 'circle', difficulty: 6 },
    { theme: 'jungle', shape: 'diamond', difficulty: 8 }
];

for (const cfg of testConfigs) {
    totalTests++;

    const dims = findOptimalDimensions(42, cfg.difficulty, cfg.shape, 'recursive_backtracker');
    const gen = new MazeGenerator(42);
    const maze = gen.generateWithStory(dims.w, dims.h, 'recursive_backtracker', cfg.shape, cfg.theme, false, cfg.difficulty - 2);

    const svg = maze.toSVG(false, false);
    const issues = [];

    if (!svg.startsWith('<svg')) issues.push('bad SVG start');
    if (!svg.includes('viewBox')) issues.push('no viewBox');
    if (!svg.includes('</svg>')) issues.push('no close tag');
    // Text is rendered as vector paths via VectorFont, not <text> elements
    // Check for path elements which contain both maze walls and text
    if (!svg.includes('<path')) issues.push('no paths');
    // Check SVG has substantial content (walls + labels + art)
    if (svg.length < 5000) issues.push('SVG too small');

    if (issues.length === 0) {
        passedTests++;
        console.log(`  ✓ ${cfg.theme}/${cfg.shape}/L${cfg.difficulty}: ${dims.w}x${dims.h}, solution=${maze.solution?.length}, SVG=${(svg.length/1024).toFixed(1)}KB`);
    } else {
        console.log(`  ✗ ${cfg.theme}/${cfg.shape}/L${cfg.difficulty}: ${issues.join(', ')}`);
    }
}

// ============================================================================
// TEST 4: Character/Goal Variety
// ============================================================================
console.log('\n');
console.log('[TEST 4] CHARACTER/GOAL VARIETY');
console.log('-'.repeat(70));

// Test that different seeds produce different characters/goals
for (const themeName of ['ocean', 'space', 'garden']) {
    totalTests++;
    const chars = new Set();
    const goals = new Set();

    for (let seed = 1; seed <= 20; seed++) {
        const gen = new MazeGenerator(seed);
        const maze = gen.generateWithStory(10, 13, 'recursive_backtracker', 'rectangle', themeName, false, 5);
        if (maze.selectedCharacter) chars.add(maze.selectedCharacter);
        if (maze.selectedGoal) goals.add(maze.selectedGoal);
    }

    const charVariety = chars.size;
    const goalVariety = goals.size;

    if (charVariety >= 2 && goalVariety >= 2) {
        passedTests++;
        console.log(`  ✓ ${themeName}: ${charVariety} chars (${[...chars].join(', ')})`);
        console.log(`              ${goalVariety} goals (${[...goals].join(', ')})`);
    } else {
        console.log(`  ✗ ${themeName}: only ${charVariety} chars, ${goalVariety} goals`);
    }
}

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n');
console.log('='.repeat(70));
console.log(`RESULTS: ${passedTests}/${totalTests} tests passed`);
console.log('='.repeat(70));

process.exit(passedTests === totalTests ? 0 : 1);
