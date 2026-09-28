import "./global.css";
import React from 'react';
import { SafeAreaView, StatusBar, View } from 'react-native';
import { MobileApp } from '../src/mobile/MobileApp.tsx';

export default function App() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <View className="flex-1 px-3 pt-2">
        <MobileApp />
      </View>
    </SafeAreaView>
  );
}
