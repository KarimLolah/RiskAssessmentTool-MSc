import React, { useState } from "react";
import Heatmap from "./Heatmap";
import {
  calculateRiskScore,
  calculateResidualRisk,
} from "./riskCalculations";
import { exportToExcel } from "./exportExcel";
import { exportRisksToPDF } from "./pdfExport";

const RiskDashboard = () => {
  const [risks, setRisks] = useState([]);
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
    const newRisk = {
      id: Date.now(),
      ...formData,
      mitigationStrategy: "",
      owner: "",
      status: "Open",
      reviewDate: "",
      residualLikelihood: null,
      residualImpact: null,
    };

    setRisks([...risks, newRisk]);

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
    const updated = risks.map((risk) => {
      if (risk.id === id) {
        return {
          ...risk,
          status: "Mitigated",
        };
      }
      return risk;
    });

    setRisks(updated);
  };

  // 🔥 UPDATED HEATMAP LOGIC (uses residual values if present)
  const buildHeatmapGrid = () => {
    const grid = [];

    for (let p = 1; p <= 5; p++) {
      const row = [];

      for (let i = 1; i <= 5; i++) {
        const cellRisks = risks.filter((r) => {
          const likelihood = r.residualLikelihood
            ? Number(r.residualLikelihood)
            : Number(r.likelihood);

          const impact = r.residualImpact
            ? Number(r.residualImpact)
            : Number(r.impact);

          return likelihood === p && impact === i;
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
      <h1 className="text-2xl font-bold mb-4">
        Risk Management Dashboard
      </h1>


<button
  onClick={() => exportToExcel(risks, "Risk_Project")}
  className="bg-purple-600 text-white px-4 py-2 rounded mb-6"
>
  Export to Excel
</button>

<button
  onClick={() => exportRisksToPDF(risks)}
  className="bg-red-600 text-white px-4 py-2 rounded ml-2"
>
  Export to PDF
</button>

      {/* Add Risk Form */}
      <div className="border p-4 mb-6 rounded">
        <input
          type="text"
          name="title"
          placeholder="Risk Title"
          value={formData.title}
          onChange={handleChange}
          className="border p-2 mr-2"
        />

        <input
          type="text"
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="border p-2 mr-2"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border p-2 mr-2"
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

      {/* 🔥 Heatmap Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">
          Risk Heatmap (Initial / Residual)
        </h2>
        <Heatmap grid={buildHeatmapGrid()} theme="dark" />
      </div>

      {/* Risk List */}
      {risks.map((risk) => {
        const initialScore = calculateRiskScore(
          risk.likelihood,
          risk.impact
        );

        const residualScore = calculateResidualRisk(
          risk.residualLikelihood,
          risk.residualImpact
        );

        return (
          <div key={risk.id} className="border p-4 mb-4 rounded">
            <h2 className="font-bold">{risk.title}</h2>
            <p>{risk.description}</p>
            <p>Category: {risk.category}</p>
            <p>Status: {risk.status}</p>

            <p>Initial Risk Score: {initialScore}</p>

            {residualScore && (
              <p className="text-green-600">
                Residual Risk Score: {residualScore}
              </p>
            )}

            {/* Mitigation Section */}
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
                  updateRiskField(risk.id, "reviewDate", e.target.value)
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