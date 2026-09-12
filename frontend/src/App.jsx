import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Platform Landing & Auth
import RoleSelection from "./pages/platform/RoleSelection";
import AuthPage from "./pages/platform/AuthPage";

// Trainer Suite
import TrainerLayout from "./pages/platform/trainer/TrainerLayout";
import TrainerDashboard from "./pages/platform/trainer/TrainerDashboard";
import CourseManagement from "./pages/platform/trainer/CourseManagement";
import VideoLessonsManager from "./pages/platform/trainer/VideoLessonsManager";
import TheoryLessonsManager from "./pages/platform/trainer/TheoryLessonsManager";
import NotesManager from "./pages/platform/trainer/NotesManager";
import QuizManager from "./pages/platform/trainer/QuizManager";
import AssessmentManager from "./pages/platform/trainer/AssessmentManager";
import ChallengeManager from "./pages/platform/trainer/ChallengeManager";
import ProblemManager from "./pages/platform/trainer/ProblemManager";
import LearnerOversight from "./pages/platform/trainer/LearnerOversight";
import TrainerNotifications from "./pages/platform/trainer/TrainerNotifications";
import TrainerProfile from "./pages/platform/trainer/TrainerProfile";

// Student Portal & Quantum Modules
import LearnerLayout from "./pages/platform/learner/LearnerLayout";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import CourseCatalog from "./pages/platform/learner/CourseCatalog";
import Lab from "./pages/Lab";
import Experiments from "./pages/Experiments";
import Algorithms from "./pages/Algorithms";
import Challenges from "./pages/Challenges";
import AITutor from "./pages/AITutor";
import AssessmentProgress from "./pages/AssessmentProgress";
import LearnerCourseView from "./pages/platform/learner/LearnerCourseView";
import LearnerQuizView from "./pages/platform/learner/LearnerQuizView";
import LearnerAssessmentView from "./pages/platform/learner/LearnerAssessmentView";
import LearnerChallengeView from "./pages/platform/learner/LearnerChallengeView";
import LearnerProblemView from "./pages/platform/learner/LearnerProblemView";
import LearnerProgressView from "./pages/platform/learner/LearnerProgressView";
import LearnerNotifications from "./pages/platform/learner/LearnerNotifications";
import Profile from "./pages/Profile";
import Course from "./pages/Course";
import Lesson from "./pages/Lesson";
import Assessment from "./pages/Assessment";
import Challenge from "./pages/Challenge";

// Master Engine New Modules
import MasterFlowchartView from "./pages/platform/learner/MasterFlowchartView";
import BackwardLearningMission from "./pages/platform/learner/BackwardLearningMission";
import ResearchExplorer from "./pages/platform/learner/ResearchExplorer";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Landing / Role Selection */}
        <Route path="/" element={<RoleSelection />} />

        {/* 2. Authentication */}
        <Route path="/auth/:role" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth/learner" replace />} />
        <Route path="/register" element={<Navigate to="/auth/learner" replace />} />

        {/* 3. Trainer Protected Portal */}
        <Route path="/trainer" element={<TrainerLayout />}>
          <Route index element={<Navigate to="/trainer/dashboard" replace />} />
          <Route path="dashboard" element={<TrainerDashboard />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="videos" element={<VideoLessonsManager />} />
          <Route path="theory" element={<TheoryLessonsManager />} />
          <Route path="notes" element={<NotesManager />} />
          <Route path="quizzes" element={<QuizManager />} />
          <Route path="assessments" element={<AssessmentManager />} />
          <Route path="challenges" element={<ChallengeManager />} />
          <Route path="problems" element={<ProblemManager />} />
          <Route path="learners" element={<LearnerOversight />} />
          <Route path="notifications" element={<TrainerNotifications />} />
          <Route path="profile" element={<TrainerProfile />} />
        </Route>

        {/* 4. Student / Learner Portal with Full Quantum Lab & Modules */}
        <Route path="/learner" element={<LearnerLayout />}>
          <Route index element={<Navigate to="/learner/dashboard" replace />} />
          <Route path="flowchart" element={<MasterFlowchartView />} />
          <Route path="mission" element={<BackwardLearningMission />} />
          <Route path="research" element={<ResearchExplorer />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="learn" element={<Learn />} />
          <Route path="catalog" element={<CourseCatalog />} />
          <Route path="lab" element={<Lab />} />
          <Route path="experiments" element={<Experiments />} />
          <Route path="algorithms" element={<Algorithms />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="ai-tutor" element={<AITutor />} />
          <Route path="assessment" element={<AssessmentProgress />} />
          <Route path="progress" element={<LearnerProgressView />} />
          <Route path="notifications" element={<LearnerNotifications />} />
          <Route path="profile" element={<Profile />} />

          {/* Deep Learning Platform Routes */}
          <Route path="course/:courseId" element={<LearnerCourseView />} />
          <Route path="course/:courseId/quiz/:quizId" element={<LearnerQuizView />} />
          <Route path="course/:courseId/assessment/:assessmentId" element={<LearnerAssessmentView />} />
          <Route path="course/:courseId/challenge/:challengeId" element={<LearnerChallengeView />} />
          <Route path="course/:courseId/problem/:problemId" element={<LearnerProblemView />} />

          {/* Curriculum Lesson Views */}
          <Route path="learning/courses/:courseId" element={<Course />} />
          <Route path="learning/lessons/:lessonId" element={<Lesson />} />
          <Route path="learning/assessments/:assessmentId" element={<Assessment />} />
          <Route path="learning/challenges/:challengeId" element={<Challenge />} />
        </Route>

        {/* Global direct shortcuts for navigation aliases */}
        <Route path="/flowchart" element={<Navigate to="/learner/flowchart" replace />} />
        <Route path="/mission" element={<Navigate to="/learner/mission" replace />} />
        <Route path="/research" element={<Navigate to="/learner/research" replace />} />
        <Route path="/learn" element={<Navigate to="/learner/learn" replace />} />
        <Route path="/lab" element={<Navigate to="/learner/lab" replace />} />
        <Route path="/experiments" element={<Navigate to="/learner/experiments" replace />} />
        <Route path="/algorithms" element={<Navigate to="/learner/algorithms" replace />} />
        <Route path="/ai-tutor" element={<Navigate to="/learner/ai-tutor" replace />} />
        <Route path="/assessment" element={<Navigate to="/learner/assessment" replace />} />

        {/* Fallback to Landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
