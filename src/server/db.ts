// Server-side in-memory relational database & seed store
// Mirrors Prisma schema with full relational consistency and secure server-side evaluations.

import crypto from 'crypto';
import type {
  Difficulty,
  QuestionType,
  AttemptStatus,
  Role
} from '../types/quiz.ts';

export interface DbUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  avatarUrl?: string;
  role: Role;
  refreshToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbSubject {
  id: string;
  name: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbTopic {
  id: string;
  subjectId: string;
  name: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
}

export interface DbQuestion {
  id: string;
  subjectId: string;
  topicId: string | null;
  questionText: string;
  explanation: string;
  difficulty: Difficulty;
  questionType: QuestionType;
  createdAt: string;
  updatedAt: string;
}

export interface DbQuiz {
  id: string;
  title: string;
  description: string;
  subjectId: string | null;
  topicId: string | null;
  duration: number; // minutes
  totalQuestions: number;
  difficulty: Difficulty;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DbQuizQuestion {
  id: string;
  quizId: string;
  questionId: string;
  order: number;
}

export interface DbUserAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  optionId: string;
  isCorrect: boolean;
  createdAt: string;
}

export interface DbQuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  startedAt: string;
  expiresAt: string;
  completedAt: string | null;
  status: AttemptStatus;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  percentage: number;
  timeTaken: number; // in seconds
  createdAt: string;
  updatedAt: string;
}

export interface DbBookmark {
  id: string;
  userId: string;
  questionId: string;
  createdAt: string;
}

export interface DbUserProgress {
  id: string;
  userId: string;
  totalQuizzesCompleted: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  averageScore: number;
  streakDays: number;
  lastActiveAt: string;
  updatedAt: string;
}

// Password hashing helper using standard crypto
export function hashPassword(password: string): string {
  const salt = 'quizpulse_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

class InMemoryDatabase {
  users: DbUser[] = [];
  subjects: DbSubject[] = [];
  topics: DbTopic[] = [];
  questions: DbQuestion[] = [];
  options: DbOption[] = [];
  quizzes: DbQuiz[] = [];
  quizQuestions: DbQuizQuestion[] = [];
  attempts: DbQuizAttempt[] = [];
  userAnswers: DbUserAnswer[] = [];
  bookmarks: DbBookmark[] = [];
  progress: DbUserProgress[] = [];

  constructor() {
    this.seed();
  }

  seed() {
    // 1. Users
    const defaultPasswordHash = hashPassword('password123');
    const now = new Date().toISOString();

    const rakibUser: DbUser = {
      id: 'usr_rakib_01',
      email: 'rakib.edu.bd@gmail.com',
      name: 'Rakib Ahmed',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      passwordHash: defaultPasswordHash,
      role: 'USER',
      createdAt: now,
      updatedAt: now,
    };

    const leaderboardUsers: DbUser[] = [
      rakibUser,
      {
        id: 'usr_tanvir_02',
        email: 'tanvir@gmail.com',
        name: 'Tanvir Hossain',
        avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr_sadia_03',
        email: 'sadia@gmail.com',
        name: 'Sadia Sultana',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr_mehedi_04',
        email: 'mehedi@gmail.com',
        name: 'Mehedi Hasan',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr_farhana_05',
        email: 'farhana@gmail.com',
        name: 'Farhana Akter',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'usr_ayesha_06',
        email: 'ayesha@gmail.com',
        name: 'Ayesha Siddika',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        passwordHash: defaultPasswordHash,
        role: 'USER',
        createdAt: now,
        updatedAt: now,
      }
    ];

    this.users = leaderboardUsers;

    // 2. Subjects
    this.subjects = [
      {
        id: 'sub_bd_01',
        name: 'Bangladesh Affairs',
        code: 'BD_AFFAIRS',
        description: 'Comprehensive coverage of Bangladesh history, Liberation War 1971, Constitution, geography, and economy.',
        icon: 'Landmark',
        color: '#059669', // Emerald
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'sub_eng_02',
        name: 'English Language & Literature',
        code: 'ENG_LANG',
        description: 'Master English grammar, idioms, prepositions, vocabulary, and classical literature.',
        icon: 'BookOpen',
        color: '#2563EB', // Blue
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'sub_math_03',
        name: 'Mathematical Reasoning',
        code: 'MATH_REAS',
        description: 'Arithmetic, Algebra, Geometry, and quantitative aptitude with step-by-step shortcuts.',
        icon: 'Calculator',
        color: '#D97706', // Amber
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'sub_sci_04',
        name: 'General Science & ICT',
        code: 'SCI_ICT',
        description: 'Modern science principles, everyday technology, computer systems, and AI foundations.',
        icon: 'Cpu',
        color: '#7C3AED', // Violet
        createdAt: now,
        updatedAt: now,
      },
    ];

    // 3. Topics
    this.topics = [
      // BD Affairs Topics
      {
        id: 'top_bd_liberation',
        subjectId: 'sub_bd_01',
        name: 'Liberation War 1971',
        description: 'Historic events, 7 Bir Sreshtho, Sector commanders, Mujibnagar government, and Independence.',
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'top_bd_constitution',
        subjectId: 'sub_bd_01',
        name: 'Constitution & Governance',
        description: 'Articles, Fundamental rights, amendments, parliament, and administrative structure.',
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'top_bd_geography',
        subjectId: 'sub_bd_01',
        name: 'Rivers, Geography & Climate',
        description: 'River systems, borders, climate zones, hills, and natural resources.',
        order: 3,
        createdAt: now,
        updatedAt: now,
      },
      // English Topics
      {
        id: 'top_eng_grammar',
        subjectId: 'sub_eng_02',
        name: 'Grammar & Sentence Correction',
        description: 'Subject-verb agreement, tense, voices, clauses, conditionals, and syntax.',
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'top_eng_vocab',
        subjectId: 'sub_eng_02',
        name: 'Vocabulary & Synonyms',
        description: 'High-frequency vocabulary, antonyms, idioms, and contextual usage.',
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
      // Math Topics
      {
        id: 'top_math_arithmetic',
        subjectId: 'sub_math_03',
        name: 'Percentage, Ratio & Profit/Loss',
        description: 'Standard speed-math calculations, percentages, ratios, mixtures, and interest.',
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'top_math_algebra',
        subjectId: 'sub_math_03',
        name: 'Algebra & Equations',
        description: 'Linear equations, polynomials, inequalities, exponents, and series.',
        order: 2,
        createdAt: now,
        updatedAt: now,
      },
      // Science Topics
      {
        id: 'top_sci_ict',
        subjectId: 'sub_sci_04',
        name: 'Computer Networks & AI',
        description: 'Operating systems, network protocols, cybersecurity, database concepts, and AI.',
        order: 1,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Helper to add questions and options
    const addQ = (
      id: string,
      subjectId: string,
      topicId: string,
      text: string,
      explanation: string,
      difficulty: Difficulty,
      opts: Array<{ text: string; isCorrect: boolean }>
    ) => {
      this.questions.push({
        id,
        subjectId,
        topicId,
        questionText: text,
        explanation,
        difficulty,
        questionType: 'MULTIPLE_CHOICE',
        createdAt: now,
        updatedAt: now,
      });

      opts.forEach((opt, index) => {
        this.options.push({
          id: `opt_${id}_${index + 1}`,
          questionId: id,
          optionText: opt.text,
          isCorrect: opt.isCorrect,
        });
      });
    };

    // 4. Questions & Options
    // BD Affairs Questions
    addQ(
      'q_bd_01',
      'sub_bd_01',
      'top_bd_liberation',
      'Where was the historic Mujibnagar Government sworn in on April 17, 1971?',
      'The Mujibnagar Government of Bangladesh formally took oath on April 17, 1971 at Baidyanathtala (later renamed Mujibnagar) in Meherpur district.',
      'MEDIUM',
      [
        { text: 'Baidyanathtala, Meherpur', isCorrect: true },
        { text: 'Tungipara, Gopalganj', isCorrect: false },
        { text: 'Jafflong, Sylhet', isCorrect: false },
        { text: 'Pahartali, Chittagong', isCorrect: false },
      ]
    );

    addQ(
      'q_bd_02',
      'sub_bd_01',
      'top_bd_liberation',
      'Who was the supreme Commander-in-Chief of the Mukti Bahini during the 1971 Liberation War?',
      'General M. A. G. Osmani was appointed as the Commander-in-Chief of all Bangladesh Armed Forces during the Liberation War by the Mujibnagar Government.',
      'EASY',
      [
        { text: 'General M. A. G. Osmani', isCorrect: true },
        { text: 'Major Ziaur Rahman', isCorrect: false },
        { text: 'Major Khaled Mosharraf', isCorrect: false },
        { text: 'Captain Mohiuddin Jahangir', isCorrect: false },
      ]
    );

    addQ(
      'q_bd_03',
      'sub_bd_01',
      'top_bd_constitution',
      'According to the Constitution of Bangladesh, what is the official state name of Bangladesh?',
      'Article 2 of Part I declares that the Republic is known as the "People\'s Republic of Bangladesh" (Gono Projatontri Bangladesh).',
      'EASY',
      [
        { text: "People's Republic of Bangladesh", isCorrect: true },
        { text: 'Democratic Republic of Bangladesh', isCorrect: false },
        { text: 'Republic of Bengal', isCorrect: false },
        { text: 'United States of Bangladesh', isCorrect: false },
      ]
    );

    addQ(
      'q_bd_04',
      'sub_bd_01',
      'top_bd_constitution',
      'Which article of the Bangladesh Constitution guarantees the Right to Freedom of Speech and Expression?',
      'Article 39 of the Constitution of Bangladesh guarantees Freedom of thought and conscience, and of speech, subject to reasonable restrictions imposed by law.',
      'HARD',
      [
        { text: 'Article 39', isCorrect: true },
        { text: 'Article 27', isCorrect: false },
        { text: 'Article 32', isCorrect: false },
        { text: 'Article 44', isCorrect: false },
      ]
    );

    addQ(
      'q_bd_05',
      'sub_bd_01',
      'top_bd_geography',
      'Which river of Bangladesh enters from India through Kurigram district and merges with the Jamuna?',
      'The Brahmaputra River enters Bangladesh near Kurigram and subsequently splits; the main channel carries on as the Jamuna River.',
      'MEDIUM',
      [
        { text: 'Brahmaputra', isCorrect: true },
        { text: 'Surma', isCorrect: false },
        { text: 'Kushiyara', isCorrect: false },
        { text: 'Karnafuli', isCorrect: false },
      ]
    );

    // English Language Questions
    addQ(
      'q_eng_01',
      'sub_eng_02',
      'top_eng_grammar',
      'Choose the correct sentence following Subject-Verb Agreement: "Neither the manager nor the employees ______ present at the seminar."',
      'When two subjects are joined by "neither... nor", the verb agrees with the subject closest to it. Here "employees" is plural, so "were" is correct.',
      'MEDIUM',
      [
        { text: 'were', isCorrect: true },
        { text: 'was', isCorrect: false },
        { text: 'is', isCorrect: false },
        { text: 'has been', isCorrect: false },
      ]
    );

    addQ(
      'q_eng_02',
      'sub_eng_02',
      'top_eng_grammar',
      'Identify the correct conditional: "If he had studied diligently, he ______ the BCS preliminary examination."',
      'This is a Third Conditional sentence denoting unreal past conditions. The structure is: If + past perfect, would/could + have + past participle.',
      'MEDIUM',
      [
        { text: 'would have passed', isCorrect: true },
        { text: 'would pass', isCorrect: false },
        { text: 'will pass', isCorrect: false },
        { text: 'had passed', isCorrect: false },
      ]
    );

    addQ(
      'q_eng_03',
      'sub_eng_02',
      'top_eng_vocab',
      'What is the closest synonym of the word "EPHEMERAL"?',
      '"Ephemeral" means lasting for a very short time, which is synonymous with "transitory" or "fleeting".',
      'HARD',
      [
        { text: 'Transitory', isCorrect: true },
        { text: 'Eternal', isCorrect: false },
        { text: 'Perpetual', isCorrect: false },
        { text: 'Luminous', isCorrect: false },
      ]
    );

    addQ(
      'q_eng_04',
      'sub_eng_02',
      'top_eng_vocab',
      'Complete with the appropriate preposition: "The candidate was absolved ______ all allegations."',
      'The verb "absolve" typically collocates with "from" or "of" when referring to blame or guilt. "From" is the primary standard.',
      'MEDIUM',
      [
        { text: 'from', isCorrect: true },
        { text: 'with', isCorrect: false },
        { text: 'by', isCorrect: false },
        { text: 'against', isCorrect: false },
      ]
    );

    // Math Reasoning Questions
    addQ(
      'q_math_01',
      'sub_math_03',
      'top_math_arithmetic',
      'A shopkeeper sells a book for $240 at a profit of 20%. What was the original cost price (CP)?',
      'Selling Price = Cost Price × 1.20 => 240 = CP × 1.20 => CP = 240 / 1.20 = $200.',
      'EASY',
      [
        { text: '$200', isCorrect: true },
        { text: '$190', isCorrect: false },
        { text: '$210', isCorrect: false },
        { text: '$180', isCorrect: false },
      ]
    );

    addQ(
      'q_math_02',
      'sub_math_03',
      'top_math_arithmetic',
      'If 5 workers can build a wall in 12 days, how many days will 3 workers take at the same rate?',
      'Total worker-days = 5 × 12 = 60. Days for 3 workers = 60 / 3 = 20 days.',
      'EASY',
      [
        { text: '20 days', isCorrect: true },
        { text: '15 days', isCorrect: false },
        { text: '18 days', isCorrect: false },
        { text: '25 days', isCorrect: false },
      ]
    );

    addQ(
      'q_math_03',
      'sub_math_03',
      'top_math_algebra',
      'If x + 1/x = 4, find the value of x² + 1/x².',
      'Squaring both sides: (x + 1/x)² = x² + 2(x)(1/x) + 1/x² => 4² = x² + 2 + 1/x² => 16 - 2 = 14.',
      'MEDIUM',
      [
        { text: '14', isCorrect: true },
        { text: '16', isCorrect: false },
        { text: '12', isCorrect: false },
        { text: '18', isCorrect: false },
      ]
    );

    // Science & ICT Questions
    addQ(
      'q_sci_01',
      'sub_sci_04',
      'top_sci_ict',
      'Which layer in the OSI Reference Model is responsible for end-to-end delivery and flow control?',
      'The Transport Layer (Layer 4, e.g. TCP, UDP) provides transparent transfer of data between end users, reliability, flow control, and error detection.',
      'MEDIUM',
      [
        { text: 'Transport Layer', isCorrect: true },
        { text: 'Network Layer', isCorrect: false },
        { text: 'Data Link Layer', isCorrect: false },
        { text: 'Session Layer', isCorrect: false },
      ]
    );

    addQ(
      'q_sci_02',
      'sub_sci_04',
      'top_sci_ict',
      'What does the acronym "HTTP" stand for in web technologies?',
      'Hypertext Transfer Protocol is the foundation of the World Wide Web for transferring hypertext documents.',
      'EASY',
      [
        { text: 'Hypertext Transfer Protocol', isCorrect: true },
        { text: 'High Text Transport Protocol', isCorrect: false },
        { text: 'Hyperlink Text Translate Program', isCorrect: false },
        { text: 'Home Tool Transfer Process', isCorrect: false },
      ]
    );

    // 5. Quizzes
    this.quizzes = [
      {
        id: 'quiz_bd_mastery',
        title: 'Bangladesh Affairs: High Yield Mock',
        description: 'Test your knowledge on 1971 Liberation War, Constitution, and geographical highlights for BCS & Admission.',
        subjectId: 'sub_bd_01',
        topicId: 'top_bd_liberation',
        duration: 10, // 10 minutes
        totalQuestions: 5,
        difficulty: 'MEDIUM',
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'quiz_eng_speed',
        title: 'English Grammar & Vocabulary Sprint',
        description: 'Crucial grammar rules, prepositions, and vocabulary checks with detailed explanations.',
        subjectId: 'sub_eng_02',
        topicId: 'top_eng_grammar',
        duration: 8,
        totalQuestions: 4,
        difficulty: 'MEDIUM',
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'quiz_math_speed',
        title: 'Quantitative Reasoning & Speed Math',
        description: 'Rapid calculation tricks for algebra, ratios, and percentages.',
        subjectId: 'sub_math_03',
        topicId: 'top_math_arithmetic',
        duration: 6,
        totalQuestions: 3,
        difficulty: 'EASY',
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'quiz_sci_ict',
        title: 'Computer Science & ICT Fundamentals',
        description: 'Network protocols, OSI model, and internet foundations.',
        subjectId: 'sub_sci_04',
        topicId: 'top_sci_ict',
        duration: 5,
        totalQuestions: 2,
        difficulty: 'EASY',
        isPublished: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Link Quiz to Questions
    const linkQuizQuestions = (quizId: string, qIds: string[]) => {
      qIds.forEach((qId, idx) => {
        this.quizQuestions.push({
          id: `qq_${quizId}_${idx + 1}`,
          quizId,
          questionId: qId,
          order: idx + 1,
        });
      });
    };

    linkQuizQuestions('quiz_bd_mastery', ['q_bd_01', 'q_bd_02', 'q_bd_03', 'q_bd_04', 'q_bd_05']);
    linkQuizQuestions('quiz_eng_speed', ['q_eng_01', 'q_eng_02', 'q_eng_03', 'q_eng_04']);
    linkQuizQuestions('quiz_math_speed', ['q_math_01', 'q_math_02', 'q_math_03']);
    linkQuizQuestions('quiz_sci_ict', ['q_sci_01', 'q_sci_02']);

    // 6. Initial User Progress & History for Rakib
    this.progress = [
      {
        id: 'prog_rakib',
        userId: 'usr_rakib_01',
        totalQuizzesCompleted: 6,
        totalQuestionsAnswered: 42,
        correctAnswers: 35,
        averageScore: 83.3,
        streakDays: 4,
        lastActiveAt: now,
        updatedAt: now,
      },
      {
        id: 'prog_tanvir',
        userId: 'usr_tanvir_02',
        totalQuizzesCompleted: 14,
        totalQuestionsAnswered: 110,
        correctAnswers: 98,
        averageScore: 92.5,
        streakDays: 9,
        lastActiveAt: now,
        updatedAt: now,
      },
      {
        id: 'prog_sadia',
        userId: 'usr_sadia_03',
        totalQuizzesCompleted: 12,
        totalQuestionsAnswered: 95,
        correctAnswers: 84,
        averageScore: 89.0,
        streakDays: 7,
        lastActiveAt: now,
        updatedAt: now,
      },
      {
        id: 'prog_mehedi',
        userId: 'usr_mehedi_04',
        totalQuizzesCompleted: 9,
        totalQuestionsAnswered: 70,
        correctAnswers: 58,
        averageScore: 82.8,
        streakDays: 3,
        lastActiveAt: now,
        updatedAt: now,
      },
      {
        id: 'prog_farhana',
        userId: 'usr_farhana_05',
        totalQuizzesCompleted: 8,
        totalQuestionsAnswered: 60,
        correctAnswers: 48,
        averageScore: 80.0,
        streakDays: 2,
        lastActiveAt: now,
        updatedAt: now,
      },
      {
        id: 'prog_ayesha',
        userId: 'usr_ayesha_06',
        totalQuizzesCompleted: 5,
        totalQuestionsAnswered: 35,
        correctAnswers: 26,
        averageScore: 74.2,
        streakDays: 1,
        lastActiveAt: now,
        updatedAt: now,
      },
    ];

    // Initial Bookmarks for Rakib
    this.bookmarks = [
      {
        id: 'bmk_1',
        userId: 'usr_rakib_01',
        questionId: 'q_bd_04', // Article 39
        createdAt: now,
      },
      {
        id: 'bmk_2',
        userId: 'usr_rakib_01',
        questionId: 'q_eng_03', // Ephemeral
        createdAt: now,
      },
    ];
  }

  // Relational Helpers
  getSubjectById(id: string) {
    return this.subjects.find((s) => s.id === id);
  }

  getTopicsBySubjectId(subjectId: string) {
    return this.topics.filter((t) => t.subjectId === subjectId);
  }

  getQuestionsByQuizId(quizId: string) {
    const qq = this.quizQuestions.filter((q) => q.quizId === quizId).sort((a, b) => a.order - b.order);
    return qq
      .map((item) => this.questions.find((q) => q.id === item.questionId))
      .filter((q): q is DbQuestion => !!q);
  }

  getOptionsByQuestionId(questionId: string) {
    return this.options.filter((o) => o.questionId === questionId);
  }

  getUserBookmarks(userId: string) {
    return this.bookmarks.filter((b) => b.userId === userId);
  }

  isBookmarked(userId: string, questionId: string) {
    return this.bookmarks.some((b) => b.userId === userId && b.questionId === questionId);
  }
}

export const db = new InMemoryDatabase();
