import { check, sleep } from 'k6';
import http from 'k6/http';

export const options = {
  vus: 50,
  duration: '30s',
  thresholds: {
    // Đảm bảo 95% request hoàn thành dưới 200ms
    http_req_duration: ['p(95)<200'],
    http_req_failed: ['rate<0.01'],
  },
};

const API_URL = 'http://127.0.0.1:3001';

// Setup được chạy một lần trước khi quá trình load test bắt đầu
// Nhiệm vụ của nó là thực hiện login lấy một token xài chung để giảm tải lúc test
export function setup() {
  const payload = JSON.stringify({
    email: 'lst27062004@gmail.com',
    password: '111111',
  });

  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(`${API_URL}/api/auth/login`, payload, params);

  // Khẳng định login thành công trong setup
  check(res, {
    'login successful in setup': (r) => r.status === 200,
  });

  let token = null;
  try {
    const body = res.json();
    token = body.data.accessToken;
  } catch (e) {
    console.error('Cannot parse token:', e);
  }

  return { token: token }; // Trả dữ liệu vào argument cho default function
}

// Hàm main dùng để measure tải
export default function (data) {
  const headers = {
    Authorization: `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // 1. Check health
  const resHealth = http.get(`${API_URL}/health`);
  check(resHealth, {
    'GET /health - 200': (r) => r.status === 200,
    'GET /health < 200ms': (r) => r.timings.duration < 200,
  });

  // 2. Lấy danh sách lessons
  const resLessons = http.get(`${API_URL}/api/lessons`, { headers });
  check(resLessons, {
    'GET /api/lessons - 200': (r) => r.status === 200,
    'GET /api/lessons < 200ms': (r) => r.timings.duration < 200,
  });

  // 3. Lấy thông tin progress cá nhân
  const resProgress = http.get(`${API_URL}/api/progress/me`, { headers });
  check(resProgress, {
    'GET /api/progress/me - 200': (r) => r.status === 200,
  });

  // 4. Lấy knowledge logs
  const resAnalytics = http.get(`${API_URL}/api/analytics/me`, { headers });
  check(resAnalytics, {
    'GET /api/analytics/me - 200': (r) => r.status === 200,
  });

  sleep(1);
}
