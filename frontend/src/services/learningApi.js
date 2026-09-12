/**
 * Learning API Service
 * Interacts with backend /api/learning REST endpoints.
 */

import { get, post } from './api';

export async function fetchCurriculum() {
  try {
    const data = await get('/api/learning/curriculum');
    if (Array.isArray(data)) {
      return { modules: data, count: data.length };
    }
    return data;
  } catch (err) {
    console.warn('Failed to fetch curriculum from API, falling back to local structure', err);
    return null;
  }
}

export async function fetchLesson(lessonId) {
  try {
    return await get(`/api/learning/lessons/${lessonId}`);
  } catch (err) {
    console.warn(`Failed to fetch lesson ${lessonId}`, err);
    return null;
  }
}

export async function completeLesson(lessonId) {
  try {
    const res = await post(`/api/learning/lessons/${lessonId}/complete`, {});
    if (res?.level_up && res?.new_level) {
      window.dispatchEvent(new CustomEvent('learning:level_up', { detail: res }));
      window.dispatchEvent(new CustomEvent('learning:level_changed', { detail: { level: res.new_level } }));
    }
    return res;
  } catch (err) {
    console.warn(`Failed to complete lesson ${lessonId}`, err);
    return null;
  }
}

export async function submitExercise(exerciseId, answer) {
  return await post(`/api/learning/exercises/${exerciseId}/submit`, { exercise_id: exerciseId, answer });
}

export async function submitChallenge(exerciseId, qast) {
  return await post(`/api/learning/challenges/${exerciseId}/submit`, {
    challenge_id: exerciseId,
    num_qubits: qast?.num_qubits || 2,
    operations: qast?.operations || [],
    qast
  });
}

export async function submitAssessment(assessmentId, answers) {
  return await post(`/api/learning/assessments/${assessmentId}/submit`, {
    assessment_id: assessmentId,
    answers
  });
}

export async function fetchProgress() {
  try {
    return await get('/api/learning/progress');
  } catch (err) {
    console.warn('Failed to fetch progress', err);
    return null;
  }
}

export async function fetchMastery() {
  try {
    return await get('/api/learning/mastery');
  } catch (err) {
    console.warn('Failed to fetch mastery', err);
    return null;
  }
}

export async function fetchRecommendations(level = null) {
  try {
    const query = level ? `?level=${encodeURIComponent(level)}` : '';
    return await get(`/api/learning/recommendations${query}`);
  } catch (err) {
    console.warn('Failed to fetch recommendations', err);
    return null;
  }
}

export async function fetchLevel() {
  try {
    return await get('/api/learning/level');
  } catch (err) {
    console.warn('Failed to fetch level', err);
    return { level: 'Beginner' };
  }
}

export async function setUserLevel(level) {
  try {
    const res = await post('/api/learning/level', { level });
    // Dispatch custom DOM event so all subscribed components update immediately
    window.dispatchEvent(new CustomEvent('learning:level_changed', { detail: { level } }));
    return res;
  } catch (err) {
    console.warn('Failed to set level', err);
    return { status: 'error', level };
  }
}

export async function fetchCurriculumTracks() {
  try {
    return await get('/api/learning/tracks');
  } catch (err) {
    console.warn('Failed to fetch curriculum tracks', err);
    return null;
  }
}
