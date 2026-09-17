import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, PanResponder, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CellState, Ship } from '@/models/battleship';
import { Colors } from '@/constants/theme';

interface BoardGridProps {
  board: CellState[][];
  ships?: Ship[];
  onCellPress: (x: number, y: number) => void;
  isPlacementMode?: boolean;
  selectedShip?: Ship | null;
  onShipPlace?: (x: number, y: number) => void;
  onShipPickup?: (shipId: string, isHorizontal: boolean) => void;
  canPlaceShip?: (ship: Ship, x: number, y: number, horizontal: boolean) => boolean;
  isHorizontal?: boolean;
  onDragStateChange?: (isDragging: boolean) => void;
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
    <Pressable onPress={handlePress} disabled={isPlacementMode}>
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

const ShipBlueprint = ({ size, isHorizontal, color = '#00ff41' }: { size: number, isHorizontal: boolean, color?: string }) => {
  const padding = 4;
  const outerWidth = isHorizontal ? size * CELL_SIZE : CELL_SIZE;
  const outerHeight = isHorizontal ? CELL_SIZE : size * CELL_SIZE;
  const innerWidth = outerWidth - padding * 2;
  const innerHeight = outerHeight - padding * 2;
  const borderRadius = isHorizontal ? innerHeight / 2 : innerWidth / 2;
  const bgColor = color === '#00ff41' ? 'rgba(0, 255, 65, 0.15)' : 'rgba(255, 0, 60, 0.15)';

  return (
    <View style={[styles.shipBlueprint, {
      width: innerWidth,
      height: innerHeight,
      borderRadius,
      borderColor: color,
      backgroundColor: bgColor,
    }]}>
      {/* Spine */}
      <View style={[styles.shipSpine, { backgroundColor: color, ...(isHorizontal ? { width: '80%', height: 2 } : { width: 2, height: '80%' }) }]} />
      
      {/* Engine Core */}
      <View style={[styles.shipEngine, { backgroundColor: color, ...(isHorizontal ? { left: 6 } : { top: 6 }) }]} />

      {/* Ribs */}
      <View style={[StyleSheet.absoluteFill, { flexDirection: isHorizontal ? 'row' : 'column', justifyContent: 'space-evenly', alignItems: 'center' }]}>
        {Array.from({ length: size }).map((_, i) => (
          <View key={i} style={[styles.shipRib, { backgroundColor: color, ...(isHorizontal ? { width: 2, height: '40%' } : { width: '40%', height: 2 }) }]} />
        ))}
      </View>
    </View>
  );
};

export const BoardGrid: React.FC<BoardGridProps> = ({ 
  board, 
  ships = [], 
  onCellPress, 
  isPlacementMode = false,
  selectedShip = null,
  onShipPlace,
  onShipPickup,
  canPlaceShip,
  isHorizontal = true,
  onDragStateChange
}) => {
  const [dragPreview, setDragPreview] = useState<{ x: number, y: number, ship: Ship, isHorizontal: boolean, offsetX?: number, offsetY?: number } | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  // Use a ref to keep props fresh inside PanResponder closures
  const propsRef = useRef({ isPlacementMode, selectedShip, ships, isHorizontal, onShipPlace, onShipPickup, onDragStateChange });
  propsRef.current = { isPlacementMode, selectedShip, ships, isHorizontal, onShipPlace, onShipPickup, onDragStateChange };
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => propsRef.current.isPlacementMode,
      onMoveShouldSetPanResponder: () => propsRef.current.isPlacementMode,
      onPanResponderTerminationRequest: () => false, // Prevent ScrollView from stealing
      onPanResponderGrant: (evt) => {
        if (!propsRef.current.isPlacementMode) return;
        const { locationX, locationY } = evt.nativeEvent;
        dragStartPos.current = { x: locationX, y: locationY };
        const gridX = Math.floor(locationX / CELL_SIZE);
        const gridY = Math.floor(locationY / CELL_SIZE);
        
        if (gridX >= 0 && gridX < 10 && gridY >= 0 && gridY < 10) {
          if (propsRef.current.onDragStateChange) propsRef.current.onDragStateChange(true);
          
          if (propsRef.current.selectedShip) {
            setDragPreview({ x: gridX, y: gridY, ship: propsRef.current.selectedShip, isHorizontal: propsRef.current.isHorizontal, offsetX: 0, offsetY: 0 });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } else {
            // Check if we touched an existing ship
            const touchedShip = propsRef.current.ships.find(s => 
              s.isPlaced && s.coordinates.some(c => c.x === gridX && c.y === gridY)
            );
            if (touchedShip && propsRef.current.onShipPickup) {
              const shipIsHorizontal = touchedShip.coordinates.length > 1 ? touchedShip.coordinates[0].y === touchedShip.coordinates[1].y : true;
              propsRef.current.onShipPickup(touchedShip.id, shipIsHorizontal);
              const startX = touchedShip.coordinates[0].x;
              const startY = touchedShip.coordinates[0].y;
              setDragPreview({ 
                x: startX, 
                y: startY, 
                ship: touchedShip, 
                isHorizontal: shipIsHorizontal,
                offsetX: gridX - startX,
                offsetY: gridY - startY
              });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        if (!propsRef.current.isPlacementMode) return;
        
        const currentX = dragStartPos.current.x + gestureState.dx;
        const currentY = dragStartPos.current.y + gestureState.dy;
        const gridX = Math.floor(currentX / CELL_SIZE);
        const gridY = Math.floor(currentY / CELL_SIZE);
        
        setDragPreview(prev => {
          if (!prev) return null;
          const newX = gridX - (prev.offsetX || 0);
          const newY = gridY - (prev.offsetY || 0);
          if (newX !== prev.x || newY !== prev.y) {
            return { ...prev, x: newX, y: newY };
          }
          return prev;
        });
      },
      onPanResponderRelease: (evt) => {
        if (propsRef.current.onDragStateChange) propsRef.current.onDragStateChange(false);
        if (!propsRef.current.isPlacementMode) return;
        
        setDragPreview(prev => {
          if (prev && propsRef.current.onShipPlace) {
            propsRef.current.onShipPlace(prev.x, prev.y);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
          return null;
        });
      },
      onPanResponderTerminate: () => {
        if (propsRef.current.onDragStateChange) propsRef.current.onDragStateChange(false);
        setDragPreview(null);
      }
    })
  ).current;

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
          {ships.filter(s => s.isPlaced && s.coordinates.length > 0 && s.id !== dragPreview?.ship.id).map(ship => {
            const isShipHorizontal = ship.coordinates.length > 1 ? ship.coordinates[0].y === ship.coordinates[1].y : true;
            const startCoord = ship.coordinates[0];
            const top = startCoord.y * CELL_SIZE + 4; // 4 is the blueprint padding
            const left = startCoord.x * CELL_SIZE + 4;

            return (
              <View
                key={ship.id}
                pointerEvents="none"
                style={{ position: 'absolute', top, left }}
              >
                <ShipBlueprint size={ship.size} isHorizontal={isShipHorizontal} color="#00ff41" />
              </View>
            );
          })}

          {/* Render Drag Preview */}
          {isPlacementMode && dragPreview && (
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: dragPreview.y * CELL_SIZE + 4,
                left: dragPreview.x * CELL_SIZE + 4,
                zIndex: 10,
              }}
            >
              <ShipBlueprint 
                size={dragPreview.ship.size} 
                isHorizontal={dragPreview.isHorizontal} 
                color={canPlaceShip && canPlaceShip(dragPreview.ship, dragPreview.x, dragPreview.y, dragPreview.isHorizontal) ? '#00ff41' : '#ff003c'} 
              />
            </View>
          )}

          {/* Invisible Touch Overlay (to capture precise relative coords without collapsing) */}
          {isPlacementMode && (
            <View 
              style={{ 
                position: 'absolute', 
                top: 0, left: 0, 
                width: 10 * CELL_SIZE, 
                height: 10 * CELL_SIZE, 
                zIndex: 100,
                backgroundColor: 'transparent'
              }} 
              {...panResponder.panHandlers} 
            />
          )}
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
  shipBlueprint: {
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  shipSpine: {
    position: 'absolute',
    opacity: 0.5,
  },
  shipEngine: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.9,
  },
  shipRib: {
    opacity: 0.8,
  }
});
