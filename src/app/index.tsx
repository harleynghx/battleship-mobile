import React from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ArcadeWebView } from '@/components/ArcadeWebView';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ArcadeWebView onStartGame={() => router.push('/game')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#271C22',
  }
});
