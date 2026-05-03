// PrintAMaze theme manifest
// The full deployable theme implementation is integrated into maze.js.
(function(root) {
  const manifest = {
  "key": "wesGearRobot",
  "title": "Wes Gear Robot",
  "displayName": "Wes Gear Robot",
  "storyGoal": "Wes builds a gear robot toy and tests parts that help it climb up stairs.",
  "decorations": [
    "gearWheel",
    "stairSteps",
    "robotTrack",
    "crankHandle",
    "axlePeg",
    "blueprintSheet",
    "builderWrench",
    "batteryPack",
    "chainLink",
    "sensorEye",
    "climberClaw",
    "gearSpark"
  ],
  "characters": [
    "wesBuilder",
    "gearRobot",
    "stairClimberBot",
    "tinkeringRobot"
  ],
  "goals": [
    "stairClimbingRobot",
    "gearWorkshop",
    "inventionTable",
    "robotStaircase"
  ],
  "borderPattern": "gearLab",
  "colors": {
    "wallColor": "#36454f",
    "pathColor": "#f4fbff",
    "bgColor": "#b9d7ea",
    "solutionColor": "#ffb000"
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
