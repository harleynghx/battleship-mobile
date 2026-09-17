export type Coordinate = {
  x: number;
  y: number;
};

export enum GhostColor {
  Blinky = '#E0161A', // Red
  Pinky = '#FFB8FF',  // Pink
  Inky = '#00FFFF',   // Cyan
  Clyde = '#FFB852',  // Orange
}

export type Player = {
  id: string;
  name: string;
  color: GhostColor;
  hiddenCoordinate: Coordinate | null;
  isEliminated: boolean;
};

export enum CellState {
  Water = 'WATER',
  Miss = 'MISS',
  // Replaced Ship/Hit with specific ghosts to render the right color when found
  HitBlinky = 'HIT_BLINKY',
  HitPinky = 'HIT_PINKY',
  HitInky = 'HIT_INKY',
  HitClyde = 'HIT_CLYDE',
}

export enum GameState {
  MainMenu = 'MAIN_MENU',
  SetupPlayers = 'SETUP_PLAYERS', // Choose 2-4 players
  PassingDevice = 'PASSING_DEVICE', // "Pass to Player X" overlay
  Hiding = 'HIDING', // Player X hides their ghost
  Seeking = 'SEEKING', // Player X guesses a coordinate
  GameOver = 'GAME_OVER',
}
