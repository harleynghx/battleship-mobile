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

  const handleCellPress = (x: number, y: number) => {
    if (engine.gameState === GameState.Hiding) {
      engine.hideGhost(x, y);
    } else if (engine.gameState === GameState.Seeking) {
      engine.guessCoordinate(x, y);
    }
  };

  const renderSetup = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>SELECT PLAYERS</Text>
      {[2, 3, 4].map(num => (
        <Pressable key={num} style={styles.actionBtn} onPress={() => engine.startGame(num)}>
          <Text style={styles.actionBtnText}>{num} PLAYERS</Text>
        </Pressable>
      ))}
      <Pressable style={[styles.actionBtn, { marginTop: 40, borderColor: Colors.dark.textSecondary }]} onPress={() => router.replace('/')}>
         <Text style={[styles.actionBtnText, { color: Colors.dark.textSecondary }]}>MAIN MENU</Text>
      </Pressable>
    </View>
  );

  const renderPassingDevice = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>PASS DEVICE TO</Text>
      <Text style={[styles.highlightTitle, { color: engine.currentPlayer?.color }]}>
        {engine.currentPlayer?.name}
      </Text>
      <Text style={styles.subtitle}>
        Keep your screen hidden from others!
      </Text>
      <Pressable style={styles.readyBtn} onPress={engine.confirmPassDevice}>
        <Text style={styles.readyBtnText}>I'M READY</Text>
      </Pressable>
    </View>
  );

  const renderBoard = () => {
    let headerText = '';
    let subHeaderText = '';
    
    if (engine.gameState === GameState.Hiding) {
      headerText = 'HIDE PHASE';
      subHeaderText = 'TAP TO HIDE YOUR GHOST';
    } else if (engine.gameState === GameState.Seeking) {
      headerText = 'SEEK PHASE';
      subHeaderText = 'GUESS A LOCATION';
    }

    return (
      <ScrollView contentContainerStyle={styles.content} alwaysBounceVertical={true}>
        <View style={styles.header}>
          <Text style={[styles.statusText, { color: engine.currentPlayer?.color }]}>
            {engine.currentPlayer?.name}'S TURN
          </Text>
          <Text style={styles.subStatusText}>{headerText}</Text>
          <Text style={styles.instructionText}>{subHeaderText}</Text>
        </View>

        <BoardGrid 
          board={engine.board}
          onCellPress={handleCellPress} 
          disabled={engine.gameState !== GameState.Hiding && engine.gameState !== GameState.Seeking}
        />

        {engine.gameState === GameState.Seeking && (
          <View style={styles.fleetPanel}>
             <Text style={styles.panelTitle}>ALIVE PLAYERS</Text>
             {engine.players.filter(p => !p.isEliminated).map(p => (
               <Text key={p.id} style={[styles.alivePlayer, { color: p.color }]}>
                 {p.name}
               </Text>
             ))}
          </View>
        )}

        <Pressable style={[styles.actionBtn, { marginTop: 20, paddingVertical: 10 }]} onPress={() => router.replace('/')}>
           <Text style={[styles.actionBtnText, { fontSize: 8 }]}>QUIT GAME</Text>
        </Pressable>
      </ScrollView>
    );
  };

  const renderGameOver = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>GAME OVER</Text>
      <Text style={[styles.highlightTitle, { color: engine.winner?.color }]}>
        {engine.winner?.name} WINS!
      </Text>
      <Pressable style={[styles.actionBtn, { marginTop: 40 }]} onPress={engine.resetGame}>
        <Text style={styles.actionBtnText}>PLAY AGAIN</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ title: 'HIDE & SEEK', headerStyle: { backgroundColor: Colors.dark.backgroundElement }, headerTintColor: Colors.dark.text, headerTitleStyle: { fontFamily: 'PressStart2P', fontSize: 14 } }} />
      
      {engine.gameState === GameState.SetupPlayers && renderSetup()}
      {engine.gameState === GameState.PassingDevice && renderPassingDevice()}
      {(engine.gameState === GameState.Hiding || engine.gameState === GameState.Seeking) && renderBoard()}
      {engine.gameState === GameState.GameOver && renderGameOver()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 16,
    color: Colors.dark.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  highlightTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: Colors.dark.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 16,
  },
  header: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    marginBottom: 8,
  },
  subStatusText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  instructionText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: Colors.dark.text,
  },
  actionBtn: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: Colors.dark.backgroundElement,
    borderWidth: 4,
    borderColor: Colors.dark.text,
    alignItems: 'center',
    marginBottom: 15,
    width: 200,
  },
  actionBtnText: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    color: Colors.dark.text,
  },
  readyBtn: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    backgroundColor: Colors.dark.backgroundSelected,
    borderWidth: 4,
    borderColor: Colors.dark.text,
  },
  readyBtnText: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: Colors.dark.text,
  },
  fleetPanel: {
    width: '100%',
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.dark.backgroundElement,
    borderWidth: 4,
    borderColor: Colors.dark.backgroundSelected,
    alignItems: 'center',
  },
  panelTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: Colors.dark.text,
    marginBottom: 15,
  },
  alivePlayer: {
    fontFamily: 'PressStart2P',
    fontSize: 10,
    marginBottom: 10,
  }
});
