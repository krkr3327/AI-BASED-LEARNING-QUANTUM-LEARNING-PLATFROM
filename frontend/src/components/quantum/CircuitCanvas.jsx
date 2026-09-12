import React from 'react';

const MAX_COLS = 8;

export default function CircuitCanvas({ 
  visualGates, 
  interactionState, 
  pendingControlQubit, 
  onDrop, 
  onDragOver, 
  onTargetClick,
  numQubits = 2
}) {
  const maxColFromGates = visualGates ? visualGates.reduce((max, g) => Math.max(max, g.col), 0) : 0;
  const totalCols = Math.max(MAX_COLS, maxColFromGates + 2);

  const renderWire = (qIndex) => {
    const cols = [];
    for (let c = 0; c < totalCols; c++) {
      const standardGate = visualGates.find(g => g.qubit === qIndex && g.col === c && g.gate !== 'M');
      const measurementGate = visualGates.find(g => g.gate === 'M' && g.qubit === qIndex && g.col === c);
      
      const twoQubitGate = visualGates.find(g => ['CNOT', 'CZ', 'SWAP', 'CPHASE'].includes(g.gate) && g.col === c && (g.control === qIndex || g.target === qIndex));
      
      const multiQubitGate = visualGates.find(g => g.gate === 'MCX' && g.col === c && (g.target === qIndex || (g.controls && g.controls.includes(qIndex))));

      let content = null;
      let isDropTarget = interactionState && interactionState.startsWith('pending_') && pendingControlQubit?.col === c;

      if (standardGate) {
        let label = standardGate.gate;
        if (standardGate.parameters && standardGate.parameters.theta !== undefined) {
           label = `${label}(${typeof standardGate.parameters.theta === 'number' ? standardGate.parameters.theta.toFixed(2) : standardGate.parameters.theta})`;
        }
        content = <div className={`placed-gate gate-${standardGate.gate}`} style={{ fontSize: label.length > 3 ? '0.65rem' : '0.95rem' }}>{label}</div>;
      } else if (measurementGate) {
        content = <div className="placed-gate gate-M" style={{ backgroundColor: '#D97706', fontSize: '0.85rem' }}>M</div>;
      } else if (twoQubitGate) {
        if (twoQubitGate.gate === 'CNOT') {
           if (twoQubitGate.control === qIndex) {
              content = <div className="placed-gate gate-CNOT" style={{ borderRadius: '50%', width: 16, height: 16 }}></div>;
           } else {
              content = <div className="placed-gate gate-CNOT" style={{ borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>⊕</div>;
           }
        } else if (twoQubitGate.gate === 'CZ') {
           content = <div className="placed-gate gate-CZ" style={{ borderRadius: '50%', width: 16, height: 16, backgroundColor: 'var(--gate-z)' }}></div>;
        } else if (twoQubitGate.gate === 'SWAP') {
           content = <div className="placed-gate gate-SWAP" style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'var(--gate-x)' }}>×</div>;
        } else if (twoQubitGate.gate === 'CPHASE') {
           if (twoQubitGate.control === qIndex) {
              content = <div className="placed-gate gate-CPHASE" style={{ borderRadius: '50%', width: 16, height: 16, backgroundColor: 'var(--gate-s)' }}></div>;
           } else {
              let label = twoQubitGate.parameters?.theta !== undefined ? Number(twoQubitGate.parameters.theta).toFixed(2) : '';
              content = <div className="placed-gate gate-CPHASE" style={{ borderRadius: '50%', width: 32, height: 32, backgroundColor: 'var(--gate-s)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#fff' }}>{label}</div>;
           }
        }
      } else if (multiQubitGate) {
        if (multiQubitGate.controls && multiQubitGate.controls.includes(qIndex)) {
            content = <div className="placed-gate gate-MCX-control" style={{ borderRadius: '50%', width: 16, height: 16, backgroundColor: 'var(--gate-x)' }}></div>;
        } else if (multiQubitGate.target === qIndex) {
            content = <div className="placed-gate gate-MCX-target" style={{ borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', color: 'var(--gate-x)', border: '2px solid var(--gate-x)' }}>⊕</div>;
        }
      }

      const hasLine = twoQubitGate || multiQubitGate;

      cols.push(
        <div 
          key={c} 
          className={`drop-zone ${isDropTarget ? 'active-target' : ''}`}
          onDrop={(e) => onDrop && onDrop(e, qIndex, c)}
          onDragOver={onDragOver}
          onClick={() => onTargetClick && onTargetClick(qIndex, c)}
        >
          {content}
          {hasLine && <div className="cnot-line"></div>}
        </div>
      );
    }
    
    return (
      <div className="qubit-wire" key={qIndex}>
        <div className="qubit-label">|0⟩ q{qIndex}</div>
        <div className="wire-line"></div>
        <div className="drop-zones">{cols}</div>
      </div>
    );
  };

  return (
    <div className="circuit-grid">
      {Array.from({ length: numQubits }).map((_, i) => renderWire(i))}
    </div>
  );
}
