# Backend - Resume Screening API

## Setup
1. Copy `.env.example` to `.env`
2. Update placeholders later with real OpenRouter credentials:
   - `OPENROUTER_API_KEY`
   - `OPENROUTER_MODEL`
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`

## Endpoint
- `POST /api/resume/analyze`
  - Multipart form-data:
    - `resume` (PDF/DOC/DOCX)
    - `jobRole` (optional text)

- `GET /api/coding/questions`
  - Returns predefined coding questions

- `POST /api/coding/submit`
  - JSON body:
    - `problemId` (required)
    - `code` (required)
    - `language` (only `javascript` supported)

Response shape:
```json
{
  "data": {
    "summary": "...",
    "skills": ["..."],
    "experience": ["..."],
    "education": ["..."],
    "projects": ["..."],
    "strengths": ["..."],
    "weaknesses": ["..."],
    "suggestedRoles": ["..."],
    "roleMatch": {
      "role": "...",
      "score": 0,
      "rationale": "..."
    }
  },
  "meta": {
    "truncated": false,
    "charCount": 0
  }
}
```

## Notes
- Uses memory upload for secure temporary handling (no disk persistence)
- Uses OpenRouter with Claude model by default
- If API key is placeholder and `USE_MOCK_AI_WHEN_UNCONFIGURED=true`, mock analysis is returned
- Coding execution is intentionally basic (no sandbox or Docker in this version)
