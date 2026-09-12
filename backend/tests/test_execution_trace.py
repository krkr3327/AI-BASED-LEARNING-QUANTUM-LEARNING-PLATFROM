"""
Execution Trace Tests.

Validates that the canonical ExecutionTrace is correctly produced by each backend:
- real per-gate statevector snapshots
- correct provenance
- no synthetic trace steps
- measurement results from actual sampling
- empty trace (not fake steps) for unavailable cases

These tests verify Definition of Done conditions 4-5 and 13-14.
"""
import pytest
import numpy as np
from app.qast.nodes import Circuit, GateNode, MeasurementNode
from app.qast.adapters.custom_engine import CustomEngineAdapter
from app.qast.adapters.qiskit_aer import QiskitAerAdapter
from app.qast.adapters.cirq import CirqAdapter, CIRQ_AVAILABLE
from app.qast.adapters.pennylane import PennyLaneAdapter
from app.results.normalizers.custom_engine import CustomEngineNormalizer
from app.results.normalizers.qiskit_aer import QiskitAerNormalizer
from app.results.normalizers.cirq import CirqNormalizer
from app.results.normalizers.pennylane import PennyLaneNormalizer


def _make_circuit():
    """
    Build a 2-qubit circuit: H(q0) -> RY(0.7, q0) -> CNOT(q0,q1) -> M(q0,q1)
    This is NOT a named algorithm — it is an arbitrary circuit used only for testing.
    """
    return Circuit(
        num_qubits=2,
        num_cbits=2,
        operations=[
            GateNode(gate='H', qubits=[0]),
            GateNode(gate='RY', qubits=[0], parameters={'theta': 0.7}),
            GateNode(gate='CNOT', qubits=[0, 1]),
            MeasurementNode(qubits=[0, 1], cbits=[0, 1]),
        ]
    )


def _make_single_qubit_circuit():
    """1-qubit circuit: S -> H -> RZ(1.2) -> M."""
    return Circuit(
        num_qubits=1,
        num_cbits=1,
        operations=[
            GateNode(gate='S', qubits=[0]),
            GateNode(gate='H', qubits=[0]),
            GateNode(gate='RZ', qubits=[0], parameters={'theta': 1.2}),
            MeasurementNode(qubits=[0], cbits=[0]),
        ]
    )


class TestCustomEngineTrace:
    def test_trace_has_real_snapshots_per_gate(self):
        circuit = _make_circuit()
        adapter = CustomEngineAdapter()
        raw = adapter.execute(circuit)

        trace = raw['execution_trace']
        # 3 gates + 1 measurement = 4 steps
        assert len(trace) == 4, f"Expected 4 trace steps, got {len(trace)}"

    def test_trace_statevectors_differ_per_gate(self):
        circuit = _make_circuit()
        adapter = CustomEngineAdapter()
        raw = adapter.execute(circuit)

        trace = raw['execution_trace']
        gate_steps = [s for s in trace if s['operation_type'] == 'gate']
        for step in gate_steps:
            svb = [(a['real'], a['imag']) for a in step['statevector_before']]
            sva = [(a['real'], a['imag']) for a in step['statevector_after']]
            # State must change (H and RY guaranteed to change it)
            assert svb != sva, f"Gate {step['operation_name']} did not change state"

    def test_trace_measurement_has_actual_result(self):
        circuit = _make_circuit()
        adapter = CustomEngineAdapter()
        raw = adapter.execute(circuit)

        trace = raw['execution_trace']
        meas_steps = [s for s in trace if s['is_measurement']]
        assert len(meas_steps) >= 1, "No measurement steps found"
        for mstep in meas_steps:
            assert mstep['measurement_result'] is not None
            for bit in mstep['measurement_result']:
                assert bit in (0, 1), f"Invalid measurement bit: {bit}"

    def test_no_synthetic_trace_steps(self):
        """All trace steps must have provenance='real_execution'. No synthetic steps allowed."""
        circuit = _make_circuit()
        adapter = CustomEngineAdapter()
        raw = adapter.execute(circuit)

        for step in raw['execution_trace']:
            assert step['provenance'] == 'real_execution', \
                f"Found step with provenance={step['provenance']} — only real_execution is permitted"

    def test_trace_capability_is_full(self):
        circuit = _make_circuit()
        adapter = CustomEngineAdapter()
        raw = adapter.execute(circuit)
        assert raw['trace_capability'] == 'full'

    def test_single_qubit_trace(self):
        """Trace must work for any qubit count — not just 2."""
        circuit = _make_single_qubit_circuit()
        adapter = CustomEngineAdapter()
        raw = adapter.execute(circuit)

        trace = raw['execution_trace']
        gate_steps = [s for s in trace if s['operation_type'] == 'gate']
        assert len(gate_steps) == 3  # S, H, RZ
        # Each statevector should have 2^1 = 2 amplitudes
        for step in gate_steps:
            assert len(step['statevector_before']) == 2
            assert len(step['statevector_after']) == 2

    def test_trace_operation_names_match_qast(self):
        """Gate names in trace must match the Q-AST gate names — never hardcoded."""
        circuit = _make_circuit()
        adapter = CustomEngineAdapter()
        raw = adapter.execute(circuit)

        gate_steps = [s for s in raw['execution_trace'] if s['operation_type'] == 'gate']
        op_names = [s['operation_name'] for s in gate_steps]
        assert op_names == ['H', 'RY', 'CNOT'], f"Expected ['H', 'RY', 'CNOT'], got {op_names}"


class TestQiskitAerTrace:
    def test_qiskit_trace_has_gate_steps(self):
        circuit = _make_circuit()
        adapter = QiskitAerAdapter()
        raw = adapter.execute(circuit)

        trace = getattr(raw, 'execution_trace', [])
        gate_steps = [s for s in trace if s.get('operation_type') == 'gate']
        assert len(gate_steps) >= 2, f"Expected at least 2 gate trace steps, got {len(gate_steps)}"

    def test_qiskit_no_synthetic_steps(self):
        circuit = _make_circuit()
        adapter = QiskitAerAdapter()
        raw = adapter.execute(circuit)

        trace = getattr(raw, 'execution_trace', [])
        for step in trace:
            assert step.get('provenance') == 'real_execution', \
                f"Synthetic step detected: provenance={step.get('provenance')}"

    def test_qiskit_trace_capability_full(self):
        circuit = _make_circuit()
        adapter = QiskitAerAdapter()
        raw = adapter.execute(circuit)
        assert getattr(raw, 'trace_capability', 'unavailable') == 'full'

    def test_qiskit_normalizer_passes_trace_through(self):
        circuit = _make_circuit()
        adapter = QiskitAerAdapter()
        normalizer = QiskitAerNormalizer()
        raw = adapter.execute(circuit)
        result = normalizer.normalize(raw, circuit.num_qubits)

        assert result.status == 'success'
        assert len(result.execution_trace) > 0
        assert result.trace_capability.capability == 'full'


@pytest.mark.skipif(not CIRQ_AVAILABLE, reason="Cirq unavailable on system")
class TestCirqTrace:
    def test_cirq_trace_has_gate_steps(self):
        circuit = _make_circuit()
        adapter = CirqAdapter()
        raw = adapter.execute(circuit)

        trace = raw.get('execution_trace', [])
        gate_steps = [s for s in trace if s.get('operation_type') == 'gate']
        assert len(gate_steps) >= 2

    def test_cirq_no_synthetic_steps(self):
        circuit = _make_circuit()
        adapter = CirqAdapter()
        raw = adapter.execute(circuit)

        trace = raw.get('execution_trace', [])
        for step in trace:
            assert step.get('provenance') == 'real_execution'

    def test_cirq_trace_capability_full(self):
        circuit = _make_circuit()
        adapter = CirqAdapter()
        raw = adapter.execute(circuit)
        assert raw.get('trace_capability') == 'full'


class TestPennyLaneTrace:
    def test_pennylane_trace_has_gate_steps(self):
        # Gate-only circuit (no measurements for PennyLane trace compatibility)
        circuit = Circuit(
            num_qubits=2,
            num_cbits=0,
            operations=[
                GateNode(gate='H', qubits=[0]),
                GateNode(gate='RY', qubits=[1], parameters={'theta': 0.5}),
                GateNode(gate='CNOT', qubits=[0, 1]),
            ]
        )
        adapter = PennyLaneAdapter()
        raw = adapter.execute(circuit)

        trace = raw.get('execution_trace', [])
        gate_steps = [s for s in trace if s.get('operation_type') == 'gate']
        assert len(gate_steps) == 3

    def test_pennylane_no_synthetic_steps(self):
        circuit = Circuit(
            num_qubits=1,
            num_cbits=0,
            operations=[GateNode(gate='H', qubits=[0])]
        )
        adapter = PennyLaneAdapter()
        raw = adapter.execute(circuit)

        trace = raw.get('execution_trace', [])
        for step in trace:
            assert step.get('provenance') == 'real_execution'

    def test_pennylane_trace_capability_full_for_gate_only(self):
        circuit = Circuit(
            num_qubits=2, num_cbits=0,
            operations=[GateNode(gate='H', qubits=[0]), GateNode(gate='CNOT', qubits=[0, 1])]
        )
        adapter = PennyLaneAdapter()
        raw = adapter.execute(circuit)
        assert raw.get('trace_capability') == 'full'


class TestNoSyntheticTraceSteps:
    """
    Global contract test: no backend may produce synthetic trace steps.
    execution_trace must be either:
    - a non-empty list of TraceStep objects with provenance='real_execution', OR
    - an empty list [] (with trace_capability='unavailable')
    """

    def test_unavailable_trace_is_empty_not_synthetic(self):
        """
        If any backend cannot produce a trace, it must return [] not a fake step.
        Currently all backends produce full traces; this test guards against regression.
        """
        from app.results.models import TraceCapabilityInfo
        # Simulate what a backend returning unavailable would look like
        info = TraceCapabilityInfo(capability='unavailable', reason='test')
        assert info.capability == 'unavailable'
        # An unavailable trace must correspond to execution_trace = []
        # (verified in the normalizer: _convert_trace_steps returns [] for empty input)
        from app.results.normalizers.custom_engine import _convert_trace_steps
        assert _convert_trace_steps([], 'custom_m1') == []
        assert _convert_trace_steps(None, 'custom_m1') == []
