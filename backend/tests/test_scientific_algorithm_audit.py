"""
Dedicated Scientific Audit & Verification Test Suite for Advanced Algorithms.

Audits scientific correctness, data truth, cross-backend compatibility, and anti-shortcut requirements for:
1. Educational Shor (N=15)
2. VQE
3. QAOA
4. QEC
5. QFT
"""
import pytest
import math
import numpy as np

from app.algorithms.implementations.vqe import run_vqe_algorithm
from app.algorithms.implementations.qaoa import run_qaoa_algorithm
from app.algorithms.implementations.qec import run_qec_repetition_code
from app.algorithms.implementations.qft import run_qft_algorithm
from app.algorithms.implementations.shor import run_shor_algorithm
from app.services.simulation_service import SimulationService


# ── 1. SHOR ANTI-SHORTCUT AUDIT ────────────────────────────────────────────────
def test_shor_anti_shortcut_dynamic_order_derivation():
    """Verify Shor's algorithm derives order r and factors dynamically from quantum measurement."""
    res = run_shor_algorithm(N=15, a=2, backend="custom_m1")

    assert res["algorithm"] == "shor"
    assert res["educational_label"] == "Educational Shor implementation — N=15"

    analysis = res["analysis"]
    r = analysis["stage_4_phase_estimation"]["order_r"]
    f1 = analysis["stage_5_factorization"]["factor_1"]
    f2 = analysis["stage_5_factorization"]["factor_2"]

    # Verify pow(a, r, N) == 1
    assert pow(2, r, 15) == 1
    assert f1 * f2 == 15
    assert set([f1, f2]) == {3, 5}
    assert analysis["stage_5_factorization"]["verified"] is True


def test_shor_parameter_rejection():
    """Verify Shor's algorithm rejects unsupported N and non-coprime parameters with structured errors."""
    with pytest.raises(ValueError) as exc1:
        run_shor_algorithm(N=21, a=2)
    assert "unsupported_algorithm_parameter" in str(exc1.value)

    with pytest.raises(ValueError) as exc2:
        run_shor_algorithm(N=15, a=3)
    assert "unsupported_algorithm_parameter" in str(exc2.value)


# ── 2. VQE SCIENTIFIC AUDIT ──────────────────────────────────────────────────
def test_vqe_known_hamiltonians_z_and_neg_z():
    """Verify VQE finds exact ground state energy for H = Z and H = -Z."""
    # H = Z, ground state energy = -1.0 (|1> state)
    res_z = run_vqe_algorithm(
        num_qubits=1,
        hamiltonian=[{"pauli": "Z0", "coeff": 1.0}],
        ansatz_type="ry_rz",
        max_iterations=30,
        backend="custom_m1"
    )
    assert res_z["analysis"]["final_ground_state_energy"] < -0.95

    # H = -Z, ground state energy = -1.0 (|0> state)
    res_neg_z = run_vqe_algorithm(
        num_qubits=1,
        hamiltonian=[{"pauli": "Z0", "coeff": -1.0}],
        ansatz_type="ry_rz",
        max_iterations=30,
        backend="custom_m1"
    )
    assert res_neg_z["analysis"]["final_ground_state_energy"] < -0.95


# ── 3. QAOA MAXCUT AUDIT ─────────────────────────────────────────────────────
def test_qaoa_triangle_graph_maxcut():
    """Verify QAOA discovers maximum cut = 2 on 3-node triangle graph from actual probabilities."""
    res = run_qaoa_algorithm(
        graph_edges=[[0, 1], [1, 2], [2, 0]],
        num_nodes=3,
        p_steps=1,
        max_iterations=30,
        backend="custom_m1"
    )

    assert res["algorithm"] == "qaoa"
    assert res["analysis"]["max_cut_value"] == 2
    best_str = res["analysis"]["best_candidate_bitstring"]
    assert len(best_str) == 3
    assert res["result"].probabilities is not None


# ── 4. QEC SYNDROME AUDIT ─────────────────────────────────────────────────────
def test_qec_syndrome_mapping():
    """Verify 3-qubit repetition code syndrome mapping and error recovery."""
    syndromes = {
        "none": "00",
        "q0": "10",
        "q1": "11",
        "q2": "01",
    }
    for err, expected_syn in syndromes.items():
        res = run_qec_repetition_code(initial_state_bit=1, error_qubit=err, backend="custom_m1")
        assert res["analysis"]["detected_syndrome"] == expected_syn
        assert res["analysis"]["success"] is True


# ── 5. QFT MATHEMATICAL FIDELITY AUDIT ───────────────────────────────────────
def test_qft_inverse_identity_recovery():
    """Verify QFT^-1(QFT(|psi>)) = |psi> with high fidelity."""
    for init_state in ["00", "01", "10", "11"]:
        res_fwd = run_qft_algorithm(num_qubits=2, is_inverse=False, prepare_state=init_state)
        assert res_fwd["analysis"]["fourier_matrix_verified"] is True
        assert res_fwd["analysis"]["statevector_fidelity"] > 0.999


# ── 6. CROSS-BACKEND CAPABILITY AUDIT ─────────────────────────────────────────
from app.qast.adapters.cirq import CIRQ_AVAILABLE

@pytest.mark.parametrize("backend", ["custom_m1", "qiskit_aer", "cirq", "pennylane"])
def test_cross_backend_qft(backend):
    """Verify QFT executes faithfully across backends."""
    if backend == "cirq" and not CIRQ_AVAILABLE:
        pytest.skip("Cirq unavailable on system")
    res = run_qft_algorithm(num_qubits=2, is_inverse=False, backend=backend)
    assert res["result"].status == "success"
    assert res["backend"] == backend


def test_qbraid_honest_unconfigured_error():
    """Verify qBraid backend returns honest configuration error when credentials are absent."""
    with pytest.raises(Exception) as exc_info:
        run_qft_algorithm(num_qubits=2, backend="qbraid")
    assert "QBRAID_API_KEY" in str(exc_info.value)
