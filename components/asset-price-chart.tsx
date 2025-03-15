"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface PriceData {
  timestamp: string
  price: number
}

interface AssetPriceChartProps {
  assetId: string
  assetType: "stock" | "crypto" | "insurance"
}

export function AssetPriceChart({ assetId, assetType }: AssetPriceChartProps) {
  const [timeRange, setTimeRange] = useState<"1D" | "1W" | "1M" | "1Y">("1M")
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPriceHistory = async () => {
      setIsLoading(true)
      try {
        // Simulate API call for price history
        // In a real app, you would fetch this from your backend
        const now = new Date()
        const data: PriceData[] = []
        
        // Generate mock data based on time range
        const points = timeRange === "1D" ? 24 : timeRange === "1W" ? 7 : timeRange === "1M" ? 30 : 365
        const interval = timeRange === "1D" ? 60 * 60 * 1000 : // 1 hour
                        timeRange === "1W" ? 24 * 60 * 60 * 1000 : // 1 day
                        timeRange === "1M" ? 24 * 60 * 60 * 1000 : // 1 day
                        7 * 24 * 60 * 60 * 1000 // 1 week
        
        for (let i = points - 1; i >= 0; i--) {
          const timestamp = new Date(now.getTime() - (i * interval))
          const basePrice = assetType === "crypto" ? 40000 : 1000 // Mock base price
          const volatility = assetType === "crypto" ? 0.1 : 0.03 // Mock volatility
          const randomChange = (Math.random() - 0.5) * volatility
          const price = basePrice * (1 + randomChange)
          
          data.push({
            timestamp: timestamp.toISOString(),
            price: price
          })
        }
        
        setPriceData(data)
      } catch (error) {
        console.error("Error fetching price history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPriceHistory()
  }, [assetId, assetType, timeRange])

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    if (timeRange === "1D") {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
  }

  return (
    <Card className="p-4">
      <Tabs defaultValue="1M" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="1D" onClick={() => setTimeRange("1D")}>1D</TabsTrigger>
          <TabsTrigger value="1W" onClick={() => setTimeRange("1W")}>1W</TabsTrigger>
          <TabsTrigger value="1M" onClick={() => setTimeRange("1M")}>1M</TabsTrigger>
          <TabsTrigger value="1Y" onClick={() => setTimeRange("1Y")}>1Y</TabsTrigger>
        </TabsList>

        <div className="h-[200px] w-full">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              Loading...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceData}>
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatDate}
                  minTickGap={30}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tickFormatter={formatPrice}
                />
                <Tooltip
                  labelFormatter={formatDate}
                  formatter={(value: number) => [formatPrice(value), 'Price']}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Tabs>
    </Card>
  )
}
