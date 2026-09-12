/**
 * Universal Frontend AI Client for QuantumLearning.
 * Centralized interface for sending context-aware queries and validating AI actions across all platform pages.
 * Supports multi-turn conversation history for the chatbot.
 */
import { post } from './api';

/**
 * Send a query to the AI tutor, optionally including prior conversation turns.
 * @param {Object} opts
 * @param {string} opts.question - Current user message
 * @param {string} opts.taskType - 'chat' | 'explain_concept' | etc.
 * @param {Object|null} opts.context - AIContextEnvelope payload
 * @param {string|null} opts.providerOverride - 'mock' to force mock provider
 * @param {Array} opts.history - [{role:'user'|'ai', text:string}] prior turns
 */
export async function queryAI({ question, taskType = 'chat', context = null, providerOverride = null, history = [] }) {
  // Build a conversation-aware question by prepending recent turns as context
  let fullQuestion = question || '';
  if (history && history.length > 0) {
    // Include last 6 turns (3 pairs) for conversation context
    const recentTurns = history.slice(-6);
    const historyText = recentTurns
      .filter(m => m.role === 'user' || m.role === 'ai')
      .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
      .join('\n');
    fullQuestion = `[Conversation History]\n${historyText}\n\n[Current Question]\n${question}`;
  }

  const payload = {
    question: fullQuestion,
    user_question: question || '',
    task_type: taskType,
    context: context || {},
    provider_override: providerOverride
  };

  try {
    return await post('/api/ai/query', payload);
  } catch (err) {
    console.error('AI Query failed:', err);
    return {
      answer: 'Unable to reach AI service.',
      status: 'error',
      intent: 'error',
      key_points: [],
      warnings: [err.message],
      actions: [],
      sources: []
    };
  }
}

export async function validateAIAction(action) {
  try {
    return await post('/api/ai/validate_action', action);
  } catch (err) {
    return {
      ...action,
      validated: false,
      validation_error: err.message
    };
  }
}

export function buildContextEnvelope({
  page = 'general',
  location = null,
  section = null,
  studentLevel = 'Beginner',
  circuit = null,
  result = null,
  algorithm = null,
  visualization = null,
  error = null,
  learning = null,
  experiment = null
} = {}) {
  return {
    page_context: { page, location, section },
    user_context: { student_level: studentLevel },
    circuit_context: circuit ? {
      num_qubits: circuit.num_qubits || (circuit.gates ? Math.max(0, ...circuit.gates.flatMap(g => g.qubits || [])) + 1 : 0),
      gates: circuit.gates || [],
      qast: circuit
    } : null,
    execution_context: result ? {
      backend: result.backend || 'numpy',
      status: result.status || 'success',
      probabilities: result.probabilities,
      statevector: result.statevector,
      measurement: result.measurement,
      execution_trace: result.execution_trace || []
    } : null,
    algorithm_context: algorithm ? {
      algorithm_name: algorithm.name || algorithm.algorithm_name,
      stages: algorithm.stages || [],
      metrics: algorithm.metrics || {}
    } : null,
    visualization_context: visualization ? {
      visualization_type: visualization.type || visualization.visualization_type,
      current_qubit: visualization.qubit,
      x: visualization.x,
      y: visualization.y,
      z: visualization.z,
      numerical_data: visualization.data || {}
    } : null,
    error_context: error ? {
      error_type: error.type || error.error_type,
      user_facing_message: error.message || error.user_facing_message
    } : null,
    learning_context: learning ? {
      current_topic: learning.topic || learning.current_topic,
      difficulty: learning.difficulty || 'beginner'
    } : null,
    experiment_context: experiment ? {
      experiment_name: experiment.name,
      sweep_parameters: experiment.sweep_parameters || {}
    } : null
  };
}
