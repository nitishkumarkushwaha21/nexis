const acceptedTypes = ".pdf,.doc,.docx";

function ResumeUploadForm({
  file,
  formFields,
  onFileChange,
  onFieldChange,
  onSubmit,
  loading,
}) {
  return (
    <form className="upload-form" onSubmit={onSubmit}>
      <div className="form-grid">
        <div className="form-field form-field-full">
          <label htmlFor="resume">Resume (PDF, DOC, DOCX)</label>
          <input
            id="resume"
            name="resume"
            type="file"
            accept={acceptedTypes}
            onChange={(event) => onFileChange(event.target.files?.[0] || null)}
            required
          />
          <small className="muted">
            Allowed formats: PDF, DOC, DOCX. Max file size: 5 MB.
          </small>
          {file ? <small className="muted">Selected: {file.name}</small> : null}
        </div>

        <div className="form-field">
          <label htmlFor="jobRole">Target Role (optional)</label>
          <input
            id="jobRole"
            name="jobRole"
            type="text"
            placeholder="e.g. Backend Developer"
            value={formFields.jobRole}
            onChange={(event) => onFieldChange("jobRole", event.target.value)}
          />
        </div>

        <div className="form-field">
          <label htmlFor="relevantExperienceYears">Relevant Experience (years)</label>
          <input
            id="relevantExperienceYears"
            name="relevantExperienceYears"
            type="number"
            min="0"
            max="50"
            step="1"
            placeholder="e.g. 3"
            value={formFields.relevantExperienceYears}
            onChange={(event) =>
              onFieldChange("relevantExperienceYears", event.target.value)
            }
          />
        </div>

        <div className="form-field">
          <label htmlFor="relevantExperienceMonths">Relevant Experience (months)</label>
          <input
            id="relevantExperienceMonths"
            name="relevantExperienceMonths"
            type="number"
            min="0"
            max="11"
            step="1"
            placeholder="e.g. 6"
            value={formFields.relevantExperienceMonths}
            onChange={(event) =>
              onFieldChange("relevantExperienceMonths", event.target.value)
            }
          />
        </div>
      </div>

      <button type="submit" disabled={loading || !file}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>
    </form>
  );
}

export default ResumeUploadForm;
