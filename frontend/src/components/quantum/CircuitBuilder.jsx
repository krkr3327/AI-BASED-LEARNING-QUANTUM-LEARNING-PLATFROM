import React from 'react';
import CircuitCanvas from './CircuitCanvas';

export default function CircuitBuilder({
  visualGates,
  interactionState,
  pendingControlQubit,
  onDrop,
  onDragOver,
  onTargetClick,
  numQubits = 2
}) {
  return (
    <div 
      style={{ 
        flex: 1, 
        height: '100%',
        width: '100%',
        backgroundColor: '#FFFFFF', 
        border: '1px solid var(--border-subtle)', 
        borderRadius: '8px', 
        padding: '24px', 
        overflowX: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-xs)'
      }}
    >
      {interactionState.startsWith('pending_') && (
        <div style={{ padding: '10px 14px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '6px', color: 'var(--accent-primary)', marginBottom: '16px', fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
          ⚡ Click a target qubit lane for {pendingControlQubit?.gate} on column {pendingControlQubit?.col}
        </div>
      )}

      <CircuitCanvas
        visualGates={visualGates}
        interactionState={interactionState}
        pendingControlQubit={pendingControlQubit}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onTargetClick={onTargetClick}
        numQubits={numQubits}
      />
    </div>
  );
}
