import React, { useState } from "react";

const getColor = (score) => {
  if (score >= 20) return "bg-red-700";
  if (score >= 15) return "bg-red-500";
  if (score >= 10) return "bg-yellow-500";
  if (score >= 5) return "bg-green-500";
  return "bg-green-300";
};

const Heatmap = ({ grid }) => {
  const [hoveredCell, setHoveredCell] = useState(null);

  return (
    <div className="relative">

      <div className="grid grid-cols-5 gap-2">
        {grid.flat().map((cell, index) => {

          const score = cell.prob * cell.impact;

          return (
            <div
              key={index}
              className={`w-14 h-14 flex items-center justify-center text-xs font-bold text-white rounded cursor-pointer ${getColor(score)}`}
              onMouseEnter={() => setHoveredCell(cell)}
              onMouseLeave={() => setHoveredCell(null)}
            >
              {cell.risks.length > 0 ? cell.risks.length : ""}
            </div>
          );
        })}
      </div>

      {hoveredCell && hoveredCell.risks.length > 0 && (
        <div className="absolute left-full ml-4 top-0 bg-black text-white p-3 rounded shadow-lg w-64 z-50">

          <div className="font-bold mb-2">
            Risks in this cell
          </div>

          {hoveredCell.risks.map((risk) => (
            <div key={risk.id} className="text-xs mb-2 border-b border-gray-600 pb-1">
              <div className="font-semibold">{risk.riskId}</div>
              <div>{risk.title}</div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default Heatmap;