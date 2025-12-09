import * as XLSX from "xlsx";

/**
 * exportToExcel(risks, projectName)
 * simple xlsx exporter — uses sheetjs
 */
export function exportToExcel(risks = [], projectName = "project") {
  try {
    const data = risks.map(r => ({
      Title: r.title,
      Description: r.description,
      Category: r.category,
      Probability: r.probability,
      Impact: r.impact,
      Score: r.score || (r.probability * r.impact),
      Severity: r.severity || "",
      Owner: r.owner || "",
      Status: r.status || "",
      CreatedAt: r.createdAt || ""
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
