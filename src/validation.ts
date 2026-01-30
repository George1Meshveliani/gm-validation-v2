/**
 * Client-side code validation for C programs.
 * Performs basic heuristic analysis. Replace with API call for real compilation/testing.
 */

export interface ValidationResult {
  score: number;
  mistakes: string[];
  summary: string;
}

export function validateCCode(code: string): ValidationResult {
  const mistakes: string[] = [];
  let score = 100;

  const lines = code.split('\n').filter((l) => l.trim());
  const trimmedCode = code.trim();

  if (!trimmedCode) {
    return {
      score: 0,
      mistakes: ['No code provided'],
      summary: 'Please write your C solution in the code editor above.',
    };
  }

  // Check for main function
  if (!/\bmain\s*\(/.test(code)) {
    mistakes.push('Missing main() function - C programs must have an entry point');
    score -= 25;
  }

  // Check for stdio.h if using printf/scanf
  const usesPrintf = /\bprintf\s*\(/.test(code);
  const usesScanf = /\bscanf\s*\(/.test(code);
  if ((usesPrintf || usesScanf) && !/#\s*include\s*[<"]stdio\.h[>"]/.test(code)) {
    mistakes.push('Missing #include <stdio.h> when using printf/scanf');
    score -= 15;
  }

  // Check for return in main (best practice)
  const hasMain = /\bmain\s*\([^)]*\)\s*\{/.test(code);
  if (hasMain && !/return\s+0\s*;/.test(code) && !/return\s+[^0]/.test(code)) {
    mistakes.push('Consider adding "return 0;" at the end of main()');
    score -= 5;
  }

  // Check for unbalanced braces
  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    mistakes.push(`Unbalanced braces: ${openBraces} opening vs ${closeBraces} closing`);
    score -= 20;
  }

  // Check for common buffer overflow risks
  if (/gets\s*\(/.test(code)) {
    mistakes.push('Avoid gets() - use fgets() instead (gets is unsafe)');
    score -= 15;
  }

  // Check for uninitialized variable patterns (simple heuristic)
  if (/\bint\s+\w+\s*;/.test(code) && lines.length < 5) {
    // Very short program might be incomplete
    if (lines.length <= 3) {
      mistakes.push('Code appears incomplete - ensure all logic is implemented');
      score -= 10;
    }
  }

  // Ensure score stays in range
  score = Math.max(0, Math.min(100, score));

  const summary =
    score >= 80
      ? 'Good job! Your code has a solid structure.'
      : score >= 50
        ? 'Your code has some issues. Review the mistakes below.'
        : 'Several improvements needed. Focus on the main mistakes.';

  return {
    score,
    mistakes: mistakes.length ? mistakes : ['No major mistakes detected'],
    summary,
  };
}
