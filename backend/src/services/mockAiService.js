const analyzeResumeMock = ({ resumeText, jobRole, candidateProfile }) => {
  const preview = resumeText.slice(0, 220);
  const experienceYears = Number(candidateProfile?.totalExperienceYears || 0);
  const sections = [
    {
      id: "profileClarity",
      title: "Profile Clarity",
      score: 7,
      maxScore: 10,
      feedback: "Resume headline and summary are present but can be sharper.",
    },
    {
      id: "contactQuality",
      title: "Contact Information",
      score: 8,
      maxScore: 10,
      feedback: "Basic contact details appear available.",
    },
    {
      id: "skillsCoverage",
      title: "Skills Coverage",
      score: 7,
      maxScore: 10,
      feedback: "Core stack appears, but depth in some skills is unclear.",
    },
    {
      id: "experienceDepth",
      title: "Experience Depth",
      score: experienceYears >= 3 ? 8 : 6,
      maxScore: 10,
      feedback: "Experience is visible, but quantified business outcomes are limited.",
    },
    {
      id: "projectImpact",
      title: "Project Impact",
      score: 7,
      maxScore: 10,
      feedback: "Projects are listed; impact metrics can improve.",
    },
    {
      id: "educationRelevance",
      title: "Education Relevance",
      score: 6,
      maxScore: 10,
      feedback: "Education is mentioned but lacks detail in mock mode.",
    },
    {
      id: "achievementsLeadership",
      title: "Achievements and Leadership",
      score: 5,
      maxScore: 10,
      feedback: "Leadership and achievement signals are limited in provided text.",
    },
    {
      id: "roleAlignment",
      title: "Role Alignment",
      score: jobRole ? 8 : 6,
      maxScore: 10,
      feedback: "Alignment improves when a target role is provided.",
    },
    {
      id: "resumeStructure",
      title: "Resume Structure and Clarity",
      score: 7,
      maxScore: 10,
      feedback: "Readable structure, but tighter section ordering is possible.",
    },
    {
      id: "atsReadiness",
      title: "ATS Readiness",
      score: 7,
      maxScore: 10,
      feedback: "Keyword coverage is decent; section naming can be standardized further.",
    },
  ];
  const totalScore = sections.reduce((sum, section) => sum + section.score, 0);

  return {
    summary:
      "Candidate appears to have a technical profile with evidence of practical implementation experience.",
    skills: ["JavaScript", "React", "Node.js", "Problem Solving"],
    experience: [
      "Built web applications and APIs using modern JavaScript stack.",
      "Collaborated on feature delivery and iterative improvements.",
    ],
    education: ["Education details not clearly detected in mock mode."],
    projects: ["Project details extracted in mock mode from provided text sample."],
    strengths: ["Hands-on implementation", "Stack versatility"],
    weaknesses: ["Some resume sections may be incomplete or unclear"],
    suggestedRoles: ["Frontend Developer", "Full Stack Developer"],
    roleMatch: jobRole
      ? {
          role: jobRole,
          score: 72,
          rationale:
            "Mock relevance estimate based on detected technical keywords and project signals.",
        }
      : null,
    scorecard: {
      sections,
      totalScore,
      maxScore: 100,
      grade: "Good",
      overallFeedback:
        "Strong base profile with practical skill signals. Add quantified outcomes and clearer achievement bullets to improve score.",
    },
    meta: {
      mode: "mock",
      textPreview: preview,
    },
  };
};

const analyzeCodingMock = ({ question, code, language }) => {
  const hasSolveSignature =
    /\bsolve\b/.test(String(code || "")) ||
    /\bdef\s+solve\b/.test(String(code || "")) ||
    /\bclass\s+Solution\b/.test(String(code || ""));

  const test_case_results = Array.from({ length: 10 }, (_item, index) => {
    const passThreshold = hasSolveSignature ? 7 : 4;
    const isPass = index < passThreshold;
    return {
      id: index + 1,
      input: `case_${index + 1}`,
      expected_output: `expected_${index + 1}`,
      actual_output: isPass ? `expected_${index + 1}` : `mismatch_${index + 1}`,
      status: isPass ? "pass" : "fail",
    };
  });

  const passed = test_case_results.filter((item) => item.status === "pass").length;

  return {
    total_test_cases: 10,
    passed_test_cases: passed,
    failed_test_cases: 10 - passed,
    test_case_results,
    errors: {
      syntax_errors: hasSolveSignature
        ? []
        : ["Entry point function not detected reliably in submitted code."],
      runtime_errors: [],
      reference_errors: [],
      logical_issues: [
        "This is mock evaluator output. Real Groq analysis will provide deeper issue detection.",
      ],
    },
    code_quality_feedback: {
      efficiency_analysis:
        "Time and space complexity appear acceptable for basic constraints, but edge cases need stricter handling.",
      improvements: [
        "Handle null/empty edge cases explicitly.",
        "Use clearer variable names and reduce repeated logic.",
      ],
      best_practices_suggestions: [
        `Follow ${language} idioms for readability and maintainability.`,
        "Add comments for non-trivial branches.",
      ],
    },
    final_verdict: passed >= 10 ? "Correct" : passed >= 6 ? "Partially Correct" : "Incorrect",
    meta: {
      mode: "mock",
      problem: question?.id || "unknown",
    },
  };
};

module.exports = {
  analyzeResumeMock,
  analyzeCodingMock,
};
