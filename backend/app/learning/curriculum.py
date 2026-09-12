"""
Complete 17-Pillar Comprehensive Quantum Computing Academic Curriculum.

Structure:
1. Physics Foundation
2. Quantum Principles
3. Qubits
4. Quantum Gates
5. Quantum Circuits
6. Multi-Qubit Quantum Mechanics
7. Quantum Algorithm Machinery
8. Quantum Algorithms
9. Hybrid / NISQ Algorithms
10. Quantum Error & Noise
11. Quantum Error Correction
12. Quantum Hardware
13. Quantum Software
14. Quantum Visualization
15. Quantum Advantages
16. Limitations / Disadvantages
17. Real-World Applications
"""

CURRICULUM = [
    # -------------------------------------------------------------
    # MODULE 1: PHYSICS FOUNDATION
    # -------------------------------------------------------------
    {
        "id": "mod-1",
        "title": "Module 1 — Physics Foundation",
        "description": "Matter, energy quantization, atomic structures, electromagnetic interactions (microwaves/lasers), and measurement evolution/collapse.",
        "order": 1,
        "lessons": [
            {
                "id": "les-1-1",
                "module_id": "mod-1",
                "title": "01 — What is a Qubit?",
                "description": "The physical and mathematical foundation of quantum information: matter, atoms, and electron states.",
                "difficulty": "Beginner",
                "time_minutes": 10,
                "prerequisites": [],
                "objectives": [
                    "Define a qubit as a two-level quantum system.",
                    "Distinguish classical deterministic bits from complex statevector amplitudes.",
                    "Identify the computational basis states |0⟩ and |1⟩."
                ],
                "sections": [
                    {
                        "title": "Matter at the Nanoscale",
                        "type": "concept",
                        "content": "All matter comprises atoms with dense positively charged nuclei surrounded by bound electron clouds. In quantum information, discrete physical properties of these particles—such as electron spin orientations or orbital energy states—serve as the physical substrate for computing."
                    },
                    {
                        "title": "Discrete Quantum States",
                        "type": "math",
                        "content": "Unlike classical macroscopic objects whose properties vary continuously, atomic bound states occupy discrete eigenfunctions governed by the time-independent Schrödinger equation: H|ψ⟩ = E|ψ⟩.",
                        "latex_math": "H|\\psi\\rangle = E|\\psi\\rangle"
                    }
                ],
                "takeaway": "Quantum computing is grounded in isolating discrete, microscopic quantum degrees of freedom within matter.",
                "preset_circuit": [],
                "exercises": [
                    {
                        "id": "ex-1-1-1",
                        "concept_id": "qubit-definition",
                        "type": "multiple_choice",
                        "difficulty": "Beginner",
                        "question": "Which mathematical condition must complex amplitudes α and β satisfy for a valid qubit state α|0⟩ + β|1⟩?",
                        "options": [
                            "α + β = 1",
                            "|α|² + |β|² = 1",
                            "α · β = 0",
                            "|α| + |β| = 1"
                        ],
                        "explanation": "The sum of probability magnitudes |α|² + |β|² must equal 1 by conservation of probability (norm normalization)."
                    }
                ],
                "assessment": {
                    "id": "ass-1-1",
                    "title": "Physics Foundation: Matter & Quantization",
                    "description": "Assessment of atomic bound states and energy quantization principles.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "In the time-independent Schrödinger equation H|ψ⟩ = E|ψ⟩, what does the eigenvalue E represent?",
                            "options": [
                                "The quantized energy of the state |ψ⟩",
                                "The velocity of the electron",
                                "The electric charge of the nucleus",
                                "The magnetic flux quantum"
                            ],
                            "explanation": "E is the energy eigenvalue corresponding to the stationary state |ψ⟩."
                        }
                    ]
                }
            },
            {
                "id": "les-1-2",
                "module_id": "mod-1",
                "title": "02 — Energy: Quantization & State Excitation",
                "description": "Discrete energy gaps, photon absorption/emission, and driving ground to excited transitions.",
                "difficulty": "Beginner",
                "time_minutes": 10,
                "prerequisites": ["les-1-1"],
                "objectives": [
                    "Define energy quantization and photon energy relation E = hf.",
                    "Understand ground state |0⟩ and excited state |1⟩ transitions.",
                    "Calculate resonance driving frequencies for state manipulation."
                ],
                "sections": [
                    {
                        "title": "Quantization & Transitions",
                        "type": "concept",
                        "content": "A quantum system cannot absorb fractional energy between states. To transition from ground state |0⟩ to excited state |1⟩, the system must absorb an electromagnetic photon matching the exact transition gap ΔE = E₁ - E₀."
                    },
                    {
                        "title": "Planck-Einstein Relation",
                        "type": "math",
                        "content": "The transition frequency ω₀₁ is related to Planck's constant ℏ by: ℏω₀₁ = E₁ - E₀.",
                        "latex_math": "\\hbar \\omega_{01} = E_1 - E_0"
                    }
                ],
                "takeaway": "Qubit operations are resonant electromagnetic pulses that drive coherent population transfers between quantized energy levels.",
                "preset_circuit": [{"gate": "H", "qubits": [0], "targets": [0]}],
                "exercises": [
                    {
                        "id": "ex-1-2-1",
                        "concept_id": "energy-quantization",
                        "type": "multiple_choice",
                        "difficulty": "Beginner",
                        "question": "If the energy difference between state |0⟩ and |1⟩ is ΔE, what frequency f of electromagnetic radiation is needed to drive the transition?",
                        "options": [
                            "f = ΔE / h",
                            "f = h · ΔE",
                            "f = ΔE² / h",
                            "f = h / ΔE"
                        ],
                        "explanation": "By Planck's relation, E = h·f, hence f = ΔE / h."
                    }
                ],
                "assessment": {
                    "id": "ass-1-2",
                    "title": "Energy Quantization Assessment",
                    "description": "Testing electromagnetic transition frequencies.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What happens when a qubit in ground state |0⟩ is irradiated by an out-of-resonance photon?",
                            "options": [
                                "The photon is not absorbed and state remains unchanged",
                                "The state instantly transitions to |1⟩",
                                "The qubit collapses irreversibly",
                                "The energy is stored classically"
                            ],
                            "explanation": "Quantum absorption is resonant; non-resonant photons fail to drive coherent state transitions."
                        }
                    ]
                }
            },
            {
                "id": "les-1-3",
                "module_id": "mod-1",
                "title": "03 — Electromagnetic Interaction: Microwaves, Lasers & Light",
                "description": "How microwave pulses control superconducting circuits and optical lasers control trapped ions and neutral atoms.",
                "difficulty": "Intermediate",
                "time_minutes": 12,
                "prerequisites": ["les-1-2"],
                "objectives": [
                    "Compare microwave pulse control (superconductors) vs. optical laser control (ions/atoms).",
                    "Understand Rabi oscillations induced by oscillating electromagnetic fields.",
                    "Define pulse duration and amplitude for precise rotation angles."
                ],
                "sections": [
                    {
                        "title": "Coherent EM Control",
                        "type": "concept",
                        "content": "Quantum gates are executed by applying calibrated electromagnetic fields. In superconducting circuits, microwave pulses (4–8 GHz) sent down dilution refrigerators induce Rabi rotations. In trapped ion systems, UV/optical laser pulses drive electronic dipole transitions."
                    },
                    {
                        "title": "Rabi Frequency & Pulse Area",
                        "type": "math",
                        "content": "The rotation angle θ on the Bloch sphere is the integral of the Rabi frequency Ω(t) over pulse duration τ: θ = ∫₀^τ Ω(t) dt.",
                        "latex_math": "\\theta = \\int_{0}^{\\tau} \\Omega(t)\\,dt"
                    }
                ],
                "takeaway": "Quantum logic gates are physical electromagnetic pulses engineered in amplitude, frequency, and phase.",
                "preset_circuit": [{"gate": "rx", "qubits": [0], "targets": [0], "controls": [], "params": {"theta": 1.5708}}],
                "exercises": [
                    {
                        "id": "ex-1-3-1",
                        "concept_id": "em-interaction",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "A microwave pulse with pulse area θ = π applied to state |0⟩ performs which quantum operation?",
                        "options": [
                            "Pauli-X (bit-flip to |1⟩)",
                            "Hadamard gate",
                            "Identity gate",
                            "Measurement"
                        ],
                        "explanation": "A π-pulse rotates the state vector by 180 degrees from |0⟩ to |1⟩, implementing a Pauli-X gate."
                    }
                ],
                "assessment": {
                    "id": "ass-1-3",
                    "title": "Electromagnetic Control Assessment",
                    "description": "Evaluate understanding of Rabi oscillations and pulsed EM fields.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What pulse area corresponds to creating an equal superposition state from |0⟩?",
                            "options": [
                                "π / 2 pulse",
                                "π pulse",
                                "2π pulse",
                                "Zero pulse"
                            ],
                            "explanation": "A π/2 pulse rotates the state vector by 90 degrees onto the equatorial plane, creating a superposition."
                        }
                    ]
                }
            },
            {
                "id": "les-1-4",
                "module_id": "mod-1",
                "title": "04 — Measurement: Preparation, Evolution & Collapse",
                "description": "The four operational stages of quantum execution: state preparation, unitary evolution, projective measurement, and wavefunction collapse.",
                "difficulty": "Beginner",
                "time_minutes": 10,
                "prerequisites": ["les-1-3"],
                "objectives": [
                    "Sequence the 4 key stages: Preparation, Unitary Evolution, Measurement, Wavefunction Collapse.",
                    "Differentiate reversible unitary gates from irreversible projective measurements.",
                    "Apply Born's Rule to calculate measurement probabilities."
                ],
                "sections": [
                    {
                        "title": "The Quantum Lifecycle",
                        "type": "concept",
                        "content": "Every quantum program follows four distinct stages:\n1. State Preparation: Initializing all qubits to ground state |00...0⟩.\n2. Unitary Evolution: Applying reversible quantum logic gates U.\n3. Measurement: Coupling qubits to readout resonators or detectors.\n4. Collapse: The wavefunction instantaneously projects into a classical basis state."
                    },
                    {
                        "title": "Born's Rule",
                        "type": "math",
                        "content": "For state |ψ⟩ = ∑ᵢ cᵢ|i⟩, the probability of measuring basis state |k⟩ is P(k) = |⟨k|ψ⟩|² = |cₖ|².",
                        "latex_math": "P(k) = |\\langle k | \\psi \\rangle|^2 = |c_k|^2"
                    }
                ],
                "takeaway": "Quantum evolution is linear and unitary (reversible) until measurement projects the state probabilistically (irreversible).",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "m", "qubits": [0], "targets": [0], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-1-4-1",
                        "concept_id": "measurement-collapse",
                        "type": "multiple_choice",
                        "difficulty": "Beginner",
                        "question": "Which phase of quantum circuit execution is non-unitary and irreversible?",
                        "options": [
                            "Measurement and wavefunction collapse",
                            "Hadamard gate application",
                            "CNOT gate application",
                            "Statevector phase rotation"
                        ],
                        "explanation": "Projective measurement collapses the quantum state probabilistically and is non-unitary and irreversible."
                    }
                ],
                "assessment": {
                    "id": "ass-1-4",
                    "title": "Quantum Measurement & Collapse Assessment",
                    "description": "Evaluate understanding of Born's Rule and projective measurements.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "If a qubit is in state |ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩ and measured, what state is it in immediately after measuring '0'?",
                            "options": [
                                "|0⟩",
                                "|1⟩",
                                "(1/√2)(|0⟩ + |1⟩)",
                                "Undefined"
                            ],
                            "explanation": "Upon measuring the eigenvalue corresponding to 0, the state collapses entirely into |0⟩."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 2: QUANTUM PRINCIPLES
    # -------------------------------------------------------------
    {
        "id": "mod-2",
        "title": "Module 2 — Quantum Principles",
        "description": "Quantum states, computational basis, superposition, complex amplitudes, phase, interference, Heisenberg uncertainty, no-cloning theorem, and entanglement.",
        "order": 2,
        "lessons": [
            {
                "id": "les-2-1",
                "module_id": "mod-2",
                "title": "01 — Quantum States & Basis Vectors",
                "description": "Hilbert spaces, bra-ket Dirac notation, orthonormal bases, and vector space representations.",
                "difficulty": "Beginner",
                "time_minutes": 10,
                "prerequisites": ["les-1-4"],
                "objectives": [
                    "Use Dirac ket |ψ⟩ and bra ⟨ψ| notations.",
                    "Define orthonormal basis vectors in 2D complex Hilbert space ℂ².",
                    "Calculate inner products and state overlaps."
                ],
                "sections": [
                    {
                        "title": "Dirac Notation & Hilbert Space",
                        "type": "concept",
                        "content": "A quantum state is represented as a unit vector in complex Hilbert space ℂ². In Dirac notation, a state is written as a 'ket' |ψ⟩, and its conjugate transpose is the 'bra' ⟨ψ|."
                    },
                    {
                        "title": "Inner Product & Orthonormality",
                        "type": "math",
                        "content": "Computational basis states satisfy orthonormality: ⟨0|0⟩ = 1, ⟨1|1⟩ = 1, and ⟨0|1⟩ = 0.",
                        "latex_math": "\\langle 0 | 0 \\rangle = 1, \\quad \\langle 1 | 1 \\rangle = 1, \\quad \\langle 0 | 1 \\rangle = 0"
                    }
                ],
                "takeaway": "Quantum states are normalized vectors in complex Hilbert spaces, manipulated via unitary linear algebra.",
                "preset_circuit": [],
                "exercises": [
                    {
                        "id": "ex-2-1-1",
                        "concept_id": "quantum-state",
                        "type": "multiple_choice",
                        "difficulty": "Beginner",
                        "question": "What is the value of the inner product ⟨0|1⟩ for standard computational basis states?",
                        "options": ["0", "1", "-1", "1/√2"],
                        "explanation": "Orthogonal basis vectors have an inner product of 0."
                    }
                ],
                "assessment": {
                    "id": "ass-2-1",
                    "title": "Quantum States & Basis Assessment",
                    "description": "Testing vector notation and Hilbert spaces.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the conjugate transpose of ket vector |ψ⟩ = [α, β]^T?",
                            "options": [
                                "⟨ψ| = [α*, β*]",
                                "⟨ψ| = [α, β]",
                                "⟨ψ| = [β*, α*]",
                                "⟨ψ| = [1/α, 1/β]"
                            ],
                            "explanation": "The bra ⟨ψ| is the row vector of complex conjugates [α*, β*]."
                        }
                    ]
                }
            },
            {
                "id": "les-2-2",
                "module_id": "mod-2",
                "title": "02 — Superposition, Amplitudes & Phase",
                "description": "Coherent linear combinations, complex probability amplitudes, relative phase vs global phase.",
                "difficulty": "Beginner",
                "time_minutes": 12,
                "prerequisites": ["les-2-1"],
                "objectives": [
                    "Represent arbitrary single-qubit states with complex amplitudes α and β.",
                    "Distinguish relative phase e^(iφ) from unobservable global phase e^(iθ).",
                    "Compute outcome probabilities using the amplitude square norm."
                ],
                "sections": [
                    {
                        "title": "Linear Superposition",
                        "type": "concept",
                        "content": "Unlike classical bits that are strictly 0 or 1, a qubit can exist in a simultaneous linear superposition |ψ⟩ = α|0⟩ + β|1⟩. The amplitudes α and β are complex numbers carrying both magnitude and phase."
                    },
                    {
                        "title": "Relative Phase Parameterization",
                        "type": "math",
                        "content": "Ignoring unobservable global phase, any single qubit state can be written as: |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ) sin(θ/2)|1⟩.",
                        "latex_math": "|\\psi\\rangle = \\cos(\\theta/2)|0\\rangle + e^{i\\phi}\\sin(\\theta/2)|1\\rangle"
                    }
                ],
                "takeaway": "Quantum speedup stems from complex amplitudes that can constructively reinforce correct answers and cancel errors.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "s", "qubits": [0], "targets": [0], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-2-2-1",
                        "concept_id": "superposition-phase",
                        "type": "multiple_choice",
                        "difficulty": "Beginner",
                        "question": "What is the relative phase between |0⟩ and |1⟩ in the state |−⟩ = (1/√2)(|0⟩ − |1⟩)?",
                        "options": ["π radians (180°)", "0 radians", "π/2 radians (90°)", "2π radians"],
                        "explanation": "Since -1 = e^(iπ), the relative phase between the basis components is π radians."
                    }
                ],
                "assessment": {
                    "id": "ass-2-2",
                    "title": "Superposition & Phase Assessment",
                    "description": "Evaluate phase calculations and complex probability amplitudes.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "Why is a global phase factor e^(iγ) unobservable in quantum measurement?",
                            "options": [
                                "Because |e^(iγ)·c|² = |e^(iγ)|²·|c|² = 1·|c|² = |c|²",
                                "Because detectors filter out global phases",
                                "Because quantum circuits cancel it automatically",
                                "Because global phase equals zero"
                            ],
                            "explanation": "Multiplying state |ψ⟩ by e^(iγ) leaves all measurement probabilities |⟨k|e^(iγ)ψ⟩|² unchanged."
                        }
                    ]
                }
            },
            {
                "id": "les-2-3",
                "module_id": "mod-2",
                "title": "03 — Quantum Interference & Wavefunction Dynamics",
                "description": "Constructive and destructive interference of probability amplitudes in quantum circuits.",
                "difficulty": "Intermediate",
                "time_minutes": 12,
                "prerequisites": ["les-2-2"],
                "objectives": [
                    "Explain constructive and destructive quantum interference.",
                    "Analyze Mach-Zehnder interferometer analogs using Hadamard gates.",
                    "Construct an H-Z-H circuit and predict the deterministic collapse."
                ],
                "sections": [
                    {
                        "title": "Interference of Amplitudes",
                        "type": "concept",
                        "content": "In classical probability, probabilities always add positively (P = P₁ + P₂). In quantum computing, complex amplitudes add linearly (c = c₁ + c₂), allowing amplitudes with opposite signs to cancel out destructively to zero."
                    },
                    {
                        "title": "H-Z-H Quantum Interference",
                        "type": "math",
                        "content": "Applying H to |0⟩ yields (|0⟩+|1⟩)/√2. Applying Z flips the phase to (|0⟩−|1⟩)/√2. Applying H again yields |1⟩ deterministically due to destructive cancellation of the |0⟩ amplitude.",
                        "latex_math": "H Z H |0\\rangle = H \\left(\\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}\\right) = |1\\rangle"
                    }
                ],
                "takeaway": "Quantum algorithms harness destructive interference to suppress incorrect answers and constructive interference to amplify correct solutions.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "z", "qubits": [0], "targets": [0], "controls": []}, {"gate": "h", "qubits": [0], "targets": [0], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-2-3-1",
                        "concept_id": "quantum-interference",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "What is the final state after applying H, then Z, then H to initial state |0⟩?",
                        "options": ["|1⟩", "|0⟩", "(|0⟩+|1⟩)/√2", "(|0⟩-|1⟩)/√2"],
                        "explanation": "H|0⟩ = |+⟩, Z|+⟩ = |-⟩, H|-⟩ = |1⟩ due to constructive interference for |1⟩ and destructive for |0⟩."
                    }
                ],
                "assessment": {
                    "id": "ass-2-3",
                    "title": "Interference Assessment",
                    "description": "Evaluate amplitude interference and multi-gate sequences.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the result of applying H-X-H to initial state |0⟩?",
                            "options": [
                                "|0⟩",
                                "|1⟩",
                                "(|0⟩+|1⟩)/√2",
                                "-|0⟩"
                            ],
                            "explanation": "H X H = Z, and Z|0⟩ = |0⟩."
                        }
                    ]
                }
            },
            {
                "id": "les-2-4",
                "module_id": "mod-2",
                "title": "04 — Uncertainty, No-Cloning & Entanglement",
                "description": "Heisenberg uncertainty principle, the No-Cloning Theorem proof, and non-local quantum correlations.",
                "difficulty": "Intermediate",
                "time_minutes": 15,
                "prerequisites": ["les-2-3"],
                "objectives": [
                    "State the Heisenberg uncertainty principle for non-commuting observables [A, B] ≠ 0.",
                    "Mathematically prove the No-Cloning Theorem via linearity of quantum mechanics.",
                    "Define quantum entanglement as non-separable composite statevectors."
                ],
                "sections": [
                    {
                        "title": "The No-Cloning Theorem",
                        "type": "concept",
                        "content": "It is physically impossible to create an identical copy of an arbitrary unknown quantum state |ψ⟩. If a unitary cloning operator U existed such that U|ψ⟩|0⟩ = |ψ⟩|ψ⟩, linearity would require U(α|0⟩+β|1⟩)|0⟩ = α|00⟩ + β|11⟩, which is not equal to (α|0⟩+β|1⟩)(α|0⟩+β|1⟩)."
                    },
                    {
                        "title": "Mathematical Proof of No-Cloning",
                        "type": "math",
                        "content": "For two arbitrary states |ψ⟩ and |φ⟩, inner product preservation requires ⟨ψ|φ⟩ = (⟨ψ|φ⟩)², which holds only if ⟨ψ|φ⟩ = 0 or 1.",
                        "latex_math": "\\langle \\psi | \\phi \\rangle = (\\langle \\psi | \\phi \\rangle)^2 \\implies \\langle \\psi | \\phi \\rangle \\in \\{0, 1\\}"
                    }
                ],
                "takeaway": "No-cloning provides absolute security for quantum cryptography but prevents classical data copying and error correction.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "cx", "qubits": [1], "targets": [1], "controls": [0]}],
                "exercises": [
                    {
                        "id": "ex-2-4-1",
                        "concept_id": "no-cloning",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "Why does the No-Cloning Theorem hold in quantum mechanics?",
                        "options": [
                            "Because unitary operators are strictly linear",
                            "Because qubits lose energy continuously",
                            "Because quantum gates are noisy",
                            "Because measurement is impossible"
                        ],
                        "explanation": "The linearity of quantum mechanics forbids a universal unitary operator that duplicates arbitrary states."
                    }
                ],
                "assessment": {
                    "id": "ass-2-4",
                    "title": "Core Quantum Principles Assessment",
                    "description": "Testing no-cloning, uncertainty, and non-separability.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "Can an unknown quantum state be copied perfectly without destroying the original?",
                            "options": [
                                "No, strictly forbidden by the No-Cloning Theorem",
                                "Yes, using CNOT gates",
                                "Yes, using quantum teleportation",
                                "Yes, if measured first"
                            ],
                            "explanation": "The No-Cloning Theorem strictly forbids exact cloning of unknown quantum states."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 3: QUBITS
    # -------------------------------------------------------------
    {
        "id": "mod-3",
        "title": "Module 3 — Qubits & State Representation",
        "description": "Classical bits vs. qubits, |0⟩ and |1⟩ bases, statevector parametrization, the 3D Bloch sphere, single-qubit states, and multi-qubit registers.",
        "order": 3,
        "lessons": [
            {
                "id": "les-3-1",
                "module_id": "mod-3",
                "title": "01 — Classical Bits vs. Quantum Bits",
                "description": "Discrete binary switches vs. continuous complex probability amplitudes.",
                "difficulty": "Beginner",
                "time_minutes": 8,
                "prerequisites": ["les-2-1"],
                "objectives": [
                    "Compare classical 0/1 bits with quantum qubits.",
                    "Understand exponential information capacity in N-qubit statevectors (2^N amplitudes).",
                    "Explain state readout limits (one bit per qubit upon measurement)."
                ],
                "sections": [
                    {
                        "title": "Bits vs Qubits",
                        "type": "concept",
                        "content": "A classical bit is a macroscopic voltage level representing exactly 0 or 1. A qubit is a two-state quantum system that can exist in any linear superposition α|0⟩ + β|1⟩ until measured."
                    }
                ],
                "takeaway": "N qubits hold 2^N simultaneous complex amplitudes in superposition.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-3-1-1",
                        "concept_id": "bell-state",
                        "type": "circuit_challenge",
                        "difficulty": "Intermediate",
                        "question": "Construct a Bell State (|00⟩ + |11⟩)/√2 using Hadamard and CNOT gates.",
                        "preset_gates": ["H", "CNOT"],
                        "target_behavior": {
                            "num_qubits": 2,
                            "min_prob_00": 0.45,
                            "min_prob_11": 0.45
                        }
                    }
                ],
                "assessment": {
                    "id": "ass-3-1",
                    "title": "Qubit Basics Assessment",
                    "description": "Evaluate understanding of qubit state spaces.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "How much classical information can be extracted from a single qubit measurement?",
                            "options": [
                                "Exactly 1 classical bit (Holevo's bound)",
                                "Infinite bits",
                                "2 bits",
                                "2^N bits"
                            ],
                            "explanation": "By Holevo's bound, measuring a single qubit yields at most 1 bit of classical information."
                        }
                    ]
                }
            },
            {
                "id": "les-3-2",
                "module_id": "mod-3",
                "title": "02 — The 3D Bloch Sphere & Geometric Rotations",
                "description": "Mapping single-qubit states to the surface of a unit sphere (S²) with polar angle θ and azimuthal angle φ.",
                "difficulty": "Beginner",
                "time_minutes": 12,
                "prerequisites": ["les-3-1"],
                "objectives": [
                    "Identify the North Pole (|0⟩) and South Pole (|1⟩) of the Bloch sphere.",
                    "Locate equatorial states |+⟩, |−⟩, |+i⟩, |−i⟩.",
                    "Interpret unitary quantum gates as 3D rotations on the Bloch sphere."
                ],
                "sections": [
                    {
                        "title": "Bloch Sphere Coordinates",
                        "type": "concept",
                        "content": "Every pure single-qubit state corresponds to a unique point (x, y, z) on the unit sphere S²:\nx = sin θ cos φ, y = sin θ sin φ, z = cos θ.\n- North Pole (θ = 0): State |0⟩\n- South Pole (θ = π): State |1⟩\n- +X Axis (θ = π/2, φ = 0): State |+⟩\n- -X Axis (θ = π/2, φ = π): State |−⟩\n- +Y Axis (θ = π/2, φ = π/2): State |+i⟩\n- -Y Axis (θ = π/2, φ = 3π/2): State |−i⟩"
                    },
                    {
                        "title": "Bloch Vector Formula",
                        "type": "math",
                        "content": "The density matrix ρ in terms of the Bloch vector r⃗ is: ρ = ½ (I + r⃗ · σ⃗).",
                        "latex_math": "\\rho = \\frac{1}{2}\\left(I + \\vec{r}\\cdot\\vec{\\sigma}\\right)"
                    }
                ],
                "takeaway": "Single-qubit operations are rigid 3D rotations of the Bloch vector around specific axes.",
                "preset_circuit": [{"gate": "ry", "qubits": [0], "targets": [0], "controls": [], "params": {"theta": 1.5708}}],
                "exercises": [
                    {
                        "id": "ex-3-2-1",
                        "concept_id": "bloch-sphere",
                        "type": "multiple_choice",
                        "difficulty": "Beginner",
                        "question": "Which quantum state is located on the positive X-axis of the Bloch sphere?",
                        "options": [
                            "|+⟩ = (1/√2)(|0⟩ + |1⟩)",
                            "|0⟩",
                            "|1⟩",
                            "|+i⟩ = (1/√2)(|0⟩ + i|1⟩)"
                        ],
                        "explanation": "State |+⟩ has θ = π/2 and φ = 0, which corresponds to coordinates (1, 0, 0) on the +X axis."
                    }
                ],
                "assessment": {
                    "id": "ass-3-2",
                    "title": "Bloch Sphere Assessment",
                    "description": "Testing 3D geometric state representations.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What geometric operation does a Pauli-Z gate perform on the Bloch sphere?",
                            "options": [
                                "180° (π radian) rotation around the Z-axis",
                                "180° rotation around the X-axis",
                                "90° rotation around the Y-axis",
                                "Reflection through the origin"
                            ],
                            "explanation": "The Pauli-Z gate rotates the Bloch vector by π radians around the Z-axis."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 4: QUANTUM GATES
    # -------------------------------------------------------------
    {
        "id": "mod-4",
        "title": "Module 4 — Quantum Gates & Unitary Operations",
        "description": "Single-qubit gates (X, Y, Z, H, S, T, S†, T†, Rx, Ry, Rz), two-qubit gates (CNOT, CZ, SWAP, iSWAP, √SWAP), controlled gates, and multi-qubit gates (Toffoli, Fredkin).",
        "order": 4,
        "lessons": [
            {
                "id": "les-4-1",
                "module_id": "mod-4",
                "title": "01 — Single-Qubit Pauli & Hadamard Gates",
                "description": "Matrix definitions and transformations for Pauli-X, Y, Z and Hadamard H.",
                "difficulty": "Beginner",
                "time_minutes": 10,
                "prerequisites": ["les-3-2"],
                "objectives": [
                    "Write 2x2 unitary matrix representations for X, Y, Z, H.",
                    "Verify unitarity: U†U = I.",
                    "Apply gates to basis states |0⟩ and |1⟩."
                ],
                "sections": [
                    {
                        "title": "Pauli & Hadamard Matrices",
                        "type": "math",
                        "content": "X = [[0, 1], [1, 0]], Z = [[1, 0], [0, -1]], H = (1/√2)[[1, 1], [1, -1]].",
                        "latex_math": "X = \\begin{pmatrix}0 & 1\\\\ 1 & 0\\end{pmatrix}, \\quad Z = \\begin{pmatrix}1 & 0\\\\ 0 & -1\\end{pmatrix}, \\quad H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix}1 & 1\\\\ 1 & -1\\end{pmatrix}"
                    }
                ],
                "takeaway": "All quantum gates must be unitary matrices (U†U = I), preserving total probability equal to 1.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "x", "qubits": [0], "targets": [0], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-4-1-1",
                        "concept_id": "single-qubit-gates",
                        "type": "multiple_choice",
                        "difficulty": "Beginner",
                        "question": "What is the product H · H for the Hadamard gate?",
                        "options": ["Identity matrix I", "Pauli-X", "Pauli-Z", "Zero matrix"],
                        "explanation": "H is self-inverse (Hermitian and Unitary), so H · H = I."
                    }
                ],
                "assessment": {
                    "id": "ass-4-1",
                    "title": "Single-Qubit Gate Assessment",
                    "description": "Testing unitary gate transformations.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the result of applying the Pauli-X gate to state |1⟩?",
                            "options": ["|0⟩", "|1⟩", "-|1⟩", "i|0⟩"],
                            "explanation": "Pauli-X is the quantum bit-flip operator: X|1⟩ = |0⟩."
                        }
                    ]
                }
            },
            {
                "id": "les-4-2",
                "module_id": "mod-4",
                "title": "02 — Phase Shift Gates (S, T) & Rotations (Rx, Ry, Rz)",
                "description": "S (π/2), T (π/4), adjoints S†, T†, and arbitrary continuous parametric rotations.",
                "difficulty": "Intermediate",
                "time_minutes": 12,
                "prerequisites": ["les-4-1"],
                "objectives": [
                    "Distinguish S gate (Z^(1/2)) and T gate (Z^(1/4)).",
                    "Formulate continuous rotation operators Rx(θ), Ry(θ), Rz(θ).",
                    "Understand the Clifford+T universal gate set."
                ],
                "sections": [
                    {
                        "title": "Phase & Rotation Gates",
                        "type": "math",
                        "content": "S = diag(1, i) = diag(1, e^(iπ/2)), T = diag(1, e^(iπ/4)). Rotation: Rz(θ) = exp(-iθZ/2) = diag(e^(-iθ/2), e^(iθ/2)).",
                        "latex_math": "S = \\begin{pmatrix}1 & 0\\\\ 0 & i\\end{pmatrix}, \\quad T = \\begin{pmatrix}1 & 0\\\\ 0 & e^{i\\pi/4}\\end{pmatrix}"
                    }
                ],
                "takeaway": "The T gate provides non-Clifford capability required for fault-tolerant universal quantum computation.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "t", "qubits": [0], "targets": [0], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-4-2-1",
                        "concept_id": "phase-gates",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "What is the relationship between gate S and gate T?",
                        "options": ["T² = S", "S² = T", "T = S†", "S = T · H"],
                        "explanation": "T adds phase π/4; applying T twice adds phase π/2, which equals the S gate (T² = S)."
                    }
                ],
                "assessment": {
                    "id": "ass-4-2",
                    "title": "Phase Shift & Rotation Assessment",
                    "description": "Testing phase rotations and non-Clifford gates.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "How many T gates applied in series equal a Pauli-Z gate?",
                            "options": ["4", "2", "8", "1"],
                            "explanation": "Since T adds π/4 phase, 4 × (π/4) = π, which equals Pauli-Z (T⁴ = Z)."
                        }
                    ]
                }
            },
            {
                "id": "les-4-3",
                "module_id": "mod-4",
                "title": "03 — Two-Qubit Entangling Gates (CNOT, CZ, SWAP, iSWAP, √SWAP)",
                "description": "Controlled-NOT (CX), Controlled-Z (CZ), SWAP, and hardware-native fermionic gates.",
                "difficulty": "Intermediate",
                "time_minutes": 15,
                "prerequisites": ["les-4-2"],
                "objectives": [
                    "Construct 4x4 matrix representations for CNOT, CZ, and SWAP.",
                    "Demonstrate generation of entangled states from product states.",
                    "Synthesize SWAP from three CNOT gates."
                ],
                "sections": [
                    {
                        "title": "CNOT & Entanglement",
                        "type": "concept",
                        "content": "The CNOT (Controlled-X) gate flips the target qubit if and only if the control qubit is |1⟩. When applied to a control qubit in superposition (|0⟩+|1⟩)/√2 and target in |0⟩, it creates the entangled Bell state (|00⟩+|11⟩)/√2."
                    },
                    {
                        "title": "SWAP Decomposition",
                        "type": "math",
                        "content": "SWAP can be synthesized using three alternating CNOT gates: SWAP = CNOT(0,1) · CNOT(1,0) · CNOT(0,1).",
                        "latex_math": "\\text{SWAP} = \\text{CX}_{0\\to 1}\\,\\text{CX}_{1\\to 0}\\,\\text{CX}_{0\\to 1}"
                    }
                ],
                "takeaway": "Two-qubit entangling gates generate quantum correlations that cannot be factored into independent subsystems.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "cx", "qubits": [1], "targets": [1], "controls": [0]}],
                "exercises": [
                    {
                        "id": "ex-4-3-1",
                        "concept_id": "cnot-swap",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "How many CNOT gates are required to implement a SWAP gate between two connected qubits?",
                        "options": ["3", "1", "2", "4"],
                        "explanation": "A SWAP gate decomposes into exactly 3 alternating CNOT gates."
                    }
                ],
                "assessment": {
                    "id": "ass-4-3",
                    "title": "Two-Qubit Gates Assessment",
                    "description": "Testing 4x4 unitary operators and entangling operations.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the action of a CZ gate on the state |11⟩?",
                            "options": [
                                "-|11⟩ (adds a -1 phase factor)",
                                "|10⟩",
                                "|01⟩",
                                "|00⟩"
                            ],
                            "explanation": "CZ acts symmetrically by adding a -1 phase factor only to the |11⟩ state."
                        }
                    ]
                }
            },
            {
                "id": "les-4-4",
                "module_id": "mod-4",
                "title": "04 — Multi-Qubit Gates (Toffoli / CCX, Fredkin / CSWAP)",
                "description": "Three-qubit universal reversible classical-quantum gates and multi-controlled unitaries.",
                "difficulty": "Advanced",
                "time_minutes": 15,
                "prerequisites": ["les-4-3"],
                "objectives": [
                    "Define the Toffoli (CCX) gate and its role in quantum Boolean logic.",
                    "Define the Fredkin (Controlled-SWAP) gate.",
                    "Decompose Toffoli into single-qubit and CNOT 2-qubit basis gates."
                ],
                "sections": [
                    {
                        "title": "Universal Reversible Gates",
                        "type": "concept",
                        "content": "The Toffoli (CCX) gate flips the target qubit if both control qubits are in state |1⟩. It is universal for classical reversible computing (NAND equivalent) and serves as the core building block for quantum arithmetic and oracles."
                    }
                ],
                "takeaway": "Toffoli and Fredkin gates enable reversible logical AND, OR, and routing in quantum circuits.",
                "preset_circuit": [{"gate": "x", "qubits": [0], "targets": [0], "controls": []}, {"gate": "x", "qubits": [1], "targets": [1], "controls": []}, {"gate": "ccx", "qubits": [2], "targets": [2], "controls": [0, 1]}],
                "exercises": [
                    {
                        "id": "ex-4-4-1",
                        "concept_id": "toffoli-gate",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "If controls are q0=|1⟩, q1=|1⟩, and target is q2=|0⟩, what is the output of a Toffoli (CCX) gate?",
                        "options": ["q2 = |1⟩", "q2 = |0⟩", "q0 becomes |0⟩", "q1 becomes |0⟩"],
                        "explanation": "Since both controls are 1, the target qubit q2 flips from 0 to 1."
                    }
                ],
                "assessment": {
                    "id": "ass-4-4",
                    "title": "Multi-Qubit Gates Assessment",
                    "description": "Testing multi-controlled operations.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What classical gate can be simulated with a Toffoli gate by setting target to |1⟩?",
                            "options": ["NAND gate", "XOR gate", "OR gate", "NOT gate"],
                            "explanation": "When target is initialized to |1⟩, the output is 1 ⊕ (A ∧ B) = NOT(A AND B) = NAND(A, B)."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 5: QUANTUM CIRCUITS ⭐
    # -------------------------------------------------------------
    {
        "id": "mod-5",
        "title": "Module 5 — Quantum Circuits Studio ⭐",
        "description": "The master circuit laboratory: Basic circuits, Superposition layers, Phase kickback, Interference, Bell/GHZ/W entanglement, Controlled arithmetic, Oracles, Amplitude amplification, QFT, QPE, VQE/QAOA ansatz, Error-correction, Teleportation, and Benchmarking.",
        "order": 5,
        "lessons": [
            {
                "id": "les-5-1",
                "module_id": "mod-5",
                "title": "01 — Basic & Superposition Circuit Architectures",
                "description": "Identity, Pauli layers, Hadamard transforms, and uniform superposition over N qubits.",
                "difficulty": "Beginner",
                "time_minutes": 10,
                "prerequisites": ["les-4-1"],
                "objectives": [
                    "Construct parallel Hadamard registers H^⊗n.",
                    "Generate equal superpositions across 2^n states.",
                    "Verify probability normalization across 2, 3, and 4 qubits."
                ],
                "sections": [
                    {
                        "title": "Uniform Superposition Layer",
                        "type": "math",
                        "content": "Applying H to all n qubits initialized to |0⟩^⊗n yields: H^⊗n |0⟩^⊗n = (1/√2ⁿ) ∑_{x=0}^{2ⁿ-1} |x⟩.",
                        "latex_math": "H^{\\otimes n}|0\\rangle^{\\otimes n} = \\frac{1}{\\sqrt{2^n}}\\sum_{x=0}^{2^n-1}|x\\rangle"
                    }
                ],
                "takeaway": "A single layer of Hadamard gates creates an equal superposition of all 2^n computational states in O(1) circuit depth.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "h", "qubits": [1], "targets": [1], "controls": []}, {"gate": "h", "qubits": [2], "targets": [2], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-5-1-1",
                        "concept_id": "circuits-superposition",
                        "type": "multiple_choice",
                        "difficulty": "Beginner",
                        "question": "What is the probability amplitude of each basis state in a 3-qubit uniform superposition?",
                        "options": ["1/√8", "1/8", "1/√3", "1/3"],
                        "explanation": "For n=3 qubits, the amplitude is 1/√(2³) = 1/√8, giving probability (1/√8)² = 1/8 = 12.5% for each of the 8 states."
                    }
                ],
                "assessment": {
                    "id": "ass-5-1",
                    "title": "Basic & Superposition Circuits Assessment",
                    "description": "Testing Hadamard layers and state preparations.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "How many basis states exist in equal superposition for a 4-qubit Hadamard layer?",
                            "options": ["16", "8", "4", "32"],
                            "explanation": "2⁴ = 16 basis states from |0000⟩ to |1111⟩."
                        }
                    ]
                }
            },
            {
                "id": "les-5-2",
                "module_id": "mod-5",
                "title": "02 — Phase & Phase-Kickback Circuits",
                "description": "Phase kickback mechanism: transferring eigenvalue phases from target qubit to control qubit.",
                "difficulty": "Intermediate",
                "time_minutes": 15,
                "prerequisites": ["les-5-1"],
                "objectives": [
                    "Explain phase kickback using an eigenstate target |u⟩.",
                    "Demonstrate phase kickback using CNOT with target in |−⟩.",
                    "Construct phase kickback circuits for oracle evaluation."
                ],
                "sections": [
                    {
                        "title": "The Phase Kickback Mechanism",
                        "type": "concept",
                        "content": "When a controlled unitary CU is applied where the target qubit is in an eigenstate |u⟩ with eigenvalue e^(iφ) (so U|u⟩ = e^(iφ)|u⟩), the phase e^(iφ) is 'kicked back' onto the control qubit: (|0⟩+|1⟩)|u⟩ → (|0⟩ + e^(iφ)|1⟩)|u⟩."
                    }
                ],
                "takeaway": "Phase kickback converts black-box function evaluations into measurable relative phase shifts on control qubits.",
                "preset_circuit": [{"gate": "x", "qubits": [1], "targets": [1], "controls": []}, {"gate": "h", "qubits": [1], "targets": [1], "controls": []}, {"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "cx", "qubits": [1], "targets": [1], "controls": [0]}],
                "exercises": [
                    {
                        "id": "ex-5-2-1",
                        "concept_id": "phase-kickback",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "In a CNOT gate where control is |+⟩ and target is |−⟩, what is the final state of the control qubit?",
                        "options": ["|−⟩", "|+⟩", "|0⟩", "|1⟩"],
                        "explanation": "The target |−⟩ is an eigenstate of X with eigenvalue -1. CNOT kicks back the -1 phase to |1⟩ of the control, transforming |+⟩ into |−⟩."
                    }
                ],
                "assessment": {
                    "id": "ass-5-2",
                    "title": "Phase Kickback Assessment",
                    "description": "Testing phase kickback mechanics and eigenvalue transfer.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the key prerequisite for phase kickback to occur?",
                            "options": [
                                "The target qubit must be in an eigenstate of the applied controlled unitary",
                                "The control qubit must be in state |0⟩",
                                "Both qubits must be measured simultaneously",
                                "The circuit must use SWAP gates"
                            ],
                            "explanation": "Target must be in an eigenstate U|u⟩ = e^(iθ)|u⟩ so the scalar eigenvalue factors out into the control branch."
                        }
                    ]
                }
            },
            {
                "id": "les-5-3",
                "module_id": "mod-5",
                "title": "03 — Entanglement Circuits: Bell, EPR, GHZ & W States",
                "description": "Synthesizing 2-qubit Bell states (|Φ±⟩, |Ψ±⟩), 3-qubit GHZ states, and W states.",
                "difficulty": "Intermediate",
                "time_minutes": 15,
                "prerequisites": ["les-5-2"],
                "objectives": [
                    "Construct all 4 Bell states using H, X, Z, and CNOT.",
                    "Synthesize the 3-qubit Greenberger-Horne-Zeilinger (GHZ) state (|000⟩+|111⟩)/√2.",
                    "Synthesize the 3-qubit W state (|001⟩+|010⟩+|100⟩)/√3."
                ],
                "sections": [
                    {
                        "title": "The Four Bell Basis States",
                        "type": "math",
                        "content": "|Φ⁺⟩ = (|00⟩+|11⟩)/√2, |Φ⁻⟩ = (|00⟩-|11⟩)/√2, |Ψ⁺⟩ = (|01⟩+|10⟩)/√2, |Ψ⁻⟩ = (|01⟩-|10⟩)/√2.",
                        "latex_math": "|\\Phi^+\\rangle = \\frac{|00\\rangle+|11\\rangle}{\\sqrt{2}}, \\quad |\\Psi^+\\rangle = \\frac{|01\\rangle+|10\\rangle}{\\sqrt{2}}"
                    }
                ],
                "takeaway": "GHZ states exhibit maximal multi-partite entanglement, while W states are robust against single-qubit loss.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "cx", "qubits": [1], "targets": [1], "controls": [0]}, {"gate": "cx", "qubits": [2], "targets": [2], "controls": [1]}],
                "exercises": [
                    {
                        "id": "ex-5-3-1",
                        "concept_id": "bell-ghz-circuits",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "What circuit generates the 3-qubit GHZ state (|000⟩ + |111⟩)/√2 from |000⟩?",
                        "options": [
                            "H on q0, then CX(0→1), then CX(1→2)",
                            "H on all three qubits",
                            "X on q0, then SWAP(0,1), then SWAP(1,2)",
                            "CZ on all pairs"
                        ],
                        "explanation": "H(0) creates (|0⟩+|1⟩)/√2; CX(0→1) entangles q1 to (|00⟩+|11⟩)/√2; CX(1→2) entangles q2 to (|000⟩+|111⟩)/√2."
                    }
                ],
                "assessment": {
                    "id": "ass-5-3",
                    "title": "Entanglement Circuits Assessment",
                    "description": "Testing multi-qubit entangled state generation.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "If one qubit of a 3-qubit GHZ state (|000⟩+|111⟩)/√2 is lost or measured, what happens to the entanglement among the remaining 2 qubits?",
                            "options": [
                                "The remaining qubits collapse into a separable mixture (entanglement is completely destroyed)",
                                "The remaining qubits remain maximally entangled",
                                "The state becomes a W state",
                                "The state remains unchanged"
                            ],
                            "explanation": "GHZ entanglement is fragile: tracing out or measuring one qubit leaves the remaining qubits in an unentangled classical mixture."
                        }
                    ]
                }
            },
            {
                "id": "les-5-4",
                "module_id": "mod-5",
                "title": "04 — Quantum Arithmetic & Oracle Circuits",
                "description": "Quantum half-adders, full-adders, modular incrementers, phase oracles, and bit oracles.",
                "difficulty": "Advanced",
                "time_minutes": 18,
                "prerequisites": ["les-5-3"],
                "objectives": [
                    "Construct a reversible quantum half-adder with Toffoli and CNOT gates.",
                    "Design bit-flip oracles (U_f|x⟩|y⟩ = |x⟩|y ⊕ f(x)⟩).",
                    "Design phase-flip oracles (U_f|x⟩ = (-1)^f(x) |x⟩)."
                ],
                "sections": [
                    {
                        "title": "Quantum Addition & Oracles",
                        "type": "concept",
                        "content": "Quantum arithmetic uses reversible logic where CNOT computes sum bits (modulo 2) and Toffoli computes carry bits. Phase oracles encode boolean decision functions directly into amplitudes as sign inversions (-1)^f(x)."
                    }
                ],
                "takeaway": "Quantum oracles mark target states by flipping their phase, preparing them for amplitude amplification.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "h", "qubits": [1], "targets": [1], "controls": []}, {"gate": "cz", "qubits": [1], "targets": [1], "controls": [0]}],
                "exercises": [
                    {
                        "id": "ex-5-4-1",
                        "concept_id": "oracle-circuits",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "How does a phase oracle mark the target state |11⟩?",
                        "options": [
                            "By applying a Controlled-Z (CZ) gate between qubit 0 and qubit 1",
                            "By applying an X gate to qubit 0",
                            "By applying a Hadamard to qubit 1",
                            "By measuring both qubits"
                        ],
                        "explanation": "A CZ gate multiplies the amplitude of state |11⟩ by -1 while leaving |00⟩, |01⟩, and |10⟩ unchanged."
                    }
                ],
                "assessment": {
                    "id": "ass-5-4",
                    "title": "Quantum Arithmetic & Oracles Assessment",
                    "description": "Testing oracle constructions and arithmetic circuits.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What gate computes the carry bit (A AND B) in a quantum adder?",
                            "options": ["Toffoli (CCX)", "CNOT (CX)", "Hadamard (H)", "SWAP"],
                            "explanation": "The Toffoli gate implements reversible AND: CCX(A, B, Carry) sets Carry = A · B."
                        }
                    ]
                }
            },
            {
                "id": "les-5-5",
                "module_id": "mod-5",
                "title": "05 — Amplitude Amplification & Grover Iterations",
                "description": "Grover oracle, diffusion operator (inversion about the average), and optimal iteration counts.",
                "difficulty": "Advanced",
                "time_minutes": 20,
                "prerequisites": ["les-5-4"],
                "objectives": [
                    "Construct the Grover diffusion operator 2|s⟩⟨s| - I.",
                    "Calculate optimal Grover iterations R ≈ (π/4)√(N/M).",
                    "Trace 2D state space rotation from initial |s⟩ toward target |w⟩."
                ],
                "sections": [
                    {
                        "title": "Grover Operator G",
                        "type": "math",
                        "content": "Grover iteration G = D · O_w rotates the state vector by angle 2θ in the subspace spanned by target |w⟩ and uniform state |s⟩.",
                        "latex_math": "G = (2|s\\rangle\\langle s| - I) O_w, \\quad R \\approx \\frac{\\pi}{4}\\sqrt{\\frac{N}{M}}"
                    }
                ],
                "takeaway": "Grover search provides a provable quadratic speedup: O(√N) iterations compared to classical O(N).",
                "preset_circuit": [
                    {"gate": "h", "qubits": [0], "targets": [0], "controls": []},
                    {"gate": "h", "qubits": [1], "targets": [1], "controls": []},
                    {"gate": "cz", "qubits": [1], "targets": [1], "controls": [0]},
                    {"gate": "h", "qubits": [0], "targets": [0], "controls": []},
                    {"gate": "h", "qubits": [1], "targets": [1], "controls": []},
                    {"gate": "x", "qubits": [0], "targets": [0], "controls": []},
                    {"gate": "x", "qubits": [1], "targets": [1], "controls": []},
                    {"gate": "cz", "qubits": [1], "targets": [1], "controls": [0]},
                    {"gate": "x", "qubits": [0], "targets": [0], "controls": []},
                    {"gate": "x", "qubits": [1], "targets": [1], "controls": []},
                    {"gate": "h", "qubits": [0], "targets": [0], "controls": []},
                    {"gate": "h", "qubits": [1], "targets": [1], "controls": []}
                ],
                "exercises": [
                    {
                        "id": "ex-5-5-1",
                        "concept_id": "grover-iteration",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "For a 2-qubit database (N = 4 items, 1 target), how many Grover iterations are required for 100% success?",
                        "options": ["Exactly 1 iteration", "2 iterations", "4 iterations", "√2 iterations"],
                        "explanation": "For N=4, (π/4)√4 = π/2 radians, rotating initial |s⟩ exactly onto the marked target in exactly 1 iteration."
                    }
                ],
                "assessment": {
                    "id": "ass-5-5",
                    "title": "Amplitude Amplification Assessment",
                    "description": "Testing diffusion operators and Grover iterations.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What happens if you run Grover's algorithm for significantly more iterations than the optimal R?",
                            "options": [
                                "The target probability over-rotates and decreases ('overcooking')",
                                "The success probability stays at 100%",
                                "The computer halts",
                                "The qubit decoheres instantaneously"
                            ],
                            "explanation": "Grover's operator is a periodic rotation in 2D state space; extra iterations rotate past the target state, reducing success probability."
                        }
                    ]
                }
            },
            {
                "id": "les-5-6",
                "module_id": "mod-5",
                "title": "06 — Quantum Fourier Transform & Phase Estimation Circuits",
                "description": "QFT circuit topology with controlled phase rotations R_k, Inverse QFT, and Quantum Phase Estimation (QPE).",
                "difficulty": "Advanced",
                "time_minutes": 20,
                "prerequisites": ["les-5-5"],
                "objectives": [
                    "Construct n-qubit QFT using Hadamard and controlled-R_k phase gates.",
                    "Understand bit reversal SWAP layers in QFT.",
                    "Implement Quantum Phase Estimation to extract unitary eigenvalues."
                ],
                "sections": [
                    {
                        "title": "Discrete Quantum Fourier Transform",
                        "type": "math",
                        "content": "QFT maps computational basis states |j⟩ to frequency superposition states: QFT|j⟩ = (1/√N) ∑_{k=0}^{N-1} e^(2πijk/N) |k⟩.",
                        "latex_math": "\\text{QFT}|j\\rangle = \\frac{1}{\\sqrt{N}}\\sum_{k=0}^{N-1}e^{2\\pi i j k / N}|k\\rangle"
                    }
                ],
                "takeaway": "QFT executes the discrete Fourier transform in O(n²) quantum gates compared to classical FFT O(N log N) where N = 2^n.",
                "preset_circuit": [
                    {"gate": "h", "qubits": [0], "targets": [0], "controls": []},
                    {"gate": "rz", "qubits": [0], "targets": [0], "controls": [], "params": {"theta": 1.5708}},
                    {"gate": "h", "qubits": [1], "targets": [1], "controls": []}
                ],
                "exercises": [
                    {
                        "id": "ex-5-6-1",
                        "concept_id": "qft-circuits",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "What is the gate complexity of the Quantum Fourier Transform on n qubits?",
                        "options": ["O(n²)", "O(2ⁿ)", "O(n)", "O(n³)"],
                        "explanation": "QFT requires n(n+1)/2 gates, which scales quadratically with qubit count as O(n²)."
                    }
                ],
                "assessment": {
                    "id": "ass-5-6",
                    "title": "QFT & Phase Estimation Assessment",
                    "description": "Testing Fourier transformations and phase estimation circuits.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What does Quantum Phase Estimation (QPE) estimate?",
                            "options": [
                                "The phase eigenvalue θ where U|u⟩ = e^(2πiθ)|u⟩",
                                "The physical temperature of the cryostat",
                                "The number of gates in the circuit",
                                "The decoherence rate T1"
                            ],
                            "explanation": "QPE uses controlled-U operations and Inverse QFT to extract the binary expansion of phase θ."
                        }
                    ]
                }
            },
            {
                "id": "les-5-7",
                "module_id": "mod-5",
                "title": "07 — Quantum Teleportation & Communication Protocols",
                "description": "Transmitting an unknown qubit state across classical channels using shared entanglement and Bell measurement.",
                "difficulty": "Advanced",
                "time_minutes": 18,
                "prerequisites": ["les-5-3"],
                "objectives": [
                    "Step through the 3-qubit teleportation protocol.",
                    "Perform Bell state measurement on sender qubits.",
                    "Apply Pauli-X and Pauli-Z corrections on receiver qubit based on classical feedforward."
                ],
                "sections": [
                    {
                        "title": "Quantum Teleportation Protocol",
                        "type": "concept",
                        "content": "Teleportation transfers unknown state |ψ⟩ from Alice to Bob without physical qubit transport:\n1. Alice and Bob share an entangled Bell pair |Φ⁺⟩_BC.\n2. Alice performs a Bell measurement on |ψ⟩_A and her half of the pair B.\n3. Alice transmits 2 classical bits to Bob.\n4. Bob applies conditional Pauli corrections (I, X, Z, or ZX) to recover exact state |ψ⟩."
                    }
                ],
                "takeaway": "Teleportation does not violate relativity or no-cloning because classical bit communication is required to reconstruct the state.",
                "preset_circuit": [
                    {"gate": "h", "qubits": [1], "targets": [1], "controls": []},
                    {"gate": "cx", "qubits": [2], "targets": [2], "controls": [1]},
                    {"gate": "cx", "qubits": [1], "targets": [1], "controls": [0]},
                    {"gate": "h", "qubits": [0], "targets": [0], "controls": []}
                ],
                "exercises": [
                    {
                        "id": "ex-5-7-1",
                        "concept_id": "quantum-teleportation",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "How many classical bits must Alice send to Bob to complete teleportation of a single qubit?",
                        "options": ["2 classical bits", "1 classical bit", "0 bits (instantaneous)", "Infinite bits"],
                        "explanation": "Alice's Bell measurement produces one of 4 possible outcomes (00, 01, 10, 11), requiring 2 classical bits."
                    }
                ],
                "assessment": {
                    "id": "ass-5-7",
                    "title": "Quantum Teleportation Assessment",
                    "description": "Testing quantum communications and Bell measurements.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What happens to Alice's original state |ψ⟩ during the teleportation protocol?",
                            "options": [
                                "It collapses upon Bell measurement, satisfying the No-Cloning Theorem",
                                "It remains unchanged so Alice has a copy",
                                "It is reflected into space",
                                "It multiplies into 4 copies"
                            ],
                            "explanation": "Alice's measurement destroys her local quantum state, preventing cloning while reconstructing it at Bob's end."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 6: MULTI-QUBIT QUANTUM MECHANICS
    # -------------------------------------------------------------
    {
        "id": "mod-6",
        "title": "Module 6 — Multi-Qubit Quantum Mechanics",
        "description": "Tensor products, composite Hilbert state spaces (2ⁿ), Schmidt decomposition, bipartite/tripartite entanglement, Bell states, GHZ states, and W states.",
        "order": 6,
        "lessons": [
            {
                "id": "les-6-1",
                "module_id": "mod-6",
                "title": "01 — Tensor Products & Composite State Spaces",
                "description": "Kronecker tensor products, matrix scaling, and non-interacting product states.",
                "difficulty": "Intermediate",
                "time_minutes": 12,
                "prerequisites": ["les-3-2"],
                "objectives": [
                    "Compute Kronecker product A ⊗ B for vectors and matrices.",
                    "Represent separable product states |ψ⟩ = |q0⟩ ⊗ |q1⟩.",
                    "Explain exponential Hilbert space growth: dim(H) = 2ⁿ."
                ],
                "sections": [
                    {
                        "title": "Kronecker Product",
                        "type": "math",
                        "content": "For states |a⟩ = [a₀, a₁]^T and |b⟩ = [b₀, b₁]^T: |a⟩ ⊗ |b⟩ = [a₀b₀, a₀b₁, a₁b₀, a₁b₁]^T.",
                        "latex_math": "|a\\rangle \\otimes |b\\rangle = \\begin{pmatrix} a_0 b_0 \\\\ a_0 b_1 \\\\ a_1 b_0 \\\\ a_1 b_1 \\end{pmatrix}"
                    }
                ],
                "takeaway": "Quantum state spaces grow exponentially: 50 qubits require 2⁵⁰ (~1.125 quadrillion) complex numbers.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "h", "qubits": [1], "targets": [1], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-6-1-1",
                        "concept_id": "tensor-products",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "What is the tensor product |0⟩ ⊗ |1⟩ in column vector format?",
                        "options": ["[0, 1, 0, 0]^T", "[1, 0, 0, 0]^T", "[0, 0, 1, 0]^T", "[0, 0, 0, 1]^T"],
                        "explanation": "[1, 0]^T ⊗ [0, 1]^T = [1·0, 1·1, 0·0, 0·1]^T = [0, 1, 0, 0]^T."
                    }
                ],
                "assessment": {
                    "id": "ass-6-1",
                    "title": "Tensor Products Assessment",
                    "description": "Testing multi-qubit vector products.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the dimension of the composite Hilbert space for a 10-qubit quantum processor?",
                            "options": ["1024 (2¹⁰)", "20", "100", "10"],
                            "explanation": "dim(H) = 2¹⁰ = 1024 basis dimensions."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 7: QUANTUM ALGORITHM MACHINERY
    # -------------------------------------------------------------
    {
        "id": "mod-7",
        "title": "Module 7 — Quantum Algorithm Machinery",
        "description": "The fundamental mechanics powering quantum speedup: Superposition initialization, Phase kickback, Interference orchestration, Oracles, Amplitude amplification, and Quantum Fourier Transforms.",
        "order": 7,
        "lessons": [
            {
                "id": "les-7-1",
                "module_id": "mod-7",
                "title": "01 — Algorithmic Interference Orchestration",
                "description": "How quantum algorithms arrange phase patterns to cancel out wrong answers.",
                "difficulty": "Intermediate",
                "time_minutes": 12,
                "prerequisites": ["les-5-2"],
                "objectives": [
                    "Explain the complete quantum algorithm pipeline: Superpose → Compute Phase → Interfere → Measure.",
                    "Contrast classical exhaustive search with quantum amplitude routing.",
                    "Design destructive cancellation filters."
                ],
                "sections": [
                    {
                        "title": "The Quantum Algorithmic Blueprint",
                        "type": "concept",
                        "content": "All speedups follow a 4-step paradigm:\n1. Initialize uniform superposition across all candidate inputs.\n2. Apply problem Hamiltonian or Oracle to imprint phase signatures onto answers.\n3. Transform basis (e.g. Hadamard, QFT, Diffusion) so phase differences turn into destructive amplitude cancellations.\n4. Measure high-probability target states."
                    }
                ],
                "takeaway": "Quantum speedups do not test all solutions in parallel; they use interference to eliminate wrong solutions en masse.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "z", "qubits": [0], "targets": [0], "controls": []}, {"gate": "h", "qubits": [0], "targets": [0], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-7-1-1",
                        "concept_id": "algorithm-machinery",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "Why cannot a quantum computer simply inspect all 2^N parallel states individually without interference?",
                        "options": [
                            "Measurement immediately collapses the state to just one random state",
                            "The memory overflows",
                            "Gates cannot run on superposition",
                            "Qubits heat up too fast"
                        ],
                        "explanation": "Measurement collapses the statevector into a single random outcome unless interference concentrates probability into the answer."
                    }
                ],
                "assessment": {
                    "id": "ass-7-1",
                    "title": "Algorithm Machinery Assessment",
                    "description": "Testing quantum interference principles in algorithms.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the primary role of the Hadamard transform at the end of the Deutsch-Jozsa algorithm?",
                            "options": [
                                "It converts phase information into measurable computational basis probabilities",
                                "It resets qubits to ground state",
                                "It measures the circuit",
                                "It applies error correction"
                            ],
                            "explanation": "Hadamard transforms relative phase differences (-1)^f(x) back into constructive/destructive amplitude interference in basis states."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 8: QUANTUM ALGORITHMS
    # -------------------------------------------------------------
    {
        "id": "mod-8",
        "title": "Module 8 — Quantum Algorithms",
        "description": "Landmark algorithms: Deutsch, Deutsch–Jozsa, Bernstein–Vazirani, Simon's algorithm, Grover search, Quantum counting, QFT, Phase estimation, Shor's factoring, and Quantum walks.",
        "order": 8,
        "lessons": [
            {
                "id": "les-8-1",
                "module_id": "mod-8",
                "title": "01 — Deutsch & Deutsch–Jozsa Algorithm",
                "description": "Determining whether a black-box boolean function is constant or balanced in a single query.",
                "difficulty": "Intermediate",
                "time_minutes": 15,
                "prerequisites": ["les-7-1"],
                "objectives": [
                    "Define constant and balanced functions f: {0,1}^n → {0,1}.",
                    "Demonstrate exponential query speedup: 1 quantum query vs. 2^(n-1)+1 classical queries.",
                    "Construct Deutsch-Jozsa circuit."
                ],
                "sections": [
                    {
                        "title": "Deutsch-Jozsa Query Superiority",
                        "type": "concept",
                        "content": "For an n-bit function guaranteed to be either constant (all 0s or all 1s) or balanced (equal 0s and 1s), classical testing requires up to 2^(n-1)+1 queries. Deutsch-Jozsa determines the property with 100% certainty in exactly 1 quantum query."
                    }
                ],
                "takeaway": "Deutsch-Jozsa was the first exact proof of quantum exponential separation over deterministic classical algorithms.",
                "preset_circuit": [
                    {"gate": "x", "qubits": [1], "targets": [1], "controls": []},
                    {"gate": "h", "qubits": [0], "targets": [0], "controls": []},
                    {"gate": "h", "qubits": [1], "targets": [1], "controls": []},
                    {"gate": "cx", "qubits": [1], "targets": [1], "controls": [0]},
                    {"gate": "h", "qubits": [0], "targets": [0], "controls": []}
                ],
                "exercises": [
                    {
                        "id": "ex-8-1-1",
                        "concept_id": "deutsch-jozsa",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "If measuring the input qubits in Deutsch-Jozsa yields |00...0⟩, what is the function?",
                        "options": ["Constant function", "Balanced function", "Undefined", "Non-linear"],
                        "explanation": "If the function is constant, constructive interference places all probability on |00...0⟩; if balanced, probability on |00...0⟩ is exactly zero."
                    }
                ],
                "assessment": {
                    "id": "ass-8-1",
                    "title": "Deutsch-Jozsa Assessment",
                    "description": "Testing black-box oracle evaluations.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "How many queries does a classical deterministic algorithm need in the worst case for n=10 qubits?",
                            "options": ["513 (2⁹ + 1)", "1 query", "10 queries", "1024 queries"],
                            "explanation": "2^(n-1) + 1 = 2⁹ + 1 = 513 queries."
                        }
                    ]
                }
            },
            {
                "id": "les-8-2",
                "module_id": "mod-8",
                "title": "02 — Bernstein–Vazirani & Simon's Algorithm",
                "description": "Finding hidden bitstrings s with f(x) = s · x in 1 query, and Simon's period finding with exponential speedup.",
                "difficulty": "Intermediate",
                "time_minutes": 15,
                "prerequisites": ["les-8-1"],
                "objectives": [
                    "Extract hidden bitstring s ∈ {0,1}^n in a single query.",
                    "Understand Simon's period finding f(x) = f(y) ⇔ x ⊕ y ∈ {0, s}.",
                    "Solve linear systems of equations over GF(2)."
                ],
                "sections": [
                    {
                        "title": "Bernstein-Vazirani Protocol",
                        "type": "concept",
                        "content": "Given an oracle evaluating f(x) = s · x (mod 2), Bernstein-Vazirani recovers all n bits of hidden string s in a single query, compared to n queries classically."
                    }
                ],
                "takeaway": "Simon's algorithm inspired Peter Shor to invent quantum polynomial-time integer factorization.",
                "preset_circuit": [
                    {"gate": "x", "qubits": [2], "targets": [2], "controls": []},
                    {"gate": "h", "qubits": [0], "targets": [0], "controls": []},
                    {"gate": "h", "qubits": [1], "targets": [1], "controls": []},
                    {"gate": "h", "qubits": [2], "targets": [2], "controls": []},
                    {"gate": "cx", "qubits": [2], "targets": [2], "controls": [0]},
                    {"gate": "cx", "qubits": [2], "targets": [2], "controls": [1]},
                    {"gate": "h", "qubits": [0], "targets": [0], "controls": []},
                    {"gate": "h", "qubits": [1], "targets": [1], "controls": []}
                ],
                "exercises": [
                    {
                        "id": "ex-8-2-1",
                        "concept_id": "bernstein-vazirani",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "How many queries does Bernstein-Vazirani require to find an n-bit string s?",
                        "options": ["Exactly 1 query", "n queries", "2ⁿ queries", "log n queries"],
                        "explanation": "Bernstein-Vazirani recovers the entire n-bit string s deterministically in 1 query."
                    }
                ],
                "assessment": {
                    "id": "ass-8-2",
                    "title": "Bernstein-Vazirani & Simon Assessment",
                    "description": "Testing hidden string and period-finding algorithms.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "Simon's algorithm achieves what type of speedup over classical algorithms?",
                            "options": [
                                "Exponential speedup: O(n) quantum queries vs O(2^(n/2)) classical queries",
                                "Quadratic speedup",
                                "Polynomial speedup",
                                "Constant factor speedup"
                            ],
                            "explanation": "Simon's algorithm provides a provable exponential speedup in query complexity."
                        }
                    ]
                }
            },
            {
                "id": "les-8-3",
                "module_id": "mod-8",
                "title": "03 — Shor's Factorization Algorithm & Cryptanalysis",
                "description": "Breaking RSA cryptography: Reducing factoring to order-finding r such that a^r ≡ 1 (mod N) via QPE.",
                "difficulty": "Advanced",
                "time_minutes": 25,
                "prerequisites": ["les-5-6"],
                "objectives": [
                    "Explain reduction of integer factorization to modular order-finding.",
                    "Trace modular exponentiation circuits U_a|y⟩ = |ay mod N⟩.",
                    "Extract prime factors using greatest common divisor gcd(a^(r/2) ± 1, N)."
                ],
                "sections": [
                    {
                        "title": "Order Finding & Factoring",
                        "type": "concept",
                        "content": "To factor composite N = p · q, choose random a coprime to N. Shor's algorithm uses QPE to find period r of f(x) = a^x mod N in polynomial time O((log N)³). If r is even, gcd(a^(r/2) ± 1, N) reveals factors p and q with high probability."
                    }
                ],
                "takeaway": "Shor's algorithm breaks 2048-bit RSA in polynomial time on a fault-tolerant quantum computer.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "h", "qubits": [1], "targets": [1], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-8-3-1",
                        "concept_id": "shors-algorithm",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "What is the computational complexity of Shor's algorithm for factoring an L-bit integer?",
                        "options": ["Polynomial time: O(L³)", "Exponential time: O(2^L)", "Sub-exponential: O(exp(L^(1/3)))", "Linear time: O(L)"],
                        "explanation": "Shor's algorithm factors integers in polynomial time O((log N)³) = O(L³)."
                    }
                ],
                "assessment": {
                    "id": "ass-8-3",
                    "title": "Shor's Algorithm Assessment",
                    "description": "Testing modular arithmetic and period-finding cryptanalysis.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "Which classical public-key cryptosystems are rendered vulnerable by Shor's algorithm?",
                            "options": [
                                "RSA, Diffie-Hellman, and Elliptic Curve Cryptography (ECC)",
                                "AES-256 symmetric encryption",
                                "SHA-3 hashing",
                                "One-time pads"
                            ],
                            "explanation": "RSA, DH, and ECC rely on integer factorization and discrete logarithms, all solvable in polynomial time by Shor's algorithm."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 9: HYBRID / NISQ ALGORITHMS
    # -------------------------------------------------------------
    {
        "id": "mod-9",
        "title": "Module 9 — Hybrid & NISQ Algorithms",
        "description": "Variational Quantum Eigensolver (VQE), Quantum Approximate Optimization Algorithm (QAOA), Parameterized Quantum Circuits (PQC), and classical optimization loops.",
        "order": 9,
        "lessons": [
            {
                "id": "les-9-1",
                "module_id": "mod-9",
                "title": "01 — Variational Quantum Eigensolver (VQE) for Chemistry",
                "description": "Finding ground state energy of molecular Hamiltonians (H2, LiH) using the Rayleigh-Ritz variational theorem.",
                "difficulty": "Intermediate",
                "time_minutes": 15,
                "prerequisites": ["les-4-2"],
                "objectives": [
                    "State the variational principle: ⟨ψ(θ)|H|ψ(θ)⟩ ≥ E₀.",
                    "Design Hardware-Efficient and Unitary Coupled Cluster (UCCSD) ansätze.",
                    "Implement the hybrid quantum-classical optimization loop."
                ],
                "sections": [
                    {
                        "title": "The Variational Loop",
                        "type": "concept",
                        "content": "VQE evaluates expectation value ⟨H⟩ on a quantum processor using parameterized state |ψ(θ)⟩. A classical optimizer (e.g. COBYLA, Adam, SPSA) updates parameters θ to minimize energy toward the true ground state E₀."
                    }
                ],
                "takeaway": "VQE is tailored for Noisy Intermediate-Scale Quantum (NISQ) devices with shallow circuit depths.",
                "preset_circuit": [
                    {"gate": "ry", "qubits": [0], "targets": [0], "controls": [], "params": {"theta": 0.7854}},
                    {"gate": "cx", "qubits": [1], "targets": [1], "controls": [0]},
                    {"gate": "ry", "qubits": [1], "targets": [1], "controls": [], "params": {"theta": 1.5708}}
                ],
                "exercises": [
                    {
                        "id": "ex-9-1-1",
                        "concept_id": "vqe-chemistry",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "According to the Rayleigh-Ritz variational principle, what is the lower bound for expectation value ⟨ψ(θ)|H|ψ(θ)⟩?",
                        "options": ["The true ground state energy E₀", "Zero", "The highest eigenvalue E_max", "Infinity"],
                        "explanation": "⟨ψ|H|ψ⟩ is strictly greater than or equal to ground state energy E₀ for any state |ψ⟩."
                    }
                ],
                "assessment": {
                    "id": "ass-9-1",
                    "title": "VQE Assessment",
                    "description": "Testing variational algorithms and molecular ground states.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What part of the VQE algorithm is executed on the classical computer?",
                            "options": [
                                "The optimization algorithm that updates parameter angles θ",
                                "The preparation of quantum superposition",
                                "The entangling CNOT gates",
                                "The quantum statevector calculation"
                            ],
                            "explanation": "The classical computer runs numerical optimization (e.g., gradient descent/COBYLA) to iteratively update parameter vector θ."
                        }
                    ]
                }
            },
            {
                "id": "les-9-2",
                "module_id": "mod-9",
                "title": "02 — Quantum Approximate Optimization Algorithm (QAOA)",
                "description": "Solving combinatorial optimization and Max-Cut problems using alternating problem and mixer Hamiltonians.",
                "difficulty": "Advanced",
                "time_minutes": 18,
                "prerequisites": ["les-9-1"],
                "objectives": [
                    "Map graph Max-Cut problems into Ising spin Hamiltonians.",
                    "Construct alternating layers e^(-iγ H_C) and e^(-iβ H_M).",
                    "Optimize variational angles (γ, β) for maximum cut approximation."
                ],
                "sections": [
                    {
                        "title": "QAOA Layer Structure",
                        "type": "math",
                        "content": "A p-layer QAOA state is generated by: |γ, β⟩ = ∏_{k=1}^p e^(-iβ_k H_M) e^(-iγ_k H_C) |+⟩^⊗n.",
                        "latex_math": "|\\gamma, \\beta\\rangle = \\prod_{k=1}^p e^{-i\\beta_k H_M} e^{-i\\gamma_k H_C} |+\\rangle^{\\otimes n}"
                    }
                ],
                "takeaway": "QAOA discretizes adiabatic quantum computation into shallow variational circuits suitable for NISQ processors.",
                "preset_circuit": [
                    {"gate": "h", "qubits": [0], "targets": [0], "controls": []},
                    {"gate": "h", "qubits": [1], "targets": [1], "controls": []},
                    {"gate": "cx", "qubits": [1], "targets": [1], "controls": [0]},
                    {"gate": "rz", "qubits": [1], "targets": [1], "controls": [], "params": {"theta": 0.5}},
                    {"gate": "cx", "qubits": [1], "targets": [1], "controls": [0]},
                    {"gate": "rx", "qubits": [0], "targets": [0], "controls": [], "params": {"theta": 0.8}},
                    {"gate": "rx", "qubits": [1], "targets": [1], "controls": [], "params": {"theta": 0.8}}
                ],
                "exercises": [
                    {
                        "id": "ex-9-2-1",
                        "concept_id": "qaoa-optimization",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "What is the standard mixer Hamiltonian H_M used in QAOA for unconstrained binary optimization?",
                        "options": ["H_M = ∑ᵢ Xᵢ", "H_M = ∑ᵢ Zᵢ", "H_M = ∑_{i,j} ZᵢZⱼ", "H_M = ∑ᵢ Yᵢ"],
                        "explanation": "The standard transverse-field mixer Hamiltonian is H_M = ∑ᵢ Xᵢ, which drives transitions between all basis states."
                    }
                ],
                "assessment": {
                    "id": "ass-9-2",
                    "title": "QAOA Assessment",
                    "description": "Testing combinatorial graph optimization on quantum hardware.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "As QAOA layer depth p → ∞, what does the output state converge to?",
                            "options": [
                                "The exact optimal global solution (Adiabatic limit)",
                                "Completely random noise",
                                "Ground state |00...0⟩",
                                "Zero probability"
                            ],
                            "explanation": "By the adiabatic theorem, as p → ∞, QAOA converges to the exact ground state of the cost Hamiltonian."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 10: QUANTUM ERROR & NOISE
    # -------------------------------------------------------------
    {
        "id": "mod-10",
        "title": "Module 10 — Quantum Error & Noise",
        "description": "Decoherence mechanisms, T1 energy relaxation, T2* dephasing, coherent/incoherent gate errors, SPAM errors, crosstalk, and Lindblad master equations.",
        "order": 10,
        "lessons": [
            {
                "id": "les-10-1",
                "module_id": "mod-10",
                "title": "01 — Decoherence: T1 Relaxation & T2* Dephasing",
                "description": "Physical loss of quantum coherence through energy dissipation (T1) and random phase drift (T2).",
                "difficulty": "Intermediate",
                "time_minutes": 15,
                "prerequisites": ["les-3-2"],
                "objectives": [
                    "Define longitudinal relaxation time T1 (|1⟩ → |0⟩ decay).",
                    "Define transverse dephasing time T2 and pure dephasing T_φ (1/T2 = 1/(2T1) + 1/T_φ).",
                    "Calculate state purity decay over circuit depth."
                ],
                "sections": [
                    {
                        "title": "T1 and T2 Time Constants",
                        "type": "concept",
                        "content": "Qubits are fragile open quantum systems subject to environmental noise:\n- T1 (Energy Relaxation Time): The characteristic exponential timescale for an excited state |1⟩ to lose energy and decay to ground state |0⟩.\n- T2 (Dephasing Time): The timescale over which relative quantum phase information e^(iφ) is randomized due to magnetic and electric fluctuations."
                    },
                    {
                        "title": "Coherence Time Relation",
                        "type": "math",
                        "content": "The dephasing time is bounded by energy relaxation: 1/T2 = 1/(2T1) + 1/T_φ, hence T2 ≤ 2·T1.",
                        "latex_math": "\\frac{1}{T_2} = \\frac{1}{2T_1} + \\frac{1}{T_\\phi} \\implies T_2 \\le 2 T_1"
                    }
                ],
                "takeaway": "Quantum algorithms must execute within a small fraction of T1 and T2 before decoherence destroys information.",
                "preset_circuit": [{"gate": "x", "qubits": [0], "targets": [0], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-10-1-1",
                        "concept_id": "decoherence-t1-t2",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "What is the theoretical upper limit of the transverse dephasing time T2 in terms of T1?",
                        "options": ["T2 ≤ 2 · T1", "T2 ≤ T1", "T2 ≤ T1 / 2", "T2 has no limit"],
                        "explanation": "Because energy relaxation contributes 1/(2T1) to phase decay, the maximum possible T2 is 2·T1."
                    }
                ],
                "assessment": {
                    "id": "ass-10-1",
                    "title": "Decoherence & Noise Assessment",
                    "description": "Testing T1 relaxation, T2 dephasing, and coherence times.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What physical process corresponds to T1 relaxation in superconducting qubits?",
                            "options": [
                                "Spontaneous emission of a microwave photon into the cold environment",
                                "Magnetic flux drift in the SQUID loop",
                                "Laser frequency jitter",
                                "Bit-flip due to measurement"
                            ],
                            "explanation": "T1 is spontaneous energy relaxation where the transmon drops from |1⟩ to |0⟩ by emitting a microwave photon."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 11: QUANTUM ERROR CORRECTION
    # -------------------------------------------------------------
    {
        "id": "mod-11",
        "title": "Module 11 — Quantum Error Correction",
        "description": "Physical vs. logical qubits, 3-qubit bit-flip/phase-flip repetition codes, Shor's 9-qubit code, Steane code, syndrome extraction, fault tolerance, and surface codes.",
        "order": 11,
        "lessons": [
            {
                "id": "les-11-1",
                "module_id": "mod-11",
                "title": "01 — Repetition Codes & Syndrome Measurement",
                "description": "Protecting quantum information across entangled physical ancilla qubits without measuring and destroying data.",
                "difficulty": "Advanced",
                "time_minutes": 18,
                "prerequisites": ["les-10-1"],
                "objectives": [
                    "Construct the 3-qubit bit-flip code encoding: |0⟩_L = |000⟩, |1⟩_L = |111⟩.",
                    "Extract error syndromes using parity check ancilla qubits without collapsing logical data.",
                    "Perform active error recovery using conditional Pauli gates."
                ],
                "sections": [
                    {
                        "title": "The Quantum Error Correction Principle",
                        "type": "concept",
                        "content": "Because No-Cloning prevents copying data bits, QEC distributes logical information across entangled non-local degrees of freedom in multiple physical qubits. Ancilla qubits measure parity operators (e.g. Z₀Z₁, Z₁Z₂) to identify error locations without measuring individual data values."
                    }
                ],
                "takeaway": "Syndrome measurement extracts error locations while keeping the underlying superposition intact.",
                "preset_circuit": [
                    {"gate": "cx", "qubits": [1], "targets": [1], "controls": [0]},
                    {"gate": "cx", "qubits": [2], "targets": [2], "controls": [0]}
                ],
                "exercises": [
                    {
                        "id": "ex-11-1-1",
                        "concept_id": "qec-syndromes",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "In the 3-qubit bit-flip code, what does syndrome measurement detect?",
                        "options": [
                            "Relative parity differences between neighboring physical qubits",
                            "The exact statevector |ψ⟩",
                            "The temperature of the chip",
                            "The phase of the control qubit"
                        ],
                        "explanation": "Syndrome ancillas measure multi-qubit parities (Z⊗Z) to locate which physical qubit flipped without learning its value."
                    }
                ],
                "assessment": {
                    "id": "ass-11-1",
                    "title": "Quantum Error Correction Assessment",
                    "description": "Testing logical encoding and syndrome extraction.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the primary architectural requirement of 2D Surface Codes?",
                            "options": [
                                "Nearest-neighbor 2D square grid connectivity with X and Z stabilizer plaquettes",
                                "All-to-all connectivity across millions of qubits",
                                "Optical fiber connections",
                                "Zero Kelvin temperature"
                            ],
                            "explanation": "Surface codes require only 2D nearest-neighbor coupling on a planar square lattice with alternating vertex and plaquette stabilizers."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 12: QUANTUM HARDWARE
    # -------------------------------------------------------------
    {
        "id": "mod-12",
        "title": "Module 12 — Quantum Hardware Paradigms",
        "description": "Physical qubit architectures: Superconducting transmons, Trapped ions, Photonic linear optics, Neutral atom arrays, Silicon spin qubits, and Diamond NV centers.",
        "order": 12,
        "lessons": [
            {
                "id": "les-12-1",
                "module_id": "mod-12",
                "title": "01 — Physical Qubit Architectures Comparison",
                "description": "Comparing superconducting circuits (IBM, Google), trapped ions (IonQ), neutral atoms (QuEra), and photonics (PsiQuantum).",
                "difficulty": "Beginner",
                "time_minutes": 15,
                "prerequisites": ["les-1-3"],
                "objectives": [
                    "Compare physical operating temperatures (15 mK dilution refrigerators vs room temp photonics).",
                    "Evaluate gate speeds (nanoseconds for superconducting vs milliseconds for trapped ions).",
                    "Assess all-to-all vs planar nearest-neighbor connectivity."
                ],
                "sections": [
                    {
                        "title": "Hardware Modality Tradeoffs",
                        "type": "concept",
                        "content": "Different hardware implementations offer unique tradeoffs:\n- Superconducting Transmons: Ultra-fast gate times (10–50 ns), lithographic scalability, but limited to 15 mK cryogenic temperatures and planar 2D connectivity.\n- Trapped Ions: Identical atomic qubits, all-to-all connectivity, long coherence times (seconds), but slower gate execution (microseconds).\n- Neutral Atoms: Reconfigurable optical tweezer arrays in 2D/3D with Rydberg state entanglement.\n- Photonic: Operates at room temperature, ideal for networking, but probabilistic two-photon gates."
                    }
                ],
                "takeaway": "No single hardware platform dominates in every metric; each modality represents different engineering tradeoffs.",
                "preset_circuit": [],
                "exercises": [
                    {
                        "id": "ex-12-1-1",
                        "concept_id": "hardware-modalities",
                        "type": "multiple_choice",
                        "difficulty": "Beginner",
                        "question": "Which quantum hardware platform operates at room temperature without requiring cryogenic dilution refrigerators?",
                        "options": ["Photonic quantum computers", "Superconducting transmons", "Silicon spin qubits", "Semiconductor quantum dots"],
                        "explanation": "Photons do not interact easily with thermal environments, allowing room-temperature operations."
                    }
                ],
                "assessment": {
                    "id": "ass-12-1",
                    "title": "Hardware Modalities Assessment",
                    "description": "Testing physical hardware platforms and operating mechanisms.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "Why do superconducting quantum processors require dilution refrigerators operating at ~15 milliKelvin?",
                            "options": [
                                "To prevent ambient thermal energy (k_B · T) from exciting microwave qubit transitions (hf ≈ 5 GHz)",
                                "To keep the lasers aligned",
                                "To speed up classical computer chips",
                                "To prevent rust on wires"
                            ],
                            "explanation": "At 15 mK, thermal energy k_B·T is far below the microwave photon energy h·f (5 GHz ≈ 240 mK), suppressing thermal excitations."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 13: QUANTUM SOFTWARE
    # -------------------------------------------------------------
    {
        "id": "mod-13",
        "title": "Module 13 — Quantum Software & SDKs",
        "description": "Software frameworks: Qiskit, PennyLane, Cirq, quantum circuit abstraction, transpilation, basis gate compilation, noise models, and cloud execution.",
        "order": 13,
        "lessons": [
            {
                "id": "les-13-1",
                "module_id": "mod-13",
                "title": "01 — Circuit Transpilation & Compilation Pipeline",
                "description": "Transforming abstract mathematical circuits into hardware-compliant native basis gates and physical routing topology.",
                "difficulty": "Intermediate",
                "time_minutes": 12,
                "prerequisites": ["les-4-3"],
                "objectives": [
                    "Understand basis gate synthesis (e.g. {CX, Rz, SX, X}).",
                    "Explain qubit mapping, coupling graph routing, and SWAP insertion.",
                    "Optimize circuit depth and cancel redundant adjacent gates."
                ],
                "sections": [
                    {
                        "title": "The Transpilation Pipeline",
                        "type": "concept",
                        "content": "Transpilation translates hardware-agnostic circuits into target device constraints:\n1. Unrolling: Decomposing high-level gates into hardware basis gates.\n2. Layout: Mapping virtual circuit qubits onto highest-fidelity physical qubits.\n3. Routing: Inserting SWAP gates to satisfy physical coupling graph edges.\n4. Optimization: Cancelling redundant inverse gates (e.g. H·H = I) to minimize circuit depth."
                    }
                ],
                "takeaway": "Transpilation transforms high-level algorithms to maximize fidelity on physical quantum hardware.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "h", "qubits": [0], "targets": [0], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-13-1-1",
                        "concept_id": "transpilation-pipeline",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "What is the primary reason transpilers insert SWAP gates during compilation?",
                        "options": [
                            "To execute two-qubit gates between physical qubits that lack direct coupling graph edges",
                            "To slow down the circuit",
                            "To convert single-qubit gates into CNOTs",
                            "To reset measured qubits"
                        ],
                        "explanation": "If two qubits are not directly connected in hardware topology, SWAP gates move state information into adjacent positions."
                    }
                ],
                "assessment": {
                    "id": "ass-13-1",
                    "title": "Quantum Software & Transpilation Assessment",
                    "description": "Testing circuit optimization and compilation.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What happens when an optimizer detects consecutive gates H followed immediately by H on the same wire?",
                            "options": [
                                "Both gates are removed because H · H = I (Identity)",
                                "They are replaced by a Pauli-X gate",
                                "They are replaced by a CNOT",
                                "The circuit depth is doubled"
                            ],
                            "explanation": "Since Hadamard is self-inverse, consecutive pairs cancel out to identity, reducing noise and depth."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 14: QUANTUM VISUALIZATION
    # -------------------------------------------------------------
    {
        "id": "mod-14",
        "title": "Module 14 — Quantum Visualization & Diagnostics",
        "description": "Visualizing quantum states: Circuit schematics, 3D Bloch sphere vectors, statevector bar charts, complex phase color wheels, and measurement probability histograms.",
        "order": 14,
        "lessons": [
            {
                "id": "les-14-1",
                "module_id": "mod-14",
                "title": "01 — Statevector & Probability Diagnostics",
                "description": "Interpreting complex amplitudes, phase angles, density matrices, and shot-based probability distributions.",
                "difficulty": "Beginner",
                "time_minutes": 10,
                "prerequisites": ["les-3-2"],
                "objectives": [
                    "Read statevector bar charts showing real/imaginary parts or magnitude/phase.",
                    "Convert continuous amplitudes into expected shot counts P(x) · N_shots.",
                    "Diagnose circuit errors via quantum state tomography."
                ],
                "sections": [
                    {
                        "title": "Quantum Diagnostic Tools",
                        "type": "concept",
                        "content": "Simulating quantum systems relies on complementary visualizations:\n- 3D Bloch Sphere: Visualizing single-qubit unitary rotations and decoherence shrinkage.\n- Phase Color Wheels: Encoding complex amplitude phases φ ∈ [0, 2π) as colors.\n- Probability Histograms: Displaying empirical measurement counts across repeated experimental shots."
                    }
                ],
                "takeaway": "Visualizing amplitudes and phase angles provides intuitive understanding of constructive and destructive interference.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "s", "qubits": [0], "targets": [0], "controls": []}],
                "exercises": [
                    {
                        "id": "ex-14-1-1",
                        "concept_id": "visualization-diagnostics",
                        "type": "multiple_choice",
                        "difficulty": "Beginner",
                        "question": "What does the height of a probability histogram bar represent in quantum measurement results?",
                        "options": [
                            "The empirical frequency |c_x|² of measuring basis state |x⟩ across all shots",
                            "The physical temperature of the qubit",
                            "The duration of the microwave pulse",
                            "The phase angle φ"
                        ],
                        "explanation": "Histogram bar height corresponds directly to the measurement probability P(x) = |c_x|²."
                    }
                ],
                "assessment": {
                    "id": "ass-14-1",
                    "title": "Quantum Visualization Assessment",
                    "description": "Testing graphical representations of states and measurements.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "Can a 2-qubit entangled Bell state (|00⟩+|11⟩)/√2 be visualized as two separate individual points on two independent Bloch spheres?",
                            "options": [
                                "No, entangled states cannot be described by independent single-qubit Bloch vectors",
                                "Yes, each qubit is simply at the North Pole",
                                "Yes, each qubit is on the X axis",
                                "Yes, using three spheres"
                            ],
                            "explanation": "Entangled states are non-separable; individual reduced density matrices lie inside the sphere as mixed states with zero length vector."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 15: QUANTUM ADVANTAGES
    # -------------------------------------------------------------
    {
        "id": "mod-15",
        "title": "Module 15 — Quantum Advantages & Capabilities",
        "description": "Where quantum computers excel: Molecular chemistry simulations, material science, quadratic search speedups, combinatorial optimization, and cryptographic acceleration.",
        "order": 15,
        "lessons": [
            {
                "id": "les-15-1",
                "module_id": "mod-15",
                "title": "01 — Quantum Simulation & Chemical Supremacy",
                "description": "Feynman's vision: Simulating quantum systems using quantum hardware to solve electron correlations.",
                "difficulty": "Intermediate",
                "time_minutes": 12,
                "prerequisites": ["les-9-1"],
                "objectives": [
                    "Explain exponential scaling bottlenecks in classical chemistry simulation (Full Configuration Interaction).",
                    "Understand natural mapping of electronic Hamiltonians onto qubit registers via Jordan-Wigner transformation.",
                    "Identify key industrial applications in catalysts and battery chemistry."
                ],
                "sections": [
                    {
                        "title": "Feynman's Principle",
                        "type": "concept",
                        "content": "'Nature isn't classical, dammit, and if you want to make a simulation of nature, you'd better make it quantum mechanical' — Richard Feynman (1981). Classical supercomputers cannot simulate molecules with >100 strongly correlated electrons due to exponential Hilbert space growth."
                    }
                ],
                "takeaway": "Quantum simulation of molecules offers exponential memory and runtime advantages over classical chemistry approximations.",
                "preset_circuit": [],
                "exercises": [
                    {
                        "id": "ex-15-1-1",
                        "concept_id": "quantum-advantages",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "Which transformation maps fermionic creation/annihilation operators onto Pauli spin matrices for qubit simulation?",
                        "options": ["Jordan-Wigner transformation", "Fourier transform", "Laplace transform", "Hadamard transform"],
                        "explanation": "The Jordan-Wigner transformation maps fermionic anti-commutation relations onto Pauli operators."
                    }
                ],
                "assessment": {
                    "id": "ass-15-1",
                    "title": "Quantum Advantages Assessment",
                    "description": "Testing domains where quantum computing outperforms classical supercomputers.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "Why is nitrogenase enzyme simulation for room-temperature fertilizer synthesis a prime candidate for quantum advantage?",
                            "options": [
                                "The iron-molybdenum cofactor (FeMoco) has strong electron correlation that exceeds classical supercomputer memory",
                                "Because it is an integer factoring problem",
                                "Because it requires classical sorting",
                                "Because nitrogen is magnetic"
                            ],
                            "explanation": "FeMoco contains complex multi-center transition metal bonding requiring quantum simulation to calculate reaction barriers accurately."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 16: LIMITATIONS & CHALLENGES
    # -------------------------------------------------------------
    {
        "id": "mod-16",
        "title": "Module 16 — Limitations, Bottlenecks & Challenges",
        "description": "Physical decoherence, gate error rates, cryogenic scaling bottlenecks, interconnect wiring, fault-tolerance overhead, and the boundary between BQP, P, and NP.",
        "order": 16,
        "lessons": [
            {
                "id": "les-16-1",
                "module_id": "mod-16",
                "title": "01 — Realistic Challenges: Noise, Scale & Complexity Classes",
                "description": "Why quantum computers are not universally faster for all classical tasks and the engineering roadmap to fault tolerance.",
                "difficulty": "Beginner",
                "time_minutes": 12,
                "prerequisites": ["les-10-1", "les-11-1"],
                "objectives": [
                    "Dispel myths: Understand that quantum computers do NOT simply try all solutions simultaneously.",
                    "Define computational complexity classes: P, BQP, NP, NP-Complete.",
                    "Examine physical overhead: 1,000 to 10,000 physical qubits per fault-tolerant logical qubit."
                ],
                "sections": [
                    {
                        "title": "Complexity Classes & Realities",
                        "type": "concept",
                        "content": "Quantum computers are not magic general accelerators. They belong to complexity class BQP (Bounded-Error Quantum Polynomial-Time). For everyday sequential tasks (word processing, standard databases), classical processors remain vastly superior. Furthermore, fault-tolerant operation requires millions of physical qubits to generate thousands of logical qubits."
                    }
                ],
                "takeaway": "Quantum computing is a specialized accelerator for specific mathematical problem structures (periods, eigenvalues, Hamiltonians).",
                "preset_circuit": [],
                "exercises": [
                    {
                        "id": "ex-16-1-1",
                        "concept_id": "quantum-limitations",
                        "type": "multiple_choice",
                        "difficulty": "Beginner",
                        "question": "Is it proven that quantum computers can solve all NP-Complete problems in polynomial time (BQP = NP)?",
                        "options": [
                            "No, it is widely believed that NP-Complete problems are outside BQP",
                            "Yes, Grover's algorithm solves all NP-complete problems in O(1)",
                            "Yes, Shor's algorithm solves all NP problems",
                            "Yes, with 50 qubits"
                        ],
                        "explanation": "NP-complete problems have no known polynomial-time quantum algorithm; Grover provides only a quadratic speedup."
                    }
                ],
                "assessment": {
                    "id": "ass-16-1",
                    "title": "Limitations & Complexity Assessment",
                    "description": "Testing complexity boundaries and hardware scaling overhead.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "Approximately how many physical superconducting qubits are currently estimated to construct 1 high-fidelity logical qubit under surface code QEC?",
                            "options": [
                                "1,000 to 10,000 physical qubits",
                                "1 physical qubit",
                                "2 physical qubits",
                                "1,000,000 physical qubits"
                            ],
                            "explanation": "Given physical error rates of ~0.1%, surface codes require roughly 1,000–10,000 physical qubits per logical qubit."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 17: REAL-WORLD APPLICATIONS
    # -------------------------------------------------------------
    {
        "id": "mod-17",
        "title": "Module 17 — Real-World Industrial Applications",
        "description": "Transforming industries: Pharmaceuticals & drug discovery, material science, financial portfolio risk, quantum cryptography, quantum machine learning (QML), and quantum sensing.",
        "order": 17,
        "lessons": [
            {
                "id": "les-17-1",
                "module_id": "mod-17",
                "title": "01 — Industrial Impact & Horizon Roadmap",
                "description": "Real-world commercial pipelines in drug discovery, battery materials, logistics optimization, and post-quantum cryptography.",
                "difficulty": "Beginner",
                "time_minutes": 15,
                "prerequisites": ["les-15-1", "les-16-1"],
                "objectives": [
                    "Identify top commercial use cases across Pharma, Energy, Finance, and Cybersecurity.",
                    "Explain Post-Quantum Cryptography (PQC) migration standards (e.g. NIST lattice algorithms).",
                    "Understand Quantum Sensing applications in atomic clocks and gravimeters."
                ],
                "sections": [
                    {
                        "title": "The Commercial Quantum Landscape",
                        "type": "concept",
                        "content": "Quantum technologies impact multiple sectors:\n1. Life Sciences: Accelerating drug-target protein binding calculations and molecular docking.\n2. Materials & Energy: Designing solid-state battery electrolytes and carbon capture catalysts.\n3. Finance: Quadratic speedup in Monte Carlo risk modeling and quadratic portfolio optimization.\n4. Cybersecurity: Transitioning global infrastructure to NIST Post-Quantum Cryptography standards.\n5. Quantum Sensing: Ultra-precise gravimetry, navigation without GPS, and medical MEG brain imaging."
                    }
                ],
                "takeaway": "Quantum computing will transform fundamental science, materials design, and global security over the coming decades.",
                "preset_circuit": [{"gate": "h", "qubits": [0], "targets": [0], "controls": []}, {"gate": "rx", "qubits": [0], "targets": [0], "controls": [], "params": {"theta": 0.5}}],
                "exercises": [
                    {
                        "id": "ex-17-1-1",
                        "concept_id": "industrial-applications",
                        "type": "multiple_choice",
                        "difficulty": "Beginner",
                        "question": "What quantum algorithm provides a quadratic speedup for financial Monte Carlo derivative pricing?",
                        "options": ["Quantum Amplitude Estimation (QAE)", "Shor's algorithm", "Deutsch-Jozsa", "Teleportation"],
                        "explanation": "Quantum Amplitude Estimation estimates integrals and expected values with O(1/ε) complexity compared to classical Monte Carlo O(1/ε²)."
                    }
                ],
                "assessment": {
                    "id": "ass-17-1",
                    "title": "Real-World Applications Assessment",
                    "description": "Testing industrial applications and commercial impact.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the primary goal of NIST Post-Quantum Cryptography (PQC) standards?",
                            "options": [
                                "To deploy classical cryptographic algorithms (e.g., lattice-based) secure against attacks by quantum computers",
                                "To build faster quantum processors",
                                "To replace all computers with qubits",
                                "To measure quantum noise"
                            ],
                            "explanation": "PQC replaces RSA/ECC with mathematical problems (e.g., lattice cryptography) that are hard for both classical and quantum computers."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 18: QUANTUM MACHINE LEARNING (QML)
    # -------------------------------------------------------------
    {
        "id": "mod-18",
        "title": "Module 18 — Quantum Machine Learning (QML)",
        "description": "Parameterized Quantum Circuits (PQC), Quantum Feature Maps, Quantum Kernel Methods (QSVM), Barren Plateaus, and the Parameter-Shift Rule for analytic quantum gradients.",
        "order": 18,
        "lessons": [
            {
                "id": "les-18-1",
                "module_id": "mod-18",
                "title": "01 — Parameterized Quantum Circuits & Ansätze",
                "description": "Building quantum neural networks with variational rotation layers and entangling CNOT blocks.",
                "difficulty": "Intermediate",
                "time_minutes": 15,
                "prerequisites": ["les-9-1"],
                "objectives": [
                    "Formulate parameterized unitary circuits U(θ).",
                    "Distinguish hardware-efficient ansätze from problem-inspired ansätze.",
                    "Optimize variational cost functions via classical-quantum hybrid loops."
                ],
                "sections": [
                    {
                        "title": "Quantum Neural Network Architecture",
                        "type": "concept",
                        "content": "A Parameterized Quantum Circuit (PQC) acts as a quantum analog to classical deep neural network layers. Tunable rotation gates Ry(θ), Rz(φ) act as weight parameters, while CNOT/CZ gates provide multi-qubit non-linear correlations."
                    },
                    {
                        "title": "Variational State Formulation",
                        "type": "math",
                        "content": "The generated trial state is |ψ(θ)⟩ = U(θ)|00...0⟩, and the expectation value of Hamiltonian H is C(θ) = ⟨ψ(θ)|H|ψ(θ)⟩.",
                        "latex_math": "C(\\vec{\\theta}) = \\langle 0| U^{\\dagger}(\\vec{\\theta}) H U(\\vec{\\theta}) |0\\rangle"
                    }
                ],
                "takeaway": "PQCs transform quantum state space into differentiable parameter spaces optimized by classical gradient descent.",
                "preset_circuit": [
                    {"gate": "ry", "qubits": [0], "targets": [0], "params": {"theta": 0.785}},
                    {"gate": "ry", "qubits": [1], "targets": [1], "params": {"theta": 1.57}},
                    {"gate": "cx", "qubits": [0, 1], "targets": [1], "controls": [0]}
                ],
                "exercises": [
                    {
                        "id": "ex-18-1-1",
                        "concept_id": "qml-pqc",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "What role do parameterized rotation gates (e.g. Ry(θ), Rz(φ)) play in a Quantum Machine Learning circuit?",
                        "options": [
                            "They serve as trainable variational weights analogously to classical neural network weights",
                            "They permanently reset all qubits to zero",
                            "They encrypt the dataset with RSA",
                            "They perform error correction syndromes"
                        ],
                        "explanation": "Parameterized single-qubit rotations serve as the continuously differentiable variational parameters updated during training."
                    }
                ],
                "assessment": {
                    "id": "ass-18-1",
                    "title": "PQC Assessment",
                    "description": "Testing variational circuit architectures and optimization.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "Why are two-qubit entangling gates essential in a PQC ansatz?",
                            "options": [
                                "To generate non-separable multi-qubit correlations that cannot be factored into independent 1D distributions",
                                "To speed up microwave pulse clock cycles",
                                "To eliminate all quantum noise",
                                "To convert quantum data into classical text"
                            ],
                            "explanation": "Entanglement enables the circuit to explore the full 2^N dimensional Hilbert space rather than separable product states."
                        }
                    ]
                }
            },
            {
                "id": "les-18-2",
                "module_id": "mod-18",
                "title": "02 — Quantum Kernels & Quantum Support Vector Machines",
                "description": "Encoding non-linear classical features into exponentially large Hilbert spaces for linear classification.",
                "difficulty": "Advanced",
                "time_minutes": 15,
                "prerequisites": ["les-18-1"],
                "objectives": [
                    "Map classical data vectors x into quantum states |Φ(x)⟩.",
                    "Compute quantum kernel matrices K(x_i, x_j) = |⟨Φ(x_i)|Φ(x_j)⟩|².",
                    "Explain quantum advantage in classification via classically intractable feature maps."
                ],
                "sections": [
                    {
                        "title": "The Quantum Kernel Trick",
                        "type": "concept",
                        "content": "Support Vector Machines rely on kernel functions K(x, x') to compute inner products in higher-dimensional feature spaces. Quantum computers can evaluate inner products in exponentially large 2^N Hilbert spaces that are classically impossible to compute."
                    },
                    {
                        "title": "Quantum Kernel Formula",
                        "type": "math",
                        "content": "The transition fidelity between two feature-mapped states defines the kernel: K(x_i, x_j) = |⟨0| U^{\\dagger}(x_i) U(x_j) |0⟩|^2.",
                        "latex_math": "K(x_i, x_j) = |\\langle \\Phi(x_i) | \\Phi(x_j) \\rangle|^2 = |\\langle 0| U_{\\Phi}^{\\dagger}(x_i) U_{\\Phi}(x_j) |0\\rangle|^2"
                    }
                ],
                "takeaway": "Quantum kernels map complex non-linear classification boundaries into simple hyperplanes in Hilbert space.",
                "preset_circuit": [
                    {"gate": "h", "qubits": [0], "targets": [0]},
                    {"gate": "rz", "qubits": [0], "targets": [0], "params": {"theta": 1.2}},
                    {"gate": "h", "qubits": [1], "targets": [1]},
                    {"gate": "rz", "qubits": [1], "targets": [1], "params": {"theta": 2.4}}
                ],
                "exercises": [
                    {
                        "id": "ex-18-2-1",
                        "concept_id": "quantum-kernels",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "How is a quantum kernel value K(x_i, x_j) measured on a quantum processor?",
                        "options": [
                            "By applying U(x_j) followed by U†(x_i) and measuring the probability of observing ground state |00...0⟩",
                            "By calculating classical Euclidean distances",
                            "By running Shor's factoring algorithm",
                            "By taking the derivative of a loss function"
                        ],
                        "explanation": "Applying U(x_j) then U†(x_i) and measuring the projection onto |0...0⟩ directly yields fidelity |⟨Φ(x_i)|Φ(x_j)⟩|²."
                    }
                ],
                "assessment": {
                    "id": "ass-18-2",
                    "title": "Quantum Kernels Assessment",
                    "description": "Testing feature map encoding and fidelity measurements.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the dimension of the feature space for an N-qubit quantum feature map?",
                            "options": [
                                "2^N complex dimensions",
                                "N dimensions",
                                "N² dimensions",
                                "2N dimensions"
                            ],
                            "explanation": "An N-qubit register spans a 2^N dimensional complex Hilbert space."
                        }
                    ]
                }
            },
            {
                "id": "les-18-3",
                "module_id": "mod-18",
                "title": "03 — Barren Plateaus & The Parameter-Shift Rule",
                "description": "Vanishing gradient phenomena in deep random circuits and calculating exact analytic quantum gradients on real hardware.",
                "difficulty": "Advanced",
                "time_minutes": 18,
                "prerequisites": ["les-18-2"],
                "objectives": [
                    "Identify barren plateau symptoms: variance of gradients vanishing exponentially Var[∂C/∂θ] ~ O(2^-N).",
                    "Apply the Parameter-Shift Rule to compute exact analytic gradients without finite-difference noise.",
                    "Employ local cost functions and shallow ansätze to mitigate barren plateaus."
                ],
                "sections": [
                    {
                        "title": "The Parameter-Shift Rule",
                        "type": "concept",
                        "content": "Unlike classical finite differences that suffer from numerical instability in noisy environments, the Parameter-Shift Rule evaluates the exact analytical gradient of a quantum expectation value by shifting parameter θ forward and backward by π/2."
                    },
                    {
                        "title": "Analytical Gradient Equation",
                        "type": "math",
                        "content": "For generator G with eigenvalues ±1/2: ∂⟨H⟩/∂θ = ½ [ ⟨H⟩(θ + π/2) - ⟨H⟩(θ - π/2) ].",
                        "latex_math": "\\frac{\\partial \\langle H \\rangle}{\\partial \\theta} = \\frac{1}{2}\\left( \\langle H \\rangle_{\\theta + \\frac{\\pi}{2}} - \\langle H \\rangle_{\\theta - \\frac{\\pi}{2}} \\right)"
                    }
                ],
                "takeaway": "The Parameter-Shift Rule enables exact hardware-native gradient backpropagation without quantum state cloning.",
                "preset_circuit": [
                    {"gate": "ry", "qubits": [0], "targets": [0], "params": {"theta": 1.57}},
                    {"gate": "z", "qubits": [0], "targets": [0]}
                ],
                "exercises": [
                    {
                        "id": "ex-18-3-1",
                        "concept_id": "parameter-shift",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "How many quantum circuit evaluations are needed to calculate the exact gradient for 1 parameter using the parameter-shift rule?",
                        "options": [
                            "Exactly 2 circuit evaluations (+π/2 and -π/2 shifts)",
                            "1 evaluation",
                            "Infinite evaluations",
                            "2^N evaluations"
                        ],
                        "explanation": "Evaluating the circuit at θ + π/2 and θ - π/2 provides the exact analytical gradient."
                    }
                ],
                "assessment": {
                    "id": "ass-18-3",
                    "title": "Barren Plateaus & Gradients Assessment",
                    "description": "Testing gradient scaling and optimization barriers.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the primary cause of Barren Plateaus in variational quantum circuits?",
                            "options": [
                                "Deep Haar-random circuit parameterizations causing exponential concentration of measure in Hilbert space",
                                "Classical optimizer memory leaks",
                                "Excessive laser cooling",
                                "Zero qubit initialization"
                            ],
                            "explanation": "Random deep circuits sample Haar measure uniformly, causing the variance of gradients to vanish as O(2^-N)."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 19: QUANTUM CRYPTOGRAPHY & QKD
    # -------------------------------------------------------------
    {
        "id": "mod-19",
        "title": "Module 19 — Quantum Cryptography & QKD",
        "description": "The BB84 protocol, E91 entanglement-based key distribution, CHSH Bell inequality tests, and NIST Post-Quantum Cryptography standards.",
        "order": 19,
        "lessons": [
            {
                "id": "les-19-1",
                "module_id": "mod-19",
                "title": "01 — The BB84 Quantum Key Distribution Protocol",
                "description": "Unconditionally secure cryptographic key exchange leveraging single-photon polarization bases and the No-Cloning Theorem.",
                "difficulty": "Intermediate",
                "time_minutes": 15,
                "prerequisites": ["les-2-4"],
                "objectives": [
                    "Implement the 4 polarization states across Rectilinear (+) and Diagonal (×) bases.",
                    "Demonstrate basis sifting between Alice and Bob.",
                    "Calculate Quantum Bit Error Rate (QBER) to detect eavesdropper Eve."
                ],
                "sections": [
                    {
                        "title": "Principles of BB84",
                        "type": "concept",
                        "content": "Alice sends single photons randomly prepared in one of four states: |0⟩, |1⟩ (Rectilinear +) or |+⟩, |-⟩ (Diagonal ×). Bob randomly measures in either + or × basis. When their bases match (50% of the time), their bits agree perfectly. If Eve intercepts, wavefunction collapse introduces a 25% error rate on matching bases, exposing the intrusion."
                    },
                    {
                        "title": "QBER & Intercept-Resend Error",
                        "type": "math",
                        "content": "Eve's intercept-resend attack induces a theoretical error probability: P(Error) = 1/4 = 25% in the sifted key.",
                        "latex_math": "\\text{QBER}_{\\text{intercept}} = P(\\text{wrong basis}) \\times P(\\text{wrong outcome}) = \\frac{1}{2} \\times \\frac{1}{2} = 25\\%"
                    }
                ],
                "takeaway": "Quantum key distribution turns quantum measurement collapse from a hardware limitation into an unbreakable security guarantee.",
                "preset_circuit": [
                    {"gate": "h", "qubits": [0], "targets": [0]},
                    {"gate": "h", "qubits": [0], "targets": [0]}
                ],
                "exercises": [
                    {
                        "id": "ex-19-1-1",
                        "concept_id": "bb84-protocol",
                        "type": "multiple_choice",
                        "difficulty": "Intermediate",
                        "question": "What happens if eavesdropper Eve attempts an intercept-resend attack on a BB84 transmission?",
                        "options": [
                            "She introduces an unavoidable ~25% QBER in the sifted key due to basis measurement collapse",
                            "She successfully clones every photon without detection",
                            "The quantum channel permanently shuts down",
                            "Alice and Bob receive zero photons"
                        ],
                        "explanation": "Because Eve cannot know the chosen basis in advance, measuring in the wrong basis collapses the state and introduces 25% error into the sifted key."
                    }
                ],
                "assessment": {
                    "id": "ass-19-1",
                    "title": "BB84 Protocol Assessment",
                    "description": "Testing quantum key exchange mechanisms and error thresholds.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the typical maximum QBER threshold allowed before Alice and Bob abort key generation?",
                            "options": [
                                "~11% (the theoretical threshold for error correction and privacy amplification)",
                                "50%",
                                "100%",
                                "0.001%"
                            ],
                            "explanation": "11% is the standard Shor-Preskill security limit where classical privacy amplification can still distill a secure key."
                        }
                    ]
                }
            },
            {
                "id": "les-19-2",
                "module_id": "mod-19",
                "title": "02 — Entanglement-Based QKD (E91) & Bell Test",
                "description": "Ekert protocol using entangled EPR pairs and CHSH inequality violation to prove security against eavesdropping.",
                "difficulty": "Advanced",
                "time_minutes": 16,
                "prerequisites": ["les-19-1"],
                "objectives": [
                    "Explain the Ekert 1991 (E91) protocol using entangled Bell pairs (|00⟩+|11⟩)/√2.",
                    "Calculate the CHSH inequality correlation parameter S.",
                    "Distinguish local hidden variable limits (S ≤ 2) from quantum non-locality (S = 2√2 ≈ 2.828)."
                ],
                "sections": [
                    {
                        "title": "The E91 Protocol",
                        "type": "concept",
                        "content": "An entangled source distributes Bell pairs to Alice and Bob. Security is verified not merely through error statistics, but by testing the CHSH Bell inequality on a subset of measurement bases. Any eavesdropping destroys entanglement, causing S to drop below the quantum bound 2√2."
                    },
                    {
                        "title": "CHSH Inequality Violation",
                        "type": "math",
                        "content": "For quantum mechanics: S = |E(a,b) - E(a,b') + E(a',b) + E(a',b')| = 2√2 ≈ 2.828 > 2.",
                        "latex_math": "S_{\\text{quantum}} = 2\\sqrt{2} \\approx 2.828 \\le 4 \\quad (\\text{Tsirelson's Bound})"
                    }
                ],
                "takeaway": "E91 provides device-independent security: quantum non-locality guarantees privacy even if the source is untrusted.",
                "preset_circuit": [
                    {"gate": "h", "qubits": [0], "targets": [0]},
                    {"gate": "cx", "qubits": [0, 1], "targets": [1], "controls": [0]}
                ],
                "exercises": [
                    {
                        "id": "ex-19-2-1",
                        "concept_id": "e91-protocol",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "What is the maximum value of the CHSH correlation parameter S achievable under quantum mechanics (Tsirelson's bound)?",
                        "options": [
                            "2√2 ≈ 2.828",
                            "2.000",
                            "4.000",
                            "1.000"
                        ],
                        "explanation": "Tsirelson's bound proves that quantum mechanics can reach a maximum CHSH parameter of S = 2√2 ≈ 2.828."
                    }
                ],
                "assessment": {
                    "id": "ass-19-2",
                    "title": "E91 & Bell Non-Locality Assessment",
                    "description": "Testing EPR entanglement and CHSH tests.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "If an eavesdropper tampers with the entangled photons in E91, what happens to the measured Bell parameter S?",
                            "options": [
                                "S drops down toward the classical limit S ≤ 2",
                                "S increases to 4.0",
                                "S remains at 2√2",
                                "S becomes imaginary"
                            ],
                            "explanation": "Eavesdropping destroys quantum coherence and reduces correlations to classical local hidden variable bounds (S ≤ 2)."
                        }
                    ]
                }
            }
        ]
    },

    # -------------------------------------------------------------
    # MODULE 20: QUANTUM CHEMISTRY & SIMULATION
    # -------------------------------------------------------------
    {
        "id": "mod-20",
        "title": "Module 20 — Quantum Chemistry & Materials Simulation",
        "description": "Second quantization, Jordan-Wigner & Bravyi-Kitaev fermionic mappings, Molecular Hamiltonian ground-state VQE for H2/LiH, and Trotterized quantum dynamics.",
        "order": 20,
        "lessons": [
            {
                "id": "les-20-1",
                "module_id": "mod-20",
                "title": "01 — Second Quantization & Jordan-Wigner Mapping",
                "description": "Translating fermionic electron creation/annihilation operators with anti-commutation rules into Pauli qubit matrices.",
                "difficulty": "Advanced",
                "time_minutes": 18,
                "prerequisites": ["les-9-1"],
                "objectives": [
                    "Express molecular electronic Hamiltonians in second quantization.",
                    "Apply the Jordan-Wigner transformation to map fermionic operators to Pauli strings.",
                    "Identify non-local Pauli-Z parity strings in fermion-to-qubit mappings."
                ],
                "sections": [
                    {
                        "title": "Fermionic Anti-Commutation & Qubits",
                        "type": "concept",
                        "content": "Electrons are fermions whose wavefunctions are anti-symmetric under particle exchange: {a_i, a_j†} = δ_ij. Because qubits commute on distinct sites, we use the Jordan-Wigner transformation to attach Pauli-Z parity strings that maintain fermionic anti-symmetry."
                    },
                    {
                        "title": "Jordan-Wigner Mapping",
                        "type": "math",
                        "content": "Fermionic creation operator mapping: a_j† = (∏_{k<j} Z_k) ⊗ (X_j - iY_j) / 2.",
                        "latex_math": "a_j^{\\dagger} = \\left(\\bigotimes_{k=1}^{j-1} Z_k\\right) \\otimes \\left(\\frac{X_j - iY_j}{2}\\right)"
                    }
                ],
                "takeaway": "Jordan-Wigner maps complex molecular orbitals into weighted sums of Pauli spin Hamiltonians executable on quantum circuits.",
                "preset_circuit": [
                    {"gate": "x", "qubits": [0], "targets": [0]},
                    {"gate": "h", "qubits": [1], "targets": [1]},
                    {"gate": "cx", "qubits": [0, 1], "targets": [1], "controls": [0]}
                ],
                "exercises": [
                    {
                        "id": "ex-20-1-1",
                        "concept_id": "jordan-wigner",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "Why does the Jordan-Wigner transformation insert a string of Pauli-Z gates (∏_{k<j} Z_k) before the target operator?",
                        "options": [
                            "To preserve the anti-commutation relations required by Pauli exclusion for fermions",
                            "To amplify circuit speed",
                            "To suppress thermal decoherence",
                            "To measure classical charge"
                        ],
                        "explanation": "The Pauli-Z phase string maintains the anti-symmetric sign upon interchanging fermionic creation/annihilation operators."
                    }
                ],
                "assessment": {
                    "id": "ass-20-1",
                    "title": "Fermion Mapping Assessment",
                    "description": "Testing second quantization and Pauli string transformations.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "Which alternative transformation provides logarithmic O(log N) Pauli weight scaling compared to Jordan-Wigner's O(N)?",
                            "options": [
                                "Bravyi-Kitaev transformation",
                                "Fourier transform",
                                "Grover diffusion",
                                "Hadamard transform"
                            ],
                            "explanation": "The Bravyi-Kitaev transformation balances occupancy and parity, scaling as O(log N) Pauli strings."
                        }
                    ]
                }
            },
            {
                "id": "les-20-2",
                "module_id": "mod-20",
                "title": "02 — Molecular Ground State Energies with VQE",
                "description": "Simulating Hydrogen (H2) and Lithium Hydride (LiH) ground state potential energy curves and finding equilibrium bond lengths.",
                "difficulty": "Advanced",
                "time_minutes": 20,
                "prerequisites": ["les-20-1"],
                "objectives": [
                    "Construct Unitary Coupled Cluster (UCCSD) ansätze for molecular electron excitation.",
                    "Measure individual Pauli expectation values ⟨Z0⟩, ⟨Z1⟩, ⟨Z0Z1⟩, ⟨X0X1⟩ on quantum hardware.",
                    "Compute the H2 potential energy curve to locate the equilibrium bond distance (~0.74 Å)."
                ],
                "sections": [
                    {
                        "title": "VQE in Quantum Chemistry",
                        "type": "concept",
                        "content": "To compute chemical reaction rates and catalyst mechanisms, chemists must find the electronic ground state energy. VQE prepares parameterized molecular wavefunctions |ψ(θ)⟩ on a quantum processor and measures energy terms ⟨H⟩ to find the ground state via the Rayleigh-Ritz variational principle."
                    },
                    {
                        "title": "H2 Molecule 2-Qubit Hamiltonian",
                        "type": "math",
                        "content": "The minimal STO-3G basis Hamiltonian for H2 at bond distance R: H = g0 I + g1 Z0 + g2 Z1 + g3 Z0Z1 + g4 X0X1 + g5 Y0Y1.",
                        "latex_math": "H(R) = g_0(R) I + g_1(R) Z_0 + g_2(R) Z_1 + g_3(R) Z_0 Z_1 + g_4(R) X_0 X_1 + g_5(R) Y_0 Y_1"
                    }
                ],
                "takeaway": "Quantum chemistry with VQE represents the highest-value commercial killer app for near-term quantum processors.",
                "preset_circuit": [
                    {"gate": "x", "qubits": [0], "targets": [0]},
                    {"gate": "ry", "qubits": [1], "targets": [1], "params": {"theta": 0.35}},
                    {"gate": "cx", "qubits": [0, 1], "targets": [1], "controls": [0]}
                ],
                "exercises": [
                    {
                        "id": "ex-20-2-1",
                        "concept_id": "molecular-vqe",
                        "type": "multiple_choice",
                        "difficulty": "Advanced",
                        "question": "According to the Variational Principle, how does the expectation value ⟨ψ(θ)|H|ψ(θ)⟩ relate to the true ground state energy E0?",
                        "options": [
                            "⟨ψ(θ)|H|ψ(θ)⟩ ≥ E0 (Always an upper bound on true ground energy)",
                            "⟨ψ(θ)|H|ψ(θ)⟩ ≤ E0 (Always below true ground energy)",
                            "⟨ψ(θ)|H|ψ(θ)⟩ is completely unrelated to E0",
                            "⟨ψ(θ)|H|ψ(θ)⟩ is always zero"
                        ],
                        "explanation": "The Rayleigh-Ritz variational principle guarantees that any trial state expectation value is strictly greater than or equal to the ground state energy E0."
                    }
                ],
                "assessment": {
                    "id": "ass-20-2",
                    "title": "Molecular VQE Assessment",
                    "description": "Testing chemical potential energy surfaces and variational bounds.",
                    "questions": [
                        {
                            "id": "q1",
                            "question": "What is the equilibrium bond length of the H2 molecule where the ground state energy is minimized?",
                            "options": [
                                "Approximately 0.74 Å (0.74 × 10^-10 m)",
                                "10.0 Å",
                                "0.01 Å",
                                "100.0 Å"
                            ],
                            "explanation": "The minimum of the H2 potential energy curve occurs at an interatomic distance of R ≈ 0.74 Å."
                        }
                    ]
                }
            }
        ]
    }
]

