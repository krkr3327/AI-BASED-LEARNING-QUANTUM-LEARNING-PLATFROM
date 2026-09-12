"""
Tests for Advanced Quantum Algorithm Engine (Phase 7).

Verifies VQE, QAOA MaxCut, 3-qubit QEC, QFT, and Educational Shor's Algorithm (N=15, a=2).
"""
import pytest
import math
import numpy as np

from app.algorithms.implementations.vqe import run_vqe_algorithm, build_vqe_ansatz
from app.algorithms.implementations.qaoa import run_qaoa_algorithm, build_qaoa_circuit, compute_maxcut_cost
from app.algorithms.implementations.qec import run_qec_repetition_code
from app.algorithms.implementations.qft import run_qft_algorithm, generate_qft_circuit
from app.algorithms.implementations.shor import run_shor_algorithm, generate_shor_15_circuit
from app.services.simulation_service import SimulationService


def test_vqe_algorithm_known_hamiltonian():
    # Single qubit Z Hamiltonian: H = -1.0 Z0, minimum energy = -1.0
    res = run_vqe_algorithm(
        num_qubits=1,
        hamiltonian=[{"pauli": "Z0", "coeff": -1.0}],
        ansatz_type="ry_rz",
        max_iterations=30,
        backend="custom_m1"
    )
    assert res["algorithm"] == "vqe"
    assert res["analysis"]["final_ground_state_energy"] < -0.95
    assert res["analysis"]["converged"] is True


def test_qaoa_algorithm_maxcut():
    # Triangle graph (0-1, 1-2, 2-0), max cut value = 2
    res = run_qaoa_algorithm(
        graph_edges=[[0, 1], [1, 2], [2, 0]],
        num_nodes=3,
        p_steps=1,
        max_iterations=30,
        backend="custom_m1"
    )
    assert res["algorithm"] == "qaoa"
    assert res["analysis"]["max_cut_value"] == 2
    assert len(res["analysis"]["best_candidate_bitstring"]) == 3


def test_qec_repetition_code_all_error_cases():
    # Case 1: No error
    res_none = run_qec_repetition_code(initial_state_bit=0, error_qubit="none")
    assert res_none["analysis"]["success"] is True
    assert res_none["analysis"]["detected_syndrome"] == "00"

    # Case 2: X error on q0
    res_q0 = run_qec_repetition_code(initial_state_bit=1, error_qubit="q0")
    assert res_q0["analysis"]["success"] is True
    assert res_q0["analysis"]["detected_syndrome"] == "10"

    # Case 3: X error on q1
    res_q1 = run_qec_repetition_code(initial_state_bit=0, error_qubit="q1")
    assert res_q1["analysis"]["success"] is True
    assert res_q1["analysis"]["detected_syndrome"] == "11"

    # Case 4: X error on q2
    res_q2 = run_qec_repetition_code(initial_state_bit=1, error_qubit="q2")
    assert res_q2["analysis"]["success"] is True
    assert res_q2["analysis"]["detected_syndrome"] == "01"


def test_qft_numerical_correctness():
    res_fwd = run_qft_algorithm(num_qubits=3, is_inverse=False, backend="custom_m1")
    assert res_fwd["analysis"]["fourier_matrix_verified"] is True
    assert res_fwd["analysis"]["statevector_fidelity"] > 0.99

    res_inv = run_qft_algorithm(num_qubits=3, is_inverse=True, prepare_state="001", backend="custom_m1")
    assert res_inv["analysis"]["fourier_matrix_verified"] is True
    assert res_inv["analysis"]["statevector_fidelity"] > 0.99


def test_shor_educational_n15():
    res = run_shor_algorithm(N=15, a=2, backend="custom_m1")
    assert res["algorithm"] == "shor"
    assert res["analysis"]["stage_5_factorization"]["factor_1"] in (3, 5)
    assert res["analysis"]["stage_5_factorization"]["factor_2"] in (3, 5)
    assert res["analysis"]["stage_5_factorization"]["verified"] is True

    # Check rejection of invalid N / a
    with pytest.raises(ValueError) as exc1:
        run_shor_algorithm(N=21, a=2)
    assert "unsupported_algorithm_parameter" in str(exc1.value)

    with pytest.raises(ValueError) as exc2:
        run_shor_algorithm(N=15, a=3)
    assert "unsupported_algorithm_parameter" in str(exc2.value)
