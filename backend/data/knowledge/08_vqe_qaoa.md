# Variational Quantum Eigensolver (VQE) and QAOA

## VQE (Variational Quantum Eigensolver)
VQE is a hybrid quantum-classical algorithm used to find the ground state energy of a molecular Hamiltonian H.
A parameterized quantum ansatz |ψ(θ)⟩ is prepared on a quantum computer, and classical optimization updates parameters θ to minimize ⟨ψ(θ)|H|ψ(θ)⟩.

## QAOA (Quantum Approximate Optimization Algorithm)
QAOA solves combinatorial optimization problems like MaxCut.
It alternates between a problem cost Hamiltonian H_C and a mixer Hamiltonian H_B: U(γ, β) = ∏ e^{-i β_k H_B} e^{-i γ_k H_C}.
Classical optimization updates parameters γ and β to maximize the expected cut value.
