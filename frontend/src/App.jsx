import { useEffect, useState } from "react";
import "./App.css";
import ResumePage from "./pages/ResumePage";
import CodingPage from "./pages/CodingPage";
import InterviewPage from "./pages/InterviewPage";

const ROUTES = {
  "/resume": "Resume Screening",
  "/coding": "Coding Assessment",
  "/interview": "Interview Module",
};

const getPath = () => {
  const hashPath = window.location.hash.replace(/^#/, "");
  if (hashPath in ROUTES) return hashPath;

  const pathname = window.location.pathname;
  if (pathname in ROUTES) return pathname;
  return "/resume";
};

function App() {
  const [activePath, setActivePath] = useState(getPath);

  useEffect(() => {
    const hashPath = window.location.hash.replace(/^#/, "");
    if (!(hashPath in ROUTES)) {
      window.history.replaceState(null, "", "#/resume");
    }

    const onHashChange = () => setActivePath(getPath());
    window.addEventListener("hashchange", onHashChange);

    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = (path) => {
    if (path === activePath) return;
    window.location.hash = path;
    setActivePath(path);
  };

  const renderActivePage = () => {
    if (activePath === "/coding") return <CodingPage />;
    if (activePath === "/interview") return <InterviewPage />;
    return <ResumePage />;
  };

  return (
    <main className="app-shell">
      <header className="app-topbar">
        <div className="brand-block">
          <h1>AI Interview System</h1>
          <p>Three dedicated pages for screening, coding, and interview workflows.</p>
        </div>
        <nav className="top-nav" aria-label="Feature pages">
          {Object.entries(ROUTES).map(([path, label]) => (
            <button
              key={path}
              type="button"
              className={activePath === path ? "top-nav-btn active" : "top-nav-btn"}
              onClick={() => navigate(path)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <section className="page-body">{renderActivePage()}</section>
    </main>
  );
}

export default App;
