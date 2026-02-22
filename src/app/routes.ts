import { createBrowserRouter } from "react-router";
import { RootLayout } from "@/app/components/root-layout";
// Temporarily commented out - keeping only Prompt Management
// import { OverviewPage } from "@/app/pages/overview";
// import { TracingPage } from "@/app/pages/tracing";
// import { ComparisonPage } from "@/app/pages/comparison";
// import { EvaluationDetailsPage } from "@/app/pages/evaluation-details";
// import { AnalyticsPage } from "@/app/pages/analytics";
import { PromptManagementPage } from "@/app/pages/prompt-management";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: PromptManagementPage },
      // { path: "tracing", Component: TracingPage },
      // { path: "comparison", Component: ComparisonPage },
      // { path: "evaluation-details", Component: EvaluationDetailsPage },
      // { path: "analytics", Component: AnalyticsPage },
      { path: "prompt-management", Component: PromptManagementPage },
    ],
  },
]);