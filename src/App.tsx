import { useState, useCallback, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { validateCCode, type ValidationResult } from './validation'
import { seedProblemsIfNeeded, getStoredProblems, findMatchingProblem } from './problems'
import { runCCode } from './runCode'
import './App.css'

const DEFAULT_PROBLEM = `Print all numbers from 1 to N that are divisible by K (use N = 120, K = 4).`

const DEFAULT_CODE = `#include <stdio.h>

int main() {
    int N = 120, K = 4, i;
    for (i = 1; i <= N; i++) {
        if (i % K == 0)
            printf("%d ", i);
    }
    printf("\\n");
    return 0;
}`

function App() {
  const [problem, setProblem] = useState(DEFAULT_PROBLEM)
  const [code, setCode] = useState(DEFAULT_CODE)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [runOutput, setRunOutput] = useState<{ stdout: string; stderr: string } | null>(null)
  const [expectedOutput, setExpectedOutput] = useState<string | null>(null)
  const [problemList, setProblemList] = useState<{ problem: string; solution: string }[]>([])

  useEffect(() => {
    seedProblemsIfNeeded()
    setProblemList(getStoredProblems())
  }, [])

  const handleRun = useCallback(async () => {
    setIsRunning(true)
    setRunOutput(null)
    setExpectedOutput(null)
    const problems = getStoredProblems()
    const matched = findMatchingProblem(problem, problems)
    const stdin = (matched as { stdin?: string })?.stdin ?? ''
    const result = await runCCode(code, stdin)
    setRunOutput({ stdout: result.stdout, stderr: result.stderr })
    if (matched && 'expectedOutput' in matched && matched.expectedOutput) {
      setExpectedOutput(matched.expectedOutput)
    }
    setIsRunning(false)
  }, [problem, code])

  const handleValidate = useCallback(async () => {
    setIsValidating(true)
    setValidation(null)
    try {
      const result = await validateCCode(problem, code)
      setValidation(result)
    } catch (err) {
      setValidation({
        score: 0,
        mistakes: [err instanceof Error ? err.message : 'Validation failed'],
        summary: 'An error occurred during validation.',
        matchedProblem: null,
      })
    } finally {
      setIsValidating(false)
    }
  }, [problem, code])

  return (
    <div className="app">
      <header className="header">
        <h1>C Code Validator</h1>
        <p>Describe a problem, write your solution, and get feedback</p>
      </header>

      <main className="main">
        <section className="section">
          <div className="section-header">
            <span className="section-number">1</span>
            <h2>Task / Problem</h2>
          </div>
          <p className="section-desc">Enter the coding problem description (C language)</p>
          {problemList.length > 0 && (
            <select
              className="problem-select"
              value=""
              onChange={(e) => {
                const idx = e.target.selectedIndex - 1
                if (idx >= 0) {
                  const p = problemList[idx]
                  setProblem(p.problem)
                  setCode('#include <stdio.h>\n\nint main() {\n    \n    return 0;\n}')
                }
                e.target.value = ''
              }}
            >
              <option value="">— Load problem from bank —</option>
              {problemList.map((p, i) => (
                <option key={i} value={p.problem}>
                  {p.problem.length > 60 ? p.problem.slice(0, 57) + '...' : p.problem}
                </option>
              ))}
            </select>
          )}
          <textarea
            className="problem-input"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="e.g., Write a program that prints Hello World..."
            rows={5}
            spellCheck={false}
          />
        </section>

        <section className="section">
          <div className="section-header">
            <span className="section-number">2</span>
            <h2>Your Solution</h2>
          </div>
          <p className="section-desc">Write your C code below</p>
          <button
            className="run-btn"
            onClick={handleRun}
            disabled={isRunning}
          >
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <div className="editor-wrapper">
            <Editor
              height="400px"
              defaultLanguage="c"
              language="c"
              value={code}
              onChange={(value) => setCode(value ?? '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                scrollBeyondLastLine: false,
                padding: { top: 16 },
                lineNumbers: 'on',
                roundedSelection: true,
                automaticLayout: true,
              }}
            />
          </div>
          {(runOutput || expectedOutput) && (
            <div className="answer-section">
              <h3>Output</h3>
              {runOutput && (
                <div className="output-block">
                  <strong>Your output:</strong>
                  <pre>{runOutput.stdout || '(empty)'}</pre>
                  {runOutput.stderr && (
                    <>
                      <strong>Errors:</strong>
                      <pre className="stderr">{runOutput.stderr}</pre>
                    </>
                  )}
                </div>
              )}
              {expectedOutput != null && (
                <div className="output-block">
                  <strong>Expected output:</strong>
                  <pre>{expectedOutput}</pre>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <span className="section-number">3</span>
            <h2>Validation</h2>
          </div>
          <p className="section-desc">Check how well your code addresses the problem</p>

          <button
            className="validate-btn"
            onClick={handleValidate}
            disabled={isValidating}
          >
            {isValidating ? 'Validating...' : 'Validate Code'}
          </button>

          {validation && (
            <div className="validation-result">
              {validation.matchedProblem && (
                <p className="matched-hint">Matched: {validation.matchedProblem}</p>
              )}

              {(validation.userOutput !== undefined || validation.expectedOutput !== undefined) && (
                <div className="answer-comparison">
                  <h3>Answer comparison</h3>
                  <div className="comparison-row">
                    <div className="output-block">
                      <strong>Your answer:</strong>
                      <pre>{validation.userOutput ?? '(no output)'}</pre>
                    </div>
                    <div className="output-block">
                      <strong>Expected answer:</strong>
                      <pre>{validation.expectedOutput ?? '—'}</pre>
                    </div>
                  </div>
                  <p className={`comparison-status ${validation.outputMatched ? 'match' : 'no-match'}`}>
                    {validation.outputMatched
                      ? '✓ Answers match — score based on code logic and similarity'
                      : '✗ Answers differ — 0% (fix your output first)'}
                  </p>
                </div>
              )}

              <div className="score-card">
                <div
                  className={`score-circle ${
                    validation.score >= 80
                      ? 'score-high'
                      : validation.score >= 50
                        ? 'score-mid'
                        : 'score-low'
                  }`}
                >
                  <span className="score-value">{validation.score}</span>
                  <span className="score-suffix">%</span>
                </div>
                <p className="score-summary">{validation.summary}</p>
              </div>

              <div className="mistakes-card">
                <h3>Main issues</h3>
                <ul>
                  {validation.mistakes.map((mistake, i) => (
                    <li key={i}>{mistake}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        Deploy on GitHub Pages • Built with React + Vite
      </footer>
    </div>
  )
}

export default App
