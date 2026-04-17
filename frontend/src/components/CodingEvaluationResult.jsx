import { useState } from "react";

const ErrorList = ({ title, items }) => (
  <article className="result-subcard">
    <h4>{title}</h4>
    {Array.isArray(items) && items.length > 0 ? (
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    ) : (
      <p className="muted">No issues reported.</p>
    )}
  </article>
);

function CodingEvaluationResult({ result }) {
  const [activeCaseId, setActiveCaseId] = useState(1);

  if (!result) return null;

  const total = Number(result.total_test_cases || 10);
  const passed = Number(result.passed_test_cases || 0);
  const verdict = String(result.final_verdict || "Incorrect");
  const mode = String(result.evaluation_mode || "submit");
  const testCases = result.test_case_results || [];
  const activeCase = testCases.find((testCase) => testCase.id === activeCaseId) || testCases[0] || null;

  const verdictClass =
    verdict === "Correct"
      ? "verdict-chip pass"
      : verdict === "Partially Correct"
        ? "verdict-chip partial"
        : "verdict-chip fail";

  return (
    <section className="coding-result-card">
      <header className="result-head">
        <div>
          <h3>Evaluation Result</h3>
          <p className="result-summary-text">
            {passed} / {total} Test Cases Passed
          </p>
          <p className="result-summary-text muted">
            Mode: {mode === "run" ? "Run (sample tests)" : "Submit (full tests)"}
          </p>
        </div>
        <span className={verdictClass}>{verdict}</span>
      </header>

      <section className="result-subcard">
        <h4>Test Case Summary</h4>
        <p>
          Passed: <strong>{passed}</strong> | Failed: <strong>{result.failed_test_cases}</strong>
        </p>
      </section>

      <section className="result-subcard">
        <h4>Detailed Test Cases</h4>
        <div className="test-case-tabs">
          {testCases.map((testCase) => {
            const statusClass = testCase.status === "pass" ? "case-status pass" : "case-status fail";
            const isActive = activeCase?.id === testCase.id;

            return (
              <button
                type="button"
                key={testCase.id}
                className={isActive ? "test-case-tab active" : "test-case-tab"}
                onClick={() => setActiveCaseId(testCase.id)}
              >
                <span>TC {testCase.id}</span>
                <span className={statusClass}>{testCase.status.toUpperCase()}</span>
              </button>
            );
          })}
        </div>
        {activeCase ? (
          <article className="test-case-detail">
            <p>
              <strong>Input:</strong> {activeCase.input}
            </p>
            <p>
              <strong>Expected Output:</strong> {activeCase.expected_output}
            </p>
            <p>
              <strong>Actual Output:</strong> {activeCase.actual_output}
            </p>
          </article>
        ) : (
          <p className="muted">No test cases found.</p>
        )}
      </section>

      <section className="result-grid-2">
        <ErrorList title="Syntax Errors" items={result.errors?.syntax_errors} />
        <ErrorList title="Runtime Errors" items={result.errors?.runtime_errors} />
        <ErrorList title="Reference Errors" items={result.errors?.reference_errors} />
        <ErrorList title="Logical Issues" items={result.errors?.logical_issues} />
      </section>

      <section className="result-subcard">
        <h4>AI Feedback</h4>
        <p>{result.code_quality_feedback?.efficiency_analysis}</p>

        <h5>Improvements</h5>
        {result.code_quality_feedback?.improvements?.length ? (
          <ul>
            {result.code_quality_feedback.improvements.map((item, index) => (
              <li key={`imp-${index}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">No improvement suggestions provided.</p>
        )}

        <h5>Best Practices</h5>
        {result.code_quality_feedback?.best_practices_suggestions?.length ? (
          <ul>
            {result.code_quality_feedback.best_practices_suggestions.map((item, index) => (
              <li key={`bp-${index}`}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">No best-practice notes provided.</p>
        )}
      </section>
    </section>
  );
}

export default CodingEvaluationResult;
