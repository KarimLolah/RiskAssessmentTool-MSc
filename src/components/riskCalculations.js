// src/components/riskCalculations.js

export function calculateRiskScore(likelihood, impact) {
  return Number(likelihood) * Number(impact);
}

export function calculateResidualRisk(likelihood, impact) {
  if (!likelihood || !impact) return null;
  return Number(likelihood) * Number(impact);
}

export function getSeverityLevel(score) {
  if (score <= 5) return "Low";
  if (score <= 10) return "Medium";
  if (score <= 15) return "High";
  return "Critical";
}