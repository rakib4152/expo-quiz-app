import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Sparkles, Mail, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../store/authStore.ts';
import { Button } from '../components/ui/Buttons.tsx';

export const AuthScreen: React.FC = () => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const success = await login(email, password);
        if (!success) setError('Invalid email or password. Try the demo login below.');
      } else {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const success = await register(name, email, password);
        if (!success) setError('Registration failed. Email might already exist.');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('rakib.edu.bd@gmail.com');
    setPassword('password123');
    setLoading(true);
    await login('rakib.edu.bd@gmail.com', 'password123');
    setLoading(false);
  };

  return (
    <ScrollView className="flex-1 p-4 max-w-sm mx-auto w-full justify-center" showsVerticalScrollIndicator={false}>
      {/* Brand Logo */}
      <View className="items-center mb-6 space-y-2">
        <View className="w-14 h-14 rounded-2xl bg-emerald-600 items-center justify-center shadow-md mb-2">
          <Sparkles size={28} color="#ffffff" />
        </View>
        <Text className="text-2xl font-black text-slate-900 dark:text-white">
          QuizPulse
        </Text>
        <Text className="text-xs text-slate-500 text-center max-w-xs">
          High-yield preparation platform for competitive exam aspirants
        </Text>
      </View>

      {/* Tabs */}
      <View className="flex-row p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-5">
        <TouchableOpacity
          onPress={() => {
            setTab('login');
            setError(null);
          }}
          className={`flex-1 py-2.5 items-center rounded-xl ${
            tab === 'login' ? 'bg-white dark:bg-slate-900 shadow-xs' : ''
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              tab === 'login' ? 'text-slate-900 dark:text-white' : 'text-slate-500'
            }`}
          >
            Sign In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setTab('register');
            setError(null);
          }}
          className={`flex-1 py-2.5 items-center rounded-xl ${
            tab === 'register' ? 'bg-white dark:bg-slate-900 shadow-xs' : ''
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              tab === 'register' ? 'text-slate-900 dark:text-white' : 'text-slate-500'
            }`}
          >
            Create Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error alert */}
      {error && (
        <View className="bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-3 rounded-2xl mb-4">
          <Text className="text-rose-700 dark:text-rose-400 text-xs font-semibold">{error}</Text>
        </View>
      )}

      {/* Form Fields */}
      <View className="space-y-3.5">
        {tab === 'register' && (
          <View>
            <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </Text>
            <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex-row items-center px-3 py-2.5">
              <User size={16} color="#94a3b8" />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Rakib Ahmed"
                placeholderTextColor="#94a3b8"
                className="ml-2.5 flex-1 text-xs text-slate-900 dark:text-white"
              />
            </View>
          </View>
        )}

        <View>
          <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Email Address
          </Text>
          <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex-row items-center px-3 py-2.5">
            <Mail size={16} color="#94a3b8" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. rakib.edu.bd@gmail.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
              className="ml-2.5 flex-1 text-xs text-slate-900 dark:text-white"
            />
          </View>
        </View>

        <View>
          <Text className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Password
          </Text>
          <View className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex-row items-center px-3 py-2.5">
            <Lock size={16} color="#94a3b8" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              secureTextEntry={true}
              className="ml-2.5 flex-1 text-xs text-slate-900 dark:text-white"
            />
          </View>
        </View>

        <Button
          onPress={handleSubmit}
          isLoading={loading}
          fullWidth
          size="lg"
          className="mt-2"
        >
          <View className="flex-row items-center">
            <Text className="text-white font-bold text-xs mr-1.5">
              {tab === 'login' ? 'Sign In to Account' : 'Register & Start Learning'}
            </Text>
            <ArrowRight size={14} color="#ffffff" />
          </View>
        </Button>
      </View>

      {/* Demo Account Quick Access */}
      <View className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 items-center">
        <Text className="text-[11px] text-slate-400 mb-2">
          Want to test instantly without credentials?
        </Text>
        <TouchableOpacity
          onPress={handleDemoLogin}
          className="w-full py-3 px-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex-row items-center justify-center"
        >
          <ShieldCheck size={16} color="#059669" />
          <Text className="text-slate-700 dark:text-slate-300 text-xs font-bold ml-1.5">
            Demo Scholar: Rakib Ahmed (One-Click)
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
