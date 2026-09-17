import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useBattleshipEngine } from '@/hooks/useBattleshipEngine';
import { BoardGrid } from '@/components/game/BoardGrid';
import { GameState } from '@/models/battleship';
import { Colors } from '@/constants/theme';
import { Stack, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GameScreen() {
  const engine = useBattleshipEngine();
  const [isBoardDragging, setIsBoardDragging] = useState(false);

  const handleCellPress = (x: number, y: number) => {
    if (engine.gameState === GameState.PlacingShips) {
      engine.placeShip(x, y);
    } else if (engine.gameState === GameState.Playing) {
      engine.fireShot(x, y);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} alwaysBounceVertical={true} scrollEnabled={!isBoardDragging}>
        <Stack.Screen options={{ title: 'BATTLE T3RM1N4L', headerStyle: { backgroundColor: Colors.dark.backgroundElement }, headerTintColor: Colors.dark.text, headerTitleStyle: { fontFamily: 'Orbitron', fontSize: 24 } }} />

        <View style={styles.header}>
          <Text style={styles.statusText}>
            {engine.gameState === GameState.PlacingShips ? '> PLACEMENT_MODE: ACTIVE' : '> COMBAT_MODE: ENGAGED'}
          </Text>
          <Text style={styles.subStatusText}>
            {engine.gameState === GameState.PlacingShips 
              ? 'Select a ship below and tap the grid to deploy.' 
              : 'Tap the grid to fire at enemy coordinates.'}
          </Text>
        </View>

        <BoardGrid 
          board={engine.board}
          ships={engine.ships} 
          onCellPress={handleCellPress} 
          isPlacementMode={engine.gameState === GameState.PlacingShips}
          selectedShip={engine.ships.find(s => s.id === engine.selectedShipId) || null}
          onShipPlace={(x, y) => engine.placeShip(x, y)}
          onShipPickup={(shipId, isHorizontal) => {
            engine.removeShip(shipId);
            engine.setSelectedShipId(shipId);
            engine.setIsHorizontal(isHorizontal);
          }}
          canPlaceShip={engine.canPlaceShip}
          isHorizontal={engine.isHorizontal}
          onDragStateChange={setIsBoardDragging}
        />

        {engine.gameState === GameState.PlacingShips && (
          <View style={styles.fleetPanel}>
            <Text style={styles.panelTitle}>/// AVAILABLE_FLEET</Text>
            
            <View style={styles.orientationToggle}>
              <Text style={styles.orientationText}>ORIENTATION: {engine.isHorizontal ? '[HORZ]' : '[VERT]'}</Text>
              <Pressable style={styles.actionBtn} onPress={() => engine.setIsHorizontal(!engine.isHorizontal)}>
                <Text style={styles.actionBtnText}>TOGGLE</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.fleetScroll} alwaysBounceVertical={true} nestedScrollEnabled={true}>
              {engine.ships.filter(s => !s.isPlaced).map(ship => (
                <Pressable 
                  key={ship.id}
                  style={[styles.shipBtn, engine.selectedShipId === ship.id && styles.shipBtnSelected]}
                  onPress={() => engine.setSelectedShipId(ship.id)}
                >
                  <Text style={styles.shipBtnText}>
                    {engine.selectedShipId === ship.id ? '> ' : ''}{ship.type} (SIZE: {ship.size})
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {engine.gameState === GameState.Playing && (
          <View style={styles.fleetPanel}>
            <Text style={styles.panelTitle}>/// TACTICAL_OPTIONS</Text>
            <Pressable style={styles.actionBtn} onPress={engine.resetGame}>
              <Text style={styles.actionBtnText}>ABORT_SIMULATION (RESET)</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={[styles.actionBtn, { marginTop: 20 }]} onPress={() => router.back()}>
           <Text style={styles.actionBtnText}>RETURN_TO_BASE</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  header: {
    width: '100%',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundSelected,
    paddingBottom: 10,
  },
  statusText: {
    fontFamily: 'Orbitron',
    fontSize: 18,
    color: Colors.dark.text,
  },
  subStatusText: {
    fontFamily: 'Orbitron',
    fontSize: 16,
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  fleetPanel: {
    width: '100%',
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.dark.backgroundElement,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.backgroundSelected,
  },
  panelTitle: {
    fontFamily: 'Orbitron',
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 15,
  },
  orientationToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundSelected,
  },
  orientationText: {
    fontFamily: 'Orbitron',
    fontSize: 18,
    color: Colors.dark.text,
  },
  shipBtn: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: Colors.dark.background,
    borderWidth: 1,
    borderColor: Colors.dark.backgroundSelected,
  },
  shipBtnSelected: {
    borderColor: Colors.dark.text,
    backgroundColor: Colors.dark.backgroundSelected,
  },
  shipBtnText: {
    fontFamily: 'Orbitron',
    fontSize: 18,
    color: Colors.dark.text,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.dark.backgroundSelected,
    borderWidth: 1,
    borderColor: Colors.dark.text,
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: 'Orbitron',
    fontSize: 14,
    color: Colors.dark.text,
  },
  fleetScroll: {
    maxHeight: 180,
  }
});
