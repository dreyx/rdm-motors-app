"use client"

import useSWR from "swr"
import { AdminVehicleList } from "@/components/admin-vehicle-list"
import { AddVehicleForm } from "@/components/add-vehicle-form"
import { LogoutButton } from "@/components/logout-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { RefreshCw, Loader2, Eye, TrendingUp, TrendingDown, DollarSign, Car, Clock, CheckCircle2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  trim: string | null
  price: number
  mileage: number
  status: string
  description: string | null
  vin: string | null
  stock_number: string | null
  body_style: string | null
  condition: string | null
  title_status: string | null
  engine: string | null
  transmission: string | null
  drivetrain: string | null
  fuel_type: string | null
  exterior_color: string | null
  interior_color: string | null
  image_url: string | null
  images: string[]
}

interface Analytics {
  totalPageViews: number
  totalVehicleClicks: number
  inventoryValue: number
  totalSalesValue: number
  availableCount: number
  soldCount: number
  totalCount: number
  salesGrowth: number
  avgDaysOnLot: number
  inventoryStatus: Array<{ name: string; value: number }>
  salesByMonth: Array<{ month: string; sales: number; revenue: number }>
  recentActivity: Array<{ date: string; views: number; inquiries: number }>
  topVehicles: Array<{
    vehicleId: string
    clicks: number
    vehicle: string
  }>
}

const COLORS = ['#22c55e', '#ef4444'];

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" })

  if (!res.ok) {
    if (res.status === 401) {
      window.location.href = "/admin/login"
      throw new Error("Unauthorized")
    }
    throw new Error("Failed to load data")
  }

  const data = await res.json()
  return data
}

export function AdminDashboard() {
  const {
    data: vehiclesData,
    error: vehiclesError,
    isLoading: vehiclesLoading,
    mutate: mutateVehicles,
  } = useSWR<{ vehicles: Vehicle[] }>("/api/admin/vehicles", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    shouldRetryOnError: true,
    errorRetryCount: 3,
    errorRetryInterval: 2000,
    dedupingInterval: 5000,
  })

  const vehicles = vehiclesData?.vehicles || []

  const {
    data: analytics,
    error: analyticsError,
    isLoading: analyticsLoading,
    mutate: mutateAnalytics,
  } = useSWR<Analytics>("/api/admin/analytics", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000,
  })

  const isLoading = vehiclesLoading || analyticsLoading
  const error = vehiclesError || analyticsError

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleRefresh = () => {
    mutateVehicles()
    mutateAnalytics()
  }

  return (
    <>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Sales performance and inventory management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <LogoutButton />
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Management</TabsTrigger>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics ? formatCurrency(analytics.totalSalesValue) : "..."}</div>
                <div className="flex items-center gap-1 mt-1">
                  {analytics && analytics.salesGrowth >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <p className={`text-xs ${analytics?.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analytics ? `${analytics.salesGrowth >= 0 ? '+' : ''}${analytics.salesGrowth}% from last month` : '...'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vehicles Sold</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.soldCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.totalCount || 0} total vehicles tracked
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Inventory</CardTitle>
                <Car className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.availableCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics ? formatCurrency(analytics.inventoryValue) : '...'} inventory value
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Days on Lot</CardTitle>
                <Clock className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.avgDaysOnLot || "..."}</div>
                <p className="text-xs text-muted-foreground">Target: under 30 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {/* Sales Chart */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Monthly Sales</CardTitle>
                <CardDescription>Vehicles sold over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {analytics && (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.salesByMonth}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number, name: string) => [
                            name === 'revenue' ? formatCurrency(value) : value,
                            name === 'revenue' ? 'Revenue' : 'Vehicles Sold'
                          ]}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Inventory Status */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Available vs Sold vehicles</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.inventoryStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {analytics.inventoryStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.name === 'sold' ? '#ef4444' : '#22c55e'} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <text x={"50%"} y={"50%"} dy={8} textAnchor="middle" fill="#333" className="text-xl font-bold">
                          {analytics.totalCount}
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                      {analytics.inventoryStatus.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${entry.name === 'sold' ? 'bg-red-500' : 'bg-green-500'}`} />
                          <span className="text-sm font-medium capitalize">{entry.name} ({entry.value})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Website Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Website Activity</CardTitle>
              <CardDescription>Daily views and inquiries over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {analytics && (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.recentActivity}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Page Views" />
                      <Line type="monotone" dataKey="inquiries" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} name="Inquiries" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Total sales revenue by month</CardDescription>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.salesByMonth}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Performing Vehicles */}
            <Card>
              <CardHeader>
                <CardTitle>Most Viewed Vehicles</CardTitle>
                <CardDescription>Listings getting the most attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analytics?.topVehicles.map((vehicle, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 font-bold text-slate-600 text-sm">
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{vehicle.vehicle}</p>
                          <p className="text-xs text-muted-foreground mt-1">ID: {vehicle.vehicleId.slice(0, 8)}...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{vehicle.clicks}</span>
                        <p className="text-xs text-muted-foreground">views</p>
                      </div>
                    </div>
                  ))}
                  {(!analytics?.topVehicles || analytics.topVehicles.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">No vehicle data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <AddVehicleForm onSuccess={() => mutateVehicles()} />
            </div>

            <div className="lg:col-span-2">
              {vehiclesLoading ? (
                <div className="bg-white rounded-xl border border-neutral-200 p-12 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-red-600 animate-spin mb-4" />
                  <p className="text-neutral-600">Loading inventory...</p>
                </div>
              ) : (
                <AdminVehicleList vehicles={vehicles} onUpdate={() => mutateVehicles()} />
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
