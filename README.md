# Resume Screening Module

This workspace now includes a complete minimal implementation of the Resume Screening feature.

## Structure
- `backend/` Express API for upload, parsing, AI analysis
- `frontend/` React app for upload and result display
- `plan.md` feature implementation plan

## Modules
- Resume Screening tab
- Coding Assessment tab
- Interview Module placeholder tab

## Run Backend
1. Go to `backend`
2. Copy `.env.example` to `.env`
3. Keep dummy values for now or replace later
4. Run:

```bash
npm install
npm run dev
```

Backend URL: `http://localhost:5000`

## Run Frontend
1. Go to `frontend`
2. Copy `.env.example` to `.env`
3. Run:

```bash
npm install
npm run dev
```

Frontend URL: `http://localhost:5173`

## API
### `POST /api/resume/analyze`
Multipart form-data fields:
- `resume` (required): PDF/DOC/DOCX
- `jobRole` (optional): target role text

### `GET /api/coding/questions`
Returns predefined coding questions.

### `POST /api/coding/submit`
JSON body fields:
- `problemId` (required)
- `code` (required)
- `language` (javascript)

## Notes
- No authentication implemented (as requested)
- Uses secure temporary in-memory file handling
- Supports mock AI response when real key is not configured
# nexis
