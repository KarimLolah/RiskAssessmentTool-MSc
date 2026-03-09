import React, { useState } from "react";
import Heatmap from "./Heatmap";
import {
  calculateRiskScore,
  calculateResidualRisk,
  getSeverityLevel,
} from "./riskCalculations";
import { exportToExcel } from "./exportExcel";
import { exportRisksToPDF } from "./pdfExport";

const RiskDashboard = ({ theme }) => {
  const [risks, setRisks] = useState([]);
  const [riskCounter, setRiskCounter] = useState(1);
  const [heatmapView, setHeatmapView] = useState("initial");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technical",
    likelihood: 1,
    impact: 1,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addRisk = () => {
    if (!formData.title || !formData.description) return;
  
    const newRisk = {
      id: Date.now(),
      riskId: `R-${String(riskCounter).padStart(3, "0")}`,
      ...formData,
      likelihood: Number(formData.likelihood),
      impact: Number(formData.impact),
      mitigationStrategy: "",
      owner: "",
      status: "Open",
      reviewDate: "",
      residualLikelihood: null,
      residualImpact: null,
    };
  
    setRisks([...risks, newRisk]);
    setRiskCounter(riskCounter + 1);
  
    setFormData({
      title: "",
      description: "",
      category: "Technical",
      likelihood: 1,
      impact: 1,
    });
  };

  const updateRiskField = (id, field, value) => {
    const updated = risks.map((risk) =>
      risk.id === id ? { ...risk, [field]: value } : risk
    );
    setRisks(updated);
  };

  const applyMitigation = (id) => {
    const updated = risks.map((risk) =>
      risk.id === id ? { ...risk, status: "Mitigated" } : risk
    );
    setRisks(updated);
  };

  const buildHeatmapGrid = () => {
    const grid = [];
  
    for (let p = 5; p >= 1; p--) {
      const row = [];
  
      for (let i = 1; i <= 5; i++) {
  
        const cellRisks = risks.filter((r) => {
          if (heatmapView === "initial") {
            return (
              Number(r.likelihood) === p &&
              Number(r.impact) === i
            );
          } else {
            return (
              Number(r.residualLikelihood) === p &&
              Number(r.residualImpact) === i
            );
          }
        });
  
        row.push({
          prob: p,
          impact: i,
          risks: cellRisks,
        });
      }
  
      grid.push(row);
    }
  
    return grid;
  };

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Risk Management Dashboard
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => exportToExcel(risks, "Risk_Project")}
            className="bg-purple-600 text-white px-4 py-2 rounded"
          >
            Export to Excel
          </button>

          <button
            onClick={() => exportRisksToPDF(risks)}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Export to PDF
          </button>
        </div>
      </div>

      <div className="border p-4 mb-6 rounded">
        <input
          type="text"
          name="title"
          placeholder="Risk Title"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 mb-2 w-full"
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 mb-2 w-full"
        />

<select
  name="category"
  value={formData.category}
  onChange={handleChange}
  className={`border p-2 mb-4 rounded ${
    theme === "dark"
      ? "bg-[#071225] text-white border-gray-600"
      : "bg-white text-gray-900 border-gray-300"
  }`}
>
  <option>Technical</option>
  <option>Organisational</option>
  <option>External</option>
  <option>Project Management</option>
  <option>Requirements</option>
</select>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm mb-1 font-medium">
              Likelihood (1 = Rare, 5 = Almost Certain)
            </label>
            <input
              type="number"
              name="likelihood"
              min="1"
              max="5"
              value={formData.likelihood}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">
              Impact (1 = Low, 5 = Critical)
            </label>
            <input
              type="number"
              name="impact"
              min="1"
              max="5"
              value={formData.impact}
              onChange={handleChange}
              className="border p-2 w-full"
            />
          </div>
        </div>

        <button
          onClick={addRisk}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Risk
        </button>
      </div>

<div className="mb-10">
  <h2 className="text-xl font-bold mb-4">
    Risk Heatmap ({heatmapView === "initial" ? "Initial" : "Residual"})
  </h2>

  <div className="flex gap-3 mb-4">
    <button
      onClick={() => setHeatmapView("initial")}
      className={`px-4 py-2 rounded ${
        heatmapView === "initial"
          ? "bg-blue-600 text-white"
          : "bg-gray-600 text-white"
      }`}
    >
      Initial Risk
    </button>

    <button
      onClick={() => setHeatmapView("residual")}
      className={`px-4 py-2 rounded ${
        heatmapView === "residual"
          ? "bg-green-600 text-white"
          : "bg-gray-600 text-white"
      }`}
    >
      Residual Risk
    </button>
  </div>

  <div className="flex items-start">

<div className="flex flex-col mr-2">
  {[5,4,3,2,1].map((n) => (
    <div key={n} className="h-14 flex items-center justify-center text-sm">
      {n}
    </div>
  ))}
</div>

    <div>
      <Heatmap
  grid={buildHeatmapGrid()}
  theme="dark"
/>

      <div className="grid grid-cols-5 gap-2 mt-2">
        {[1,2,3,4,5].map((n) => (
          <div key={n} className="w-12 text-center text-sm">
            {n}
          </div>
        ))}
      </div>

      <div className="text-center mt-2 text-sm font-medium">
        Impact →
      </div>
    </div>
  </div>

  <div className="mt-2 text-sm font-medium">

  </div>
</div>

      {risks.map((risk) => {
        const initialScore = calculateRiskScore(
          risk.likelihood,
          risk.impact
        );

        const severity = getSeverityLevel(initialScore);

        const residualScore = calculateResidualRisk(
          risk.residualLikelihood,
          risk.residualImpact
        );

        return (
          <div key={risk.id} className="border p-4 mb-4 rounded">
            <h2 className="font-bold">
              {risk.riskId} — {risk.title}
            </h2>

            <p>{risk.description}</p>
            <p>Category: {risk.category}</p>
            <p>Status: {risk.status}</p>

            <p>
              Initial Risk Score: {initialScore} (
              <span className="font-semibold">
                {severity}
              </span>
              )
            </p>

            {residualScore && (
              <p className="text-green-600">
                Residual Risk Score: {residualScore}
              </p>
            )}

            <div className="mt-3 border-t pt-3">
              <h3 className="font-semibold">Mitigation</h3>

              <textarea
                placeholder="Mitigation Strategy"
                value={risk.mitigationStrategy}
                onChange={(e) =>
                  updateRiskField(
                    risk.id,
                    "mitigationStrategy",
                    e.target.value
                  )
                }
                className="border p-2 w-full mb-2"
              />

              <input
                type="text"
                placeholder="Owner"
                value={risk.owner}
                onChange={(e) =>
                  updateRiskField(risk.id, "owner", e.target.value)
                }
                className="border p-2 mr-2"
              />

              <input
                type="date"
                value={risk.reviewDate}
                onChange={(e) =>
                  updateRiskField(
                    risk.id,
                    "reviewDate",
                    e.target.value
                  )
                }
                className="border p-2 mr-2"
              />

              <div className="mt-2">
                <label>Residual Likelihood: </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={risk.residualLikelihood || ""}
                  onChange={(e) =>
                    updateRiskField(
                      risk.id,
                      "residualLikelihood",
                      e.target.value
                    )
                  }
                  className="border p-1 mr-2"
                />

                <label>Residual Impact: </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={risk.residualImpact || ""}
                  onChange={(e) =>
                    updateRiskField(
                      risk.id,
                      "residualImpact",
                      e.target.value
                    )
                  }
                  className="border p-1 mr-2"
                />

                <button
                  onClick={() => applyMitigation(risk.id)}
                  className="bg-green-500 text-white px-3 py-1 rounded"
                >
                  Apply Mitigation
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RiskDashboard;