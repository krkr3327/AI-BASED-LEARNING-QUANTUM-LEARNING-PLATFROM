import re
from typing import Tuple, Dict, Any, List, Optional
from app.qast.nodes import Circuit, GateNode, MeasurementNode, ResetNode, ConditionalNode

class CodeParserError(Exception):
    def __init__(self, message: str, line_number: Optional[int] = None):
        self.message = message
        self.line_number = line_number
        super().__init__(f"Line {line_number}: {message}" if line_number else message)

def parse_code_to_qast(code_str: str) -> Circuit:
    """
    Parses a text-based quantum circuit code into canonical Q-AST Circuit.

    Supported Syntax Examples:
      qubits 2
      H q[0]         (or H 0)
      X q[1]
      RX(1.57) q[0]
      CNOT q[0], q[1]
      MEASURE q[0]   (or M q[0])
      RESET q[0]
      IF c[0] == 1 THEN X q[1]
    """
    lines = code_str.strip().splitlines()
    num_qubits = 2
    num_cbits = 0
    operations = []

    for line_idx, raw_line in enumerate(lines, 1):
        line = raw_line.strip()
        # Skip empty lines and comments
        if not line or line.startswith('#') or line.startswith('//'):
            continue

        # Header: qubits N
        m_qubits = re.match(r'^(?:qubits|num_qubits|qreg)\s+(\d+)$', line, re.IGNORECASE)
        if m_qubits:
            num_qubits = int(m_qubits.group(1))
            continue

        # Header: cbits N
        m_cbits = re.match(r'^(?:cbits|num_cbits|creg)\s+(\d+)$', line, re.IGNORECASE)
        if m_cbits:
            num_cbits = int(m_cbits.group(1))
            continue

        # Operation: IF c[cbit] == 1 THEN GATE q[target]
        m_cond = re.match(r'^IF\s+c\[?(\d+)\]?\s*==\s*1\s+THEN\s+(.+)$', line, re.IGNORECASE)
        if m_cond:
            cbit = int(m_cond.group(1))
            target_cmd = m_cond.group(2).strip()
            # Parse target operation
            sub_op = _parse_gate_op(target_cmd, line_idx)
            if not isinstance(sub_op, GateNode):
                raise CodeParserError("Conditional target must be a valid gate operation", line_idx)
            operations.append(ConditionalNode(cbit=cbit, value=1, operation=sub_op))
            continue

        # Measure: MEASURE q[0] or M q[0]
        m_meas = re.match(r'^(?:MEASURE|M)\s+q?\[?(\d+)\]?(?:\s*->\s*c?\[?(\d+)\]?)?$', line, re.IGNORECASE)
        if m_meas:
            q = int(m_meas.group(1))
            c = int(m_meas.group(2)) if m_meas.group(2) is not None else q
            operations.append(MeasurementNode(qubits=[q], cbits=[c]))
            if c >= num_cbits:
                num_cbits = c + 1
            continue

        # Reset: RESET q[0]
        m_reset = re.match(r'^RESET\s+q?\[?(\d+)\]?$', line, re.IGNORECASE)
        if m_reset:
            q = int(m_reset.group(1))
            operations.append(ResetNode(qubits=[q]))
            continue

        # Standard or Parameterized Gate
        op = _parse_gate_op(line, line_idx)
        operations.append(op)

    # Automatically derive num_cbits if unspecified
    if num_cbits == 0:
        for op in operations:
            if isinstance(op, MeasurementNode):
                num_cbits = max(num_cbits, max(op.cbits) + 1)
            elif isinstance(op, ConditionalNode):
                num_cbits = max(num_cbits, op.cbit + 1)

    return Circuit(num_qubits=num_qubits, num_cbits=num_cbits, operations=operations)


def _parse_gate_op(cmd: str, line_idx: int) -> GateNode:
    """Parses single or multi-qubit gate operations."""
    # Check for parameter e.g. RX(1.5708) q[0]
    param_match = re.match(r'^([A-Za-z]+)\s*\(\s*([^)]+)\s*\)\s+(.+)$', cmd)
    if param_match:
        gate_name = param_match.group(1).upper()
        param_val_str = param_match.group(2)
        qubits_str = param_match.group(3)

        try:
            param_val = float(eval(param_val_str, {"pi": 3.141592653589793, "np": None}))
        except Exception:
            raise CodeParserError(f"Invalid parameter expression '{param_val_str}'", line_idx)

        qubits = _parse_qubit_list(qubits_str, line_idx)
        return GateNode(gate=gate_name, qubits=qubits, parameters={"theta": param_val})

    # Standard gate e.g. H q[0], CNOT q[0], q[1]
    parts = cmd.split(None, 1)
    if len(parts) < 2:
        raise CodeParserError(f"Syntax error: expected gate name and target qubits in '{cmd}'", line_idx)

    gate_name = parts[0].upper()
    qubits_str = parts[1]
    qubits = _parse_qubit_list(qubits_str, line_idx)

    valid_gates = ['X', 'Y', 'Z', 'H', 'S', 'T', 'CNOT', 'CZ', 'SWAP', 'CPHASE', 'MCX']
    if gate_name not in valid_gates:
        raise CodeParserError(f"Unsupported gate operation '{gate_name}'", line_idx)

    return GateNode(gate=gate_name, qubits=qubits)


def _parse_qubit_list(qubits_str: str, line_idx: int) -> List[int]:
    """Extracts integer qubit indices from strings like 'q[0], q[1]' or '0, 1'."""
    raw_tokens = re.split(r'[\s,]+', qubits_str)
    qubits = []
    for token in raw_tokens:
        if not token:
            continue
        m = re.search(r'\d+', token)
        if m:
            qubits.append(int(m.group(0)))
        else:
            raise CodeParserError(f"Invalid qubit index token '{token}'", line_idx)
    if not qubits:
        raise CodeParserError("No target qubits specified for operation", line_idx)
    return qubits


def qast_to_code(circuit: Circuit) -> str:
    """Converts a Q-AST Circuit object into code syntax string."""
    lines = [f"qubits {circuit.num_qubits}"]
    if circuit.num_cbits > 0:
        lines.append(f"cbits {circuit.num_cbits}")
    lines.append("")

    for op in circuit.operations:
        if isinstance(op, GateNode):
            q_str = ", ".join(f"q[{q}]" for q in op.qubits)
            if op.parameters and "theta" in op.parameters:
                val = op.parameters["theta"]
                val_str = f"{val:.4f}" if isinstance(val, float) else str(val)
                lines.append(f"{op.gate}({val_str}) {q_str}")
            else:
                lines.append(f"{op.gate} {q_str}")
        elif isinstance(op, MeasurementNode):
            lines.append(f"M q[{op.qubits[0]}] -> c[{op.cbits[0]}]")
        elif isinstance(op, ResetNode):
            lines.append(f"RESET q[{op.qubits[0]}]")
        elif isinstance(op, ConditionalNode):
            inner = op.operation
            q_str = ", ".join(f"q[{q}]" for q in inner.qubits)
            lines.append(f"IF c[{op.cbit}] == 1 THEN {inner.gate} {q_str}")

    return "\n".join(lines)
