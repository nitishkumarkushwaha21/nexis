import ResumeScreeningTab from "../components/ResumeScreeningTab";

function ResumePage() {
  return (
    <section className="feature-page resume-page">
      <header className="page-header">
        <h1>Resume Screening</h1>
        <p>Upload candidate resumes and get structured AI-based screening insights.</p>
      </header>
      <ResumeScreeningTab />
    </section>
  );
}

export default ResumePage;
