import React, { useState, useEffect } from 'react';
import MasteryBadge from '../components/learning/MasteryBadge';
import CircuitChallengePanel from '../components/learning/CircuitChallengePanel';
import LevelSelector from '../components/learning/LevelSelector';
import { fetchProgress, fetchMastery, fetchCurriculum, submitAssessment, fetchLevel, setUserLevel } from '../services/learningApi';

const LEVEL_QUIZZES = {
  Beginner: {
    id: 'quiz_beginner_foundation',
    title: 'Beginner Level — Qubit Mechanics & Foundations Quiz',
    level: 'Beginner',
    badge: '🌱 Novice',
    questions: [
      {
        id: 'q1',
        question: 'What is the state vector representation of the standard computational basis state |0⟩?',
        options: ['[1, 0]ᵀ', '[0, 1]ᵀ', '[1, 1]ᵀ', '[1/√2, 1/√2]ᵀ'],
        explanation: 'In the computational Z-basis, |0⟩ is defined as the column vector [1, 0]ᵀ and |1⟩ as [0, 1]ᵀ.'
      },
      {
        id: 'q2',
        question: 'What effect does applying a Hadamard (H) gate to state |0⟩ produce?',
        options: ['Equal Superposition |+⟩ = 1/√2(|0⟩ + |1⟩)', 'Flips state deterministically to |1⟩', 'Resets the qubit to null', 'Applies a relative phase shift of π'],
        explanation: 'The Hadamard gate maps |0⟩ into equal superposition |+⟩ = 1/√2(|0⟩ + |1⟩).'
      },
      {
        id: 'q3',
        question: 'Which mathematical condition must complex amplitudes α and β satisfy for any valid state α|0⟩ + β|1⟩?',
        options: ['|α|² + |β|² = 1', 'α + β = 1', 'α · β = 0', '|α| + |β| = 1'],
        explanation: 'Conservation of total probability dictates that the sum of probability squares |α|² + |β|² must equal 1.'
      },
      {
        id: 'q4',
        question: 'On the 3D Bloch Sphere, what do the antipodal North and South poles represent?',
        options: ['Basis states |0⟩ and |1⟩ respectively', 'Equatorial superposition states |+⟩ and |-⟩', 'Continuous phase angles θ and ϕ', 'Entangled two-qubit bell states'],
        explanation: 'The North pole represents |0⟩ (θ=0) and the South pole represents |1⟩ (θ=π).'
      }
    ]
  },
  Intermediate: {
    id: 'quiz_intermediate_circuits',
    title: 'Intermediate Level — Entanglement & Quantum Oracles Quiz',
    level: 'Intermediate',
    badge: '⚡ Practitioner',
    questions: [
      {
        id: 'q1',
        question: 'What is the defining characteristic of the Bell state |Φ⁺⟩ = 1/√2(|00⟩ + |11⟩)?',
        options: ['Measurement of qubit 0 instantaneously dictates the outcome of qubit 1', 'The two qubits are statistically independent separable states', 'It can be created with only single-qubit gates', 'Its statevector collapses before measurement'],
        explanation: 'Bell states are maximally entangled; measuring qubit 0 into |0⟩ collapses qubit 1 into |0⟩ with 100% correlation.'
      },
      {
        id: 'q2',
        question: 'In the Deutsch-Jozsa algorithm, how does Phase Kickback detect a balanced oracle in a single query?',
        options: ['The target ancilla |-\u27e9 flips the relative phase (-1)^f(x) onto the input register', 'By running classical exhaustive search across all 2ⁿ inputs', 'By applying 2ⁿ CNOT gates sequentially', 'By measuring the ancilla qubit first'],
        explanation: 'Phase kickback exploits the eigenvalue -1 of the target ancilla |-\u27e9 to encode function values into relative phases.'
      },
      {
        id: 'q3',
        question: 'What is the mathematical purpose of the Grover Diffusion Operator (Inversion about the average)?',
        options: ['Amplifies the probability amplitude of marked oracle states while suppressing non-target states', 'Rotates all qubits onto the Z-axis', 'Measures the stabilizer eigenvalues', 'Calculates prime factors of an integer'],
        explanation: 'Grover diffusion inverts amplitudes about their mean, boosting the amplitude of the phase-flipped target state.'
      },
      {
        id: 'q4',
        question: 'In the Quantum Teleportation protocol of an unknown state |ψ⟩, what classical information must Alice transmit to Bob?',
        options: ['2 classical bits corresponding to Alice\'s Bell-basis measurement', 'The continuous phase angles θ and ϕ', '1 qubit statevector amplitude', '4 complex numbers'],
        explanation: 'Alice measures her two qubits in the Bell basis, yielding 2 classical bits used by Bob to apply conditional Pauli corrections (I, X, Z, or ZX).'
      }
    ]
  },
  Advanced: {
    id: 'quiz_advanced_qec',
    title: 'Advanced Level — Fault Tolerance, VQE & Frontier Quiz',
    level: 'Advanced',
    badge: '🚀 Architect',
    questions: [
      {
        id: 'q1',
        question: 'According to the Quantum Threshold Theorem for Fault-Tolerant Quantum Computing (FTQC), what is required?',
        options: ['Physical gate error rates must remain below a threshold (~10⁻² to 10⁻³) to achieve arbitrarily low logical error rates', 'Quantum error correction requires infinite physical qubits per logical qubit', 'Surface codes can only correct bit-flip errors (X), not phase errors (Z)', 'Ancilla measurement always destroys logical qubit information'],
        explanation: 'Below the fault-tolerance threshold error rate, concatenation or surface codes exponentially suppress logical error.'
      },
      {
        id: 'q2',
        question: 'In the Variational Quantum Eigensolver (VQE), how is the ground-state molecular energy computed?',
        options: ['A classical optimizer adjusts parameters θ on a quantum circuit to minimize expectation ⟨ψ(θ)|H|ψ(θ)⟩', 'Quantum Phase Estimation runs directly without classical optimization', 'Shor\'s period finding factors the Hamiltonian matrix in O(log N)', 'By measuring single qubit Z-projections without an ansatz'],
        explanation: 'VQE uses the Rayleigh-Ritz variational principle: the expectation value ⟨ψ(θ)|H|ψ(θ)⟩ bounds the ground state energy from above.'
      },
      {
        id: 'q3',
        question: 'Why can Clifford group circuits (H, S, CNOT, Pauli) be simulated in polynomial time on classical computers (Gottesman-Knill theorem)?',
        options: ['The state is represented by updating 2n stabilizer generator rows in O(n²) time rather than 2ⁿ amplitudes', 'Clifford circuits never create quantum entanglement', 'Clifford gates are non-unitary approximations', 'All measurement probabilities in Clifford circuits are 1.0'],
        explanation: 'The Gottesman-Knill theorem proves that stabilizer tableaux with 2n generators track Clifford evolutions in polynomial time.'
      },
      {
        id: 'q4',
        question: 'In a 2D Planar Surface Code lattice, how are X and Z errors detected without collapsing the logical state?',
        options: ['Syndrome ancilla qubits measure stabilizer operators (XXXX and ZZZZ) on neighboring data qubits', 'By measuring each data qubit directly in the Z basis', 'By continuously resetting data qubits to |0⟩', 'By cooling the cryostat below 1 millikelvin'],
        explanation: 'Ancilla qubits measure non-destructive multi-qubit parity operators (syndromes), revealing error locations without collapsing data.'
      }
    ]
  }
};

const ALL_CHALLENGES = [
  // ── Beginner Challenges ──
  {
    id: 'challenge_x_state',
    difficulty: 'BEGINNER',
    level: 'Beginner',
    badge: '🌱 Novice',
    category: 'FOUNDATIONS',
    lesson_title: 'State Preparation |0⟩ → |1⟩',
    question: 'Construct a 1-qubit circuit that transforms initial state |0⟩ into target state |1⟩.',
    target_description: 'Target: P(|1⟩) ≥ 0.99 using a single Pauli-X NOT gate.',
    concept_id: 'state_preparation',
    module_title: 'Module 1 — Physics Foundation'
  },
  {
    id: 'challenge_h_superposition',
    difficulty: 'BEGINNER',
    level: 'Beginner',
    badge: '🌱 Novice',
    category: 'FOUNDATIONS',
    lesson_title: 'Hadamard Equal Superposition |+⟩',
    question: 'Construct a 1-qubit circuit preparing the equal superposition state |+⟩ = 1/√2(|0⟩ + |1⟩).',
    target_description: 'Target: P(|0⟩) ≈ 0.50 and P(|1⟩) ≈ 0.50 with zero relative phase.',
    concept_id: 'superposition',
    module_title: 'Module 2 — Quantum Principles'
  },
  {
    id: 'challenge_phase_z',
    difficulty: 'BEGINNER',
    level: 'Beginner',
    badge: '🌱 Novice',
    category: 'FOUNDATIONS',
    lesson_title: 'Pauli-Z Phase Flip |+⟩ → |-⟩',
    question: 'Construct a 1-qubit circuit that generates the |-⟩ superposition state 1/√2(|0⟩ - |1⟩).',
    target_description: 'Target: Apply H then Pauli-Z to create phase inverted superposition state.',
    concept_id: 'phase_flip',
    module_title: 'Module 4 — Quantum Gates'
  },
  // ── Intermediate Challenges ──
  {
    id: 'challenge_bell_state',
    difficulty: 'INTERMEDIATE',
    level: 'Intermediate',
    badge: '⚡ Practitioner',
    category: 'ENTANGLEMENT',
    lesson_title: 'Maximally Entangled Bell State |Φ⁺⟩',
    question: 'Construct a 2-qubit Bell state circuit generating maximum entanglement |Φ⁺⟩ = 1/√2(|00⟩ + |11⟩).',
    target_description: 'Target: P(|00⟩) ≥ 0.45 and P(|11⟩) ≥ 0.45 with zero probability for |01⟩ and |10⟩.',
    concept_id: 'bell_state',
    module_title: 'Module 6 — Multi-Qubit Mechanics'
  },
  {
    id: 'challenge_ghz_state',
    difficulty: 'INTERMEDIATE',
    level: 'Intermediate',
    badge: '⚡ Practitioner',
    category: 'ENTANGLEMENT',
    lesson_title: '3-Qubit Greenberger-Horne-Zeilinger (GHZ) State',
    question: 'Construct a 3-qubit tripartite entangled GHZ state |GHZ⟩ = 1/√2(|000⟩ + |111⟩).',
    target_description: 'Target: P(|000⟩) ≥ 0.45 and P(|111⟩) ≥ 0.45 across 3 coupled qubits.',
    concept_id: 'ghz_state',
    module_title: 'Module 6 — Multi-Qubit Mechanics'
  },
  {
    id: 'challenge_teleportation',
    difficulty: 'INTERMEDIATE',
    level: 'Intermediate',
    badge: '⚡ Practitioner',
    category: 'ALGORITHMS',
    lesson_title: 'Quantum Teleportation Circuit',
    question: 'Build a 3-qubit quantum teleportation circuit transferring state from Q0 to Q2 via an EPR pair.',
    target_description: 'Target: Bell measurement on Q0-Q1 followed by conditional Pauli corrections on Q2.',
    concept_id: 'teleportation',
    module_title: 'Module 7 — Algorithm Machinery'
  },
  {
    id: 'challenge_deutsch_oracle',
    difficulty: 'INTERMEDIATE',
    level: 'Intermediate',
    badge: '⚡ Practitioner',
    category: 'ALGORITHMS',
    lesson_title: 'Deutsch-Jozsa Balanced Oracle Check',
    question: 'Construct a 2-qubit Deutsch oracle testing whether f(x) is balanced via phase kickback.',
    target_description: 'Target: P(|1⟩) = 1.0 on query qubit indicating balanced function outcome.',
    concept_id: 'deutsch_jozsa',
    module_title: 'Module 8 — Quantum Algorithms'
  },
  // ── Advanced Challenges ──
  {
    id: 'challenge_grover_3q',
    difficulty: 'ADVANCED',
    level: 'Advanced',
    badge: '🚀 Architect',
    category: 'ALGORITHMS',
    lesson_title: '3-Qubit Grover Search & Diffusion',
    question: 'Synthesize a 3-qubit Grover search circuit with phase oracle and amplitude diffusion operator.',
    target_description: 'Target: Probability of marked state |111⟩ amplified to > 0.75.',
    concept_id: 'grover_search',
    module_title: 'Module 8 — Quantum Algorithms'
  },
  {
    id: 'challenge_qec_bit_flip',
    difficulty: 'ADVANCED',
    level: 'Advanced',
    badge: '🚀 Architect',
    category: 'ERROR_CORRECTION',
    lesson_title: '3-Qubit Bit-Flip Quantum Error Correction Code',
    question: 'Construct a 3-qubit code with ancilla syndrome measurements to detect and correct single X errors.',
    target_description: 'Target: Encode logical |ψ⟩ into 3 physical qubits and extract parity syndromes.',
    concept_id: 'qec_surface',
    module_title: 'Module 11 — Quantum Error Correction'
  },
  {
    id: 'challenge_qft_3q',
    difficulty: 'ADVANCED',
    level: 'Advanced',
    badge: '🚀 Architect',
    category: 'ALGORITHMS',
    lesson_title: '3-Qubit Quantum Fourier Transform (QFT)',
    question: 'Implement a 3-qubit Quantum Fourier Transform using Hadamard gates and Controlled-Phase Rz gates.',
    target_description: 'Target: Map computational basis into discrete Fourier frequency domain.',
    concept_id: 'qft',
    module_title: 'Module 8 — Quantum Algorithms'
  },
  {
    id: 'challenge_vqe_ansatz',
    difficulty: 'ADVANCED',
    level: 'Advanced',
    badge: '🚀 Architect',
    category: 'NISQ',
    lesson_title: '2-Qubit Hardware-Efficient VQE Ansatz',
    question: 'Build a parameterized variational ansatz with Ry/Rz rotations and entangling CNOT for molecular ground state simulation.',
    target_description: 'Target: Parameterized trial state |ψ(θ)⟩ for expectation energy evaluation.',
    concept_id: 'vqe',
    module_title: 'Module 9 — Hybrid / NISQ Algorithms'
  }
];

export default function AssessmentProgress() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userLevel, setUserLevelState] = useState('Beginner');
  const [challengeFilter, setChallengeFilter] = useState('Beginner'); // Defaults strictly to active user level
  const [strictMode, setStrictMode] = useState(true);
  
  const [progress, setProgress] = useState(null);
  const [mastery, setMastery] = useState(null);
  const [modules, setModules] = useState([]);
  const [challenges, setChallenges] = useState(ALL_CHALLENGES);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState({});

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState(LEVEL_QUIZZES.Beginner);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [progData, mastData, currData, levelData] = await Promise.all([
          fetchProgress(),
          fetchMastery(),
          fetchCurriculum(),
          fetchLevel()
        ]);
        if (progData) setProgress(progData);
        if (mastData) setMastery(mastData);
        if (currData?.modules) setModules(currData.modules);
        
        const lvl = levelData?.level || 'Beginner';
        setUserLevelState(lvl);
        setChallengeFilter(lvl);
        setActiveQuiz(LEVEL_QUIZZES[lvl] || LEVEL_QUIZZES.Beginner);
      } catch (err) {
        console.warn('Failed to load assessment & progress data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();

    const handleLevelChanged = (e) => {
      if (e.detail?.level) {
        const newLvl = e.detail.level;
        setUserLevelState(newLvl);
        setChallengeFilter(newLvl);
        setActiveQuiz(LEVEL_QUIZZES[newLvl] || LEVEL_QUIZZES.Beginner);
        setQuizAnswers({});
        setQuizResult(null);
      }
    };
    window.addEventListener('learning:level_changed', handleLevelChanged);
    return () => window.removeEventListener('learning:level_changed', handleLevelChanged);
  }, []);

  const handleLevelSwitch = async (lvl) => {
    setUserLevelState(lvl);
    setChallengeFilter(lvl);
    setActiveQuiz(LEVEL_QUIZZES[lvl] || LEVEL_QUIZZES.Beginner);
    setQuizAnswers({});
    setQuizResult(null);
    await setUserLevel(lvl);
  };

  const conceptList = Object.entries(mastery?.concepts || {});
  const completedLessonsCount = progress?.completed_lessons?.length || 0;
  const totalLessonsCount = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 20;

  const handleChallengeCompleted = (chId, result) => {
    if (result && result.passed) {
      setCompletedChallenges(prev => ({ ...prev, [chId]: true }));
      fetchProgress().then(p => p && setProgress(p));
      fetchMastery().then(m => m && setMastery(m));
    }
  };

  const handleQuizSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!activeQuiz) return;
    setIsSubmittingQuiz(true);
    try {
      const res = await submitAssessment(activeQuiz.id, quizAnswers);
      setQuizResult(res);
      fetchProgress().then(p => p && setProgress(p));
      fetchMastery().then(m => m && setMastery(m));
    } catch (err) {
      console.error('Quiz submission error:', err);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  const filteredChallenges = challenges.filter(ch => {
    if (strictMode) {
      return ch.level?.toLowerCase() === userLevel.toLowerCase();
    }
    if (challengeFilter === 'all') return true;
    return ch.level?.toLowerCase() === challengeFilter.toLowerCase();
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', backgroundColor: '#F8FAFC' }}>
      {/* Workspace Header */}
      <div className="workspace-header" style={{ borderBottom: '1px solid var(--border-subtle)', padding: '24px 40px', backgroundColor: '#FFFFFF', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px', fontFamily: 'var(--font-mono)' }}>
              ACADEMIC EVALUATION & SKILL BENCHMARKING
            </div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', color: 'var(--text-primary)', letterSpacing: '-0.02em', fontWeight: 800 }}>
              Assessment & Progress Command Center
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'quizzes', label: 'Quizzes' },
              { id: 'challenges', label: 'Lab Challenges' },
              { id: 'performance', label: 'Performance' },
              { id: 'mastery', label: 'Mastery' },
              { id: 'activity', label: 'Activity' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSelectedChallenge(null); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: activeTab === tab.id ? '#2563EB' : 'transparent',
                  color: activeTab === tab.id ? '#FFFFFF' : '#64748B',
                  transition: 'all 0.15s ease',
                  boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="workspace-content" style={{ maxWidth: '1180px', margin: '0 auto', width: '100%', padding: '36px 40px' }}>
        
        {/* Dynamic Level Tier Switcher */}
        <LevelSelector
          showDetails={false}
          onLevelChange={handleLevelSwitch}
        />

        {isLoading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading Learner Assessment & Progress Records...
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Metric Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  <div style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 700 }}>
                      Completed Lessons
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
                      {completedLessonsCount} <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>/ {totalLessonsCount}</span>
                    </div>
                  </div>

                  <div style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 700 }}>
                      Challenges Solved
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                      {Object.keys(completedChallenges).length} <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>/ {challenges.length}</span>
                    </div>
                  </div>

                  <div style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 700 }}>
                      Mastered Concepts
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#7C3AED', fontFamily: 'var(--font-mono)' }}>
                      {conceptList.filter(([, c]) => c.mastery_status === 'mastered').length} <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>concepts</span>
                    </div>
                  </div>

                  <div style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '10px', boxShadow: 'var(--shadow-xs)' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 700 }}>
                      Active Level Track
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0F172A', marginTop: '6px' }}>
                      {userLevel === 'Beginner' ? '🌱 Beginner' : userLevel === 'Intermediate' ? '⚡ Intermediate' : '🚀 Advanced'}
                    </div>
                  </div>
                </div>

                {/* Level-Specific Quick Action Grid */}
                <div style={{ padding: '28px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                        Active Tier: {userLevel} Evaluations
                      </h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
                        Curated quizzes and circuit challenges designed specifically for your current {userLevel} track.
                      </p>
                    </div>
                    <button
                      className="btn btn-primary"
                      onClick={() => setActiveTab('challenges')}
                      style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 700 }}
                    >
                      OPEN {userLevel.toUpperCase()} CHALLENGES →
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                    {challenges.filter(c => c.level.toLowerCase() === userLevel.toLowerCase()).slice(0, 3).map(ch => (
                      <div
                        key={ch.id}
                        onClick={() => { setSelectedChallenge(ch); setActiveTab('challenges'); }}
                        style={{
                          padding: '16px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#F8FAFC',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563EB', marginBottom: '4px' }}>
                          {ch.badge} • {ch.category}
                        </div>
                        <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
                          {ch.lesson_title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B', lineHeight: 1.4 }}>
                          {ch.target_description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* QUIZZES TAB */}
            {activeTab === 'quizzes' && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                {/* Level Quiz Switcher Tabs */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #E2E8F0', paddingBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#2563EB', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                      {activeQuiz?.badge} • AUTOMATED EVALUATION ENGINE
                    </div>
                    <h2 style={{ fontSize: '1.6rem', color: '#0F172A', margin: '4px 0 4px 0', fontWeight: 800 }}>
                      {activeQuiz?.title}
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
                      Evaluated server-side with instant explanation breakdown and XP rewards.
                    </p>
                  </div>

                  {/* Level Pill Switcher for Quiz */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['Beginner', 'Intermediate', 'Advanced'].map(lvl => {
                      const isSelected = activeQuiz.level.toLowerCase() === lvl.toLowerCase();
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => handleLevelSwitch(lvl)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '16px',
                            border: isSelected ? '1px solid #2563EB' : '1px solid #E2E8F0',
                            backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                            color: isSelected ? '#1D4ED8' : '#64748B',
                            fontWeight: isSelected ? 700 : 500,
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          {lvl} Quiz
                        </button>
                      );
                    })}
                  </div>
                </div>

                {quizResult ? (
                  <div style={{ padding: '32px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.6rem', color: quizResult.passed ? '#15803D' : '#DC2626', margin: '0 0 12px 0', fontWeight: 800 }}>
                      {quizResult.passed ? '✓ Assessment Passed! +100 XP' : 'Assessment Attempt Recorded'}
                    </h3>
                    <p style={{ fontSize: '1.1rem', color: '#0F172A', marginBottom: '20px' }}>
                      Final Score: <strong>{Math.round(quizResult.score * 100)}%</strong> ({quizResult.correct_count} of {quizResult.total_questions} correct)
                    </p>

                    {quizResult.explanation_map && (
                      <div style={{ textAlign: 'left', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #E2E8F0' }}>
                        <h4 style={{ fontSize: '1rem', color: '#2563EB', marginBottom: '12px', fontWeight: 700 }}>Explanations & Concept Breakdown:</h4>
                        {Object.entries(quizResult.explanation_map).map(([qid, exp]) => (
                          <div key={qid} style={{ padding: '12px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '6px', marginBottom: '8px', fontSize: '0.85rem', color: '#475569' }}>
                            <strong style={{ color: '#0F172A' }}>{qid.toUpperCase()}:</strong> {exp}
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      className="btn btn-primary"
                      style={{ marginTop: '24px', padding: '12px 28px', fontWeight: 700 }}
                      onClick={() => { setQuizResult(null); setQuizAnswers({}); }}
                    >
                      RETRY {userLevel.toUpperCase()} QUIZ
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleQuizSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {activeQuiz.questions.map((q, qIdx) => (
                      <div key={q.id || qIdx} style={{ padding: '20px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>
                          Q{qIdx + 1}. {q.question}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {q.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '10px 14px',
                                backgroundColor: quizAnswers[q.id || `q${qIdx+1}`] === oIdx ? '#EFF6FF' : '#FFFFFF',
                                border: quizAnswers[q.id || `q${qIdx+1}`] === oIdx ? '2px solid #2563EB' : '1px solid #E2E8F0',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                color: '#0F172A',
                                fontWeight: quizAnswers[q.id || `q${qIdx+1}`] === oIdx ? 600 : 400
                              }}
                            >
                              <input
                                type="radio"
                                name={q.id || `q${qIdx+1}`}
                                checked={quizAnswers[q.id || `q${qIdx+1}`] === oIdx}
                                onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id || `q${qIdx+1}`]: oIdx }))}
                              />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button
                        type="submit"
                        disabled={isSubmittingQuiz}
                        className="btn btn-primary"
                        style={{ padding: '12px 32px', fontWeight: 700, fontSize: '0.9rem' }}
                      >
                        {isSubmittingQuiz ? 'Evaluating...' : `SUBMIT ${userLevel.toUpperCase()} QUIZ`}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* CHALLENGES TAB */}
            {activeTab === 'challenges' && (
              <div>
                {selectedChallenge ? (
                  <div>
                    <button
                      className="btn"
                      onClick={() => setSelectedChallenge(null)}
                      style={{ marginBottom: '20px', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      ← Back to Challenges List
                    </button>

                    <div style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                            {selectedChallenge.badge} • {selectedChallenge.difficulty} CHALLENGE
                          </span>
                          <h2 style={{ fontSize: '1.6rem', color: '#0F172A', margin: '4px 0 0 0', fontWeight: 800 }}>
                            {selectedChallenge.lesson_title}
                          </h2>
                        </div>
                        {completedChallenges[selectedChallenge.id] && (
                          <span style={{ padding: '6px 12px', backgroundColor: '#ECFDF5', color: '#166534', border: '1px solid #BBF7D0', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                            SOLVED ✓
                          </span>
                        )}
                      </div>

                      <CircuitChallengePanel
                        exercise={selectedChallenge}
                        onCompleted={(res) => handleChallengeCompleted(selectedChallenge.id, res)}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Challenge Filter Tabs & Strict Mode Banner */}
                    <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', backgroundColor: userLevel === 'Beginner' ? '#ECFDF5' : userLevel === 'Intermediate' ? '#EFF6FF' : '#F5F3FF', border: `1px solid ${userLevel === 'Beginner' ? '#A7F3D0' : userLevel === 'Intermediate' ? '#BFDBFE' : '#DDD6FE'}`, borderRadius: '8px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: userLevel === 'Beginner' ? '#065F46' : userLevel === 'Intermediate' ? '#1E40AF' : '#5B21B6' }}>
                          🔒 {strictMode ? `Strict Mode Active: Showing exclusively ${userLevel} circuit challenges.` : `Unrestricted Mode: Browsing all challenge levels.`}
                        </div>
                        <button
                          type="button"
                          onClick={() => setStrictMode(prev => !prev)}
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#334155'
                          }}
                        >
                          {strictMode ? '🔓 Show All Levels' : '🔒 Strict Tier Lock'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {(strictMode
                            ? [{ id: userLevel, label: userLevel === 'Beginner' ? '🌱 Beginner' : userLevel === 'Intermediate' ? '⚡ Intermediate' : '🚀 Advanced' }]
                            : [
                                { id: 'all', label: 'All Challenges' },
                                { id: 'Beginner', label: '🌱 Beginner' },
                                { id: 'Intermediate', label: '⚡ Intermediate' },
                                { id: 'Advanced', label: '🚀 Advanced' }
                              ]
                          ).map(f => {
                            const isSelected = challengeFilter === f.id;
                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setChallengeFilter(f.id)}
                                style={{
                                  padding: '6px 14px',
                                  borderRadius: '16px',
                                  border: isSelected ? '1px solid #2563EB' : '1px solid #E2E8F0',
                                  backgroundColor: isSelected ? '#EFF6FF' : '#FFFFFF',
                                  color: isSelected ? '#1D4ED8' : '#64748B',
                                  fontSize: '0.8rem',
                                  fontWeight: isSelected ? 700 : 500,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {f.label}
                              </button>
                            );
                          })}
                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                          Showing {filteredChallenges.length} {userLevel} challenges
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                      {filteredChallenges.map(ch => {
                        const isPassed = completedChallenges[ch.id];
                        const isMatch = ch.level?.toLowerCase() === userLevel.toLowerCase();

                        return (
                          <div
                            key={ch.id}
                            style={{
                              backgroundColor: '#FFFFFF',
                              border: isMatch ? '2px solid #2563EB' : '1px solid #E2E8F0',
                              borderRadius: '10px',
                              padding: '20px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              gap: '16px',
                              boxShadow: isMatch ? '0 4px 12px rgba(37, 99, 235, 0.1)' : 'var(--shadow-xs)',
                              transition: 'all 0.15s ease'
                            }}
                            onClick={() => setSelectedChallenge(ch)}
                          >
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
                                  {ch.badge}
                                </span>
                                {isPassed ? (
                                  <span style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 700 }}>✓ Solved</span>
                                ) : isMatch ? (
                                  <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: '#FEF3C7', color: '#B45309', padding: '2px 8px', borderRadius: '10px' }}>
                                    FOR YOUR LEVEL
                                  </span>
                                ) : null}
                              </div>
                              <h3 style={{ fontSize: '1.15rem', color: '#0F172A', margin: '0 0 8px 0', fontWeight: 800 }}>
                                {ch.lesson_title}
                              </h3>
                              <p style={{ fontSize: '0.825rem', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                                {ch.target_description}
                              </p>
                            </div>

                            <div style={{ paddingTop: '12px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{ch.module_title}</span>
                              <span style={{ fontSize: '0.825rem', color: '#2563EB', fontWeight: 700 }}>
                                START CHALLENGE →
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PERFORMANCE TAB */}
            {activeTab === 'performance' && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0F172A', margin: '0 0 8px 0', fontWeight: 800 }}>
                  Learner Performance & Scoring Breakdown
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748B', marginBottom: '24px' }}>
                  Empirical analytics derived from actual quiz submissions, exercise evaluations, and circuit challenge attempts.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}>Lesson Completion</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563EB', fontFamily: 'var(--font-mono)' }}>
                      {Math.round((completedLessonsCount / Math.max(1, totalLessonsCount)) * 100)}%
                    </div>
                  </div>

                  <div style={{ padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', marginBottom: '6px', fontWeight: 700 }}>Challenges Solved</div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>
                      {Object.keys(completedChallenges).length} Solved
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* MASTERY TAB */}
            {activeTab === 'mastery' && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0F172A', margin: '0 0 20px 0', fontWeight: 800 }}>
                  Topic Mastery & Concept Evidence Record
                </h3>

                {conceptList.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontStyle: 'italic' }}>
                    No learning activity recorded yet. Complete lessons and assessments to establish mastery evidence.
                  </div>
                ) : (
                  <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          <th style={{ padding: '14px 20px' }}>Concept</th>
                          <th style={{ padding: '14px 20px' }}>Status</th>
                          <th style={{ padding: '14px 20px' }}>Score</th>
                          <th style={{ padding: '14px 20px' }}>Attempts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {conceptList.map(([conceptId, data]) => (
                          <tr key={conceptId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '14px 20px', fontWeight: 700, color: '#0F172A', textTransform: 'capitalize' }}>
                              {conceptId.replace('_', ' ')}
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <MasteryBadge status={data.mastery_status} />
                            </td>
                            <td style={{ padding: '14px 20px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                              {data.assessment_score !== undefined ? `${data.assessment_score}%` : 'N/A'}
                            </td>
                            <td style={{ padding: '14px 20px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                              {data.exercise_attempts_count || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === 'activity' && (
              <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.25rem', color: '#0F172A', margin: '0 0 16px 0', fontWeight: 800 }}>
                  Recent Student Learning Activity
                </h3>

                {completedLessonsCount === 0 && Object.keys(completedChallenges).length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontStyle: 'italic' }}>
                    No learning activity recorded yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(progress?.completed_lessons || []).map((lesId, idx) => (
                      <div key={idx} style={{ padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#0F172A', fontSize: '0.875rem' }}>Completed Lesson: <strong>{lesId}</strong></span>
                        <span style={{ color: '#10B981', fontSize: '0.8rem', fontWeight: 700 }}>✓ COMPLETED</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
