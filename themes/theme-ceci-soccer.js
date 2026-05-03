// PrintAMaze theme manifest
// The full deployable theme implementation is integrated into maze.js.
(function(root) {
  const manifest = {
  "key": "ceciSoccer",
  "title": "Ceci Soccer",
  "displayName": "Ceci Soccer",
  "storyGoal": "Ceci, age 7, practices dribbling, passing, teamwork, and confidence with her girls soccer team.",
  "decorations": [
    "soccerBall",
    "practiceCone",
    "soccerCleat",
    "whistle",
    "jerseySeven",
    "shinGuard",
    "miniGoalNet",
    "skillStar",
    "hairBow",
    "waterBottle",
    "teamFlag",
    "passingArrow"
  ],
  "characters": [
    "ceciSoccerPlayer",
    "soccerTeammate",
    "soccerCoach",
    "goalieFriend"
  ],
  "goals": [
    "soccerGoal",
    "skillBadgeBoard",
    "teamHuddle",
    "practiceWin"
  ],
  "borderPattern": "soccerPitch",
  "colors": {
    "wallColor": "#1f6f3d",
    "pathColor": "#f7fff7",
    "bgColor": "#b7e6b1",
    "solutionColor": "#ff8c42"
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
