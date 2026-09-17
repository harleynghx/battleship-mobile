export type Coordinate = {
  x: number;
  y: number;
};

export enum ShipType {
  Carrier = 'CARRIER', // Size 5
  Battleship = 'BATTLESHIP', // Size 4
  Cruiser = 'CRUISER', // Size 3
  Submarine = 'SUBMARINE', // Size 3
  Destroyer = 'DESTROYER', // Size 2
}

export type Ship = {
  id: string;
  type: ShipType;
  size: number;
  coordinates: Coordinate[]; // Coordinates the ship occupies
  isPlaced: boolean;
};

export enum CellState {
  Water = 'WATER',
  Ship = 'SHIP',
  Hit = 'HIT',
  Miss = 'MISS',
}

export type PlayerState = {
  id: string;
  isReady: boolean;
  ships: Ship[];
  board: CellState[][]; // 10x10 grid
};

export enum GameState {
  MainMenu = 'MAIN_MENU',
  Matchmaking = 'MATCHMAKING',
  PlacingShips = 'PLACING_SHIPS',
  Playing = 'PLAYING',
  GameOver = 'GAME_OVER',
}

export const getShipSize = (type: ShipType): number => {
  switch (type) {
    case ShipType.Carrier:
      return 5;
    case ShipType.Battleship:
      return 4;
    case ShipType.Cruiser:
      return 3;
    case ShipType.Submarine:
      return 3;
    case ShipType.Destroyer:
      return 2;
  }
};
