import { useState } from "react";
import ResumeUploadForm from "./ResumeUploadForm";
import AnalysisResult from "./AnalysisResult";
import ErrorBanner from "./ErrorBanner";
import LoadingState from "./LoadingState";
import { analyzeResume } from "../services/api";

const MAX_FILE_SIZE_MB = 5;
const allowedExtensions = [".pdf", ".doc", ".docx"];
const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const initialFormFields = {
  jobRole: "",
  relevantExperienceYears: "",
  relevantExperienceMonths: "",
};

function ResumeScreeningTab() {
  const [file, setFile] = useState(null);
  const [formFields, setFormFields] = useState(initialFormFields);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateFile = (selectedFile) => {
    if (!selectedFile) return "Please select a resume file.";

    const lowerName = selectedFile.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isAllowed) return "Only PDF, DOC, or DOCX files are allowed.";
    if (selectedFile.type && !allowedMimeTypes.includes(selectedFile.type)) {
      return "File format looks invalid. Please upload a valid PDF, DOC, or DOCX file.";
    }

    const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (selectedFile.size > maxBytes) {
      return `File size should be ${MAX_FILE_SIZE_MB} MB or less.`;
    }

    return "";
  };

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    setResult(null);
    setError(validateFile(selectedFile));
  };

  const handleFieldChange = (field, value) => {
    setFormFields((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await analyzeResume({ file, formFields });
      setResult(response.data);
    } catch (apiError) {
      setError(apiError.message || "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <header className="tab-header-block">
        <h2>Resume Screening</h2>
        <p>Upload a resume to receive AI-generated candidate insights.</p>
      </header>

      <ResumeUploadForm
        file={file}
        formFields={formFields}
        onFileChange={handleFileChange}
        onFieldChange={handleFieldChange}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <ErrorBanner message={error} />
      {loading && <LoadingState />}
      <AnalysisResult result={result} />
    </section>
  );
}

export default ResumeScreeningTab;
