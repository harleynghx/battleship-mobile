import { useState, useCallback } from 'react';
import { CellState, Coordinate, GameState, Player, GhostColor } from '@/models/battleship';

const BOARD_SIZE = 10;

const createEmptyBoard = (): CellState[][] => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(CellState.Water));
};

const AVAILABLE_COLORS = [
  GhostColor.Blinky,
  GhostColor.Pinky,
  GhostColor.Inky,
  GhostColor.Clyde,
];

const PLAYER_NAMES = ['BLINKY (P1)', 'PINKY (P2)', 'INKY (P3)', 'CLYDE (P4)'];

export const useBattleshipEngine = () => {
  const [board, setBoard] = useState<CellState[][]>(createEmptyBoard());
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameState, setGameState] = useState<GameState>(GameState.SetupPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [winner, setWinner] = useState<Player | null>(null);

  const startGame = useCallback((playerCount: number) => {
    const newPlayers: Player[] = [];
    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        id: `p${i}`,
        name: PLAYER_NAMES[i],
        color: AVAILABLE_COLORS[i],
        hiddenCoordinate: null,
        isEliminated: false,
      });
    }
    setPlayers(newPlayers);
    setBoard(createEmptyBoard());
    setCurrentPlayerIndex(0);
    setWinner(null);
    setGameState(GameState.PassingDevice); // Pass to P1 to hide
  }, []);

  const confirmPassDevice = useCallback(() => {
    // If all players have hidden, we are in Seeking phase. Otherwise, Hiding phase.
    const allHidden = players.every(p => p.hiddenCoordinate !== null);
    if (allHidden) {
      setGameState(GameState.Seeking);
    } else {
      setGameState(GameState.Hiding);
    }
  }, [players]);

  const hideGhost = useCallback((x: number, y: number) => {
    if (gameState !== GameState.Hiding) return;

    // Check if another player is already hiding here
    const isOccupied = players.some(p => p.hiddenCoordinate?.x === x && p.hiddenCoordinate?.y === y);
    if (isOccupied) return;

    const updatedPlayers = [...players];
    updatedPlayers[currentPlayerIndex].hiddenCoordinate = { x, y };
    setPlayers(updatedPlayers);

    // Go to next player
    const nextPlayerIndex = currentPlayerIndex + 1;
    if (nextPlayerIndex < updatedPlayers.length) {
      setCurrentPlayerIndex(nextPlayerIndex);
      setGameState(GameState.PassingDevice);
    } else {
      // Everyone hid! Start seeking with P1.
      setCurrentPlayerIndex(0);
      setGameState(GameState.PassingDevice);
    }
  }, [gameState, players, currentPlayerIndex]);

  const getNextActivePlayerIndex = (currentIndex: number, currentPlayers: Player[]) => {
    let nextIndex = (currentIndex + 1) % currentPlayers.length;
    while (currentPlayers[nextIndex].isEliminated && nextIndex !== currentIndex) {
      nextIndex = (nextIndex + 1) % currentPlayers.length;
    }
    return nextIndex;
  };

  const guessCoordinate = useCallback((x: number, y: number) => {
    if (gameState !== GameState.Seeking) return;

    // Can't guess a cell that's already guessed
    if (board[y][x] !== CellState.Water) return;

    const newBoard = [...board].map(row => [...row]);
    let hitPlayerId: string | null = null;
    let hitColor: GhostColor | null = null;

    // Check if we hit someone
    const updatedPlayers = [...players];
    for (let p of updatedPlayers) {
      if (p.id !== updatedPlayers[currentPlayerIndex].id && !p.isEliminated) {
        if (p.hiddenCoordinate?.x === x && p.hiddenCoordinate?.y === y) {
          p.isEliminated = true;
          hitPlayerId = p.id;
          hitColor = p.color;
          break;
        }
      }
    }

    if (hitColor) {
      if (hitColor === GhostColor.Blinky) newBoard[y][x] = CellState.HitBlinky;
      if (hitColor === GhostColor.Pinky) newBoard[y][x] = CellState.HitPinky;
      if (hitColor === GhostColor.Inky) newBoard[y][x] = CellState.HitInky;
      if (hitColor === GhostColor.Clyde) newBoard[y][x] = CellState.HitClyde;
    } else {
      newBoard[y][x] = CellState.Miss;
    }

    setBoard(newBoard);
    setPlayers(updatedPlayers);

    const activePlayers = updatedPlayers.filter(p => !p.isEliminated);
    
    // Win condition: Only 1 player left
    if (activePlayers.length === 1) {
      setWinner(activePlayers[0]);
      setGameState(GameState.GameOver);
    } else {
      // Next turn
      setCurrentPlayerIndex(getNextActivePlayerIndex(currentPlayerIndex, updatedPlayers));
      setGameState(GameState.PassingDevice);
    }
  }, [board, players, currentPlayerIndex, gameState]);

  const resetGame = () => {
    setGameState(GameState.SetupPlayers);
    setPlayers([]);
    setBoard(createEmptyBoard());
    setCurrentPlayerIndex(0);
    setWinner(null);
  };

  const currentPlayer = players[currentPlayerIndex];

  return {
    board,
    players,
    gameState,
    currentPlayer,
    winner,
    startGame,
    confirmPassDevice,
    hideGhost,
    guessCoordinate,
    resetGame,
  };
};
