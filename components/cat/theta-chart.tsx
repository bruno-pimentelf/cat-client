"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { HistoryStep } from "@/lib/types";

const chartConfig = {
  theta: {
    label: "Proficiencia (θ)",
    color: "var(--color-chart-1)",
  },
  se: {
    label: "Erro Padrao",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig;

interface ThetaChartProps {
  history: HistoryStep[];
  currentTheta?: number;
  showSE?: boolean;
}

export function ThetaChart({
  history,
  currentTheta,
  showSE = true,
}: ThetaChartProps) {
  if (history.length === 0 && currentTheta === undefined) return null;

  const data = history.map((h) => ({
    step: h.step,
    theta: Number(h.theta.toFixed(3)),
    se: h.se != null ? Number(h.se.toFixed(3)) : null,
    upper: h.se != null ? Number((h.theta + h.se).toFixed(3)) : null,
    lower: h.se != null ? Number((h.theta - h.se).toFixed(3)) : null,
    correct: h.correct,
  }));

  return (
    <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
      >
        <defs>
          <linearGradient id="thetaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-chart-1)"
              stopOpacity={0.3}
            />
            <stop
              offset="100%"
              stopColor="var(--color-chart-1)"
              stopOpacity={0.02}
            />
          </linearGradient>
          <linearGradient id="seGrad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-chart-3)"
              stopOpacity={0.15}
            />
            <stop
              offset="100%"
              stopColor="var(--color-chart-3)"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="step"
          tickLine={false}
          axisLine={false}
          fontSize={11}
          tickMargin={8}
          className="fill-muted-foreground"
        />
        <YAxis
          domain={[-3, 3]}
          tickLine={false}
          axisLine={false}
          fontSize={11}
          tickMargin={4}
          className="fill-muted-foreground"
          ticks={[-3, -2, -1, 0, 1, 2, 3]}
        />
        <ReferenceLine y={0} strokeDasharray="4 4" className="stroke-border" />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                if (name === "theta") return [`θ = ${value}`, "Proficiencia"];
                if (name === "se") return [`SE = ${value}`, "Erro Padrao"];
                return [String(value), String(name)];
              }}
            />
          }
        />
        {showSE && (
          <Area
            dataKey="upper"
            stroke="none"
            fill="var(--color-chart-3)"
            fillOpacity={0.08}
            type="monotone"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        )}
        {showSE && (
          <Area
            dataKey="lower"
            stroke="none"
            fill="var(--color-background)"
            fillOpacity={1}
            type="monotone"
            dot={false}
            activeDot={false}
            isAnimationActive={false}
          />
        )}
        <Area
          dataKey="theta"
          stroke="var(--color-chart-1)"
          strokeWidth={2}
          fill="url(#thetaGrad)"
          type="monotone"
          dot={(props: any) => {
            const { cx, cy, index } = props;
            if (cx == null || cy == null) return <></>;
            const entry = data[index];
            return (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r={4}
                fill={entry?.correct ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)"}
                stroke="var(--color-background)"
                strokeWidth={2}
              />
            );
          }}
          activeDot={{ r: 5, strokeWidth: 2 }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
