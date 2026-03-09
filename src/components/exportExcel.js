import * as XLSX from "xlsx";

export function exportToExcel(risks = [], projectName = "project") {
  try {
    const data = risks.map(r => ({
      Title: r.title,
      Description: r.description,
      Category: r.category,
      Likelihood: r.likelihood,
      Impact: r.impact,
      InitialScore: r.likelihood * r.impact,
      ResidualScore:
        r.residualLikelihood && r.residualImpact
          ? r.residualLikelihood * r.residualImpact
          : "",
      Owner: r.owner || "",
      Status: r.status || "",
     }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Risks");
    XLSX.writeFile(wb, `${projectName.replace(/\s+/g, "_")}_risks.xlsx`);
  } catch (err) {
    console.error("Excel export failed", err);
    alert("Excel export failed: " + (err.message || err));
  }
}
