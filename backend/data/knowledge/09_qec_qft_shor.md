# Quantum Error Correction (QEC), QFT, and Shor's Algorithm

## QEC (Quantum Error Correction)
QEC protects quantum information from environmental decoherence.
The 3-qubit bit-flip code encodes 1 logical qubit into 3 physical qubits: |0_L⟩ = |000⟩, |1_L⟩ = |111⟩.
Syndrome measurements (CNOT pairs) detect bit-flip errors without collapsing the logical quantum superposition.

## QFT (Quantum Fourier Transform)
The QFT converts between time/computational basis and frequency/phase basis.
It uses Hadamard gates and controlled phase rotations CR_k = diag(1, 1, 1, e^{2πi/2^k}).

## Shor's Algorithm
Shor's algorithm computes integer factorization in polynomial time.
Order finding uses QFT to find the period r of a^x mod N. For N=15 and a=2, period r=4 yields factors gcd(2^(4/2) ± 1, 15) = 3 and 5.
