import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import ErrorBanner from "./ErrorBanner";
import LoadingState from "./LoadingState";
import CodingEvaluationResult from "./CodingEvaluationResult";
import { getCodingQuestions, runCode, submitCode } from "../services/api";

const STARTERS_BY_PROBLEM = {
  default: {
    javascript: `function solve(input) {
  // Implement your solution
  return input;
}`,
    python: `def solve(input_data):
    # Implement your solution
    return input_data`,
    java: `import java.util.*;

class Solution {
    public static Object solve(Object input) {
        // Implement your solution
        return input;
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

string solve(string input) {
    // Implement your solution
    return input;
}`,
  },
  "two-sum-pair": {
    javascript: `function solve(nums, target) {
  // Return true if any pair sums to target
  return false;
}`,
    python: `def solve(nums, target):
    # Return True if any pair sums to target
    return False`,
    java: `import java.util.*;

class Solution {
    public static boolean solve(int[] nums, int target) {
        // Return true if any pair sums to target
        return false;
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

bool solve(vector<int> nums, int target) {
    // Return true if any pair sums to target
    return false;
}`,
  },
  "reverse-string": {
    javascript: `function solve(s) {
  // Return reversed string
  return s;
}`,
    python: `def solve(s):
    # Return reversed string
    return s`,
    java: `import java.util.*;

class Solution {
    public static String solve(String s) {
        // Return reversed string
        return s;
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

string solve(string s) {
    // Return reversed string
    return s;
}`,
  },
  "count-vowels": {
    javascript: `function solve(s) {
  // Return number of vowels in the string
  return 0;
}`,
    python: `def solve(s):
    # Return number of vowels in the string
    return 0`,
    java: `import java.util.*;

class Solution {
    public static int solve(String s) {
        // Return number of vowels in the string
        return 0;
    }
}`,
    cpp: `#include <bits/stdc++.h>
using namespace std;

int solve(string s) {
    // Return number of vowels in the string
    return 0;
}`,
  },
};

const getStarterCode = (problemId, language) => {
  const starterSet = STARTERS_BY_PROBLEM[problemId] || STARTERS_BY_PROBLEM.default;
  return starterSet[language] || STARTERS_BY_PROBLEM.default[language] || STARTERS_BY_PROBLEM.default.javascript;
};

const LANGUAGE_OPTIONS = [
  { label: "JavaScript", value: "javascript", monaco: "javascript" },
  { label: "Python", value: "python", monaco: "python" },
  { label: "Java", value: "java", monaco: "java" },
  { label: "C++", value: "cpp", monaco: "cpp" },
];

function CodingAssessmentTab() {
  const editorRef = useRef(null);
  const [questions, setQuestions] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [code, setCode] = useState(getStarterCode("", "javascript"));
  const [language, setLanguage] = useState("javascript");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadQuestions = async () => {
      setLoadingQuestions(true);
      setError("");

      try {
        const response = await getCodingQuestions();
        setQuestions(response.data || []);
        if (response.data?.length) {
          const firstProblemId = response.data[0].id;
          setSelectedProblemId(firstProblemId);
          setCode(getStarterCode(firstProblemId, "javascript"));
        }
      } catch (apiError) {
        setError(apiError.message || "Failed to load coding questions.");
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, []);

  const selectedProblem = useMemo(
    () => questions.find((question) => question.id === selectedProblemId),
    [questions, selectedProblemId]
  );

  const executeEvaluation = async (mode) => {
    if (!selectedProblemId) {
      setError("Please select a problem.");
      return;
    }

    if (mode === "run") setRunning(true);
    if (mode === "submit") setSubmitting(true);
    setError("");
    setResult(null);

    try {
      const apiCall = mode === "run" ? runCode : submitCode;
      const response = await apiCall({
        problemId: selectedProblemId,
        code,
        language,
      });
      setResult(response.data?.result || null);
    } catch (apiError) {
      setError(apiError.message || "Code submission failed.");
    } finally {
      if (mode === "run") setRunning(false);
      if (mode === "submit") setSubmitting(false);
    }
  };

  return (
    <section className="coding-assessment-section">
      <header className="tab-header-block">
        <h2>Coding Assessment</h2>
        <p>Select a problem, write your solution, and evaluate against test cases.</p>
      </header>

      {loadingQuestions ? <LoadingState /> : null}
      <ErrorBanner message={error} />

      {!loadingQuestions && questions.length > 0 ? (
        <>
          <div className="coding-grid">
            <div className="coding-left-pane">
              <aside className="question-list-card">
                <h3>Problems</h3>
                <ul className="question-list">
                  {questions.map((question) => (
                    <li key={question.id}>
                      <button
                        type="button"
                        className={question.id === selectedProblemId ? "question-btn active" : "question-btn"}
                        onClick={() => {
                          setSelectedProblemId(question.id);
                          setCode(getStarterCode(question.id, language));
                          setResult(null);
                        }}
                      >
                        <span>{question.title}</span>
                        <small className={`difficulty-badge ${String(question.difficulty || "").toLowerCase()}`}>
                          {question.difficulty}
                        </small>
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>

              {selectedProblem ? (
                <article className="problem-card">
                  <div className="problem-head">
                    <h3>{selectedProblem.title}</h3>
                    <span className={`difficulty-badge ${String(selectedProblem.difficulty || "").toLowerCase()}`}>
                      {selectedProblem.difficulty}
                    </span>
                  </div>
                  <p>{selectedProblem.description}</p>
                  {selectedProblem.constraints?.length ? (
                    <div className="problem-block">
                      <strong>Constraints</strong>
                      <ul>
                        {selectedProblem.constraints.map((constraint, idx) => (
                          <li key={`${selectedProblem.id}-constraint-${idx}`}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div className="problem-block">
                    <strong>Sample Input / Output</strong>
                    <ul>
                      {selectedProblem.examples.map((example, idx) => (
                        <li className="problem-example" key={`${selectedProblem.id}-${idx}`}>
                          <p>
                            <span>Input</span>
                            <code>{example.input}</code>
                          </p>
                          <p>
                            <span>Output</span>
                            <code>{example.output}</code>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ) : null}
            </div>

            <div className="coding-right-pane">
              <section className="editor-card dark-editor-card">
              <div className="editor-toolbar">
                <label htmlFor="language">Language</label>
                <select
                  id="language"
                  value={language}
                  onChange={(event) => {
                    const nextLanguage = event.target.value;
                    setLanguage(nextLanguage);
                    setCode(getStarterCode(selectedProblemId, nextLanguage));
                  }}
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={async () => {
                    if (editorRef.current) {
                      await editorRef.current.getAction("editor.action.formatDocument").run();
                    }
                  }}
                >
                  Format Code
                </button>
              </div>

              <Editor
                className="code-editor"
                height="460px"
                language={LANGUAGE_OPTIONS.find((item) => item.value === language)?.monaco}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || "")}
                onMount={(editor) => {
                  editorRef.current = editor;
                }}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  wordWrap: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />

              <div className="editor-actions">
                <button
                  type="button"
                  className="submit-btn"
                  onClick={() => executeEvaluation("run")}
                  disabled={running || submitting}
                >
                  {running ? "Running..." : "Run Code"}
                </button>
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => executeEvaluation("submit")}
                  disabled={running || submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
              </section>
            </div>
          </div>

          {result ? (
            <div className="coding-result-wrap">
              <CodingEvaluationResult result={result} />
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

export default CodingAssessmentTab;
