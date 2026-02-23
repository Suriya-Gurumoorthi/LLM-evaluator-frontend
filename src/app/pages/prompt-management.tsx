import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Slider } from "@/app/components/ui/slider";
import { Badge } from "@/app/components/ui/badge";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Target,
  Sparkles,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL ?? "https://llm-evaluator-backend.onrender.com/api/v1";

const DOMAINS = [
  { id: "coding", name: "Coding", description: "Programming and software development" },
  { id: "reasoning", name: "Reasoning", description: "Logical reasoning and problem solving" },
  { id: "mathematics", name: "Mathematics", description: "Mathematical problem solving" },
  { id: "writing", name: "Writing", description: "Creative and technical writing" },
  { id: "analysis", name: "Analysis", description: "Data analysis and interpretation" },
  { id: "communication", name: "Communication", description: "Verbal and written communication" },
];

const LLMS = [
  { id: "gemini_1_5_flash", name: "Gemini 1.5 Flash", provider: "google", apiKeyLabel: "Google (Gemini) API Key" },
  { id: "gemini_2_5_flash", name: "Gemini 2.5 Flash", provider: "google", apiKeyLabel: "Google (Gemini) API Key" },
  { id: "gemini_2_5_flash_lite", name: "Gemini 2.5 Flash Lite", provider: "google", apiKeyLabel: "Google (Gemini) API Key" },
  { id: "mistral", name: "Mistral Small", provider: "mistral", apiKeyLabel: "Mistral API Key" },
  { id: "deepseek", name: "DeepSeek Chat", provider: "deepseek", apiKeyLabel: "DeepSeek API Key" },
  { id: "openai_gpt4_mini", name: "OpenAI GPT 4.1 Mini", provider: "openai", apiKeyLabel: "OpenAI API Key" },
  { id: "openai_gpt5_mini", name: "OpenAI GPT 5 Mini", provider: "openai", apiKeyLabel: "OpenAI API Key" },
];

const COMMON_RUBRICS = [
  { id: "coding", name: "Coding", description: "Code quality, correctness, and best practices" },
  { id: "reasoning", name: "Reasoning", description: "Logical reasoning and problem-solving approach" },
  { id: "problem-solving", name: "Problem Solving", description: "Ability to break down and solve complex problems" },
  { id: "clarity", name: "Clarity", description: "Clear and understandable explanations" },
  { id: "completeness", name: "Completeness", description: "Thoroughness and attention to detail" },
  { id: "creativity", name: "Creativity", description: "Innovative and creative solutions" },
  { id: "accuracy", name: "Accuracy", description: "Correctness of information and results" },
  { id: "efficiency", name: "Efficiency", description: "Optimal use of resources and time" },
];

interface Rubric {
  id: string;
  name: string;
  description?: string;
  weight: number;
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput?: string;
}

// --- Judge result types ---

interface OutputJudgeTestCaseScore {
  test_case_index: number;
  correctness: number;
  relevance: number;
  completeness: number;
  overall_score: number;
  feedback: string;
}

interface OutputJudgeResult {
  test_case_scores: OutputJudgeTestCaseScore[];
  overall_score: number;
  overall_feedback: string;
}

interface PromptJudgeRubricScore {
  rubric_id: string;
  rubric_name: string;
  score: number;
  feedback: string;
}

interface PromptJudgeResult {
  rubric_scores: PromptJudgeRubricScore[];
  overall_score: number;
  overall_feedback: string;
}

interface TestCaseResultData {
  test_case_index: number;
  input: string;
  expected_output?: string;
  generated_output?: string;
  generation_success: boolean;
  error?: string;
}

interface AnalysisResults {
  testCaseResults: TestCaseResultData[];
  outputJudge: OutputJudgeResult;
  promptJudge: PromptJudgeResult;
}

// --- Score color helpers ---

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-500";
  return "text-red-600";
}

function scoreBg(score: number): string {
  if (score >= 80) return "bg-green-600";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function scoreBadgeVariant(score: number): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 70) return "default";
  if (score >= 40) return "secondary";
  return "destructive";
}

// =======================================================================

export function PromptManagementPage() {
  const [currentPhase, setCurrentPhase] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedLLM, setSelectedLLM] = useState<string>("");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    google: "",
    mistral: "",
    deepseek: "",
    openai: "",
  });
  const [testCases, setTestCases] = useState<TestCase[]>([{ id: "1", input: "", expectedOutput: "" }]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [evaluationId, setEvaluationId] = useState<string | null>(null);
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [keyValidationResult, setKeyValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [expandedTestCases, setExpandedTestCases] = useState<Set<number>>(new Set());

  // ---------- Phase 1 handlers ----------

  const handleDomainSelect = (domainId: string) => setSelectedDomain(domainId);

  const handleAddRubric = (rubricId: string) => {
    if (rubrics.find((r) => r.id === rubricId)) return;
    const rubric = COMMON_RUBRICS.find((r) => r.id === rubricId);
    if (rubric) {
      setRubrics([...rubrics, { ...rubric, weight: 0 }]);
    }
  };

  const handleRemoveRubric = (rubricId: string) => {
    setRubrics(rubrics.filter((r) => r.id !== rubricId));
  };

  const handleWeightChange = (rubricId: string, weight: number[]) => {
    setRubrics(rubrics.map((r) => (r.id === rubricId ? { ...r, weight: weight[0] } : r)));
  };

  const totalWeight = rubrics.reduce((sum, r) => sum + r.weight, 0);
  const isPhase1Complete = selectedDomain && rubrics.length > 0 && totalWeight === 100;

  // ---------- Phase 2 handlers ----------

  const handleAddTestCase = () => {
    setTestCases([...testCases, { id: Date.now().toString(), input: "", expectedOutput: "" }]);
  };

  const handleRemoveTestCase = (id: string) => {
    if (testCases.length > 1) setTestCases(testCases.filter((tc) => tc.id !== id));
  };

  const handleTestCaseChange = (id: string, field: "input" | "expectedOutput", value: string) => {
    setTestCases(testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc)));
  };

  const selectedLLMConfig = LLMS.find((llm) => llm.id === selectedLLM);
  const selectedProvider = selectedLLMConfig?.provider ?? "";
  const selectedApiKey = selectedProvider ? apiKeys[selectedProvider] ?? "" : "";

  const isPhase2Complete =
    prompt.trim() !== "" &&
    selectedLLM !== "" &&
    selectedApiKey.trim() !== "" &&
    testCases.every((tc) => tc.input.trim() !== "");

  const setApiKeyForProvider = (provider: string, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
    setKeyValidationResult(null);
  };

  const handleValidateApiKey = async () => {
    if (!selectedLLM || !selectedApiKey.trim()) return;
    setIsValidatingKey(true);
    setKeyValidationResult(null);
    try {
      const res = await fetch(`${API_BASE}/prompt-management/validate-api-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ llm_model: selectedLLM, api_key: selectedApiKey.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setKeyValidationResult({
          success: data.is_valid,
          message: data.message ?? (data.is_valid ? "API key is valid." : "Invalid API key."),
        });
      } else {
        setKeyValidationResult({ success: false, message: data.detail ?? data.message ?? "Validation failed." });
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Network error.";
      setKeyValidationResult({
        success: false,
        message: msg === "Failed to fetch"
          ? "Could not reach the backend. Start the backend and try again."
          : msg,
      });
    } finally {
      setIsValidatingKey(false);
    }
  };

  // ---------- Phase 3: Analyze ----------

  const handleAnalyze = async () => {
    if (!selectedLLM || !selectedApiKey.trim()) {
      setAnalysisError("Select an LLM and enter an API key.");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResults(null);
    try {
      let evalId = evaluationId;
      if (!evalId) {
        const submitBody = {
          domain_id: selectedDomain,
          rubrics: rubrics.map((r) => ({
            id: r.id,
            name: r.name,
            weight: r.weight,
            description: r.description || "",
          })),
          prompt: prompt.trim(),
          llm_model: selectedLLM,
          api_key: selectedApiKey.trim(),
          test_cases: testCases.map((tc) => ({
            id: tc.id,
            input: tc.input.trim(),
            expectedOutput: tc.expectedOutput?.trim() || undefined,
          })),
        };
        const submitRes = await fetch(`${API_BASE}/prompt-management/submit-evaluation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitBody),
        });
        const submitData = await submitRes.json();
        if (!submitRes.ok || !submitData.success || !submitData.evaluation_id) {
          setAnalysisError(submitData.message ?? "Failed to submit evaluation.");
          return;
        }
        evalId = submitData.evaluation_id;
        setEvaluationId(evalId);
      }

      const runRes = await fetch(`${API_BASE}/prompt-management/run-evaluation/${evalId}`, {
        method: "POST",
      });
      if (!runRes.ok) {
        const errData = await runRes.json().catch(() => ({}));
        setAnalysisError(errData.detail ?? "Failed to run evaluation.");
        return;
      }

      const resultsRes = await fetch(`${API_BASE}/prompt-management/evaluation-results/${evalId}`);
      if (!resultsRes.ok) {
        setAnalysisError("Failed to load evaluation results.");
        return;
      }
      const results = await resultsRes.json();

      const testCaseResults: TestCaseResultData[] = (results.test_case_results ?? []).map(
        (tc: any) => ({
          test_case_index: tc.test_case_index,
          input: tc.input,
          expected_output: tc.expected_output,
          generated_output: tc.generated_output,
          generation_success: tc.generation_success ?? tc.success ?? false,
          error: tc.error,
        }),
      );

      const outputJudge: OutputJudgeResult = results.output_judge_result ?? {
        test_case_scores: [],
        overall_score: 0,
        overall_feedback: "No output quality analysis available.",
      };

      const promptJudge: PromptJudgeResult = results.prompt_judge_result ?? {
        rubric_scores: [],
        overall_score: 0,
        overall_feedback: "No prompt quality analysis available.",
      };

      setAnalysisResults({ testCaseResults, outputJudge, promptJudge });
    } catch (e) {
      setAnalysisError(e instanceof Error ? e.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = () => { if (currentPhase < 3) setCurrentPhase(currentPhase + 1); };
  const handlePrevious = () => { if (currentPhase > 1) setCurrentPhase(currentPhase - 1); };

  const handleReset = () => {
    setCurrentPhase(1);
    setSelectedDomain("");
    setRubrics([]);
    setPrompt("");
    setSelectedLLM("");
    setApiKeys({ google: "", mistral: "", deepseek: "", openai: "" });
    setKeyValidationResult(null);
    setTestCases([{ id: "1", input: "", expectedOutput: "" }]);
    setAnalysisResults(null);
    setAnalysisError(null);
    setEvaluationId(null);
    setExpandedTestCases(new Set());
  };

  const toggleTestCase = (idx: number) => {
    setExpandedTestCases((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  // =====================================================================

  return (
    <div className="w-full min-w-0 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto box-border">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 break-words">
          Prompt Management
        </h2>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">
          Configure and evaluate your prompts step by step
        </p>
      </div>

      {/* ── Progress Stepper - responsive layout ── */}
      <div className="mb-6 sm:mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-start justify-between min-w-[280px] sm:min-w-0">
          {[1, 2, 3].map((phase) => (
            <div key={phase} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full flex items-center justify-center border-2 ${
                    currentPhase === phase
                      ? "bg-blue-600 border-blue-600 text-white"
                      : currentPhase > phase
                      ? "bg-green-600 border-green-600 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {currentPhase > phase ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <span className="font-semibold text-sm sm:text-base">{phase}</span>
                  )}
                </div>
                <p className="mt-2 text-xs sm:text-sm font-medium text-gray-700 text-center">
                  Phase {phase}
                </p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1 text-center hidden sm:block">
                  {phase === 1 && "Domain & Rubrics"}
                  {phase === 2 && "Prompt & Test Cases"}
                  {phase === 3 && "LLM Judge Results"}
                </p>
              </div>
              {phase < 3 && (
                <div
                  className={`h-0.5 flex-1 mx-1 sm:mx-4 min-w-[8px] ${
                    currentPhase > phase ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ================================================================
           Phase 1: Domain & Rubrics
         ================================================================ */}
      {currentPhase === 1 && (
        <div className="space-y-6">
          <Card className="min-w-0 overflow-hidden">
            <CardHeader>
              <CardTitle className="break-words">Select Domain</CardTitle>
              <CardDescription className="break-words">Choose the domain for your evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DOMAINS.map((domain) => (
                  <button
                    key={domain.id}
                    onClick={() => handleDomainSelect(domain.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      selectedDomain === domain.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900">{domain.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{domain.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedDomain && (
            <Card>
              <CardHeader>
                <CardTitle>Configure Rubrics</CardTitle>
                <CardDescription>
                  Select rubrics and set their weightage (Total must equal 100%)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-2 block">Add Rubric</Label>
                  <Select onValueChange={handleAddRubric}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a rubric to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_RUBRICS.filter(
                        (r) => !rubrics.find((existing) => existing.id === r.id),
                      ).map((rubric) => (
                        <SelectItem key={rubric.id} value={rubric.id}>
                          {rubric.name} - {rubric.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {rubrics.length > 0 && (
                  <div className="space-y-4">
                    {rubrics.map((rubric) => (
                      <div key={rubric.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{rubric.name}</h4>
                            <p className="text-sm text-gray-500">
                              {COMMON_RUBRICS.find((r) => r.id === rubric.id)?.description}
                            </p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveRubric(rubric.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Weight: {rubric.weight}%</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={rubric.weight}
                              onChange={(e) => handleWeightChange(rubric.id, [parseFloat(e.target.value) || 0])}
                              className="w-20"
                            />
                          </div>
                          <Slider
                            value={[rubric.weight]}
                            onValueChange={(value) => handleWeightChange(rubric.id, value)}
                            max={100}
                            step={1}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Total Weight:</span>
                    <span className={`text-lg font-bold ${totalWeight === 100 ? "text-green-600" : "text-red-600"}`}>
                      {totalWeight}%
                    </span>
                  </div>
                  {totalWeight !== 100 && (
                    <p className="text-sm text-red-600 mt-2">
                      Total weight must equal 100%. Current: {totalWeight}%
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={handleNext} disabled={!isPhase1Complete} className="min-w-32 w-full sm:w-auto">
              Next Phase
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ================================================================
           Phase 2: Prompt & Test Cases
         ================================================================ */}
      {currentPhase === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enter Prompt</CardTitle>
              <CardDescription>The prompt you want to evaluate</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here..."
                className="min-h-32"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select LLM & API Key</CardTitle>
              <CardDescription>Choose which LLM to use and enter the API key</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Model</Label>
                <Select
                  value={selectedLLM}
                  onValueChange={(v) => {
                    setSelectedLLM(v);
                    setKeyValidationResult(null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an LLM" />
                  </SelectTrigger>
                  <SelectContent>
                    {LLMS.map((llm) => (
                      <SelectItem key={llm.id} value={llm.id}>
                        {llm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedLLM && selectedLLMConfig && (
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="api-key">{selectedLLMConfig.apiKeyLabel}</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      id="api-key"
                      type="password"
                      autoComplete="off"
                      placeholder={`Enter your ${selectedLLMConfig.apiKeyLabel}...`}
                      value={selectedApiKey}
                      onChange={(e) => setApiKeyForProvider(selectedProvider, e.target.value)}
                      className="font-mono flex-1 min-w-0"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleValidateApiKey}
                      disabled={!selectedApiKey.trim() || isValidatingKey}
                    >
                      {isValidatingKey ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        "Validate"
                      )}
                    </Button>
                  </div>
                  {selectedProvider === "google" && (
                    <p className="text-xs text-muted-foreground">
                      Get a key at{" "}
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        Google AI Studio
                      </a>{" "}
                      and paste it with no extra spaces.
                    </p>
                  )}
                  {keyValidationResult && (
                    <div
                      className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                        keyValidationResult.success
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {keyValidationResult.success ? (
                        <CheckCircle className="w-5 h-5 shrink-0 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 shrink-0 text-red-600" />
                      )}
                      <span>{keyValidationResult.message}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Required for {selectedLLMConfig.name}. Not stored on the server.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Test Cases</CardTitle>
                  <CardDescription>Add test cases to evaluate the prompt</CardDescription>
                </div>
                <Button onClick={handleAddTestCase} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Test Case
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {testCases.map((testCase, index) => (
                <div key={testCase.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Test Case {index + 1}</h4>
                    {testCases.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveTestCase(testCase.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <Label>Input</Label>
                      <Textarea
                        value={testCase.input}
                        onChange={(e) => handleTestCaseChange(testCase.id, "input", e.target.value)}
                        placeholder="Enter test case input..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Expected Output (Optional)</Label>
                      <Textarea
                        value={testCase.expectedOutput || ""}
                        onChange={(e) => handleTestCaseChange(testCase.id, "expectedOutput", e.target.value)}
                        placeholder="Enter expected output (optional)..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button onClick={handlePrevious} variant="outline" className="w-full sm:w-auto">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button onClick={handleNext} disabled={!isPhase2Complete} className="min-w-32 w-full sm:w-auto">
              Next Phase
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* ================================================================
           Phase 3: LLM Judge Results
         ================================================================ */}
      {currentPhase === 3 && (
        <div className="space-y-6">
          {analysisError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm text-red-800">{analysisError}</p>
            </div>
          )}

          {!analysisResults ? (
            /* ── Launch button ── */
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  LLM as Judge
                </CardTitle>
                <CardDescription>
                  Run your prompt through the selected LLM, then use two separate LLM judge
                  calls to evaluate output quality and prompt quality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-8 text-center border-2 border-dashed rounded-lg space-y-4">
                  <div className="space-y-2 text-gray-600 text-sm max-w-lg mx-auto">
                    <p className="font-medium text-base text-gray-800">What will happen:</p>
                    <div className="flex items-start gap-3 text-left">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">1</span>
                      <p>A dynamic system prompt is built from your domain &amp; rubrics, then each test case is sent to <strong>{selectedLLMConfig?.name ?? "the LLM"}</strong>.</p>
                    </div>
                    <div className="flex items-start gap-3 text-left">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold">2</span>
                      <p><strong>Judge #1</strong> analyses every LLM output for correctness, relevance &amp; completeness.</p>
                    </div>
                    <div className="flex items-start gap-3 text-left">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 text-xs font-bold">3</span>
                      <p><strong>Judge #2</strong> evaluates your prompt quality against the selected rubrics.</p>
                    </div>
                  </div>
                  <Button onClick={handleAnalyze} disabled={isAnalyzing} size="lg" className="mt-4">
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing ({testCases.length} test case{testCases.length > 1 ? "s" : ""} + 2 judge calls)...
                      </>
                    ) : (
                      "Start Analysis"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* ── Summary scores ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prompt Quality Score */}
                <Card className="border-l-4 border-l-blue-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-100">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Prompt Quality</p>
                        <p className="text-xs text-gray-400">Judge #2 — Rubric Analysis</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className={`text-4xl font-bold ${scoreColor(analysisResults.promptJudge.overall_score)}`}>
                        {Math.round(analysisResults.promptJudge.overall_score)}
                      </span>
                      <span className="text-lg text-gray-400 mb-1">/ 100</span>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${scoreBg(analysisResults.promptJudge.overall_score)}`}
                        style={{ width: `${analysisResults.promptJudge.overall_score}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Output Quality Score */}
                <Card className="border-l-4 border-l-green-600">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-green-100">
                        <Target className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Output Quality</p>
                        <p className="text-xs text-gray-400">Judge #1 — Response Analysis</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className={`text-4xl font-bold ${scoreColor(analysisResults.outputJudge.overall_score)}`}>
                        {Math.round(analysisResults.outputJudge.overall_score)}
                      </span>
                      <span className="text-lg text-gray-400 mb-1">/ 100</span>
                    </div>
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${scoreBg(analysisResults.outputJudge.overall_score)}`}
                        style={{ width: `${analysisResults.outputJudge.overall_score}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── Prompt Quality Breakdown ── */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Prompt Quality Analysis
                  </CardTitle>
                  <CardDescription>
                    LLM Judge #2 evaluated your prompt against each rubric
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {analysisResults.promptJudge.overall_feedback && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-blue-900 mb-1">Judge Feedback</p>
                      <p className="text-sm text-blue-800">{analysisResults.promptJudge.overall_feedback}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {analysisResults.promptJudge.rubric_scores.map((rs) => {
                      const rubricWeight = rubrics.find((r) => r.id === rs.rubric_id)?.weight;
                      return (
                        <div key={rs.rubric_id || rs.rubric_name} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium text-gray-900">{rs.rubric_name}</span>
                              {rubricWeight != null && (
                                <span className="ml-2 text-xs text-gray-500">(Weight: {rubricWeight}%)</span>
                              )}
                            </div>
                            <Badge variant={scoreBadgeVariant(rs.score)}>{Math.round(rs.score)}/100</Badge>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${scoreBg(rs.score)}`}
                              style={{ width: `${rs.score}%` }}
                            />
                          </div>
                          {rs.feedback && (
                            <p className="text-sm text-gray-600">{rs.feedback}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* ── Output Quality Breakdown ── */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    LLM Output Quality Analysis
                  </CardTitle>
                  <CardDescription>
                    LLM Judge #1 evaluated each test case output for correctness, relevance &amp; completeness
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {analysisResults.outputJudge.overall_feedback && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-sm font-medium text-green-900 mb-1">Judge Feedback</p>
                      <p className="text-sm text-green-800">{analysisResults.outputJudge.overall_feedback}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {analysisResults.outputJudge.test_case_scores.map((tcs) => {
                      const tcData = analysisResults.testCaseResults.find(
                        (r) => r.test_case_index === tcs.test_case_index,
                      );
                      const isExpanded = expandedTestCases.has(tcs.test_case_index);

                      return (
                        <div key={tcs.test_case_index} className="border rounded-lg overflow-hidden">
                          {/* Header */}
                          <button
                            onClick={() => toggleTestCase(tcs.test_case_index)}
                            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                                {tcs.test_case_index}
                              </span>
                              <span className="font-medium text-gray-900">Test Case {tcs.test_case_index}</span>
                              {tcData && !tcData.generation_success && (
                                <Badge variant="destructive">Failed</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant={scoreBadgeVariant(tcs.overall_score)}>
                                {Math.round(tcs.overall_score)}/100
                              </Badge>
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </button>

                          {/* Expanded content */}
                          {isExpanded && (
                            <div className="px-4 pb-4 space-y-4 border-t">
                              {/* Scores grid - stack on mobile, 3 cols on sm+ */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 pt-4">
                                {(
                                  [
                                    ["Correctness", tcs.correctness],
                                    ["Relevance", tcs.relevance],
                                    ["Completeness", tcs.completeness],
                                  ] as const
                                ).map(([label, val]) => (
                                  <div key={label} className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                                    <p className={`text-xl font-bold ${scoreColor(val)}`}>
                                      {Math.round(val)}
                                    </p>
                                    <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                      <div
                                        className={`h-1.5 rounded-full ${scoreBg(val)}`}
                                        style={{ width: `${val}%` }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Judge feedback */}
                              {tcs.feedback && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                  <p className="text-xs font-medium text-gray-500 mb-1">Judge Feedback</p>
                                  <p className="text-sm text-gray-700">{tcs.feedback}</p>
                                </div>
                              )}

                              {/* Input / Output / Expected */}
                              {tcData && (
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-xs font-medium text-gray-500 mb-1">Input</p>
                                    <pre className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap max-h-40 overflow-auto">
                                      {tcData.input}
                                    </pre>
                                  </div>
                                  {tcData.generated_output && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-500 mb-1">LLM Output</p>
                                      <pre className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap max-h-60 overflow-auto">
                                        {tcData.generated_output}
                                      </pre>
                                    </div>
                                  )}
                                  {tcData.expected_output && (
                                    <div>
                                      <p className="text-xs font-medium text-gray-500 mb-1">Expected Output</p>
                                      <pre className="text-sm bg-gray-50 p-3 rounded-lg whitespace-pre-wrap max-h-40 overflow-auto">
                                        {tcData.expected_output}
                                      </pre>
                                    </div>
                                  )}
                                  {tcData.error && (
                                    <div className="p-3 bg-red-50 rounded-lg">
                                      <p className="text-xs font-medium text-red-700 mb-1">Error</p>
                                      <p className="text-sm text-red-600">{tcData.error}</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ── Bottom navigation - responsive stacking ── */}
          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button onClick={handlePrevious} variant="outline" className="w-full sm:w-auto">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button onClick={handleReset} variant="outline" className="w-full sm:w-auto">
                Start Over
              </Button>
              {analysisResults && (
                <Button
                  onClick={() => {
                    setAnalysisResults(null);
                    handleAnalyze();
                  }}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Re-analyzing...
                    </>
                  ) : (
                    "Re-analyze"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
