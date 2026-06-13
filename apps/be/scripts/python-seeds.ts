export const PYTHON_LESSON_1 = {
  topic: 'Biến và kiểu dữ liệu',
  title: 'Bài 1: Khởi đầu với Python - Biến và Kiểu dữ liệu',
  difficulty: 'easy' as const,
  contentMd: `
# Bài 1: Khởi đầu với Python - Biến và Kiểu dữ liệu

Chào mừng bạn đến với khóa học Python! Trong bài đầu tiên, chúng ta sẽ làm quen với những viên gạch cơ bản nhất để xây dựng một chương trình: **Biến** và **Kiểu dữ liệu**.

## 1. Biến (Variables) là gì?
Biến giống như một chiếc hộp dùng để lưu trữ dữ liệu. Mỗi chiếc hộp có một cái tên để bạn dễ dàng tìm lại giá trị bên trong.
Để tạo một biến trong Python, bạn chỉ cần đặt tên biến và gán giá trị cho nó bằng dấu bằng (\`=\`).

\`\`\`python
# Tạo biến và gán giá trị
name = "Hải Đăng"
age = 22
is_student = True

print(name) # Output: Hải Đăng
\`\`\`

> **Lưu ý:** Tên biến trong Python nên viết chữ thường, và dùng dấu gạch dưới \`_\` nếu có nhiều chữ (chuẩn snake_case). Ví dụ: \`first_name\`, \`my_age\`. Không được bắt đầu bằng số.

## 2. Các Kiểu Dữ Liệu Cơ Bản
Python sẽ tự động nhận diện kiểu dữ liệu của biến dựa trên giá trị mà bạn gán. Dưới đây là 4 kiểu cơ bản nhất:

- **int (số nguyên):** \`1, -5, 100\`
- **float (số thực/thập phân):** \`3.14, -0.5\`
- **str (chuỗi ký tự):** \`"Hello" hoặc 'Python'\`
- **bool (boolean/logic):** \`True hoặc False\`

Bạn có thể dùng hàm \`type()\` để kiểm tra kiểu dữ liệu:
\`\`\`python
x = 10
print(type(x)) # <class 'int'>
\`\`\`

## 3. Các Phép Toán Cơ Bản
- Cộng (\`+\`), Trừ (\`-\`), Nhân (\`*\`), Chia (\`/\`)
- Phép chia lấy phần nguyên (\`//\`), Phép chia lấy dư (\`%\`)
- Lũy thừa (\`**\`)

\`\`\`python
a = 10
b = 3
print(a + b) # 13
print(a / b) # 3.3333...
print(a // b) # 3
print(a % b) # 1
\`\`\`

## 4. Format Output với F-Strings
Để in các giá trị biến ra dạng câu có ý nghĩa dễ dàng nhất, Python hỗ trợ f-string. Bạn chỉ cần đặt chữ \`f\` trước dấu ngoặc hình chuỗi, và cho biến vào trong cặp ngoặc nhọn \`{}\`.

\`\`\`python
score = 9.5
print(f"Học viên {name} đã đạt {score} điểm.")
# Output: Học viên Hải Đăng đã đạt 9.5 điểm.
\`\`\`

## Lưu ý triển khai bài tập
Ở các bài tập thực hành, chúng tôi cung cấp sẵn phần khung hàm. Bạn chỉ cần code các phần xử lý bên trong để làm quen với syntax Python. Đừng quên dùng hàm \`return\` để trả về kết quả thay vì chỉ \`print()\` thôi nhé!
`.trim(),
};

export const PYTHON_LESSON_2 = {
  topic: 'Điều kiện rẽ nhánh',
  title: 'Bài 2: Làm chủ luồng chạy - Rẽ nhánh (If-Else)',
  difficulty: 'medium' as const,
  contentMd: `
# Bài 2: Làm chủ luồng chạy - Điều kiện rẽ nhánh (If-Else)

Một chương trình linh hoạt là chương trình có thể đưa ra quyết định khác nhau tùy thuộc vào dữ liệu mà nó nhận được. Cú pháp \`if - elif - else\` chính là công cụ để điều khiển luồng chạy của ứng dụng.

## 1. Toán Tử So Sánh và Logic
Trước khi rẽ nhánh, ta cần tính toán điều kiện. Điều kiện luôn trả về kiểu bool (\`True\` hoặc \`False\`).
- **So sánh:** Bằng (\`==\`), Khác (\`!=\`), Lớn hơn (\`>\`), Nhỏ hơn (\`<\`), Lớn hơn hoặc bằng (\`>=\`), Nhỏ hơn hoặc bằng (\`<=\`).
- **Logic:** \`and\` (và), \`or\` (hoặc), \`not\` (phủ định).

\`\`\`python
a = 5
print(a > 3 and a < 10) # True
print(a == 5 or a == 0) # True
print(not (a == 5))     # False
\`\`\`

## 2. Cú Pháp If, Elif, Else
Từ khóa \`if\` dùng để kiểm tra một điều kiện cốt lõi. \`elif\` (viết tắt của else if) xử lý các nhánh thay thế phụ và \`else\` bắt tất cả mọi trường hợp còn lại.

Lưu ý: Python dùng **thụt lề (indentation)** để đánh dấu một khối lệnh (thường là 4 spaces), thay vì cặp ngoặc nhọn \`{...}\` như C++ hay JavaScript.

\`\`\`python
score = 7.5

if score >= 8.5:
    print("Học lực: Giỏi")
elif score >= 6.5:
    print("Học lực: Khá")
elif score >= 5.0:
    print("Học lực: Trung bình")
else:
    print("Học lực: Yếu")
\`\`\`

## Khái niệm Truthy và Falsy
Trong Python, ngoài \`True/False\`, các giá trị trống hoặc bằng không bị xem là "Falsy".
- Các giá trị Falsy: số \`0\`, chuỗi rỗng \`""\`, mảng rỗng \`[]\`, \`None\`.
- Còn lại mọi thứ đều là Truthy.

Bạn có thể viết \`if\` rất ngắn gọn như sau:
\`\`\`python
name = ""
if not name:
    print("Bạn chưa nhập tên!")
\`\`\`

Chuyển qua bài tập thực hành, chúng ta sẽ bắt đầu xử lý các logic tính toán cần rẽ nhánh thật tỉ mỉ nhé!
`.trim(),
};

export const PYTHON_1_EXERCISES = [
  {
    title: 'Hello Variables',
    description:
      'Viết một hàm Python kết hợp chuỗi bằng F-string. Input là biến \`name\`, hãy trả về chuỗi: "Hello, [name]!".',
    starterCode: 'def solve(name):\n    # TODO: Sử dụng f-string\n    return ""\n',
    expectedOutput: 'Trả về chuỗi "Hello, Alice!" nếu biến name có giá trị là "Alice"',
    testCases: [
      { input: '"Python"', expected: '"Hello, Python!"' },
      { input: '"Alice"', expected: '"Hello, Alice!"' },
      { input: '""', expected: '"Hello, !"' },
    ],
    hint: 'Sử dụng cấu trúc f"Hello, {name}!" để nhúng giá trị biến name vào chuỗi.',
  },
  {
    title: 'Tính điểm trung bình',
    description:
      'Viết hàm nhận vào 2 số thực \`a\` và \`b\` đại diện cho điểm 2 môn học. Cần tính tổng và chia trung bình, trả về kết quả kiểu float.',
    starterCode: 'def solve(a, b):\n    # TODO: Tính và trả về điểm trung bình\n    return 0.0\n',
    expectedOutput: 'Giá trị float đại diện cho số trung bình cộng của a và b',
    testCases: [
      { input: '(5.0, 7.0)', expected: '6.0' },
      { input: '(8.5, 9.5)', expected: '9.0' },
      { input: '(0.0, 10.0)', expected: '5.0' },
    ],
    hint: 'Sử dụng phép cộng và chia lấy thực (/), đóng ngoặc cái tử số lại: (a+b)/2',
  },
  {
    title: 'Đổi độ C sang độ F',
    description:
      'Viết hàm nhận vào nhiệt độ \`celsius\` (độ C). Hàm cần trả về độ F theo công thức: F = C * 1.8 + 32',
    starterCode:
      'def solve(celsius):\n    # TODO: Trả về kết quả nhiệt độ Fahrenheit\n    return 0.0\n',
    expectedOutput: 'Số đại diện cho giá trị độ F sau công thức.',
    testCases: [
      { input: '0', expected: '32.0' },
      { input: '100', expected: '212.0' },
      { input: '-40', expected: '-40.0' },
    ],
    hint: 'Bạn có thể viết gộp luôn return celsius * 1.8 + 32.',
  },
  {
    title: 'Tính chỉ số khối cơ thể (BMI)',
    description:
      'Viết hàm nhận 2 đầu vào: chiều cao \`h\` (đơn vị: mét) và cân nặng \`w\` (đơn vị: kg). Tính và trả về chỉ số BMI theo công thức: BMI = w / (h^2).',
    starterCode: 'def solve(h, w):\n    # TODO: Trả về BMI\n    return 0.0\n',
    expectedOutput: 'Kết quả BMI (dạng float).',
    testCases: [
      { input: '(1.70, 65)', expected: '22.49134948096886' },
      { input: '(1.80, 80)', expected: '24.691358024691358' },
      { input: '(1.65, 50)', expected: '18.36547291092746' },
    ],
    hint: 'Sử dụng toán tử lũy thừa ** để tính số mũ (h ** 2). Hàm sẽ bị lỗi nếu chiều cao h = 0 nhưng tạm thời Test cases đã cho chiều cao hợp lệ.',
  },
];

export const PYTHON_2_EXERCISES = [
  {
    title: 'Kiểm tra Chẵn Lẻ',
    description:
      'Nhận vào một số nguyên n. Trả về chữ "Chẵn" nếu n chia hết cho 2, ngược lại trả về "Lẻ".',
    starterCode: 'def solve(n):\n    # TODO\n    return "Chẵn"\n',
    expectedOutput: 'Chuỗi văn bản "Chẵn" hoặc "Lẻ".',
    testCases: [
      { input: '4', expected: '"Chẵn"' },
      { input: '11', expected: '"Lẻ"' },
      { input: '0', expected: '"Chẵn"' },
      { input: '-5', expected: '"Lẻ"' },
    ],
    hint: 'Sử dụng phép chia lấy dư n % 2 == 0.',
  },
  {
    title: 'Ký hiệu số',
    description:
      'Nhận vào một số nguyên n. Trả về "Dương" nếu n > 0, trả về "Âm" nếu n < 0, trả về "Không" nếu n = 0.',
    starterCode: 'def solve(n):\n    # TODO\n    return ""\n',
    expectedOutput: 'Chuỗi "Dương", "Âm", hoặc "Không".',
    testCases: [
      { input: '15', expected: '"Dương"' },
      { input: '-99', expected: '"Âm"' },
      { input: '0', expected: '"Không"' },
    ],
    hint: 'Dùng cấu trúc rẽ nhánh if ... elif ... else để xử lý.',
  },
  {
    title: 'Xếp loại học lực',
    description:
      'Nhận vào một điểm số n (float) từ 0 đến 10. Trả về xếp loại: "Giỏi" (n >= 8.5), "Khá" (n >= 6.5), "Trung bình" (n >= 5.0), còn lại là "Yếu". Bạn phải xếp logic if-elif hợp lý để không bị chồng chéo.',
    starterCode: 'def solve(n):\n    # TODO\n    return ""\n',
    expectedOutput: 'Chuỗi chứa hạng điểm.',
    testCases: [
      { input: '9.0', expected: '"Giỏi"' },
      { input: '7.5', expected: '"Khá"' },
      { input: '5.0', expected: '"Trung bình"' },
      { input: '3.2', expected: '"Yếu"' },
    ],
    hint: 'Do luồng chạy đọc từ trên xuống dưới, nên hãy viết elif bắt chặn dần từ mốc điểm cao nhất xuống.',
  },
  {
    title: 'Năm Nhuận',
    description:
      'Nhận vào một năm `y` (số nguyên dương). Năm nhuận là năm chia hết cho 400 HOẶC (chia hết cho 4 nhưng KHÔNG chia hết cho 100). Trả về True nếu là năm nhuận, False nếu không phải.',
    starterCode: 'def solve(y):\n    # TODO\n    return False\n',
    expectedOutput: 'Giá trị boolean True hoặc False',
    testCases: [
      { input: '2024', expected: 'True' },
      { input: '2023', expected: 'False' },
      { input: '2000', expected: 'True' },
      { input: '1900', expected: 'False' },
    ],
    hint: 'Sử dụng toán tử logcic `and`, `or` và `not` kết hợp các biểu thức phép modulo (chia dư).',
  },
];
