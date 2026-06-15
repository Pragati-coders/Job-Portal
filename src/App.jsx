import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./layouts/app-layout";
import ProtectedRoute from "./components/protected-route";
import { ThemeProvider } from "./components/theme-provider";

// Existing pages (keep as-is) 
import LandingPage from "./pages/landing";
import Onboarding from "./pages/onboarding";
import JobListing from "./pages/jobListing";
import Job from "./pages/job";
import PostJob from "./pages/post-job";
import SavedJobs from "./pages/saved-jobs";
import MyJobs from "./pages/my-jobs";

// New pages (created by you) 
import ApplicationTracker from "./pages/application-tracker";
import Companies from "./pages/companies";
import CompanyProfile from "./pages/CompanyProfile";
import AiJobWriter from "./pages/ai-job-writer";
import CandidateMatch from "./pages/candidate-match";

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // Public
      {
        path: "/",
        element: <LandingPage />,
      },
      // Protected — all require login
      {
        path: "/onboarding",
        element: (
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        ),
      },
      {
        path: "/jobs",
        element: (
          <ProtectedRoute>
            <JobListing />
          </ProtectedRoute>
        ),
      },
      {
        path: "/job/:id",
        element: (
          <ProtectedRoute>
            <Job />
          </ProtectedRoute>
        ),
      },
      {
        path: "/post-job",
        element: (
          <ProtectedRoute>
            <PostJob />
          </ProtectedRoute>
        ),
      },
      {
        path: "/saved-jobs",
        element: (
          <ProtectedRoute>
            <SavedJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-jobs",
        element: (
          <ProtectedRoute>
            <MyJobs />
          </ProtectedRoute>
        ),
      },
      // NEW routes 
      {
        path: "/tracker",
        element: (
          <ProtectedRoute>
            <ApplicationTracker />
          </ProtectedRoute>
        ),
      },
      {
        path: "/companies",
        element: (
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        ),
      },
      {
        path: "/company/:id",
        element: (
          <ProtectedRoute>
            <CompanyProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/ai-job-writer",
        element: (
          <ProtectedRoute>
            <AiJobWriter />
          </ProtectedRoute>
        ),
      },
      {
        path: "/match/:jobId",
        element: (
          <ProtectedRoute>
            <CandidateMatch />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="hireflow-theme">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;