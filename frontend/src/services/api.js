const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const parsePayload = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return {
    error: {
      message: text || `Unexpected response (${response.status})`,
    },
  };
};

export const analyzeResume = async ({ file, formFields }) => {
  const formData = new FormData();
  formData.append("resume", file);
  Object.entries(formFields || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      formData.append(key, String(value).trim());
    }
  });

  const response = await fetch(`${API_BASE_URL}/api/resume/analyze`, {
    method: "POST",
    body: formData,
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    const baseMessage = payload?.error?.message || "Analysis failed";
    const details = payload?.error?.details ? ` (${payload.error.details})` : "";
    throw new Error(`${baseMessage}${details}`);
  }

  return payload;
};

export const getCodingQuestions = async () => {
  const response = await fetch(`${API_BASE_URL}/api/coding/problems`);
  const payload = await parsePayload(response);

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Failed to fetch coding questions");
  }

  return payload;
};

export const submitCode = async ({ problemId, code, language }) => {
  const response = await fetch(`${API_BASE_URL}/api/coding/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ problemId, code, language }),
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Failed to submit code");
  }

  return payload;
};

export const runCode = async ({ problemId, code, language }) => {
  const response = await fetch(`${API_BASE_URL}/api/coding/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ problemId, code, language }),
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Failed to run code");
  }

  return payload;
};
