export type Coordinate = {
  x: number;
  y: number;
};

export enum GhostColor {
  Blinky = '#FF4D6D', // Vibrant Strawberry
  Pinky = '#FF66CC',  // Saturated Bubblegum
  Inky = '#33E0FF',   // Bright Sky Cyan
  Clyde = '#FFB833',  // Vibrant Mango/Orange
}

export type Player = {
  id: string;
  name: string;
  color: GhostColor;
  hiddenCoordinates: Coordinate[];
  monstersAllowed: number;
  aliveMonsters: number;
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
  Busted = 'BUSTED', // When 2+ players hide in the exact same spot
}

export enum GameState {
  MainMenu = 'MAIN_MENU',
  SetupPlayers = 'SETUP_PLAYERS', // Choose 2-4 players
  PassingDevice = 'PASSING_DEVICE', // "Pass to Player X" overlay
  Hiding = 'HIDING', // Player X hides their ghost
  Seeking = 'SEEKING', // Player X guesses a coordinate
  GameOver = 'GAME_OVER',
}
