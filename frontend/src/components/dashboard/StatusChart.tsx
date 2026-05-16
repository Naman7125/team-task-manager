import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";

export function StatusChart({
  data,
}: {
  data: { TODO: number; IN_PROGRESS: number; DONE: number };
}) {
  const chartData = [
    { name: "Todo", count: data.TODO, fill: "oklch(0.78 0.04 70)" },
    { name: "In Progress", count: data.IN_PROGRESS, fill: "oklch(0.64 0.17 38)" },
    { name: "Done", count: data.DONE, fill: "oklch(0.45 0.09 220)" },
  ];
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="oklch(0.9 0.01 70)" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="oklch(0.5 0.015 60)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            dy={6}
          />
          <YAxis
            stroke="oklch(0.5 0.015 60)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: "oklch(0.96 0.012 70)" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid oklch(0.9 0.01 70)",
              background: "oklch(0.995 0.004 90)",
              fontSize: 12,
              fontFamily: "Geist, sans-serif",
              boxShadow: "0 8px 24px -12px oklch(0.32 0.12 38 / 0.18)",
            }}
          />
          <Bar dataKey="count" radius={[8, 8, 2, 2]} maxBarSize={64}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
