/**
 * Quantum Multi-Framework Code Generator
 * Converts platform circuit presets / operations into executable code for:
 * 1. Qiskit (Python)
 * 2. Cirq (Google Python)
 * 3. PennyLane (Xanadu Python)
 * 4. OpenQASM 2.0 / 3.0
 * 5. Complete Jupyter Notebook (.ipynb JSON structure)
 */

export function generateQiskitCode(circuitPreset, title = "Quantum Circuit") {
  const operations = circuitPreset?.operations || circuitPreset || [];
  let numQubits = 2;
  operations.forEach(op => {
    const q = op.qubits || [op.qubit || 0];
    const maxQ = Math.max(...q);
    if (maxQ + 1 > numQubits) numQubits = maxQ + 1;
  });

  let lines = [
    `# ==========================================`,
    `# ${title} — IBM Qiskit Implementation`,
    `# ==========================================`,
    `from qiskit import QuantumCircuit, transpile`,
    `from qiskit_aer import AerSimulator`,
    `from qiskit.visualization import plot_histogram, plot_bloch_multivector`,
    `import matplotlib.pyplot as plt`,
    ``,
    `# Initialize Quantum Circuit with ${numQubits} qubits and ${numQubits} classical bits`,
    `qc = QuantumCircuit(${numQubits}, ${numQubits})`,
    ``
  ];

  operations.forEach(op => {
    const gate = (op.gate || op.type || '').toUpperCase();
    const q = op.qubits || [op.qubit || 0];
    const params = op.parameters || op.params || {};

    if (gate === 'H') {
      lines.push(`qc.h(${q[0]})`);
    } else if (gate === 'X') {
      lines.push(`qc.x(${q[0]})`);
    } else if (gate === 'Y') {
      lines.push(`qc.y(${q[0]})`);
    } else if (gate === 'Z') {
      lines.push(`qc.z(${q[0]})`);
    } else if (gate === 'S') {
      lines.push(`qc.s(${q[0]})`);
    } else if (gate === 'T') {
      lines.push(`qc.t(${q[0]})`);
    } else if (gate === 'SDG' || gate === 'S_DAG') {
      lines.push(`qc.sdg(${q[0]})`);
    } else if (gate === 'TDG' || gate === 'T_DAG') {
      lines.push(`qc.tdg(${q[0]})`);
    } else if (gate === 'RX') {
      const theta = params.theta !== undefined ? params.theta : 1.5708;
      lines.push(`qc.rx(${theta}, ${q[0]})`);
    } else if (gate === 'RY') {
      const theta = params.theta !== undefined ? params.theta : 1.5708;
      lines.push(`qc.ry(${theta}, ${q[0]})`);
    } else if (gate === 'RZ') {
      const theta = params.theta !== undefined ? params.theta : 1.5708;
      lines.push(`qc.rz(${theta}, ${q[0]})`);
    } else if (gate === 'CNOT' || gate === 'CX') {
      const c = op.control !== undefined ? op.control : (q.length > 1 ? q[0] : 0);
      const t = op.target !== undefined ? op.target : (q.length > 1 ? q[1] : 1);
      lines.push(`qc.cx(${c}, ${t})`);
    } else if (gate === 'CZ') {
      const c = op.control !== undefined ? op.control : (q.length > 1 ? q[0] : 0);
      const t = op.target !== undefined ? op.target : (q.length > 1 ? q[1] : 1);
      lines.push(`qc.cz(${c}, ${t})`);
    } else if (gate === 'SWAP') {
      const q1 = q.length > 1 ? q[0] : 0;
      const q2 = q.length > 1 ? q[1] : 1;
      lines.push(`qc.swap(${q1}, ${q2})`);
    } else if (gate === 'CCX' || gate === 'TOFFOLI') {
      lines.push(`qc.ccx(0, 1, 2)`);
    }
  });

  lines.push(
    ``,
    `# Measurement across all computational registers`,
    `qc.measure(range(${numQubits}), range(${numQubits}))`,
    ``,
    `print("--- Circuit Diagram ---")`,
    `print(qc.draw(output="text"))`,
    ``,
    `# Statevector & Shot Simulation via Aer`,
    `simulator = AerSimulator()`,
    `compiled_circuit = transpile(qc, simulator)`,
    `job = simulator.run(compiled_circuit, shots=1024)`,
    `result = job.result()`,
    `counts = result.get_counts()`,
    ``,
    `print("\\n--- Measurement Counts (1024 shots) ---")`,
    `print(counts)`
  );

  return lines.join('\n');
}

export function generateCirqCode(circuitPreset, title = "Quantum Circuit") {
  const operations = circuitPreset?.operations || circuitPreset || [];
  let numQubits = 2;
  operations.forEach(op => {
    const q = op.qubits || [op.qubit || 0];
    const maxQ = Math.max(...q);
    if (maxQ + 1 > numQubits) numQubits = maxQ + 1;
  });

  let lines = [
    `# ==========================================`,
    `# ${title} — Google Cirq Implementation`,
    `# ==========================================`,
    `import cirq`,
    `import numpy as np`,
    ``,
    `# Allocate Line Qubits`,
    `qubits = [cirq.LineQubit(i) for i in range(${numQubits})]`,
    `circuit = cirq.Circuit()`,
    ``
  ];

  operations.forEach(op => {
    const gate = (op.gate || op.type || '').toUpperCase();
    const q = op.qubits || [op.qubit || 0];
    const params = op.parameters || op.params || {};

    if (gate === 'H') {
      lines.push(`circuit.append(cirq.H(qubits[${q[0]}]))`);
    } else if (gate === 'X') {
      lines.push(`circuit.append(cirq.X(qubits[${q[0]}]))`);
    } else if (gate === 'Y') {
      lines.push(`circuit.append(cirq.Y(qubits[${q[0]}]))`);
    } else if (gate === 'Z') {
      lines.push(`circuit.append(cirq.Z(qubits[${q[0]}]))`);
    } else if (gate === 'S') {
      lines.push(`circuit.append(cirq.S(qubits[${q[0]}]))`);
    } else if (gate === 'T') {
      lines.push(`circuit.append(cirq.T(qubits[${q[0]}]))`);
    } else if (gate === 'RX') {
      const theta = params.theta !== undefined ? params.theta : 1.5708;
      lines.push(`circuit.append(cirq.rx(${theta})(qubits[${q[0]}]))`);
    } else if (gate === 'RY') {
      const theta = params.theta !== undefined ? params.theta : 1.5708;
      lines.push(`circuit.append(cirq.ry(${theta})(qubits[${q[0]}]))`);
    } else if (gate === 'RZ') {
      const theta = params.theta !== undefined ? params.theta : 1.5708;
      lines.push(`circuit.append(cirq.rz(${theta})(qubits[${q[0]}]))`);
    } else if (gate === 'CNOT' || gate === 'CX') {
      const c = op.control !== undefined ? op.control : (q.length > 1 ? q[0] : 0);
      const t = op.target !== undefined ? op.target : (q.length > 1 ? q[1] : 1);
      lines.push(`circuit.append(cirq.CNOT(qubits[${c}], qubits[${t}]))`);
    } else if (gate === 'CZ') {
      const c = op.control !== undefined ? op.control : (q.length > 1 ? q[0] : 0);
      const t = op.target !== undefined ? op.target : (q.length > 1 ? q[1] : 1);
      lines.push(`circuit.append(cirq.CZ(qubits[${c}], qubits[${t}]))`);
    } else if (gate === 'SWAP') {
      lines.push(`circuit.append(cirq.SWAP(qubits[0], qubits[1]))`);
    }
  });

  lines.push(
    `circuit.append(cirq.measure(*qubits, key='result'))`,
    ``,
    `print("--- Cirq Circuit Layout ---")`,
    `print(circuit)`,
    ``,
    `# Simulate on Cirq Simulator`,
    `simulator = cirq.Simulator()`,
    `result = simulator.run(circuit, repetitions=1024)`,
    `print("\\n--- Measurement Histogram ---")`,
    `print(result.histogram(key='result'))`
  );

  return lines.join('\n');
}

export function generatePennyLaneCode(circuitPreset, title = "Quantum Circuit") {
  const operations = circuitPreset?.operations || circuitPreset || [];
  let numQubits = 2;
  operations.forEach(op => {
    const q = op.qubits || [op.qubit || 0];
    const maxQ = Math.max(...q);
    if (maxQ + 1 > numQubits) numQubits = maxQ + 1;
  });

  let lines = [
    `# ==========================================`,
    `# ${title} — PennyLane (Xanadu) QNode`,
    `# ==========================================`,
    `import pennylane as qml`,
    `import numpy as np`,
    ``,
    `dev = qml.device("default.qubit", wires=${numQubits}, shots=1024)`,
    ``,
    `@qml.qnode(dev)`,
    `def circuit():`
  ];

  operations.forEach(op => {
    const gate = (op.gate || op.type || '').toUpperCase();
    const q = op.qubits || [op.qubit || 0];
    const params = op.parameters || op.params || {};

    if (gate === 'H') {
      lines.push(`    qml.Hadamard(wires=${q[0]})`);
    } else if (gate === 'X') {
      lines.push(`    qml.PauliX(wires=${q[0]})`);
    } else if (gate === 'Y') {
      lines.push(`    qml.PauliY(wires=${q[0]})`);
    } else if (gate === 'Z') {
      lines.push(`    qml.PauliZ(wires=${q[0]})`);
    } else if (gate === 'S') {
      lines.push(`    qml.S(wires=${q[0]})`);
    } else if (gate === 'T') {
      lines.push(`    qml.T(wires=${q[0]})`);
    } else if (gate === 'RX') {
      const theta = params.theta !== undefined ? params.theta : 1.5708;
      lines.push(`    qml.RX(${theta}, wires=${q[0]})`);
    } else if (gate === 'RY') {
      const theta = params.theta !== undefined ? params.theta : 1.5708;
      lines.push(`    qml.RY(${theta}, wires=${q[0]})`);
    } else if (gate === 'RZ') {
      const theta = params.theta !== undefined ? params.theta : 1.5708;
      lines.push(`    qml.RZ(${theta}, wires=${q[0]})`);
    } else if (gate === 'CNOT' || gate === 'CX') {
      const c = op.control !== undefined ? op.control : (q.length > 1 ? q[0] : 0);
      const t = op.target !== undefined ? op.target : (q.length > 1 ? q[1] : 1);
      lines.push(`    qml.CNOT(wires=[${c}, ${t}])`);
    } else if (gate === 'CZ') {
      const c = op.control !== undefined ? op.control : (q.length > 1 ? q[0] : 0);
      const t = op.target !== undefined ? op.target : (q.length > 1 ? q[1] : 1);
      lines.push(`    qml.CZ(wires=[${c}, ${t}])`);
    }
  });

  lines.push(
    `    return qml.counts()`,
    ``,
    `print("--- Executing PennyLane QNode ---")`,
    `counts = circuit()`,
    `print(counts)`
  );

  return lines.join('\n');
}

export function generateOpenQasm(circuitPreset) {
  const operations = circuitPreset?.operations || circuitPreset || [];
  let numQubits = 2;
  operations.forEach(op => {
    const q = op.qubits || [op.qubit || 0];
    const maxQ = Math.max(...q);
    if (maxQ + 1 > numQubits) numQubits = maxQ + 1;
  });

  let lines = [
    `OPENQASM 2.0;`,
    `include "qelib1.inc";`,
    ``,
    `qreg q[${numQubits}];`,
    `creg c[${numQubits}];`,
    ``
  ];

  operations.forEach(op => {
    const gate = (op.gate || op.type || '').toLowerCase();
    const q = op.qubits || [op.qubit || 0];
    const params = op.parameters || op.params || {};

    if (['h', 'x', 'y', 'z', 's', 't'].includes(gate)) {
      lines.push(`${gate} q[${q[0]}];`);
    } else if (gate === 'cnot' || gate === 'cx') {
      const c = op.control !== undefined ? op.control : (q.length > 1 ? q[0] : 0);
      const t = op.target !== undefined ? op.target : (q.length > 1 ? q[1] : 1);
      lines.push(`cx q[${c}], q[${t}];`);
    } else if (gate === 'cz') {
      const c = op.control !== undefined ? op.control : (q.length > 1 ? q[0] : 0);
      const t = op.target !== undefined ? op.target : (q.length > 1 ? q[1] : 1);
      lines.push(`cz q[${c}], q[${t}];`);
    } else if (['rx', 'ry', 'rz'].includes(gate)) {
      const theta = params.theta !== undefined ? params.theta : 1.5708;
      lines.push(`${gate}(${theta}) q[${q[0]}];`);
    }
  });

  lines.push(`measure q -> c;`);
  return lines.join('\n');
}

export function generateJupyterNotebookJSON(circuitPreset, title = "Quantum Computing Lesson") {
  const qiskitCode = generateQiskitCode(circuitPreset, title);
  const qasmCode = generateOpenQasm(circuitPreset);

  const notebook = {
    cells: [
      {
        cell_type: "markdown",
        metadata: {},
        source: [
          `# ${title}\n`,
          `*Exported directly from the Quantum Algorithm Learning Platform*\n\n`,
          `This interactive notebook contains executable code, statevector analysis, and simulation circuits using **Qiskit**.\n`
        ]
      },
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: [
          `# 1. Environment Setup & Dependencies\n`,
          `!pip install -q qiskit qiskit-aer matplotlib pylatexenc\n`
        ]
      },
      {
        cell_type: "markdown",
        metadata: {},
        source: [
          `### 2. Quantum Circuit Synthesis & Simulation\n`
        ]
      },
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: qiskitCode.split('\n').map(l => l + '\n')
      },
      {
        cell_type: "markdown",
        metadata: {},
        source: [
          `### 3. OpenQASM 2.0 Representation\n`,
          `\`\`\`qasm\n${qasmCode}\n\`\`\`\n`
        ]
      }
    ],
    metadata: {
      language_info: {
        name: "python",
        version: "3.10"
      },
      kernelspec: {
        display_name: "Python 3",
        language: "python",
        name: "python3"
      }
    },
    nbformat: 4,
    nbformat_minor: 2
  };

  return JSON.stringify(notebook, null, 2);
}
