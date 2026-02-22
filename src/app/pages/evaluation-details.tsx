import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { mockEvaluations } from "@/app/data/mock-data";
import { useState } from "react";

export function EvaluationDetailsPage() {
  const [filter, setFilter] = useState<string>("all");
  
  const filteredEvaluations = filter === "all" 
    ? mockEvaluations 
    : mockEvaluations.filter(e => e.status === filter);
  
  const getStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === "running") return <Clock className="h-5 w-5 text-blue-600" />;
    return <AlertCircle className="h-5 w-5 text-red-600" />;
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 8.5) return "text-green-600";
    if (score >= 7) return "text-blue-600";
    if (score >= 5) return "text-yellow-600";
    return "text-red-600";
  };
  
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">Evaluation Details</h2>
          <p className="text-gray-500 mt-2">View detailed results for all evaluations</p>
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Evaluations</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="running">Running</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-6">
        {filteredEvaluations.map((evaluation) => (
          <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(evaluation.status)}
                    <CardTitle>{evaluation.testName}</CardTitle>
                    <Badge variant="outline">{evaluation.modelName}</Badge>
                  </div>
                  <CardDescription>
                    Evaluated on {new Date(evaluation.date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </CardDescription>
                </div>
                
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getScoreColor(evaluation.score)}`}>
                    {evaluation.score}
                  </div>
                  <p className="text-sm text-gray-500">Score</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Accuracy</span>
                    <span className="font-semibold text-gray-900">{evaluation.accuracy}%</span>
                  </div>
                  <Progress value={evaluation.accuracy} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Overall Score</span>
                    <span className="font-semibold text-gray-900">{(evaluation.score / 10 * 100).toFixed(0)}%</span>
                  </div>
                  <Progress value={evaluation.score / 10 * 100} className="h-2" />
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge 
                      className="mt-1"
                      variant={evaluation.status === "completed" ? "default" : "secondary"}
                    >
                      {evaluation.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Test ID</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">#{evaluation.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Model</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{evaluation.modelName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Type</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{evaluation.testName}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredEvaluations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No evaluations found with the selected filter.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
