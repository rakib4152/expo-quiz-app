import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Layers,
  Wifi,
  WifiOff,
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  Activity,
} from 'lucide-react-native';
import { MobileApp } from './src/mobile/MobileApp.tsx';
import { ArchitectureDocs } from './src/components/ArchitectureDocs.tsx';
import { useNetwork } from './src/mobile/store/networkStore.ts';
import { api } from './src/mobile/services/api/client.ts';

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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation & Applet Controls */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-tight">QuizPulse</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Expo + Next.js REST
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">
                Mobile Quiz Platform • React Native + Prisma + PostgreSQL Architecture
              </p>
            </div>
          </div>

          {/* Center Tabs: Mobile Simulator vs Architecture */}
          <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300">
            <button
              onClick={() => setViewMode('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'mobile'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile App Simulator</span>
            </button>
            <button
              onClick={() => setViewMode('architecture')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'architecture'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture & REST APIs</span>
            </button>
          </div>

          {/* Right Controls: Network Simulation & Frame Toggle */}
          <div className="flex items-center gap-2">
            {/* API Health badge */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                apiHealth === 'healthy'
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950/60 text-amber-400 border-amber-800'
              }`}
              title="REST Backend Health Status"
            >
              <Activity className="w-3 h-3 text-emerald-500" />
              <span>REST API: 200 OK</span>
            </div>

            {/* Offline Simulation Toggle */}
            <button
              onClick={toggleNetwork}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isOnline
                  ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800'
                  : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 font-extrabold'
              }`}
              title={isOnline ? 'Switch to Offline taking mode' : 'Switch back to Online'}
            >
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online' : 'Offline'}</span>
              {pendingCount > 0 && (
                <span className="bg-amber-950 text-amber-200 text-[10px] px-1.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Frame Viewport Toggle */}
            {viewMode === 'mobile' && (
              <button
                onClick={() => setDeviceFrame(!deviceFrame)}
                className="p-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
                title={deviceFrame ? 'Expand to Full Screen' : 'Show Phone Frame'}
              >
                {deviceFrame ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-x-hidden">
        {viewMode === 'mobile' ? (
          <div className="w-full flex justify-center py-2">
            {deviceFrame ? (
              /* Phone Device Frame */
              <div className="relative w-full max-w-[420px] bg-slate-950 rounded-[48px] p-3 shadow-2xl ring-1 ring-slate-800 shadow-emerald-950/20 border-4 border-slate-800">
                {/* Dynamic Island / Camera Notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-between px-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-900 ring-1 ring-slate-800"></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500/60"></span>
                </div>

                {/* Simulated Native Screen */}
                <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-[38px] overflow-hidden min-h-[640px] max-h-[820px] flex flex-col relative shadow-inner">
                  {/* Status Bar */}
                  <div className="pt-3 pb-1 px-6 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400 select-none z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xs">
                    <span>{currentTime}</span>
                    <div className="flex items-center gap-1.5">
                      {isOnline ? (
                        <Wifi className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                      )}
                      <span className="text-[10px] font-mono">5G</span>
                      <div className="w-5 h-2.5 rounded-sm border border-slate-500 dark:border-slate-400 p-0.5 flex items-center">
                        <div className="h-full w-full bg-emerald-500 rounded-2xs"></div>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Screen Content */}
                  <div className="flex-1 overflow-y-auto px-4 pt-2">
                    <MobileApp />
                  </div>

                  {/* Home Indicator Bar */}
                  <div className="py-1.5 flex justify-center bg-white/90 dark:bg-slate-950/90 z-40">
                    <div className="w-32 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                  </div>
                </div>
              </div>
            ) : (
              /* Full Screen Responsive View */
              <div className="w-full max-w-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-3xl p-5 border border-slate-800 shadow-xl min-h-[600px]">
                <MobileApp />
              </div>
            )}
          </div>
        ) : (
          /* Architecture & REST API Explorer */
          <div className="w-full py-4">
            <ArchitectureDocs />
          </div>
        )}
      </main>
    </div>
  );
}
