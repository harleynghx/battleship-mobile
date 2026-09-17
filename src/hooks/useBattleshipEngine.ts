import { useState, useCallback } from 'react';
import { CellState, Coordinate, GameState, Ship, ShipType, getShipSize } from '@/models/battleship';

const BOARD_SIZE = 10;

const createEmptyBoard = (): CellState[][] => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(CellState.Water));
};

const initialShips = Object.values(ShipType).map((type) => ({
  id: type.toLowerCase(),
  type,
  size: getShipSize(type),
  coordinates: [],
  isPlaced: false,
}));

export const useBattleshipEngine = () => {
  const [board, setBoard] = useState<CellState[][]>(createEmptyBoard());
  const [ships, setShips] = useState<Ship[]>(initialShips);
  const [gameState, setGameState] = useState<GameState>(GameState.PlacingShips);
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [isHorizontal, setIsHorizontal] = useState(true); // Orientation for placement

  const placeShip = useCallback(
    (x: number, y: number) => {
      if (!selectedShipId) return;

      const ship = ships.find((s) => s.id === selectedShipId);
      if (!ship || ship.isPlaced) return;

      // Check bounds
      if (isHorizontal && x + ship.size > BOARD_SIZE) return;
      if (!isHorizontal && y + ship.size > BOARD_SIZE) return;

      // Check overlap
      const coordinates: Coordinate[] = [];
      for (let i = 0; i < ship.size; i++) {
        const checkX = isHorizontal ? x + i : x;
        const checkY = isHorizontal ? y : y + i;
        if (board[checkY][checkX] !== CellState.Water) {
          // Overlap detected
          return;
        }
        coordinates.push({ x: checkX, y: checkY });
      }

      // Update Board
      const newBoard = [...board].map(row => [...row]);
      coordinates.forEach(c => {
        newBoard[c.y][c.x] = CellState.Ship;
      });
      setBoard(newBoard);

      // Update Ships
      const newShips = ships.map(s => {
        if (s.id === selectedShipId) {
          return { ...s, isPlaced: true, coordinates };
        }
        return s;
      });
      setShips(newShips);
      setSelectedShipId(null); // Deselect

      // Check if all ships placed
      if (newShips.every(s => s.isPlaced)) {
        setGameState(GameState.Playing); // Ready to play locally
      }
    },
    [board, ships, selectedShipId, isHorizontal]
  );

  const fireShot = useCallback(
    (x: number, y: number) => {
      if (gameState !== GameState.Playing) return;

      const currentCell = board[y][x];
      if (currentCell === CellState.Hit || currentCell === CellState.Miss) {
        // Already fired here
        return;
      }

      const newBoard = [...board].map(row => [...row]);
      if (currentCell === CellState.Ship) {
        newBoard[y][x] = CellState.Hit;
      } else {
        newBoard[y][x] = CellState.Miss;
      }
      setBoard(newBoard);
    },
    [board, gameState]
  );

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setShips(initialShips);
    setGameState(GameState.PlacingShips);
    setSelectedShipId(null);
  };

  return {
    board,
    ships,
    gameState,
    selectedShipId,
    setSelectedShipId,
    isHorizontal,
    setIsHorizontal,
    placeShip,
    fireShot,
    resetGame,
  };
};
