"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  getBusinessIdeaById,
  getFinancialProjection,
  saveFinancialProjection,
} from "@/app/actions/financial-projections"
import { ensureFinancialProjectionsTable } from "@/app/actions/financial-projections"

interface BusinessIdea {
  id: number
  title: string
  description: string
  budget_range: string
  location: string
  skills: string[]
  interests: string[]
  has_financial_projection: boolean
}

interface ExpenseItem {
  id: string
  name: string
  amount: number
}

interface RevenuePoint {
  month: number
  amount: number
}

export default function FinancialProjectionsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [idea, setIdea] = useState<BusinessIdea | null>(null)
  const [initialInvestment, setInitialInvestment] = useState(0)
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: "rent", name: "Rent", amount: 0 },
    { id: "utilities", name: "Utilities", amount: 0 },
    { id: "salaries", name: "Salaries", amount: 0 },
  ])
  const [revenue, setRevenue] = useState<RevenuePoint[]>([
    { month: 1, amount: 0 },
    { month: 2, amount: 0 },
    { month: 3, amount: 6, amount: 0 },
    { month: 12, amount: 0 },
  ])
  const [breakEvenPoint, setBreakEvenPoint] = useState<number | null>(null)
  const [profitMargin, setProfitMargin] = useState<number | null>(null)
  const [roiEstimate, setRoiEstimate] = useState<number | null>(null)
  const [cashFlowData, setCashFlowData] = useState<{ month: number; amount: number }[]>([])

  // Fetch business idea and financial projections
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Ensure the financial_projections table exists
        await ensureFinancialProjectionsTable()

        // Get business idea
        const ideaResult = await getBusinessIdeaById(Number.parseInt(params.id))
        if (!ideaResult.success) {
          toast({
            title: "Error",
            description: ideaResult.message || "Failed to load business idea",
            variant: "destructive",
          })
          router.push("/dashboard/saved-ideas")
          return
        }

        setIdea(ideaResult.idea)

        // Get financial projections if they exist
        if (ideaResult.idea.has_financial_projection) {
          const projectionResult = await getFinancialProjection(Number.parseInt(params.id))
          if (projectionResult.success) {
            const projection = projectionResult.projection

            // Set initial investment
            setInitialInvestment(projection.initialInvestment)

            // Set expenses
            const expenseItems: ExpenseItem[] = []
            for (const [key, value] of Object.entries(projection.monthlyExpenses)) {
              expenseItems.push({
                id: key,
                name: key.charAt(0).toUpperCase() + key.slice(1),
                amount: value as number,
              })
            }
            if (expenseItems.length > 0) {
              setExpenses(expenseItems)
            }

            // Set revenue
            const revenuePoints: RevenuePoint[] = []
            for (let i = 0; i < projection.revenueProjections.months.length; i++) {
              revenuePoints.push({
                month: projection.revenueProjections.months[i],
                amount: projection.revenueProjections.values[i],
              })
            }
            if (revenuePoints.length > 0) {
              setRevenue(revenuePoints)
            }

            // Set metrics
            setBreakEvenPoint(projection.breakEvenPoint)
            setProfitMargin(projection.profitMargin)
            setRoiEstimate(projection.roiEstimate)

            // Set cash flow data
            if (projection.cashFlowProjection) {
              const cashFlowPoints = []
              for (let i = 0; i < projection.cashFlowProjection.months.length; i++) {
                cashFlowPoints.push({
                  month: projection.cashFlowProjection.months[i],
                  amount: projection.cashFlowProjection.values[i],
                })
              }
              setCashFlowData(cashFlowPoints)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "An error occurred while loading data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  // Add a new expense item
  const addExpenseItem = () => {
    const newId = `expense-${Date.now()}`
    setExpenses([...expenses, { id: newId, name: "New Expense", amount: 0 }])
  }

  // Remove an expense item
  const removeExpenseItem = (id: string) => {
    setExpenses(expenses.filter((item) => item.id !== id))
  }

  // Update an expense item
  const updateExpenseItem = (id: string, field: "name" | "amount", value: string | number) => {
    setExpenses(
      expenses.map((item) => {
        if (item.id === id) {
          return { ...item, [field]: value }
        }
        return item
      }),
    )
  }

  // Add a new revenue point
  const addRevenuePoint = () => {
    // Find the next month that doesn't exist
    const existingMonths = revenue.map((point) => point.month)
    let nextMonth = 1
    while (existingMonths.includes(nextMonth)) {
      nextMonth++
    }

    // Insert the new point in order
    const newRevenue = [...revenue, { month: nextMonth, amount: 0 }]
    newRevenue.sort((a, b) => a.month - b.month)
    setRevenue(newRevenue)
  }

  // Remove a revenue point
  const removeRevenuePoint = (month: number) => {
    setRevenue(revenue.filter((point) => point.month !== month))
  }

  // Update a revenue point
  const updateRevenuePoint = (month: number, field: "month" | "amount", value: number) => {
    setRevenue(
      revenue.map((point) => {
        if (point.month === month) {
          return { ...point, [field]: value }
        }
        return point
      }),
    )
  }

  // Calculate financial metrics
  const calculateFinancials = () => {
    // Calculate total monthly expenses
    const totalMonthlyExpenses = expenses.reduce((sum, item) => sum + item.amount, 0)

    // Sort revenue points by month
    const sortedRevenue = [...revenue].sort((a, b) => a.month - b.month)

    // Calculate cumulative cash flow
    const cashFlow = []
    let runningTotal = -initialInvestment

    for (const point of sortedRevenue) {
      const monthlyRevenue = point.amount
      const monthlyProfit = monthlyRevenue - totalMonthlyExpenses
      runningTotal += monthlyProfit
      cashFlow.push({ month: point.month, amount: runningTotal })
    }

    setCashFlowData(cashFlow)

    // Find break-even point (first month where cumulative cash flow becomes positive)
    const breakEvenMonth = cashFlow.find((point) => point.amount >= 0)
    setBreakEvenPoint(breakEvenMonth ? breakEvenMonth.month : null)

    // Calculate profit margin based on the last month's revenue
    const lastMonth = sortedRevenue[sortedRevenue.length - 1]
    if (lastMonth && lastMonth.amount > 0) {
      const margin = ((lastMonth.amount - totalMonthlyExpenses) / lastMonth.amount) * 100
      setProfitMargin(Number.parseFloat(margin.toFixed(2)))
    } else {
      setProfitMargin(null)
    }

    // Calculate ROI after 12 months
    const month12 = sortedRevenue.find((point) => point.month === 12)
    if (month12 && initialInvestment > 0) {
      const annualRevenue = month12.amount * 12
      const annualExpenses = totalMonthlyExpenses * 12
      const annualProfit = annualRevenue - annualExpenses
      const roi = (annualProfit / initialInvestment) * 100
      setRoiEstimate(Number.parseFloat(roi.toFixed(2)))
    } else {
      setRoiEstimate(null)
    }
  }

  // Save financial projections
  const saveProjections = async () => {
    if (!idea) return

    setIsSaving(true)
    try {
      // Convert expenses to object
      const expensesObject: { [key: string]: number } = {}
      expenses.forEach((item) => {
        expensesObject[item.id] = item.amount
      })

      // Sort revenue by month
      const sortedRevenue = [...revenue].sort((a, b) => a.month - b.month)

      // Convert revenue to arrays
      const revenueProjections = {
        months: sortedRevenue.map((point) => point.month),
        values: sortedRevenue.map((point) => point.amount),
      }

      const result = await saveFinancialProjection(idea.id, {
        initialInvestment,
        monthlyExpenses: expensesObject,
        revenueProjections,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Financial projections saved successfully",
        })

        // Update local state with calculated values
        if (result.projection) {
          setBreakEvenPoint(result.projection.breakEvenPoint)
          setProfitMargin(result.projection.profitMargin)
          setRoiEstimate(result.projection.roiEstimate)

          // Update cash flow data
          if (result.projection.cashFlowProjection) {
            const cashFlowPoints = []
            for (let i = 0; i < result.projection.cashFlowProjection.months.length; i++) {
              cashFlowPoints.push({
                month: result.projection.cashFlowProjection.months[i],
                amount: result.projection.cashFlowProjection.values[i],
              })
            }
            setCashFlowData(cashFlowPoints)
          }
        }
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to save financial projections",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving projections:", error)
      toast({
        title: "Error",
        description: "An error occurred while saving projections",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading financial projections...</p>
        </div>
      </div>
    )
  }

  if (!idea) {
    return (
      <div className="container py-12">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>Business idea not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/dashboard/saved-ideas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Saved Ideas
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Financial Projections</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{idea.title}</CardTitle>
          <CardDescription>{idea.description}</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="input" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="input">Input Data</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="metrics">Key Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Initial Investment</CardTitle>
                <CardDescription>Enter the initial amount needed to start this business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="initialInvestment" className="min-w-[100px]">
                    Amount (KES)
                  </Label>
                  <Input
                    id="initialInvestment"
                    type="number"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Number.parseFloat(e.target.value) || 0)}
                    className="max-w-[200px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
                <CardDescription>Enter your estimated monthly operating expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenses.map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Input
                        value={item.name}
                        onChange={(e) => updateExpenseItem(item.id, "name", e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateExpenseItem(item.id, "amount", Number.parseFloat(e.target.value) || 0)}
                        className="w-[150px]"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExpenseItem(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={addExpenseItem} className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Projections</CardTitle>
                <CardDescription>Enter your estimated monthly revenue at different time points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenue.map((point) => (
                    <div key={point.month} className="flex items-center space-x-2">
                      <Label className="min-w-[100px]">Month {point.month}</Label>
                      <Input
                        type="number"
                        value={point.amount}
                        onChange={(e) =>
                          updateRevenuePoint(point.month, "amount", Number.parseFloat(e.target.value) || 0)
                        }
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRevenuePoint(point.month)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" size="sm" onClick={addRevenuePoint} className="mt-2">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Month
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between">
              <Button variant="outline" onClick={calculateFinancials}>
                Calculate Financials
              </Button>
              <Button onClick={saveProjections} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Projections
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="charts">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Projection</CardTitle>
                <CardDescription>Monthly revenue over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenue
                      .sort((a, b) => a.month - b.month)
                      .map((point) => ({
                        month: point.month,
                        revenue: point.amount,
                      }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: "Month", position: "insideBottomRight", offset: -5 }} />
                    <YAxis label={{ value: "KES", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`KES ${value}`, "Revenue"]} />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Projection</CardTitle>
                <CardDescription>Cumulative cash flow over time</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={cashFlowData.sort((a, b) => a.month - b.month)}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" label={{ value: "Month", position: "insideBottomRight", offset: -5 }} />
                    <YAxis label={{ value: "KES", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`KES ${value}`, "Cash Flow"]} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                      dot={{ stroke: "#82ca9d", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
                <CardDescription>Breakdown of monthly expenses</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expenses.map((item) => ({
                      name: item.name,
                      amount: item.amount,
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: "KES", angle: -90, position: "insideLeft" }} />
                    <Tooltip formatter={(value) => [`KES ${value}`, "Amount"]} />
                    <Legend />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Break-Even Point</CardTitle>
                <CardDescription>When your business will start making a profit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {breakEvenPoint ? `${breakEvenPoint} months` : "Not calculated"}
                </div>
                <p className="text-muted-foreground mt-2">
                  {breakEvenPoint
                    ? `Your business is projected to break even after ${breakEvenPoint} months of operation.`
                    : "Calculate your financials to see when your business will break even."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profit Margin</CardTitle>
                <CardDescription>Percentage of revenue that is profit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {profitMargin !== null ? `${profitMargin.toFixed(1)}%` : "Not calculated"}
                </div>
                <p className="text-muted-foreground mt-2">
                  {profitMargin !== null
                    ? `Your business is projected to have a ${profitMargin.toFixed(1)}% profit margin.`
                    : "Calculate your financials to see your projected profit margin."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Return on Investment (ROI)</CardTitle>
                <CardDescription>Annual return on your initial investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {roiEstimate !== null ? `${roiEstimate.toFixed(1)}%` : "Not calculated"}
                </div>
                <p className="text-muted-foreground mt-2">
                  {roiEstimate !== null
                    ? `Your business is projected to generate a ${roiEstimate.toFixed(1)}% return on investment annually.`
                    : "Calculate your financials to see your projected ROI."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Initial Investment</CardTitle>
                <CardDescription>Capital required to start the business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">KES {initialInvestment.toLocaleString()}</div>
                <p className="text-muted-foreground mt-2">
                  This is the estimated capital required to start your business.
                </p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
                <CardDescription>Total recurring monthly costs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  KES {expenses.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                </div>
                <div className="mt-4 space-y-2">
                  {expenses.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name}</span>
                      <span>KES {item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
