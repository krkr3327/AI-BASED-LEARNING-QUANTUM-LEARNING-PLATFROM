import { platformAuth } from "./platformAuth";
import { buildApiUrl } from "../config/apiConfig";

const API_BASE = "/api/platform";

function getHeaders() {
  const token = platformAuth.getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function apiFetch(path, options = {}) {
  const url = buildApiUrl(`${API_BASE}${path}`);
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  };
  return fetch(url, config);
}

export const platformApi = {
  // Courses
  async getCourses(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await apiFetch(`/courses${query ? `?${query}` : ""}`);
    if (!res.ok) throw new Error("Failed to load courses");
    return res.json();
  },

  async getCourse(id) {
    const res = await apiFetch(`/courses/${id}`);
    if (!res.ok) throw new Error("Course not found");
    return res.json();
  },

  async createCourse(data) {
    const res = await apiFetch(`/courses`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create course");
    return res.json();
  },

  async updateCourse(id, updates) {
    const res = await apiFetch(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error("Failed to update course");
    return res.json();
  },

  async deleteCourse(id) {
    const res = await apiFetch(`/courses/${id}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete course");
    return res.json();
  },

  // Modules & Lessons
  async addModule(courseId, data) {
    const res = await apiFetch(`/courses/${courseId}/modules`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to add module");
    return res.json();
  },

  async deleteModule(courseId, moduleId) {
    const res = await apiFetch(`/courses/${courseId}/modules/${moduleId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete module");
    return res.json();
  },

  async addLesson(courseId, moduleId, data) {
    const res = await apiFetch(`/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to add lesson");
    return res.json();
  },

  async updateLesson(courseId, moduleId, lessonId, data) {
    const res = await apiFetch(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update lesson");
    return res.json();
  },

  async deleteLesson(courseId, moduleId, lessonId) {
    const res = await apiFetch(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete lesson");
    return res.json();
  },

  // Notes
  async addNote(courseId, data) {
    const res = await apiFetch(`/courses/${courseId}/notes`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to upload note");
    return res.json();
  },

  async deleteNote(courseId, noteId) {
    const res = await apiFetch(`/courses/${courseId}/notes/${noteId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete note");
    return res.json();
  },

  // Quizzes
  async addQuiz(courseId, data) {
    const res = await apiFetch(`/courses/${courseId}/quizzes`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to add quiz");
    return res.json();
  },

  async deleteQuiz(courseId, quizId) {
    const res = await apiFetch(`/courses/${courseId}/quizzes/${quizId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete quiz");
    return res.json();
  },

  async submitQuiz(courseId, quizId, answers) {
    const res = await apiFetch(`/courses/${courseId}/quizzes/${quizId}/submit`, {
      method: "POST",
      body: JSON.stringify({ answers })
    });
    if (!res.ok) throw new Error("Failed to submit quiz");
    return res.json();
  },

  // Assessments
  async addAssessment(courseId, data) {
    const res = await apiFetch(`/courses/${courseId}/assessments`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create assessment");
    return res.json();
  },

  async deleteAssessment(courseId, assessmentId) {
    const res = await apiFetch(`/courses/${courseId}/assessments/${assessmentId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete assessment");
    return res.json();
  },

  async submitAssessment(assessmentId, courseId, answers) {
    const res = await apiFetch(`/assessments/${assessmentId}/submit`, {
      method: "POST",
      body: JSON.stringify({ course_id: courseId, answers })
    });
    if (!res.ok) throw new Error("Failed to submit assessment");
    return res.json();
  },

  async getSubmissions(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await apiFetch(`/submissions${query ? `?${query}` : ""}`);
    if (!res.ok) throw new Error("Failed to load submissions");
    return res.json();
  },

  async gradeSubmission(submissionId, score, feedback) {
    const res = await apiFetch(`/submissions/${submissionId}/grade`, {
      method: "POST",
      body: JSON.stringify({ score, feedback })
    });
    if (!res.ok) throw new Error("Failed to grade submission");
    return res.json();
  },

  // Challenges & Problems
  async addChallenge(courseId, data) {
    const res = await apiFetch(`/courses/${courseId}/challenges`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to add challenge");
    return res.json();
  },

  async deleteChallenge(courseId, challengeId) {
    const res = await apiFetch(`/courses/${courseId}/challenges/${challengeId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete challenge");
    return res.json();
  },

  async addProblem(courseId, data) {
    const res = await apiFetch(`/courses/${courseId}/problems`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to add problem");
    return res.json();
  },

  async deleteProblem(courseId, problemId) {
    const res = await apiFetch(`/courses/${courseId}/problems/${problemId}`, {
      method: "DELETE"
    });
    if (!res.ok) throw new Error("Failed to delete problem");
    return res.json();
  },

  async executeCode(code, challengeId = null, problemId = null) {
    const res = await apiFetch(`/execute-code`, {
      method: "POST",
      body: JSON.stringify({ code, challenge_id: challengeId, problem_id: problemId })
    });
    if (!res.ok) throw new Error("Code execution request failed");
    return res.json();
  },

  // Enrollments & Progress
  async enroll(courseId) {
    const res = await apiFetch(`/enrollments/${courseId}`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Enrollment failed");
    return res.json();
  },

  async getMyEnrollments() {
    const res = await apiFetch(`/enrollments`);
    if (!res.ok) throw new Error("Failed to fetch enrollments");
    return res.json();
  },

  async getProgress(courseId) {
    const res = await apiFetch(`/progress/${courseId}`);
    if (!res.ok) throw new Error("Failed to fetch progress");
    return res.json();
  },

  async markLessonComplete(courseId, lessonId) {
    const res = await apiFetch(`/progress/${courseId}/complete-lesson`, {
      method: "POST",
      body: JSON.stringify({ lesson_id: lessonId })
    });
    if (!res.ok) throw new Error("Failed to record lesson completion");
    return res.json();
  },

  // Trainer Oversight
  async getTrainerLearnersOverview() {
    const res = await apiFetch(`/trainer/learners-overview`);
    if (!res.ok) throw new Error("Failed to fetch learners overview");
    return res.json();
  },

  // Notifications
  async getNotifications() {
    const res = await apiFetch(`/notifications`);
    if (!res.ok) throw new Error("Failed to fetch notifications");
    return res.json();
  },

  async markNotificationsRead() {
    const res = await apiFetch(`/notifications/read`, {
      method: "POST"
    });
    if (!res.ok) throw new Error("Failed to mark notifications read");
    return res.json();
  }
};
