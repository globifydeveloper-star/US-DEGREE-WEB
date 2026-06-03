import React from 'react';
import { StatsGridProps } from '@/types/statsgrid';

export default function StatsGrid({
  totalStudents,
  facultyRatio,
  retentionRate,
  programs,
  fafsaApplications,
  completionRate,
}: StatsGridProps) {
  const stats = [
    {
      label: "TOTAL STUDENTS",
      value: totalStudents != null ? totalStudents.toLocaleString() : "N/A",
      accentColor: "#2563EB",
      accentBg: "#EEF2FF",
      accentBorder: "#C7D2FE",
      valueColor: "#1E3A8A",
    },
    {
      label: "FACULTY RATIO",
      value: facultyRatio ?? "N/A",
      accentColor: "#16A34A",
      accentBg: "#F0FDF4",
      accentBorder: "#BBF7D0",
      valueColor: "#14532D",
    },
    {
      label: "RETENTION RATE",
      value: retentionRate ?? "N/A",
      accentColor: "#D97706",
      accentBg: "#FFFBEB",
      accentBorder: "#FDE68A",
      valueColor: "#78350F",
    },
    {
      label: "PROGRAMS",
      value: programs != null ? `${programs}+` : "N/A",
      accentColor: "#0891B2",
      accentBg: "#ECFEFF",
      accentBorder: "#A5F3FC",
      valueColor: "#164E63",
    },
    {
      label: "FAFSA APPLICATION",
      value: fafsaApplications != null ? fafsaApplications.toLocaleString() : "N/A",
      accentColor: "#E11D48",
      accentBg: "#FFF1F2",
      accentBorder: "#FECDD3",
      valueColor: "#881337",
    },
    {
      label: "COMPLETION",
      value: completionRate ?? "N/A",
      accentColor: "#7C3AED",
      accentBg: "#F5F3FF",
      accentBorder: "#DDD6FE",
      valueColor: "#4C1D95",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "12px",
        padding: "8px 0",
      }}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          style={{
            backgroundColor: stat.accentBg,
            border: `1px solid ${stat.accentBorder}`,
            borderRadius: "16px",
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "100px",
          }}
        >
          {/* Label with underline */}
          <p
            style={{
              margin: 0,
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: stat.accentColor,
              textTransform: "uppercase",
              // borderBottom: `2px solid ${stat.accentColor}`,
              paddingBottom: "3px",
              display: "inline-block",
              alignSelf: "flex-start",
            }}
          >
            {stat.label}
          </p>

          {/* Value */}
          <p
            style={{
              margin: "12px 0 0",
              fontSize: "32px",
              fontWeight: 800,
              color: stat.valueColor,
              lineHeight: 1,
            }}
          >
            {stat.label === "FAFSA APPLICATION" ? (
              <span
                style={{
                  // borderBottom: `4px solid ${stat.accentColor}`,
                  paddingBottom: "2px",
                }}
              >
                {stat.value}
              </span>
            ) : (
              stat.value
            )}
          </p>
        </div>
      ))}
    </div>
  );
}