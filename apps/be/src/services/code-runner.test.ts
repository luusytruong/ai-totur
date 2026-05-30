import { describe, expect, it } from 'vitest';
import { CodeRunnerService } from './code-runner.service.js';

describe('CodeRunnerService (Dockerized)', () => {
  const runner = new CodeRunnerService();

  it('should run JavaScript code in a container', async () => {
    // This test requires Docker to be running on the host
    try {
      const result = await runner.runCode('console.log("hello world");', 'javascript', []);
      expect(result.status).toBe('pass');
      expect(result.stdout).toContain('hello world');
    } catch (error: unknown) {
      const e = error as Error;
      if (e.message.includes('socketPath')) {
        console.warn('Docker socket not found, skipping container test');
      } else {
        throw e;
      }
    }
  }, 30000); // 30s timeout for first pull

  it('should run Python code in a container', async () => {
    try {
      const result = await runner.runCode('print("hello python")', 'python', []);
      expect(result.status).toBe('pass');
      expect(result.stdout).toContain('hello python');
    } catch (error: unknown) {
      const e = error as Error;
      if (e.message.includes('socketPath')) {
        console.warn('Docker socket not found, skipping container test');
      } else {
        throw e;
      }
    }
  }, 30000);

  it('should handle timeout correctly', async () => {
    try {
      // Infinite loop
      const result = await runner.runCode('while(true);', 'javascript', []);
      expect(result.status).toBe('error');
      expect(result.errorMsg).toContain('Timeout');
    } catch (error: unknown) {
      const e = error as Error;
      if (e.message.includes('socketPath')) {
        console.warn('Docker socket not found, skipping container test');
      } else {
        throw e;
      }
    }
  }, 30000);
});
