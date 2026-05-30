import { describe, expect, it } from 'vitest';

const API_URL = 'http://127.0.0.1:3001';
const SEED_EMAIL = 'student1@test.com';
const SEED_PASSWORD = 'password123';

// Helper lấy token
async function getToken(): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SEED_EMAIL, password: SEED_PASSWORD }),
  });
  const body = (await res.json()) as any;
  return body.data.accessToken;
}

// ============ HEALTH ============
describe('Health Check', () => {
  it('GET /health — status 200, phản hồi < 200ms', async () => {
    const start = performance.now();
    const res = await fetch(`${API_URL}/health`);
    const duration = performance.now() - start;
    const body = (await res.json()) as any;

    expect(res.status).toBe(200);
    expect(body.data.status).toBe('hoạt động');
    expect(duration).toBeLessThan(200);
  });
});

// ============ AUTH ============
describe('Auth API', () => {
  it('POST /api/auth/register — email trùng trả về 409', async () => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: SEED_EMAIL,
        password: 'password123',
        confirmPassword: 'password123',
        displayName: 'Test',
        level: 'beginner',
      }),
    });
    expect(res.status).toBe(409);
  });

  it('POST /api/auth/login — đăng nhập đúng trả về token', async () => {
    const start = performance.now();
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: SEED_EMAIL, password: SEED_PASSWORD }),
    });
    const duration = performance.now() - start;
    const body = (await res.json()) as any;

    expect(res.status).toBe(200);
    expect(body.data.accessToken).toBeDefined();
    expect(duration).toBeLessThan(200);
  });

  it('POST /api/auth/login — sai mật khẩu trả về 401', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: SEED_EMAIL, password: 'wrongpassword' }),
    });
    expect(res.status).toBe(401);
  });

  it('GET /api/lessons — không có token trả về 401', async () => {
    const res = await fetch(`${API_URL}/api/lessons`);
    expect(res.status).toBe(401);
  });
});

// ============ LESSONS ============
describe('Lessons API', () => {
  it('GET /api/lessons — trả về danh sách, phản hồi < 200ms', async () => {
    const token = await getToken();
    const start = performance.now();
    const res = await fetch(`${API_URL}/api/lessons`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const duration = performance.now() - start;
    const body = (await res.json()) as any;

    expect(res.status).toBe(200);
    expect(Array.isArray(body.data.items)).toBe(true);
    expect(body.data.items.length).toBeGreaterThan(0);
    expect(duration).toBeLessThan(200);
  });

  it('GET /api/lessons/:id — trả về chi tiết bài học', async () => {
    const token = await getToken();
    const start = performance.now();
    const res = await fetch(`${API_URL}/api/lessons/52`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const duration = performance.now() - start;
    const body = (await res.json()) as any;

    expect(res.status).toBe(200);
    expect(body.data).toHaveProperty('title');
    expect(duration).toBeLessThan(200);
  });
});

// ============ EXERCISES ============
describe('Exercises API', () => {
  it('GET /api/exercises/:id — trả về chi tiết bài tập', async () => {
    const token = await getToken();
    const start = performance.now();
    const res = await fetch(`${API_URL}/api/exercises/202`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const duration = performance.now() - start;
    const body = (await res.json()) as any;

    expect(res.status).toBe(200);
    expect(body.data).toHaveProperty('title');
    expect(duration).toBeLessThan(200);
  });
});

// ============ PROGRESS ============
describe('Progress API', () => {
  it('GET /api/progress/me — trả về tiến độ cá nhân, phản hồi < 200ms', async () => {
    const token = await getToken();
    const start = performance.now();
    const res = await fetch(`${API_URL}/api/progress/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const duration = performance.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });
});

// ============ ANALYTICS ============
describe('Analytics API', () => {
  it('GET /api/analytics/me — trả về knowledge log, phản hồi < 200ms', async () => {
    const token = await getToken();
    const start = performance.now();
    const res = await fetch(`${API_URL}/api/analytics/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const duration = performance.now() - start;

    expect(res.status).toBe(200);
    expect(duration).toBeLessThan(200);
  });
});
