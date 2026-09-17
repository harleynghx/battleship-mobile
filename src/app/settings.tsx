import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [haptics, setHaptics] = useState(true);
  const [sound, setSound] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>CONFIG</Text>
          <Text style={styles.subtitle}>SETTINGS</Text>
        </View>

        <View style={styles.settingsList}>
          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>HAPTICS</Text>
              <Text style={styles.settingDesc}>VIBRATION ON TOUCH</Text>
            </View>
            <Switch 
              value={haptics} 
              onValueChange={setHaptics} 
              trackColor={{ false: Colors.dark.backgroundSelected, true: Colors.dark.text }}
              thumbColor={Colors.dark.backgroundElement}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>AUDIO</Text>
              <Text style={styles.settingDesc}>SOUND EFFECTS</Text>
            </View>
            <Switch 
              value={sound} 
              onValueChange={setSound} 
              trackColor={{ false: Colors.dark.backgroundSelected, true: Colors.dark.text }}
              thumbColor={Colors.dark.backgroundElement}
            />
          </View>

          <Pressable style={styles.resetBtn}>
             <Text style={styles.resetBtnText}>ERASE DATA</Text>
          </Pressable>
        </View>

        <Pressable style={styles.backBtn} onPress={() => router.replace('/')}>
           <Text style={styles.backBtnText}>QUIT</Text>
        </Pressable>
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
  },
  header: {
    marginTop: 20,
    marginBottom: 50,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'PressStart2P',
    fontSize: 28,
    color: Colors.dark.text,
  },
  subtitle: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 15,
  },
  settingsList: {
    flex: 1,
    gap: 30,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: Colors.dark.backgroundSelected,
    paddingBottom: 20,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: 10,
  },
  settingTitle: {
    fontFamily: 'PressStart2P',
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: 10,
  },
  settingDesc: {
    fontFamily: 'PressStart2P',
    fontSize: 8,
    color: Colors.dark.textSecondary,
    lineHeight: 12,
  },
  resetBtn: {
    marginTop: 20,
    padding: 15,
    borderWidth: 4,
    borderColor: Colors.dark.backgroundSelected,
    backgroundColor: Colors.dark.backgroundElement,
    alignItems: 'center',
  },
  resetBtnText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: Colors.dark.backgroundSelected,
  },
  backBtn: {
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.dark.text,
    backgroundColor: Colors.dark.backgroundElement,
  },
  backBtnText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: Colors.dark.text,
  }
});
