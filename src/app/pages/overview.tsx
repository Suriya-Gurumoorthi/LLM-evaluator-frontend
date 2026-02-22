import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, DollarSign, Target, Zap } from "lucide-react";
import { mockModels, mockEvaluations } from "@/app/data/mock-data";

export function OverviewPage() {
  const totalEvaluations = mockEvaluations.length;
  const avgAccuracy = mockModels.reduce((sum, m) => sum + m.accuracy, 0) / mockModels.length;
  const avgLatency = mockModels.reduce((sum, m) => sum + m.latency, 0) / mockModels.length;
  const avgCost = mockModels.reduce((sum, m) => sum + m.cost, 0) / mockModels.length;
  
  const metrics = [
    {
      title: "Average Accuracy",
      value: `${avgAccuracy.toFixed(1)}%`,
      icon: Target,
      trend: "+2.5%",
      trendUp: true,
      description: "vs last week",
    },
    {
      title: "Average Latency",
      value: `${avgLatency.toFixed(0)}ms`,
      icon: Clock,
      trend: "-12ms",
      trendUp: true,
      description: "vs last week",
    },
    {
      title: "Average Cost",
      value: `$${avgCost.toFixed(4)}`,
      icon: DollarSign,
      trend: "-$0.002",
      trendUp: true,
      description: "per 1K tokens",
    },
    {
      title: "Total Evaluations",
      value: totalEvaluations.toString(),
      icon: Zap,
      trend: "+3",
      trendUp: true,
      description: "this week",
    },
  ];
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900">Overview</h2>
        <p className="text-gray-500 mt-2">Monitor LLM performance across all models</p>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {metric.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                  {metric.trendUp ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={metric.trendUp ? "text-green-600" : "text-red-600"}>
                    {metric.trend}
                  </span>
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Models Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Models</CardTitle>
            <CardDescription>Based on accuracy scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockModels
                .sort((a, b) => b.accuracy - a.accuracy)
                .slice(0, 3)
                .map((model, index) => (
                  <div key={model.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{model.name}</p>
                        <p className="text-sm text-gray-500">{model.totalEvaluations} evaluations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{model.accuracy}%</p>
                      <p className="text-xs text-gray-500">accuracy</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Evaluations</CardTitle>
            <CardDescription>Latest test results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockEvaluations.slice(0, 3).map((evaluation) => (
                <div key={evaluation.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{evaluation.testName}</p>
                    <p className="text-sm text-gray-500">{evaluation.modelName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={evaluation.status === "completed" ? "default" : "secondary"}
                    >
                      {evaluation.status}
                    </Badge>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{evaluation.accuracy}%</p>
                      <p className="text-xs text-gray-500">score: {evaluation.score}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
