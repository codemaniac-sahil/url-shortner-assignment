import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock data for demonstration
const timeSeriesData = [
  { date: 'Jan 1', visits: 120 },
  { date: 'Jan 5', visits: 190 },
  { date: 'Jan 10', visits: 300 },
  { date: 'Jan 15', visits: 500 },
  { date: 'Jan 20', visits: 200 },
  { date: 'Jan 25', visits: 300 },
  { date: 'Jan 30', visits: 450 },
];

const deviceData = [
  { name: 'Desktop', value: 45, color: '#3B82F6' },
  { name: 'Mobile', value: 40, color: '#10B981' },
  { name: 'Tablet', value: 15, color: '#F59E0B' },
];

export default function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Time Series Chart */}
      <Card className="border border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg font-medium text-slate-900">Clicks Over Time</CardTitle>
          <p className="text-sm text-slate-600">Daily click statistics for the last 30 days</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b"
                  fontSize={12}
                />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Device Type Breakdown */}
      <Card className="border border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg font-medium text-slate-900">Device Types</CardTitle>
          <p className="text-sm text-slate-600">Breakdown of clicks by device category</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
