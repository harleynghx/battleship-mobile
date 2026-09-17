import React, { useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CellState, GhostColor } from '@/models/battleship';
import { Colors } from '@/constants/theme';

interface BoardGridProps {
  board: CellState[][];
  onCellPress: (x: number, y: number) => void;
  disabled?: boolean;
}

const { width } = Dimensions.get('window');
const BOARD_PADDING = 90; 
const CELL_SIZE = Math.floor((width - BOARD_PADDING) / 10);

const GhostMarker = ({ color = '#E0161A', scaleAnim }: { color?: string, scaleAnim?: Animated.Value }) => (
  <Animated.View style={[styles.ghostBody, { backgroundColor: color, transform: scaleAnim ? [{ scale: scaleAnim }] : [] }]}>
    <View style={styles.ghostEyesContainer}>
      <View style={styles.ghostEye}>
        <View style={styles.ghostPupil} />
      </View>
      <View style={styles.ghostEye}>
        <View style={styles.ghostPupil} />
      </View>
    </View>
    <View style={styles.ghostLegsContainer}>
       <View style={[styles.ghostLeg, { backgroundColor: color }]} />
       <View style={[styles.ghostLeg, { backgroundColor: color }]} />
       <View style={[styles.ghostLeg, { backgroundColor: color }]} />
    </View>
  </Animated.View>
);

const MAZE_WALLS = [
  ['tl', 't', 'tb', 't', 'tr', 'tl', 't', 'tb', 't', 'tr'],
  ['l', 'r', 'tl', 'b', 'r', 'l', 'b', 'tr', 'l', 'r'],
  ['l', 'b', 'b', 'tr', 'l', 'r', 'tl', 'b', 'b', 'r'],
  ['tl', 't', 't', 'r', 'l', 'r', 'l', 't', 't', 'tr'],
  ['l', 'r', 'tl', 'b', 'b', 'b', 'b', 'tr', 'l', 'r'],
  ['l', 'r', 'l', 't', 't', 't', 't', 'r', 'l', 'r'],
  ['bl', 'b', 'b', 'tr', 'tl', 'tr', 'tl', 'b', 'b', 'br'],
  ['tl', 'tr', 'tl', 'b', 'b', 'b', 'b', 'tr', 'tl', 'tr'],
  ['l', 'b', 'r', 'tl', 't', 't', 'tr', 'l', 'b', 'r'],
  ['bl', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'br'],
];

const AnimatedCell = ({ cell, onPress, disabled, x, y }: { cell: CellState, onPress: () => void, disabled: boolean, x: number, y: number }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (cell !== CellState.Water) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true })
      ]).start();
    }
  }, [cell]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const walls = MAZE_WALLS[y][x];

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <View style={styles.cellContainer}>
        <View style={[
          styles.cell,
          walls.includes('t') && styles.wallTop,
          walls.includes('r') && styles.wallRight,
          walls.includes('b') && styles.wallBottom,
          walls.includes('l') && styles.wallLeft,
        ]}>
          {(cell === CellState.Water) && (
            <View style={styles.pacDot} />
          )}
          {cell === CellState.HitBlinky && <GhostMarker color={GhostColor.Blinky} scaleAnim={scale} />}
          {cell === CellState.HitPinky && <GhostMarker color={GhostColor.Pinky} scaleAnim={scale} />}
          {cell === CellState.HitInky && <GhostMarker color={GhostColor.Inky} scaleAnim={scale} />}
          {cell === CellState.HitClyde && <GhostMarker color={GhostColor.Clyde} scaleAnim={scale} />}
          {cell === CellState.Miss && <View style={styles.missDot} />}
        </View>
      </View>
    </Pressable>
  );
};

export const BoardGrid: React.FC<BoardGridProps> = ({ 
  board, 
  onCellPress, 
  disabled = false,
}) => {
  return (
    <View style={styles.boardContainer}>
      <View style={styles.mazeWrapper}>
        <View style={styles.playArea}>
          {board.map((row, y) => (
            <View key={`row-${y}`} style={styles.row}>
              {row.map((cell, x) => (
                <AnimatedCell
                  key={`cell-${x}-${y}`}
                  x={x}
                  y={y}
                  cell={cell}
                  onPress={() => onCellPress(x, y)}
                  disabled={disabled}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    padding: 10,
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: Colors.dark.backgroundSelected,
  },
  row: {
    flexDirection: 'row',
  },
  mazeWrapper: {
    padding: 4,
    borderWidth: 4,
    borderColor: '#1919A6',
    borderRadius: 12,
    backgroundColor: '#000000',
  },
  playArea: {
    position: 'relative',
    backgroundColor: '#000000',
  },
  cellContainer: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  wallTop: {
    borderTopWidth: 2,
    borderTopColor: '#1919A6',
  },
  wallRight: {
    borderRightWidth: 2,
    borderRightColor: '#1919A6',
  },
  wallBottom: {
    borderBottomWidth: 2,
    borderBottomColor: '#1919A6',
  },
  wallLeft: {
    borderLeftWidth: 2,
    borderLeftColor: '#1919A6',
  },
  pacDot: {
    width: 6,
    height: 6,
    backgroundColor: '#FFB8AE',
    borderRadius: 3,
  },
  missDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.dark.textSecondary,
    borderRadius: 4,
  },
  ghostBody: {
    width: 20,
    height: 24,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'relative',
  },
  ghostEyesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 4,
  },
  ghostEye: {
    width: 6,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 1,
  },
  ghostPupil: {
    width: 3,
    height: 3,
    backgroundColor: '#0000FF',
    borderRadius: 1.5,
  },
  ghostLegsContainer: {
    position: 'absolute',
    bottom: -3,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ghostLeg: {
    width: 6,
    height: 6,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});
