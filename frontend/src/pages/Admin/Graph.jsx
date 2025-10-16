import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell
} from "recharts";

const barData = [
  { name: "Jan", targets: 20 },
  { name: "Feb", targets: 30 },
  { name: "Mar", targets: 45 },
  { name: "Apr", targets: 50 },
  { name: "May", targets: 35 },
];

const pieData = [
  { name: "Achieved", value: 65 },
  { name: "Remaining", value: 35 },
];

const COLORS = ["#8b5cf6", "#e0e7ff"];

export default function Graph() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      {/* Bar Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow w-full">
        <h3 className="text-base sm:text-lg font-semibold mb-2">📊 Monthly Targets</h3>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="targets" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow w-full">
        <h3 className="text-base sm:text-lg font-semibold mb-2">📈 Performance Trend</h3>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="targets"
                stroke="#10b981"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow w-full sm:col-span-2">
        <h3 className="text-base sm:text-lg font-semibold mb-2">🥧 Overall Completion</h3>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label
              >
                {pieData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
