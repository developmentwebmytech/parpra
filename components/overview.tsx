"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"

export function Overview() {
  const [data, setData] = useState<{ name: string; total: number }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/sale")
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Failed to fetch sales data", error)
      }
    }

    fetchData()
  }, [])

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            const width = window.innerWidth
            if (width < 500) {
              return ["Jan", "Apr", "Jul", "Oct"].includes(value) ? value : ""
            } else if (width < 768) {
              return ["Jan", "Mar", "May", "Jul", "Sep", "Nov"].includes(value) ? value : ""
            }
            return value
          }}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip
          formatter={(value) => [`₹ ${Number(value).toFixed(2)}`, "Revenue"]}
          labelFormatter={(label) => `Month: ${label}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
