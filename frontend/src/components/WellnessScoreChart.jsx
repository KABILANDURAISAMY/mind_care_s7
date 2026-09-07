import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

/**
 * Renders a student's wellness percentage over time.
 * data: [{ date: "2026-08-15", percentage: 62 }, ...] — oldest first.
 */
const WellnessScoreChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center font-body text-sm text-ink/50">
        No wellness check-ins yet.
      </div>
    );
  }

  const chartData = [...data].reverse();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 10, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#1F3D3B" strokeOpacity={0.08} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "#1B2620", fillOpacity: 0.55 }}
          tickFormatter={(d) => d.slice(5)}
          axisLine={{ stroke: "#1F3D3B", strokeOpacity: 0.15 }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "#1B2620", fillOpacity: 0.55 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #1F3D3B22", fontFamily: "Karla" }}
          formatter={(value) => [`${value} / 100`, "Wellness score"]}
        />
        <Line
          type="monotone"
          dataKey="percentage"
          stroke="#D9A441"
          strokeWidth={3}
          dot={{ r: 4, fill: "#1F3D3B", strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default WellnessScoreChart;
