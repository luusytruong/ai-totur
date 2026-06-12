import Docker from 'dockerode';
import * as tarStream from 'tar-stream';

export type TestCase = {
  input: string;
  expected: string;
};

export type RunResult = {
  status: 'pass' | 'fail' | 'error';
  runtimeMs: number;
  errorMsg: string | null;
  failedCaseIndex: number | null;
  stdout?: string;
  stderr?: string;
};

// ─── Language Config ──────────────────────────────────────────────────────────

type LangConfig = {
  image: string;
  fileName: string;
  cmd: string[];
};

const LANG_CONFIG: Record<string, LangConfig> = {
  javascript: { image: 'node:20-alpine', fileName: 'main.js', cmd: ['node', '/app/main.js'] },
  nodejs: { image: 'node:20-alpine', fileName: 'main.js', cmd: ['node', '/app/main.js'] },
  python: { image: 'python:3.11-alpine', fileName: 'main.py', cmd: ['python', '/app/main.py'] },
  cpp: { image: 'gcc:13', fileName: 'run.sh', cmd: ['sh', '/app/run.sh'] },
  'c++': { image: 'gcc:13', fileName: 'run.sh', cmd: ['sh', '/app/run.sh'] },
  java: { image: 'eclipse-temurin:21-jdk-jammy', fileName: 'run.sh', cmd: ['sh', '/app/run.sh'] },
};

// ─── Wrapper Builders ─────────────────────────────────────────────────────────

function buildShTestCases(testCases: TestCase[], runCmd: string): string {
  return testCases
    .map(
      (tc, i) => `
OUTPUT=$(echo ${JSON.stringify(tc.input)} | ${runCmd} | xargs)
EXPECTED=$(echo ${JSON.stringify(tc.expected)} | xargs)
if [ "$OUTPUT" != "$EXPECTED" ]; then
  echo "__FAILED_CASE__:${i}" >&2
  echo "Sai test case ${i + 1}: expected=$EXPECTED, got=$OUTPUT" >&2
  exit 1
fi`,
    )
    .join('\n');
}

function buildJsWrapper(code: string, testCases: TestCase[]): string {
  return `
const testCases = ${JSON.stringify(testCases)};
${code}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(stableStringify).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + stableStringify(value[k])).join(',') + '}';
}

(async () => {
  if (!Array.isArray(testCases) || testCases.length === 0) {
    process.exit(0);
  }

  if (typeof solve !== 'function') {
    console.error('Không tìm thấy hàm solve() trong bài làm');
    process.exit(1);
  }

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      const parsedInput = JSON.parse(tc.input);
      const expectedResult = JSON.parse(tc.expected);
      const args = Array.isArray(parsedInput) ? parsedInput : [parsedInput];
      const actualResult = await Promise.resolve(solve(...args));

      if (stableStringify(actualResult) !== stableStringify(expectedResult)) {
        console.error('__FAILED_CASE__:' + i);
        console.error('Sai test case ' + (i + 1) + ': expected=' + JSON.stringify(expectedResult) + ', got=' + JSON.stringify(actualResult));
        process.exit(1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('__FAILED_CASE__:' + i);
      console.error('Lỗi test case ' + (i + 1) + ': ' + message);
      process.exit(1);
    }
  }

  console.log('Passed all test cases');
  process.exit(0);
})().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
`;
}

function buildPyWrapper(code: string, testCases: TestCase[]): string {
  return `
import sys, json

testCases = ${JSON.stringify(testCases)}

${code}

if not isinstance(testCases, list) or len(testCases) == 0:
  sys.exit(0)

if 'solve' not in globals():
    sys.stderr.write("Không tìm thấy hàm solve() trong bài làm\\n")
    sys.exit(1)

for i, tc in enumerate(testCases):
    try:
        parsed_input = json.loads(tc['input'])
        expected_result = json.loads(tc['expected'])
        args = parsed_input if isinstance(parsed_input, list) else [parsed_input]
        actual_result = solve(*args)

        if json.dumps(actual_result, sort_keys=True) != json.dumps(expected_result, sort_keys=True):
            sys.stderr.write(f"__FAILED_CASE__:{i}\\n")
            sys.stderr.write(f"Sai test case {i + 1}: expected={json.dumps(expected_result)}, got={json.dumps(actual_result)}\\n")
            sys.exit(1)
    except Exception as e:
        sys.stderr.write(f"__FAILED_CASE__:{i}\\n")
        sys.stderr.write(f"Lỗi test case {i + 1}: {str(e)}\\n")
        sys.exit(1)

print("Passed all test cases")
sys.exit(0)
`;
}

function buildCppWrapper(code: string, testCases: TestCase[]): string {
  return `#!/bin/sh
cat << 'EOF_CODE' > /app/main.cpp
${code.replace(/\$/g, '\\$')}
EOF_CODE
g++ /app/main.cpp -o /app/main || exit 1
${buildShTestCases(testCases, '/app/main')}
echo "Passed all test cases"
exit 0
`;
}

function buildJavaWrapper(code: string, testCases: TestCase[]): string {
  return `#!/bin/sh
cat << 'EOF_CODE' > /app/Main.java
${code.replace(/\$/g, '\\$')}
EOF_CODE
javac /app/Main.java || exit 1
${buildShTestCases(testCases, 'java -cp /app Main')}
echo "Passed all test cases"
exit 0
`;
}

type WrapperBuilder = (code: string, testCases: TestCase[]) => string;

const WRAPPER_BUILDERS: Record<string, WrapperBuilder> = {
  javascript: buildJsWrapper,
  nodejs: buildJsWrapper,
  python: buildPyWrapper,
  cpp: buildCppWrapper,
  'c++': buildCppWrapper,
  java: buildJavaWrapper,
};

// ─── Service ──────────────────────────────────────────────────────────────────

export class CodeRunnerService {
  private docker: Docker;

  constructor() {
    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  private async ensureImage(image: string): Promise<void> {
    try {
      await this.docker.getImage(image).inspect();
    } catch {
      await new Promise<void>((resolve, reject) => {
        this.docker.pull(image, (err: Error | null, stream: NodeJS.ReadableStream) => {
          if (err) return reject(err);
          this.docker.modem.followProgress(stream, (err2: Error | null) => {
            if (err2) return reject(err2);
            resolve();
          });
        });
      });
    }
  }

  async runCode(code: string, language: string, testCases: TestCase[]): Promise<RunResult> {
    const lang = language.toLowerCase();
    const config = LANG_CONFIG[lang];
    const wrapperBuilder = WRAPPER_BUILDERS[lang];

    if (!config || !wrapperBuilder) {
      return {
        status: 'error',
        runtimeMs: 0,
        errorMsg: 'Ngôn ngữ không được hỗ trợ',
        failedCaseIndex: null,
      };
    }

    const { image, fileName, cmd } = config;
    const wrapperCode = wrapperBuilder(code, testCases);

    await this.ensureImage(image);

    let container: Docker.Container | null = null;
    const startMs = Date.now();

    try {
      container = await this.docker.createContainer({
        Image: image,
        Cmd: cmd,
        HostConfig: {
          NetworkMode: 'none',
          Memory: 128 * 1024 * 1024,
          CpuPeriod: 100000,
          CpuQuota: 50000,
        },
        WorkingDir: '/app',
        Tty: true,
      });

      const tar = tarStream.pack();
      tar.entry({ name: fileName }, wrapperCode);
      tar.finalize();

      await container.putArchive(tar, { path: '/app' });
      await container.start();

      const result = (await Promise.race([
        container.wait(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout: Quá thời gian thực thi')), 10000),
        ),
      ])) as { StatusCode: number };

      const runtimeMs = Date.now() - startMs;
      const logs = await container.logs({ stdout: true, stderr: true });
      const output = logs.toString('utf8').trim();
      const failedCaseMatch = output.match(/__FAILED_CASE__:(\d+)/);

      return {
        status: result.StatusCode === 0 ? 'pass' : 'fail',
        runtimeMs,
        errorMsg: result.StatusCode !== 0 ? output : null,
        failedCaseIndex: failedCaseMatch ? Number(failedCaseMatch[1]) : null,
        stdout: output,
      };
    } catch (err: unknown) {
      return {
        status: 'error',
        runtimeMs: Date.now() - startMs,
        errorMsg: err instanceof Error ? err.message : 'Thực thi thất bại',
        failedCaseIndex: null,
      };
    } finally {
      if (container) await container.remove({ force: true }).catch(() => {});
    }
  }
}
