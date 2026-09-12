class QuantumEngineError(Exception):
    pass

class InvalidQubitIndexError(QuantumEngineError):
    def __init__(self, index: int, num_qubits: int):
        super().__init__(f"Invalid qubit index {index}. Must be between 0 and {num_qubits - 1}.")
        self.index = index
        self.num_qubits = num_qubits

class InvalidGateError(QuantumEngineError):
    def __init__(self, message: str):
        super().__init__(f"Invalid gate operation: {message}")
