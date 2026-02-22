import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { ArrowUpDown, TrendingUp, TrendingDown } from "lucide-react";
import { mockModels } from "@/app/data/mock-data";
import { useState } from "react";

type SortField = "accuracy" | "latency" | "cost" | "totalEvaluations";
type SortDirection = "asc" | "desc";

export function ComparisonPage() {
  const [sortField, setSortField] = useState<SortField>("accuracy");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "latency" || field === "cost" ? "asc" : "desc");
    }
  };
  
  const sortedModels = [...mockModels].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const modifier = sortDirection === "asc" ? 1 : -1;
    return (aValue - bValue) * modifier;
  });
  
  const getPerformanceBadge = (accuracy: number) => {
    if (accuracy >= 92) return <Badge className="bg-green-500">Excellent</Badge>;
    if (accuracy >= 88) return <Badge className="bg-blue-500">Good</Badge>;
    if (accuracy >= 85) return <Badge className="bg-yellow-500">Average</Badge>;
    return <Badge variant="secondary">Poor</Badge>;
  };
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900">Model Comparison</h2>
        <p className="text-gray-500 mt-2">Compare performance metrics across all LLM models</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Comparison</CardTitle>
          <CardDescription>
            Click column headers to sort
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Model</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("accuracy")}
                  >
                    <div className="flex items-center gap-2">
                      Accuracy
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("latency")}
                  >
                    <div className="flex items-center gap-2">
                      Latency
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("cost")}
                  >
                    <div className="flex items-center gap-2">
                      Cost
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("totalEvaluations")}
                  >
                    <div className="flex items-center gap-2">
                      Evaluations
                      <ArrowUpDown className="h-4 w-4" />
                    </div>
                  </TableHead>
                  <TableHead>Performance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedModels.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell className="font-medium">{model.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{model.accuracy}%</span>
                        {model.accuracy >= 90 && (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{model.latency}ms</span>
                        {model.latency < 700 && (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>${model.cost.toFixed(4)}</span>
                        {model.cost < 0.01 && (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{model.totalEvaluations}</TableCell>
                    <TableCell>{getPerformanceBadge(model.accuracy)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* Comparison Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Best Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {Math.max(...mockModels.map(m => m.accuracy))}%
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {mockModels.find(m => m.accuracy === Math.max(...mockModels.map(m => m.accuracy)))?.name}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lowest Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              {Math.min(...mockModels.map(m => m.latency))}ms
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {mockModels.find(m => m.latency === Math.min(...mockModels.map(m => m.latency)))?.name}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Cost-Effective</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">
              ${Math.min(...mockModels.map(m => m.cost)).toFixed(5)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {mockModels.find(m => m.cost === Math.min(...mockModels.map(m => m.cost)))?.name}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
