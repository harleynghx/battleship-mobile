import React, { useRef, useEffect } from 'react';
import { View, Pressable, StyleSheet, Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CellState, GhostColor } from '@/models/battleship';
import { Colors } from '@/constants/theme';

interface BoardGridProps {
  board: CellState[][];
  onCellPress: (x: number, y: number) => void;
  disabled?: boolean;
  selectedCoordinates?: { x: number, y: number }[];
  selectedColor?: string;
}

const { width } = Dimensions.get('window');
const BOARD_PADDING = 90; 
const CELL_SIZE = Math.floor((width - BOARD_PADDING) / 10);

import Svg, { Path, Ellipse, Circle } from 'react-native-svg';

const AnimatedSvg = Animated.createAnimatedComponent(View);

const GhostMarker = ({ color = '#E0161A', scaleAnim, isPreview = false }: { color?: string, scaleAnim?: Animated.Value, isPreview?: boolean }) => {
  const hoverAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(hoverAnim, { toValue: -2, duration: 500, useNativeDriver: true }),
        Animated.timing(hoverAnim, { toValue: 2, duration: 500, useNativeDriver: true }),
        Animated.timing(hoverAnim, { toValue: 0, duration: 500, useNativeDriver: true })
      ])
    ).start();
  }, [hoverAnim]);

  // Combine scale and hover animations if needed
  const transform = scaleAnim ? [{ scale: scaleAnim }, { translateY: hoverAnim }] : [{ translateY: hoverAnim }];

  // Perfect match to the CSS clip-path polygon from ArcadeWebView
  const ghostPath = `
    M 0 50
    A 50 50 0 0 1 100 50
    L 100 120
    L 90.56 108.67
    L 82.44 88.34
    L 75.44 108.67
    L 65.13 120
    L 56.49 108.67
    L 47.44 88.34
    L 42.25 109.8
    L 31.22 120
    L 21.24 110.5
    L 15 88.34
    L 8.5 109.8
    L 0 120
    Z
  `;

  return (
    <AnimatedSvg style={{ width: CELL_SIZE * 0.8, height: CELL_SIZE * 0.8 * 1.2, opacity: isPreview ? 0.6 : 1, transform }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 120">
        <Path d={ghostPath} fill={color} />
        
        <Ellipse cx="37.5" cy="50" rx="15" ry="18.75" fill="white" />
        <Ellipse cx="80" cy="50" rx="15" ry="18.75" fill="white" />
        
        <Circle cx="42.5" cy="50" r="11.25" fill="#4A46BA" />
        <Circle cx="87.5" cy="50" r="11.25" fill="#4A46BA" />
      </Svg>
    </AnimatedSvg>
  );
};

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

const AnimatedCell = ({ cell, onPress, disabled, x, y, isSelectedPreview, selectedColor }: { cell: CellState, onPress: () => void, disabled: boolean, x: number, y: number, isSelectedPreview: boolean, selectedColor?: string }) => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (cell !== CellState.Water || isSelectedPreview) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true })
      ]).start();
    }
  }, [cell, isSelectedPreview]);

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
          {(cell === CellState.Water && !isSelectedPreview) && (
            <View style={styles.pacDot} />
          )}
          {isSelectedPreview && <GhostMarker color={selectedColor} scaleAnim={scale} isPreview={true} />}
          {cell === CellState.HitBlinky && <GhostMarker color={GhostColor.Blinky} scaleAnim={scale} />}
          {cell === CellState.HitPinky && <GhostMarker color={GhostColor.Pinky} scaleAnim={scale} />}
          {cell === CellState.HitInky && <GhostMarker color={GhostColor.Inky} scaleAnim={scale} />}
          {cell === CellState.HitClyde && <GhostMarker color={GhostColor.Clyde} scaleAnim={scale} />}
          {cell === CellState.Busted && <GhostMarker color="#555555" scaleAnim={scale} />}
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
  selectedCoordinates = [],
  selectedColor,
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
                  isSelectedPreview={selectedCoordinates.some(c => c.x === x && c.y === y)}
                  selectedColor={selectedColor}
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
    width: CELL_SIZE * 0.75,
    height: CELL_SIZE * 0.75,
    borderTopLeftRadius: (CELL_SIZE * 0.75) / 2,
    borderTopRightRadius: (CELL_SIZE * 0.75) / 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    position: 'relative',
    paddingTop: CELL_SIZE * 0.15,
  },
  ghostEyesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    paddingHorizontal: '5%',
  },
  ghostEye: {
    width: CELL_SIZE * 0.2,
    height: CELL_SIZE * 0.25,
    backgroundColor: 'white',
    borderRadius: CELL_SIZE * 0.1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 1,
  },
  ghostPupil: {
    width: CELL_SIZE * 0.1,
    height: CELL_SIZE * 0.1,
    backgroundColor: '#0000AA',
    borderRadius: CELL_SIZE * 0.05,
  },
  ghostLegsContainer: {
    position: 'absolute',
    bottom: -(CELL_SIZE * 0.1),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ghostLeg: {
    width: CELL_SIZE * 0.24,
    height: CELL_SIZE * 0.24,
    transform: [{ rotate: '45deg' }],
  },
});
