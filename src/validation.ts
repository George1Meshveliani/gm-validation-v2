/**
 * Validates C code: first compares output to expected, then code similarity.
 * Output mismatch → 0%. Output match → code similarity score.
 */

import {
  findMatchingProblem,
  getStoredProblems,
  seedProblemsIfNeeded,
  type ProblemEntry,
} from './problems'
import { runCCode, outputsMatch, normalizeOutput } from './runCode'

export interface ValidationResult {
  score: number
  mistakes: string[]
  summary: string
  matchedProblem: string | null
  /** User's program output (after Run) */
  userOutput?: string
  /** Expected output from reference */
  expectedOutput?: string
  /** Whether output matched (when output-based validation applies) */
  outputMatched?: boolean
}

/** Normalize C code for comparison: remove comments, collapse whitespace */
function normalizeCode(code: string): string {
  let s = code
  s = s.replace(/\/\/[^\n]*/g, '')
  s = s.replace(/\/\*[\s\S]*?\*\//g, '')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function getTokens(code: string): string[] {
  const normalized = normalizeCode(code)
  const tokens: string[] = []
  const regex = /[a-zA-Z_][a-zA-Z0-9_]*|\d+|[+\-*\/%=<>!&|]+|\(|\)|\{|}|\[|]|;|,/g
  let m
  while ((m = regex.exec(normalized)) !== null) {
    tokens.push(m[0])
  }
  return tokens
}

function tokenSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1
  if (a.length === 0 || b.length === 0) return 0
  const setA = new Set(a.map((t) => t.toLowerCase()))
  const setB = new Set(b.map((t) => t.toLowerCase()))
  let match = 0
  for (const t of setA) {
    if (setB.has(t)) match++
  }
  const union = new Set([...setA, ...setB])
  return match / union.size
}

function checkStructure(
  userCode: string,
  refCode: string
): { mistakes: string[]; penalties: number } {
  const mistakes: string[] = []
  let penalties = 0

  if (!/\bmain\s*\(/.test(userCode)) {
    mistakes.push('Missing main() function')
    penalties += 25
  }

  const usesIO = /\b(printf|scanf|fgets)\s*\(/.test(refCode)
  const hasInclude = /#\s*include\s*[<"]stdio\.h[>"]/.test(userCode)
  if (usesIO && !hasInclude) {
    mistakes.push('Missing #include <stdio.h>')
    penalties += 15
  }

  const openB = (userCode.match(/\{/g) || []).length
  const closeB = (userCode.match(/\}/g) || []).length
  if (openB !== closeB) {
    mistakes.push('Unbalanced braces')
    penalties += 20
  }

  if (/\bswitch\s*\(/.test(refCode) && !/\bswitch\s*\(/.test(userCode)) {
    mistakes.push('Problem requires switch statement')
    penalties += 15
  }

  if (/%\s*2/.test(refCode) && !/%/.test(userCode)) {
    mistakes.push('Use modulo operator (%) for even/odd check')
    penalties += 10
  }

  if (/\bfgets\s*\(/.test(refCode) && /\bgets\s*\(/.test(userCode)) {
    mistakes.push('Use fgets() instead of gets()')
    penalties += 10
  }

  return { mistakes, penalties }
}

function compareToReference(userCode: string, refCode: string): ValidationResult {
  const userNorm = normalizeCode(userCode)

  if (!userNorm) {
    return {
      score: 0,
      mistakes: ['No code provided'],
      summary: 'Please write your C solution.',
      matchedProblem: null,
    }
  }

  const userTokens = getTokens(userCode)
  const refTokens = getTokens(refCode)
  const tokenSim = tokenSimilarity(userTokens, refTokens)
  const structureCheck = checkStructure(userCode, refCode)

  let score = Math.round(tokenSim * 60)
  score += Math.max(0, 40 - structureCheck.penalties)
  score = Math.min(100, score)

  const allMistakes = structureCheck.mistakes

  if (tokenSim < 0.3 && allMistakes.length === 0) {
    allMistakes.push('Solution structure differs significantly from expected approach')
  }

  if (score >= 90 && allMistakes.length === 0) {
    allMistakes.push('No major issues - good match!')
  }

  const summary =
    score >= 80
      ? 'Your solution closely matches the reference.'
      : score >= 50
        ? 'Your solution has some differences from the expected approach.'
        : 'Significant differences from the reference solution. Review the issues.'

  return {
    score,
    mistakes: allMistakes.length ? allMistakes : ['Review your implementation for minor improvements'],
    summary,
    matchedProblem: null,
  }
}

/**
 * Validation order:
 * 1. Compare answers (output) - if wrong → 0%, stop
 * 2. Only if answer is correct → compute score from logic & code similarity
 */
export async function validateCCode(
  problem: string,
  code: string
): Promise<ValidationResult> {
  seedProblemsIfNeeded()
  const problems = getStoredProblems()
  const matched = findMatchingProblem(problem, problems)

  if (!matched) {
    return {
      score: 0,
      mistakes: [
        'No matching problem found in the database.',
        'Paste the exact problem text from the list.',
      ],
      summary: 'Could not find this problem. Use the exact problem description.',
      matchedProblem: null,
    }
  }

  const entry = matched as ProblemEntry & { stdin?: string; expectedOutput?: string }
  const hasOutputCheck = entry.expectedOutput != null && entry.expectedOutput !== ''

  if (hasOutputCheck) {
    // Step 1: Run code and compare answer
    const runResult = await runCCode(code, entry.stdin ?? '')

    if (!runResult.success && runResult.stderr) {
      return {
        score: 0,
        mistakes: [
          'Code failed to compile or run.',
          runResult.stderr.split('\n').slice(0, 3).join('\n'),
        ],
        summary: 'Fix compilation/runtime errors first.',
        matchedProblem: entry.problem,
        userOutput: runResult.stdout || undefined,
        expectedOutput: entry.expectedOutput,
        outputMatched: false,
      }
    }

    const matchedOutput = outputsMatch(runResult.stdout, entry.expectedOutput!)

    if (!matchedOutput) {
      // Wrong answer → 0%, no code similarity check
      return {
        score: 0,
        mistakes: [
          'Wrong answer. Output does not match the expected result.',
          `Your output: "${normalizeOutput(runResult.stdout).slice(0, 200)}${runResult.stdout.length > 200 ? '...' : ''}"`,
          `Expected: "${normalizeOutput(entry.expectedOutput!).slice(0, 200)}${entry.expectedOutput!.length > 200 ? '...' : ''}"`,
        ],
        summary: 'Answer is incorrect. Fix your output first, then validate again.',
        matchedProblem: entry.problem,
        userOutput: runResult.stdout,
        expectedOutput: entry.expectedOutput,
        outputMatched: false,
      }
    }

    // Step 2: Answer correct → score from logic and code similarity
    const result = compareToReference(code, entry.solution)
    result.matchedProblem = entry.problem
    result.userOutput = runResult.stdout
    result.expectedOutput = entry.expectedOutput
    result.outputMatched = true
    result.summary =
      result.score >= 80
        ? 'Answer correct. Code structure and logic closely match the reference.'
        : result.score >= 50
          ? 'Answer correct. Code has some differences from the reference approach.'
          : 'Answer correct. Consider improving code structure and logic.'
    return result
  }

  const result = compareToReference(code, entry.solution)
  result.matchedProblem = entry.problem
  return result
}
