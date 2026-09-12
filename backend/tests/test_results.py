import pytest
import numpy as np
from app.results.models import QuantumResult, ExecutionError
from app.results.normalizers.custom_engine import CustomEngineNormalizer

def test_custom_engine_normalizer_success():
    raw = {
        "probabilities": {"0": 1.0, "1": 0.0},
        "measured_state": "0",
        "statevector": np.array([1.0+0.0j, 0.0+0.0j])
    }
    
    normalizer = CustomEngineNormalizer()
    result = normalizer.normalize(raw, 1)
    
    assert result.status == "success"
    assert result.backend_name == "custom_m1"
    assert result.num_qubits == 1
    assert result.probabilities["0"] == 1.0
    assert result.measurement == "0"
    
    # Check Big-endian mapping / Complex serialization
    assert result.statevector[0].real == 1.0
    assert result.statevector[0].imag == 0.0
    assert result.statevector[1].real == 0.0

def test_normalization_error_handling():
    raw = {
        "statevector": "invalid_array_causing_crash" # will cause crash during loop
    }
    normalizer = CustomEngineNormalizer()
    result = normalizer.normalize(raw, 2)
    
    assert result.status == "error"
    assert result.error.error_type == "normalization_error"

def test_statevector_serialization_ordering():
    # Simulate |10> state
    raw = {
        "probabilities": {"00": 0.0, "01": 0.0, "10": 1.0, "11": 0.0},
        "measured_state": "10",
        "statevector": np.array([0, 0, 1.0, 0])
    }
    normalizer = CustomEngineNormalizer()
    result = normalizer.normalize(raw, 2)
    
    assert result.statevector[0].real == 0.0
    assert result.statevector[1].real == 0.0
    assert result.statevector[2].real == 1.0
    assert result.statevector[3].real == 0.0
