import React, { useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CellState, Ship } from '@/models/battleship';
import { Colors } from '@/constants/theme';

interface BoardGridProps {
  board: CellState[][];
  ships?: Ship[];
  onCellPress: (x: number, y: number) => void;
  isPlacementMode?: boolean;
}

const CELL_SIZE = 30;

const AnimatedCell = ({ cell, onPress, isPlacementMode }: { cell: CellState, onPress: () => void, isPlacementMode: boolean }) => {
  const scale = useRef(new Animated.Value(1)).current;

  // Trigger animation when cell state changes to hit or miss
  useEffect(() => {
    if (cell === CellState.Hit || cell === CellState.Miss) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.5, duration: 100, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true })
      ]).start();
    }
  }, [cell]);

  const handlePress = () => {
    if (isPlacementMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      if (cell === CellState.Water || cell === CellState.Ship) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          styles.cell,
          cell === CellState.Hit && styles.cellHit,
          cell === CellState.Miss && styles.cellMiss,
          { transform: [{ scale }] }
        ]}
      >
        {cell === CellState.Hit && <MaterialCommunityIcons name="close-circle-outline" size={24} color="#ff003c" />}
        {cell === CellState.Miss && <MaterialCommunityIcons name="water" size={22} color={Colors.dark.textSecondary} />}
      </Animated.View>
    </Pressable>
  );
};

export const BoardGrid: React.FC<BoardGridProps> = ({ board, ships = [], onCellPress, isPlacementMode = false }) => {
  return (
    <View style={styles.boardContainer}>
      {/* Column Headers */}
      <View style={styles.row}>
        <View style={styles.headerCell} />
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={`col-${i}`} style={styles.headerCell}>
            <Text style={styles.headerText}>{i + 1}</Text>
          </View>
        ))}
      </View>

      <View style={styles.row}>
        {/* Row Headers */}
        <View>
          {Array.from({ length: 10 }).map((_, y) => (
            <View key={`row-header-${y}`} style={styles.headerCell}>
              <Text style={styles.headerText}>{String.fromCharCode(65 + y)}</Text>
            </View>
          ))}
        </View>

        {/* Play Area (Grid + Ship Overlays) */}
        <View style={styles.playArea}>
          {board.map((row, y) => (
            <View key={`row-${y}`} style={styles.row}>
              {row.map((cell, x) => (
                <AnimatedCell
                  key={`cell-${x}-${y}`}
                  cell={cell}
                  onPress={() => onCellPress(x, y)}
                  isPlacementMode={isPlacementMode}
                />
              ))}
            </View>
          ))}

          {/* Render Contiguous Ships as Overlays */}
          {ships.filter(s => s.isPlaced && s.coordinates.length > 0).map(ship => {
            const isHorizontal = ship.coordinates.length > 1 ? ship.coordinates[0].y === ship.coordinates[1].y : true;
            const startCoord = ship.coordinates[0];
            
            const width = isHorizontal ? ship.size * CELL_SIZE : CELL_SIZE;
            const height = isHorizontal ? CELL_SIZE : ship.size * CELL_SIZE;
            const top = startCoord.y * CELL_SIZE;
            const left = startCoord.x * CELL_SIZE;

            return (
              <View
                key={ship.id}
                pointerEvents="none"
                style={[
                  styles.shipOverlay,
                  {
                    width,
                    height,
                    top,
                    left,
                  }
                ]}
              >
                {/* Optional interior visual detail for the ship */}
                <View style={styles.shipDetail} />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    padding: 10,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.dark.backgroundSelected,
  },
  row: {
    flexDirection: 'row',
  },
  headerCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    color: Colors.dark.textSecondary,
    fontFamily: 'Orbitron',
    fontSize: 14,
  },
  playArea: {
    position: 'relative',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 1,
    borderColor: Colors.dark.backgroundSelected,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  cellHit: {
    backgroundColor: '#3b0000', 
  },
  cellMiss: {
    backgroundColor: '#111111',
  },
  shipOverlay: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00ff41', // Neon green wireframe
    backgroundColor: 'rgba(0, 255, 65, 0.1)', // Very faint green tint
    borderRadius: CELL_SIZE / 2, // Pill shape
    justifyContent: 'center',
    alignItems: 'center',
  },
  shipDetail: {
    width: '80%',
    height: '20%',
    backgroundColor: '#00ff41',
    opacity: 0.3,
    borderRadius: 2,
  },
});
