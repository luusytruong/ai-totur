import type { LessonListItem } from '@workspace/types';
import { describe, expect, it } from 'vitest';
import type { DrizzleDB } from '../../types.js';
import { LessonsService } from './lessons.service.js';

describe('LessonsService Unit Tests (Logic LLM parser)', () => {
  it('kiểm tra parse JSON từ kết quả của LLM thành công dù có text rác xung quanh', () => {
    const mockDb = {} as DrizzleDB;
    const service = new LessonsService(mockDb);

    // Mẫu danh sách bài học có sẵn
    const candidates: LessonListItem[] = [
      {
        id: 1,
        title: 'Intro to Python',
        language: 'python',
        topic: 'basic',
        difficulty: 'easy',
        contentMd: '',
        isRecommended: true,
        stats: {
          totalExercises: 0,
          completedExercises: 0,
          isCompleted: false,
          isStarted: false,
          progress: 0,
        },
      },
      {
        id: 2,
        title: 'Advanced OOP',
        language: 'python',
        topic: 'oop',
        difficulty: 'hard',
        contentMd: '',
        isRecommended: false,
        stats: {
          totalExercises: 0,
          completedExercises: 0,
          isCompleted: false,
          isStarted: false,
          progress: 0,
        },
      },
    ];

    // Chuỗi text rác lộn xộn mô phỏng câu trả lời ngẫu nhiên từ LLM + JSON
    const llmResponse = `
    Chào bạn, dựa trên những lỗi bạn gặp phải về class, mình xin gợi ý:
    {
      "lessonId": 2,
      "reason": "Bạn cần học thêm về Object Oriented Programming để giải quyết lỗi."
    }
    Chúc bạn học tốt nhé!
    `;

    // Ép kiểu gọi hàm private để kiểm tra logic Unit Test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (service as any).parseLessonRecommendation(llmResponse, candidates);

    expect(result).not.toBeNull();
    expect(result?.id).toBe(2);
    expect(result?.reason).toBe(
      'Bạn cần học thêm về Object Oriented Programming để giải quyết lỗi.',
    );
  });

  it('trả về null nếu LLM không tạo ra JSON hợp lệ hoặc thiếu lesson id', () => {
    const mockDb = {} as DrizzleDB;
    const service = new LessonsService(mockDb);

    const candidates: LessonListItem[] = [
      {
        id: 1,
        title: 'Intro to Python',
        language: 'python',
        topic: 'basic',
        difficulty: 'easy',
        contentMd: '',
        isRecommended: true,
        stats: {
          totalExercises: 0,
          completedExercises: 0,
          isCompleted: false,
          isStarted: false,
          progress: 0,
        },
      },
    ];

    // Chuỗi văn bản thuần túy không chứa cú pháp JSON
    const llmResponse = `Hiện tại bạn nên tự thực hành thêm, không có bài học nào khớp.`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (service as any).parseLessonRecommendation(llmResponse, candidates);
    expect(result).toBeNull();
  });
});
