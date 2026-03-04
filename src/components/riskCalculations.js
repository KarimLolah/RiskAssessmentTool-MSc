export const calculateRiskScore = (likelihood, impact) => {
    return Number(likelihood) * Number(impact);
  };
  
  export const calculateResidualRisk = (residualLikelihood, residualImpact) => {
    if (!residualLikelihood || !residualImpact) return null;
    return Number(residualLikelihood) * Number(residualImpact);
  };