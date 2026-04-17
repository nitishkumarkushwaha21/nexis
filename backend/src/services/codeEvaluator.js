const vm = require("vm");
const { AppError } = require("../errors");

const EXECUTION_TIMEOUT_MS = 800;

const safeStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch (_error) {
    return String(value);
  }
};

const cloneValue = (value) => {
  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_error) {
    return value;
  }
};

const normalizePrimitive = (value) => {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  if (trimmed.toLowerCase() === "true") return true;
  if (trimmed.toLowerCase() === "false") return false;
  return trimmed;
};

const normalizeDeep = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeDeep);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeDeep(value[key]);
        return acc;
      }, {});
  }

  return normalizePrimitive(value);
};

const isEqual = (actual, expected) =>
  safeStringify(normalizeDeep(actual)) === safeStringify(normalizeDeep(expected));

const buildRunnableCode = (code) => `${code}`;

const buildVerdict = ({ passedCount, totalCount }) => {
  if (passedCount === totalCount) return "Correct";
  if (passedCount > 0) return "Partially Correct";
  return "Incorrect";
};

const evaluateSubmission = ({ code, question, mode = "submit" }) => {
  if (!code || !code.trim()) {
    throw new AppError("Code is required", 400);
  }

  const sandbox = {};
  vm.createContext(sandbox);

  let solveFn;
  try {
    vm.runInContext(buildRunnableCode(code), sandbox, {
      timeout: EXECUTION_TIMEOUT_MS,
    });
    solveFn = vm.runInContext(question.functionName, sandbox, {
      timeout: EXECUTION_TIMEOUT_MS,
    });
  } catch (error) {
    throw new AppError("Code execution failed", 400, error.message);
  }

  if (typeof solveFn !== "function") {
    throw new AppError(`Your code must define a function named ${question.functionName}`, 400);
  }

  const testCaseResults = question.testCases.map((testCase, index) => {
    try {
      sandbox.__args = cloneValue(testCase.input);
      const actual = vm.runInContext(`${question.functionName}(...__args)`, sandbox, {
        timeout: EXECUTION_TIMEOUT_MS,
      });
      const passed = isEqual(actual, testCase.expected);

      return {
        id: index + 1,
        input: safeStringify(testCase.input),
        expected_output: safeStringify(testCase.expected),
        actual_output: safeStringify(actual),
        status: passed ? "pass" : "fail",
      };
    } catch (error) {
      return {
        id: index + 1,
        input: safeStringify(testCase.input),
        expected_output: safeStringify(testCase.expected),
        actual_output: `Runtime error: ${error.message}`,
        status: "fail",
      };
    } finally {
      delete sandbox.__args;
    }
  });

  const passedCount = testCaseResults.filter((result) => result.status === "pass").length;
  const total = testCaseResults.length;
  const failedCount = total - passedCount;
  const finalVerdict = buildVerdict({
    passedCount,
    totalCount: total,
  });

  return {
    evaluation_mode: mode,
    total_test_cases: total,
    passed_test_cases: passedCount,
    failed_test_cases: failedCount,
    test_case_results: testCaseResults,
    errors: {
      syntax_errors: [],
      runtime_errors: [],
      reference_errors: [],
      logical_issues: failedCount
        ? ["One or more outputs did not match expected values."]
        : [],
    },
    code_quality_feedback: {
      efficiency_analysis:
        failedCount === 0
          ? "All executed test cases passed with deterministic runtime evaluation."
          : "Execution completed, but some test cases failed. Review edge-case handling.",
      improvements:
        failedCount === 0
          ? ["Consider improving readability and adding comments for complex logic."]
          : ["Verify return type and edge cases for each input pattern."],
      best_practices_suggestions: [
        "Keep the solution function pure and avoid mutating input arguments.",
      ],
    },
    final_verdict: finalVerdict,
  };
};

module.exports = {
  evaluateSubmission,
};
