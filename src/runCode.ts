/**
 * Execute C code via Piston API and return stdout.
 */

const PISTON_URL = 'https://emkc.org/api/v2/piston/execute'

export interface RunResult {
  success: boolean
  stdout: string
  stderr: string
  error?: string
}

export async function runCCode(code: string, stdin: string = ''): Promise<RunResult> {
  try {
    const res = await fetch(PISTON_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'c',
        version: '*',
        files: [{ name: 'main.c', content: code }],
        stdin,
      }),
    })

    if (!res.ok) {
      return {
        success: false,
        stdout: '',
        stderr: '',
        error: `API error: ${res.status}`,
      }
    }

    const data = (await res.json()) as {
      run?: { stdout?: string; stderr?: string; code?: number; signal?: string }
      message?: string
    }

    if (data.message) {
      return {
        success: false,
        stdout: '',
        stderr: data.message,
        error: data.message,
      }
    }

    const run = data.run
    const stdout = run?.stdout ?? ''
    const stderr = run?.stderr ?? ''
    const exitCode = run?.code ?? -1

    return {
      success: exitCode === 0,
      stdout,
      stderr: stderr || (exitCode !== 0 ? `Exit code: ${exitCode}` : ''),
    }
  } catch (err) {
    return {
      success: false,
      stdout: '',
      stderr: '',
      error: err instanceof Error ? err.message : 'Failed to run code',
    }
  }
}

/** Normalize output for comparison: trim, collapse whitespace */
export function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((l) => l.trim())
    .join('\n')
    .trim()
}

export function outputsMatch(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected)
}
