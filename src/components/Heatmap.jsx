import React, { useState } from "react";

function scoreColor(score) {
  if (score >= 16) return "#9f1239"; // critical
  if (score >= 9) return "#ef4444";  // high
  if (score >= 5) return "#f59e0b";  // medium
  return "#064e3b";                   // low
}

export default function Heatmap({ grid = [], theme = "dark" }) {
  const [hover, setHover] = useState(null);

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,56px)", gap: 10 }}>
        {grid.flatMap((row, pIdx) =>
          row.map((cell, iIdx) => {
            const score = cell.prob * cell.impact;
            const color = scoreColor(score);
            const count = cell.risks.length;
            return (
              <div
                key={`${pIdx}-${iIdx}`}
                onMouseEnter={() => setHover({ ...cell, count })}
                onMouseLeave={() => setHover(null)}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: color,
                  color: "#fff",
                  fontWeight: 700,
                  cursor: count ? "pointer" : "default",
                  transition: "transform 120ms ease",
                }}
                title={`${count} risk(s) — P:${cell.prob} I:${cell.impact}`}
              >
                {count || ""}
              </div>
            );
          })
        )}
      </div>

      {hover && (
        <div className={`${theme === "dark" ? "bg-[#071225] text-gray-200" : "bg-white text-gray-900"} mt-3 p-3 rounded-lg border shadow-lg`}>
          <div className="font-semibold">P: {hover.prob} • I: {hover.impact} • {hover.count} risk(s)</div>
          <div className="mt-2 text-sm">
            {hover.risks.slice(0, 6).map(r => (
              <div key={r.id} className="py-1 border-b last:border-b-0">
                <div className="font-medium">{r.title}</div>
                <div className="text-xs opacity-80">{r.owner || "—"} • {r.severity}</div>
              </div>
            ))}
            {hover.count > 6 && <div className="text-xs opacity-70 mt-2">+{hover.count - 6} more</div>}
          </div>
        </div>
      )}
    </div>
  );
}
