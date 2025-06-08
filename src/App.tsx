import React, { useState, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";

import LoginPage from "./components/auth/LoginPage";
import NotFound from "./components/common/NotFound";
import UserSurvey from "./components/user/UserSurvey";
import AnalyticsPage from "./components/analytics/AnalyticsPage";
import SurveyPage from "./components/admin/SurveyPage";
import QuestionDetailPage from "./components/admin/QuestionDetailsPage";
import ResponsesPage from "./components/analytics/ResponsesPage";
import { fetchAllQuestionsAndAnswersAdmin } from "./components/api/adminSurveyApi";

const ADMIN_PASSWORD = "AdminForm123";

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route
        path="/analytics"
        element={
          <AnalyticsPage
            fetchAllQuestionsAndAnswersAdmin={fetchAllQuestionsAndAnswersAdmin}
          />
        }
      />
      <Route path="/analytics/question/:id" element={<QuestionDetailPage />} />
      <Route path="/responses" element={<ResponsesPage />} />
      <Route path="/login" element={<LoginWrapper />} />
      <Route path="/form" element={<UserSurvey />} />
      <Route path="/dashboard" element={<SurveyPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
      <Route
        path="/sbna-gameshow-form"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  </Router>
);

const LoginWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [adminLoginError, setAdminLoginError] = useState("");

  const handleParticipantLogin = useCallback(
    (name: string, anon: boolean) => {
      localStorage.removeItem("isAdmin");
      navigate("/form", {
        state: {
          user: {
            name: name || "Guest",
            isAnonymous: anon,
            role: "participant",
          },
        },
      });
    },
    [navigate]
  );

  const handleAdminLogin = useCallback(
    (name: string, password: string) => {
      if (password === ADMIN_PASSWORD) {
        setAdminLoginError("");
        localStorage.setItem("isAdmin", "true");
        navigate("/dashboard", {
          state: {
            user: {
              name: name || "Admin",
              isAnonymous: false,
              role: "admin",
            },
          },
        });
      } else {
        setAdminLoginError("Incorrect admin password.");
      }
    },
    [navigate]
  );

  return (
    <LoginPage
      onParticipant={handleParticipantLogin}
      onAdmin={handleAdminLogin}
      adminError={adminLoginError}
    />
  );
};

export default App;
