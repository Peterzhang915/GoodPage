"use client";

import React from "react";
import { Education } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";

interface EducationListProps {
  educationHistory: Education[];
  onEdit: (educationId: number) => void;
  onDelete: (educationId: number) => void;
  disabled?: boolean;
}

const EducationList: React.FC<EducationListProps> = ({
  educationHistory,
  onEdit,
  onDelete,
  disabled = false,
}) => {
  if (!educationHistory || educationHistory.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">
        No education history recorded.
      </p>
    );
  }

  // Sort by end_year descending (most recent first), handle nulls
  const sortedHistory = [...educationHistory].sort((a, b) => {
    const endA = a.end_year ?? 0;
    const endB = b.end_year ?? 0;
    if (endB !== endA) return endB - endA;
    // If end years are the same or both null, sort by start year descending
    const startA = a.start_year ?? 0;
    const startB = b.start_year ?? 0;
    return startB - startA;
  });

  return (
    <ul className="space-y-3">
      {sortedHistory.map((edu) => (
        <li
          key={edu.id}
          className="flex items-center justify-between p-3 bg-gray-700 rounded-md hover:bg-gray-600/50 transition-colors text-sm"
        >
          <div className="flex-grow pr-4">
            <span className="font-medium text-gray-200">{edu.degree}</span>
            {edu.field && (
              <span className="text-gray-400"> in {edu.field}</span>
            )}
            <span className="block text-gray-300">{edu.school}</span>
            <span className="text-xs text-gray-500">
              {edu.start_year ? `${edu.start_year} - ` : ""}
              {edu.end_year || "Present"}
            </span>
            {edu.thesis_title && (
              <p className="text-xs text-gray-400 mt-1 italic">
                Thesis: {edu.thesis_title}
              </p>
            )}
            {edu.description && (
              <p className="text-xs text-gray-400 mt-1">{edu.description}</p>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onEdit(edu.id)}
              disabled={disabled}
              className="p-1 text-gray-400 hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-indigo-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Edit Education Record"
            >
              <Edit size={16} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(edu.id)}
              disabled={disabled}
              className="p-1 text-gray-400 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-red-500 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete Education Record"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default EducationList;
