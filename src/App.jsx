import React, { useEffect, useState } from 'react';
import RiskDashboard from './components/RiskDashboard';

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('rm_theme') || 'dark'
  );
  const [projectName, setProjectName] = useState(
    () => localStorage.getItem('rm_active_project') || 'Default Project'
  );

  useEffect(() => {
    localStorage.setItem('rm_theme', theme);
    document.documentElement.classList.toggle('light-theme', theme === 'light');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('rm_active_project', projectName);
  }, [projectName]);

  return (
    <div
      className={`${
        theme === 'dark'
          ? 'bg-[#071029] text-gray-100'
          : 'bg-gray-50 text-gray-900'
      } min-h-screen`}
    >
      <div className="max-w-7xl mx-auto p-6">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1
              className={`text-3xl font-extrabold ${
                theme === 'dark' ? 'text-yellow-400' : 'text-sky-700'
              }`}
            >
              Risk Management Tool
            </h1>
            <p
              className={`mt-1 ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              {projectName} 
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ProjectSelector
              active={projectName}
              onChange={setProjectName}
              theme={theme}
            />
            <button
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              className={`${
                theme === 'dark'
                  ? 'bg-[#0f1724] border border-[#213244] text-gray-100'
                  : 'bg-white border border-gray-200 text-gray-800'
              } px-3 py-2 rounded-lg`}
            >
              {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          </div>
        </header>

        <main>
          <RiskDashboard activeProject={projectName} theme={theme} />
        </main>

        <footer
          className={`mt-10 text-xs ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          Proof of Concept For MSc demonstration. 
        </footer>
      </div>
    </div>
  );
}

/* Project selector (keeps it compact) */
function ProjectSelector({ active, onChange, theme }) {
  const [list, setList] = useState(() => {
    try {
      const s = localStorage.getItem('rm_projects');
      return s ? JSON.parse(s) : ['Default Project'];
    } catch {
      return ['Default Project'];
    }
  });
  const [newName, setNewName] = useState('');

  function addProject() {
    if (!newName.trim()) return;
    const n = newName.trim();
    const updated = list.includes(n) ? list : [n, ...list];
    setList(updated);
    localStorage.setItem('rm_projects', JSON.stringify(updated));
    onChange(n);
    setNewName('');
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={active}
        onChange={(e) => onChange(e.target.value)}
        className={`${
          theme === 'dark'
            ? 'bg-[#0f1724] text-gray-100 border border-[#213244]'
            : 'bg-white border border-gray-200 text-gray-800'
        } p-2 rounded-lg`}
      >
        {list.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <input
        value={newName}
        onChange={(e) => setNewName(e.target.value)}
        placeholder="New project"
        className={`${
          theme === 'dark'
            ? 'bg-[#0f1724] text-gray-100 border border-[#213244]'
            : 'bg-white border border-gray-200 text-gray-800'
        } p-2 rounded-lg`}
      />
      <button
        onClick={addProject}
        className="px-3 py-2 rounded bg-emerald-500 text-black font-semibold"
      >
        Create
      </button>
    </div>
  );
}
