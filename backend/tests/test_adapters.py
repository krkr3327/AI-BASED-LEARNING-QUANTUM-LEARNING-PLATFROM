import pytest
import numpy as np
from app.qast.nodes import Circuit, GateNode
from app.qast.adapters.custom_engine import CustomEngineAdapter
from app.qast.adapters.qiskit_aer import QiskitAerAdapter
from app.qast.adapters.pennylane import PennyLaneAdapter
from app.qast.adapters.cirq import CirqAdapter, CIRQ_AVAILABLE
from app.results.normalizers.custom_engine import CustomEngineNormalizer
from app.results.normalizers.qiskit_aer import QiskitAerNormalizer
from app.results.normalizers.pennylane import PennyLaneNormalizer
from app.results.normalizers.cirq import CirqNormalizer

def test_cross_backend_universal():
    # Circuit: H(0), RX(pi/4)(1), CZ(0,1), SWAP(0,1)
    ops = [
        GateNode(gate="H", qubits=[0]),
        GateNode(gate="RX", qubits=[1], parameters={"theta": np.pi / 4}),
        GateNode(gate="CZ", qubits=[0, 1]),
        GateNode(gate="SWAP", qubits=[0, 1])
    ]
    circuit = Circuit(num_qubits=2, operations=ops)

    adapters = [
        (CustomEngineAdapter(), CustomEngineNormalizer()),
        (QiskitAerAdapter(), QiskitAerNormalizer()),
        (PennyLaneAdapter(), PennyLaneNormalizer()),
    ]
    if CIRQ_AVAILABLE:
        adapters.append((CirqAdapter(), CirqNormalizer()))

    results = []
    for adapter, normalizer in adapters:
        raw_res = adapter.execute(circuit)
        norm_res = normalizer.normalize(raw_res, circuit.num_qubits)
        results.append(norm_res)

    base = results[0]
    for other in results[1:]:
        assert base.num_qubits == other.num_qubits
        # Check probabilities
        for k in base.probabilities:
            assert np.isclose(base.probabilities[k], other.probabilities[k], atol=1e-5)
        # Check statevector
        for a, b in zip(base.statevector, other.statevector):
            assert np.isclose(a.real, b.real, atol=1e-5)
            assert np.isclose(a.imag, b.imag, atol=1e-5)
