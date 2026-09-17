import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>BATTLE</Text>
          <Text style={styles.title}>T3RM1N4L</Text>
          <Text style={styles.subtitle}>v1.0 // SYSTEMS ONLINE</Text>
        </View>

        <View style={styles.menu}>
          <Pressable 
            style={({pressed}) => [styles.menuBtn, pressed && styles.menuBtnPressed]}
            onPress={() => router.push('/game')}
          >
            <Text style={styles.menuBtnText}>[ START_LOCAL_SIMULATION ]</Text>
          </Pressable>

          <Pressable 
            style={({pressed}) => [styles.menuBtn, pressed && styles.menuBtnPressed, styles.menuBtnDisabled]}
            onPress={() => {}}
          >
            <Text style={[styles.menuBtnText, styles.menuBtnTextDisabled]}>[ INIT_NETWORK_MATCH ] (OFFLINE)</Text>
          </Pressable>
          
          <Pressable 
            style={({pressed}) => [styles.menuBtn, pressed && styles.menuBtnPressed]}
            onPress={() => {}}
          >
            <Text style={styles.menuBtnText}>[ VIEW_INTEL_DB ] (LEADERBOARD)</Text>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>SECURE CONNECTION ESTABLISHED</Text>
          <View style={styles.cursor} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Orbitron',
    fontSize: 64,
    color: Colors.dark.text,
    lineHeight: 64,
  },
  subtitle: {
    fontFamily: 'Orbitron',
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 10,
    letterSpacing: 2,
  },
  menu: {
    gap: 20,
    alignItems: 'center',
  },
  menuBtn: {
    width: '100%',
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.text,
    backgroundColor: Colors.dark.backgroundElement,
    alignItems: 'center',
  },
  menuBtnPressed: {
    backgroundColor: Colors.dark.backgroundSelected,
  },
  menuBtnDisabled: {
    borderColor: Colors.dark.textSecondary,
    backgroundColor: Colors.dark.background,
  },
  menuBtnText: {
    fontFamily: 'Orbitron',
    fontSize: 16,
    color: Colors.dark.text,
  },
  menuBtnTextDisabled: {
    color: Colors.dark.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  footerText: {
    fontFamily: 'Orbitron',
    fontSize: 18,
    color: Colors.dark.textSecondary,
  },
  cursor: {
    width: 10,
    height: 18,
    backgroundColor: Colors.dark.text,
  }
});
