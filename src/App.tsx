import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import {
  Smartphone,
  Layers,
  Wifi,
  WifiOff,
  Sparkles,
  Maximize2,
  Minimize2,
  Activity,
} from 'lucide-react-native';
import { MobileApp } from './mobile/MobileApp.tsx';
import { ArchitectureDocs } from './components/ArchitectureDocs.tsx';
import { useNetwork } from './mobile/store/networkStore.ts';
import { api } from './mobile/services/api/client.ts';

export default function App() {
  const [viewMode, setViewMode] = useState<'mobile' | 'architecture'>('mobile');
  const [deviceFrame, setDeviceFrame] = useState<boolean>(true);
  const { isOnline, toggleNetwork, pendingCount } = useNetwork();
  const [apiHealth, setApiHealth] = useState<'healthy' | 'checking' | 'error'>('checking');
  const [currentTime, setCurrentTime] = useState<string>('9:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await api.get('/health', { requiresAuth: false });
        if (res.data?.status === 'healthy') {
          setApiHealth('healthy');
        } else {
          setApiHealth('error');
        }
      } catch {
        setApiHealth('error');
      }
    };
    checkApi();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Top Header Bar */}
      <View className="bg-slate-950/90 border-b border-slate-800 px-4 py-3">
        <View className="max-w-7xl mx-auto flex-row flex-wrap items-center justify-between">
          {/* Brand */}
          <View className="flex-row items-center space-x-2.5">
            <View className="w-8 h-8 rounded-xl bg-emerald-600 items-center justify-center mr-2 shadow-sm">
              <Sparkles size={16} color="#ffffff" />
            </View>
            <View>
              <View className="flex-row items-center">
                <Text className="font-black text-white text-sm">QuizPulse</Text>
                <View className="ml-2 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <Text className="text-[10px] font-mono font-bold text-emerald-400">
                    Expo + NativeWind v4
                  </Text>
                </View>
              </View>
              <Text className="text-[10px] text-slate-400">
                Pure React Native Primitives (View, Text, TouchableOpacity, Pressable)
              </Text>
            </View>
          </View>

          {/* Mode Switch: Mobile App vs Architecture & Microservices */}
          <View className="flex-row p-1 bg-slate-900 border border-slate-800 rounded-2xl my-1">
            <TouchableOpacity
              onPress={() => setViewMode('mobile')}
              className={`flex-row items-center px-3 py-1.5 rounded-xl ${
                viewMode === 'mobile' ? 'bg-emerald-600 shadow-sm' : ''
              }`}
            >
              <Smartphone size={14} color="#ffffff" />
              <Text className="text-white text-xs font-bold ml-1.5">Mobile Simulator</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setViewMode('architecture')}
              className={`flex-row items-center px-3 py-1.5 rounded-xl ${
                viewMode === 'architecture' ? 'bg-emerald-600 shadow-sm' : ''
              }`}
            >
              <Layers size={14} color="#ffffff" />
              <Text className="text-white text-xs font-bold ml-1.5">Architecture & Microservices</Text>
            </TouchableOpacity>
          </View>

          {/* Controls: Network & Device Frame */}
          <View className="flex-row items-center space-x-2">
            <View
              className={`flex-row items-center px-2.5 py-1 rounded-full border mr-2 ${
                apiHealth === 'healthy'
                  ? 'bg-emerald-950/60 border-emerald-800'
                  : 'bg-amber-950/60 border-amber-800'
              }`}
            >
              <Activity size={12} color="#10b981" />
              <Text className="text-emerald-400 text-[11px] font-bold ml-1">
                REST Microservices: 200 OK
              </Text>
            </View>

            <TouchableOpacity
              onPress={toggleNetwork}
              className={`flex-row items-center px-3 py-1.5 rounded-2xl border mr-1.5 ${
                isOnline
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-amber-500 border-amber-400'
              }`}
            >
              {isOnline ? (
                <Wifi size={14} color="#10b981" />
              ) : (
                <WifiOff size={14} color="#0f172a" />
              )}
              <Text
                className={`text-xs font-black ml-1.5 ${
                  isOnline ? 'text-emerald-400' : 'text-slate-950'
                }`}
              >
                {isOnline ? 'Online' : 'Offline'}
              </Text>
              {pendingCount > 0 && (
                <View className="ml-1.5 bg-amber-950 px-1.5 rounded-full">
                  <Text className="text-amber-200 text-[10px] font-bold">{pendingCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            {viewMode === 'mobile' && (
              <TouchableOpacity
                onPress={() => setDeviceFrame(!deviceFrame)}
                className="p-2 rounded-2xl border border-slate-800 bg-slate-900"
              >
                {deviceFrame ? (
                  <Maximize2 size={16} color="#cbd5e1" />
                ) : (
                  <Minimize2 size={16} color="#cbd5e1" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Main Body */}
      <View className="flex-1 items-center justify-center p-2 sm:p-4">
        {viewMode === 'mobile' ? (
          <View className="w-full items-center py-2">
            {deviceFrame ? (
              /* Phone Device Frame */
              <View className="w-full max-w-[420px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-800">
                {/* Dynamic Island */}
                <View className="w-28 h-5 bg-black rounded-full self-center flex-row items-center justify-between px-2.5 mb-1 z-50">
                  <View className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                  <View className="w-2 h-2 rounded-full bg-emerald-500/60" />
                </View>

                {/* Simulated Native Screen */}
                <View className="bg-white dark:bg-slate-950 rounded-[38px] overflow-hidden min-h-[640px] max-h-[820px] flex-col relative">
                  {/* Status Bar */}
                  <View className="pt-2 pb-1 px-6 flex-row items-center justify-between bg-white/80 dark:bg-slate-950/80">
                    <Text className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400">
                      {currentTime}
                    </Text>
                    <View className="flex-row items-center space-x-1.5">
                      {isOnline ? (
                        <Wifi size={14} color="#64748b" />
                      ) : (
                        <WifiOff size={14} color="#f59e0b" />
                      )}
                      <Text className="text-[10px] font-mono text-slate-500 font-bold ml-1 mr-1">5G</Text>
                      <View className="w-5 h-2.5 rounded-xs border border-slate-400 p-0.5 items-center justify-center">
                        <View className="h-full w-full bg-emerald-500 rounded-2xs" />
                      </View>
                    </View>
                  </View>

                  {/* Mobile Screen Content */}
                  <View className="flex-1 px-4 pt-1">
                    <MobileApp />
                  </View>

                  {/* Home Indicator Bar */}
                  <View className="py-2 items-center bg-white/90 dark:bg-slate-950/90">
                    <View className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  </View>
                </View>
              </View>
            ) : (
              /* Full Screen Responsive View */
              <View className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-3xl p-5 border border-slate-800 shadow-xl min-h-[600px]">
                <MobileApp />
              </View>
            )}
          </View>
        ) : (
          /* Architecture & Microservices Docs */
          <View className="w-full py-4">
            <ArchitectureDocs />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
