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

  const canPlaceShip = useCallback((ship: Ship, x: number, y: number, horizontal: boolean): boolean => {
    // Check bounds
    if (horizontal && x + ship.size > BOARD_SIZE) return false;
    if (!horizontal && y + ship.size > BOARD_SIZE) return false;

    // Check overlap
    for (let i = 0; i < ship.size; i++) {
      const checkX = horizontal ? x + i : x;
      const checkY = horizontal ? y : y + i;
      // Note: If we are picking up a ship to move it, we should theoretically ignore its own cells,
      // but since we will call removeShip before placing, it's fine.
      if (board[checkY][checkX] !== CellState.Water) {
        return false;
      }
    }
    return true;
  }, [board]);

  const removeShip = useCallback((shipId: string) => {
    const ship = ships.find(s => s.id === shipId);
    if (!ship || !ship.isPlaced) return;

    // Remove from board
    const newBoard = [...board].map(row => [...row]);
    ship.coordinates.forEach(c => {
      newBoard[c.y][c.x] = CellState.Water;
    });
    setBoard(newBoard);

    // Update ships
    const newShips = ships.map(s => {
      if (s.id === shipId) {
        return { ...s, isPlaced: false, coordinates: [] };
      }
      return s;
    });
    setShips(newShips);
    setGameState(GameState.PlacingShips);
  }, [board, ships]);

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
      if (!canPlaceShip(ship, x, y, isHorizontal)) {
        return false; // Return false if placement fails
      }

      for (let i = 0; i < ship.size; i++) {
        const checkX = isHorizontal ? x + i : x;
        const checkY = isHorizontal ? y : y + i;
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
    removeShip,
    canPlaceShip,
    fireShot,
    resetGame,
  };
};
