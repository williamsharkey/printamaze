// PrintAMaze theme manifest
// The full deployable theme implementation is integrated into maze.js.
(function(root) {
  const manifest = {
  "key": "deckPlanters",
  "title": "Deck Planters",
  "displayName": "Deck Planters",
  "storyGoal": "Grow seeds into herbs, tomatoes, and flowers in planter boxes on a sunny deck.",
  "decorations": [
    "deckSeed",
    "sprout",
    "planterBox",
    "wateringCan",
    "seedPacket",
    "trowel",
    "deckPlank",
    "tomatoSprout",
    "basilLeaf",
    "gardenGlove",
    "sunTag",
    "trellisVine"
  ],
  "characters": [
    "sproutScout",
    "deckGardenerKid",
    "seedSprite",
    "ladybugHelper"
  ],
  "goals": [
    "deckPlanterGarden",
    "firstTomato",
    "herbRail",
    "bloomingPlanter"
  ],
  "borderPattern": "deckPlanters",
  "colors": {
    "wallColor": "#4b3a24",
    "pathColor": "#fffdf2",
    "bgColor": "#d9c9a3",
    "solutionColor": "#2f7d32"
  },
  "integration": "Full SVG functions and vocabulary are integrated into maze.js 20260502-6."
};
  if (root) {
    root.PrintAMazeThemeManifests = root.PrintAMazeThemeManifests || {};
    root.PrintAMazeThemeManifests[manifest.key] = manifest;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = manifest;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
