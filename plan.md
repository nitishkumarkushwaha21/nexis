# Resume Screening Module - Implementation Plan

## Goal
Build a minimal, modular Resume Screening feature with:
- React frontend for upload + structured result display
- Node.js/Express backend for upload, parsing, AI analysis, and optional role matching
- Dummy environment values (to be replaced later)
- No authentication

## Scope
- In scope:
  - Resume upload (PDF, DOC, DOCX)
  - File validation (type + size)
  - Text extraction/parsing
  - AI-powered structured analysis
  - Optional role matching
  - Structured response UI
  - Error handling and secure temporary file handling
- Out of scope:
  - Authentication/authorization
  - Persistent database storage
  - Production deployment tuning

## Architecture
- Monorepo style:
  - `backend/` - Express API
  - `frontend/` - React app (Vite)
- Flow:
  1. User uploads resume (+ optional job role)
  2. Backend validates file and extracts text
  3. Backend sends normalized text to AI provider layer
  4. AI response normalized to strict JSON schema
  5. Frontend renders structured results

## Backend Plan
1. Initialize Express server and middleware
2. Add upload route with `multer` memory storage
3. Validate MIME types and file size
4. Parse resume text:
   - PDF via parser library
   - DOCX via parser library
   - DOC fallback with best-effort extraction/error message
5. Build AI service abstraction:
   - Provider interface (`analyzeResume`)
   - OpenAI implementation with dummy env defaults
   - Optional mock mode fallback
6. Prompt engineering:
   - factual extraction only
   - strict JSON output
   - include unknown/null when data missing
7. Add role-matching logic in prompt + post-processing
8. Return consistent API response contract
9. Add centralized error handler

## Frontend Plan
1. Scaffold React app (minimal styling)
2. Create reusable components:
   - `ResumeUploadForm`
   - `AnalysisResult`
   - `ErrorBanner`
   - `LoadingState`
3. API layer abstraction in `services/api.js`
4. Submit multipart form to backend
5. Render structured response sections:
   - Summary
   - Skills
   - Experience highlights
   - Education
   - Strengths
   - Weaknesses/Gaps
   - Suggested roles
   - Role match score (if role provided)
6. Graceful UX for:
   - invalid file
   - parse failure
   - API failure
   - empty result

## Non-Functional Considerations
- Performance:
  - file size cap + in-memory processing
  - concise prompts to reduce latency
  - model selection configurable
- Security:
  - strict MIME/size validation
  - no permanent file storage
  - sanitize/trim extracted text
- Scalability:
  - stateless API
  - clear service boundaries
  - easy future queue integration

## API Contract (Planned)
- `POST /api/resume/analyze`
  - Multipart fields:
    - `resume` (file, required)
    - `jobRole` (string, optional)
  - Response:
    - `summary`: string
    - `skills`: string[]
    - `experience`: string[]
    - `education`: string[]
    - `strengths`: string[]
    - `weaknesses`: string[]
    - `suggestedRoles`: string[]
    - `roleMatch`: { role: string, score: number, rationale: string } | null

## Milestones
1. Create project structure and dependencies
2. Build backend endpoint + parser + AI service
3. Build frontend upload + result UI
4. Wire integration and environment config
5. Validate with local manual test cases

## Test Cases (Manual)
- Valid PDF resume
- Valid DOCX resume
- Unsupported file type
- Oversized file
- Empty/unreadable resume
- Missing sections in resume
- With and without job role
- AI provider failure fallback

## Dummy Environment Values
- Backend `.env` will include placeholder values:
  - `AI_PROVIDER=openai`
  - `OPENAI_API_KEY=dummy_key_replace_me`
  - `OPENAI_MODEL=gpt-4o-mini`
  - `MAX_FILE_SIZE_MB=5`
  - `PORT=5000`
  - `CORS_ORIGIN=http://localhost:5173`
