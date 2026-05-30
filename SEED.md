# Seed Report

Generated at: 2026-05-25T07:41:19.591Z

## 4.6 Test Data Requirements (H01)

- Users: 100 (40 beginner / 40 intermediate / 20 advanced)
- Lessons: 50 (Python, JavaScript, C++, Java)
- Exercises: 200 (80 Easy / 80 Medium / 40 Hard)

## Seeded Result Summary

- Total users in DB: 100
- Users beginner: 40
- Users intermediate: 40
- Users advanced: 20
- Total lessons in DB: 50
- Lessons cpp: 12
- Lessons java: 12
- Lessons javascript: 13
- Lessons python: 13
- Total exercises in DB: 200
- Exercises easy: 80
- Exercises hard: 40
- Exercises medium: 80
- Exercises with empty testCases: 0

## User Dataset Pattern

- Email pattern: student{1..100}@test.com
- Display name pattern: Student {1..100}
- Password for all users: password123 (bcrypt hashed in DB)
- Role for all users: student
- Level mapping:
  - student1..student40: beginner
  - student41..student80: intermediate
  - student81..student100: advanced

## Lessons (All 50 Rows)

| id | title | language | topic | difficulty |
| --- | --- | --- | --- | --- |
| 52 | Bài học 1: Biến và kiểu dữ liệu (PYTHON) | python | Biến và kiểu dữ liệu | easy |
| 53 | Bài học 2: Điều kiện rẽ nhánh (PYTHON) | python | Điều kiện rẽ nhánh | medium |
| 54 | Bài học 3: Vòng lặp (PYTHON) | python | Vòng lặp | hard |
| 55 | Bài học 4: Hàm (PYTHON) | python | Hàm | easy |
| 56 | Bài học 5: List và Tuple (PYTHON) | python | List và Tuple | medium |
| 57 | Bài học 6: Dictionary và Set (PYTHON) | python | Dictionary và Set | hard |
| 58 | Bài học 7: Xử lý chuỗi (PYTHON) | python | Xử lý chuỗi | easy |
| 59 | Bài học 8: File I/O (PYTHON) | python | File I/O | medium |
| 60 | Bài học 9: OOP cơ bản (PYTHON) | python | OOP cơ bản | hard |
| 61 | Bài học 10: Đệ quy (PYTHON) | python | Đệ quy | easy |
| 62 | Bài học 11: Exception Handling (PYTHON) | python | Exception Handling | medium |
| 63 | Bài học 12: Thuật toán cơ bản (PYTHON) | python | Thuật toán cơ bản | hard |
| 64 | Bài học 13: Thao tác mảng (PYTHON) | python | Thao tác mảng | easy |
| 65 | Bài học 14: Variables và scope (JAVASCRIPT) | javascript | Variables và scope | medium |
| 66 | Bài học 15: Điều kiện và vòng lặp (JAVASCRIPT) | javascript | Điều kiện và vòng lặp | hard |
| 67 | Bài học 16: Function declaration (JAVASCRIPT) | javascript | Function declaration | easy |
| 68 | Bài học 17: Arrow function (JAVASCRIPT) | javascript | Arrow function | medium |
| 69 | Bài học 18: Array methods (JAVASCRIPT) | javascript | Array methods | hard |
| 70 | Bài học 19: Object literals (JAVASCRIPT) | javascript | Object literals | easy |
| 71 | Bài học 20: String processing (JAVASCRIPT) | javascript | String processing | medium |
| 72 | Bài học 21: Promises (JAVASCRIPT) | javascript | Promises | hard |
| 73 | Bài học 22: Async/Await (JAVASCRIPT) | javascript | Async/Await | easy |
| 74 | Bài học 23: DOM cơ bản (JAVASCRIPT) | javascript | DOM cơ bản | medium |
| 75 | Bài học 24: Error handling (JAVASCRIPT) | javascript | Error handling | hard |
| 76 | Bài học 25: Module system (JAVASCRIPT) | javascript | Module system | easy |
| 77 | Bài học 26: OOP với class (JAVASCRIPT) | javascript | OOP với class | medium |
| 78 | Bài học 27: Biến và kiểu dữ liệu (CPP) | cpp | Biến và kiểu dữ liệu | hard |
| 79 | Bài học 28: Câu lệnh điều kiện (CPP) | cpp | Câu lệnh điều kiện | easy |
| 80 | Bài học 29: Vòng lặp (CPP) | cpp | Vòng lặp | medium |
| 81 | Bài học 30: Hàm (CPP) | cpp | Hàm | hard |
| 82 | Bài học 31: Mảng một chiều (CPP) | cpp | Mảng một chiều | easy |
| 83 | Bài học 32: Con trỏ cơ bản (CPP) | cpp | Con trỏ cơ bản | medium |
| 84 | Bài học 33: Chuỗi và ký tự (CPP) | cpp | Chuỗi và ký tự | hard |
| 85 | Bài học 34: Struct và class (CPP) | cpp | Struct và class | easy |
| 86 | Bài học 35: STL vector (CPP) | cpp | STL vector | medium |
| 87 | Bài học 36: STL map (CPP) | cpp | STL map | hard |
| 88 | Bài học 37: Đệ quy (CPP) | cpp | Đệ quy | easy |
| 89 | Bài học 38: Xử lý file (CPP) | cpp | Xử lý file | medium |
| 90 | Bài học 39: Biến và kiểu dữ liệu (JAVA) | java | Biến và kiểu dữ liệu | hard |
| 91 | Bài học 40: If/Else và switch (JAVA) | java | If/Else và switch | easy |
| 92 | Bài học 41: Loops (JAVA) | java | Loops | medium |
| 93 | Bài học 42: Methods (JAVA) | java | Methods | hard |
| 94 | Bài học 43: Array và ArrayList (JAVA) | java | Array và ArrayList | easy |
| 95 | Bài học 44: String handling (JAVA) | java | String handling | medium |
| 96 | Bài học 45: Class và Object (JAVA) | java | Class và Object | hard |
| 97 | Bài học 46: Inheritance (JAVA) | java | Inheritance | easy |
| 98 | Bài học 47: Interface (JAVA) | java | Interface | medium |
| 99 | Bài học 48: Exception handling (JAVA) | java | Exception handling | hard |
| 100 | Bài học 49: Collections (JAVA) | java | Collections | easy |
| 101 | Bài học 50: File I/O (JAVA) | java | File I/O | medium |

## Exercises (All 200 Rows)

| id | lessonId | language | title | difficulty | testCaseCount |
| --- | --- | --- | --- | --- | --- |
| 202 | 52 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 203 | 52 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 204 | 52 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 205 | 52 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 206 | 53 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 207 | 53 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 208 | 53 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 209 | 53 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 210 | 54 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 211 | 54 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 212 | 54 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 213 | 54 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 214 | 55 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 215 | 55 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 216 | 55 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 217 | 55 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 218 | 56 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 219 | 56 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 220 | 56 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 221 | 56 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 222 | 57 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 223 | 57 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 224 | 57 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 225 | 57 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 226 | 58 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 227 | 58 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 228 | 58 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 229 | 58 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 230 | 59 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 231 | 59 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 232 | 59 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 233 | 59 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 234 | 60 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 235 | 60 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 236 | 60 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 237 | 60 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 238 | 61 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 239 | 61 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 240 | 61 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 241 | 61 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 242 | 62 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 243 | 62 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 244 | 62 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 245 | 62 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 246 | 63 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 247 | 63 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 248 | 63 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 249 | 63 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 250 | 64 | python | Bài tập 1 (EASY) - Python | easy | 3 |
| 251 | 64 | python | Bài tập 2 (EASY) - Python | easy | 3 |
| 252 | 64 | python | Bài tập 3 (EASY) - Python | easy | 3 |
| 253 | 64 | python | Bài tập 4 (EASY) - Python | easy | 3 |
| 254 | 65 | javascript | Bài tập 1 (EASY) - JavaScript | easy | 3 |
| 255 | 65 | javascript | Bài tập 2 (EASY) - JavaScript | easy | 3 |
| 256 | 65 | javascript | Bài tập 3 (EASY) - JavaScript | easy | 3 |
| 257 | 65 | javascript | Bài tập 4 (EASY) - JavaScript | easy | 3 |
| 258 | 66 | javascript | Bài tập 1 (EASY) - JavaScript | easy | 3 |
| 259 | 66 | javascript | Bài tập 2 (EASY) - JavaScript | easy | 3 |
| 260 | 66 | javascript | Bài tập 3 (EASY) - JavaScript | easy | 3 |
| 261 | 66 | javascript | Bài tập 4 (EASY) - JavaScript | easy | 3 |
| 262 | 67 | javascript | Bài tập 1 (EASY) - JavaScript | easy | 3 |
| 263 | 67 | javascript | Bài tập 2 (EASY) - JavaScript | easy | 3 |
| 264 | 67 | javascript | Bài tập 3 (EASY) - JavaScript | easy | 3 |
| 265 | 67 | javascript | Bài tập 4 (EASY) - JavaScript | easy | 3 |
| 266 | 68 | javascript | Bài tập 1 (EASY) - JavaScript | easy | 3 |
| 267 | 68 | javascript | Bài tập 2 (EASY) - JavaScript | easy | 3 |
| 268 | 68 | javascript | Bài tập 3 (EASY) - JavaScript | easy | 3 |
| 269 | 68 | javascript | Bài tập 4 (EASY) - JavaScript | easy | 3 |
| 270 | 69 | javascript | Bài tập 1 (EASY) - JavaScript | easy | 3 |
| 271 | 69 | javascript | Bài tập 2 (EASY) - JavaScript | easy | 3 |
| 272 | 69 | javascript | Bài tập 3 (EASY) - JavaScript | easy | 3 |
| 273 | 69 | javascript | Bài tập 4 (EASY) - JavaScript | easy | 3 |
| 274 | 70 | javascript | Bài tập 1 (EASY) - JavaScript | easy | 3 |
| 275 | 70 | javascript | Bài tập 2 (EASY) - JavaScript | easy | 3 |
| 276 | 70 | javascript | Bài tập 3 (EASY) - JavaScript | easy | 3 |
| 277 | 70 | javascript | Bài tập 4 (EASY) - JavaScript | easy | 3 |
| 278 | 71 | javascript | Bài tập 1 (EASY) - JavaScript | easy | 3 |
| 279 | 71 | javascript | Bài tập 2 (EASY) - JavaScript | easy | 3 |
| 280 | 71 | javascript | Bài tập 3 (EASY) - JavaScript | easy | 3 |
| 281 | 71 | javascript | Bài tập 4 (EASY) - JavaScript | easy | 3 |
| 282 | 72 | javascript | Bài tập 1 (MEDIUM) - JavaScript | medium | 3 |
| 283 | 72 | javascript | Bài tập 2 (MEDIUM) - JavaScript | medium | 3 |
| 284 | 72 | javascript | Bài tập 3 (MEDIUM) - JavaScript | medium | 3 |
| 285 | 72 | javascript | Bài tập 4 (MEDIUM) - JavaScript | medium | 3 |
| 286 | 73 | javascript | Bài tập 1 (MEDIUM) - JavaScript | medium | 3 |
| 287 | 73 | javascript | Bài tập 2 (MEDIUM) - JavaScript | medium | 3 |
| 288 | 73 | javascript | Bài tập 3 (MEDIUM) - JavaScript | medium | 3 |
| 289 | 73 | javascript | Bài tập 4 (MEDIUM) - JavaScript | medium | 3 |
| 290 | 74 | javascript | Bài tập 1 (MEDIUM) - JavaScript | medium | 3 |
| 291 | 74 | javascript | Bài tập 2 (MEDIUM) - JavaScript | medium | 3 |
| 292 | 74 | javascript | Bài tập 3 (MEDIUM) - JavaScript | medium | 3 |
| 293 | 74 | javascript | Bài tập 4 (MEDIUM) - JavaScript | medium | 3 |
| 294 | 75 | javascript | Bài tập 1 (MEDIUM) - JavaScript | medium | 3 |
| 295 | 75 | javascript | Bài tập 2 (MEDIUM) - JavaScript | medium | 3 |
| 296 | 75 | javascript | Bài tập 3 (MEDIUM) - JavaScript | medium | 3 |
| 297 | 75 | javascript | Bài tập 4 (MEDIUM) - JavaScript | medium | 3 |
| 298 | 76 | javascript | Bài tập 1 (MEDIUM) - JavaScript | medium | 3 |
| 299 | 76 | javascript | Bài tập 2 (MEDIUM) - JavaScript | medium | 3 |
| 300 | 76 | javascript | Bài tập 3 (MEDIUM) - JavaScript | medium | 3 |
| 301 | 76 | javascript | Bài tập 4 (MEDIUM) - JavaScript | medium | 3 |
| 302 | 77 | javascript | Bài tập 1 (MEDIUM) - JavaScript | medium | 3 |
| 303 | 77 | javascript | Bài tập 2 (MEDIUM) - JavaScript | medium | 3 |
| 304 | 77 | javascript | Bài tập 3 (MEDIUM) - JavaScript | medium | 3 |
| 305 | 77 | javascript | Bài tập 4 (MEDIUM) - JavaScript | medium | 3 |
| 306 | 78 | cpp | Bài tập 1 (MEDIUM) - C++ | medium | 3 |
| 307 | 78 | cpp | Bài tập 2 (MEDIUM) - C++ | medium | 3 |
| 308 | 78 | cpp | Bài tập 3 (MEDIUM) - C++ | medium | 3 |
| 309 | 78 | cpp | Bài tập 4 (MEDIUM) - C++ | medium | 3 |
| 310 | 79 | cpp | Bài tập 1 (MEDIUM) - C++ | medium | 3 |
| 311 | 79 | cpp | Bài tập 2 (MEDIUM) - C++ | medium | 3 |
| 312 | 79 | cpp | Bài tập 3 (MEDIUM) - C++ | medium | 3 |
| 313 | 79 | cpp | Bài tập 4 (MEDIUM) - C++ | medium | 3 |
| 314 | 80 | cpp | Bài tập 1 (MEDIUM) - C++ | medium | 3 |
| 315 | 80 | cpp | Bài tập 2 (MEDIUM) - C++ | medium | 3 |
| 316 | 80 | cpp | Bài tập 3 (MEDIUM) - C++ | medium | 3 |
| 317 | 80 | cpp | Bài tập 4 (MEDIUM) - C++ | medium | 3 |
| 318 | 81 | cpp | Bài tập 1 (MEDIUM) - C++ | medium | 3 |
| 319 | 81 | cpp | Bài tập 2 (MEDIUM) - C++ | medium | 3 |
| 320 | 81 | cpp | Bài tập 3 (MEDIUM) - C++ | medium | 3 |
| 321 | 81 | cpp | Bài tập 4 (MEDIUM) - C++ | medium | 3 |
| 322 | 82 | cpp | Bài tập 1 (MEDIUM) - C++ | medium | 3 |
| 323 | 82 | cpp | Bài tập 2 (MEDIUM) - C++ | medium | 3 |
| 324 | 82 | cpp | Bài tập 3 (MEDIUM) - C++ | medium | 3 |
| 325 | 82 | cpp | Bài tập 4 (MEDIUM) - C++ | medium | 3 |
| 326 | 83 | cpp | Bài tập 1 (MEDIUM) - C++ | medium | 3 |
| 327 | 83 | cpp | Bài tập 2 (MEDIUM) - C++ | medium | 3 |
| 328 | 83 | cpp | Bài tập 3 (MEDIUM) - C++ | medium | 3 |
| 329 | 83 | cpp | Bài tập 4 (MEDIUM) - C++ | medium | 3 |
| 330 | 84 | cpp | Bài tập 1 (MEDIUM) - C++ | medium | 3 |
| 331 | 84 | cpp | Bài tập 2 (MEDIUM) - C++ | medium | 3 |
| 332 | 84 | cpp | Bài tập 3 (MEDIUM) - C++ | medium | 3 |
| 333 | 84 | cpp | Bài tập 4 (MEDIUM) - C++ | medium | 3 |
| 334 | 85 | cpp | Bài tập 1 (MEDIUM) - C++ | medium | 3 |
| 335 | 85 | cpp | Bài tập 2 (MEDIUM) - C++ | medium | 3 |
| 336 | 85 | cpp | Bài tập 3 (MEDIUM) - C++ | medium | 3 |
| 337 | 85 | cpp | Bài tập 4 (MEDIUM) - C++ | medium | 3 |
| 338 | 86 | cpp | Bài tập 1 (MEDIUM) - C++ | medium | 3 |
| 339 | 86 | cpp | Bài tập 2 (MEDIUM) - C++ | medium | 3 |
| 340 | 86 | cpp | Bài tập 3 (MEDIUM) - C++ | medium | 3 |
| 341 | 86 | cpp | Bài tập 4 (MEDIUM) - C++ | medium | 3 |
| 342 | 87 | cpp | Bài tập 1 (MEDIUM) - C++ | medium | 3 |
| 343 | 87 | cpp | Bài tập 2 (MEDIUM) - C++ | medium | 3 |
| 344 | 87 | cpp | Bài tập 3 (MEDIUM) - C++ | medium | 3 |
| 345 | 87 | cpp | Bài tập 4 (MEDIUM) - C++ | medium | 3 |
| 346 | 88 | cpp | Bài tập 1 (MEDIUM) - C++ | medium | 3 |
| 347 | 88 | cpp | Bài tập 2 (MEDIUM) - C++ | medium | 3 |
| 348 | 88 | cpp | Bài tập 3 (MEDIUM) - C++ | medium | 3 |
| 349 | 88 | cpp | Bài tập 4 (MEDIUM) - C++ | medium | 3 |
| 350 | 89 | cpp | Bài tập 1 (MEDIUM) - C++ | medium | 3 |
| 351 | 89 | cpp | Bài tập 2 (MEDIUM) - C++ | medium | 3 |
| 352 | 89 | cpp | Bài tập 3 (MEDIUM) - C++ | medium | 3 |
| 353 | 89 | cpp | Bài tập 4 (MEDIUM) - C++ | medium | 3 |
| 354 | 90 | java | Bài tập 1 (MEDIUM) - Java | medium | 3 |
| 355 | 90 | java | Bài tập 2 (MEDIUM) - Java | medium | 3 |
| 356 | 90 | java | Bài tập 3 (MEDIUM) - Java | medium | 3 |
| 357 | 90 | java | Bài tập 4 (MEDIUM) - Java | medium | 3 |
| 358 | 91 | java | Bài tập 1 (MEDIUM) - Java | medium | 3 |
| 359 | 91 | java | Bài tập 2 (MEDIUM) - Java | medium | 3 |
| 360 | 91 | java | Bài tập 3 (MEDIUM) - Java | medium | 3 |
| 361 | 91 | java | Bài tập 4 (MEDIUM) - Java | medium | 3 |
| 362 | 92 | java | Bài tập 1 (HARD) - Java | hard | 3 |
| 363 | 92 | java | Bài tập 2 (HARD) - Java | hard | 3 |
| 364 | 92 | java | Bài tập 3 (HARD) - Java | hard | 3 |
| 365 | 92 | java | Bài tập 4 (HARD) - Java | hard | 3 |
| 366 | 93 | java | Bài tập 1 (HARD) - Java | hard | 3 |
| 367 | 93 | java | Bài tập 2 (HARD) - Java | hard | 3 |
| 368 | 93 | java | Bài tập 3 (HARD) - Java | hard | 3 |
| 369 | 93 | java | Bài tập 4 (HARD) - Java | hard | 3 |
| 370 | 94 | java | Bài tập 1 (HARD) - Java | hard | 3 |
| 371 | 94 | java | Bài tập 2 (HARD) - Java | hard | 3 |
| 372 | 94 | java | Bài tập 3 (HARD) - Java | hard | 3 |
| 373 | 94 | java | Bài tập 4 (HARD) - Java | hard | 3 |
| 374 | 95 | java | Bài tập 1 (HARD) - Java | hard | 3 |
| 375 | 95 | java | Bài tập 2 (HARD) - Java | hard | 3 |
| 376 | 95 | java | Bài tập 3 (HARD) - Java | hard | 3 |
| 377 | 95 | java | Bài tập 4 (HARD) - Java | hard | 3 |
| 378 | 96 | java | Bài tập 1 (HARD) - Java | hard | 3 |
| 379 | 96 | java | Bài tập 2 (HARD) - Java | hard | 3 |
| 380 | 96 | java | Bài tập 3 (HARD) - Java | hard | 3 |
| 381 | 96 | java | Bài tập 4 (HARD) - Java | hard | 3 |
| 382 | 97 | java | Bài tập 1 (HARD) - Java | hard | 3 |
| 383 | 97 | java | Bài tập 2 (HARD) - Java | hard | 3 |
| 384 | 97 | java | Bài tập 3 (HARD) - Java | hard | 3 |
| 385 | 97 | java | Bài tập 4 (HARD) - Java | hard | 3 |
| 386 | 98 | java | Bài tập 1 (HARD) - Java | hard | 3 |
| 387 | 98 | java | Bài tập 2 (HARD) - Java | hard | 3 |
| 388 | 98 | java | Bài tập 3 (HARD) - Java | hard | 3 |
| 389 | 98 | java | Bài tập 4 (HARD) - Java | hard | 3 |
| 390 | 99 | java | Bài tập 1 (HARD) - Java | hard | 3 |
| 391 | 99 | java | Bài tập 2 (HARD) - Java | hard | 3 |
| 392 | 99 | java | Bài tập 3 (HARD) - Java | hard | 3 |
| 393 | 99 | java | Bài tập 4 (HARD) - Java | hard | 3 |
| 394 | 100 | java | Bài tập 1 (HARD) - Java | hard | 3 |
| 395 | 100 | java | Bài tập 2 (HARD) - Java | hard | 3 |
| 396 | 100 | java | Bài tập 3 (HARD) - Java | hard | 3 |
| 397 | 100 | java | Bài tập 4 (HARD) - Java | hard | 3 |
| 398 | 101 | java | Bài tập 1 (HARD) - Java | hard | 3 |
| 399 | 101 | java | Bài tập 2 (HARD) - Java | hard | 3 |
| 400 | 101 | java | Bài tập 3 (HARD) - Java | hard | 3 |
| 401 | 101 | java | Bài tập 4 (HARD) - Java | hard | 3 |

## Validation Notes

- Seed script location: apps/be/scripts/seed.ts
- Seeding command used: DATABASE_URL=postgres://postgres:password@localhost:5432/ppat pnpm db:seed
- Tests executed after seed: pnpm test (apps/be)
- Test result: 3 passed, 0 failed (code-runner.test.ts)