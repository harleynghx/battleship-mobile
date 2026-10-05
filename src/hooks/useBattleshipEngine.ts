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
    const monstersAllowed = playerCount === 2 ? 8 : (playerCount === 3 ? 6 : 4);

    for (let i = 0; i < playerCount; i++) {
      newPlayers.push({
        id: `p${i}`,
        name: PLAYER_NAMES[i],
        color: AVAILABLE_COLORS[i],
        hiddenCoordinates: [],
        monstersAllowed: monstersAllowed,
        aliveMonsters: monstersAllowed,
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
    // If all players have hidden all their monsters, we are in Seeking phase.
    const allHidden = players.every(p => p.hiddenCoordinates.length === p.monstersAllowed);
    if (allHidden) {
      // Find collisions (blocks with 2+ players)
      const coordinateMap: { [key: string]: string[] } = {};
      players.forEach(p => {
        p.hiddenCoordinates.forEach(c => {
          const key = `${c.x},${c.y}`;
          if (!coordinateMap[key]) coordinateMap[key] = [];
          coordinateMap[key].push(p.id);
        });
      });

      const updatedPlayers = [...players];
      const newBoard = [...board].map(row => [...row]);
      let someoneBusted = false;

      Object.entries(coordinateMap).forEach(([key, playerIds]) => {
        if (playerIds.length > 1) {
          // BUSTED!
          someoneBusted = true;
          const [x, y] = key.split(',').map(Number);
          newBoard[y][x] = CellState.Busted;

          playerIds.forEach(id => {
            const player = updatedPlayers.find(p => p.id === id);
            if (player) {
              player.aliveMonsters -= 1;
              if (player.aliveMonsters <= 0) {
                player.isEliminated = true;
              }
            }
          });
        }
      });

      if (someoneBusted) {
        setBoard(newBoard);
        setPlayers(updatedPlayers);
        
        // Check if game is instantly over due to busts
        const activePlayers = updatedPlayers.filter(p => !p.isEliminated);
        if (activePlayers.length <= 1) {
          setWinner(activePlayers[0] || null);
          setGameState(GameState.GameOver);
          return;
        }
      }

      setGameState(GameState.Seeking);
    } else {
      setGameState(GameState.Hiding);
    }
  }, [players, board]);

  const selectHideCoordinate = useCallback((x: number, y: number) => {
    if (gameState !== GameState.Hiding) return;

    // Notice: We NO LONGER check for another player's occupancy here!
    // Players can select the same block, but it will BUST them when the game starts.

    const updatedPlayers = [...players];
    const current = updatedPlayers[currentPlayerIndex];

    const existingIndex = current.hiddenCoordinates.findIndex(c => c.x === x && c.y === y);
    if (existingIndex !== -1) {
      // Toggle off (remove)
      current.hiddenCoordinates.splice(existingIndex, 1);
    } else {
      // Toggle on (add) if under limit
      if (current.hiddenCoordinates.length < current.monstersAllowed) {
        current.hiddenCoordinates.push({ x, y });
      }
    }
    
    setPlayers(updatedPlayers);
  }, [gameState, players, currentPlayerIndex]);

  const confirmHide = useCallback(() => {
    if (gameState !== GameState.Hiding) return;
    const current = players[currentPlayerIndex];
    if (current.hiddenCoordinates.length !== current.monstersAllowed) return;

    // Go to next player
    const nextPlayerIndex = currentPlayerIndex + 1;
    if (nextPlayerIndex < players.length) {
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
    let hitColor: GhostColor | null = null;

    // Check if we hit someone
    const updatedPlayers = [...players];
    for (let p of updatedPlayers) {
      if (p.id !== updatedPlayers[currentPlayerIndex].id && !p.isEliminated) {
        const hitIndex = p.hiddenCoordinates.findIndex(c => c.x === x && c.y === y);
        if (hitIndex !== -1) {
          hitColor = p.color;
          p.aliveMonsters -= 1;
          
          if (p.aliveMonsters <= 0) {
            p.isEliminated = true;
          }
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
    selectHideCoordinate,
    confirmHide,
    guessCoordinate,
    resetGame,
  };
};
