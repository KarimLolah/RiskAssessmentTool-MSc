import React, { useState } from "react";
import {
  calculateRiskScore,
  calculateResidualRisk,
} from "./riskCalculations";

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Risk Management Dashboard</h1>

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

        <input
          type="number"
          name="likelihood"
          min="1"
          max="5"
          value={formData.likelihood}
          onChange={handleChange}
          className="border p-2 mr-2"
        />

        <input
          type="number"
          name="impact"
          min="1"
          max="5"
          value={formData.impact}
          onChange={handleChange}
          className="border p-2 mr-2"
        />

        <button
          onClick={addRisk}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Risk
        </button>
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