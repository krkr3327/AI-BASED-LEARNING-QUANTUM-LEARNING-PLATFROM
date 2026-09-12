from typing import Dict, Any, List, Optional
from app.schemas.ai import AIAction, AIContextEnvelope

# Approved registries for application-level action validation
APPROVED_GATES = {
    "H", "X", "Y", "Z", "S", "T", "SDG", "TDG",
    "RX", "RY", "RZ", "P", "PHASE",
    "CNOT", "CX", "CZ", "CY", "SWAP", "CH", "CP", "CRZ",
    "CCX", "TOFFOLI", "CSWAP",
    "MEASURE", "RESET"
}

APPROVED_ALGORITHMS = {
    "deutsch_jozsa", "bernstein_vazirani", "grover",
    "qft", "vqe", "qaoa", "qec_bitflip", "shor_n15"
}

APPROVED_PAGES = {
    "lab", "circuit_builder", "algorithms", "visualization", "experiments", "learning"
}

FORBIDDEN_KEYWORDS = [
    "import", "exec", "eval", "os.", "sys.", "subprocess", "open(", "read(", "write(",
    "__", "rm ", "del ", "drop ", "select ", "curl", "bash", "cmd", "powershell"
]

class AIActionValidator:
    """
    Validation engine for AI-proposed actions.
    Ensures zero arbitrary code/shell execution and strictly enforces application business logic boundaries.
    """

    @classmethod
    def validate_action(cls, action: AIAction, context: Optional[AIContextEnvelope] = None) -> AIAction:
        validated_action = AIAction(
            action_type=action.action_type,
            target=action.target,
            parameters=action.parameters,
            reason=action.reason,
            validated=False,
            validation_error=None
        )

        # 1. Security Check: Reject forbidden keywords in target or parameter strings
        raw_str = f"{action.target or ''} {str(action.parameters or '')} {action.reason or ''}".lower()
        for kw in FORBIDDEN_KEYWORDS:
            if kw in raw_str:
                validated_action.validated = False
                validated_action.validation_error = f"Security Violation: Action contains forbidden command or keyword '{kw}'."
                return validated_action

        # 2. Action Type Validation
        atype = action.action_type.lower()

        if atype in ("add_gate", "append_gate"):
            return cls._validate_add_gate(validated_action, context)
        elif atype == "remove_gate":
            return cls._validate_remove_gate(validated_action, context)
        elif atype == "modify_gate":
            return cls._validate_modify_gate(validated_action, context)
        elif atype == "load_circuit":
            return cls._validate_load_circuit(validated_action)
        elif atype in ("run_simulation", "execute_circuit"):
            return cls._validate_run_simulation(validated_action)
        elif atype == "load_algorithm":
            return cls._validate_load_algorithm(validated_action)
        elif atype == "open_visualization":
            return cls._validate_open_visualization(validated_action)
        elif atype == "navigate":
            return cls._validate_navigate(validated_action)
        elif atype in ("open_lesson", "start_challenge", "start_assessment", "open_lab"):
            validated_action.validated = True
            return validated_action
        elif atype in ("provide_hint", "create_challenge"):
            validated_action.validated = True
            return validated_action
        else:
            validated_action.validated = False
            validated_action.validation_error = f"Unrecognized AI Action Type '{action.action_type}'."
            return validated_action


    @classmethod
    def _validate_add_gate(cls, action: AIAction, context: Optional[AIContextEnvelope]) -> AIAction:
        gate_name = str(action.parameters.get("gate") or action.target or "").upper()
        if gate_name not in APPROVED_GATES:
            action.validated = False
            action.validation_error = f"Invalid gate '{gate_name}'. Gate must be one of: {sorted(list(APPROVED_GATES))}"
            return action

        qubits = action.parameters.get("qubits") or action.parameters.get("target_qubits")
        if qubits is None:
            action.validated = False
            action.validation_error = "Gate addition requires 'qubits' parameter (list of qubit indices)."
            return action

        if not isinstance(qubits, list):
            qubits = [qubits]

        for q in qubits:
            if not isinstance(q, int) or q < 0 or q > 31:
                action.validated = False
                action.validation_error = f"Invalid qubit index {q}. Qubits must be integers between 0 and 31."
                return action

        # Verify max qubits in circuit context if available
        if context and context.circuit_context and context.circuit_context.num_qubits > 0:
            max_q = context.circuit_context.num_qubits
            for q in qubits:
                if q >= max_q:
                    action.validated = False
                    action.validation_error = f"Qubit index {q} exceeds current circuit qubit count ({max_q})."
                    return action

        action.validated = True
        return action

    @classmethod
    def _validate_remove_gate(cls, action: AIAction, context: Optional[AIContextEnvelope]) -> AIAction:
        gate_index = action.parameters.get("gate_index") or action.parameters.get("index")
        if gate_index is None or not isinstance(gate_index, int) or gate_index < 0:
            action.validated = False
            action.validation_error = "Remove gate requires a non-negative integer 'gate_index'."
            return action

        if context and context.circuit_context and context.circuit_context.gates:
            if gate_index >= len(context.circuit_context.gates):
                action.validated = False
                action.validation_error = f"Gate index {gate_index} out of bounds for circuit with {len(context.circuit_context.gates)} gates."
                return action

        action.validated = True
        return action

    @classmethod
    def _validate_modify_gate(cls, action: AIAction, context: Optional[AIContextEnvelope]) -> AIAction:
        gate_index = action.parameters.get("gate_index")
        if gate_index is None or not isinstance(gate_index, int) or gate_index < 0:
            action.validated = False
            action.validation_error = "Modify gate requires a valid integer 'gate_index'."
            return action

        action.validated = True
        return action

    @classmethod
    def _validate_load_circuit(cls, action: AIAction) -> AIAction:
        qast = action.parameters.get("qast") or action.parameters.get("circuit")
        if not qast or not isinstance(qast, dict):
            action.validated = False
            action.validation_error = "Load circuit requires a valid Q-AST dictionary."
            return action

        action.validated = True
        return action

    @classmethod
    def _validate_run_simulation(cls, action: AIAction) -> AIAction:
        backend = action.parameters.get("backend") or "numpy"
        allowed_backends = {"numpy", "qiskit", "qiskit_aer", "pennylane", "cirq"}
        if str(backend).lower() not in allowed_backends:
            action.validated = False
            action.validation_error = f"Backend '{backend}' is not supported. Allowed: {sorted(list(allowed_backends))}"
            return action

        action.validated = True
        return action

    @classmethod
    def _validate_load_algorithm(cls, action: AIAction) -> AIAction:
        algo = (action.target or action.parameters.get("algorithm") or "").lower()
        if algo not in APPROVED_ALGORITHMS:
            action.validated = False
            action.validation_error = f"Algorithm '{algo}' not recognized. Allowed: {sorted(list(APPROVED_ALGORITHMS))}"
            return action

        action.validated = True
        return action

    @classmethod
    def _validate_open_visualization(cls, action: AIAction) -> AIAction:
        viz_type = (action.target or action.parameters.get("type") or "").lower()
        allowed = {"bloch_sphere", "probability_distribution", "statevector", "interference", "execution_trace"}
        if viz_type not in allowed:
            action.validated = False
            action.validation_error = f"Visualization type '{viz_type}' not allowed. Must be one of: {sorted(list(allowed))}"
            return action

        action.validated = True
        return action

    @classmethod
    def _validate_navigate(cls, action: AIAction) -> AIAction:
        page = (action.target or action.parameters.get("page") or "").lower()
        if page not in APPROVED_PAGES:
            action.validated = False
            action.validation_error = f"Target page '{page}' not allowed. Must be one of: {sorted(list(APPROVED_PAGES))}"
            return action

        action.validated = True
        return action
