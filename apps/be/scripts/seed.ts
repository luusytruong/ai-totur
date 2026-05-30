/// <reference types="node" />

import {
    conversations,
    exercises,
    exerciseSubmissions,
    lessons,
    messages,
    userAnalytics,
    users,
} from '@workspace/types/db';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString =
  process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/ppat';

type UserLevel = 'beginner' | 'intermediate' | 'advanced';
type Difficulty = 'easy' | 'medium' | 'hard';

type LessonSeed = {
  language: 'python' | 'javascript' | 'cpp' | 'java';
  topic: string;
  title: string;
  difficulty: Difficulty;
  contentMd: string;
};

type ExerciseSeed = {
  title: string;
  description: string;
  starterCode: string;
  expectedOutput: string;
  testCases: Array<{ input: string; expected: string }>;
  hint: string;
};

function createUsersSeed(): Array<{
  email: string;
  displayName: string;
  level: UserLevel;
  role: 'student';
}> {
  return Array.from({ length: 100 }, (_, i) => {
    const index = i + 1;
    let level: UserLevel = 'beginner';
    if (index > 40 && index <= 80) level = 'intermediate';
    if (index > 80) level = 'advanced';

    return {
      email: `student${index}@test.com`,
      displayName: `Student ${index}`,
      level,
      role: 'student' as const,
    };
  });
}

function createLessonSeeds(): LessonSeed[] {
  const topicMap = {
    python: [
      'Biến và kiểu dữ liệu',
      'Điều kiện rẽ nhánh',
      'Vòng lặp',
      'Hàm',
      'List và Tuple',
      'Dictionary và Set',
      'Xử lý chuỗi',
      'File I/O',
      'OOP cơ bản',
      'Đệ quy',
      'Exception Handling',
      'Thuật toán cơ bản',
      'Thao tác mảng',
    ],
    javascript: [
      'Variables và scope',
      'Điều kiện và vòng lặp',
      'Function declaration',
      'Arrow function',
      'Array methods',
      'Object literals',
      'String processing',
      'Promises',
      'Async/Await',
      'DOM cơ bản',
      'Error handling',
      'Module system',
      'OOP với class',
    ],
    cpp: [
      'Biến và kiểu dữ liệu',
      'Câu lệnh điều kiện',
      'Vòng lặp',
      'Hàm',
      'Mảng một chiều',
      'Con trỏ cơ bản',
      'Chuỗi và ký tự',
      'Struct và class',
      'STL vector',
      'STL map',
      'Đệ quy',
      'Xử lý file',
    ],
    java: [
      'Biến và kiểu dữ liệu',
      'If/Else và switch',
      'Loops',
      'Methods',
      'Array và ArrayList',
      'String handling',
      'Class và Object',
      'Inheritance',
      'Interface',
      'Exception handling',
      'Collections',
      'File I/O',
    ],
  } as const;

  const languagePlan: Array<{ language: LessonSeed['language']; count: number }> = [
    { language: 'python', count: 13 },
    { language: 'javascript', count: 13 },
    { language: 'cpp', count: 12 },
    { language: 'java', count: 12 },
  ];

  const lessonsSeed: LessonSeed[] = [];
  let lessonNumber = 1;
  const diffCycle: Difficulty[] = ['easy', 'medium', 'hard'];

  for (const { language, count } of languagePlan) {
    const topics = topicMap[language];

    for (let i = 0; i < count; i++) {
      const topic = topics[i % topics.length];
      const difficulty = diffCycle[(lessonNumber - 1) % diffCycle.length];
      const title = `Bài học ${lessonNumber}: ${topic} (${language.toUpperCase()})`;

      lessonsSeed.push({
        language,
        topic,
        title,
        difficulty,
        contentMd: [
          `# ${title}`,
          '',
          `## Mục tiêu`,
          `- Nắm vững chủ đề: ${topic}.`,
          `- Áp dụng được vào bài tập thực hành trong ${language.toUpperCase()}.`,
          '',
          `## Lý thuyết cốt lõi`,
          `Bài học này trình bày các khái niệm nền tảng của **${topic}** trong **${language.toUpperCase()}** cùng ví dụ minh họa ngắn gọn.`,
          '',
          `## Lưu ý triển khai`,
          `- Kiểm tra input/output đúng định dạng trước khi nộp bài.`,
          `- Ưu tiên lời giải rõ ràng trước tối ưu vi mô.`,
        ].join('\n'),
      });

      lessonNumber++;
    }
  }

  return lessonsSeed;
}

function createExerciseSeed(
  language: LessonSeed['language'],
  difficulty: Difficulty,
  lessonNo: number,
  exerciseNo: number,
): ExerciseSeed {
  const multiplier = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 5;
  const adder = lessonNo + exerciseNo;

  const description =
    difficulty === 'easy'
      ? `Viết hàm/chương trình nhận số nguyên n và trả về n * ${multiplier}.`
      : difficulty === 'medium'
        ? `Viết hàm/chương trình nhận số nguyên n và trả về n * ${multiplier} + ${adder}.`
        : `Viết hàm/chương trình nhận số nguyên n và trả về n * ${multiplier} + ${adder}. Lưu ý xử lý cả n âm.`;

  const expectedOutput =
    difficulty === 'easy'
      ? `Kết quả phải bằng n * ${multiplier}.`
      : `Kết quả phải bằng n * ${multiplier} + ${adder}.`;

  const numericCases = [2, 5, -3].map((n) => {
    const expectedValue = n * multiplier + (difficulty === 'easy' ? 0 : adder);
    return { n, expectedValue };
  });

  if (language === 'javascript') {
    return {
      title: `Bài tập ${exerciseNo} (${difficulty.toUpperCase()}) - JavaScript`,
      description,
      starterCode:
        difficulty === 'easy'
          ? `function solve(n) {\n  // TODO: trả về n * ${multiplier}\n  return 0;\n}\n`
          : `function solve(n) {\n  // TODO: trả về n * ${multiplier} + ${adder}\n  return 0;\n}\n`,
      expectedOutput,
      testCases: numericCases.map(({ n, expectedValue }) => ({
        input: JSON.stringify(n),
        expected: JSON.stringify(expectedValue),
      })),
      hint:
        difficulty === 'hard'
          ? 'Tách rõ bước nhân và bước cộng, rồi test thêm với số âm.'
          : 'Xác nhận công thức trước khi trả về kết quả.',
    };
  }

  if (language === 'python') {
    return {
      title: `Bài tập ${exerciseNo} (${difficulty.toUpperCase()}) - Python`,
      description,
      starterCode:
        difficulty === 'easy'
          ? `def solve(n):\n    # TODO: return n * ${multiplier}\n    return 0\n`
          : `def solve(n):\n    # TODO: return n * ${multiplier} + ${adder}\n    return 0\n`,
      expectedOutput,
      testCases: numericCases.map(({ n, expectedValue }) => ({
        input: JSON.stringify(n),
        expected: JSON.stringify(expectedValue),
      })),
      hint:
        difficulty === 'hard'
          ? 'Kiểm tra kỹ kết quả với n âm để tránh sai dấu.'
          : 'Đối chiếu output theo đúng công thức yêu cầu.',
    };
  }

  if (language === 'cpp') {
    return {
      title: `Bài tập ${exerciseNo} (${difficulty.toUpperCase()}) - C++`,
      description,
      starterCode:
        difficulty === 'easy'
          ? `#include <iostream>\nusing namespace std;\n\nint main() {\n  long long n;\n  cin >> n;\n  // TODO: in ra n * ${multiplier}\n  cout << 0;\n  return 0;\n}\n`
          : `#include <iostream>\nusing namespace std;\n\nint main() {\n  long long n;\n  cin >> n;\n  // TODO: in ra n * ${multiplier} + ${adder}\n  cout << 0;\n  return 0;\n}\n`,
      expectedOutput,
      testCases: numericCases.map(({ n, expectedValue }) => ({
        input: String(n),
        expected: String(expectedValue),
      })),
      hint:
        difficulty === 'hard'
          ? 'Dùng long long để tránh tràn số trong bài thực tế lớn hơn.'
          : 'Đảm bảo đọc input và in output không thừa ký tự.',
    };
  }

  return {
    title: `Bài tập ${exerciseNo} (${difficulty.toUpperCase()}) - Java`,
    description,
    starterCode:
      difficulty === 'easy'
        ? `import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    long n = sc.nextLong();\n    // TODO: in ra n * ${multiplier}\n    System.out.print(0);\n  }\n}\n`
        : `import java.util.Scanner;\n\npublic class Main {\n  public static void main(String[] args) {\n    Scanner sc = new Scanner(System.in);\n    long n = sc.nextLong();\n    // TODO: in ra n * ${multiplier} + ${adder}\n    System.out.print(0);\n  }\n}\n`,
    expectedOutput,
    testCases: numericCases.map(({ n, expectedValue }) => ({
      input: String(n),
      expected: String(expectedValue),
    })),
    hint:
      difficulty === 'hard'
        ? 'Giữ công thức trong một biểu thức rõ ràng để tránh sai ưu tiên toán tử.'
        : 'So sánh output mẫu với từng test để kiểm tra nhanh.',
  };
}

function createExerciseDifficultyPlan(): Difficulty[] {
  return [
    ...Array.from({ length: 80 }, () => 'easy' as const),
    ...Array.from({ length: 80 }, () => 'medium' as const),
    ...Array.from({ length: 40 }, () => 'hard' as const),
  ];
}

async function seed() {
  const sql = postgres(connectionString);
  const db = drizzle(sql);

  console.log('🌱 Starting full database seed (BA 4.2)');

  console.log('Cleaning old data...');
  // Delete in correct dependency order
  await db.delete(messages);
  await db.delete(conversations);
  await db.delete(exerciseSubmissions);
  await db.delete(exercises);
  await db.delete(lessons);
  await db.delete(userAnalytics);
  await db.delete(users);

  // 1. Seed 100 Users
  console.log('Seeding 100 users...');
  const usersToInsert = createUsersSeed();
  const defaultPassword = await bcrypt.hash('password123', 10);
  await db
    .insert(users)
    .values(usersToInsert.map((u) => ({ ...u, passwordHash: defaultPassword })));

  // 2. Seed 50 lessons across Python/JavaScript/C++/Java
  console.log('Seeding 50 lessons...');
  const lessonsToInsert = createLessonSeeds();

  const insertedLessons = await db
    .insert(lessons)
    .values(lessonsToInsert)
    .returning({ id: lessons.id, language: lessons.language });

  // 3. Seed 200 exercises with exact difficulty ratio 80/80/40
  console.log('Seeding 200 exercises...');
  const difficultyPlan = createExerciseDifficultyPlan();
  const exercisesToInsert: Array<{
    lessonId: number;
    title: string;
    description: string;
    starterCode: string;
    expectedOutput: string;
    testCases: Array<{ input: string; expected: string }>;
    hint: string;
    prerequisiteLessonId: number | null;
  }> = [];

  let planIndex = 0;

  insertedLessons.forEach((lesson, lessonIndex) => {
    for (let exerciseNo = 1; exerciseNo <= 4; exerciseNo++) {
      const difficulty = difficultyPlan[planIndex++];
      const seedItem = createExerciseSeed(
        lesson.language as LessonSeed['language'],
        difficulty,
        lessonIndex + 1,
        exerciseNo,
      );

      const isFirstExerciseInLesson = exerciseNo === 1;
      const previousLessonId = lessonIndex > 0 ? insertedLessons[lessonIndex - 1]?.id : null;

      exercisesToInsert.push({
        lessonId: lesson.id,
        title: seedItem.title,
        description: `[${difficulty.toUpperCase()}] ${seedItem.description}`,
        starterCode: seedItem.starterCode,
        expectedOutput: seedItem.expectedOutput,
        testCases: seedItem.testCases,
        hint: seedItem.hint,
        prerequisiteLessonId: isFirstExerciseInLesson ? previousLessonId ?? null : null,
      });
    }
  });

  // Insert in batches of 50
  const BATCH_SIZE = 50;
  for (let i = 0; i < exercisesToInsert.length; i += BATCH_SIZE) {
    const batch = exercisesToInsert.slice(i, i + BATCH_SIZE);
    await db.insert(exercises).values(batch);
  }

  const userLevelSummary = usersToInsert.reduce(
    (acc, u) => {
      acc[u.level] += 1;
      return acc;
    },
    { beginner: 0, intermediate: 0, advanced: 0 },
  );

  const languageSummary = lessonsToInsert.reduce(
    (acc, l) => {
      acc[l.language] += 1;
      return acc;
    },
    { python: 0, javascript: 0, cpp: 0, java: 0 },
  );

  const exerciseDifficultySummary = difficultyPlan.reduce(
    (acc, d) => {
      acc[d] += 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 },
  );

  console.log('✅ Seed completed successfully with expected distribution.');
  console.log('User levels:', userLevelSummary);
  console.log('Lesson languages:', languageSummary);
  console.log('Exercise difficulties:', exerciseDifficultySummary);

  await sql.end();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
