const ListSection = ({ title, items }) => (
  <section className="result-section">
    <h3>{title}</h3>
    {Array.isArray(items) && items.length > 0 ? (
      <ul>
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    ) : (
      <p className="muted">No data found.</p>
    )}
  </section>
);

const ScoreBar = ({ score, maxScore }) => {
  const safeMax = maxScore > 0 ? maxScore : 10;
  const percent = Math.max(0, Math.min(100, Math.round((score / safeMax) * 100)));
  return (
    <div className="score-bar">
      <div className="score-bar-fill" style={{ width: `${percent}%` }} />
    </div>
  );
};

function AnalysisResult({ result }) {
  if (!result) return null;

  const scorecard = result.scorecard;

  return (
    <div className="result-card">
      {scorecard ? (
        <section className="result-section score-summary">
          <h3>Resume Score</h3>
          <div className="total-score-wrap">
            <div className="total-score-number">
              <strong>{scorecard.totalScore ?? 0}</strong>
              <span>/ {scorecard.maxScore ?? 100}</span>
            </div>
            <p className="score-grade">
              <strong>Grade:</strong> {scorecard.grade || "Unrated"}
            </p>
          </div>
          <p>{scorecard.overallFeedback || "No overall feedback found."}</p>
        </section>
      ) : null}

      {scorecard?.sections?.length ? (
        <section className="result-section">
          <h3>Section-wise Marks (10 Sections)</h3>
          <div className="section-score-grid">
            {scorecard.sections.map((section) => (
              <article className="section-score-card" key={section.id || section.title}>
                <div className="section-score-head">
                  <h4>{section.title}</h4>
                  <span>
                    {section.score}/{section.maxScore}
                  </span>
                </div>
                <ScoreBar score={section.score} maxScore={section.maxScore} />
                <p className="muted">{section.feedback}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="result-section">
        <h3>Summary</h3>
        <p>{result.summary || "No summary found."}</p>
      </section>

      <ListSection title="Skills" items={result.skills} />
      <ListSection title="Experience Highlights" items={result.experience} />
      <ListSection title="Education" items={result.education} />
      <ListSection title="Projects" items={result.projects} />
      <ListSection title="Strengths" items={result.strengths} />
      <ListSection title="Weaknesses or Gaps" items={result.weaknesses} />
      <ListSection title="Suggested Roles" items={result.suggestedRoles} />

      <section className="result-section">
        <h3>Role Match</h3>
        {result.roleMatch ? (
          <div>
            <p>
              <strong>Role:</strong> {result.roleMatch.role}
            </p>
            <p>
              <strong>Score:</strong> {result.roleMatch.score}/100
            </p>
            <p>
              <strong>Rationale:</strong> {result.roleMatch.rationale}
            </p>
          </div>
        ) : (
          <p className="muted">Role match is unavailable (no target role provided).</p>
        )}
      </section>
    </div>
  );
}

export default AnalysisResult;
