import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { useAuth } from './store/authStore.ts';
import { useQuizSession } from './store/quizStore.ts';
import { BottomTabs, TabKey } from './components/ui/BottomTabs.tsx';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { SubjectsScreen } from './screens/SubjectsScreen.tsx';
import { QuizzesScreen } from './screens/QuizzesScreen.tsx';
import { BookmarksScreen } from './screens/BookmarksScreen.tsx';
import { ProfileScreen } from './screens/ProfileScreen.tsx';
import { QuizDetailScreen } from './screens/QuizDetailScreen.tsx';
import { QuizQuestionScreen } from './screens/QuizQuestionScreen.tsx';
import { ResultScreen } from './screens/ResultScreen.tsx';
import { QuestionReviewScreen } from './screens/QuestionReviewScreen.tsx';
import { LeaderboardScreen } from './screens/LeaderboardScreen.tsx';
import { AuthScreen } from './screens/AuthScreen.tsx';
import { Loader2 } from 'lucide-react-native';

export const MobileApp: React.FC = () => {
  const { isAuthenticated, isLoading, checkAuth } = useAuth();
  const { session, clearSession } = useQuizSession();

  // Navigation Stack State
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [isTakingQuiz, setIsTakingQuiz] = useState<boolean>(false);
  const [completedAttemptId, setCompletedAttemptId] = useState<string | null>(null);
  const [reviewAttemptId, setReviewAttemptId] = useState<string | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center min-h-[500px] space-y-2">
        <Loader2 size={32} color="#059669" />
        <Text className="text-xs font-bold text-slate-400 mt-2">Loading QuizPulse...</Text>
      </View>
    );
  }

  // Protected route check
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // 1. In Active Quiz Taking Session
  if (isTakingQuiz && session.attemptId) {
    return (
      <QuizQuestionScreen
        onCompleteQuiz={(attemptId) => {
          setIsTakingQuiz(false);
          setCompletedAttemptId(attemptId);
        }}
        onExit={() => {
          setIsTakingQuiz(false);
          clearSession();
        }}
      />
    );
  }

  // 2. In Question Review Screen
  if (reviewAttemptId) {
    return (
      <QuestionReviewScreen
        attemptId={reviewAttemptId}
        onBack={() => {
          if (completedAttemptId) {
            setReviewAttemptId(null);
          } else {
            setReviewAttemptId(null);
            setActiveTab('profile');
          }
        }}
      />
    );
  }

  // 3. In Result Screen
  if (completedAttemptId) {
    return (
      <ResultScreen
        attemptId={completedAttemptId}
        onReviewAnswers={(id) => setReviewAttemptId(id)}
        onBackToHome={() => {
          setCompletedAttemptId(null);
          setActiveQuizId(null);
          clearSession();
          setActiveTab('home');
        }}
        onRetryQuiz={(qId) => {
          setCompletedAttemptId(null);
          setActiveQuizId(qId);
        }}
      />
    );
  }

  // 4. In Quiz Details Screen
  if (activeQuizId) {
    return (
      <QuizDetailScreen
        quizId={activeQuizId}
        onBack={() => setActiveQuizId(null)}
        onStartQuiz={() => setIsTakingQuiz(true)}
      />
    );
  }

  // 5. In Full Leaderboard View
  if (showLeaderboard) {
    return <LeaderboardScreen onBack={() => setShowLeaderboard(false)} />;
  }

  // 6. Main Tab Navigation Stack
  return (
    <SafeAreaView className="flex-1 justify-between">
      <View className="flex-1">
        {activeTab === 'home' && (
          <HomeScreen
            onNavigateToQuiz={(quizId) => setActiveQuizId(quizId)}
            onNavigateToSubject={(subId) => {
              setActiveSubjectId(subId);
              setActiveTab('subjects');
            }}
            onNavigateToTab={(tab) => setActiveTab(tab as TabKey)}
            onNavigateToLeaderboard={() => setShowLeaderboard(true)}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectsScreen
            onNavigateToQuiz={(quizId) => setActiveQuizId(quizId)}
            selectedSubjectId={activeSubjectId}
            onClearSelectedSubject={() => setActiveSubjectId(null)}
          />
        )}

        {activeTab === 'quizzes' && (
          <QuizzesScreen onNavigateToQuiz={(quizId) => setActiveQuizId(quizId)} />
        )}

        {activeTab === 'bookmarks' && <BookmarksScreen />}

        {activeTab === 'profile' && (
          <ProfileScreen
            onNavigateToReview={(attemptId) => setReviewAttemptId(attemptId)}
            onNavigateToQuiz={(quizId) => setActiveQuizId(quizId)}
          />
        )}
      </View>

      {/* Persistent Bottom Tab Bar */}
      <BottomTabs
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveSubjectId(null);
          setActiveTab(tab);
        }}
      />
    </SafeAreaView>
  );
};
