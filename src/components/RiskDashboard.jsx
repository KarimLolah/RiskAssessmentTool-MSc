import React, { useEffect, useMemo, useState } from 'react';
import Heatmap from './Heatmap';
import { exportRisksToPDF } from './pdfExport';
import { exportToExcel } from './exportExcel'; // <-- ensure this file exists in components/

const SAMPLE = [
  {
    id: 'r1',
    title: 'Unclear requirements',
    description: 'Stakeholders unclear on acceptance criteria',
    category: 'Requirements',
    probability: 4,
    impact: 4,
    mitigation: 'Refinement & prototypes',
    owner: 'PO',
    status: 'Open',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'r2',
    title: 'External API limits',
    description: 'Rate limiting causes degraded feature',
    category: 'External',
    probability: 3,
    impact: 5,
    mitigation: 'Caching + backoff',
    owner: 'Backend',
    status: 'Open',
    createdAt: new Date().toISOString(),
  },
];

function uid() {
  return 'r' + Math.random().toString(36).slice(2, 9);
}
function severityLabel(score) {
  if (score >= 16) return 'Critical';
  if (score >= 9) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
}

export default function RiskDashboard({ activeProject, theme }) {
  const storageKey = `rm_data::${activeProject}`;
  const [risks, setRisks] = useState(() => {
    try {
      const s = localStorage.getItem(storageKey);
      return s ? JSON.parse(s) : SAMPLE;
    } catch {
      return SAMPLE;
    }
  });

  useEffect(
    () => localStorage.setItem(storageKey, JSON.stringify(risks)),
    [risks, storageKey]
  );

  const [form, setForm] = useState({
    id: null,
    title: '',
    description: '',
    category: 'General',
    probability: 3,
    impact: 3,
    mitigation: '',
    owner: '',
    status: 'Open',
  });
  const [filter, setFilter] = useState({
    q: '',
    category: 'All',
    status: 'All',
  });
  const [sortBy, setSortBy] = useState('scoreDesc');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function save(e) {
    e.preventDefault();
    const nr = {
      ...form,
      probability: Number(form.probability),
      impact: Number(form.impact),
    };
    nr.score = nr.probability * nr.impact;
    nr.severity = severityLabel(nr.score);
    nr.createdAt = nr.createdAt || new Date().toISOString();
    if (nr.id) setRisks((r) => r.map((x) => (x.id === nr.id ? nr : x)));
    else {
      nr.id = uid();
      setRisks((r) => [nr, ...r]);
    }
    setForm({
      id: null,
      title: '',
      description: '',
      category: 'General',
      probability: 3,
      impact: 3,
      mitigation: '',
      owner: '',
      status: 'Open',
    });
  }

  function edit(id) {
    const r = risks.find((x) => x.id === id);
    if (r) setForm({ ...r });
  }
  function del(id) {
    if (!confirm('Delete this risk?')) return;
    setRisks((r) => r.filter((x) => x.id !== id));
  }

  function exportJSON() {
    const data = JSON.stringify(risks, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProject.replace(/\s+/g, '_')}_risks.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(text) {
    try {
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('Expecting array');
      const normalized = parsed.map((p) => ({ ...p, id: p.id || uid() }));
      setRisks((r) => [...normalized, ...r]);
      alert('Imported ' + normalized.length + ' risks');
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  }

  const categories = useMemo(
    () => [
      'All',
      ...Array.from(new Set(risks.map((r) => r.category || 'General'))),
    ],
    [risks]
  );

  const filtered = useMemo(() => {
    let list = risks.map((r) => ({
      ...r,
      score: r.score || r.probability * r.impact,
      severity: r.severity || severityLabel(r.probability * r.impact),
    }));
    if (filter.q) {
      const q = filter.q.toLowerCase();
      list = list.filter((r) =>
        (r.title + ' ' + (r.description || '') + ' ' + (r.mitigation || ''))
          .toLowerCase()
          .includes(q)
      );
    }
    if (filter.category && filter.category !== 'All')
      list = list.filter((r) => r.category === filter.category);
    if (filter.status && filter.status !== 'All')
      list = list.filter((r) => r.status === filter.status);
    if (sortBy === 'scoreDesc') list.sort((a, b) => b.score - a.score);
    if (sortBy === 'scoreAsc') list.sort((a, b) => a.score - b.score);
    if (sortBy === 'probDesc')
      list.sort((a, b) => b.probability - a.probability);
    return list;
  }, [risks, filter, sortBy]);

  const heatmapData = useMemo(() => {
    const grid = Array.from({ length: 5 }, (_, i) =>
      Array.from({ length: 5 }, (_, j) => ({
        prob: i + 1,
        impact: j + 1,
        risks: [],
      }))
    );
    for (const r of risks) {
      const p = Math.max(1, Math.min(5, r.probability || 3));
      const im = Math.max(1, Math.min(5, r.impact || 3));
      grid[p - 1][im - 1].risks.push(r);
    }
    return grid;
  }, [risks]);

  const presets = [
    { label: 'Low (1×1)', p: 1, i: 1 },
    { label: 'Medium (3×3)', p: 3, i: 3 },
    { label: 'High (4×4)', p: 4, i: 4 },
    { label: 'Critical (5×5)', p: 5, i: 5 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Form card */}
      <section className="lg:col-span-2">
        <div
          className={`${
            theme === 'dark'
              ? 'bg-gradient-to-br from-[#081225] to-[#0c1722]'
              : 'bg-white'
          } rounded-2xl border p-5 shadow-lg`}
        >
          <h2
            className={`text-xl font-semibold ${
              theme === 'dark' ? 'text-yellow-400' : 'text-sky-700'
            }`}
          >
            Add / Edit Risk
          </h2>

          <form
            onSubmit={save}
            className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="md:col-span-2 space-y-3">
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Title"
                className={`${
                  theme === 'dark'
                    ? 'bg-[#0f1724] text-gray-100'
                    : 'bg-gray-50 text-gray-900'
                } w-full p-3 rounded-lg border`}
                required
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                rows={4}
                className={`${
                  theme === 'dark'
                    ? 'bg-[#0f1724] text-gray-100'
                    : 'bg-gray-50 text-gray-900'
                } w-full p-3 rounded-lg border`}
              />
              <div className="flex gap-3">
                <input
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Category"
                  className={`${
                    theme === 'dark'
                      ? 'bg-[#0f1724] text-gray-100'
                      : 'bg-gray-50 text-gray-900'
                  } p-3 rounded-lg border flex-1`}
                />
                <input
                  name="owner"
                  value={form.owner}
                  onChange={handleChange}
                  placeholder="Owner"
                  className={`${
                    theme === 'dark'
                      ? 'bg-[#0f1724] text-gray-100'
                      : 'bg-gray-50 text-gray-900'
                  } p-3 rounded-lg border w-40`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300">
                  Probability
                </label>
                <select
                  name="probability"
                  value={form.probability}
                  onChange={handleChange}
                  className={`${
                    theme === 'dark'
                      ? 'bg-[#0f1724] text-gray-100'
                      : 'bg-gray-50 text-gray-900'
                  } mt-2 w-full p-2 rounded-lg border`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300">Impact</label>
                <select
                  name="impact"
                  value={form.impact}
                  onChange={handleChange}
                  className={`${
                    theme === 'dark'
                      ? 'bg-[#0f1724] text-gray-100'
                      : 'bg-gray-50 text-gray-900'
                  } mt-2 w-full p-2 rounded-lg border`}
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={`${
                    theme === 'dark'
                      ? 'bg-[#0f1724] text-gray-100'
                      : 'bg-gray-50 text-gray-900'
                  } mt-2 w-full p-2 rounded-lg border`}
                >
                  {['Open', 'In Progress', 'Mitigated', 'Closed'].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-2">
                <div className="flex gap-2 flex-wrap">
                  {presets.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          probability: p.p,
                          impact: p.i,
                        }))
                      }
                      className="px-3 py-1 rounded bg-[#112233] hover:bg-[#0f2a3a] text-sm"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <input
                  name="mitigation"
                  value={form.mitigation}
                  onChange={handleChange}
                  placeholder="Mitigation actions"
                  className={`${
                    theme === 'dark'
                      ? 'bg-[#0f1724] text-gray-100'
                      : 'bg-gray-50 text-gray-900'
                  } w-full p-3 rounded-lg border`}
                />
              </div>

              <div className="flex gap-2 mt-3">
                <button className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-semibold">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setForm({
                      id: null,
                      title: '',
                      description: '',
                      category: 'General',
                      probability: 3,
                      impact: 3,
                      mitigation: '',
                      owner: '',
                      status: 'Open',
                    })
                  }
                  className="px-4 py-2 rounded-lg border"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={exportJSON}
                  className="px-3 py-2 rounded-lg border"
                >
                  Export JSON
                </button>
                <ImportButton onImport={importJSON} />
                <button
                  type="button"
                  onClick={() => exportRisksToPDF(risks)}
                  className="ml-auto px-3 py-2 rounded-lg border"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Logged risks */}
        <div
          className={`${
            theme === 'dark' ? 'bg-[#071225]' : 'bg-white'
          } rounded-2xl border p-4 mt-6 shadow-lg`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3
              className={`text-lg font-semibold ${
                theme === 'dark' ? 'text-yellow-400' : 'text-sky-700'
              }`}
            >
              Logged Risks
            </h3>
            <div className="flex items-center gap-2">
              <input
                placeholder="Search..."
                value={filter.q}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, q: e.target.value }))
                }
                className={`${
                  theme === 'dark'
                    ? 'bg-[#0f1724] text-gray-100'
                    : 'bg-gray-50 text-gray-900'
                } p-2 rounded-lg border`}
              />
              <select
                value={filter.category}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, category: e.target.value }))
                }
                className="p-2 rounded-lg border"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                value={filter.status}
                onChange={(e) =>
                  setFilter((f) => ({ ...f, status: e.target.value }))
                }
                className="p-2 rounded-lg border"
              >
                {['All', 'Open', 'In Progress', 'Mitigated', 'Closed'].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  )
                )}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="p-2 rounded-lg border"
              >
                <option value="scoreDesc">Score (High → Low)</option>
                <option value="scoreAsc">Score (Low → High)</option>
                <option value="probDesc">Probability (High → Low)</option>
              </select>
              <button
                onClick={() => exportToExcel(risks)}
                className="px-3 py-2 rounded-lg border"
              >
                Export Excel
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              <thead>
                <tr className="text-left">
                  <th className="p-2 text-xs text-gray-300">Title</th>
                  <th className="p-2 text-xs text-gray-300">Score</th>
                  <th className="p-2 text-xs text-gray-300">Severity</th>
                  <th className="p-2 text-xs text-gray-300">Owner</th>
                  <th className="p-2 text-xs text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className={`${
                      theme === 'dark'
                        ? 'border-t border-[#20313e]'
                        : 'border-t'
                    }`}
                  >
                    <td className="p-3">
                      <div className="font-semibold">{r.title}</div>
                      <div className="text-xs opacity-80">{r.description}</div>
                      <div className="text-xs opacity-70 mt-1">
                        Mitigation: {r.mitigation}
                      </div>
                    </td>
                    <td className="p-3 font-semibold">{r.score}</td>
                    <td className="p-3">{r.severity}</td>
                    <td className="p-3">{r.owner}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => edit(r.id)}
                          className="px-2 py-1 border rounded text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => del(r.id)}
                          className="px-2 py-1 border rounded text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-gray-400">
                      No risks match filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Right column: heatmap + instructions */}
      <aside className="space-y-4">
        <div
          className={`${
            theme === 'dark' ? 'bg-[#071225]' : 'bg-white'
          } rounded-2xl border p-4 shadow-lg`}
        >
          <div className="flex items-center justify-between">
            <h3
              className={`font-semibold ${
                theme === 'dark' ? 'text-yellow-400' : 'text-sky-700'
              }`}
            >
              Risk Heatmap
            </h3>
            <div className="text-xs text-gray-300">Prob ↓ Impact →</div>
          </div>
          <div className="mt-4">
            <Heatmap grid={heatmapData} theme={theme} />
          </div>
        </div>

        <div
          className={`${
            theme === 'dark' ? 'bg-[#071225]' : 'bg-white'
          } rounded-2xl border p-4 shadow-lg`}
        >
          <h4
            className={`font-semibold ${
              theme === 'dark' ? 'text-yellow-400' : 'text-sky-700'
            }`}
          >
            Assessor Instructions
          </h4>
          <p className="text-sm text-gray-300 mt-2">
            Evaluate: identification completeness, assessment accuracy (1–5
            scales), mitigation clarity, integration effort, and
            customisability. Compare to Masso et al. (2020) and Zahedi et al.
            (2023).
          </p>
        </div>
      </aside>
    </div>
  );
}

/* Import control */
function ImportButton({ onImport }) {
  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => onImport(ev.target.result);
    reader.readAsText(f);
  }
  return (
    <label className="inline-flex items-center px-3 py-2 border rounded-lg cursor-pointer">
      Import JSON
      <input
        type="file"
        accept="application/json"
        onChange={handleFile}
        className="hidden"
      />
    </label>
  );
}
