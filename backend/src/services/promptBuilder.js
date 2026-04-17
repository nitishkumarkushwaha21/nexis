const buildAnalysisPrompt = ({ resumeText, jobRole, candidateProfile }) => {
  const roleSection = jobRole
    ? `Target job role from user: ${jobRole}`
    : "Target job role from user: not provided";

  const profileContext = candidateProfile
    ? JSON.stringify(candidateProfile, null, 2)
    : "{}";

  return `You are a resume analysis engine. Extract only facts from the resume text. Do not invent missing details.

Rules:
1) Return valid JSON only.
2) If a section is missing, return empty arrays or null where relevant.
3) Keep claims factual and grounded in resume text.
4) Keep summary to 2-3 concise sentences.
5) For roleMatch.score use integer from 0 to 100.
6) For scorecard, return exactly 10 sections and each section score must be an integer from 0 to 10.
7) totalScore must be sum of all section scores and must be from 0 to 100.
8) If data is missing, reduce marks and explain briefly in feedback.

Output JSON schema:
{
  "summary": "string",
  "skills": ["string"],
  "experience": ["string"],
  "education": ["string"],
  "projects": ["string"],
  "strengths": ["string"],
  "weaknesses": ["string"],
  "suggestedRoles": ["string"],
  "roleMatch": {
    "role": "string",
    "score": 0,
    "rationale": "string"
  },
  "scorecard": {
    "sections": [
      { "id": "profileClarity", "title": "Profile Clarity", "score": 0, "maxScore": 10, "feedback": "string" },
      { "id": "contactQuality", "title": "Contact Information", "score": 0, "maxScore": 10, "feedback": "string" },
      { "id": "skillsCoverage", "title": "Skills Coverage", "score": 0, "maxScore": 10, "feedback": "string" },
      { "id": "experienceDepth", "title": "Experience Depth", "score": 0, "maxScore": 10, "feedback": "string" },
      { "id": "projectImpact", "title": "Project Impact", "score": 0, "maxScore": 10, "feedback": "string" },
      { "id": "educationRelevance", "title": "Education Relevance", "score": 0, "maxScore": 10, "feedback": "string" },
      { "id": "achievementsLeadership", "title": "Achievements and Leadership", "score": 0, "maxScore": 10, "feedback": "string" },
      { "id": "roleAlignment", "title": "Role Alignment", "score": 0, "maxScore": 10, "feedback": "string" },
      { "id": "resumeStructure", "title": "Resume Structure and Clarity", "score": 0, "maxScore": 10, "feedback": "string" },
      { "id": "atsReadiness", "title": "ATS Readiness", "score": 0, "maxScore": 10, "feedback": "string" }
    ],
    "totalScore": 0,
    "grade": "string",
    "overallFeedback": "string"
  }
}

If no target role is provided, return roleMatch as null.

${roleSection}

Candidate profile context from form (optional):
${profileContext}

Resume text:
${resumeText}`;
};

const buildCodingEvaluationPrompt = ({ question, code, language }) => {
  const constraints = Array.isArray(question?.constraints) && question.constraints.length
    ? question.constraints.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : "1. No explicit constraints provided.";

  const examples = Array.isArray(question?.examples) && question.examples.length
    ? question.examples
        .map(
          (example, index) =>
            `Example ${index + 1}: input=${String(example.input)} output=${String(example.output)}`
        )
        .join("\n")
    : "No sample examples provided.";

  return `You are a strict coding evaluator. Evaluate code logically without executing it.

Rules:
1) Return valid JSON only. No markdown, no prose outside JSON.
2) Return exactly 10 test cases in test_case_results.
3) Use strict grading. If uncertain, mark fail.
4) Do not assume code runs successfully.
5) Include syntax/runtime/reference/logical error analysis.
6) Keep all fields machine-readable and deterministic.

Problem Title: ${question?.title || "Unknown"}
Difficulty: ${question?.difficulty || "Unknown"}
Problem Description:
${question?.description || ""}

Constraints:
${constraints}

Expected Behavior:
${question?.expectedBehavior || "Return correct result for all valid inputs."}

Sample Cases:
${examples}

Programming Language: ${language}

User Code:
${code}

Output schema (return this shape only):
{
  "total_test_cases": 10,
  "passed_test_cases": 0,
  "failed_test_cases": 10,
  "test_case_results": [
    {
      "input": "string",
      "expected_output": "string",
      "actual_output": "string",
      "status": "pass"
    }
  ],
  "errors": {
    "syntax_errors": ["string"],
    "runtime_errors": ["string"],
    "reference_errors": ["string"],
    "logical_issues": ["string"]
  },
  "code_quality_feedback": {
    "efficiency_analysis": "string",
    "improvements": ["string"],
    "best_practices_suggestions": ["string"]
  },
  "final_verdict": "Correct"
}

Validation rules for your JSON:
- total_test_cases must be exactly 10.
- test_case_results must contain exactly 10 items.
- status in each test case must be "pass" or "fail".
- final_verdict must be one of: "Correct", "Partially Correct", "Incorrect".
- passed_test_cases + failed_test_cases must equal 10.`;
};

module.exports = {
  buildAnalysisPrompt,
  buildCodingEvaluationPrompt,
};
