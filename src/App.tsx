import { useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { validateCCode, type ValidationResult } from './validation'
import './App.css'

const DEFAULT_PROBLEM = `Write a C program that:
1. Reads two integers from the user
2. Prints their sum
3. Returns 0 from main()`

const DEFAULT_CODE = `#include <stdio.h>

int main() {
    int a, b;
    printf("Enter two numbers: ");
    scanf("%d %d", &a, &b);
    printf("Sum: %d\\n", a + b);
    return 0;
}`

function App() {
  const [problem, setProblem] = useState(DEFAULT_PROBLEM)
  const [code, setCode] = useState(DEFAULT_CODE)
  const [validation, setValidation] = useState<ValidationResult | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const handleValidate = useCallback(() => {
    setIsValidating(true)
    setValidation(null)
    // Simulate async validation (replace with API call for real validation)
    setTimeout(() => {
      const result = validateCCode(code)
      setValidation(result)
      setIsValidating(false)
    }, 600)
  }, [code])

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
