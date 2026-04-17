import CodingAssessmentTab from "../components/CodingAssessmentTab";

function CodingPage() {
  return (
    <section className="feature-page coding-page">
      <header className="page-header">
        <h1>Coding Assessment</h1>
        <p>Pick a challenge, code in the editor, and evaluate results in real time.</p>
      </header>
      <CodingAssessmentTab />
    </section>
  );
}

export default CodingPage;
