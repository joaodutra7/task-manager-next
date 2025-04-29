"use client"

import { Card } from "@/components/ui/card"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const data = [
  { name: "Mon", completed: 3, created: 5 },
  { name: "Tue", completed: 5, created: 4 },
  { name: "Wed", completed: 4, created: 6 },
  { name: "Thu", completed: 6, created: 4 },
  { name: "Fri", completed: 7, created: 3 },
  { name: "Sat", completed: 2, created: 2 },
  { name: "Sun", completed: 1, created: 3 },
]

export function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))", 
            borderColor: "hsl(var(--border))",
            borderRadius: "var(--radius)" 
          }}
          itemStyle={{ color: "hsl(var(--foreground))" }}
          labelStyle={{ color: "hsl(var(--foreground))" }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="created"
          stroke="hsl(var(--chart-1))"
          activeDot={{ r: 8 }}
          strokeWidth={2}
        />
        <Line 
          type="monotone" 
          dataKey="completed" 
          stroke="hsl(var(--chart-2))" 
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}