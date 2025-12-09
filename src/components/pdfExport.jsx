import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * exportRisksToPDF(risks)
 * - Creates a printable report from the current risks and triggers a PDF download.
 */
export async function exportRisksToPDF(risks) {
  try {
    // Build an HTML summary in a detached element
    const wrap = document.createElement('div');
    wrap.style.width = '900px';
    wrap.style.padding = '20px';
    wrap.style.background = '#ffffff';
    wrap.style.color = '#000000';
    wrap.innerHTML = `
      <h1 style="font-family: Arial, Helvetica, sans-serif;">Risk Report</h1>
      <p>Generated: ${new Date().toLocaleString()}</p>
      <table style="width:100%;border-collapse:collapse;font-family:Arial, Helvetica, sans-serif;">
        <thead>
          <tr>
            <th style="border:1px solid #ddd;padding:8px;text-align:left">Title</th>
            <th style="border:1px solid #ddd;padding:8px">Category</th>
            <th style="border:1px solid #ddd;padding:8px">Prob</th>
            <th style="border:1px solid #ddd;padding:8px">Impact</th>
            <th style="border:1px solid #ddd;padding:8px">Score</th>
            <th style="border:1px solid #ddd;padding:8px">Severity</th>
            <th style="border:1px solid #ddd;padding:8px">Owner</th>
          </tr>
        </thead>
        <tbody>
          ${risks
            .map(
              (r) => `<tr>
            <td style="border:1px solid #ddd;padding:8px">${escapeHtml(
              r.title
            )}</td>
            <td style="border:1px solid #ddd;padding:8px">${escapeHtml(
              r.category
            )}</td>
            <td style="border:1px solid #ddd;padding:8px;text-align:center">${
              r.probability
            }</td>
            <td style="border:1px solid #ddd;padding:8px;text-align:center">${
              r.impact
            }</td>
            <td style="border:1px solid #ddd;padding:8px;text-align:center">${
              r.score
            }</td>
            <td style="border:1px solid #ddd;padding:8px;text-align:center">${
              r.severity
            }</td>
            <td style="border:1px solid #ddd;padding:8px">${escapeHtml(
              r.owner || ''
            )}</td>
          </tr>`
            )
            .join('')}
        </tbody>
      </table>
    `;

    document.body.appendChild(wrap);
    // render to canvas
    const canvas = await html2canvas(wrap, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'pt',
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save('risk_report.pdf');
    document.body.removeChild(wrap);
  } catch (err) {
    console.error('PDF export failed', err);
    alert('PDF export failed: ' + (err.message || err));
  }
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
