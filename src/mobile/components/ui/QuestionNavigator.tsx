import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { X, Check, HelpCircle, ArrowRight } from 'lucide-react-native';

interface QuestionNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
  totalQuestions: number;
  currentIndex: number;
  answeredIndices: number[];
  onSelectQuestion: (index: number) => void;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  isOpen,
  onClose,
  totalQuestions,
  currentIndex,
  answeredIndices,
  onSelectQuestion,
}) => {
  if (!isOpen) return null;

  const answeredSet = new Set(answeredIndices);
  const answeredCount = answeredIndices.length;
  const unansweredCount = totalQuestions - answeredCount;

  const nextUnansweredIndex = Array.from({ length: totalQuestions }, (_, i) => i).find(
    (i) => !answeredSet.has(i)
  );

  return (
    <View className="absolute inset-0 z-50 bg-black/60 justify-end sm:justify-center items-center p-0 sm:p-4">
      <View className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <View className="flex-row items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <View>
            <Text className="font-extrabold text-slate-900 dark:text-white text-base">
              Question Navigator
            </Text>
            <Text className="text-xs text-slate-500 mt-0.5">
              {answeredCount} answered • {unansweredCount} remaining
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <X size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View className="flex-row items-center space-x-4 py-3">
          <View className="flex-row items-center mr-3">
            <View className="w-3 h-3 rounded-full bg-emerald-500 mr-1.5" />
            <Text className="text-xs text-slate-600 dark:text-slate-400">Answered</Text>
          </View>
          <View className="flex-row items-center mr-3">
            <View className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700 mr-1.5" />
            <Text className="text-xs text-slate-600 dark:text-slate-400">Unanswered</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-3 h-3 rounded-full border-2 border-emerald-600 mr-1.5" />
            <Text className="text-xs text-slate-600 dark:text-slate-400">Current</Text>
          </View>
        </View>

        {/* Questions Grid */}
        <ScrollView className="max-h-64 my-2">
          <View className="flex-row flex-wrap justify-between">
            {Array.from({ length: totalQuestions }, (_, index) => {
              const isAnswered = answeredSet.has(index);
              const isCurrent = currentIndex === index;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    onSelectQuestion(index);
                    onClose();
                  }}
                  className={`w-[18%] h-11 rounded-2xl items-center justify-center mb-2.5 relative border ${
                    isCurrent
                      ? 'border-emerald-500 ring-2 ring-emerald-500/40'
                      : 'border-transparent'
                  } ${
                    isAnswered
                      ? 'bg-emerald-500'
                      : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  <Text
                    className={`font-bold text-sm ${
                      isAnswered ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {index + 1}
                  </Text>
                  {isAnswered ? (
                    <View className="absolute top-1 right-1">
                      <Check size={10} color="#ffffff" />
                    </View>
                  ) : (
                    <View className="absolute top-1 right-1 opacity-40">
                      <HelpCircle size={10} color="#64748b" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Jump to unanswered */}
        {nextUnansweredIndex !== undefined && (
          <TouchableOpacity
            onPress={() => {
              onSelectQuestion(nextUnansweredIndex);
              onClose();
            }}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex-row items-center justify-center"
          >
            <Text className="text-slate-700 dark:text-slate-200 text-xs font-bold mr-1.5">
              Jump to Next Unanswered (Q{nextUnansweredIndex + 1})
            </Text>
            <ArrowRight size={14} color="#64748b" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
