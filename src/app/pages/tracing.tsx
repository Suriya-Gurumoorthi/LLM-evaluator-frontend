import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, Search, AlertTriangle, Eye } from "lucide-react";
import { mockTraces } from "@/app/data/mock-data";
import { useState } from "react";

export function TracingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [selectedTrace, setSelectedTrace] = useState<typeof mockTraces[0] | null>(null);
  
  const filteredTraces = mockTraces.filter(trace => {
    const matchesSearch = 
      trace.userQuery.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trace.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || trace.status === statusFilter;
    const matchesModel = modelFilter === "all" || trace.model === modelFilter;
    
    return matchesSearch && matchesStatus && matchesModel;
  });
  
  const getStatusIcon = (status: string) => {
    if (status === "success") return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    if (status === "error") return <XCircle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-yellow-600" />;
  };
  
  const getLatencyColor = (latency: number) => {
    if (latency < 500) return "text-green-600";
    if (latency < 1500) return "text-yellow-600";
    return "text-red-600";
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  
  const totalTraces = mockTraces.length;
  const successRate = ((mockTraces.filter(t => t.status === "success").length / totalTraces) * 100).toFixed(1);
  const avgLatency = (mockTraces.reduce((sum, t) => sum + t.latency, 0) / totalTraces).toFixed(0);
  const totalCost = mockTraces.reduce((sum, t) => sum + t.cost, 0).toFixed(4);
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-semibold text-gray-900">Production Tracing</h2>
        <p className="text-gray-500 mt-2">Monitor real-time LLM API calls in your production environment</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalTraces}</div>
            <p className="text-xs text-gray-500 mt-1">Last 24 hours</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {mockTraces.filter(t => t.status === "success").length} successful
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Latency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{avgLatency}ms</div>
            <p className="text-xs text-gray-500 mt-1">Response time</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">${totalCost}</div>
            <p className="text-xs text-gray-500 mt-1">API usage cost</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Traces</CardTitle>
          <CardDescription>Search and filter production API calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by query or trace ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                <SelectItem value="GPT-4">GPT-4</SelectItem>
                <SelectItem value="GPT-3.5 Turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="Claude 3 Opus">Claude 3 Opus</SelectItem>
                <SelectItem value="Claude 3 Sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="Gemini Pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* Traces List */}
      <div className="space-y-4">
        {filteredTraces.map((trace) => (
          <Card key={trace.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(trace.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-gray-500">{trace.id}</span>
                      <Badge variant="outline">{trace.model}</Badge>
                      {trace.status === "error" && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Error
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{formatTimestamp(trace.timestamp)}</p>
                    <p className="font-medium text-gray-900 line-clamp-2">{trace.userQuery}</p>
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <button 
                      className="ml-4 flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      onClick={() => setSelectedTrace(trace)}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        {getStatusIcon(trace.status)}
                        Trace Details: {trace.id}
                      </DialogTitle>
                      <DialogDescription>
                        {formatTimestamp(trace.timestamp)} • {trace.model}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 mt-4">
                      {/* User Query */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">User Query</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-900">{trace.userQuery}</p>
                        </div>
                      </div>
                      
                      {/* System Prompt */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">System Prompt</h4>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-700">{trace.systemPrompt}</p>
                        </div>
                      </div>
                      
                      {/* Output */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">LLM Response</h4>
                        <div className="bg-green-50 p-4 rounded-lg">
                          {trace.status === "error" ? (
                            <div className="text-red-600">
                              <p className="font-semibold mb-1">Error: {trace.error}</p>
                              <p className="text-sm">Status Code: {trace.statusCode}</p>
                            </div>
                          ) : (
                            <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">{trace.output}</pre>
                          )}
                        </div>
                      </div>
                      
                      {/* Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Latency</p>
                          <p className={`text-lg font-semibold ${getLatencyColor(trace.latency)}`}>
                            {trace.latency}ms
                          </p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Cost</p>
                          <p className="text-lg font-semibold text-gray-900">${trace.cost.toFixed(4)}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Input Tokens</p>
                          <p className="text-lg font-semibold text-gray-900">{trace.tokens.input}</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-xs text-gray-600 mb-1">Output Tokens</p>
                          <p className="text-lg font-semibold text-gray-900">{trace.tokens.output}</p>
                        </div>
                      </div>
                      
                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-gray-600">User ID</p>
                          <p className="text-sm font-medium text-gray-900">{trace.userId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Session ID</p>
                          <p className="text-sm font-medium text-gray-900">{trace.sessionId}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Environment</p>
                          <Badge>{trace.environment}</Badge>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Status Code</p>
                          <p className="text-sm font-medium text-gray-900">{trace.statusCode}</p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              {/* Quick Metrics */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Latency</p>
                  <p className={`text-sm font-semibold ${getLatencyColor(trace.latency)}`}>
                    {trace.latency}ms
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cost</p>
                  <p className="text-sm font-semibold text-gray-900">${trace.cost.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tokens</p>
                  <p className="text-sm font-semibold text-gray-900">{trace.tokens.total}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">User</p>
                  <p className="text-sm font-semibold text-gray-900">{trace.userId}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredTraces.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No traces found matching your filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
